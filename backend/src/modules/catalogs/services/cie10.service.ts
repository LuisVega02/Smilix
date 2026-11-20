import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateCie10Dto } from '../dto/create-cie10.dto';
import { UpdateCie10Dto } from '../dto/update-cie10.dto';

@Injectable()
export class Cie10Service {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const items = await this.prisma.cie10.findMany({ orderBy: { code: 'asc' } });
    return items.map((item) => this.mapCie10(item));
  }

  async findOne(id: number) {
    const item = await this.prisma.cie10.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException('Código CIE-10 no encontrado');
    }
    return this.mapCie10(item);
  }

  async create(createCie10Dto: CreateCie10Dto) {
    this.assertPayload(createCie10Dto);

    const item = await this.prisma.cie10.create({
      data: {
        code: createCie10Dto.code.trim(),
        name: createCie10Dto.name.trim(),
        description: createCie10Dto.description,
        active: createCie10Dto.active ?? true,
      },
    });

    return this.mapCie10(item);
  }

  async update(id: number, updateCie10Dto: UpdateCie10Dto) {
    const existing = await this.prisma.cie10.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Código CIE-10 no encontrado');
    }
    if (Object.keys(updateCie10Dto).length === 0) {
      throw new BadRequestException('No se proporcionaron datos para actualizar');
    }

    const item = await this.prisma.cie10.update({
      where: { id },
      data: {
        code: updateCie10Dto.code !== undefined ? updateCie10Dto.code.trim() : existing.code,
        name: updateCie10Dto.name !== undefined ? updateCie10Dto.name.trim() : existing.name,
        description:
          updateCie10Dto.description !== undefined
            ? updateCie10Dto.description
            : existing.description,
        active: updateCie10Dto.active ?? existing.active,
      },
    });

    return this.mapCie10(item);
  }

  async remove(id: number) {
    const existing = await this.prisma.cie10.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Código CIE-10 no encontrado');
    }
    await this.prisma.cie10.delete({ where: { id } });
    return { success: true };
  }

  private assertPayload(payload: CreateCie10Dto) {
    if (!payload.code || !payload.code.trim()) {
      throw new BadRequestException('El código CIE-10 es requerido');
    }
    if (!payload.name || !payload.name.trim()) {
      throw new BadRequestException('El nombre del CIE-10 es requerido');
    }
  }

  private mapCie10(item: any) {
    return {
      id: item.id,
      code: item.code,
      name: item.name,
      description: item.description ?? null,
      active: item.active,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }
}
