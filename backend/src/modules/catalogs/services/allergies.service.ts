import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateAllergyDto } from '../dto/create-allergy.dto';
import { UpdateAllergyDto } from '../dto/update-allergy.dto';

@Injectable()
export class AllergiesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const items = await this.prisma.allergy.findMany({ orderBy: { name: 'asc' } });
    return items.map((item) => this.mapAllergy(item));
  }

  async findOne(id: number) {
    const item = await this.prisma.allergy.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException('Alergia no encontrada');
    }
    return this.mapAllergy(item);
  }

  async create(createAllergyDto: CreateAllergyDto) {
    if (!createAllergyDto.name || !createAllergyDto.name.trim()) {
      throw new BadRequestException('El nombre de la alergia es requerido');
    }

    const item = await this.prisma.allergy.create({
      data: {
        name: createAllergyDto.name.trim(),
        description: createAllergyDto.description,
        active: createAllergyDto.active ?? true,
      },
    });

    return this.mapAllergy(item);
  }

  async update(id: number, updateAllergyDto: UpdateAllergyDto) {
    const existing = await this.prisma.allergy.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Alergia no encontrada');
    }
    if (Object.keys(updateAllergyDto).length === 0) {
      throw new BadRequestException('No se proporcionaron datos para actualizar');
    }

    const item = await this.prisma.allergy.update({
      where: { id },
      data: {
        name:
          updateAllergyDto.name !== undefined
            ? updateAllergyDto.name.trim()
            : existing.name,
        description:
          updateAllergyDto.description !== undefined
            ? updateAllergyDto.description
            : existing.description,
        active: updateAllergyDto.active ?? existing.active,
      },
    });

    return this.mapAllergy(item);
  }

  async remove(id: number) {
    const existing = await this.prisma.allergy.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Alergia no encontrada');
    }
    await this.prisma.allergy.delete({ where: { id } });
    return { success: true };
  }

  private mapAllergy(item: any) {
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
