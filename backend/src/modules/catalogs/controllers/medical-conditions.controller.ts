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
import { MedicalConditionsService } from '../services/medical-conditions.service';
import { CreateMedicalConditionDto } from '../dto/create-medical-condition.dto';
import { UpdateMedicalConditionDto } from '../dto/update-medical-condition.dto';

@Controller('conditions')
export class MedicalConditionsController {
  constructor(private readonly medicalConditionsService: MedicalConditionsService) {}

  @Get()
  findAll() {
    return this.medicalConditionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.medicalConditionsService.findOne(id);
  }

  @Post()
  create(@Body() createMedicalConditionDto: CreateMedicalConditionDto) {
    return this.medicalConditionsService.create(createMedicalConditionDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMedicalConditionDto: UpdateMedicalConditionDto,
  ) {
    return this.medicalConditionsService.update(id, updateMedicalConditionDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.medicalConditionsService.remove(id);
  }
}
