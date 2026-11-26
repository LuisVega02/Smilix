# 00 — Resumen ejecutivo — Smilix

**Fecha:** 2026-11-19
**Alcance:** revisión estática del repo `LuisVega02/Smilix` (clonado en `Desarrollo/Smilix`): backend NestJS+Prisma, frontend Next.js, compose y documentación. No se ejecutaron builds/tests/migraciones ni se consultó la BD. No se leyeron secretos.

## Veredicto

Smilix es un **producto real en v2.0**, muy por encima del esqueleto `clinic-system` auditado antes: tiene 3 módulos de dominio con CRUD completo sobre PostgreSQL/Prisma (historia clínica, sesiones médicas, citas), migraciones reales y un frontend Next.js conectado de extremo a extremo (login → dashboard → 3 módulos). **El mayor problema no es funcional, es de seguridad y de documentación.**

## Avance por capa (estimado)

| Capa | Avance | Nota |
|---|---|---|
| Backend | ~55% | 3/5 módulos de dominio con CRUD real; auth es demo; faltan tratamientos y pagos |
| Frontend | ~50% | Login/register/dashboard + 3 módulos conectados a la API; 4 módulos en roadmap |
| Calidad/seguridad/ops | ~25% | Sin tests, sin CI, sin control de acceso en la API, contraseñas en texto plano |
| Producto integrado | ~45% | Flujo login→dashboard→módulos funciona, pero sin autenticación real en backend |

## Top 5 riesgos

1. **[CRÍTICO] Sin control de acceso.** Ningún endpoint de negocio exige JWT: no hay `@UseGuards`, ni `JwtAuthGuard`, ni estrategia passport. `GET /api/clinical-histories`, `/api/appointments`, `/api/medical-sessions` y el upload devuelven datos clínicos **sin login**. Evidencia: `backend/src/main.ts`, todos los controllers de `backend/src/modules/`, `grep UseGuards` → 0 resultados.
2. **[CRÍTICO] Auth demo en memoria + contraseñas en texto plano.** `auth.service.ts` usa un array `DEMO_USERS` con `password: 'admin123'` literal; `register()` guarda en memoria (se pierde al reiniciar). No usa el modelo `User`/BD ni hashea (no está `bcrypt`). Evidencia: `backend/src/modules/auth/auth.service.ts`.
3. **[ALTO] Sin `ValidationPipe` global.** Los decoradores `class-validator` de `login.dto`/`register.dto` no se ejecutan; los DTOs de dominio (`create-appointment.dto.ts`) ni siquiera tienen decoradores. La validación es manual y parcial. Evidencia: `backend/src/main.ts` (sin `useGlobalPipes`).
4. **[ALTO] Documentación desalineada con el código.** El README declara NestJS 11 / Next 16 / React 19 / Swagger / CI, pero `package.json` dice NestJS 10 (core) / Next 14 / React 18, no hay `@nestjs/swagger` ni workflows. La `guia-rapida.html` describe una arquitectura "Clean Architecture/DDD" (v1.0) que no existe en el código. Ver `06-contraste-con-documentacion.md`.
5. **[MEDIO] `docker compose up -d` entra en conflicto.** `frontend` y `frontend_prod` comparten el puerto host `3000`; el comando del README intenta levantarlos a ambos. Evidencia: `docker-compose.yml`.

## Próximos 3 pasos

1. **Cerrar la seguridad primero:** hashear contraseñas (bcrypt), conectar auth al modelo `User`/BD, y añadir `JwtAuthGuard` global + `ValidationPipe` global antes de exponer la API.
2. **Completar el dominio:** implementar módulos `treatments` y `payments` (los modelos ya existen en el schema), y `patient` CRUD directo.
3. **Alinear documentación y operación:** corregir versiones en README/guias, resolver el conflicto de puerto 3000 en compose, y añadir tests + CI mínimo.

Detalle en `01`–`06`.
