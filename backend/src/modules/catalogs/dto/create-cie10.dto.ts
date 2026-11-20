import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateCie10Dto {
  @IsString()
  code!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
