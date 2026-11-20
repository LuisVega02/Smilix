import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSaleOrderDto } from './dto/create-sale-order.dto';
import { UpdateSaleOrderDto } from './dto/update-sale-order.dto';
import { QuerySaleOrderDto } from './dto/query-sale-order.dto';
import { CreateSaleOrderLineDto } from './dto/create-sale-order-line.dto';
import { UpdateSaleOrderLineDto } from './dto/update-sale-order-line.dto';
import { CreateInstallmentDto } from './dto/create-installment.dto';
import { UpdateInstallmentDto } from './dto/update-installment.dto';

const PATIENT_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  documentId: true,
} as const;

const DOCTOR_SELECT = {
  id: true,
  name: true,
  registerRnp: true,
  registerRne: true,
} as const;

const SESSION_SELECT = {
  id: true,
  patientId: true,
  date: true,
} as const;

const ODONTOGRAM_SELECT = {
  id: true,
  medicalSessionId: true,
  patientId: true,
} as const;

const LINE_INCLUDE = {
  pathology: { select: { id: true, code: true, name: true } },
  treatmentCatalog: {
    select: { id: true, code: true, name: true, price: true },
  },
  treatment: { select: { id: true, type: true, status: true } },
  medicalSession: { select: SESSION_SELECT },
  odontogram: { select: ODONTOGRAM_SELECT },
} as const;

const SALE_ORDER_INCLUDE = {
  patient: { select: PATIENT_SELECT },
  doctor: { select: DOCTOR_SELECT },
  medicalSession: { select: SESSION_SELECT },
  odontogram: { select: ODONTOGRAM_SELECT },
  lines: { include: LINE_INCLUDE, orderBy: { id: 'asc' as const } },
  installments: { orderBy: { number: 'asc' as const } },
} as const;

/**
 * Órdenes de venta odontológicas (F6), inspiradas en sale.order,
 * sale.order.line e installment_payments de Odoo.
 */
