import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { MedicalSessionsService } from './medical-sessions.service';
import { CreateMedicalSessionDto } from './dto/create-medical-session.dto';
import { UpdateMedicalSessionDto } from './dto/update-medical-session.dto';

@Controller('medical-sessions')
export class MedicalSessionsController {
  constructor(private readonly medicalSessionsService: MedicalSessionsService) {}

  @Get()
  findAll() {
    return this.medicalSessionsService.findAll();
  }

  @Get('patient/:patientId')
  findByPatient(@Param('patientId', ParseIntPipe) patientId: number) {
    return this.medicalSessionsService.findByPatient(patientId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.medicalSessionsService.findOne(id);
  }

  @Post()
  create(@Body() createMedicalSessionDto: CreateMedicalSessionDto) {
    return this.medicalSessionsService.create(createMedicalSessionDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMedicalSessionDto: UpdateMedicalSessionDto,
  ) {
    return this.medicalSessionsService.update(id, updateMedicalSessionDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.medicalSessionsService.remove(id);
  }
}
