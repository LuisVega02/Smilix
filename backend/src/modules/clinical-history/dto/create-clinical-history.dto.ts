import {
  GuardianDto,
  MedicalSessionDto,
  PatientProfileDto,
} from './clinical-history.types';

export interface CreateClinicalHistoryDto {
  patient: PatientProfileDto;
  guardian?: GuardianDto | null;
  anamnesis: string;
  medicalBackground: string;
  prenatalBackground: string;
  postnatalBackground: string;
  oralHabits: string;
  dentalDevelopment: string;
  attachments: string[];
  radiographs: string[];
  patientPhotos: string[];
  sessions: MedicalSessionDto[];
  status?: 'draft' | 'active' | 'closed';
}