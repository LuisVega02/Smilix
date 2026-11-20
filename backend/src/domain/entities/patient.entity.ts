import { PersonEntity } from './person.entity';

/**
 * Paciente de la clínica.
 *
 * Herencia: extiende `PersonEntity` y añade los datos propios del paciente
 * (código de historia clínica y notas clínicas).
 */
export class PatientEntity extends PersonEntity {
  private identificationCode: string;
  private clinicalNotes?: string;

  constructor(params: {
    id?: number;
    firstName: string;
    lastNameFather: string;
    lastNameMother?: string;
    docNumber?: string;
    email?: string;
    active?: boolean;
    identificationCode: string;
    clinicalNotes?: string;
  }) {
    super(params);
    this.identificationCode = params.identificationCode;
    this.clinicalNotes = params.clinicalNotes;
  }

  getIdentificationCode(): string {
    return this.identificationCode;
  }

  getClinicalNotes(): string | undefined {
    return this.clinicalNotes;
  }

  /** Polimorfismo: el paciente se identifica como 'patient'. */
  personType(): string {
    return 'patient';
  }
}
