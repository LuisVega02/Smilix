import { MedicalSessionDto } from './medical-session.types';

export interface CreateMedicalSessionDto extends Omit<MedicalSessionDto, 'patientId'> {
  patientId: number;
}
