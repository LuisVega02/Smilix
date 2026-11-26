import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateAppointmentDto {
  @Type(() => Number)
  @IsInt()
  patientId!: number;

  @IsString()
  doctorResponsible!: string;

  @IsString()
  startTime!: string;

  @IsString()
  endTime!: string;

  @IsIn(['agendado', 'confirmado', 'finalizada', 'cancelada'])
  status!: 'agendado' | 'confirmado' | 'finalizada' | 'cancelada';

  @IsOptional()
  @IsString()
  notes?: string;
}
