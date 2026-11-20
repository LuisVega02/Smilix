import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePatientAllergyDto } from './dto/create-patient-allergy.dto';
import { UpdatePatientAllergyDto } from './dto/update-patient-allergy.dto';
import { QueryPatientAllergyDto } from './dto/query-patient-allergy.dto';

const PATIENT_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  documentId: true,
} as const;

const ALLERGY_SELECT = { id: true, name: true, description: true } as const;

const RELATIONS = {
  patient: { select: PATIENT_SELECT },
  allergy: { select: ALLERGY_SELECT },
} as const;

@Injectable()
export class PatientAllergiesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryPatientAllergyDto = {}) {
    const items = await this.prisma.patientAllergy.findMany({
      where: {
        patientId: query.patientId,
        allergyId: query.allergyId,
      },
      orderBy: { createdAt: 'desc' },
      include: RELATIONS,
    });

    return items.map((item) => this.mapPatientAllergy(item));
  }

  async findOne(id: number) {
    const item = await this.prisma.patientAllergy.findUnique({
      where: { id },
      include: RELATIONS,
    });

    if (!item) {
      throw new NotFoundException('Alergia del paciente no encontrada');
    }

    return this.mapPatientAllergy(item);
  }

  async create(createPatientAllergyDto: CreatePatientAllergyDto) {
    await this.assertPatientExists(createPatientAllergyDto.patientId);
    await this.assertAllergyExists(createPatientAllergyDto.allergyId);
    await this.assertNotDuplicated(
      createPatientAllergyDto.patientId,
      createPatientAllergyDto.allergyId,
    );

    const item = await this.prisma.patientAllergy.create({
      data: {
        patientId: createPatientAllergyDto.patientId,
        allergyId: createPatientAllergyDto.allergyId,
        severity: createPatientAllergyDto.severity,
        notes: createPatientAllergyDto.notes,
      },
      include: RELATIONS,
    });

    return this.mapPatientAllergy(item);
  }

  async update(id: number, updatePatientAllergyDto: UpdatePatientAllergyDto) {
    const existing = await this.prisma.patientAllergy.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('Alergia del paciente no encontrada');
    }

    if (Object.keys(updatePatientAllergyDto).length === 0) {
      throw new BadRequestException('No se proporcionaron datos para actualizar');
    }

    if (updatePatientAllergyDto.patientId !== undefined) {
      await this.assertPatientExists(updatePatientAllergyDto.patientId);
    }
    if (updatePatientAllergyDto.allergyId !== undefined) {
      await this.assertAllergyExists(updatePatientAllergyDto.allergyId);
    }

    const patientId = updatePatientAllergyDto.patientId ?? existing.patientId;
    const allergyId = updatePatientAllergyDto.allergyId ?? existing.allergyId;
    await this.assertNotDuplicated(patientId, allergyId, id);

    const item = await this.prisma.patientAllergy.update({
      where: { id },
      data: {
        patientId,
        allergyId,
        severity:
          updatePatientAllergyDto.severity !== undefined
            ? updatePatientAllergyDto.severity
            : existing.severity,
        notes:
          updatePatientAllergyDto.notes !== undefined
            ? updatePatientAllergyDto.notes
            : existing.notes,
      },
      include: RELATIONS,
    });

    return this.mapPatientAllergy(item);
  }

  async remove(id: number) {
    const existing = await this.prisma.patientAllergy.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Alergia del paciente no encontrada');
    }

    await this.prisma.patientAllergy.delete({ where: { id } });
    return { success: true };
  }

  private async assertPatientExists(patientId: number) {
    const patient = await this.prisma.patient.findUnique({ where: { id: patientId } });
    if (!patient) {
      throw new BadRequestException('Paciente no existe');
    }
  }

  private async assertAllergyExists(allergyId: number) {
    const allergy = await this.prisma.allergy.findUnique({ where: { id: allergyId } });
    if (!allergy) {
      throw new BadRequestException('La alergia indicada no existe');
    }
  }

  private async assertNotDuplicated(patientId: number, allergyId: number, ignoreId?: number) {
    const duplicate = await this.prisma.patientAllergy.findFirst({
      where: {
        patientId,
        allergyId,
        id: ignoreId ? { not: ignoreId } : undefined,
      },
    });

    if (duplicate) {
      throw new ConflictException('El paciente ya tiene registrada esta alergia');
    }
  }

  private mapPatientAllergy(item: any) {
    return {
      id: item.id,
      patientId: item.patientId,
      patient: item.patient || null,
      allergyId: item.allergyId,
      allergy: item.allergy || null,
      severity: item.severity ?? null,
      notes: item.notes ?? null,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }
}
