import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BudgetStatus, ClinicalHistoryStatus } from '@prisma/client';
import { CreateClinicalHistoryDto } from './dto/create-clinical-history.dto';
import { UpdateClinicalHistoryDto } from './dto/update-clinical-history.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ClinicalHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const histories = await this.prisma.patient.findMany({
      include: {
        sessions: {
          orderBy: { date: 'desc' },
          include: {
            odontogram: true,
            budgets: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return histories.map((history) => this.mapClinicalHistory(history));
  }

  async findOne(id: number) {
    const history = await this.prisma.patient.findUnique({
      where: { id },
      include: {
        sessions: {
          orderBy: { date: 'desc' },
          include: {
            odontogram: true,
            budgets: true,
          },
        },
      },
    });

    if (!history) {
      throw new NotFoundException('Historia clinica no encontrada');
    }

    return this.mapClinicalHistory(history);
  }

  async create(createClinicalHistoryDto: CreateClinicalHistoryDto) {
    this.validatePayload(createClinicalHistoryDto);

    const existingPatient = await this.prisma.patient.findUnique({
      where: { documentId: createClinicalHistoryDto.patient.documentId },
    });

    if (existingPatient) {
      throw new BadRequestException(
        'Ya existe una historia clinica registrada para este paciente',
      );
    }

    const clinicalHistory = await this.prisma.patient.create({
      data: this.buildPatientPersistenceData(createClinicalHistoryDto),
      include: {
        sessions: {
          orderBy: { date: 'desc' },
          include: {
            odontogram: true,
            budgets: true,
          },
        },
      },
    });

    return this.mapClinicalHistory(clinicalHistory);
  }

  async update(id: number, updateClinicalHistoryDto: UpdateClinicalHistoryDto) {
    const existingHistory = await this.findOne(id);
    const mergedPayload: CreateClinicalHistoryDto = {
      ...existingHistory,
      ...updateClinicalHistoryDto,
      patient: {
        ...existingHistory.patient,
        ...updateClinicalHistoryDto.patient,
        phones:
          updateClinicalHistoryDto.patient?.phones || existingHistory.patient.phones,
      },
      guardian:
        updateClinicalHistoryDto.guardian === undefined
          ? existingHistory.guardian
          : updateClinicalHistoryDto.guardian,
      sessions: updateClinicalHistoryDto.sessions || existingHistory.sessions || [],
      attachments: updateClinicalHistoryDto.attachments || existingHistory.attachments,
      radiographs: updateClinicalHistoryDto.radiographs || existingHistory.radiographs,
      patientPhotos: updateClinicalHistoryDto.patientPhotos || existingHistory.patientPhotos,
      status: (updateClinicalHistoryDto.status || existingHistory.status) as
        | 'draft'
        | 'active'
        | 'closed'
        | undefined,
    };

    this.validatePayload(mergedPayload);

    const conflictingHistory = await this.prisma.patient.findUnique({
      where: { documentId: mergedPayload.patient.documentId },
    });

    if (conflictingHistory && conflictingHistory.id !== id) {
      throw new BadRequestException(
        'El paciente seleccionado ya tiene una historia clinica diferente',
      );
    }

    const updatedHistory = await this.prisma.patient.update({
      where: { id },
      data: this.buildPatientPersistenceData(mergedPayload, true),
      include: {
        sessions: {
          orderBy: { date: 'desc' },
          include: {
            odontogram: true,
            budgets: true,
          },
        },
      },
    });

    return this.mapClinicalHistory(updatedHistory);
  }

  private validatePayload(payload: CreateClinicalHistoryDto) {
    if (!payload.patient?.firstName || !payload.patient?.lastName) {
      throw new BadRequestException('Nombre y apellido del paciente son requeridos');
    }

    if (!payload.patient?.documentId) {
      throw new BadRequestException('Documento del paciente es requerido');
    }

    const invalidSession = (payload.sessions || []).find(
      (session) =>
        !session.date ||
        !session.doctorResponsible ||
        !session.consultationReason ||
        !session.diagnosis ||
        !session.treatmentPlan,
    );

    if (invalidSession) {
      throw new BadRequestException(
        'Cada sesion medica debe incluir fecha, doctor, motivo, diagnostico y plan',
      );
    }
  }

  private buildPatientPersistenceData(
    payload: CreateClinicalHistoryDto,
    replaceSessions = false,
  ) {
    const birthDate = payload.patient.birthDate
      ? new Date(payload.patient.birthDate)
      : null;

    return {
      firstName: payload.patient.firstName,
      lastName: payload.patient.lastName,
      nickname: payload.patient.nickname || null,
      documentId: payload.patient.documentId,
      email: payload.patient.email || null,
      phone: payload.patient.phones?.[0] || null,
      phones: payload.patient.phones || [],
      birthDate,
      age: payload.patient.age || null,
      gender: payload.patient.gender || null,
      address: payload.patient.address || null,
      occupation: payload.patient.occupation || null,
      leadSource: payload.patient.leadSource || null,
      photoUrl: payload.patient.photoUrl || null,
      guardianFullName: payload.guardian?.fullName || null,
      guardianRelationship: payload.guardian?.relationship || null,
      guardianDocumentId: payload.guardian?.documentId || null,
      guardianPhone: payload.guardian?.phone || null,
      guardianEmail: payload.guardian?.email || null,
      guardianPhotoUrl: payload.guardian?.photoUrl || null,
      anamnesis: payload.anamnesis,
      medicalBackground: payload.medicalBackground,
      prenatalBackground: payload.prenatalBackground,
      postnatalBackground: payload.postnatalBackground,
      oralHabits: payload.oralHabits,
      dentalDevelopment: payload.dentalDevelopment,
      attachments: payload.attachments || [],
      radiographs: payload.radiographs || [],
      patientPhotos: payload.patientPhotos || [],
      status: this.mapStatusToPrisma(payload.status),
      sessions: replaceSessions
        ? {
            deleteMany: {},
            create: (payload.sessions || []).map((session) => this.buildSessionCreateInput(session)),
          }
        : {
            create: (payload.sessions || []).map((session) => this.buildSessionCreateInput(session)),
          },
    };
  }

  private buildSessionCreateInput(session: CreateClinicalHistoryDto['sessions'][number]) {
    return {
      date: new Date(session.date),
      doctorResponsible: session.doctorResponsible,
      consultationReason: session.consultationReason,
      anamnesis: session.anamnesis || '',
      medicalHistory: session.medicalHistory || '',
      diagnosis: session.diagnosis,
      treatmentPlan: session.treatmentPlan,
      odontogram: session.odontogram
        ? {
            create: {
              data: session.odontogram.data,
              imageUrls: session.odontogram.imageUrls || [],
            },
          }
        : undefined,
      budgets: session.budgets?.length
        ? {
            create: session.budgets.map((budget) => ({
              title: budget.title,
              description: budget.description,
              totalCost: budget.totalCost,
              status: this.mapBudgetStatus(budget.status),
            })),
          }
        : undefined,
    };
  }

  private mapStatusToPrisma(status?: CreateClinicalHistoryDto['status']) {
    switch (status) {
      case 'active':
        return ClinicalHistoryStatus.ACTIVE;
      case 'closed':
        return ClinicalHistoryStatus.CLOSED;
      default:
        return ClinicalHistoryStatus.DRAFT;
    }
  }

  private mapStatusFromPrisma(status: ClinicalHistoryStatus) {
    switch (status) {
      case ClinicalHistoryStatus.ACTIVE:
        return 'active';
      case ClinicalHistoryStatus.CLOSED:
        return 'closed';
      default:
        return 'draft';
    }
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

  private mapClinicalHistory(history: any) {
    return {
      id: history.id,
      patient: {
        firstName: history.firstName,
        lastName: history.lastName,
        nickname: history.nickname || '',
        documentId: history.documentId,
        birthDate: history.birthDate
          ? history.birthDate.toISOString().slice(0, 10)
          : '',
        age: history.age,
        gender: history.gender || '',
        address: history.address || '',
        phones: history.phones || [],
        email: history.email || '',
        occupation: history.occupation || '',
        leadSource: history.leadSource || '',
        photoUrl: history.photoUrl || '',
      },
      guardian: {
        fullName: history.guardianFullName || '',
        relationship: history.guardianRelationship || '',
        documentId: history.guardianDocumentId || '',
        phone: history.guardianPhone || '',
        email: history.guardianEmail || '',
        photoUrl: history.guardianPhotoUrl || '',
      },
      anamnesis: history.anamnesis,
      medicalBackground: history.medicalBackground,
      prenatalBackground: history.prenatalBackground,
      postnatalBackground: history.postnatalBackground,
      oralHabits: history.oralHabits,
      dentalDevelopment: history.dentalDevelopment,
      attachments: history.attachments || [],
      radiographs: history.radiographs || [],
      patientPhotos: history.patientPhotos || [],
      sessions: (history.sessions || []).map((session: any) => ({
        date: session.date.toISOString().slice(0, 10),
        doctorResponsible: session.doctorResponsible,
        consultationReason: session.consultationReason,
        anamnesis: session.anamnesis,
        medicalHistory: session.medicalHistory,
        diagnosis: session.diagnosis,
        treatmentPlan: session.treatmentPlan,
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
      })),
      status: this.mapStatusFromPrisma(history.status),
      createdAt: history.createdAt.toISOString(),
      updatedAt: history.updatedAt.toISOString(),
    };
  }
}