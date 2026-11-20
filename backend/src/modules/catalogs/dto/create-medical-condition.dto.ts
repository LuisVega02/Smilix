import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateMedicalConditionDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsString()
  name!: string;

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
