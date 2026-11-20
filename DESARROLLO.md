# DESARROLLO.md — Bitácora y guía de continuidad de Smilix

> Documento de traspaso para retomar el proyecto desde cualquier máquina o herramienta de IA.
> Última actualización: **2026-11-20** · Rama de trabajo: **TAP_20_11** · Estado: **backend completo (F2–F6), dark theme (F1), despliegue preparado (F7/F8)**.

---

## 1. Resumen

Smilix es un sistema de gestión para clínica dental (SaaS) con:
- **Backend:** NestJS 10 + Prisma 7 (`@prisma/adapter-pg`) + PostgreSQL 16 + JWT + bcryptjs.
- **Frontend:** Next.js 14 (App Router) + React 18 (CSS Modules, tema oscuro "Dental OS").
- **Infra:** Docker Compose (dev) y despliegue QA/producción en **Raspberry Pi 3B+ (ARM64)** con **Tailscale** dentro del stack.
- Arquitectura de datos inspirada en **Odoo HMS**: `Person` (base) + etiquetas, con `Patient`/`Physician` como perfiles.

Repos de referencia Odoo (extraídos localmente, **no** versionados en este repo):
`../odoo/odoo_hms`, `../odoo/odoo_hms_dental`, `../odoo/odoo_financial`.

---

## 2. Cómo levantar en local (Windows + WSL2 + Docker Desktop)

```bash
# En el repo
cp backend/.env.example backend/.env      # si no existe
cp frontend/.env.example frontend/.env    # si no existe

docker compose up -d --build

# Migraciones (el backend dev NO las corre solo; el de producción sí)
docker exec clinic_backend sh -lc "cd /app && pnpm prisma migrate deploy --config prisma.config.ts"

# Seed (usuarios demo + 52 piezas dentales) — idempotente
docker exec clinic_backend sh -lc "cd /app && pnpm seed"
```

URLs:
- Frontend: http://localhost:3000
- API: http://localhost:3001/api · Health: http://localhost:3001/api/health
- pgAdmin: http://localhost:5050

Credenciales demo: `admin@clinica.com / admin123` y `doctor@clinica.com / doctor123`.

> `frontend_prod` está detrás del profile `prod` para no chocar el puerto 3000:
> `docker compose --profile prod up -d frontend_prod`.

---

## 3. Arquitectura del backend

Módulos Nest (todos protegidos por `JwtAuthGuard` global salvo `@Public()`):

| Módulo | Ruta base |
|---|---|
| auth | `/api/auth` (login/register/verify públicos) |
| clinical-history | `/api/clinical-histories` |
| medical-sessions | `/api/medical-sessions` |
| appointments | `/api/appointments` |
| treatments | `/api/treatments` |
| payments | `/api/payments` |
| catalogs (8 controllers) | `/api/cie10`, `/pathologies`, `/conditions`, `/treatment-catalog`, `/procedure-catalog`, `/medications`, `/allergies`, `/exam-types` |
| patient-pathologies | `/api/patient-pathologies` |
| patient-conditions | `/api/patient-conditions` |
| patient-allergies | `/api/patient-allergies` |
| prescriptions | `/api/prescriptions` |
| procedure-acts | `/api/procedure-acts` |
| teeth | `/api/teeth` |
| odontograms | `/api/odontograms` (+ `/odontograms/:id/findings`) |
| sale-orders | `/api/sale-orders` (+ `/:id/lines`, `/:id/installments`, `/from-odontogram/:id`) |

Capa de dominio POO (TypeScript puro, sin Prisma): `backend/src/domain/`
- `entities/person.entity.ts` (abstracta), `patient.entity.ts`, `physician.entity.ts` (herencia/polimorfismo).
- `repositories/person.repository.ts` (puerto de abstracción).

---

## 4. Modelo de datos (Prisma)

