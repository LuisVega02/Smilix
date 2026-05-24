# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm@10

# Copiar archivos de definición de dependencias
COPY package.json ./
COPY pnpm-lock.yaml* ./

# Instalar dependencias
RUN pnpm install

# Copiar código fuente
COPY . .

# Construir la aplicación
RUN pnpm run build

# Stage 2: Production
FROM node:22-alpine

WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm@10

# Copiar node_modules y build del stage anterior
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./

# Exponer puerto
EXPOSE 3000

# Comando de inicio
CMD ["pnpm", "start"]
