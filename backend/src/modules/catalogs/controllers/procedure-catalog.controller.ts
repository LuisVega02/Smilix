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
import { ProcedureCatalogService } from '../services/procedure-catalog.service';
import { CreateProcedureCatalogDto } from '../dto/create-procedure-catalog.dto';
import { UpdateProcedureCatalogDto } from '../dto/update-procedure-catalog.dto';

@Controller('procedure-catalog')
export class ProcedureCatalogController {
  constructor(private readonly procedureCatalogService: ProcedureCatalogService) {}

  @Get()
  findAll() {
    return this.procedureCatalogService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.procedureCatalogService.findOne(id);
  }

  @Post()
  create(@Body() createProcedureCatalogDto: CreateProcedureCatalogDto) {
    return this.procedureCatalogService.create(createProcedureCatalogDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProcedureCatalogDto: UpdateProcedureCatalogDto,
  ) {
    return this.procedureCatalogService.update(id, updateProcedureCatalogDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.procedureCatalogService.remove(id);
  }
}
