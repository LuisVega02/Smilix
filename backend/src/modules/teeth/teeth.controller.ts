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
import { TeethService } from './teeth.service';
import { CreateToothDto } from './dto/create-tooth.dto';
import { UpdateToothDto } from './dto/update-tooth.dto';

@Controller('teeth')
export class TeethController {
  constructor(private readonly teethService: TeethService) {}

  @Get()
  findAll() {
    return this.teethService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.teethService.findOne(id);
  }

  @Post()
  create(@Body() createToothDto: CreateToothDto) {
    return this.teethService.create(createToothDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateToothDto: UpdateToothDto,
  ) {
    return this.teethService.update(id, updateToothDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.teethService.remove(id);
  }
}
