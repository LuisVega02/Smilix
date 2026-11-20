import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { SALE_ORDER_STATUSES, SaleOrderStatus } from './sale-order-status';

export class CreateSaleOrderDto {
  @Type(() => Number)
  @IsInt()
  patientId!: number;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  medicalSessionId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  odontogramId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  doctorId?: number;

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
