export class CreateAppointmentDto {
  patientId!: number;
  doctorResponsible!: string;
  startTime!: string;
  endTime!: string;
  status!: 'agendado' | 'confirmado' | 'finalizada' | 'cancelada';
  notes?: string;
}
