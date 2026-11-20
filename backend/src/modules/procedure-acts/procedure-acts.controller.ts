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
import { ProcedureActsService } from './procedure-acts.service';
import { CreateProcedureActDto } from './dto/create-procedure-act.dto';
import { UpdateProcedureActDto } from './dto/update-procedure-act.dto';
import { QueryProcedureActDto } from './dto/query-procedure-act.dto';

@Controller('procedure-acts')
export class ProcedureActsController {
  constructor(private readonly procedureActsService: ProcedureActsService) {}

  @Get()
  findAll(@Query() query: QueryProcedureActDto) {
    return this.procedureActsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.procedureActsService.findOne(id);
  }

  @Post()
  create(@Body() createProcedureActDto: CreateProcedureActDto) {
    return this.procedureActsService.create(createProcedureActDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProcedureActDto: UpdateProcedureActDto,
  ) {
    return this.procedureActsService.update(id, updateProcedureActDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.procedureActsService.remove(id);
  }
}
