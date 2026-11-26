import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateOdontogramFindingDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  toothId?: number;

  @IsOptional()
  @IsString()
  toothCode?: string;

  @IsOptional()
  @IsString()
  face?: string;

  @IsOptional()
  @IsString()
  dentition?: string;

  @IsIn(['CONDITION', 'TREATMENT'])
  kind!: 'CONDITION' | 'TREATMENT';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  medicalConditionId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  treatmentCatalogId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  pathologyId?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  cured?: boolean;

  @IsOptional()
  @IsString()
  status?: string;
}
