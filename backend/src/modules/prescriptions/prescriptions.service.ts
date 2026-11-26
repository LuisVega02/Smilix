import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { QueryPrescriptionDto } from './dto/query-prescription.dto';

const PATIENT_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  documentId: true,
} as const;

const MEDICATION_SELECT = {
  id: true,
  name: true,
  dose: true,
  description: true,
} as const;

const RELATIONS = {
  patient: { select: PATIENT_SELECT },
  medication: { select: MEDICATION_SELECT },
} as const;

@Injectable()
export class PrescriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryPrescriptionDto = {}) {
    const items = await this.prisma.prescription.findMany({
      where: {
        patientId: query.patientId,
        medicalSessionId: query.medicalSessionId,
      },
      orderBy: { createdAt: 'desc' },
      include: RELATIONS,
    });

    return items.map((item) => this.mapPrescription(item));
  }

  async findOne(id: number) {
    const item = await this.prisma.prescription.findUnique({
      where: { id },
      include: RELATIONS,
    });

    if (!item) {
      throw new NotFoundException('Prescripción no encontrada');
    }

    return this.mapPrescription(item);
  }

  async create(createPrescriptionDto: CreatePrescriptionDto) {
    await this.assertPatientExists(createPrescriptionDto.patientId);
    await this.assertSessionExists(createPrescriptionDto.medicalSessionId);
    await this.assertMedicationExists(createPrescriptionDto.medicationId);

    const item = await this.prisma.prescription.create({
      data: {
        patientId: createPrescriptionDto.patientId,
        medicalSessionId: createPrescriptionDto.medicalSessionId ?? null,
        medicationId: createPrescriptionDto.medicationId ?? null,
        medicationName: createPrescriptionDto.medicationName,
        dose: createPrescriptionDto.dose,
        frequency: createPrescriptionDto.frequency,
        duration: createPrescriptionDto.duration,
        instructions: createPrescriptionDto.instructions,
      },
      include: RELATIONS,
    });

    return this.mapPrescription(item);
  }

  async update(id: number, updatePrescriptionDto: UpdatePrescriptionDto) {
    const existing = await this.prisma.prescription.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('Prescripción no encontrada');
    }

    if (Object.keys(updatePrescriptionDto).length === 0) {
      throw new BadRequestException('No se proporcionaron datos para actualizar');
    }

    if (updatePrescriptionDto.patientId !== undefined) {
      await this.assertPatientExists(updatePrescriptionDto.patientId);
    }
    if (
      updatePrescriptionDto.medicalSessionId !== undefined &&
      updatePrescriptionDto.medicalSessionId !== null
    ) {
      await this.assertSessionExists(updatePrescriptionDto.medicalSessionId);
    }
    if (
      updatePrescriptionDto.medicationId !== undefined &&
      updatePrescriptionDto.medicationId !== null
    ) {
      await this.assertMedicationExists(updatePrescriptionDto.medicationId);
    }

    const item = await this.prisma.prescription.update({
      where: { id },
      data: {
        patientId: updatePrescriptionDto.patientId ?? existing.patientId,
        medicalSessionId:
          updatePrescriptionDto.medicalSessionId !== undefined
            ? updatePrescriptionDto.medicalSessionId
            : existing.medicalSessionId,
        medicationId:
          updatePrescriptionDto.medicationId !== undefined
            ? updatePrescriptionDto.medicationId
            : existing.medicationId,
        medicationName:
          updatePrescriptionDto.medicationName !== undefined
            ? updatePrescriptionDto.medicationName
            : existing.medicationName,
        dose:
          updatePrescriptionDto.dose !== undefined
            ? updatePrescriptionDto.dose
            : existing.dose,
        frequency:
          updatePrescriptionDto.frequency !== undefined
            ? updatePrescriptionDto.frequency
            : existing.frequency,
        duration:
          updatePrescriptionDto.duration !== undefined
            ? updatePrescriptionDto.duration
            : existing.duration,
        instructions:
          updatePrescriptionDto.instructions !== undefined
            ? updatePrescriptionDto.instructions
            : existing.instructions,
      },
      include: RELATIONS,
    });

    return this.mapPrescription(item);
  }

  async remove(id: number) {
    const existing = await this.prisma.prescription.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Prescripción no encontrada');
    }

    await this.prisma.prescription.delete({ where: { id } });
    return { success: true };
  }

  private async assertPatientExists(patientId: number) {
    const patient = await this.prisma.patient.findUnique({ where: { id: patientId } });
    if (!patient) {
      throw new BadRequestException('Paciente no existe');
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

  private async assertMedicationExists(medicationId?: number | null) {
    if (medicationId === undefined || medicationId === null) {
      return;
    }
    const medication = await this.prisma.medication.findUnique({
      where: { id: medicationId },
    });
    if (!medication) {
      throw new BadRequestException('El medicamento indicado no existe');
    }
  }

  private mapPrescription(item: any) {
    return {
      id: item.id,
      patientId: item.patientId,
      patient: item.patient || null,
      medicalSessionId: item.medicalSessionId ?? null,
      medicationId: item.medicationId ?? null,
      medication: item.medication || null,
      medicationName: item.medicationName ?? null,
      dose: item.dose ?? null,
      frequency: item.frequency ?? null,
      duration: item.duration ?? null,
      instructions: item.instructions ?? null,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }
}
