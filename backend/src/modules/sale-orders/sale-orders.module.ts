import { Module } from '@nestjs/common';
import { SaleOrdersController } from './sale-orders.controller';
import { SaleOrdersService } from './sale-orders.service';

/**
 * Órdenes de venta odontológicas (F6), inspiradas en sale.order,
 * sale.order.line e installments de Odoo. PrismaService es global
 * (PrismaModule); las rutas quedan protegidas por el JwtAuthGuard global.
 */
@Module({
  controllers: [SaleOrdersController],
  providers: [SaleOrdersService],
})
export class SaleOrdersModule {}