**Base/identidad:** `Person`, `PersonTag`, `Facility`, `Physician`, `User`.
**Clínico:** `Patient` (perfil, `personId`), `MedicalSession` (hub), `Appointment`, `Treatment` (instancia), `Odontogram`, `OdontogramFinding`, `PatientPathology`, `PatientCondition`, `PatientAllergy`, `Prescription`, `ProcedureAct`.
**Catálogos:** `Cie10`, `Pathology`, `MedicalCondition`, `TreatmentCatalog`, `ProcedureCatalog`, `Medication`, `Allergy`, `ExamType`, `Tooth`.
**Comercial:** `SaleOrder`, `SaleOrderLine`, `InstallmentPayment`, `Payment`, `MedicalBudget`.

**Flujo clínico → venta:**
`Person(tag patient)` → `Patient` → `MedicalSession` → (`PatientPathology` / `PatientCondition` / `PatientTreatment` / `Prescription`) → `Odontogram` + `OdontogramFinding` → `POST /sale-orders/from-odontogram/:id` → `SaleOrder`/`SaleOrderLine` → cuotas/pagos.

---

## 5. Mapeo Odoo → Smilix (referencia)

| Smilix | Odoo (archivo) |
|---|---|
| `Person` + `PersonTag` | `res.partner` + `res.partner.category` (`odoo_hms/models/res_partner.py`) |
| `Patient` | `medical.patient` (`odoo_hms/models/medical_patient.py`) |
| `Physician` | `medical.physician` (`odoo_hms/models/medical_physician.py`) |
| `MedicalSession` | `odoo_hms.medical_act` (`odoo_hms/models/medical_act.py`) |
| `Pathology` / `PatientPathology` | `odoo_hms.pathologies` / `diagnostic_act` |
| `TreatmentCatalog` / `Treatment` | `odoo_hms.medical_treatments` / `treatments_act` |
| `ProcedureCatalog` / `ProcedureAct` | `odoo_hms.medical_procedures` / `procedures_act` |
| `Tooth` / `Odontogram` | `l10n_pe_dental.teeth` / `medical.odontogram` (`odoo_hms_dental*`) |
| `SaleOrder` / `SaleOrderLine` | `sale.order` / `sale.order.line` (`odoo_hms/models/sale.py`) |
| Caja/POS | `odoo_financial/account_cashbox*`, `hms_ref_pos` |

