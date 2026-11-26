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

# URL pública del backend (se inyecta en el bundle en build-time)
ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Construir la aplicación
RUN pnpm run build

# Asegurar que los chunks estén accesibles desde el directorio de servidor
# Algunos runtimes buscan archivos como `./496.js` junto a `webpack-runtime.js`.
RUN if [ -d .next/server/chunks ]; then cp -a .next/server/chunks/* .next/server/ || true; fi

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

# Comando de inicio (next start sirve el build precompilado)
CMD ["npx", "next", "start"]
