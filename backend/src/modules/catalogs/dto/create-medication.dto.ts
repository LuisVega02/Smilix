import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateMedicationDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  dose?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
