import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateMedicalConditionDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  dentalAffection?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
