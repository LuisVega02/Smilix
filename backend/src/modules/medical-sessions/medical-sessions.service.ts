import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { BudgetStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMedicalSessionDto } from './dto/create-medical-session.dto';
import { UpdateMedicalSessionDto } from './dto/update-medical-session.dto';

@Injectable()
export class MedicalSessionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const sessions = await this.prisma.medicalSession.findMany({
      orderBy: { date: 'desc' },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            documentId: true,
          },
        },
        odontogram: true,
        budgets: true,
      },
    });

    return sessions.map((session) => this.mapMedicalSession(session));
  }

  async findOne(id: number) {
    const session = await this.prisma.medicalSession.findUnique({
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
        odontogram: true,
        budgets: true,
      },
    });

    if (!session) {
      throw new NotFoundException('Sesion medica no encontrada');
    }

    return this.mapMedicalSession(session);
  }

  async findByPatient(patientId: number) {
    await this.assertPatientExists(patientId);

    const sessions = await this.prisma.medicalSession.findMany({
      where: { patientId },
      orderBy: { date: 'desc' },
      include: {
        odontogram: true,
        budgets: true,
      },
    });

    return sessions.map((session) => this.mapMedicalSession(session));
  }

  async create(createMedicalSessionDto: CreateMedicalSessionDto) {
    this.validatePayload(createMedicalSessionDto);
    await this.assertPatientExists(createMedicalSessionDto.patientId);

    const session = await this.prisma.medicalSession.create({
      data: this.buildSessionPersistenceData(createMedicalSessionDto),
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            documentId: true,
          },
        },
        odontogram: true,
        budgets: true,
      },
    });

    return this.mapMedicalSession(session);
  }

  async update(id: number, updateMedicalSessionDto: UpdateMedicalSessionDto) {
    const existingSession = await this.prisma.medicalSession.findUnique({
      where: { id },
    });

    if (!existingSession) {
      throw new NotFoundException('Sesion medica no encontrada');
    }

    if (updateMedicalSessionDto.patientId) {
      await this.assertPatientExists(updateMedicalSessionDto.patientId);
    }

    if (Object.keys(updateMedicalSessionDto).length === 0) {
      throw new BadRequestException('No se proporcionaron datos para actualizar');
    }

    const session = await this.prisma.medicalSession.update({
      where: { id },
      data: this.buildSessionPersistenceUpdateData(updateMedicalSessionDto),
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            documentId: true,
          },
        },
        odontogram: true,
        budgets: true,
      },
    });

    return this.mapMedicalSession(session);
  }

  async remove(id: number) {
    await this.assertSessionExists(id);

    await this.prisma.medicalSession.delete({
      where: { id },
    });

    return {
      success: true,
    };
  }

  private async assertPatientExists(patientId: number) {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      throw new BadRequestException('Paciente no existe');
    }
  }

  private async assertSessionExists(id: number) {
    const session = await this.prisma.medicalSession.findUnique({
      where: { id },
    });

    if (!session) {
      throw new NotFoundException('Sesion medica no encontrada');
    }
  }

  private validatePayload(payload: CreateMedicalSessionDto) {
    if (!payload.patientId) {
      throw new BadRequestException('El id de paciente es requerido');
    }

    if (!payload.date) {
      throw new BadRequestException('La fecha de la sesion es requerida');
    }

    if (!payload.doctorResponsible) {
      throw new BadRequestException('El doctor responsable es requerido');
    }

    if (!payload.consultationReason) {
      throw new BadRequestException('El motivo de consulta es requerido');
    }

    if (!payload.diagnosis) {
      throw new BadRequestException('El diagnostico es requerido');
    }

    if (!payload.treatmentPlan) {
      throw new BadRequestException('El plan de tratamiento es requerido');
    }

    if (payload.budgets) {
      const invalidBudget = payload.budgets.find(
        (budget) => !budget.title || !budget.description || budget.totalCost === undefined,
      );

      if (invalidBudget) {
        throw new BadRequestException(
          'Cada presupuesto debe incluir titulo, descripcion y costo total',
        );
      }
    }

    if (payload.odontogram && !payload.odontogram.data) {
      throw new BadRequestException('El odontograma debe incluir datos');
    }
  }

  private buildSessionPersistenceData(payload: CreateMedicalSessionDto) {
    return {
      patientId: payload.patientId,
      date: new Date(payload.date),
      doctorResponsible: payload.doctorResponsible,
      consultationReason: payload.consultationReason,
      diagnosis: payload.diagnosis,
      treatmentPlan: payload.treatmentPlan,
      anamnesis: payload.anamnesis || '',
      medicalHistory: payload.medicalHistory || '',
      odontogram: payload.odontogram
        ? {
            create: {
              data: payload.odontogram.data,
              imageUrls: payload.odontogram.imageUrls || [],
            },
          }
        : undefined,
      budgets: payload.budgets?.length
        ? {
            create: payload.budgets.map((budget) => ({
              title: budget.title,
              description: budget.description,
              totalCost: budget.totalCost,
              status: this.mapBudgetStatus(budget.status),
            })),
          }
        : undefined,
    };
  }

  private buildSessionPersistenceUpdateData(payload: UpdateMedicalSessionDto) {
    const data: any = {
      patientId: payload.patientId,
      date: payload.date ? new Date(payload.date) : undefined,
      doctorResponsible: payload.doctorResponsible,
      consultationReason: payload.consultationReason,
      diagnosis: payload.diagnosis,
      treatmentPlan: payload.treatmentPlan,
      anamnesis: payload.anamnesis,
      medicalHistory: payload.medicalHistory,
    };

    if (payload.odontogram) {
      data.odontogram = {
        upsert: {
          create: {
            data: payload.odontogram.data,
            imageUrls: payload.odontogram.imageUrls || [],
          },
          update: {
            data: payload.odontogram.data,
            imageUrls: payload.odontogram.imageUrls || [],
          },
        },
      };
    }

    if (payload.budgets) {
      data.budgets = {
        deleteMany: {},
        create: payload.budgets.map((budget) => ({
          title: budget.title,
          description: budget.description,
          totalCost: budget.totalCost,
          status: this.mapBudgetStatus(budget.status),
        })),
      };
    }

    return data;
  }

  private mapBudgetStatus(status?: string) {
    if (!status) {
      return BudgetStatus.PENDING;
    }

    const normalized = status.toUpperCase();
    if (normalized === BudgetStatus.APPROVED) return BudgetStatus.APPROVED;
    if (normalized === BudgetStatus.REJECTED) return BudgetStatus.REJECTED;
    return BudgetStatus.PENDING;
  }

  private mapMedicalSession(session: any) {
    return {
      id: session.id,
      patientId: session.patientId,
      patient: session.patient || null,
      date: session.date.toISOString().slice(0, 10),
      doctorResponsible: session.doctorResponsible,
      consultationReason: session.consultationReason,
      diagnosis: session.diagnosis,
      treatmentPlan: session.treatmentPlan,
      anamnesis: session.anamnesis,
      medicalHistory: session.medicalHistory,
      odontogram: session.odontogram
        ? {
            data: session.odontogram.data,
            imageUrls: session.odontogram.imageUrls || [],
          }
        : null,
      budgets: (session.budgets || []).map((budget: any) => ({
        id: budget.id,
        title: budget.title,
        description: budget.description,
        totalCost: Number(budget.totalCost),
        status: budget.status.toLowerCase(),
      })),
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
    };
  }
}