Ruta local: `C:\Users\Luis Vega\Documents\TAP\SaaS - Clinica Dental\Desarrollo\odoo\`.

---

## 6. Estado por fases

| Fase | Alcance | Estado |
|---|---|---|
| F1 | Dark theme unificado (login, dashboard, módulos) | ✅ |
| F2 | `Person`+tags+`Facility`+`Physician` + POO | ✅ |
| F3 | Catálogos clínicos (8) | ✅ |
| F4 | Flujo clínico (patologías/condiciones/alergias/recetas/procedimientos) | ✅ |
| F5 | Dental: `Tooth` + `OdontogramFinding` + seed 52 piezas | ✅ |
| F6 | Orden de venta + líneas + cuotas + `from-odontogram` | ✅ |
| F7 | Distribución Docker por solución | ⏳ base lista (`deploy/`) |
| F8 | Despliegue RPi 3B+ + Tailscale | ⏳ config lista, falta validar en dispositivo |
| — | **Frontend de módulos nuevos** (catálogos, odontograma, orden de venta) | ❌ pendiente |
| — | Caja/POS (`odoo_financial`) | ❌ pendiente |

---

## 7. Convenciones y gotchas (importante para IA/máquinas nuevas)

1. **Migraciones**: `prisma migrate dev` es **interactivo** y falla en este entorno. Usa:
   ```bash
   # 1) generar SQL desde la BD actual al schema
   docker exec clinic_backend sh -lc 'cd /app && pnpm prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script --config prisma.config.ts > /tmp/m.sql'
   # 2) copiar SIN BOM y deploy
   docker exec clinic_backend sh -lc 'cd /app && pnpm prisma migrate deploy --config prisma.config.ts && pnpm prisma generate --config prisma.config.ts'
   ```
   - **Nunca** escribir el SQL con `Set-Content -Encoding UTF8` de PowerShell 5.1 (añade **BOM** y Postgres falla con `syntax error near "\ufeff"`). Usa `[System.IO.File]::WriteAllLines($path, $lines, (New-Object System.Text.UTF8Encoding($false)))`.
   - Si una migración falla: `prisma migrate resolve --rolled-back <nombre>` y reintentar.
2. **Bind-mount Windows + Next dev**: tras cambios grandes, si aparecen 404 en chunks, para el frontend, borra `frontend/.next` y vuelve a arrancar.
3. **`JWT_SECRET` es obligatorio**: el backend no arranca sin él (compose inyecta un default en dev).
4. **Guard global**: cualquier controlador nuevo queda protegido; usa `@Public()` solo en rutas públicas.
5. **`pnpm install` en el contenedor** puede pedir purga: usa `CI=true pnpm install`.
6. **`tsconfig.node.json`** no existe; ya se eliminó su referencia en `frontend/tsconfig.json` (necesario para `pnpm type-check`).
7. **Token de GitHub**: no se persiste en `.git/config` (se usa inline al hacer push). **Revocarlo** tras usarlo.

---

## 8. Verificación rápida

```bash
# tests backend
docker exec clinic_backend sh -lc "cd /app && CI=true pnpm test"     # 9/9
# type-check frontend
docker exec clinic_frontend sh -lc "cd /app && pnpm type-check"      # limpio
# health
curl http://localhost:3001/api/health
```

Rutas frontend: `/login`, `/register`, `/dashboard`, `/dashboard/historia-clinica`, `/dashboard/sesiones-medicas`, `/dashboard/calendario` → 200.

---

## 9. Despliegue QA/Producción (RPi 3B+ + Tailscale)

Ver **`deploy/README.md`**. Resumen:
```bash
cd deploy
cp .env.prod.example .env.prod   # rellenar TS_AUTHKEY, DB_PASSWORD, JWT_SECRET
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build
```
- Tailscale va como **sidecar**; los servicios comparten su namespace de red (no exponen puertos al host).
- El backend **aplica migraciones al arrancar**.
- Construir imágenes ARM64 desde el PC con `docker buildx --platform linux/arm64`.

---

## 10. Seguridad

- `.env` y `.env.prod` están en `.gitignore` (no versionar secretos).
- Cambiar credenciales demo antes de producción.
- Revocar el token de GitHub usado para clonar/pushear.
- Restringir CORS al dominio/IP de Tailscale.

---

## 11. Control de cambios

| Fecha | Branch | Cambio |
|---|---|---|
| 2026-11-19 | — | Auditoría (docs/auditoria) + fixes P0 (auth real, guard global, ValidationPipe) |
| 2026-11-19 | — | Módulos treatments/payments + tests + CI + documentación alineada |
| 2026-11-19 | — | Refactor visual dashboard "Dental OS" (dark, Ctrl+K, KPIs, RBAC) |
| 2026-11-20 | TAP_20_11 | F1 dark theme global + F2 Person/POO + F3 catálogos + F4 flujo clínico + F5 dental/odontograma + F6 orden de venta + F7/F8 deploy RPi/Tailscale |

---

## 12. Próximos pasos (retomar aquí)

1. **Frontend de módulos nuevos** (prioridad): Odontograma interactivo + Orden de venta, luego catálogos (CIE-10, patologías, condiciones, tratamientos) y actos clínicos (patologías/condiciones/alergias/recetas).
2. **Caja/POS** (`odoo_financial`): sesiones de caja, pagos, cuotas.
3. **Validación real en RPi 3B+**: build ARM64, auth Tailscale, smoke test, backup.
4. **Refinamiento**: reportes/PDF (presupuestos, historia), WhatsApp, roles enum + guard por rol, tests e2e.

> Al retomar: `docker compose up -d`, verificar health, leer este archivo y continuar por el punto 12.
