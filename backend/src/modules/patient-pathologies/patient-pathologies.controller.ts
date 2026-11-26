import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PatientPathologiesService } from './patient-pathologies.service';
import { CreatePatientPathologyDto } from './dto/create-patient-pathology.dto';
import { UpdatePatientPathologyDto } from './dto/update-patient-pathology.dto';
import { QueryPatientPathologyDto } from './dto/query-patient-pathology.dto';

@Controller('patient-pathologies')
export class PatientPathologiesController {
  constructor(private readonly patientPathologiesService: PatientPathologiesService) {}

  @Get()
  findAll(@Query() query: QueryPatientPathologyDto) {
    return this.patientPathologiesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.patientPathologiesService.findOne(id);
  }

  @Post()
  create(@Body() createPatientPathologyDto: CreatePatientPathologyDto) {
    return this.patientPathologiesService.create(createPatientPathologyDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePatientPathologyDto: UpdatePatientPathologyDto,
  ) {
    return this.patientPathologiesService.update(id, updatePatientPathologyDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.patientPathologiesService.remove(id);
  }
}
