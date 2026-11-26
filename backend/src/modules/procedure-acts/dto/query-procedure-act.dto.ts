import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class QueryProcedureActDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  treatmentId?: number;
}
