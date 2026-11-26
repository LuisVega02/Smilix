import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { SALE_ORDER_STATUSES, SaleOrderStatus } from './sale-order-status';

export class UpdateSaleOrderDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  patientId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  medicalSessionId?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  odontogramId?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  doctorId?: number | null;

  @IsOptional()
  @IsIn(SALE_ORDER_STATUSES)
  status?: SaleOrderStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  installmentsCount?: number;
}
