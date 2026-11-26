import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOdontogramDto } from './dto/create-odontogram.dto';
import { UpdateOdontogramDto } from './dto/update-odontogram.dto';
import { CreateOdontogramFindingDto } from './dto/create-odontogram-finding.dto';
import { UpdateOdontogramFindingDto } from './dto/update-odontogram-finding.dto';

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

const TOOTH_SELECT = {
  id: true,
  name: true,
  tooth: true,
  dentition: true,
  jaw: true,
} as const;

const FINDING_RELATIONS = {
  tooth: { select: TOOTH_SELECT },
  medicalCondition: {
    select: { id: true, code: true, name: true, dentalAffection: true },
  },
  treatmentCatalog: {
    select: { id: true, code: true, name: true, price: true, durationMin: true },
  },
  pathology: {
    select: { id: true, code: true, name: true },
  },
} as const;

const ODONTOGRAM_INCLUDE = {
  patient: { select: PATIENT_SELECT },
  doctor: { select: DOCTOR_SELECT },
  findings: {
    include: FINDING_RELATIONS,
    orderBy: { createdAt: 'asc' as const },
  },
} as const;

@Injectable()
export class OdontogramsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const items = await this.prisma.odontogram.findMany({
      orderBy: { createdAt: 'desc' },
      include: ODONTOGRAM_INCLUDE,
    });

    return items.map((item) => this.mapOdontogram(item));
  }

  async findOne(id: number) {
    const item = await this.prisma.odontogram.findUnique({
      where: { id },
      include: ODONTOGRAM_INCLUDE,
    });

    if (!item) {
      throw new NotFoundException('Odontograma no encontrado');
    }

    return this.mapOdontogram(item);
  }

  async create(createOdontogramDto: CreateOdontogramDto) {
    await this.assertMedicalSessionExists(createOdontogramDto.medicalSessionId);
    await this.assertPatientExists(createOdontogramDto.patientId);
    await this.assertDoctorExists(createOdontogramDto.doctorId);

    const existing = await this.prisma.odontogram.findUnique({
      where: { medicalSessionId: createOdontogramDto.medicalSessionId },
    });
    if (existing) {
      throw new BadRequestException(
        'La sesión médica indicada ya tiene un odontograma asociado',
      );
    }

    const item = await this.prisma.odontogram.create({
      data: {
        medicalSessionId: createOdontogramDto.medicalSessionId,
        data: createOdontogramDto.data,
        imageUrls: createOdontogramDto.imageUrls ?? [],
        patientId: createOdontogramDto.patientId ?? null,
        doctorId: createOdontogramDto.doctorId ?? null,
        scheduledDate:
          this.parseDate(createOdontogramDto.scheduledDate, 'scheduledDate') ?? null,
      },
      include: ODONTOGRAM_INCLUDE,
    });

    return this.mapOdontogram(item);
  }

  async update(id: number, updateOdontogramDto: UpdateOdontogramDto) {
    const existing = await this.prisma.odontogram.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Odontograma no encontrado');
    }
    if (Object.keys(updateOdontogramDto).length === 0) {
      throw new BadRequestException('No se proporcionaron datos para actualizar');
    }

    if (updateOdontogramDto.medicalSessionId !== undefined) {
      await this.assertMedicalSessionExists(updateOdontogramDto.medicalSessionId);
      if (updateOdontogramDto.medicalSessionId !== existing.medicalSessionId) {
        const duplicate = await this.prisma.odontogram.findUnique({
          where: { medicalSessionId: updateOdontogramDto.medicalSessionId },
        });
        if (duplicate && duplicate.id !== id) {
          throw new BadRequestException(
            'La sesión médica indicada ya tiene un odontograma asociado',
          );
        }
      }
    }
    if (updateOdontogramDto.patientId !== undefined) {
      await this.assertPatientExists(updateOdontogramDto.patientId);
    }
    if (updateOdontogramDto.doctorId !== undefined) {
      await this.assertDoctorExists(updateOdontogramDto.doctorId);
    }

    const item = await this.prisma.odontogram.update({
      where: { id },
      data: {
        medicalSessionId:
          updateOdontogramDto.medicalSessionId ?? existing.medicalSessionId,
        data:
          updateOdontogramDto.data !== undefined
            ? updateOdontogramDto.data
            : existing.data,
        imageUrls:
          updateOdontogramDto.imageUrls !== undefined
            ? updateOdontogramDto.imageUrls
            : existing.imageUrls,
        patientId:
          updateOdontogramDto.patientId !== undefined
            ? updateOdontogramDto.patientId
            : existing.patientId,
        doctorId:
          updateOdontogramDto.doctorId !== undefined
            ? updateOdontogramDto.doctorId
            : existing.doctorId,
        scheduledDate:
          updateOdontogramDto.scheduledDate !== undefined
            ? this.parseDate(updateOdontogramDto.scheduledDate, 'scheduledDate')
            : existing.scheduledDate,
      },
      include: ODONTOGRAM_INCLUDE,
    });

    return this.mapOdontogram(item);
  }

  async remove(id: number) {
    const existing = await this.prisma.odontogram.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Odontograma no encontrado');
    }

    // Los hallazgos se eliminan en cascada (onDelete: Cascade).
    await this.prisma.odontogram.delete({ where: { id } });
    return { success: true };
  }

  // ------------------------------------------------------------------
  // Hallazgos del odontograma
  // ------------------------------------------------------------------

  async findFindings(odontogramId: number) {
    await this.assertOdontogramExists(odontogramId);

    const items = await this.prisma.odontogramFinding.findMany({
      where: { odontogramId },
      orderBy: { createdAt: 'asc' },
      include: FINDING_RELATIONS,
    });

    return items.map((item) => this.mapFinding(item));
  }

  async createFinding(
    odontogramId: number,
    createFindingDto: CreateOdontogramFindingDto,
  ) {
    await this.assertOdontogramExists(odontogramId);
    await this.validateFindingReferences(createFindingDto);

    const item = await this.prisma.odontogramFinding.create({
      data: {
        odontogramId,
        toothId: createFindingDto.toothId ?? null,
        toothCode: createFindingDto.toothCode ?? null,
        face: createFindingDto.face ?? null,
        dentition: createFindingDto.dentition ?? null,
        kind: createFindingDto.kind,
        medicalConditionId: createFindingDto.medicalConditionId ?? null,
        treatmentCatalogId: createFindingDto.treatmentCatalogId ?? null,
        pathologyId: createFindingDto.pathologyId ?? null,
        notes: createFindingDto.notes ?? null,
        cured: createFindingDto.cured ?? false,
        status: createFindingDto.status ?? null,
      },
      include: FINDING_RELATIONS,
    });

    return this.mapFinding(item);
  }

  async updateFinding(
    findingId: number,
    updateFindingDto: UpdateOdontogramFindingDto,
  ) {
    const existing = await this.prisma.odontogramFinding.findUnique({
      where: { id: findingId },
    });
    if (!existing) {
      throw new NotFoundException('Hallazgo del odontograma no encontrado');
    }
    if (Object.keys(updateFindingDto).length === 0) {
      throw new BadRequestException('No se proporcionaron datos para actualizar');
    }

    await this.validateFindingReferences(updateFindingDto);

    const item = await this.prisma.odontogramFinding.update({
      where: { id: findingId },
      data: {
        toothId:
          updateFindingDto.toothId !== undefined
            ? updateFindingDto.toothId
            : existing.toothId,
        toothCode:
          updateFindingDto.toothCode !== undefined
            ? updateFindingDto.toothCode
            : existing.toothCode,
        face:
          updateFindingDto.face !== undefined
            ? updateFindingDto.face
            : existing.face,
        dentition:
          updateFindingDto.dentition !== undefined
            ? updateFindingDto.dentition
            : existing.dentition,
        kind: updateFindingDto.kind ?? existing.kind,
        medicalConditionId:
          updateFindingDto.medicalConditionId !== undefined
            ? updateFindingDto.medicalConditionId
            : existing.medicalConditionId,
        treatmentCatalogId:
          updateFindingDto.treatmentCatalogId !== undefined
            ? updateFindingDto.treatmentCatalogId
            : existing.treatmentCatalogId,
        pathologyId:
          updateFindingDto.pathologyId !== undefined
            ? updateFindingDto.pathologyId
            : existing.pathologyId,
        notes:
          updateFindingDto.notes !== undefined
            ? updateFindingDto.notes
            : existing.notes,
        cured: updateFindingDto.cured ?? existing.cured,
        status:
          updateFindingDto.status !== undefined
            ? updateFindingDto.status
            : existing.status,
      },
      include: FINDING_RELATIONS,
    });

    return this.mapFinding(item);
  }

  async removeFinding(findingId: number) {
    const existing = await this.prisma.odontogramFinding.findUnique({
      where: { id: findingId },
    });
    if (!existing) {
      throw new NotFoundException('Hallazgo del odontograma no encontrado');
    }

    await this.prisma.odontogramFinding.delete({ where: { id: findingId } });
    return { success: true };
  }

  // ------------------------------------------------------------------
  // Validaciones de referencias
  // ------------------------------------------------------------------

  private async assertOdontogramExists(id: number) {
    const item = await this.prisma.odontogram.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException('Odontograma no encontrado');
    }
  }

  private async assertMedicalSessionExists(medicalSessionId: number) {
    const session = await this.prisma.medicalSession.findUnique({
      where: { id: medicalSessionId },
    });
    if (!session) {
      throw new BadRequestException('La sesión médica indicada no existe');
    }
  }

  private async assertPatientExists(patientId?: number | null) {
    if (patientId === undefined || patientId === null) {
      return;
    }
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
    });
    if (!patient) {
      throw new BadRequestException('Paciente no existe');
    }
  }

  private async assertDoctorExists(doctorId?: number | null) {
    if (doctorId === undefined || doctorId === null) {
      return;
    }
    const doctor = await this.prisma.physician.findUnique({
      where: { id: doctorId },
    });
    if (!doctor) {
      throw new BadRequestException('El doctor indicado no existe');
    }
  }

  private async validateFindingReferences(
    payload: CreateOdontogramFindingDto | UpdateOdontogramFindingDto,
  ) {
    if (payload.toothId !== undefined && payload.toothId !== null) {
      const tooth = await this.prisma.tooth.findUnique({
        where: { id: payload.toothId },
      });
      if (!tooth) {
        throw new BadRequestException('La pieza dental indicada no existe');
      }
    }

    if (
      payload.medicalConditionId !== undefined &&
      payload.medicalConditionId !== null
    ) {
      const condition = await this.prisma.medicalCondition.findUnique({
        where: { id: payload.medicalConditionId },
      });
      if (!condition) {
        throw new BadRequestException('La condición médica indicada no existe');
      }
    }

    if (
      payload.treatmentCatalogId !== undefined &&
      payload.treatmentCatalogId !== null
    ) {
      const treatment = await this.prisma.treatmentCatalog.findUnique({
        where: { id: payload.treatmentCatalogId },
      });
      if (!treatment) {
        throw new BadRequestException('El tratamiento indicado no existe');
      }
    }

    if (payload.pathologyId !== undefined && payload.pathologyId !== null) {
      const pathology = await this.prisma.pathology.findUnique({
        where: { id: payload.pathologyId },
      });
      if (!pathology) {
        throw new BadRequestException('La patología indicada no existe');
      }
    }
  }

  private parseDate(value: string | null | undefined, field: string) {
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

  // ------------------------------------------------------------------
  // Mapeos de salida
  // ------------------------------------------------------------------

  private mapOdontogram(item: any) {
    return {
      id: item.id,
      medicalSessionId: item.medicalSessionId,
      patientId: item.patientId ?? null,
      patient: item.patient || null,
      doctorId: item.doctorId ?? null,
      doctor: item.doctor || null,
      scheduledDate: item.scheduledDate
        ? item.scheduledDate.toISOString()
        : null,
      data: item.data,
      imageUrls: item.imageUrls || [],
      findings: (item.findings || []).map((finding: any) =>
        this.mapFinding(finding),
      ),
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }

  private mapFinding(item: any) {
    return {
      id: item.id,
      odontogramId: item.odontogramId,
      toothId: item.toothId ?? null,
      tooth: item.tooth || null,
      toothCode: item.toothCode ?? null,
      face: item.face ?? null,
      dentition: item.dentition ?? null,
      kind: item.kind,
      medicalConditionId: item.medicalConditionId ?? null,
      medicalCondition: item.medicalCondition || null,
      treatmentCatalogId: item.treatmentCatalogId ?? null,
      treatmentCatalog: item.treatmentCatalog || null,
      pathologyId: item.pathologyId ?? null,
      pathology: item.pathology || null,
      notes: item.notes ?? null,
      cured: item.cured,
      status: item.status ?? null,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }
}
