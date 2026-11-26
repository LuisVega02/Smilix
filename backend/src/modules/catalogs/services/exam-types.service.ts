import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateExamTypeDto } from '../dto/create-exam-type.dto';
import { UpdateExamTypeDto } from '../dto/update-exam-type.dto';

@Injectable()
export class ExamTypesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const items = await this.prisma.examType.findMany({ orderBy: { name: 'asc' } });
    return items.map((item) => this.mapExamType(item));
  }

  async findOne(id: number) {
    const item = await this.prisma.examType.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException('Tipo de examen no encontrado');
    }
    return this.mapExamType(item);
  }

  async create(createExamTypeDto: CreateExamTypeDto) {
    if (!createExamTypeDto.name || !createExamTypeDto.name.trim()) {
      throw new BadRequestException('El nombre del tipo de examen es requerido');
    }

    const item = await this.prisma.examType.create({
      data: {
        name: createExamTypeDto.name.trim(),
        description: createExamTypeDto.description,
        active: createExamTypeDto.active ?? true,
      },
    });

    return this.mapExamType(item);
  }

  async update(id: number, updateExamTypeDto: UpdateExamTypeDto) {
    const existing = await this.prisma.examType.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Tipo de examen no encontrado');
    }
    if (Object.keys(updateExamTypeDto).length === 0) {
      throw new BadRequestException('No se proporcionaron datos para actualizar');
    }

    const item = await this.prisma.examType.update({
      where: { id },
      data: {
        name:
          updateExamTypeDto.name !== undefined
            ? updateExamTypeDto.name.trim()
            : existing.name,
        description:
          updateExamTypeDto.description !== undefined
            ? updateExamTypeDto.description
            : existing.description,
        active: updateExamTypeDto.active ?? existing.active,
      },
    });

    return this.mapExamType(item);
  }

  async remove(id: number) {
    const existing = await this.prisma.examType.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Tipo de examen no encontrado');
    }
    await this.prisma.examType.delete({ where: { id } });
    return { success: true };
  }

  private mapExamType(item: any) {
    return {
      id: item.id,
      name: item.name,
      description: item.description ?? null,
      active: item.active,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }
}
