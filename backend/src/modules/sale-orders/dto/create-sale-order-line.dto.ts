import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateSaleOrderLineDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  pathologyId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  treatmentCatalogId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  treatmentId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  medicalSessionId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  odontogramId?: number;

  @IsOptional()
  @IsString()
  tooth?: string;

  @IsOptional()
  @IsString()
  faces?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  unitPrice?: number;
}
