import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateProcedureCatalogDto } from '../dto/create-procedure-catalog.dto';
import { UpdateProcedureCatalogDto } from '../dto/update-procedure-catalog.dto';

const TREATMENT_SELECT = { id: true, code: true, name: true } as const;

@Injectable()
export class ProcedureCatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const items = await this.prisma.procedureCatalog.findMany({
      orderBy: [{ treatmentCatalogId: 'asc' }, { sequence: 'asc' }],
      include: { treatment: { select: TREATMENT_SELECT } },
    });
    return items.map((item) => this.mapProcedureCatalog(item));
  }

  async findOne(id: number) {
    const item = await this.prisma.procedureCatalog.findUnique({
      where: { id },
      include: { treatment: { select: TREATMENT_SELECT } },
    });
    if (!item) {
      throw new NotFoundException('Procedimiento de catálogo no encontrado');
    }
    return this.mapProcedureCatalog(item);
  }

  async create(createProcedureCatalogDto: CreateProcedureCatalogDto) {
    if (!createProcedureCatalogDto.name || !createProcedureCatalogDto.name.trim()) {
      throw new BadRequestException('El nombre del procedimiento es requerido');
    }
    await this.assertTreatmentExists(createProcedureCatalogDto.treatmentCatalogId);

    const item = await this.prisma.procedureCatalog.create({
      data: {
        name: createProcedureCatalogDto.name.trim(),
        description: createProcedureCatalogDto.description,
        treatmentCatalogId: createProcedureCatalogDto.treatmentCatalogId,
        sequence: createProcedureCatalogDto.sequence ?? 0,
        type: createProcedureCatalogDto.type,
        labWaitDays: createProcedureCatalogDto.labWaitDays ?? 0,
        active: createProcedureCatalogDto.active ?? true,
      },
      include: { treatment: { select: TREATMENT_SELECT } },
    });

    return this.mapProcedureCatalog(item);
  }

  async update(id: number, updateProcedureCatalogDto: UpdateProcedureCatalogDto) {
    const existing = await this.prisma.procedureCatalog.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Procedimiento de catálogo no encontrado');
    }
    if (Object.keys(updateProcedureCatalogDto).length === 0) {
      throw new BadRequestException('No se proporcionaron datos para actualizar');
    }

    if (updateProcedureCatalogDto.treatmentCatalogId !== undefined) {
      await this.assertTreatmentExists(updateProcedureCatalogDto.treatmentCatalogId);
    }

    const item = await this.prisma.procedureCatalog.update({
      where: { id },
      data: {
        name:
          updateProcedureCatalogDto.name !== undefined
            ? updateProcedureCatalogDto.name.trim()
            : existing.name,
        description:
          updateProcedureCatalogDto.description !== undefined
            ? updateProcedureCatalogDto.description
            : existing.description,
        treatmentCatalogId:
          updateProcedureCatalogDto.treatmentCatalogId ?? existing.treatmentCatalogId,
        sequence:
          updateProcedureCatalogDto.sequence !== undefined
            ? updateProcedureCatalogDto.sequence
            : existing.sequence,
        type:
          updateProcedureCatalogDto.type !== undefined
            ? updateProcedureCatalogDto.type
            : existing.type,
        labWaitDays:
          updateProcedureCatalogDto.labWaitDays !== undefined
            ? updateProcedureCatalogDto.labWaitDays
            : existing.labWaitDays,
        active: updateProcedureCatalogDto.active ?? existing.active,
      },
      include: { treatment: { select: TREATMENT_SELECT } },
    });

    return this.mapProcedureCatalog(item);
  }

  async remove(id: number) {
    const existing = await this.prisma.procedureCatalog.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Procedimiento de catálogo no encontrado');
    }
    await this.prisma.procedureCatalog.delete({ where: { id } });
    return { success: true };
  }

  private async assertTreatmentExists(treatmentCatalogId: number) {
    const treatment = await this.prisma.treatmentCatalog.findUnique({
      where: { id: treatmentCatalogId },
    });
    if (!treatment) {
      throw new BadRequestException('El tratamiento de catálogo indicado no existe');
    }
  }

  private mapProcedureCatalog(item: any) {
    return {
      id: item.id,
      name: item.name,
      description: item.description ?? null,
      treatmentCatalogId: item.treatmentCatalogId,
      treatment: item.treatment ?? null,
      sequence: item.sequence,
      type: item.type ?? null,
      labWaitDays: item.labWaitDays,
      active: item.active,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }
}
