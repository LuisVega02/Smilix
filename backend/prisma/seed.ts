/**
 * Seed de usuarios iniciales.
 *
 * Uso (dentro del contenedor backend):
 *   pnpm seed
 *
 * Crea o actualiza (upsert por email) los usuarios base del sistema con
 * contraseñas hasheadas usando bcrypt.
 */

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

async function main() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL no esta configurada');
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    const adminPassword = await bcrypt.hash('admin123', 10);
    const doctorPassword = await bcrypt.hash('doctor123', 10);

    await prisma.user.upsert({
      where: { email: 'admin@clinica.com' },
      update: {
        password: adminPassword,
        fullName: 'Administrador',
        role: 'admin',
        isActive: true,
      },
      create: {
        email: 'admin@clinica.com',
        password: adminPassword,
        fullName: 'Administrador',
        role: 'admin',
        isActive: true,
      },
    });

    await prisma.user.upsert({
      where: { email: 'doctor@clinica.com' },
      update: {
        password: doctorPassword,
        fullName: 'Dr. Juan Pérez',
        role: 'doctor',
        isActive: true,
      },
      create: {
        email: 'doctor@clinica.com',
        password: doctorPassword,
        fullName: 'Dr. Juan Pérez',
        role: 'doctor',
        isActive: true,
      },
    });

    console.log('Seed completado: admin@clinica.com y doctor@clinica.com');

    // ------------------------------------------------------------------
    // F5 - Catálogo base de piezas dentales (odontograma)
    // Permanentes (DEFINITIVE): 11-18, 21-28, 31-38, 41-48
    // Temporales (TEMPORAL):    51-55, 61-65, 71-75, 81-85
    // ------------------------------------------------------------------
    const teeth: Array<{
      tooth: string;
      dentition: 'DEFINITIVE' | 'TEMPORAL';
      jaw: 'UPPER' | 'LOWER';
      order: number;
    }> = [];

    const definitiveQuadrants = [
      { start: 1, jaw: 'UPPER' as const },
      { start: 2, jaw: 'UPPER' as const },
      { start: 3, jaw: 'LOWER' as const },
      { start: 4, jaw: 'LOWER' as const },
    ];

    let definitiveOrder = 0;

    for (const { start, jaw } of definitiveQuadrants) {
      for (let position = 1; position <= 8; position += 1) {
        definitiveOrder += 1;
        teeth.push({
          tooth: `${start}${position}`,
          dentition: 'DEFINITIVE',
          jaw,
          order: definitiveOrder,
        });
      }
    }

    const temporalQuadrants = [
      { start: 5, jaw: 'UPPER' as const },
      { start: 6, jaw: 'UPPER' as const },
      { start: 7, jaw: 'LOWER' as const },
      { start: 8, jaw: 'LOWER' as const },
    ];

    let temporalOrder = 0;

    for (const { start, jaw } of temporalQuadrants) {
      for (let position = 1; position <= 5; position += 1) {
        temporalOrder += 1;
        teeth.push({
          tooth: `${start}${position}`,
          dentition: 'TEMPORAL',
          jaw,
          order: temporalOrder,
        });
      }
    }

    for (const item of teeth) {
      await prisma.tooth.upsert({
        where: {
          tooth_dentition: {
            tooth: item.tooth,
            dentition: item.dentition,
          },
        },
        update: {
          name: `Pieza ${item.tooth}`,
          dentition: item.dentition,
          type: 'TOOTH',
          tooth: item.tooth,
          face: null,
          jaw: item.jaw,
          order: item.order,
          active: true,
        },
        create: {
          name: `Pieza ${item.tooth}`,
          dentition: item.dentition,
          type: 'TOOTH',
          tooth: item.tooth,
          face: null,
          jaw: item.jaw,
          order: item.order,
          active: true,
        },
      });
    }

    console.log(`Seed completado: ${teeth.length} piezas dentales base`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error('Error ejecutando el seed:', error);
  process.exitCode = 1;
});
