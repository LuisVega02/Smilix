export interface PatientProfileDto {
  firstName: string;
  lastName: string;
  nickname?: string;
  documentId: string;
  birthDate?: string;
  age?: number;
  gender?: string;
  address?: string;
  phones: string[];
  email?: string;
  occupation?: string;
  leadSource?: string;
  photoUrl?: string;
}

export interface GuardianDto {
  fullName: string;
  relationship?: string;
  documentId?: string;
  phone?: string;
  email?: string;
  photoUrl?: string;
}

export interface VitalSignsDto {
  bloodPressure?: string;
  heartRate?: string;
  temperature?: string;
  respiratoryRate?: string;
}

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
  date: string;
  doctorResponsible: string;
  consultationReason: string;
  anamnesis?: string;
  medicalHistory?: string;
  diagnosis: string;
  treatmentPlan: string;
  odontogram?: OdontogramDto;
  budgets?: MedicalBudgetDto[];
}