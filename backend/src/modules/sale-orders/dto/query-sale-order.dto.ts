import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional } from 'class-validator';
import { SALE_ORDER_STATUSES, SaleOrderStatus } from './sale-order-status';

export class QuerySaleOrderDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  patientId?: number;

  @IsOptional()
  @IsIn(SALE_ORDER_STATUSES)
  status?: SaleOrderStatus;
}
