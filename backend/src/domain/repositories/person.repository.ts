import { PersonEntity } from '../entities/person.entity';

/**
 * Contrato de persistencia para personas.
 *
 * Puertos de dominio (interfaz) independientes de Prisma: la implementación
 * concreta vivirá en la capa de infraestructura.
 */
export interface PersonRepository {
  findById(id: number): Promise<PersonEntity | null>;
  findByDocument(docNumber: string): Promise<PersonEntity | null>;
  save(person: PersonEntity): Promise<PersonEntity>;
}
