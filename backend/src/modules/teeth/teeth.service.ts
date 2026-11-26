import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateToothDto } from './dto/create-tooth.dto';
import { UpdateToothDto } from './dto/update-tooth.dto';

@Injectable()
export class TeethService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const items = await this.prisma.tooth.findMany({
      orderBy: [{ dentition: 'asc' }, { order: 'asc' }],
    });
    return items.map((item) => this.mapTooth(item));
  }

  async findOne(id: number) {
    const item = await this.prisma.tooth.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException('Pieza dental no encontrada');
    }
    return this.mapTooth(item);
  }

  async create(createToothDto: CreateToothDto) {
    if (!createToothDto.name?.trim()) {
      throw new BadRequestException('El nombre de la pieza dental es requerido');
    }
    if (!createToothDto.tooth?.trim()) {
      throw new BadRequestException('El código de la pieza dental es requerido');
    }
    if (!createToothDto.dentition?.trim()) {
      throw new BadRequestException('La dentición es requerida');
    }

    const duplicate = await this.prisma.tooth.findUnique({
      where: {
        tooth_dentition: {
          tooth: createToothDto.tooth.trim(),
          dentition: createToothDto.dentition.trim(),
        },
      },
    });
    if (duplicate) {
      throw new BadRequestException(
        'Ya existe una pieza dental con ese código y dentición',
      );
    }

    const item = await this.prisma.tooth.create({
      data: {
        name: createToothDto.name.trim(),
        dentition: createToothDto.dentition.trim(),
        type: createToothDto.type,
        tooth: createToothDto.tooth.trim(),
        face: createToothDto.face ?? null,
        jaw: createToothDto.jaw,
        order: createToothDto.order,
        imageUrl: createToothDto.imageUrl ?? null,
        active: createToothDto.active ?? true,
      },
    });

    return this.mapTooth(item);
  }

  async update(id: number, updateToothDto: UpdateToothDto) {
    const existing = await this.prisma.tooth.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Pieza dental no encontrada');
    }
    if (Object.keys(updateToothDto).length === 0) {
      throw new BadRequestException('No se proporcionaron datos para actualizar');
    }

    const tooth = updateToothDto.tooth?.trim() ?? existing.tooth;
    const dentition = updateToothDto.dentition?.trim() ?? existing.dentition;

    if (tooth !== existing.tooth || dentition !== existing.dentition) {
      const duplicate = await this.prisma.tooth.findUnique({
        where: { tooth_dentition: { tooth, dentition } },
      });
      if (duplicate && duplicate.id !== id) {
        throw new BadRequestException(
          'Ya existe una pieza dental con ese código y dentición',
        );
      }
    }

    const item = await this.prisma.tooth.update({
      where: { id },
      data: {
        name: updateToothDto.name !== undefined ? updateToothDto.name.trim() : existing.name,
        dentition,
        type: updateToothDto.type ?? existing.type,
        tooth,
        face: updateToothDto.face !== undefined ? updateToothDto.face : existing.face,
        jaw: updateToothDto.jaw ?? existing.jaw,
        order: updateToothDto.order ?? existing.order,
        imageUrl:
          updateToothDto.imageUrl !== undefined
            ? updateToothDto.imageUrl
            : existing.imageUrl,
        active: updateToothDto.active ?? existing.active,
      },
    });

    return this.mapTooth(item);
  }

  async remove(id: number) {
    const existing = await this.prisma.tooth.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Pieza dental no encontrada');
    }

    // Los hallazgos asociados quedan con toothId = null (onDelete: SetNull).
    await this.prisma.tooth.delete({ where: { id } });
    return { success: true };
  }

  private mapTooth(item: any) {
    return {
      id: item.id,
      name: item.name,
      dentition: item.dentition,
      type: item.type,
      tooth: item.tooth,
      face: item.face ?? null,
      jaw: item.jaw,
      order: item.order,
      imageUrl: item.imageUrl ?? null,
      active: item.active,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }
}
