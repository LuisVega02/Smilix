# Instrucciones del Workspace

## Alcance

Estas instrucciones aplican a cualquier agente que trabaje en este repositorio.

## Contexto del proyecto

- Proyecto: Smilix, sistema de gestion para clinicas dentales.
- Stack principal:
  - Backend: NestJS en `backend/`
  - Frontend: Next.js App Router en `frontend/`
  - Base de datos: PostgreSQL en Docker
  - ORM: Prisma 7
- Orquestacion local: `docker-compose.yml` en la raiz.

## Regla operativa para levantar un entorno nuevo

Cuando se pida levantar, reconstruir o validar un entorno nuevo, seguir este orden:

1. Trabajar desde la raiz del repo.
2. Levantar contenedores con Docker Compose.
3. Verificar que PostgreSQL, backend y frontend queden arriba.
4. Si hubo cambios en Prisma, correr migraciones y luego regenerar el cliente Prisma dentro del contenedor backend.
5. Validar al menos `GET /api/health`, login y carga basica del frontend.

## Comandos base del entorno

### Levantar todo el entorno

```bash
docker compose up -d --build
```

### Ver contenedores esperados

```bash
docker ps --format '{{.Names}}'
```

Contenedores esperados:

- `clinic_postgres`
- `clinic_pgadmin`
- `clinic_backend`
- `clinic_frontend`

### Ver logs del backend

```bash
docker logs --tail 120 clinic_backend
```

### Ver logs del frontend

```bash
docker logs --tail 120 clinic_frontend
```

## Regla de Prisma 7

- Prisma esta en v7.
- El backend usa `@prisma/adapter-pg` y `pg`.
- `PrismaService` debe construir el cliente con adapter PostgreSQL.
- La configuracion CLI vive en `backend/prisma.config.ts`.
- No asumir el flujo viejo de Prisma 5 o 6.

### Si cambia el esquema Prisma

Ejecutar dentro del contenedor backend:

```bash
docker exec clinic_backend sh -lc "cd /app && pnpm prisma migrate dev --name <nombre_migracion> --config prisma.config.ts"
docker exec clinic_backend sh -lc "cd /app && pnpm prisma generate --config prisma.config.ts"
```

## Regla de backend

- La API expone prefijo global `/api`.
- Health check: `http://localhost:3001/api/health`
- Uploads locales se sirven desde `/uploads`.
- CORS debe contemplar `http://localhost:3000` y `http://127.0.0.1:3000`.

## Regla de frontend

- La URL base del API se centraliza en `frontend/src/app/utils/api.ts`.
- Evitar URLs hardcodeadas en componentes.
- Si se ajusta UX de navegacion, dar feedback visual inmediato durante transiciones.

## Regla del modulo de historia clinica

- La historia clinica vive en el modelo `Patient`; no existe ya un modelo persistente separado para historia.
- `MedicalSession` se relaciona directamente con `patientId`.
- Una historia puede existir sin sesiones medicas.
- Si se crean sesiones, cada una debe incluir:
  - fecha
  - doctor
  - motivo
  - diagnostico
  - plan

## Validaciones minimas despues de cambios relevantes

Despues de tocar backend, entorno o Prisma:

1. Confirmar compilacion limpia del backend.
2. Confirmar `GET /api/health` con respuesta 200.
3. Confirmar login `POST /api/auth/login` con credenciales demo.

Credenciales demo actuales:

- `admin@clinica.com / admin123`
- `doctor@clinica.com / doctor123`

## Git y publicacion

- Este repo se publica en `https://github.com/LuisVega02/Smilix`.
- Al preparar cambios para publicar, versionar tambien migraciones Prisma y archivos `.github/`.
- No versionar `backend/uploads/`, `node_modules/`, ni archivos `.env`.