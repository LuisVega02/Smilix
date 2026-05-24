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

export interface MedicalSessionDto {
  date: string;
  doctorResponsible: string;
  consultationReason: string;
  diagnosis: string;
  treatmentPlan: string;
}