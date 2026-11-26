# 03 — Auditoría del frontend

**Fecha:** 2026-11-19 — **Alcance:** inspección estática de `frontend/` (Next.js App Router). No se ejecutó build/dev.

## Estado ejecutivo

El frontend es **real y está conectado al backend**: login/registro funcionan contra `/api/auth/*`, y el dashboard navega a **3 módulos implementados** (historia clínica, sesiones médicas, calendario) que consumen la API con CRUD completo. Hay 4 módulos marcados "En desarrollo". La **protección de rutas es solo visual (client-side)**, no real.

## Estructura y navegación

- `page.tsx` (raíz) redirige a `/dashboard` o `/login` según exista `access_token` en `localStorage`.
- `dashboard/page.tsx` es un **menú de 7 módulos**: 3 "Implementado" (con `href`) y 4 "En desarrollo" (abren `DevelopmentModal`).
- Páginas implementadas y conectadas a la API:
  - `historia-clinica` → `GET/POST/PATCH /api/clinical-histories` + upload de foto.
  - `sesiones-medicas` → `GET/POST/PATCH/DELETE /api/medical-sessions`.
  - `calendario` → `GET/POST/PATCH/DELETE /api/appointments`.

## Hallazgos

- [HECHO] Baja — Cliente API centralizado en `utils/api.ts` (añade `Authorization: Bearer` automáticamente, maneja errores, `resolveAssetUrl`). Evidencia: `utils/api.ts`.
- [HECHO] Baja — Login y registro funcionales con estados loading/error y validación básica. Evidencia: `login/page.tsx`, `register/page.tsx`.
- [HECHO] Baja — 3 módulos consumen la API real (fetch vía `apiClient`). Evidencia: `grep apiClient` en `dashboard/*`.
- [RIESGO] Alta — **`ProtectedRoute` solo verifica que exista `access_token` en `localStorage`; no valida el token con el backend.** Como la API no exige JWT, la "protección" es cosmética: borrar/inyectar un token cualquiera abre el dashboard. Evidencia: `components/ProtectedRoute.tsx:42-54`.
- [MEDIO] Media — **Versionado incoherente.** `package.json` declara `next@^14` y `react@^18`, pero el README dice "Next 16 + React 19" y la guía de auth menciona "Next.js 14". El código usa App Router (`next/navigation`), válido en ambas. Evidencia: `package.json`, `README.md`.
- [MEDIO] Baja — **`axios` está como dependencia pero no se usa** (todo es `fetch` vía `apiClient`). Evidencia: `package.json:19`, `utils/api.ts`.
- [MEDIO] Baja — **Estilos:** usa CSS Modules + estilos inline; no se observa Tailwind/shadcn en uso pese a estar en `package.json` (y a que la `guia-rapida.html` los documenta). Evidencia: `*.module.css`, `login/page.tsx` (inline styles).
- [MEDIO] Baja — **`DevelopmentModal` / módulos "En desarrollo"** (Admisión, Odontograma, Plan de tratamiento, WhatsApp) sin página ni API. Evidencia: `dashboard/page.tsx:25-79`.
- [RIESGO] Baja — **Manejo de `JSON.parse(user)`** sin try/catch en dashboard (si `localStorage.user` está corrupto, crashea el render). Evidencia: `dashboard/page.tsx:101`.
- [PARCIAL] Baja — Los 3 módulos implementados no muestran estados "vacío"/"sin datos" robustos en todos los casos (depende de cada página).

## Resumen funcional

| Funcionalidad | Estado |
|---|---|
| Login / registro / logout | ✓ (contra API real) |
| Dashboard + navegación por módulos | ✓ |
| Historia clínica (CRUD + foto) | ✓ |
| Sesiones médicas (CRUD + odontograma/presupuestos) | ✓ |
| Calendario de citas (CRUD) | ✓ |
| Admisión/registro, Odontograma, Plan de tratamiento, WhatsApp | ✗ (roadmap) |
| Protección real de rutas (backend) | ✗ |
