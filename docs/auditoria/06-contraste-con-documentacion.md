# 06 — Contraste con la documentación existente

**Fecha:** 2026-11-19 — Compara lo que **dice** la documentación contra lo que **hay** en el código.

## Documentación existente analizada

| Documento | Ubicación | Tipo |
|---|---|---|
| `README.md` | raíz del repo | Inicio rápido, stack, estructura, servicios |
| `GUIA_AUTENTICACION.md` | raíz del repo | Flujo de auth, endpoints, replicación |
| `guia-rapida.html` | `Documentacion/` (fuera del repo) | Arquitectura, "cómo crear módulo", mobile |
| `Guia_Proyecto_Clinica_Dental_v2.html` | `Documentacion/` (fuera del repo) | Guía técnica completa (no leída en detalle) |
| `.github/copilot-instructions.md` | repo | Reglas operativas (coherente con el código) ✓ |

## Tabla de discrepancias (doc ⇄ código)

| # | Documento dice | Código real | Severidad |
|---|---|---|---|
| 1 | README: **NestJS 11** | `@nestjs/core@^10` (solo cli/jwt `^11`) | Media |
| 2 | README: **Next 16 + React 19** | `next@^14`, `react@^18` | Media |
| 3 | README: **Backend (Swagger) en `/api/docs`** | No existe `@nestjs/swagger` | Media |
| 4 | README: **`.github/` = "CI/CD workflows"** | Solo `copilot-instructions.md`, sin workflows | Media |
| 5 | README: estructura con **`docs/`, `docker/`** | Ninguna de las dos carpetas existe | Media |
| 6 | README: título de estructura **`clinic-system/`** | El repo es `Smilix` (naming obsoleto) | Baja |
| 7 | README: **`docker compose up -d`** levanta todo | `frontend` y `frontend_prod` comparten puerto 3000 → conflicto | Alta |
| 8 | `guia-rapida.html`: **"Versión 1.0"** | README/package.json dicen **2.0** | Baja |
| 9 | `guia-rapida.html`: **Clean Architecture + DDD** (carpetas domain/application/infrastructure/presentation) | No existen esas carpetas; estructura plana `src/modules/*` | Alta |
| 10 | `guia-rapida.html`: módulos **pacientes/citas/tratamientos/pagos** | Módulos reales: `clinical-history`, `appointments`, `medical-sessions`, `auth` | Alta |
| 11 | `guia-rapida.html`: `this.prisma.db.receta` (PrismaService con `.db`) | `this.prisma.appointment` (PrismaService extiende PrismaClient) | Baja |
| 12 | `guia-rapida.html`: **Tailwind + shadcn/ui** | CSS Modules + inline styles (tailwind en package.json pero sin uso visible) | Baja |
| 13 | `GUIA_AUTENTICACION.md`: **"Backend auth module completamente funcional"** | Auth es demo en memoria (`DEMO_USERS`), no usa BD | Alta |
| 14 | `GUIA_AUTENTICACION.md`: **"DTOs con validación automática"** | Sin `ValidationPipe`; los decoradores no corren | Alta |
| 15 | `GUIA_AUTENTICACION.md`: **"Dashboard protegido"** | Protección solo client-side (localStorage), API abierta | Alta |
| 16 | `GUIA_AUTENTICACION.md`: **"POST /api/health"** | Es `GET /api/health` | Baja |
| 17 | `.env.example`: **`JWT_EXPIRATION`, `LOG_LEVEL`** | No se leen en el código (`7d` hardcodeado, sin logger) | Baja |

## Qué SÍ es correcto en la documentación

- `GUIA_AUTENTICACION.md` **es honesta en su sección "Todavía por hacer"**: lista explícitamente bcrypt, guards, refresh tokens, tests, Swagger y "validar token en cada petición protegida". Esto es exactamente lo que falta. ✓
- Credenciales demo (`admin@clinica.com/admin123`, `doctor@clinica.com/doctor123`) coinciden con `DEMO_USERS`. ✓
- `.github/copilot-instructions.md` describe correctamente la arquitectura real (Prisma 7 + adapter-pg, prefijo `/api`, `PrismaService` con adapter, modelo `Patient` como historia clínica, migraciones). ✓ Es la doc más fiable del repo.
- Dockerfiles y `docker-compose.yml` son coherentes entre sí (pnpm@10, puertos 5432/5050/3001/3000) salvo el conflicto de puerto 3000.

## Conclusión del contraste

La documentación está **desincronizada del código** en dos frentes:

1. **README** exagera el estado (versiones más nuevas de las reales, Swagger y CI que no existen) y tiene estructura obsoleta.
2. **`guia-rapida.html`** describe la **v1.0** (arquitectura Clean/DDD, módulos pacientes/citas/tratamientos/pagos) que fue refactorizada en la v2.0 (módulos clinical-history/appointments/medical-sessions sobre Prisma 7).

La **única documentación fiable y alineada** es `.github/copilot-instructions.md` (operativa) y, parcialmente, `GUIA_AUTENTICACION.md` (que al menos reconoce los pendientes).

**Recomendación:** regenerar README y guías a partir del estado real (esta auditoría `00`–`05` puede servir de base), o al menos corregir los puntos 1–17 de la tabla. El riesgo principal no es técnico sino de **credibilidad**: la doc promete más de lo implementado (versiones, Swagger, CI, auth "funcional").
