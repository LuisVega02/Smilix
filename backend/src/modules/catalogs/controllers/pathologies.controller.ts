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
import { PathologiesService } from '../services/pathologies.service';
import { CreatePathologyDto } from '../dto/create-pathology.dto';
import { UpdatePathologyDto } from '../dto/update-pathology.dto';

@Controller('pathologies')
export class PathologiesController {
  constructor(private readonly pathologiesService: PathologiesService) {}

  @Get()
  findAll() {
    return this.pathologiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.pathologiesService.findOne(id);
  }

  @Post()
  create(@Body() createPathologyDto: CreatePathologyDto) {
    return this.pathologiesService.create(createPathologyDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePathologyDto: UpdatePathologyDto,
  ) {
    return this.pathologiesService.update(id, updatePathologyDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.pathologiesService.remove(id);
  }
}
