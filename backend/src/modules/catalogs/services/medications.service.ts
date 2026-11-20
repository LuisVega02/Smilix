import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateMedicationDto } from '../dto/create-medication.dto';
import { UpdateMedicationDto } from '../dto/update-medication.dto';

@Injectable()
export class MedicationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const items = await this.prisma.medication.findMany({ orderBy: { name: 'asc' } });
    return items.map((item) => this.mapMedication(item));
  }

  async findOne(id: number) {
    const item = await this.prisma.medication.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException('Medicamento no encontrado');
    }
    return this.mapMedication(item);
  }

  async create(createMedicationDto: CreateMedicationDto) {
    if (!createMedicationDto.name || !createMedicationDto.name.trim()) {
      throw new BadRequestException('El nombre del medicamento es requerido');
    }

    const item = await this.prisma.medication.create({
      data: {
        name: createMedicationDto.name.trim(),
        description: createMedicationDto.description,
        dose: createMedicationDto.dose,
        active: createMedicationDto.active ?? true,
      },
    });

    return this.mapMedication(item);
  }

  async update(id: number, updateMedicationDto: UpdateMedicationDto) {
    const existing = await this.prisma.medication.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Medicamento no encontrado');
    }
    if (Object.keys(updateMedicationDto).length === 0) {
      throw new BadRequestException('No se proporcionaron datos para actualizar');
    }

    const item = await this.prisma.medication.update({
      where: { id },
      data: {
        name:
          updateMedicationDto.name !== undefined
            ? updateMedicationDto.name.trim()
            : existing.name,
        description:
          updateMedicationDto.description !== undefined
            ? updateMedicationDto.description
            : existing.description,
        dose:
          updateMedicationDto.dose !== undefined ? updateMedicationDto.dose : existing.dose,
        active: updateMedicationDto.active ?? existing.active,
      },
    });

    return this.mapMedication(item);
  }

  async remove(id: number) {
    const existing = await this.prisma.medication.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Medicamento no encontrado');
    }
    await this.prisma.medication.delete({ where: { id } });
    return { success: true };
  }

  private mapMedication(item: any) {
    return {
      id: item.id,
      name: item.name,
      description: item.description ?? null,
      dose: item.dose ?? null,
      active: item.active,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }
}
