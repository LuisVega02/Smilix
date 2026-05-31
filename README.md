# Sistema de Gestión para Clínica Dental

**Versión 2.0** — Mayo 2026

Una plataforma moderna, modular y escalable para la gestión integral de clínicas dentales, desarrollada con NestJS, Next.js y PostgreSQL, todo containerizado con Docker.

## 🚀 Inicio Rápido

### Requisitos previos

- **Docker Desktop** (Windows/macOS) o **Docker Engine** (Linux)
- **Git**

### Primeros pasos (3 comandos)

```bash
# 1. Clonar el repositorio
git clone https://github.com/LuisVega02/Smilix.git
cd Smilix

# 2. Copiar variables de entorno
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. Levantar todo el entorno
docker compose up -d
```

Luego de esto, accede a:
- **Frontend:** http://localhost:3000
- **Backend (Swagger):** http://localhost:3001/api/docs
- **pgAdmin:** http://localhost:5050

## 📁 Estructura del Proyecto

```
clinic-system/
├── backend/              # API REST (NestJS)
│   ├── src/
│   ├── prisma/           # Esquema y migraciones
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
├── frontend/             # UI Web (Next.js)
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
├── docker/               # Configuraciones Docker adicionales
├── docs/                 # Documentación técnica
├── .github/              # CI/CD workflows
├── docker-compose.yml    # Orquestación de contenedores
└── .gitignore
```

## 🛠️ Tecnologías Principales

| Capa | Tecnología | Versión |
|------|------------|---------|
| Backend | NestJS | 11 |
| Frontend | Next.js + React | 16 + 19 |
| Base de datos | PostgreSQL | 16-alpine |
| ORM | Prisma | v7 |
| Contenedores | Docker | 29+ |
| Gestor de paquetes | pnpm | v10 |

## 📦 Servicios Docker

| Servicio | Contenedor | Puerto | Descripción |
|----------|-----------|--------|-------------|
| PostgreSQL | clinic_postgres | 5432 | Base de datos |
| pgAdmin | clinic_pgadmin | 5050 | Gestor visual de BD |
| Backend | clinic_backend | 3001 | API REST |
| Frontend | clinic_frontend | 3000 | Aplicación web |

## 🔄 Modos de Ejecución

### Desarrollo con hot-reload (recomendado)

```bash
# Terminal 1: Solo base de datos
docker compose up -d postgres pgadmin

# Terminal 2: Backend
cd backend
pnpm install
pnpm start:dev

# Terminal 3: Frontend
cd frontend
pnpm install
pnpm dev
```

### Todo en Docker

```bash
docker compose up -d --build
```

## 📚 Documentación

- [Guía Técnica Completa](../Documentacion/Guia_Proyecto_Clinica_Dental_v2.html)
- [Guía Rápida](../Documentacion/guia-rapida.html)

## 📋 Licencia

MIT

## 👥 Equipo de Desarrollo

Sistema de Gestión para Clínica Dental — Documentado y versionado en Mayo 2026
