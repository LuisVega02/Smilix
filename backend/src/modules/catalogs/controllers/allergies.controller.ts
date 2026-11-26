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
import { AllergiesService } from '../services/allergies.service';
import { CreateAllergyDto } from '../dto/create-allergy.dto';
import { UpdateAllergyDto } from '../dto/update-allergy.dto';

@Controller('allergies')
export class AllergiesController {
  constructor(private readonly allergiesService: AllergiesService) {}

  @Get()
  findAll() {
    return this.allergiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.allergiesService.findOne(id);
  }

  @Post()
  create(@Body() createAllergyDto: CreateAllergyDto) {
    return this.allergiesService.create(createAllergyDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAllergyDto: UpdateAllergyDto,
  ) {
    return this.allergiesService.update(id, updateAllergyDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.allergiesService.remove(id);
  }
}
