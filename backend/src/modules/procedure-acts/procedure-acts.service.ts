import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProcedureActDto } from './dto/create-procedure-act.dto';
import { UpdateProcedureActDto } from './dto/update-procedure-act.dto';
import { QueryProcedureActDto } from './dto/query-procedure-act.dto';

const TREATMENT_SELECT = {
  id: true,
  patientId: true,
  type: true,
  status: true,
} as const;

const PROCEDURE_SELECT = {
  id: true,
  name: true,
  type: true,
  sequence: true,
} as const;

const RELATIONS = {
  treatment: { select: TREATMENT_SELECT },
  procedureCatalog: { select: PROCEDURE_SELECT },
} as const;

@Injectable()
export class ProcedureActsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryProcedureActDto = {}) {
    const items = await this.prisma.procedureAct.findMany({
      where: { treatmentId: query.treatmentId },
      orderBy: { date: 'desc' },
      include: RELATIONS,
    });

    return items.map((item) => this.mapProcedureAct(item));
  }

  async findOne(id: number) {
    const item = await this.prisma.procedureAct.findUnique({
      where: { id },
      include: RELATIONS,
    });

    if (!item) {
      throw new NotFoundException('Acto de procedimiento no encontrado');
    }

    return this.mapProcedureAct(item);
  }

  async create(createProcedureActDto: CreateProcedureActDto) {
    await this.assertTreatmentExists(createProcedureActDto.treatmentId);
    await this.assertProcedureCatalogExists(createProcedureActDto.procedureCatalogId);

    const item = await this.prisma.procedureAct.create({
      data: {
        treatmentId: createProcedureActDto.treatmentId,
        procedureCatalogId: createProcedureActDto.procedureCatalogId,
        date: createProcedureActDto.date
          ? this.parseDate(createProcedureActDto.date)
          : undefined,
        notes: createProcedureActDto.notes,
        status: createProcedureActDto.status,
      },
      include: RELATIONS,
    });

    return this.mapProcedureAct(item);
  }

  async update(id: number, updateProcedureActDto: UpdateProcedureActDto) {
    const existing = await this.prisma.procedureAct.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('Acto de procedimiento no encontrado');
    }

    if (Object.keys(updateProcedureActDto).length === 0) {
      throw new BadRequestException('No se proporcionaron datos para actualizar');
    }

    if (updateProcedureActDto.treatmentId !== undefined) {
      await this.assertTreatmentExists(updateProcedureActDto.treatmentId);
    }
    if (updateProcedureActDto.procedureCatalogId !== undefined) {
      await this.assertProcedureCatalogExists(updateProcedureActDto.procedureCatalogId);
    }

    const item = await this.prisma.procedureAct.update({
      where: { id },
      data: {
        treatmentId: updateProcedureActDto.treatmentId ?? existing.treatmentId,
        procedureCatalogId:
          updateProcedureActDto.procedureCatalogId ?? existing.procedureCatalogId,
        date: updateProcedureActDto.date
          ? this.parseDate(updateProcedureActDto.date)
          : existing.date,
        notes:
          updateProcedureActDto.notes !== undefined
            ? updateProcedureActDto.notes
            : existing.notes,
        status:
          updateProcedureActDto.status !== undefined
            ? updateProcedureActDto.status
            : existing.status,
      },
      include: RELATIONS,
    });

    return this.mapProcedureAct(item);
  }

  async remove(id: number) {
    const existing = await this.prisma.procedureAct.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Acto de procedimiento no encontrado');
    }

    await this.prisma.procedureAct.delete({ where: { id } });
    return { success: true };
  }

  private async assertTreatmentExists(treatmentId: number) {
    const treatment = await this.prisma.treatment.findUnique({ where: { id: treatmentId } });
    if (!treatment) {
      throw new BadRequestException('El tratamiento indicado no existe');
    }
  }

  private async assertProcedureCatalogExists(procedureCatalogId: number) {
    const procedure = await this.prisma.procedureCatalog.findUnique({
      where: { id: procedureCatalogId },
    });
    if (!procedure) {
      throw new BadRequestException('El procedimiento del catálogo no existe');
    }
  }

  private parseDate(value: string): Date {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException('La fecha indicada no es válida');
    }
    return date;
  }

  private mapProcedureAct(item: any) {
    return {
      id: item.id,
      treatmentId: item.treatmentId,
      treatment: item.treatment || null,
      procedureCatalogId: item.procedureCatalogId,
      procedureCatalog: item.procedureCatalog || null,
      date: item.date.toISOString(),
      notes: item.notes ?? null,
      status: item.status ?? null,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }
}
