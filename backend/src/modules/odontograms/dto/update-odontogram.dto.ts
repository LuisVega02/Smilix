import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateOdontogramDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  medicalSessionId?: number;

  @IsOptional()
  @IsString()
  data?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  patientId?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  doctorId?: number | null;

  @IsOptional()
  @IsString()
  scheduledDate?: string | null;
}