@Injectable()
export class SaleOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  // ------------------------------------------------------------------
  // Órdenes de venta
  // ------------------------------------------------------------------

  async findAll(query: QuerySaleOrderDto = {}) {
    const items = await this.prisma.saleOrder.findMany({
      where: {
        patientId: query.patientId,
        status: query.status,
      },
      orderBy: { createdAt: 'desc' },
      include: SALE_ORDER_INCLUDE,
    });

    return items.map((item) => this.mapSaleOrder(item));
  }

  async findOne(id: number) {
    const item = await this.prisma.saleOrder.findUnique({
      where: { id },
      include: SALE_ORDER_INCLUDE,
    });

    if (!item) {
      throw new NotFoundException('Orden de venta no encontrada');
    }

    return this.mapSaleOrder(item);
  }

  async create(createSaleOrderDto: CreateSaleOrderDto) {
    await this.assertPatientExists(createSaleOrderDto.patientId);
    await this.assertOrderReferences(createSaleOrderDto);

    const item = await this.prisma.saleOrder.create({
      data: {
        patientId: createSaleOrderDto.patientId,
        code: createSaleOrderDto.code ?? null,
        medicalSessionId: createSaleOrderDto.medicalSessionId ?? null,
        odontogramId: createSaleOrderDto.odontogramId ?? null,
        doctorId: createSaleOrderDto.doctorId ?? null,
        status: createSaleOrderDto.status ?? 'DRAFT',
        notes: createSaleOrderDto.notes ?? null,
        installmentsCount: createSaleOrderDto.installmentsCount ?? 1,
      },
      include: SALE_ORDER_INCLUDE,
    });

    return this.mapSaleOrder(item);
  }

  async update(id: number, updateSaleOrderDto: UpdateSaleOrderDto) {
    const existing = await this.prisma.saleOrder.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Orden de venta no encontrada');
    }
    if (Object.keys(updateSaleOrderDto).length === 0) {
      throw new BadRequestException('No se proporcionaron datos para actualizar');
    }

    if (updateSaleOrderDto.patientId !== undefined) {
      await this.assertPatientExists(updateSaleOrderDto.patientId);
    }
    await this.assertOrderReferences(updateSaleOrderDto);

    const item = await this.prisma.saleOrder.update({
      where: { id },
      data: {
        patientId: updateSaleOrderDto.patientId ?? existing.patientId,
        code: updateSaleOrderDto.code !== undefined ? updateSaleOrderDto.code : existing.code,
        medicalSessionId:
          updateSaleOrderDto.medicalSessionId !== undefined
            ? updateSaleOrderDto.medicalSessionId
            : existing.medicalSessionId,
        odontogramId:
          updateSaleOrderDto.odontogramId !== undefined
            ? updateSaleOrderDto.odontogramId
            : existing.odontogramId,
        doctorId:
          updateSaleOrderDto.doctorId !== undefined
            ? updateSaleOrderDto.doctorId
            : existing.doctorId,
        status: updateSaleOrderDto.status ?? existing.status,
        notes: updateSaleOrderDto.notes !== undefined ? updateSaleOrderDto.notes : existing.notes,
        installmentsCount: updateSaleOrderDto.installmentsCount ?? existing.installmentsCount,
      },
      include: SALE_ORDER_INCLUDE,
    });

    return this.mapSaleOrder(item);
  }

  async remove(id: number) {
    const existing = await this.prisma.saleOrder.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Orden de venta no encontrada');
    }

    // Líneas y cuotas se eliminan en cascada (onDelete: Cascade).
    await this.prisma.saleOrder.delete({ where: { id } });
    return { success: true };
  }

  /**
   * Genera una orden en DRAFT a partir de los hallazgos de tratamiento
   * (kind='TREATMENT') de un odontograma. Cada hallazgo se convierte en
   * una línea con el precio del catálogo de tratamientos.
   */
  async createFromOdontogram(odontogramId: number) {
    const odontogram = await this.prisma.odontogram.findUnique({
      where: { id: odontogramId },
      include: { medicalSession: { select: SESSION_SELECT } },
    });

    if (!odontogram) {
      throw new NotFoundException('Odontograma no encontrado');
    }

    const findings = await this.prisma.odontogramFinding.findMany({
      where: { odontogramId, kind: 'TREATMENT' },
      orderBy: { createdAt: 'asc' },
      include: {
        treatmentCatalog: {
          select: { id: true, code: true, name: true, price: true },
        },
      },
    });

    if (findings.length === 0) {
      throw new BadRequestException(
        'El odontograma no tiene hallazgos de tratamiento (kind=TREATMENT) para generar una orden de venta',
      );
    }

    const patientId = odontogram.patientId ?? odontogram.medicalSession.patientId;

    const lines = findings.map((finding) => {
      const quantity = 1;
      const unitPrice = finding.treatmentCatalog ? Number(finding.treatmentCatalog.price) : 0;

      return {
        description: finding.treatmentCatalog?.name ?? null,
        pathologyId: finding.pathologyId ?? null,
        treatmentCatalogId: finding.treatmentCatalogId ?? null,
        medicalSessionId: odontogram.medicalSessionId,
        odontogramId: odontogram.id,
        tooth: finding.toothCode ?? null,
        faces: finding.face ?? null,
        quantity,
        unitPrice,
        subtotal: this.roundMoney(quantity * unitPrice),
      };
    });

    const total = this.roundMoney(lines.reduce((sum, line) => sum + line.subtotal, 0));

    const item = await this.prisma.saleOrder.create({
      data: {
        patientId,
        medicalSessionId: odontogram.medicalSessionId,
        odontogramId: odontogram.id,
        doctorId: odontogram.doctorId ?? null,
        status: 'DRAFT',
        total,
        installmentsCount: 1,
        lines: { create: lines },
      },
      include: SALE_ORDER_INCLUDE,
    });

    return this.mapSaleOrder(item);
  }

  // ------------------------------------------------------------------
  // Líneas de la orden
  // ------------------------------------------------------------------

  async createLine(saleOrderId: number, createLineDto: CreateSaleOrderLineDto) {
    await this.assertSaleOrderExists(saleOrderId);
    await this.assertLineReferences(createLineDto);

    const quantity = createLineDto.quantity ?? 1;
    const unitPrice = await this.resolveUnitPrice(createLineDto);

    const line = await this.prisma.saleOrderLine.create({
      data: {
        saleOrderId,
        description: createLineDto.description ?? null,
        pathologyId: createLineDto.pathologyId ?? null,
        treatmentCatalogId: createLineDto.treatmentCatalogId ?? null,
        treatmentId: createLineDto.treatmentId ?? null,
        medicalSessionId: createLineDto.medicalSessionId ?? null,
        odontogramId: createLineDto.odontogramId ?? null,
        tooth: createLineDto.tooth ?? null,
        faces: createLineDto.faces ?? null,
        quantity,
        unitPrice,
        subtotal: this.roundMoney(quantity * unitPrice),
      },
      include: LINE_INCLUDE,
    });

    await this.recalcTotals(saleOrderId);
    return this.mapLine(line);
  }

  async updateLine(lineId: number, updateLineDto: UpdateSaleOrderLineDto) {
    const existing = await this.prisma.saleOrderLine.findUnique({
      where: { id: lineId },
    });
    if (!existing) {
      throw new NotFoundException('Línea de la orden no encontrada');
    }
    if (Object.keys(updateLineDto).length === 0) {
      throw new BadRequestException('No se proporcionaron datos para actualizar');
    }

    await this.assertLineReferences(updateLineDto);

    const quantity = updateLineDto.quantity ?? existing.quantity;
    const unitPrice =
      updateLineDto.unitPrice !== undefined ? updateLineDto.unitPrice : Number(existing.unitPrice);

    const line = await this.prisma.saleOrderLine.update({
      where: { id: lineId },
      data: {
        description:
          updateLineDto.description !== undefined
            ? updateLineDto.description
            : existing.description,
        pathologyId:
          updateLineDto.pathologyId !== undefined
            ? updateLineDto.pathologyId
            : existing.pathologyId,
        treatmentCatalogId:
          updateLineDto.treatmentCatalogId !== undefined
            ? updateLineDto.treatmentCatalogId
            : existing.treatmentCatalogId,
        treatmentId:
          updateLineDto.treatmentId !== undefined
            ? updateLineDto.treatmentId
            : existing.treatmentId,
        medicalSessionId:
          updateLineDto.medicalSessionId !== undefined
            ? updateLineDto.medicalSessionId
            : existing.medicalSessionId,
        odontogramId:
          updateLineDto.odontogramId !== undefined
            ? updateLineDto.odontogramId
            : existing.odontogramId,
        tooth: updateLineDto.tooth !== undefined ? updateLineDto.tooth : existing.tooth,
        faces: updateLineDto.faces !== undefined ? updateLineDto.faces : existing.faces,
        quantity,
        unitPrice,
        subtotal: this.roundMoney(quantity * unitPrice),
      },
      include: LINE_INCLUDE,
    });

    await this.recalcTotals(existing.saleOrderId);
    return this.mapLine(line);
  }

  async removeLine(lineId: number) {
    const existing = await this.prisma.saleOrderLine.findUnique({
      where: { id: lineId },
    });
    if (!existing) {
      throw new NotFoundException('Línea de la orden no encontrada');
    }

    await this.prisma.saleOrderLine.delete({ where: { id: lineId } });
    await this.recalcTotals(existing.saleOrderId);
    return { success: true };
  }

  // ------------------------------------------------------------------
  // Cuotas
  // ------------------------------------------------------------------

  async createInstallment(saleOrderId: number, createInstallmentDto: CreateInstallmentDto) {
    await this.assertSaleOrderExists(saleOrderId);

    let number = createInstallmentDto.number;
    if (number === undefined) {
      const aggregate = await this.prisma.installmentPayment.aggregate({
        where: { saleOrderId },
        _max: { number: true },
      });
      number = (aggregate._max.number ?? 0) + 1;
    } else {
      const duplicate = await this.prisma.installmentPayment.findFirst({
        where: { saleOrderId, number },
      });
      if (duplicate) {
        throw new BadRequestException(
          `Ya existe la cuota número ${number} para esta orden de venta`,
        );
      }
    }

    const installment = await this.prisma.installmentPayment.create({
      data: {
        saleOrderId,
        number,
        dueDate: this.parseOptionalDate(createInstallmentDto.dueDate, 'dueDate'),
        amount: createInstallmentDto.amount ?? 0,
        paid: createInstallmentDto.paid ?? false,
        paidAt: this.parseOptionalDate(createInstallmentDto.paidAt, 'paidAt'),
      },
    });

    await this.recalcTotals(saleOrderId);
    return this.mapInstallment(installment);
  }

  async updateInstallment(id: number, updateInstallmentDto: UpdateInstallmentDto) {
    const existing = await this.prisma.installmentPayment.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Cuota no encontrada');
    }
    if (Object.keys(updateInstallmentDto).length === 0) {
      throw new BadRequestException('No se proporcionaron datos para actualizar');
    }

    const number = updateInstallmentDto.number ?? existing.number;
    if (updateInstallmentDto.number !== undefined && number !== existing.number) {
      const duplicate = await this.prisma.installmentPayment.findFirst({
        where: { saleOrderId: existing.saleOrderId, number },
      });
      if (duplicate && duplicate.id !== id) {
        throw new BadRequestException(
          `Ya existe la cuota número ${number} para esta orden de venta`,
        );
      }
    }

    const paid = updateInstallmentDto.paid ?? existing.paid;
    let paidAt =
      updateInstallmentDto.paidAt !== undefined
        ? this.parseOptionalDate(updateInstallmentDto.paidAt, 'paidAt')
        : existing.paidAt;

    if (paid && !paidAt) {
      paidAt = new Date();
    }
    if (!paid && updateInstallmentDto.paid === false) {
      paidAt = null;
    }

    const installment = await this.prisma.installmentPayment.update({
      where: { id },
      data: {
        number,
        dueDate:
          updateInstallmentDto.dueDate !== undefined
            ? this.parseOptionalDate(updateInstallmentDto.dueDate, 'dueDate')
            : existing.dueDate,
        amount: updateInstallmentDto.amount ?? existing.amount,
        paid,
        paidAt,
      },
    });

    await this.recalcTotals(existing.saleOrderId);
    return this.mapInstallment(installment);
  }

  async removeInstallment(id: number) {
    const existing = await this.prisma.installmentPayment.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Cuota no encontrada');
    }

    await this.prisma.installmentPayment.delete({ where: { id } });
    await this.recalcTotals(existing.saleOrderId);
    return { success: true };
  }

  // ------------------------------------------------------------------
  // Recalculo de totales
  // ------------------------------------------------------------------

  /**
   * Recalcula el total de la orden como la suma de los subtotales de sus
   * líneas. `installmentsCount` refleja el número de cuotas creadas; si
   * aún no hay cuotas se conserva el valor indicado manualmente (o el
   * default del esquema).
   */
  private async recalcTotals(saleOrderId: number) {
    const [aggregate, installmentsCount] = await Promise.all([
      this.prisma.saleOrderLine.aggregate({
        where: { saleOrderId },
        _sum: { subtotal: true },
      }),
      this.prisma.installmentPayment.count({ where: { saleOrderId } }),
    ]);

    const data: { total: number; installmentsCount?: number } = {
      total: this.roundMoney(Number(aggregate._sum.subtotal ?? 0)),
    };
    if (installmentsCount > 0) {
      data.installmentsCount = installmentsCount;
    }

    await this.prisma.saleOrder.update({ where: { id: saleOrderId }, data });
  }

  // ------------------------------------------------------------------
  // Validaciones de referencias
  // ------------------------------------------------------------------

  private async assertSaleOrderExists(id: number) {
    const item = await this.prisma.saleOrder.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException('Orden de venta no encontrada');
    }
  }

  private async assertPatientExists(patientId: number) {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
    });
    if (!patient) {
      throw new BadRequestException('Paciente no existe');
    }
  }

  private async assertOrderReferences(payload: {
    doctorId?: number | null;
    medicalSessionId?: number | null;
    odontogramId?: number | null;
  }) {
    if (payload.doctorId !== undefined && payload.doctorId !== null) {
      const doctor = await this.prisma.physician.findUnique({
        where: { id: payload.doctorId },
      });
      if (!doctor) {
        throw new BadRequestException('El doctor indicado no existe');
      }
    }

    if (payload.medicalSessionId !== undefined && payload.medicalSessionId !== null) {
      const session = await this.prisma.medicalSession.findUnique({
        where: { id: payload.medicalSessionId },
      });
      if (!session) {
        throw new BadRequestException('La sesión médica indicada no existe');
      }
    }

    if (payload.odontogramId !== undefined && payload.odontogramId !== null) {
      const odontogram = await this.prisma.odontogram.findUnique({
        where: { id: payload.odontogramId },
      });
      if (!odontogram) {
        throw new BadRequestException('El odontograma indicado no existe');
      }
    }
  }

  private async assertLineReferences(payload: {
    pathologyId?: number | null;
    treatmentCatalogId?: number | null;
    treatmentId?: number | null;
    medicalSessionId?: number | null;
    odontogramId?: number | null;
  }) {
    if (payload.pathologyId !== undefined && payload.pathologyId !== null) {
      const pathology = await this.prisma.pathology.findUnique({
        where: { id: payload.pathologyId },
      });
      if (!pathology) {
        throw new BadRequestException('La patología indicada no existe');
      }
    }

    if (payload.treatmentCatalogId !== undefined && payload.treatmentCatalogId !== null) {
      const catalog = await this.prisma.treatmentCatalog.findUnique({
        where: { id: payload.treatmentCatalogId },
      });
      if (!catalog) {
        throw new BadRequestException('El tratamiento del catálogo indicado no existe');
      }
    }

    if (payload.treatmentId !== undefined && payload.treatmentId !== null) {
      const treatment = await this.prisma.treatment.findUnique({
        where: { id: payload.treatmentId },
      });
      if (!treatment) {
        throw new BadRequestException('El tratamiento indicado no existe');
      }
    }

    if (payload.medicalSessionId !== undefined && payload.medicalSessionId !== null) {
      const session = await this.prisma.medicalSession.findUnique({
        where: { id: payload.medicalSessionId },
      });
      if (!session) {
        throw new BadRequestException('La sesión médica indicada no existe');
      }
    }

    if (payload.odontogramId !== undefined && payload.odontogramId !== null) {
      const odontogram = await this.prisma.odontogram.findUnique({
        where: { id: payload.odontogramId },
      });
      if (!odontogram) {
        throw new BadRequestException('El odontograma indicado no existe');
      }
    }
  }

  /**
   * Precio unitario de una línea: el enviado explícitamente; si no se
   * envía y hay catálogo de tratamiento, se toma su precio; si no, 0.
   */
  private async resolveUnitPrice(payload: {
    treatmentCatalogId?: number;
    unitPrice?: number;
  }): Promise<number> {
    if (payload.unitPrice !== undefined) {
      return payload.unitPrice;
    }
    if (payload.treatmentCatalogId !== undefined) {
      const catalog = await this.prisma.treatmentCatalog.findUnique({
        where: { id: payload.treatmentCatalogId },
      });
      return catalog ? Number(catalog.price) : 0;
    }
    return 0;
  }

  private parseOptionalDate(
    value: string | null | undefined,
    field: string,
  ): Date | null | undefined {
    if (value === undefined) {
      return undefined;
    }
    if (value === null) {
      return null;
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException(`${field} no es una fecha válida`);
    }
    return date;
  }

  private roundMoney(value: number) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  // ------------------------------------------------------------------
  // Mapeos de salida (Decimal -> Number, Date -> ISO string)
  // ------------------------------------------------------------------

  private mapSaleOrder(item: any) {
    return {
      id: item.id,
      code: item.code ?? null,
      patientId: item.patientId,
      patient: item.patient || null,
      medicalSessionId: item.medicalSessionId ?? null,
      medicalSession: item.medicalSession || null,
      odontogramId: item.odontogramId ?? null,
      odontogram: item.odontogram || null,
      doctorId: item.doctorId ?? null,
      doctor: item.doctor || null,
      status: item.status,
      total: Number(item.total),
      notes: item.notes ?? null,
      installmentsCount: item.installmentsCount,
      lines: (item.lines || []).map((line: any) => this.mapLine(line)),
      installments: (item.installments || []).map((installment: any) =>
        this.mapInstallment(installment),
      ),
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }

  private mapLine(item: any) {
    return {
      id: item.id,
      saleOrderId: item.saleOrderId,
      description: item.description ?? null,
      pathologyId: item.pathologyId ?? null,
      pathology: item.pathology || null,
      treatmentCatalogId: item.treatmentCatalogId ?? null,
      treatmentCatalog: item.treatmentCatalog || null,
      treatmentId: item.treatmentId ?? null,
      treatment: item.treatment || null,
      medicalSessionId: item.medicalSessionId ?? null,
      medicalSession: item.medicalSession || null,
      odontogramId: item.odontogramId ?? null,
      odontogram: item.odontogram || null,
      tooth: item.tooth ?? null,
      faces: item.faces ?? null,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      subtotal: Number(item.subtotal),
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }

  private mapInstallment(item: any) {
    return {
      id: item.id,
      saleOrderId: item.saleOrderId,
      number: item.number,
      dueDate: item.dueDate ? item.dueDate.toISOString() : null,
      amount: Number(item.amount),
      paid: item.paid,
      paidAt: item.paidAt ? item.paidAt.toISOString() : null,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }
}
