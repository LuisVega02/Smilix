import { Type } from 'class-transformer';
import { IsIn, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePaymentDto {
  @Type(() => Number)
  @IsInt()
  patientId!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  treatmentId?: number;

  @Type(() => Number)
  @IsNumber()
  amount!: number;

  @IsOptional()
  @IsString()
  paymentDate?: string;

  @IsIn(['CASH', 'DEBIT_CARD', 'CREDIT_CARD', 'TRANSFER', 'CHEQUE'])
  method!: 'CASH' | 'DEBIT_CARD' | 'CREDIT_CARD' | 'TRANSFER' | 'CHEQUE';

  @IsOptional()
  @IsIn(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'])
  status?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

  @IsOptional()
  @IsString()
  reference?: string;
}
