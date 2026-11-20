import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePatientConditionDto } from './dto/create-patient-condition.dto';
import { UpdatePatientConditionDto } from './dto/update-patient-condition.dto';
import { QueryPatientConditionDto } from './dto/query-patient-condition.dto';

const PATIENT_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  documentId: true,
} as const;

const CONDITION_SELECT = {
  id: true,
  code: true,
  name: true,
  dentalAffection: true,
} as const;

const RELATIONS = {
  patient: { select: PATIENT_SELECT },
  medicalCondition: { select: CONDITION_SELECT },
} as const;

@Injectable()
export class PatientConditionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryPatientConditionDto = {}) {
    const items = await this.prisma.patientCondition.findMany({
      where: {
        patientId: query.patientId,
        medicalSessionId: query.medicalSessionId,
      },
      orderBy: { createdAt: 'desc' },
      include: RELATIONS,
    });

    return items.map((item) => this.mapPatientCondition(item));
  }

  async findOne(id: number) {
    const item = await this.prisma.patientCondition.findUnique({
      where: { id },
      include: RELATIONS,
    });

    if (!item) {
      throw new NotFoundException('Condición del paciente no encontrada');
    }

    return this.mapPatientCondition(item);
  }

  async create(createPatientConditionDto: CreatePatientConditionDto) {
    await this.assertPatientExists(createPatientConditionDto.patientId);
    await this.assertMedicalConditionExists(createPatientConditionDto.medicalConditionId);
    await this.assertSessionExists(createPatientConditionDto.medicalSessionId);

    const item = await this.prisma.patientCondition.create({
      data: {
        patientId: createPatientConditionDto.patientId,
        medicalSessionId: createPatientConditionDto.medicalSessionId ?? null,
        medicalConditionId: createPatientConditionDto.medicalConditionId,
        tooth: createPatientConditionDto.tooth,
        face: createPatientConditionDto.face,
        dentition: createPatientConditionDto.dentition,
        cured: createPatientConditionDto.cured ?? false,
        notes: createPatientConditionDto.notes,
      },
      include: RELATIONS,
    });

    return this.mapPatientCondition(item);
  }

  async update(id: number, updatePatientConditionDto: UpdatePatientConditionDto) {
    const existing = await this.prisma.patientCondition.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('Condición del paciente no encontrada');
    }

    if (Object.keys(updatePatientConditionDto).length === 0) {
      throw new BadRequestException('No se proporcionaron datos para actualizar');
    }

    if (updatePatientConditionDto.patientId !== undefined) {
      await this.assertPatientExists(updatePatientConditionDto.patientId);
    }
    if (updatePatientConditionDto.medicalConditionId !== undefined) {
      await this.assertMedicalConditionExists(
        updatePatientConditionDto.medicalConditionId,
      );
    }
    if (
      updatePatientConditionDto.medicalSessionId !== undefined &&
      updatePatientConditionDto.medicalSessionId !== null
    ) {
      await this.assertSessionExists(updatePatientConditionDto.medicalSessionId);
    }

    const item = await this.prisma.patientCondition.update({
      where: { id },
      data: {
        patientId: updatePatientConditionDto.patientId ?? existing.patientId,
        medicalSessionId:
          updatePatientConditionDto.medicalSessionId !== undefined
            ? updatePatientConditionDto.medicalSessionId
            : existing.medicalSessionId,
        medicalConditionId:
          updatePatientConditionDto.medicalConditionId ?? existing.medicalConditionId,
        tooth:
          updatePatientConditionDto.tooth !== undefined
            ? updatePatientConditionDto.tooth
            : existing.tooth,
        face:
          updatePatientConditionDto.face !== undefined
            ? updatePatientConditionDto.face
            : existing.face,
        dentition:
          updatePatientConditionDto.dentition !== undefined
            ? updatePatientConditionDto.dentition
            : existing.dentition,
        cured: updatePatientConditionDto.cured ?? existing.cured,
        notes:
          updatePatientConditionDto.notes !== undefined
            ? updatePatientConditionDto.notes
            : existing.notes,
      },
      include: RELATIONS,
    });

    return this.mapPatientCondition(item);
  }

  async remove(id: number) {
    const existing = await this.prisma.patientCondition.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Condición del paciente no encontrada');
    }

    await this.prisma.patientCondition.delete({ where: { id } });
    return { success: true };
  }

  private async assertPatientExists(patientId: number) {
    const patient = await this.prisma.patient.findUnique({ where: { id: patientId } });
    if (!patient) {
      throw new BadRequestException('Paciente no existe');
    }
  }

  private async assertMedicalConditionExists(medicalConditionId: number) {
    const condition = await this.prisma.medicalCondition.findUnique({
      where: { id: medicalConditionId },
    });
    if (!condition) {
      throw new BadRequestException('La condición médica indicada no existe');
    }
  }

  private async assertSessionExists(medicalSessionId?: number | null) {
    if (medicalSessionId === undefined || medicalSessionId === null) {
      return;
    }
    const session = await this.prisma.medicalSession.findUnique({
      where: { id: medicalSessionId },
    });
    if (!session) {
      throw new BadRequestException('La sesión médica indicada no existe');
    }
  }

  private mapPatientCondition(item: any) {
    return {
      id: item.id,
      patientId: item.patientId,
      patient: item.patient || null,
      medicalSessionId: item.medicalSessionId ?? null,
      medicalConditionId: item.medicalConditionId,
      medicalCondition: item.medicalCondition || null,
      tooth: item.tooth ?? null,
      face: item.face ?? null,
      dentition: item.dentition ?? null,
      cured: item.cured,
      notes: item.notes ?? null,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }
}
