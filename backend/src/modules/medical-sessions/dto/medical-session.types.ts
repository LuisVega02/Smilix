export interface OdontogramDto {
  data: string;
  imageUrls?: string[];
}

export interface MedicalBudgetDto {
  title: string;
  description: string;
  totalCost: number;
  status?: 'pending' | 'approved' | 'rejected';
}

export interface MedicalSessionDto {
  patientId: number;
  date: string;
  doctorResponsible: string;
  consultationReason: string;
  diagnosis: string;
  treatmentPlan: string;
  anamnesis?: string;
  medicalHistory?: string;
  odontogram?: OdontogramDto;
  budgets?: MedicalBudgetDto[];
}
