import { PersonEntity } from './person.entity';

/**
 * Médico / odontólogo tratante.
 *
 * Herencia: extiende `PersonEntity` y añade los registros profesionales.
 */
export class PhysicianEntity extends PersonEntity {
  private registerRnp?: string;
  private registerRne?: string;

  constructor(params: {
    id?: number;
    firstName: string;
    lastNameFather: string;
    lastNameMother?: string;
    docNumber?: string;
    email?: string;
    active?: boolean;
    registerRnp?: string;
    registerRne?: string;
  }) {
    super(params);
    this.registerRnp = params.registerRnp;
    this.registerRne = params.registerRne;
  }

  getRegisterRnp(): string | undefined {
    return this.registerRnp;
  }

  getRegisterRne(): string | undefined {
    return this.registerRne;
  }

  /** Polimorfismo: el médico se identifica como 'physician'. */
  personType(): string {
    return 'physician';
  }
}
