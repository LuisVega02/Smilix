# Arquitectura — Smilix

Documento de arquitectura del estado implementado. No describe funcionalidad futura salvo que se indique explícitamente.

## 1. Vista general

Smilix es un **monolito modular**: un backend NestJS y un frontend Next.js desplegados como servicios separados, con PostgreSQL como base de datos y Docker Compose como orquestador.

```
Navegador
   │  HTTP (fetch)
   ▼
Frontend Next.js 14 (puerto 3000)
   │  REST /api · Authorization: Bearer <JWT>
   ▼
Backend NestJS 10 (puerto 3001)
   │  Controllers → Services → PrismaService
   ▼
Prisma 7 + @prisma/adapter-pg
   │  SQL
   ▼
PostgreSQL 16 (puerto 5432)
```

Servicios de `docker-compose.yml`: `postgres`, `pgadmin`, `backend`, `frontend` (desarrollo) y `frontend_prod` (profile `prod`, comparte el puerto 3000 y por eso no arranca por defecto).

## 2. Capas y módulos del backend

No hay capas `domain`/`application`/`infrastructure`/`presentation` ni repositorios intermedios. Cada módulo funcional sigue el patrón de NestJS:

```
src/modules/<modulo>/
├── <modulo>.module.ts       # declaración del módulo
├── <modulo>.controller.ts   # rutas HTTP y binding de DTOs
├── <modulo>.service.ts      # lógica de negocio y acceso a datos
└── dto/                     # clases con class-validator
```

| Módulo | Responsabilidad | Modelos Prisma principales |
|--------|-----------------|----------------------------|
| `auth` | Login, registro, verificación de JWT | `User` |
| `appointments` | Agenda de citas | `Appointment`, `Patient` |
| `clinical-history` | Historia clínica y carga de fotos | `Patient`, `MedicalSession`, `Odontogram`, `MedicalBudget` |
| `medical-sessions` | Sesiones médicas por paciente | `MedicalSession`, `Patient` |
| `treatments` | Tratamientos por paciente | `Treatment`, `Patient` |
| `payments` | Pagos por paciente | `Payment`, `Patient`, `Treatment` |

Infraestructura transversal:

- `src/prisma/prisma.module.ts`: módulo `@Global` que provee y exporta `PrismaService`.
- `src/prisma/prisma.service.ts`: extiende `PrismaClient`, construye `PrismaPg` con `DATABASE_URL` y conecta en `onModuleInit`.
- `src/common/guards/jwt-auth.guard.ts`: guard JWT global.
- `src/common/decorators/public.decorator.ts`: `@Public()` y la clave `IS_PUBLIC_KEY`.
- `src/app.controller.ts`: `GET /api` y `GET /api/health`, ambos públicos.

`AppModule` importa `PrismaModule`, registra `JwtModule` como global, importa los seis módulos funcionales y declara `JwtAuthGuard` con `APP_GUARD`.

### Frontend

Next.js 14 con App Router:

```
src/app/
├── page.tsx                  # entrada / redirección
├── login/, register/         # públicas
├── dashboard/                # protegidas (calendario, historia-clínica, sesiones-medicas)
├── components/               # ProtectedRoute, DevelopmentModal
└── utils/api.ts              # cliente HTTP centralizado
```

`ProtectedRoute` valida el token con `POST /api/auth/verify`; `apiClient` añade el header `Authorization` y limpia la sesión ante un `401`. Los estilos son CSS Modules y `globals.css` (no hay configuración de Tailwind/shadcn en uso).

## 3. Modelo de datos

8 modelos y 6 enums en `backend/prisma/schema.prisma`.

| Modelo | Tabla | Campos clave | Relaciones |
|--------|-------|--------------|------------|
| `User` | `users` | `email` único, `password` (hash), `fullName`, `role`, `isActive` | Ninguna con datos clínicos |
| `Patient` | `patients` | `documentId` único, datos personales, antecedentes, `status` | 1-N `MedicalSession`, `Appointment`, `Treatment`, `Payment` |
| `MedicalSession` | `medical_sessions` | `date`, `doctorResponsible`, diagnóstico y plan | N-1 `Patient`; 1-1 `Odontogram`; 1-N `MedicalBudget` |
| `Odontogram` | `odontograms` | `data` (texto), `imageUrls` | 1-1 `MedicalSession` (`medicalSessionId` único) |
| `MedicalBudget` | `medical_budgets` | `title`, `totalCost`, `status` | N-1 `MedicalSession` |
| `Appointment` | `appointments` | `startTime`, `endTime`, `status`, `notes` | N-1 `Patient`; N-1 `Treatment` opcional |
| `Treatment` | `treatments` | `type`, `status`, `cost`, `tooth`, `procedure` | N-1 `Patient`; 1-N `Appointment`, `Payment` |
| `Payment` | `payments` | `amount`, `paymentDate`, `method`, `status` | N-1 `Patient`; N-1 `Treatment` opcional |

