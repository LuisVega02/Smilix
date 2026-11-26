import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateAppointmentDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  patientId?: number;

  @IsOptional()
  @IsString()
  doctorResponsible?: string;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsIn(['agendado', 'confirmado', 'finalizada', 'cancelada'])
  status?: 'agendado' | 'confirmado' | 'finalizada' | 'cancelada';

  @IsOptional()
  @IsString()
  notes?: string;
}
