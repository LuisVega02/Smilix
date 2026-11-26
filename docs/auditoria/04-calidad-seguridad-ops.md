# 04 — Calidad, seguridad y operación

**Fecha:** 2026-11-19 — **Alcance:** revisión estática de tests, CI, Dockerfiles, compose, entorno y seguridad. No se ejecutó nada.

## Pruebas y CI

- [AUSENTE] Alta — **No hay tests.** Cero `*.spec.ts`, `*.e2e-spec.ts` ni carpeta `test/`. Evidencia: `find backend -name "*.spec.ts"` → vacío.
- [AUSENTE] Media — **No hay CI/CD.** `.github/` solo contiene `copilot-instructions.md` (sin workflows). El README y la guía afirman lo contrario.

## Contenedores y compose

- [HECHO] Baja — Dockerfiles multi-stage con `pnpm@10`, build correcto (`prisma generate` + `nest build`; `next build` + copia de chunks). Evidencia: `backend/Dockerfile`, `frontend/Dockerfile`.
- [HECHO] Baja — `backend` usa `CMD ["node", "dist/main.js"]` coherente con `rootDir: ./src`. ✓
- [RIESGO] Media — **Conflicto de puerto 3000.** `docker-compose.yml` define `frontend` (dev, `pnpm dev`) **y** `frontend_prod`, ambos con `"3000:3000"`. El comando `docker compose up -d` del README intenta levantar ambos → "port already allocated". Evidencia: `docker-compose.yml:70-103`.
- [MEDIO] Media — El compose está en modo **desarrollo** (`command: pnpm start:dev` / `pnpm dev` con bind-mounts `./backend:/app` y `./frontend:/app`). El servicio "producción" real es `frontend_prod`, pero `backend` no tiene equivalente prod separado. Evidencia: `docker-compose.yml`.
- [MEDIO] Baja — Backend comparte `node_modules` del builder (incluye devDependencies) en producción; no se usa `--prod`. Evidencia: `backend/Dockerfile:33`.
- [RIESGO] Media — **Credenciales con fallback en compose**: `DB_PASSWORD:-clinicpass123`, `PGADMIN_PASSWORD:-admin123`, `JWT_SECRET:-your-secret-key-change-in-production`; PostgreSQL (5432) y pgAdmin (5050) expuestos al host. Evidencia: `docker-compose.yml`.

## Seguridad

- [CRÍTICO] Alta — Sin control de acceso (ver `02-backend.md`): ningún endpoint exige JWT.
- [CRÍTICO] Alta — Contraseñas en texto plano y auth en memoria (ver `02-backend.md`).
- [ALTO] Media — Sin `ValidationPipe` global; validación de entrada no cubierta en todos los DTOs.
- [MEDIO] Media — `JWT_SECRET` con fallback hardcodeado en `auth.module.ts`.
- [HECHO] Baja — CORS con allowlist configurable por `CORS_ORIGIN` (default localhost:3000/127.0.0.1:3000). ✓ mejor que el hardcodeo anterior.
- [HECHO] Baja — Upload restringido a imágenes + 5 MB + nombre saneado. ✓ (pero sin auth).
- [RIESGO] Media — `role` como `String` libre (sin enum ni guard de roles) → no hay autorización real por rol.

## Versiones (fuente de verdad: package.json)

| Componente | package.json | README | Dockerfile |
|---|---|---|---|
| NestJS core | `^10` (pero cli/jwt `^11`) | "11" | — |
| Next.js | `^14` | "16" | — |
| React | `^18` | "19" | — |
| pnpm | — | "v10" | `pnpm@10` ✓ |
| Prisma | `^7.8.0` | "v7" ✓ | — |

## Observaciones

- `.env.example` (backend y frontend) está bien documentado, pero documenta `JWT_EXPIRATION`/`LOG_LEVEL` que **no se leen** en el código (`auth.module.ts` hardcodea `7d`; no hay logger configurado).
- `.gitignore` cubre `.env`, `node_modules`, `dist`, `generated`, `uploads` (ver `copilot-instructions.md`). ✓
