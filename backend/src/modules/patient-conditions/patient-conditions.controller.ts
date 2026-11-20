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
import { PatientConditionsService } from './patient-conditions.service';
import { CreatePatientConditionDto } from './dto/create-patient-condition.dto';
import { UpdatePatientConditionDto } from './dto/update-patient-condition.dto';
import { QueryPatientConditionDto } from './dto/query-patient-condition.dto';

@Controller('patient-conditions')
export class PatientConditionsController {
  constructor(private readonly patientConditionsService: PatientConditionsService) {}

  @Get()
  findAll(@Query() query: QueryPatientConditionDto) {
    return this.patientConditionsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.patientConditionsService.findOne(id);
  }

  @Post()
  create(@Body() createPatientConditionDto: CreatePatientConditionDto) {
    return this.patientConditionsService.create(createPatientConditionDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePatientConditionDto: UpdatePatientConditionDto,
  ) {
    return this.patientConditionsService.update(id, updatePatientConditionDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.patientConditionsService.remove(id);
  }
}
