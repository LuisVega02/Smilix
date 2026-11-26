import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateMedicalConditionDto } from '../dto/create-medical-condition.dto';
import { UpdateMedicalConditionDto } from '../dto/update-medical-condition.dto';

@Injectable()
export class MedicalConditionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const items = await this.prisma.medicalCondition.findMany({
      orderBy: { name: 'asc' },
    });
    return items.map((item) => this.mapMedicalCondition(item));
  }

  async findOne(id: number) {
    const item = await this.prisma.medicalCondition.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException('Condición médica no encontrada');
    }
    return this.mapMedicalCondition(item);
  }

  async create(createMedicalConditionDto: CreateMedicalConditionDto) {
    if (!createMedicalConditionDto.name || !createMedicalConditionDto.name.trim()) {
      throw new BadRequestException('El nombre de la condición médica es requerido');
    }

    const item = await this.prisma.medicalCondition.create({
      data: {
        code: createMedicalConditionDto.code,
        name: createMedicalConditionDto.name.trim(),
        description: createMedicalConditionDto.description,
        dentalAffection: createMedicalConditionDto.dentalAffection,
        active: createMedicalConditionDto.active ?? true,
      },
    });

    return this.mapMedicalCondition(item);
  }

  async update(id: number, updateMedicalConditionDto: UpdateMedicalConditionDto) {
    const existing = await this.prisma.medicalCondition.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Condición médica no encontrada');
    }
    if (Object.keys(updateMedicalConditionDto).length === 0) {
      throw new BadRequestException('No se proporcionaron datos para actualizar');
    }

    const item = await this.prisma.medicalCondition.update({
      where: { id },
      data: {
        code:
          updateMedicalConditionDto.code !== undefined
            ? updateMedicalConditionDto.code
            : existing.code,
        name:
          updateMedicalConditionDto.name !== undefined
            ? updateMedicalConditionDto.name.trim()
            : existing.name,
        description:
          updateMedicalConditionDto.description !== undefined
            ? updateMedicalConditionDto.description
            : existing.description,
        dentalAffection:
          updateMedicalConditionDto.dentalAffection !== undefined
            ? updateMedicalConditionDto.dentalAffection
            : existing.dentalAffection,
        active: updateMedicalConditionDto.active ?? existing.active,
      },
    });

    return this.mapMedicalCondition(item);
  }

  async remove(id: number) {
    const existing = await this.prisma.medicalCondition.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Condición médica no encontrada');
    }
    await this.prisma.medicalCondition.delete({ where: { id } });
    return { success: true };
  }

  private mapMedicalCondition(item: any) {
    return {
      id: item.id,
      code: item.code ?? null,
      name: item.name,
      description: item.description ?? null,
      dentalAffection: item.dentalAffection ?? null,
      active: item.active,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }
}
