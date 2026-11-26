# Smilix — Sistema de Gestión para Clínica Dental

**Versión 2.0** — Noviembre 2026

Plataforma para la gestión integral de una clínica dental: autenticación de usuarios, agenda de citas, historia clínica, sesiones médicas, tratamientos y pagos. Backend REST en NestJS, frontend web en Next.js y PostgreSQL, orquestado con Docker Compose.

> Estado: los módulos de backend listados abajo están implementados sobre Prisma. El frontend cubre login, registro, dashboard, calendario e historia clínica/sesiones; las pantallas de admisión, odontograma, plan de tratamiento y WhatsApp están pendientes (ver [Roadmap](#roadmap--pendientes)).

## Stack real

| Capa | Tecnología | Versión |
|------|------------|---------|
| Backend | NestJS | 10 (`@nestjs/core` ^10) |
| Lenguaje | TypeScript | ^5.3 |
| ORM | Prisma + `@prisma/adapter-pg` | 7 |
| Base de datos | PostgreSQL | 16-alpine |
| Autenticación | `@nestjs/jwt` + `bcryptjs` | JWT con expiración de 7 días |
| Frontend | Next.js (App Router) + React | 14 + 18 |
| Estilos | CSS Modules + estilos globales | — |
| Contenedores | Docker Compose | — |
| Gestor de paquetes | pnpm | 10 |

## Inicio rápido

Requisitos: Docker Desktop (Windows/macOS) o Docker Engine (Linux) y Git.

```bash
# 1. Clonar el repositorio
git clone https://github.com/LuisVega02/Smilix.git
cd Smilix

# 2. Crear los archivos de entorno a partir de los ejemplos
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. Construir y levantar los servicios
docker compose up -d --build

# 4. Aplicar las migraciones (con el contenedor backend en ejecución)
docker exec clinic_backend sh -lc "cd /app && pnpm prisma migrate deploy --config prisma.config.ts"

# 5. Cargar los usuarios demo
docker exec clinic_backend sh -lc "cd /app && pnpm seed"
```

Si el backend aún no terminó de arrancar, espera unos segundos y repite los pasos 4 y 5. El paso 4 solo es necesario la primera vez o tras actualizar el repositorio con migraciones nuevas; el paso 5 es idempotente (`upsert` por email).

`docker-compose.yml` trae valores por defecto para las variables de entorno. Para sobreescribirlos (por ejemplo `JWT_SECRET`, `DB_PASSWORD` o `NEXT_PUBLIC_API_URL`), crea un `.env` en la raíz del repositorio; ese archivo no se versiona.

### URLs

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:3000 |
| API REST | http://localhost:3001/api |
| Health check | http://localhost:3001/api/health |
| pgAdmin | http://localhost:5050 |
| PostgreSQL | localhost:5432 |

`JWT_SECRET` es obligatorio: el backend no arranca si no está definido. `docker-compose.yml` inyecta un valor por defecto para desarrollo; en producción define uno propio en el `.env` de la raíz (o en el entorno del despliegue).

## Estructura del repositorio

```
Smilix/
├── backend/                     # API REST (NestJS)
│   ├── prisma/
│   │   ├── schema.prisma        # 8 modelos + 6 enums
│   │   ├── migrations/          # 4 migraciones
│   │   ├── seed.ts              # usuarios demo
│   │   └── ...
│   ├── src/
│   │   ├── main.ts              # prefijo /api, ValidationPipe, CORS, estáticos
│   │   ├── app.module.ts        # JwtModule global + APP_GUARD
│   │   ├── app.controller.ts    # GET /api y GET /api/health (@Public)
│   │   ├── common/
│   │   │   ├── decorators/      # @Public()
│   │   │   └── guards/          # JwtAuthGuard
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── appointments/
│   │   │   ├── clinical-history/
│   │   │   ├── medical-sessions/
│   │   │   ├── treatments/
│   │   │   └── payments/
│   │   └── prisma/              # PrismaModule (@Global) y PrismaService
│   ├── jest.config.js
│   ├── prisma.config.ts
│   ├── Dockerfile
│   └── package.json
├── frontend/                    # UI web (Next.js App Router)
│   ├── src/app/
│   │   ├── page.tsx
│   │   ├── login/
│   │   ├── register/
│   │   ├── dashboard/
│   │   │   ├── calendario/
│   │   │   ├── historia-clinica/
│   │   │   └── sesiones-medicas/
│   │   ├── components/          # ProtectedRoute, DevelopmentModal
│   │   └── utils/api.ts         # cliente HTTP con Bearer token
│   ├── Dockerfile
│   └── package.json
├── docs/
│   ├── arquitectura.md
│   ├── api.md
│   └── auditoria/
├── .github/workflows/ci.yml
├── docker-compose.yml
├── GUIA_AUTENTICACION.md
├── README.md
└── LICENSE
```

## Módulos y endpoints

Todos los endpoints se publican bajo el prefijo `/api` y requieren `Authorization: Bearer <token>` salvo los marcados como públicos.

| Módulo | Endpoints | JWT |
|--------|-----------|-----|
| Auth | `POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/verify` | No (`@Public`) |
| Appointments | `GET /api/appointments`, `POST /api/appointments`, `GET /api/appointments/:id`, `PATCH /api/appointments/:id`, `DELETE /api/appointments/:id` | Sí |
| Clinical histories | `GET /api/clinical-histories`, `POST /api/clinical-histories`, `GET /api/clinical-histories/:id`, `PATCH /api/clinical-histories/:id`, `POST /api/clinical-histories/upload/patient-photo` | Sí |
| Medical sessions | `GET /api/medical-sessions`, `POST /api/medical-sessions`, `GET /api/medical-sessions/patient/:patientId`, `GET /api/medical-sessions/:id`, `PATCH /api/medical-sessions/:id`, `DELETE /api/medical-sessions/:id` | Sí |
| Treatments | `GET /api/treatments`, `POST /api/treatments`, `GET /api/treatments/patient/:patientId`, `GET /api/treatments/:id`, `PATCH /api/treatments/:id`, `DELETE /api/treatments/:id` | Sí |
| Payments | `GET /api/payments`, `POST /api/payments`, `GET /api/payments/patient/:patientId`, `GET /api/payments/:id`, `PATCH /api/payments/:id`, `DELETE /api/payments/:id` | Sí |
| Health | `GET /api/health` | No (`@Public`) |
| Raíz | `GET /api` | No (`@Public`) |

Detalle de métodos, parámetros y respuestas en [docs/api.md](docs/api.md).

## Seguridad

- **Autenticación real contra base de datos**: la tabla `users` almacena email único, hash de contraseña (bcryptjs, coste 10), nombre, rol (`String`, por defecto `user`), estado `isActive` y timestamps.
- **JWT global**: `JwtAuthGuard` se registra con `APP_GUARD` en `AppModule`, por lo que **todas** las rutas exigen un token válido salvo las decoradas con `@Public()`. El token se firma con `{ sub, email, role }` y expira en 7 días (`JWT_EXPIRATION`, por defecto `7d`).
- **Rutas públicas**: `POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/verify`, `GET /api` y `GET /api/health`.
- **Contraseñas**: nunca se devuelven ni se almacenan en texto plano; `login` usa `bcrypt.compare` y `register` guarda `bcrypt.hash(..., 10)`.
- **Validación**: `ValidationPipe` global con `transform: true` valida los DTOs de todos los módulos. No usa `whitelist` para no descartar payloads anidados de odontograma/presupuestos.
- **`JWT_SECRET` obligatorio**: `AppModule` lanza un error al arrancar si la variable no está definida.
- **CORS**: orígenes permitidos configurables con `CORS_ORIGIN` (por defecto `http://localhost:3000` y `http://127.0.0.1:3000`); acepta `Authorization` y credenciales.
- Los roles existen como dato (`admin`, `doctor`, `user`) pero **todavía no hay autorización por rol** (ver roadmap).

## Base de datos

- **8 modelos**: `User`, `Patient`, `MedicalSession`, `Odontogram`, `MedicalBudget`, `Appointment`, `Treatment`, `Payment`.
- **6 enums**: `ClinicalHistoryStatus`, `BudgetStatus`, `AppointmentStatus`, `TreatmentStatus`, `PaymentMethod`, `PaymentStatus`.
- **4 migraciones** en `backend/prisma/migrations/`:
  - `20260524205952_clinical_history_persistence`
  - `20260524213808_patient_history_sessions`
  - `20260525010000_medical_sessions_full`
  - `20260602120000_appointment_doctor`
- La historia clínica se persiste sobre el modelo `Patient` (no existe un modelo `ClinicalHistory` separado): el módulo `clinical-history` hace CRUD sobre `Patient` e incluye sus sesiones, odontogramas y presupuestos.
- El cliente Prisma se conecta con el adaptador `PrismaPg` de `@prisma/adapter-pg`; `DATABASE_URL` es obligatoria.

## Tests y CI

```bash
# Dentro de backend/ (local o contenedor)
pnpm test
```

- **Jest**: 2 suites, 9 tests.
  - `src/modules/auth/auth.service.spec.ts` (5 tests): login correcto, contraseña incorrecta, usuario inactivo, email duplicado y registro con hash.
  - `src/modules/appointments/appointments.service.spec.ts` (4 tests): paciente inexistente, doctor ocupado, creación válida y cita no encontrada.
- **CI**: `.github/workflows/ci.yml` se ejecuta en `push` y `pull_request` a `main` con dos jobs:
  - `backend`: Node 22 + pnpm 10, `prisma generate`, build y tests.
  - `frontend`: Node 22 + pnpm 10, instalación y `next build`.

## Docker: `frontend_prod`

Los servicios por defecto son `postgres`, `pgadmin`, `backend` y `frontend` (desarrollo con `pnpm start:dev` / `pnpm dev` y volúmenes montados).

`frontend_prod` está detrás del profile `prod` para no compartir el puerto 3000 con `frontend` en el arranque habitual:

```bash
# Levantar la variante de producción del frontend
docker compose --profile prod up -d frontend_prod

# Si además quieres el frontend de desarrollo, detén primero el de prod
docker compose stop frontend_prod
```

## Credenciales demo

Creadas por `pnpm seed` (idempotente, con contraseñas hasheadas):

| Rol | Email | Contraseña |
|-----|-------|------------|
| admin | `admin@clinica.com` | `admin123` |
| doctor | `doctor@clinica.com` | `doctor123` |

Cambiar estas credenciales antes de cualquier despliegue real.

## Documentación

- [Guía de autenticación](GUIA_AUTENTICACION.md)
- [Arquitectura](docs/arquitectura.md)
- [API](docs/api.md)
- [Auditoría técnica](docs/auditoria/) (inventario, backend, frontend, calidad y plan de trabajo)

Guías externas (opcional): `../../Documentacion/guia-rapida.html` y `../../Documentacion/Guia_Proyecto_Clinica_Dental_v2.html`. Viven fuera de este repositorio, por lo que pueden no estar presentes en un clon.

## Roadmap / pendientes

- Páginas frontend de admisión, odontograma, plan de tratamiento y WhatsApp.
- Roles como enum en `User` y guard de autorización por rol.
- Refresh tokens (hoy solo access token de 7 días).
- Swagger/OpenAPI (no instalado; **no existe** `/api/docs`).
- Tests e2e además de los unitarios actuales.
- Observabilidad: uso real de `LOG_LEVEL`, healthchecks de las aplicaciones y logs estructurados.

## Licencia

MIT.
