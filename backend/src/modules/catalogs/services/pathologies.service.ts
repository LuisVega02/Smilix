import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreatePathologyDto } from '../dto/create-pathology.dto';
import { UpdatePathologyDto } from '../dto/update-pathology.dto';

const CIE10_SELECT = { id: true, code: true, name: true } as const;

@Injectable()
export class PathologiesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const items = await this.prisma.pathology.findMany({
      orderBy: { name: 'asc' },
      include: { cie10: { select: CIE10_SELECT } },
    });
    return items.map((item) => this.mapPathology(item));
  }

  async findOne(id: number) {
    const item = await this.prisma.pathology.findUnique({
      where: { id },
      include: { cie10: { select: CIE10_SELECT } },
    });
    if (!item) {
      throw new NotFoundException('Patología no encontrada');
    }
    return this.mapPathology(item);
  }

  async create(createPathologyDto: CreatePathologyDto) {
    this.assertPayload(createPathologyDto);
    await this.assertCie10Exists(createPathologyDto.cie10Id);

    const item = await this.prisma.pathology.create({
      data: {
        code: createPathologyDto.code,
        name: createPathologyDto.name.trim(),
        description: createPathologyDto.description,
        cie10Id: createPathologyDto.cie10Id,
        active: createPathologyDto.active ?? true,
      },
      include: { cie10: { select: CIE10_SELECT } },
    });

    return this.mapPathology(item);
  }

  async update(id: number, updatePathologyDto: UpdatePathologyDto) {
    const existing = await this.prisma.pathology.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Patología no encontrada');
    }
    if (Object.keys(updatePathologyDto).length === 0) {
      throw new BadRequestException('No se proporcionaron datos para actualizar');
    }

    if (
      updatePathologyDto.cie10Id !== undefined &&
      updatePathologyDto.cie10Id !== null
    ) {
      await this.assertCie10Exists(updatePathologyDto.cie10Id);
    }

    const item = await this.prisma.pathology.update({
      where: { id },
      data: {
        code: updatePathologyDto.code !== undefined ? updatePathologyDto.code : existing.code,
        name:
          updatePathologyDto.name !== undefined
            ? updatePathologyDto.name.trim()
            : existing.name,
        description:
          updatePathologyDto.description !== undefined
            ? updatePathologyDto.description
            : existing.description,
        cie10Id:
          updatePathologyDto.cie10Id !== undefined
            ? updatePathologyDto.cie10Id ?? null
            : existing.cie10Id,
        active: updatePathologyDto.active ?? existing.active,
      },
      include: { cie10: { select: CIE10_SELECT } },
    });

    return this.mapPathology(item);
  }

  async remove(id: number) {
    const existing = await this.prisma.pathology.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Patología no encontrada');
    }
    await this.prisma.pathology.delete({ where: { id } });
    return { success: true };
  }

  private async assertCie10Exists(cie10Id?: number | null) {
    if (cie10Id === undefined || cie10Id === null) {
      return;
    }
    const cie10 = await this.prisma.cie10.findUnique({ where: { id: cie10Id } });
    if (!cie10) {
      throw new BadRequestException('El código CIE-10 indicado no existe');
    }
  }

  private assertPayload(payload: CreatePathologyDto) {
    if (!payload.name || !payload.name.trim()) {
      throw new BadRequestException('El nombre de la patología es requerido');
    }
  }

  private mapPathology(item: any) {
    return {
      id: item.id,
      code: item.code ?? null,
      name: item.name,
      description: item.description ?? null,
      cie10Id: item.cie10Id ?? null,
      cie10: item.cie10 ?? null,
      active: item.active,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }
}
