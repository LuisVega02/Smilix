import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateTreatmentCatalogDto } from '../dto/create-treatment-catalog.dto';
import { UpdateTreatmentCatalogDto } from '../dto/update-treatment-catalog.dto';

const CIE10_SELECT = { id: true, code: true, name: true } as const;
const PATHOLOGY_SELECT = { id: true, code: true, name: true } as const;

@Injectable()
export class TreatmentCatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const items = await this.prisma.treatmentCatalog.findMany({
      orderBy: { name: 'asc' },
      include: {
        cie10: { select: CIE10_SELECT },
        pathology: { select: PATHOLOGY_SELECT },
        procedures: { orderBy: { sequence: 'asc' } },
      },
    });
    return items.map((item) => this.mapTreatmentCatalog(item));
  }

  async findOne(id: number) {
    const item = await this.prisma.treatmentCatalog.findUnique({
      where: { id },
      include: {
        cie10: { select: CIE10_SELECT },
        pathology: { select: PATHOLOGY_SELECT },
        procedures: { orderBy: { sequence: 'asc' } },
      },
    });
    if (!item) {
      throw new NotFoundException('Tratamiento de catálogo no encontrado');
    }
    return this.mapTreatmentCatalog(item);
  }

  async create(createTreatmentCatalogDto: CreateTreatmentCatalogDto) {
    if (!createTreatmentCatalogDto.name || !createTreatmentCatalogDto.name.trim()) {
      throw new BadRequestException('El nombre del tratamiento es requerido');
    }
    await this.assertRelationsExist(
      createTreatmentCatalogDto.cie10Id,
      createTreatmentCatalogDto.pathologyId,
    );

    const item = await this.prisma.treatmentCatalog.create({
      data: {
        code: createTreatmentCatalogDto.code,
        name: createTreatmentCatalogDto.name.trim(),
        description: createTreatmentCatalogDto.description,
        price: createTreatmentCatalogDto.price ?? 0,
        durationMin: createTreatmentCatalogDto.durationMin ?? 0,
        cie10Id: createTreatmentCatalogDto.cie10Id,
        pathologyId: createTreatmentCatalogDto.pathologyId,
        active: createTreatmentCatalogDto.active ?? true,
      },
      include: {
        cie10: { select: CIE10_SELECT },
        pathology: { select: PATHOLOGY_SELECT },
        procedures: { orderBy: { sequence: 'asc' } },
      },
    });

    return this.mapTreatmentCatalog(item);
  }

  async update(id: number, updateTreatmentCatalogDto: UpdateTreatmentCatalogDto) {
    const existing = await this.prisma.treatmentCatalog.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Tratamiento de catálogo no encontrado');
    }
    if (Object.keys(updateTreatmentCatalogDto).length === 0) {
      throw new BadRequestException('No se proporcionaron datos para actualizar');
    }

    await this.assertRelationsExist(
      updateTreatmentCatalogDto.cie10Id,
      updateTreatmentCatalogDto.pathologyId,
    );

    const item = await this.prisma.treatmentCatalog.update({
      where: { id },
      data: {
        code:
          updateTreatmentCatalogDto.code !== undefined
            ? updateTreatmentCatalogDto.code
            : existing.code,
        name:
          updateTreatmentCatalogDto.name !== undefined
            ? updateTreatmentCatalogDto.name.trim()
            : existing.name,
        description:
          updateTreatmentCatalogDto.description !== undefined
            ? updateTreatmentCatalogDto.description
            : existing.description,
        price:
          updateTreatmentCatalogDto.price !== undefined
            ? updateTreatmentCatalogDto.price
            : existing.price,
        durationMin:
          updateTreatmentCatalogDto.durationMin !== undefined
            ? updateTreatmentCatalogDto.durationMin
            : existing.durationMin,
        cie10Id:
          updateTreatmentCatalogDto.cie10Id !== undefined
            ? updateTreatmentCatalogDto.cie10Id ?? null
            : existing.cie10Id,
        pathologyId:
          updateTreatmentCatalogDto.pathologyId !== undefined
            ? updateTreatmentCatalogDto.pathologyId ?? null
            : existing.pathologyId,
        active: updateTreatmentCatalogDto.active ?? existing.active,
      },
      include: {
        cie10: { select: CIE10_SELECT },
        pathology: { select: PATHOLOGY_SELECT },
        procedures: { orderBy: { sequence: 'asc' } },
      },
    });

    return this.mapTreatmentCatalog(item);
  }

  async remove(id: number) {
    const existing = await this.prisma.treatmentCatalog.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Tratamiento de catálogo no encontrado');
    }
    await this.prisma.treatmentCatalog.delete({ where: { id } });
    return { success: true };
  }

  private async assertRelationsExist(
    cie10Id?: number | null,
    pathologyId?: number | null,
  ) {
    if (cie10Id !== undefined && cie10Id !== null) {
      const cie10 = await this.prisma.cie10.findUnique({ where: { id: cie10Id } });
      if (!cie10) {
        throw new BadRequestException('El código CIE-10 indicado no existe');
      }
    }
    if (pathologyId !== undefined && pathologyId !== null) {
      const pathology = await this.prisma.pathology.findUnique({
        where: { id: pathologyId },
      });
      if (!pathology) {
        throw new BadRequestException('La patología indicada no existe');
      }
    }
  }

  private mapTreatmentCatalog(item: any) {
    return {
      id: item.id,
      code: item.code ?? null,
      name: item.name,
      description: item.description ?? null,
      price: Number(item.price),
      durationMin: item.durationMin,
      cie10Id: item.cie10Id ?? null,
      cie10: item.cie10 ?? null,
      pathologyId: item.pathologyId ?? null,
      pathology: item.pathology ?? null,
      active: item.active,
      ...(Array.isArray(item.procedures)
        ? { procedures: item.procedures.map((procedure: any) => this.mapProcedure(procedure)) }
        : {}),
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }

  private mapProcedure(procedure: any) {
    return {
      id: procedure.id,
      name: procedure.name,
      description: procedure.description ?? null,
      treatmentCatalogId: procedure.treatmentCatalogId,
      sequence: procedure.sequence,
      type: procedure.type ?? null,
      labWaitDays: procedure.labWaitDays,
      active: procedure.active,
      createdAt: procedure.createdAt.toISOString(),
      updatedAt: procedure.updatedAt.toISOString(),
    };
  }
}
