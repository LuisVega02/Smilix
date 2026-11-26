import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AppointmentStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

/**
 * Tests unitarios de AppointmentsService.
 *
 * PrismaService se reemplaza por un mock: no se abre ninguna conexión real
 * a la base de datos.
 */
describe('AppointmentsService', () => {
  let service: AppointmentsService;
  let prisma: {
    appointment: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    patient: {
      findUnique: jest.Mock;
    };
  };

  const createAppointmentDto: CreateAppointmentDto = {
    patientId: 10,
    doctorResponsible: 'Dr. Ruiz',
    startTime: '2026-11-20T10:00:00.000Z',
    endTime: '2026-11-20T11:00:00.000Z',
    status: 'agendado',
    notes: 'Revisión inicial',
  };

  const buildAppointment = (overrides: Record<string, unknown> = {}) => ({
    id: 1,
    patientId: 10,
    patient: {
      id: 10,
      firstName: 'Lucía',
      lastName: 'Pérez',
    },
    doctorResponsible: 'Dr. Ruiz',
    startTime: new Date('2026-11-20T10:00:00.000Z'),
    endTime: new Date('2026-11-20T11:00:00.000Z'),
    status: AppointmentStatus.SCHEDULED,
    notes: 'Revisión inicial',
    treatmentId: null,
    createdAt: new Date('2026-11-19T00:00:00.000Z'),
    updatedAt: new Date('2026-11-19T00:00:00.000Z'),
    ...overrides,
  });

  beforeEach(() => {
    prisma = {
      appointment: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      patient: {
        findUnique: jest.fn(),
      },
    };

    service = new AppointmentsService(prisma as unknown as PrismaService);
  });

  describe('create', () => {
    it('lanza BadRequestException si el paciente no existe', async () => {
      prisma.patient.findUnique.mockResolvedValue(null);

      await expect(service.create(createAppointmentDto)).rejects.toBeInstanceOf(
        BadRequestException,
      );

      expect(prisma.appointment.findFirst).not.toHaveBeenCalled();
      expect(prisma.appointment.create).not.toHaveBeenCalled();
    });

    it('lanza BadRequestException si el doctor ya está ocupado en el mismo horario', async () => {
      prisma.patient.findUnique.mockResolvedValue({
        id: 10,
        firstName: 'Lucía',
        lastName: 'Pérez',
      });
      prisma.appointment.findFirst.mockResolvedValue(buildAppointment());

      await expect(service.create(createAppointmentDto)).rejects.toBeInstanceOf(
        BadRequestException,
      );

      expect(prisma.appointment.findFirst).toHaveBeenCalledWith({
        where: {
          doctorResponsible: 'Dr. Ruiz',
          startTime: new Date('2026-11-20T10:00:00.000Z'),
        },
      });
      expect(prisma.appointment.create).not.toHaveBeenCalled();
    });

    it('crea la cita cuando el paciente existe y el doctor está libre', async () => {
      prisma.patient.findUnique.mockResolvedValue({
        id: 10,
        firstName: 'Lucía',
        lastName: 'Pérez',
      });
      prisma.appointment.findFirst.mockResolvedValue(null);
      prisma.appointment.create.mockResolvedValue(buildAppointment());

      const result = await service.create(createAppointmentDto);

      expect(prisma.appointment.create).toHaveBeenCalledWith({
        data: {
          patientId: 10,
          doctorResponsible: 'Dr. Ruiz',
          startTime: new Date('2026-11-20T10:00:00.000Z'),
          endTime: new Date('2026-11-20T11:00:00.000Z'),
          status: AppointmentStatus.SCHEDULED,
          notes: 'Revisión inicial',
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
      expect(result).toEqual({
        id: 1,
        patientId: 10,
        patient: {
          id: 10,
          firstName: 'Lucía',
          lastName: 'Pérez',
        },
        doctorResponsible: 'Dr. Ruiz',
        startTime: '2026-11-20T10:00:00.000Z',
        endTime: '2026-11-20T11:00:00.000Z',
        status: 'agendado',
        notes: 'Revisión inicial',
      });
    });
  });

  describe('findOne', () => {
    it('lanza NotFoundException si la cita no existe', async () => {
      prisma.appointment.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toBeInstanceOf(
        NotFoundException,
      );

      expect(prisma.appointment.findUnique).toHaveBeenCalledWith({
        where: { id: 999 },
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
    });
  });
});
