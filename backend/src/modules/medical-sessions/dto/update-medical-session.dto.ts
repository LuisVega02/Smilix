import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { MedicalBudgetDto, OdontogramDto } from './medical-session.types';

export class UpdateMedicalSessionDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  patientId?: number;

  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsString()
  doctorResponsible?: string;

  @IsOptional()
  @IsString()
  consultationReason?: string;

  @IsOptional()
  @IsString()
  diagnosis?: string;

  @IsOptional()
  @IsString()
  treatmentPlan?: string;

  @IsOptional()
  @IsString()
  anamnesis?: string;

  @IsOptional()
  @IsString()
  medicalHistory?: string;

  // Objetos anidados sin validación estricta para no romper el payload
  // del odontograma ni los presupuestos.
  odontogram?: OdontogramDto;

  budgets?: MedicalBudgetDto[];
}
