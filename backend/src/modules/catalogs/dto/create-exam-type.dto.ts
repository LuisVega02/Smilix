import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateExamTypeDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
