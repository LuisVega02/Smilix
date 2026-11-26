import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { MedicalBudgetDto, OdontogramDto } from './medical-session.types';

export class CreateMedicalSessionDto {
  @Type(() => Number)
  @IsInt()
  patientId!: number;

  @IsString()
  date!: string;

  @IsString()
  doctorResponsible!: string;

  @IsString()
  consultationReason!: string;

  @IsString()
  diagnosis!: string;

  @IsString()
  treatmentPlan!: string;

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
