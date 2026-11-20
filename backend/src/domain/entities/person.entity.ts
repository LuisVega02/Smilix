/**
 * Entidad base de dominio "Persona".
 *
 * Capa de dominio en TypeScript puro: NO conoce Prisma, HTTP ni NestJS.
 * Inspirada en `res.partner` de Odoo: agrupa los datos comunes a cualquier
 * persona (paciente, médico, tutor, etc.).
 *
 * Demuestra:
 * - Abstracción: clase abstracta con contrato `personType()`.
 * - Encapsulamiento: estado en campos `protected`.
 */
export abstract class PersonEntity {
  protected id?: number;
  protected firstName: string;
  protected lastNameFather: string;
  protected lastNameMother?: string;
  protected docNumber?: string;
  protected email?: string;
  protected active: boolean;

  constructor(params: {
    id?: number;
    firstName: string;
    lastNameFather: string;
    lastNameMother?: string;
    docNumber?: string;
    email?: string;
    active?: boolean;
  }) {
    this.id = params.id;
    this.firstName = params.firstName;
    this.lastNameFather = params.lastNameFather;
    this.lastNameMother = params.lastNameMother;
    this.docNumber = params.docNumber;
    this.email = params.email;
    this.active = params.active ?? true;
  }

  /** Nombre completo normalizado (nombres + apellidos, sin espacios sobrantes). */
  fullName(): string {
    return [this.firstName, this.lastNameFather, this.lastNameMother]
      .filter((part): part is string => Boolean(part && part.trim()))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /** Indica si la persona está habilitada/activa. */
  isActive(): boolean {
    return this.active;
  }

  getId(): number | undefined {
    return this.id;
  }

  getDocNumber(): string | undefined {
    return this.docNumber;
  }

  getEmail(): string | undefined {
    return this.email;
  }

  /** Tipo concreto de persona; cada subclase lo resuelve (polimorfismo). */
  abstract personType(): string;
}
