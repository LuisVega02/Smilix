import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateOdontogramFindingDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  toothId?: number | null;

  @IsOptional()
  @IsString()
  toothCode?: string | null;

  @IsOptional()
  @IsString()
  face?: string | null;

  @IsOptional()
  @IsString()
  dentition?: string | null;

  @IsOptional()
  @IsIn(['CONDITION', 'TREATMENT'])
  kind?: 'CONDITION' | 'TREATMENT';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  medicalConditionId?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  treatmentCatalogId?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  pathologyId?: number | null;

  @IsOptional()
  @IsString()
  notes?: string | null;

  @IsOptional()
  @IsBoolean()
  cured?: boolean;

  @IsOptional()
  @IsString()
  status?: string | null;
}
