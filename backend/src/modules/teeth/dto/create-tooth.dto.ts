import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateToothDto {
  @IsString()
  name!: string;

  @IsString()
  dentition!: string;

  @IsString()
  type!: string;

  @IsString()
  tooth!: string;

  @IsOptional()
  @IsString()
  face?: string;

  @IsString()
  jaw!: string;

  @Type(() => Number)
  @IsInt()
  order!: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
