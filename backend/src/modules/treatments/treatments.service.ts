import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { TreatmentStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTreatmentDto } from './dto/create-treatment.dto';
import { UpdateTreatmentDto } from './dto/update-treatment.dto';

const TREATMENT_STATUSES: TreatmentStatus[] = [
  TreatmentStatus.PENDING,
  TreatmentStatus.IN_PROGRESS,
  TreatmentStatus.COMPLETED,
  TreatmentStatus.CANCELLED,
];

@Injectable()
export class TreatmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const treatments = await this.prisma.treatment.findMany({
      orderBy: { startDate: 'desc' },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            documentId: true,
          },
        },
      },
    });

    return treatments.map((treatment) => this.mapTreatment(treatment));
  }

  async findOne(id: number) {
    const treatment = await this.prisma.treatment.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            documentId: true,
          },
        },
      },
    });

    if (!treatment) {
      throw new NotFoundException('Tratamiento no encontrado');
    }

    return this.mapTreatment(treatment);
  }

  async findByPatient(patientId: number) {
    await this.assertPatientExists(patientId);

    const treatments = await this.prisma.treatment.findMany({
      where: { patientId },
      orderBy: { startDate: 'desc' },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            documentId: true,
          },
        },
      },
    });

    return treatments.map((treatment) => this.mapTreatment(treatment));
  }

  async create(createTreatmentDto: CreateTreatmentDto) {
    this.assertPayload(createTreatmentDto);
    await this.assertPatientExists(createTreatmentDto.patientId);

    const treatment = await this.prisma.treatment.create({
      data: {
        patientId: createTreatmentDto.patientId,
        type: createTreatmentDto.type,
        description: createTreatmentDto.description,
        status: this.mapStatusToPrisma(createTreatmentDto.status),
        startDate: this.parseDate(createTreatmentDto.startDate, 'inicio'),
        endDate: createTreatmentDto.endDate
          ? this.parseDate(createTreatmentDto.endDate, 'fin')
          : null,
        cost: createTreatmentDto.cost ?? 0,
        tooth: createTreatmentDto.tooth,
        procedure: createTreatmentDto.procedure,
        medicalSessionId: createTreatmentDto.medicalSessionId ?? null,
        treatmentCatalogId: createTreatmentDto.treatmentCatalogId ?? null,
        pathologyId: createTreatmentDto.pathologyId ?? null,
        odontogramId: createTreatmentDto.odontogramId ?? null,
        faces: createTreatmentDto.faces,
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            documentId: true,
          },
        },
      },
    });

    return this.mapTreatment(treatment);
  }

  async update(id: number, updateTreatmentDto: UpdateTreatmentDto) {
    const existingTreatment = await this.prisma.treatment.findUnique({ where: { id } });

    if (!existingTreatment) {
      throw new NotFoundException('Tratamiento no encontrado');
    }

    if (Object.keys(updateTreatmentDto).length === 0) {
      throw new BadRequestException('No se proporcionaron datos para actualizar');
    }

    if (
      updateTreatmentDto.patientId !== undefined &&
      updateTreatmentDto.patientId !== existingTreatment.patientId
    ) {
      await this.assertPatientExists(updateTreatmentDto.patientId);
    }

    const treatment = await this.prisma.treatment.update({
      where: { id },
      data: {
        patientId: updateTreatmentDto.patientId ?? existingTreatment.patientId,
        type: updateTreatmentDto.type ?? existingTreatment.type,
        description: updateTreatmentDto.description ?? existingTreatment.description,
        status: updateTreatmentDto.status
          ? this.mapStatusToPrisma(updateTreatmentDto.status)
          : existingTreatment.status,
        startDate: updateTreatmentDto.startDate
          ? this.parseDate(updateTreatmentDto.startDate, 'inicio')
          : existingTreatment.startDate,
        endDate: updateTreatmentDto.endDate
          ? this.parseDate(updateTreatmentDto.endDate, 'fin')
          : existingTreatment.endDate,
        cost: updateTreatmentDto.cost ?? existingTreatment.cost,
        tooth: updateTreatmentDto.tooth ?? existingTreatment.tooth,
        procedure: updateTreatmentDto.procedure ?? existingTreatment.procedure,
        medicalSessionId:
          updateTreatmentDto.medicalSessionId !== undefined
            ? updateTreatmentDto.medicalSessionId
            : existingTreatment.medicalSessionId,
        treatmentCatalogId:
          updateTreatmentDto.treatmentCatalogId !== undefined
            ? updateTreatmentDto.treatmentCatalogId
            : existingTreatment.treatmentCatalogId,
        pathologyId:
          updateTreatmentDto.pathologyId !== undefined
            ? updateTreatmentDto.pathologyId
            : existingTreatment.pathologyId,
        odontogramId:
          updateTreatmentDto.odontogramId !== undefined
            ? updateTreatmentDto.odontogramId
            : existingTreatment.odontogramId,
        faces:
          updateTreatmentDto.faces !== undefined
            ? updateTreatmentDto.faces
            : existingTreatment.faces,
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            documentId: true,
          },
        },
      },
    });

    return this.mapTreatment(treatment);
  }

  async remove(id: number) {
    await this.assertTreatmentExists(id);
    await this.prisma.treatment.delete({ where: { id } });
    return { success: true };
  }

  private async assertPatientExists(patientId: number) {
    const patient = await this.prisma.patient.findUnique({ where: { id: patientId } });
    if (!patient) {
      throw new BadRequestException('Paciente no existe');
    }
  }

  private async assertTreatmentExists(id: number) {
    const treatment = await this.prisma.treatment.findUnique({ where: { id } });
    if (!treatment) {
      throw new NotFoundException('Tratamiento no encontrado');
    }
  }

  private assertPayload(payload: CreateTreatmentDto) {
    if (!payload.patientId) {
      throw new BadRequestException('El id de paciente es requerido');
    }
    if (!payload.type) {
      throw new BadRequestException('El tipo de tratamiento es requerido');
    }
    if (!payload.startDate) {
      throw new BadRequestException('La fecha de inicio es requerida');
    }
  }

  private parseDate(value: string, label: 'inicio' | 'fin'): Date {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException(`La fecha de ${label} no es válida`);
    }
    return date;
  }

  private mapStatusToPrisma(status?: string): TreatmentStatus {
    if (status && TREATMENT_STATUSES.includes(status as TreatmentStatus)) {
      return status as TreatmentStatus;
    }
    return TreatmentStatus.PENDING;
  }

  private mapTreatment(treatment: any) {
    return {
      id: treatment.id,
      patientId: treatment.patientId,
      patient: treatment.patient || null,
      type: treatment.type,
      description: treatment.description ?? null,
      status: treatment.status,
      startDate: treatment.startDate.toISOString(),
      endDate: treatment.endDate ? treatment.endDate.toISOString() : null,
      cost: Number(treatment.cost),
      tooth: treatment.tooth ?? null,
      procedure: treatment.procedure ?? null,
      medicalSessionId: treatment.medicalSessionId ?? null,
      treatmentCatalogId: treatment.treatmentCatalogId ?? null,
      pathologyId: treatment.pathologyId ?? null,
      odontogramId: treatment.odontogramId ?? null,
      faces: treatment.faces ?? null,
      createdAt: treatment.createdAt.toISOString(),
      updatedAt: treatment.updatedAt.toISOString(),
    };
  }
}
