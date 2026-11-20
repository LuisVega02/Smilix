# 02 — Auditoría del backend

**Fecha:** 2026-11-19 — **Alcance:** inspección estática de `backend/` (NestJS + Prisma 7). No se ejecutó build/test/migraciones.

## Estado ejecutivo

El backend tiene **3 módulos de dominio con CRUD real sobre PostgreSQL/Prisma** (historia clínica, sesiones médicas y citas), con validación manual y relaciones anidadas. El **módulo de autenticación es una demo en memoria** y, lo más grave, **nada está protegido**: se emite JWT pero ningún endpoint lo exige.

## Arquitectura y cableado

- `app.module.ts` importa `PrismaModule` (@Global), `AuthModule`, `ClinicalHistoryModule`, `MedicalSessionsModule`, `AppointmentsModule`. ✓ correcto.
- `PrismaService` extiende `PrismaClient` y usa `@prisma/adapter-pg` con `DATABASE_URL` (valida que exista). Es el patrón correcto de Prisma 7. Evidencia: `src/prisma/prisma.service.ts`, `prisma.module.ts`.
- `main.ts`: `setGlobalPrefix('api')`, sirve `/uploads`, CORS con allowlist configurable por env. ✓

## Contraste schema ⇄ implementación

| Modelo (schema) | Implementación | Estado |
|---|---|---|
| `User` | `auth.service.ts` NO lo usa; usa array `DEMO_USERS` en memoria | ⚠️ demo |
| `Patient` | `clinical-history.service.ts` CRUD completo (findAll/findOne/create/update) | ✓ |
| `MedicalSession` | `medical-sessions.service.ts` CRUD + por paciente + odontograma/presupuestos anidados | ✓ |
| `Odontogram`, `MedicalBudget` | persistidos de forma anidada vía sessions/history | ✓ (sin endpoints propios) |
| `Appointment` | `appointments.service.ts` CRUD + check de disponibilidad del doctor | ✓ |
| `Treatment` | **Sin módulo/endpoint** | ✗ |
| `Payment` | **Sin módulo/endpoint** | ✗ |

## Hallazgos

- [HECHO] Baja — Schema Prisma completo: 8 modelos + 6 enums, 4 migraciones versionadas. Evidencia: `prisma/schema.prisma`, `prisma/migrations/`.
- [HECHO] Baja — CRUD real sobre Prisma en appointments, clinical-history y medical-sessions, con manejo de errores (`NotFoundException`, `BadRequestException`) y validación manual de payload. Evidencia: `src/modules/*/*.service.ts`.
- [HECHO] Baja — Check de solapamiento de citas por doctor (`assertDoctorAvailability`). Evidencia: `appointments.service.ts:192`.
- [HECHO] Baja — Upload de foto de paciente con `multer`: filtro `image/*`, límite 5 MB, nombre saneado. Evidencia: `clinical-history.controller.ts`.
- [CRÍTICO] Alta — **Sin autenticación en ningún endpoint de negocio.** No hay `@UseGuards`, `JwtAuthGuard`, ni estrategia passport (aunque `@nestjs/passport` y `passport-jwt` están como dependencias). Cualquiera puede leer/crear datos clínicos. Evidencia: `grep -r "UseGuards|JwtAuthGuard|PassportStrategy" src` → 0 resultados.
- [CRÍTICO] Alta — **Auth en memoria con contraseñas en texto plano.** `DEMO_USERS` contiene `password: 'admin123'`/`'doctor123'`; `register()` hace `push` a un array (se pierde al reiniciar) y guarda la contraseña tal cual. No se usa `User` ni `bcrypt`. Evidencia: `auth.service.ts:25-43, 149-157`.
- [ALTO] Media — **Sin `ValidationPipe` global.** `main.ts` no llama `app.useGlobalPipes(...)`, por lo que los `@IsEmail/@MinLength` de los DTOs de auth **no se ejecutan**. Los DTOs de dominio (`create-appointment.dto.ts`, `create-clinical-history.dto.ts`) no tienen decoradores; la validación es manual y no cubre tipos/formato. Evidencia: `main.ts`, `dto/*.ts`.
- [MEDIO] Media — **Secret JWT con fallback hardcodeado.** `JwtModule.register({ secret: process.env.JWT_SECRET || 'super-secret-key-change-this' })`. Evidencia: `auth.module.ts:35-38`.
- [MEDIO] Media — **`register` usa `throw new Error(...)`** que el controller traduce a `BadRequestException`, pero sin código/mensaje tipado consistente. Evidencia: `auth.service.ts:133`, `auth.controller.ts:110-116`.
- [MEDIO] Baja — **Roles sin enforcement.** El JWT lleva `role`, pero no hay guard de roles; `role` es `String` libre en el schema (no enum). Evidencia: `schema.prisma:26`, `auth.service.ts:100`.

## Build (verificado estáticamente)

- `tsconfig.json` define `rootDir: ./src` + `include: ["src/**/*"]` → `nest build` emite `dist/main.js`.
- `Dockerfile` usa `CMD ["node", "dist/main.js"]` ✓ (correcto; a diferencia de `clinic-system`, no hay bug de ruta).
- `Dockerfile` fija `pnpm@10` (evita el problema `ERR_PNPM_IGNORED_BUILDS` de pnpm 12).
- `nest-cli.json` `deleteOutDir: true` ✓.

**Nota de dependencias:** `package.json` mezcla `@nestjs/core@^10` con `@nestjs/cli@^11` y `@nestjs/jwt@^11`; conviene unificar a una sola línea (10 o 11).