Reglas relevantes:

- Las relaciones desde `Patient` usan `onDelete: Cascade` para sesiones, citas, tratamientos y pagos.
- `Odontogram` y `MedicalBudget` se eliminan en cascada con su `MedicalSession`.
- `User` está aislado del resto del modelo: no hay FK de `Appointment`/`MedicalSession` a `User`; el doctor se guarda como texto (`doctorResponsible`) y el rol como `String`.
- La historia clínica **es** el `Patient`: el módulo `clinical-history` hace CRUD sobre `patients` e incluye sesiones, odontogramas y presupuestos.

Enums: `ClinicalHistoryStatus` (`DRAFT`, `ACTIVE`, `CLOSED`), `BudgetStatus` (`PENDING`, `APPROVED`, `REJECTED`), `AppointmentStatus` (`SCHEDULED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`, `NO_SHOW`), `TreatmentStatus` (`PENDING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`), `PaymentMethod` (`CASH`, `DEBIT_CARD`, `CREDIT_CARD`, `TRANSFER`, `CHEQUE`) y `PaymentStatus` (`PENDING`, `COMPLETED`, `FAILED`, `REFUNDED`).

Migraciones versionadas (4):

1. `20260524205952_clinical_history_persistence`
2. `20260524213808_patient_history_sessions`
3. `20260525010000_medical_sessions_full`
4. `20260602120000_appointment_doctor`

## 4. Flujo de una petición autenticada

Ejemplo: `GET /api/appointments` con token.

```
1. Frontend
   apiClient.get('/api/appointments')
   → añade Authorization: Bearer <token desde localStorage>

2. Red / CORS
   NestJS valida el origen contra CORS_ORIGIN (por defecto localhost:3000).

3. Prefijo global
   setGlobalPrefix('api') → la ruta efectiva es /api/appointments.

4. ValidationPipe global
   Valida y transforma DTOs/parámetros (transform: true).

5. JwtAuthGuard (APP_GUARD)
   - ¿El handler/clase tiene @Public()? → si sí, continúa sin token.
   - Si no: exige "Bearer <token>", verifica la firma y expiración.
   - Adjunta el payload ({ sub, email, role }) a request.user.
   - Sin token/formato → 401 "Token requerido".
   - Token inválido/expirado → 401 "Token inválido".

6. AppointmentsController
   Recibe la petición y delega en AppointmentsService.

7. AppointmentsService
   Consulta Prisma (findMany con include de paciente) y mapea la respuesta.

8. PrismaService
   PrismaClient con PrismaPg ejecuta SQL contra PostgreSQL.

9. Respuesta
   JSON al frontend. Ante 401, apiClient borra la sesión y redirige a /login.
```

## 5. Decisiones clave

### Prisma 7 con `@prisma/adapter-pg`

- El `datasource` del schema no declara `url`; la conexión se resuelve con `prisma.config.ts` (CLI) y con `PrismaPg` en `PrismaService` (runtime).
- `PrismaService` lanza error si `DATABASE_URL` no está definida y conecta en `onModuleInit`.
- `PrismaModule` es `@Global`, así los servicios no repiten el provider.

### Guard global por defecto (deny by default)

- `JwtAuthGuard` se registra con `APP_GUARD`: cualquier ruta nueva queda protegida automáticamente.
- Abrir una ruta es una decisión explícita mediante `@Public()`.
- El guard usa solo `@nestjs/jwt` (no Passport), lo que reduce dependencias en ejecución.

### Validación global

- `ValidationPipe({ transform: true })` aplica los DTOs en todos los módulos.
- Se omite `whitelist` deliberadamente para no eliminar estructuras anidadas de odontograma/presupuestos.
- Los errores de validación se resuelven con `400` antes de entrar al servicio.

### Seguridad fail-fast

- `JWT_SECRET` se comprueba al cargar `AppModule`; el servidor no arranca sin secreto.
- Contraseñas con bcryptjs (coste 10) y mensajes de login genéricos.
- El token incluye `sub`, `email` y `role`; la autorización por rol aún no está implementada.

### Separación práctica, sin capas ceremoniales

- Controller → Service → Prisma directo, sin repositorios ni entidades de dominio.
- Los servicios concentran reglas como validar paciente existente, solapamiento de agenda o unicidad de `documentId`.
- Los módulos son independientes y se comunican por HTTP desde el frontend, no entre sí.

### Archivos subidos

- `POST /api/clinical-histories/upload/patient-photo` guarda imágenes en `uploads/patient-photos` (máximo 5 MB, solo `image/*`).
- `main.ts` sirve `/uploads` como estático desde `process.cwd()/uploads`.
- En Docker, el volumen `./backend:/app` hace que los archivos persistan en el host.
