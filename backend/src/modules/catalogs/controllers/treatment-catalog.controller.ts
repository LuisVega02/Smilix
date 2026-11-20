import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { TreatmentCatalogService } from '../services/treatment-catalog.service';
import { CreateTreatmentCatalogDto } from '../dto/create-treatment-catalog.dto';
import { UpdateTreatmentCatalogDto } from '../dto/update-treatment-catalog.dto';

@Controller('treatment-catalog')
export class TreatmentCatalogController {
  constructor(private readonly treatmentCatalogService: TreatmentCatalogService) {}

  @Get()
  findAll() {
    return this.treatmentCatalogService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.treatmentCatalogService.findOne(id);
  }

  @Post()
  create(@Body() createTreatmentCatalogDto: CreateTreatmentCatalogDto) {
    return this.treatmentCatalogService.create(createTreatmentCatalogDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTreatmentCatalogDto: UpdateTreatmentCatalogDto,
  ) {
    return this.treatmentCatalogService.update(id, updateTreatmentCatalogDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.treatmentCatalogService.remove(id);
  }
}
