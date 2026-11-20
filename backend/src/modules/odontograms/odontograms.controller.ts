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
import { OdontogramsService } from './odontograms.service';
import { CreateOdontogramDto } from './dto/create-odontogram.dto';
import { UpdateOdontogramDto } from './dto/update-odontogram.dto';
import { CreateOdontogramFindingDto } from './dto/create-odontogram-finding.dto';
import { UpdateOdontogramFindingDto } from './dto/update-odontogram-finding.dto';

@Controller('odontograms')
export class OdontogramsController {
  constructor(private readonly odontogramsService: OdontogramsService) {}

  @Get()
  findAll() {
    return this.odontogramsService.findAll();
  }

  // Rutas específicas de hallazgos antes de ':id'.

  @Patch('findings/:findingId')
  updateFinding(
    @Param('findingId', ParseIntPipe) findingId: number,
    @Body() updateFindingDto: UpdateOdontogramFindingDto,
  ) {
    return this.odontogramsService.updateFinding(findingId, updateFindingDto);
  }

  @Delete('findings/:findingId')
  removeFinding(@Param('findingId', ParseIntPipe) findingId: number) {
    return this.odontogramsService.removeFinding(findingId);
  }

  @Get(':id/findings')
  findFindings(@Param('id', ParseIntPipe) id: number) {
    return this.odontogramsService.findFindings(id);
  }

  @Post(':id/findings')
  createFinding(
    @Param('id', ParseIntPipe) id: number,
    @Body() createFindingDto: CreateOdontogramFindingDto,
  ) {
    return this.odontogramsService.createFinding(id, createFindingDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.odontogramsService.findOne(id);
  }

  @Post()
  create(@Body() createOdontogramDto: CreateOdontogramDto) {
    return this.odontogramsService.create(createOdontogramDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOdontogramDto: UpdateOdontogramDto,
  ) {
    return this.odontogramsService.update(id, updateOdontogramDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.odontogramsService.remove(id);
  }
}
