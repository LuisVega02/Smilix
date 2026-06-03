import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AppointmentStatus } from '@prisma/client';

interface AppointmentQuery {
  date?: string;
  weekStart?: string;
}

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: AppointmentQuery) {
    const where: any = {};

    if (query.date) {
      const day = new Date(query.date);
      day.setHours(0, 0, 0, 0);
      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);
      where.startTime = {
        gte: day,
        lt: nextDay,
      };
    }

    if (query.weekStart) {
      const start = new Date(query.weekStart);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 7);
      where.startTime = {
        gte: start,
        lt: end,
      };
    }

    const appointments = await this.prisma.appointment.findMany({
      where,
      orderBy: { startTime: 'asc' },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return appointments.map((appointment) => this.mapAppointment(appointment));
  }

  async findOne(id: number) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!appointment) {
      throw new NotFoundException('Cita no encontrada');
    }

    return this.mapAppointment(appointment);
  }

  async create(createAppointmentDto: CreateAppointmentDto) {
    this.assertPayload(createAppointmentDto);
    await this.assertPatientExists(createAppointmentDto.patientId);
    await this.assertDoctorAvailability(
      createAppointmentDto.doctorResponsible,
      new Date(createAppointmentDto.startTime),
    );

    const appointment = await this.prisma.appointment.create({
      data: {
        patientId: createAppointmentDto.patientId,
        doctorResponsible: createAppointmentDto.doctorResponsible,
        startTime: new Date(createAppointmentDto.startTime),
        endTime: new Date(createAppointmentDto.endTime),
        status: this.mapStatusToPrisma(createAppointmentDto.status),
        notes: createAppointmentDto.notes,
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return this.mapAppointment(appointment);
  }

  async update(id: number, updateAppointmentDto: UpdateAppointmentDto) {
    const existingAppointment = await this.prisma.appointment.findUnique({ where: { id } });

    if (!existingAppointment) {
      throw new NotFoundException('Cita no encontrada');
    }

    if (Object.keys(updateAppointmentDto).length === 0) {
      throw new BadRequestException('No se proporcionaron datos para actualizar');
    }

    const doctor = updateAppointmentDto.doctorResponsible ?? existingAppointment.doctorResponsible;
    const startTime = updateAppointmentDto.startTime
      ? new Date(updateAppointmentDto.startTime)
      : existingAppointment.startTime;

    await this.assertDoctorAvailability(doctor, startTime, id);

    const appointment = await this.prisma.appointment.update({
      where: { id },
      data: {
        patientId: updateAppointmentDto.patientId ?? existingAppointment.patientId,
        doctorResponsible: updateAppointmentDto.doctorResponsible ?? existingAppointment.doctorResponsible,
        startTime: updateAppointmentDto.startTime ? new Date(updateAppointmentDto.startTime) : existingAppointment.startTime,
        endTime: updateAppointmentDto.endTime ? new Date(updateAppointmentDto.endTime) : existingAppointment.endTime,
        status: updateAppointmentDto.status
          ? this.mapStatusToPrisma(updateAppointmentDto.status)
          : existingAppointment.status,
        notes: updateAppointmentDto.notes ?? existingAppointment.notes,
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return this.mapAppointment(appointment);
  }

  async remove(id: number) {
    await this.assertAppointmentExists(id);
    await this.prisma.appointment.delete({ where: { id } });
    return { success: true };
  }

  private async assertPatientExists(patientId: number) {
    const patient = await this.prisma.patient.findUnique({ where: { id: patientId } });
    if (!patient) {
      throw new BadRequestException('Paciente no existe');
    }
  }

  private async assertAppointmentExists(id: number) {
    const appointment = await this.prisma.appointment.findUnique({ where: { id } });
    if (!appointment) {
      throw new NotFoundException('Cita no encontrada');
    }
  }

  private assertPayload(payload: CreateAppointmentDto) {
    if (!payload.patientId) {
      throw new BadRequestException('El id de paciente es requerido');
    }
    if (!payload.doctorResponsible) {
      throw new BadRequestException('El doctor responsable es requerido');
    }
    if (!payload.startTime) {
      throw new BadRequestException('La hora de inicio es requerida');
    }
    if (!payload.endTime) {
      throw new BadRequestException('La hora de finalización es requerida');
    }
    if (!payload.status) {
      throw new BadRequestException('El estado de la cita es requerido');
    }
  }

  private async assertDoctorAvailability(doctorResponsible: string, startTime: Date, appointmentIdToExclude?: number) {
    const where: any = {
      doctorResponsible,
      startTime,
    };

    if (appointmentIdToExclude) {
      where.NOT = { id: appointmentIdToExclude };
    }

    const conflicting = await this.prisma.appointment.findFirst({ where });
    if (conflicting) {
      throw new BadRequestException('Ya existe una cita con este doctor en el mismo horario');
    }
  }

  private mapStatusToPrisma(status: string): AppointmentStatus {
    const normalized = status?.toLowerCase();
    switch (normalized) {
      case 'agendado':
        return AppointmentStatus.SCHEDULED;
      case 'confirmado':
        return AppointmentStatus.IN_PROGRESS;
      case 'finalizada':
        return AppointmentStatus.COMPLETED;
      case 'cancelada':
        return AppointmentStatus.CANCELLED;
      default:
        return AppointmentStatus.SCHEDULED;
    }
  }

  private mapStatusFromPrisma(status: AppointmentStatus): 'agendado' | 'confirmado' | 'finalizada' | 'cancelada' {
    switch (status) {
      case AppointmentStatus.SCHEDULED:
        return 'agendado';
      case AppointmentStatus.IN_PROGRESS:
        return 'confirmado';
      case AppointmentStatus.COMPLETED:
        return 'finalizada';
      case AppointmentStatus.CANCELLED:
        return 'cancelada';
      default:
        return 'agendado';
    }
  }

  private mapAppointment(appointment: any) {
    return {
      id: appointment.id,
      patientId: appointment.patientId,
      patient: appointment.patient || null,
      doctorResponsible: appointment.doctorResponsible || '',
      startTime: appointment.startTime.toISOString(),
      endTime: appointment.endTime.toISOString(),
      status: this.mapStatusFromPrisma(appointment.status),
      notes: appointment.notes || '',
    };
  }
}
