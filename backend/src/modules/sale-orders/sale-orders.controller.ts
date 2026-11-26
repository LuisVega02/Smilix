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
import { SaleOrdersService } from './sale-orders.service';
import { CreateSaleOrderDto } from './dto/create-sale-order.dto';
import { UpdateSaleOrderDto } from './dto/update-sale-order.dto';
import { QuerySaleOrderDto } from './dto/query-sale-order.dto';
import { CreateSaleOrderLineDto } from './dto/create-sale-order-line.dto';
import { UpdateSaleOrderLineDto } from './dto/update-sale-order-line.dto';
import { CreateInstallmentDto } from './dto/create-installment.dto';
import { UpdateInstallmentDto } from './dto/update-installment.dto';

@Controller('sale-orders')
export class SaleOrdersController {
  constructor(private readonly saleOrdersService: SaleOrdersService) {}

  @Get()
  findAll(@Query() query: QuerySaleOrderDto) {
    return this.saleOrdersService.findAll(query);
  }

  // Rutas específicas antes de ':id'.

  @Post('from-odontogram/:odontogramId')
  createFromOdontogram(@Param('odontogramId', ParseIntPipe) odontogramId: number) {
    return this.saleOrdersService.createFromOdontogram(odontogramId);
  }

  @Patch('lines/:lineId')
  updateLine(
    @Param('lineId', ParseIntPipe) lineId: number,
    @Body() updateLineDto: UpdateSaleOrderLineDto,
  ) {
    return this.saleOrdersService.updateLine(lineId, updateLineDto);
  }

  @Delete('lines/:lineId')
  removeLine(@Param('lineId', ParseIntPipe) lineId: number) {
    return this.saleOrdersService.removeLine(lineId);
  }

  @Patch('installments/:id')
  updateInstallment(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateInstallmentDto: UpdateInstallmentDto,
  ) {
    return this.saleOrdersService.updateInstallment(id, updateInstallmentDto);
  }

  @Delete('installments/:id')
  removeInstallment(@Param('id', ParseIntPipe) id: number) {
    return this.saleOrdersService.removeInstallment(id);
  }

  @Post(':id/lines')
  createLine(@Param('id', ParseIntPipe) id: number, @Body() createLineDto: CreateSaleOrderLineDto) {
    return this.saleOrdersService.createLine(id, createLineDto);
  }

  @Post(':id/installments')
  createInstallment(
    @Param('id', ParseIntPipe) id: number,
    @Body() createInstallmentDto: CreateInstallmentDto,
  ) {
    return this.saleOrdersService.createInstallment(id, createInstallmentDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.saleOrdersService.findOne(id);
  }

  @Post()
  create(@Body() createSaleOrderDto: CreateSaleOrderDto) {
    return this.saleOrdersService.create(createSaleOrderDto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateSaleOrderDto: UpdateSaleOrderDto) {
    return this.saleOrdersService.update(id, updateSaleOrderDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.saleOrdersService.remove(id);
  }
}
