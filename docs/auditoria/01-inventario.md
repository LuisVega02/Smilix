# 01 — Inventario del repositorio

**Fecha:** 2026-11-19 — **Repo:** `LuisVega02/Smilix` (rama `main`, commit `1ff662bf`).

## Estructura real (raíz)

```
Smilix/
├── .github/copilot-instructions.md   ← solo esto (NO hay workflows)
├── .gitignore
├── GUIA_AUTENTICACION.md             ← guía de auth (detallada)
├── LICENSE                           ← MIT
├── README.md
├── backend/
│   ├── src/
│   │   ├── main.ts, app.module.ts, app.controller.ts
│   │   ├── prisma/ (prisma.service.ts, prisma.module.ts)  ← @Global
│   │   └── modules/
│   │       ├── auth/           (controller, service, module, dto/login, dto/register)
│   │       ├── appointments/   (controller, service, module, dto/create, dto/update)
│   │       ├── clinical-history/ (controller, service, module, dto/create, dto/update, dto/types)
│   │       └── medical-sessions/ (controller, service, module, dto/create, dto/update, dto/types)
│   ├── prisma/
│   │   ├── schema.prisma       (8 modelos + 6 enums)
│   │   └── migrations/         (4 migraciones)
│   ├── prisma.config.ts
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/app/
│   │   ├── page.tsx (redirect), layout.tsx, globals.css
│   │   ├── login/page.tsx, register/page.tsx
│   │   ├── dashboard/page.tsx (+ dashboard.module.css)
│   │   ├── dashboard/historia-clinica/page.tsx
│   │   ├── dashboard/sesiones-medicas/page.tsx
│   │   ├── dashboard/calendario/page.tsx
│   │   ├── components/ (ProtectedRoute.tsx, DevelopmentModal.tsx)
│   │   └── utils/api.ts
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
└── docker-compose.yml
```

## Lo que NO existe (aunque la documentación lo menciona)

| Recurso | Estado real |
|---|---|
| `docs/` | **No existe** (solo la carpeta que creamos para esta auditoría) |
| `docker/` | **No existe** |
| `.github/workflows/` | **No existe** (solo `copilot-instructions.md`) |
| `backend/src/domain|application|infrastructure|presentation` | **No existen** (arquitectura Clean/DDD de la guía v1.0 no está) |
| Módulos `pacientes`, `citas`, `tratamientos`, `pagos` | **No existen** con esos nombres (sustituidos por `clinical-history`, `appointments`, `medical-sessions`) |
| Tests (`*.spec.ts`, `test/`) | **No existen** |
| Swagger (`@nestjs/swagger`) | **No instalado** |

## Artefactos presentes

- `backend/node_modules`, `backend/dist`, `backend/generated` (no versionados vía `.gitignore`); `frontend/node_modules`, `frontend/.next`.
- Migraciones Prisma versionadas (4). Lockfiles `pnpm-lock.yaml` versionados.

## Inventario de endpoints implementados (backend)

| Módulo | Endpoints reales |
|---|---|
| `app.controller` | `GET /api`, `GET /api/health` |
| `auth` | `POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/verify` |
| `appointments` | `GET/POST /api/appointments`, `GET/PATCH/DELETE /api/appointments/:id` |
| `clinical-histories` | `GET/POST /api/clinical-histories`, `GET/PATCH /api/clinical-histories/:id`, `POST /api/clinical-histories/upload/patient-photo` |
| `medical-sessions` | `GET/POST /api/medical-sessions`, `GET /api/medical-sessions/patient/:patientId`, `GET/PATCH/DELETE /api/medical-sessions/:id` |

**Sin endpoint:** `Treatment` y `Payment` (modelos en schema pero sin módulo), `Patient` (sin CRUD directo; se gestiona vía clinical-history).
