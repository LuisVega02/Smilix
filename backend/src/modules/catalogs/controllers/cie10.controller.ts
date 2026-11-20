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
import { Cie10Service } from '../services/cie10.service';
import { CreateCie10Dto } from '../dto/create-cie10.dto';
import { UpdateCie10Dto } from '../dto/update-cie10.dto';

@Controller('cie10')
export class Cie10Controller {
  constructor(private readonly cie10Service: Cie10Service) {}

  @Get()
  findAll() {
    return this.cie10Service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cie10Service.findOne(id);
  }

  @Post()
  create(@Body() createCie10Dto: CreateCie10Dto) {
    return this.cie10Service.create(createCie10Dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCie10Dto: UpdateCie10Dto,
  ) {
    return this.cie10Service.update(id, updateCie10Dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.cie10Service.remove(id);
  }
}
