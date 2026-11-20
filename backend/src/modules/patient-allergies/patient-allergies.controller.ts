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
import { PatientAllergiesService } from './patient-allergies.service';
import { CreatePatientAllergyDto } from './dto/create-patient-allergy.dto';
import { UpdatePatientAllergyDto } from './dto/update-patient-allergy.dto';
import { QueryPatientAllergyDto } from './dto/query-patient-allergy.dto';

@Controller('patient-allergies')
export class PatientAllergiesController {
  constructor(private readonly patientAllergiesService: PatientAllergiesService) {}

  @Get()
  findAll(@Query() query: QueryPatientAllergyDto) {
    return this.patientAllergiesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.patientAllergiesService.findOne(id);
  }

  @Post()
  create(@Body() createPatientAllergyDto: CreatePatientAllergyDto) {
    return this.patientAllergiesService.create(createPatientAllergyDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePatientAllergyDto: UpdatePatientAllergyDto,
  ) {
    return this.patientAllergiesService.update(id, updatePatientAllergyDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.patientAllergiesService.remove(id);
  }
}
