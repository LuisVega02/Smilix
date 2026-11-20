import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateAllergyDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
