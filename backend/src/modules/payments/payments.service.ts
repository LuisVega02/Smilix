import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PaymentMethod, PaymentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

const PAYMENT_METHODS: PaymentMethod[] = [
  PaymentMethod.CASH,
  PaymentMethod.DEBIT_CARD,
  PaymentMethod.CREDIT_CARD,
  PaymentMethod.TRANSFER,
  PaymentMethod.CHEQUE,
];

const PAYMENT_STATUSES: PaymentStatus[] = [
  PaymentStatus.PENDING,
  PaymentStatus.COMPLETED,
  PaymentStatus.FAILED,
  PaymentStatus.REFUNDED,
];

const PAYMENT_INCLUDE: Prisma.PaymentInclude = {
  patient: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      documentId: true,
    },
  },
  treatment: {
    select: {
      id: true,
      type: true,
      status: true,
      cost: true,
    },
  },
};

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const payments = await this.prisma.payment.findMany({
      orderBy: { paymentDate: 'desc' },
      include: PAYMENT_INCLUDE,
    });

    return payments.map((payment) => this.mapPayment(payment));
  }

  async findOne(id: number) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: PAYMENT_INCLUDE,
    });

    if (!payment) {
      throw new NotFoundException('Pago no encontrado');
    }

    return this.mapPayment(payment);
  }

  async findByPatient(patientId: number) {
    await this.assertPatientExists(patientId);

    const payments = await this.prisma.payment.findMany({
      where: { patientId },
      orderBy: { paymentDate: 'desc' },
      include: PAYMENT_INCLUDE,
    });

    return payments.map((payment) => this.mapPayment(payment));
  }

  async create(createPaymentDto: CreatePaymentDto) {
    this.assertPayload(createPaymentDto);
    await this.assertPatientExists(createPaymentDto.patientId);

    if (createPaymentDto.treatmentId !== undefined) {
      await this.assertTreatmentBelongsToPatient(
        createPaymentDto.treatmentId,
        createPaymentDto.patientId,
      );
    }

    const payment = await this.prisma.payment.create({
      data: {
        patientId: createPaymentDto.patientId,
        treatmentId: createPaymentDto.treatmentId,
        amount: createPaymentDto.amount,
        paymentDate: createPaymentDto.paymentDate
          ? this.parseDate(createPaymentDto.paymentDate)
          : undefined,
        method: this.mapMethodToPrisma(createPaymentDto.method),
        status: this.mapStatusToPrisma(createPaymentDto.status),
        reference: createPaymentDto.reference,
      },
      include: PAYMENT_INCLUDE,
    });

    return this.mapPayment(payment);
  }

  async update(id: number, updatePaymentDto: UpdatePaymentDto) {
    const existingPayment = await this.prisma.payment.findUnique({ where: { id } });

    if (!existingPayment) {
      throw new NotFoundException('Pago no encontrado');
    }

    if (Object.keys(updatePaymentDto).length === 0) {
      throw new BadRequestException('No se proporcionaron datos para actualizar');
    }

    const patientId = updatePaymentDto.patientId ?? existingPayment.patientId;
    if (
      updatePaymentDto.patientId !== undefined &&
      updatePaymentDto.patientId !== existingPayment.patientId
    ) {
      await this.assertPatientExists(updatePaymentDto.patientId);
    }

    const treatmentId = updatePaymentDto.treatmentId ?? existingPayment.treatmentId;
    if (treatmentId !== null && treatmentId !== undefined) {
      await this.assertTreatmentBelongsToPatient(treatmentId, patientId);
    }

    const payment = await this.prisma.payment.update({
      where: { id },
      data: {
        patientId,
        treatmentId,
        amount: updatePaymentDto.amount ?? existingPayment.amount,
        paymentDate: updatePaymentDto.paymentDate
          ? this.parseDate(updatePaymentDto.paymentDate)
          : existingPayment.paymentDate,
        method: updatePaymentDto.method
          ? this.mapMethodToPrisma(updatePaymentDto.method)
          : existingPayment.method,
        status: updatePaymentDto.status
          ? this.mapStatusToPrisma(updatePaymentDto.status)
          : existingPayment.status,
        reference: updatePaymentDto.reference ?? existingPayment.reference,
      },
      include: PAYMENT_INCLUDE,
    });

    return this.mapPayment(payment);
  }

  async remove(id: number) {
    await this.assertPaymentExists(id);
    await this.prisma.payment.delete({ where: { id } });
    return { success: true };
  }

  private async assertPatientExists(patientId: number) {
    const patient = await this.prisma.patient.findUnique({ where: { id: patientId } });
    if (!patient) {
      throw new BadRequestException('Paciente no existe');
    }
  }

  private async assertPaymentExists(id: number) {
    const payment = await this.prisma.payment.findUnique({ where: { id } });
    if (!payment) {
      throw new NotFoundException('Pago no encontrado');
    }
  }

  private async assertTreatmentBelongsToPatient(treatmentId: number, patientId: number) {
    const treatment = await this.prisma.treatment.findUnique({ where: { id: treatmentId } });
    if (!treatment) {
      throw new BadRequestException('Tratamiento no existe');
    }
    if (treatment.patientId !== patientId) {
      throw new BadRequestException('El tratamiento no pertenece al paciente');
    }
  }

  private assertPayload(payload: CreatePaymentDto) {
    if (!payload.patientId) {
      throw new BadRequestException('El id de paciente es requerido');
    }
    if (payload.amount === undefined || payload.amount === null) {
      throw new BadRequestException('El monto es requerido');
    }
    if (!payload.method) {
      throw new BadRequestException('El método de pago es requerido');
    }
  }

  private parseDate(value: string): Date {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException('La fecha de pago no es válida');
    }
    return date;
  }

  private mapMethodToPrisma(method: string): PaymentMethod {
    if (PAYMENT_METHODS.includes(method as PaymentMethod)) {
      return method as PaymentMethod;
    }
    throw new BadRequestException('Método de pago no válido');
  }

  private mapStatusToPrisma(status?: string): PaymentStatus {
    if (status && PAYMENT_STATUSES.includes(status as PaymentStatus)) {
      return status as PaymentStatus;
    }
    return PaymentStatus.PENDING;
  }

  private mapPayment(payment: any) {
    return {
      id: payment.id,
      patientId: payment.patientId,
      patient: payment.patient || null,
      treatmentId: payment.treatmentId ?? null,
      treatment: payment.treatment
        ? { ...payment.treatment, cost: Number(payment.treatment.cost) }
        : null,
      amount: Number(payment.amount),
      paymentDate: payment.paymentDate.toISOString(),
      method: payment.method,
      status: payment.status,
      reference: payment.reference ?? null,
      createdAt: payment.createdAt.toISOString(),
      updatedAt: payment.updatedAt.toISOString(),
    };
  }
}
