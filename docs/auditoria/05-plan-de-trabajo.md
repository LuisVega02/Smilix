# 05 — Plan de trabajo priorizado

**Fecha:** 2026-11-19 — Estimaciones relativas (S/M/L), no calendario.

## P0 — Seguridad (bloqueante para cualquier uso real)

1. **Conectar auth al modelo `User` y hashear contraseñas.** (L)
   - `auth.service.ts`: sustituir `DEMO_USERS` por `PrismaService`; añadir `bcrypt` (hash al registrar, `compare` al login). Seed de usuarios demo vía migración/script.
2. **Añadir guard de autenticación global.** (M)
   - Crear `JwtAuthGuard` (passport-jwt) y aplicarlo por defecto con `@Public()` para login/register/verify/health. Proteger `appointments`, `clinical-histories`, `medical-sessions` y el upload.
3. **Activar `ValidationPipe` global + DTOs con decoradores.** (M)
   - `main.ts`: `app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))`. Añadir decoradores `class-validator` a `create-appointment.dto`, `create-clinical-history.dto`, `create-medical-session.dto` (hoy son clases/interface sin validar).
4. **Endurecer secretos y config.** (S)
   - Quitar fallbacks hardcodeados (`JWT_SECRET`); validar variables obligatorias al arrancar; `role` como enum + guard de roles si hace falta.

## P1 — Dominio completo

1. **Módulo `treatments`** (CRUD sobre `Treatment`). (M) — modelar servicio/controller/dto, validar `cost` Decimal, relacionar con paciente y citas.
2. **Módulo `payments`** (CRUD sobre `Payment`). (M) — validar `amount`/`method`/`status`, reglas de estado.
3. **CRUD directo de `patients`** (opcional). (M) — hoy el alta se hace vía clinical-history; evaluar si se separa.
4. **Frontend: módulos "En desarrollo"** (Admisión, Odontograma, Plan de tratamiento, WhatsApp). (L) — páginas + conexión a los módulos P1.

## P2 — Calidad y operación

1. **Tests.** (L) — unitarios de servicios (auth, appointments, clinical-history) y e2e básicos; Jest ya está configurado en `package.json`.
2. **CI mínimo.** (M) — workflow GitHub Actions: install + lint + build (backend y frontend) + tests.
3. **Resolver conflicto de puerto 3000 en compose.** (S) — usar `profiles` (p.ej. `dev`/`prod`) o quitar `frontend_prod` del arranque por defecto; separar servicio backend prod.
4. **Alinear documentación.** (S) — corregir versiones (Next 14/React 18, NestJS 10), quitar referencias a Swagger/CI/docs inexistentes, actualizar `guia-rapida.html` a la arquitectura real (o regenerarla).
5. **Observabilidad.** (M) — logging con `LOG_LEVEL`, health/readiness, rate limiting.

## Secuencia sugerida

P0 completo (auth real + guards + validación) **antes** de exponer la API; luego P1 (tratamientos/pagos) y frontend; P2 (tests/CI) para blindar. No desplegar ni exponer datos clínicos reales hasta cerrar P0.

## Trazabilidad de prioridades

- [CRÍTICO] Sin guards ni hashing → P0-1, P0-2.
- [ALTO] Sin ValidationPipe → P0-3.
- [ALTO] Documentación desalineada → P2-4.
- [MEDIO] `docker compose up -d` en conflicto → P2-3.
- [AUSENTE] Tests/CI → P2-1, P2-2.
