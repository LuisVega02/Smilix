import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateAllergyDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
