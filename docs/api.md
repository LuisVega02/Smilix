# API — Smilix

Referencia de los endpoints implementados en el backend NestJS.

## Convenciones

- **Prefijo global:** todas las rutas se publican bajo `/api` (`app.setGlobalPrefix('api')`).
- **Guard global:** `JwtAuthGuard` se aplica con `APP_GUARD`. Toda ruta requiere `Authorization: Bearer <token>` salvo las marcadas con `@Public()`.
- **Contenido:** `Content-Type: application/json` salvo la subida de archivos (`multipart/form-data`).
- **Validación:** `ValidationPipe` global con `transform: true`. Un payload inválido responde `400`.
- **Errores de autenticación:** `401` con `"Token requerido"` (sin header o formato incorrecto) o `"Token inválido"` (firma/expiración).
- **IDs:** enteros (`ParseIntPipe` en los `:id` y `:patientId`).
- **Base URL local:** `http://localhost:3001/api`.

## Resumen por módulo

| Módulo | Método | Ruta | ¿JWT? | Descripción |
|--------|--------|------|-------|-------------|
| Auth | `POST` | `/api/auth/login` | No | Inicia sesión; devuelve `access_token` y datos públicos del usuario (`200`). |
| Auth | `POST` | `/api/auth/register` | No | Crea un usuario con contraseña hasheada, rol `user` y devuelve token (`201`). |
| Auth | `POST` | `/api/auth/verify` | No | Valida un token recibido en el body; responde `{ valid, payload }` o `{ valid: false, error }`. |
| Appointments | `GET` | `/api/appointments` | Sí | Lista citas; acepta `?date=YYYY-MM-DD` o `?weekStart=YYYY-MM-DD`. |
| Appointments | `GET` | `/api/appointments/:id` | Sí | Obtiene una cita con datos básicos del paciente. |
| Appointments | `POST` | `/api/appointments` | Sí | Crea una cita; valida paciente existente y disponibilidad del doctor. |
| Appointments | `PATCH` | `/api/appointments/:id` | Sí | Actualiza parcialmente una cita. |
| Appointments | `DELETE` | `/api/appointments/:id` | Sí | Elimina una cita. |
| Clinical histories | `GET` | `/api/clinical-histories` | Sí | Lista historias clínicas (pacientes con sesiones, odontogramas y presupuestos). |
| Clinical histories | `GET` | `/api/clinical-histories/:id` | Sí | Obtiene una historia clínica por ID de paciente. |
| Clinical histories | `POST` | `/api/clinical-histories` | Sí | Crea una historia clínica (`Patient`) con sesiones anidadas. |
| Clinical histories | `PATCH` | `/api/clinical-histories/:id` | Sí | Actualiza una historia clínica existente. |
| Clinical histories | `POST` | `/api/clinical-histories/upload/patient-photo` | Sí | Sube una foto (`multipart/form-data`, campo `file`; máx. 5 MB; solo imágenes). |
| Medical sessions | `GET` | `/api/medical-sessions` | Sí | Lista todas las sesiones médicas. |
| Medical sessions | `GET` | `/api/medical-sessions/patient/:patientId` | Sí | Lista las sesiones de un paciente. |
| Medical sessions | `GET` | `/api/medical-sessions/:id` | Sí | Obtiene una sesión médica. |
| Medical sessions | `POST` | `/api/medical-sessions` | Sí | Crea una sesión médica. |
| Medical sessions | `PATCH` | `/api/medical-sessions/:id` | Sí | Actualiza una sesión médica. |
| Medical sessions | `DELETE` | `/api/medical-sessions/:id` | Sí | Elimina una sesión médica. |
| Treatments | `GET` | `/api/treatments` | Sí | Lista todos los tratamientos. |
| Treatments | `GET` | `/api/treatments/patient/:patientId` | Sí | Lista los tratamientos de un paciente. |
| Treatments | `GET` | `/api/treatments/:id` | Sí | Obtiene un tratamiento. |
| Treatments | `POST` | `/api/treatments` | Sí | Crea un tratamiento. |
| Treatments | `PATCH` | `/api/treatments/:id` | Sí | Actualiza un tratamiento. |
| Treatments | `DELETE` | `/api/treatments/:id` | Sí | Elimina un tratamiento. |
| Payments | `GET` | `/api/payments` | Sí | Lista todos los pagos. |
| Payments | `GET` | `/api/payments/patient/:patientId` | Sí | Lista los pagos de un paciente. |
| Payments | `GET` | `/api/payments/:id` | Sí | Obtiene un pago. |
| Payments | `POST` | `/api/payments` | Sí | Registra un pago. |
| Payments | `PATCH` | `/api/payments/:id` | Sí | Actualiza un pago. |
| Payments | `DELETE` | `/api/payments/:id` | Sí | Elimina un pago. |
| Health | `GET` | `/api/health` | No | Estado del servidor: `{ status: "ok", timestamp }`. |
| Raíz | `GET` | `/api` | No | Mensaje, versión y estado de la API. |

## Autenticación

### `POST /api/auth/login`

```json
{ "email": "admin@clinica.com", "password": "admin123" }
```

Respuesta `200`:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": 1, "email": "admin@clinica.com", "fullName": "Administrador", "role": "admin" }
}
```

Errores: `401` si las credenciales son incorrectas o el usuario está inactivo; `400` si el DTO no valida (email inválido o contraseña menor a 6 caracteres).

### `POST /api/auth/register`

```json
{ "email": "nuevo@clinica.com", "password": "pass123", "fullName": "Dr. Nuevo" }
```

Respuesta `201` con la misma forma que el login. Errores: `400` si el email ya existe o el payload no valida (`fullName` mínimo 3 caracteres).

### `POST /api/auth/verify`

```json
{ "token": "eyJhbGciOiJIUzI1NiIs..." }
```

Respuesta `200`:

```json
{ "valid": true, "payload": { "sub": 1, "email": "admin@clinica.com", "role": "admin" } }
```

Token inválido o expirado: `200` con `{ "valid": false, "error": "..." }`.

## Ejemplo de llamada protegida

```bash
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@clinica.com","password":"admin123"}' | jq -r .access_token)

curl -X GET http://localhost:3001/api/appointments \
  -H "Authorization: Bearer $TOKEN"
```

## Subida de foto de paciente

```bash
curl -X POST http://localhost:3001/api/clinical-histories/upload/patient-photo \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@foto.jpg"
```

Respuesta:

```json
{ "fileName": "1712345678901-foto.jpg", "relativePath": "/uploads/patient-photos/1712345678901-foto.jpg" }
```

Los archivos se sirven desde `http://localhost:3001/uploads/patient-photos/<archivo>`.

## Notas

- No existe Swagger/OpenAPI en el proyecto; este documento es la referencia mantenida a mano.
- Los roles (`admin`, `doctor`, `user`) se incluyen en el JWT, pero todavía no se aplica autorización por rol: cualquier usuario autenticado puede llamar a los endpoints protegidos.
- Los endpoints de `/api/auth/*` son los únicos de negocio públicos; el resto de módulos exige token por el guard global.
