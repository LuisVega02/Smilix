# Despliegue QA/Producción — Smilix en Raspberry Pi 3B+ con Tailscale

Implementación de referencia para correr Smilix en una **Raspberry Pi 3B+** (ARM64, 1 GB RAM)
accesible solo por **Tailscale**, con Tailscale dentro del stack Docker.

## Arquitectura

```
Clientes (PC/móvil) ──Tailscale──▶ [ tailscale (sidecar) ]
                                        ├── postgres   (127.0.0.1:5432)
                                        ├── backend    (127.0.0.1:3001)
                                        └── frontend   (127.0.0.1:3000)
```

- `postgres`, `backend` y `frontend` usan `network_mode: "service:tailscale"`:
  comparten el namespace de red de Tailscale y **no se exponen al host**.
- El acceso externo es por la tailnet: `http://<TS_HOSTNAME>:3000` (MagicDNS) o `http://100.x.y.z:3000`.
- El backend **aplica las migraciones automáticamente** al arrancar.

## Requisitos

- Raspberry Pi 3B+ con **Raspberry Pi OS Lite 64-bit** (o Ubuntu 24.04 arm64).
- Docker Engine + `docker compose` v2.
- **Swap de 1–2 GB** (la RPi tiene 1 GB y el stack es ajustado):
  ```bash
  sudo dphys-swapfile swapoff && sudo sed -i 's/^CONF_SWAPSIZE=.*/CONF_SWAPSIZE=1024/' /etc/dphys-swapfile \
    && sudo dphys-swapfile setup && sudo dphys-swapfile swapon
  ```
- Cuenta de Tailscale + **auth key** (Settings → Keys).

## Construcción de imágenes (recomendado: en tu PC, no en la RPi)

La RPi 3B+ es lenta compilando Next/Nest. Construye para ARM64 desde tu PC:

```bash
# En el PC (con buildx/qemu):
docker buildx build --platform linux/arm64 -t TU_REGISTRY/smilix-backend:prod  ./backend  --push
docker buildx build --platform linux/arm64 -t TU_REGISTRY/smilix-frontend:prod ./frontend --push \
  --build-arg NEXT_PUBLIC_API_URL=http://smilix:3001
```

Luego, en la RPi, apunta `image:` a tu registry (o exporta/importa con `docker save | docker load`).

> Alternativa: `docker compose ... up -d --build` en la propia RPi (funciona, pero tarda mucho la primera vez).

## Despliegue

```bash
cd deploy
cp .env.prod.example .env.prod
# edita .env.prod: TS_AUTHKEY, DB_PASSWORD, JWT_SECRET, NEXT_PUBLIC_API_URL, CORS_ORIGIN
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build
```

Verifica:

```bash
docker compose --env-file .env.prod -f docker-compose.prod.yml ps
docker logs -f smilix_backend      # debe aplicar migraciones y arrancar
```

## Seed inicial (usuarios demo + 52 piezas dentales)

```bash
docker exec smilix_backend sh -lc "node_modules/.bin/ts-node prisma/seed.ts"
```

> Para producción real, crea el administrador con credenciales propias en lugar del seed demo.

## Acceso desde clientes

1. Instala Tailscale en el dispositivo cliente e inicia sesión en la **misma tailnet**.
2. Abre `http://smilix:3000` (si MagicDNS está activo) o `http://<IP-Tailscale>:3000`.
3. Login con las credenciales del seed (o el admin que hayas creado).

## HTTPS (opcional, recomendado para QA con datos reales)

Con Tailscale puedes servir TLS automático:

```bash
docker exec -it smilix_tailscale tailscale serve --bg 3000
# Queda accesible en https://smilix.<tu-tailnet>.ts.net
```

Recuerda alinear `CORS_ORIGIN` y `NEXT_PUBLIC_API_URL` a la URL HTTPS y reconstruir el frontend.

## Backup

```bash
docker exec smilix_postgres pg_dump -U clinicuser clinic_db > backup_$(date +%F).sql
```

## Rendimiento en RPi 3B+ (1 GB)

- Backend y frontend corren en modo producción (sin watch), lo cual es clave.
- Si hay OOM, añade swap y/o limita memoria, por ejemplo:
  ```yaml
  # dentro de cada servicio
  mem_limit: 320m
  ```
  (postgres ~320m, backend ~260m, frontend ~300m, tailscale ~100m; con swap de 1–2 GB va holgado).
- Desactiva telemetría de Next si quieres ahorrar CPU: `NEXT_TELEMETRY_DISABLED=1`.

## Notas / límites

- `network_mode: service:tailscale` implica que los servicios **no** publican puertos al host; todo el tráfico entra por Tailscale. Es intencional (seguridad).
- Firewall del host: deja solo SSH (y nada más) expuesto a la LAN; el resto va por la malla.
- El contenedor `tailscale` guarda su estado en el volumen `tailscale_state`; si lo borras, deberás reautenticar con una nueva auth key.
