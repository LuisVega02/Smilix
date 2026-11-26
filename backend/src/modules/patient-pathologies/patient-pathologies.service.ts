import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePatientPathologyDto } from './dto/create-patient-pathology.dto';
import { UpdatePatientPathologyDto } from './dto/update-patient-pathology.dto';
import { QueryPatientPathologyDto } from './dto/query-patient-pathology.dto';

const PATIENT_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  documentId: true,
} as const;

const PATHOLOGY_SELECT = { id: true, code: true, name: true } as const;

const DOCTOR_SELECT = { id: true, name: true, registerRnp: true, registerRne: true } as const;

const RELATIONS = {
  patient: { select: PATIENT_SELECT },
  pathology: { select: PATHOLOGY_SELECT },
  doctor: { select: DOCTOR_SELECT },
} as const;

@Injectable()
export class PatientPathologiesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryPatientPathologyDto = {}) {
    const items = await this.prisma.patientPathology.findMany({
      where: {
        patientId: query.patientId,
        medicalSessionId: query.medicalSessionId,
      },
      orderBy: { date: 'desc' },
      include: RELATIONS,
    });

    return items.map((item) => this.mapPatientPathology(item));
  }

  async findOne(id: number) {
    const item = await this.prisma.patientPathology.findUnique({
      where: { id },
      include: RELATIONS,
    });

    if (!item) {
      throw new NotFoundException('Patología del paciente no encontrada');
    }

    return this.mapPatientPathology(item);
  }

  async create(createPatientPathologyDto: CreatePatientPathologyDto) {
    await this.assertPatientExists(createPatientPathologyDto.patientId);
    await this.assertPathologyExists(createPatientPathologyDto.pathologyId);
    await this.assertSessionExists(createPatientPathologyDto.medicalSessionId);
    await this.assertDoctorExists(createPatientPathologyDto.doctorId);

    const item = await this.prisma.patientPathology.create({
      data: {
        patientId: createPatientPathologyDto.patientId,
        medicalSessionId: createPatientPathologyDto.medicalSessionId ?? null,
        pathologyId: createPatientPathologyDto.pathologyId,
        doctorId: createPatientPathologyDto.doctorId ?? null,
        date: createPatientPathologyDto.date
          ? this.parseDate(createPatientPathologyDto.date)
          : undefined,
        notes: createPatientPathologyDto.notes,
        state: createPatientPathologyDto.state,
      },
      include: RELATIONS,
    });

    return this.mapPatientPathology(item);
  }

  async update(id: number, updatePatientPathologyDto: UpdatePatientPathologyDto) {
    const existing = await this.prisma.patientPathology.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('Patología del paciente no encontrada');
    }

    if (Object.keys(updatePatientPathologyDto).length === 0) {
      throw new BadRequestException('No se proporcionaron datos para actualizar');
    }

    if (updatePatientPathologyDto.patientId !== undefined) {
      await this.assertPatientExists(updatePatientPathologyDto.patientId);
    }
    if (updatePatientPathologyDto.pathologyId !== undefined) {
      await this.assertPathologyExists(updatePatientPathologyDto.pathologyId);
    }
    if (
      updatePatientPathologyDto.medicalSessionId !== undefined &&
      updatePatientPathologyDto.medicalSessionId !== null
    ) {
      await this.assertSessionExists(updatePatientPathologyDto.medicalSessionId);
    }
    if (
      updatePatientPathologyDto.doctorId !== undefined &&
      updatePatientPathologyDto.doctorId !== null
    ) {
      await this.assertDoctorExists(updatePatientPathologyDto.doctorId);
    }

    const item = await this.prisma.patientPathology.update({
      where: { id },
      data: {
        patientId: updatePatientPathologyDto.patientId ?? existing.patientId,
        medicalSessionId:
          updatePatientPathologyDto.medicalSessionId !== undefined
            ? updatePatientPathologyDto.medicalSessionId
            : existing.medicalSessionId,
        pathologyId: updatePatientPathologyDto.pathologyId ?? existing.pathologyId,
        doctorId:
          updatePatientPathologyDto.doctorId !== undefined
            ? updatePatientPathologyDto.doctorId
            : existing.doctorId,
        date: updatePatientPathologyDto.date
          ? this.parseDate(updatePatientPathologyDto.date)
          : existing.date,
        notes:
          updatePatientPathologyDto.notes !== undefined
            ? updatePatientPathologyDto.notes
            : existing.notes,
        state:
          updatePatientPathologyDto.state !== undefined
            ? updatePatientPathologyDto.state
            : existing.state,
      },
      include: RELATIONS,
    });

    return this.mapPatientPathology(item);
  }

  async remove(id: number) {
    const existing = await this.prisma.patientPathology.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Patología del paciente no encontrada');
    }

    await this.prisma.patientPathology.delete({ where: { id } });
    return { success: true };
  }

  private async assertPatientExists(patientId: number) {
    const patient = await this.prisma.patient.findUnique({ where: { id: patientId } });
    if (!patient) {
      throw new BadRequestException('Paciente no existe');
    }
  }

  private async assertPathologyExists(pathologyId: number) {
    const pathology = await this.prisma.pathology.findUnique({ where: { id: pathologyId } });
    if (!pathology) {
      throw new BadRequestException('La patología indicada no existe');
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

  private async assertDoctorExists(doctorId?: number | null) {
    if (doctorId === undefined || doctorId === null) {
      return;
    }
    const doctor = await this.prisma.physician.findUnique({ where: { id: doctorId } });
    if (!doctor) {
      throw new BadRequestException('El médico indicado no existe');
    }
  }

  private parseDate(value: string): Date {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException('La fecha indicada no es válida');
    }
    return date;
  }

  private mapPatientPathology(item: any) {
    return {
      id: item.id,
      patientId: item.patientId,
      patient: item.patient || null,
      medicalSessionId: item.medicalSessionId ?? null,
      pathologyId: item.pathologyId,
      pathology: item.pathology || null,
      doctorId: item.doctorId ?? null,
      doctor: item.doctor || null,
      date: item.date.toISOString(),
      notes: item.notes ?? null,
      state: item.state ?? null,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }
}
