# Guía de autenticación — Smilix

Estado real de la autenticación implementada en el repositorio (verificado contra el código). Sustituye a la guía anterior, que describía usuarios demo en memoria y contraseñas en texto plano.

## 1. Resumen

- La autenticación se valida contra la tabla `users` de PostgreSQL mediante Prisma.
- Las contraseñas se almacenan como hash bcryptjs (coste 10) y se comparan con `bcrypt.compare`.
- El backend emite un JWT con payload `{ sub, email, role }` y expiración de 7 días (`JWT_EXPIRATION`, por defecto `7d`).
- `JwtAuthGuard` es un guard **global** (`APP_GUARD`): toda ruta exige `Authorization: Bearer <token>` salvo las marcadas con `@Public()`.
- `ValidationPipe` global (`transform: true`) valida todos los DTOs.
- `JWT_SECRET` es obligatorio: sin él, el proceso no arranca.
- Los roles se guardan como texto (`admin`, `doctor`, `user`), pero **no hay autorización por rol** todavía.

## 2. Modelo `User`

Definido en `backend/prisma/schema.prisma` y mapeado a la tabla `users`:

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | `Int` | Autoincremental |
| `email` | `String` | Único |
| `password` | `String` | Hash bcrypt; nunca texto plano |
| `fullName` | `String` | Nombre completo |
| `role` | `String` | Por defecto `"user"`; valores usados: `admin`, `doctor`, `user` |
| `isActive` | `Boolean` | Por defecto `true`; un usuario inactivo no puede iniciar sesión |
| `createdAt` / `updatedAt` | `DateTime` | Timestamps |

El seed (`backend/prisma/seed.ts`) crea o actualiza por email:

- `admin@clinica.com` / `admin123` → rol `admin`
- `doctor@clinica.com` / `doctor123` → rol `doctor`

## 3. Estructura del código

### Backend

```
backend/src/
├── app.module.ts                  # JwtModule global + APP_GUARD (JwtAuthGuard)
├── app.controller.ts              # GET /api y GET /api/health (@Public)
├── main.ts                        # prefijo /api + ValidationPipe + CORS
├── common/
│   ├── decorators/public.decorator.ts   # @Public() y IS_PUBLIC_KEY
│   └── guards/jwt-auth.guard.ts         # verificación Bearer
├── prisma/
│   ├── prisma.module.ts           # @Global, exporta PrismaService
│   └── prisma.service.ts          # PrismaClient + PrismaPg
└── modules/auth/
    ├── auth.module.ts
    ├── auth.controller.ts
    ├── auth.service.ts
    └── dto/
        ├── login.dto.ts
        └── register.dto.ts
```

### Frontend

```
frontend/src/app/
├── page.tsx                       # redirección inicial según sesión
├── login/page.tsx                 # POST /api/auth/login
├── register/page.tsx              # POST /api/auth/register
├── dashboard/                     # rutas protegidas
├── components/ProtectedRoute.tsx  # valida el token con POST /api/auth/verify
└── utils/api.ts                   # cliente HTTP que añade el Bearer
```

## 4. Flujo de login

```
POST /api/auth/login          (público)
{ "email": "...", "password": "..." }
        │
        ▼
AuthController.login()
        │  ValidationPipe valida LoginDto (email válido, password ≥ 6)
        ▼
AuthService.login()
        │  1. prisma.user.findUnique({ where: { email } })
        │  2. Si no existe o !isActive → 401 "Email o contraseña inválidos"
        │  3. bcrypt.compare(password, user.password)
        │  4. Si no coincide → 401 (mismo mensaje genérico)
        │  5. jwtService.sign({ sub, email, role })
        ▼
200 OK
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": 1, "email": "...", "fullName": "...", "role": "admin" }
}
```

Notas:

- El mensaje de error es genérico a propósito: no revela si el email existe.
- La respuesta no incluye `password`.
- El login responde `200` (`@HttpCode(HttpStatus.OK)`), no `201`.

El frontend guarda `access_token` y `user` en `localStorage` y redirige a `/dashboard`.

## 5. Flujo de registro

```
POST /api/auth/register       (público)
{ "email": "...", "password": "...", "fullName": "..." }
        │
        ▼
RegisterDto: hereda email/password de LoginDto + fullName (≥ 3 caracteres)
        │
        ▼
AuthService.register()
        │  1. Busca el email; si existe → 400 "Este email ya está registrado"
        │  2. bcrypt.hash(password, 10)
        │  3. prisma.user.create({ ..., role: "user" })
        │  4. Protección adicional contra carrera: error Prisma P2002 → 400
        │  5. Firma JWT y devuelve { access_token, user }
        ▼
201 Created
```

El registro autentica automáticamente al usuario: devuelve token y datos públicos, igual que el login.

## 6. Verificación de token

`POST /api/auth/verify` es público (recibe el token en el body, no en el header):

```json
{ "token": "eyJhbGciOiJIUzI1NiIs..." }
```

- Token válido → `200 { "valid": true, "payload": { "sub": 1, "email": "...", "role": "..." } }`
- Token inválido o expirado → `200 { "valid": false, "error": "..." }` (no lanza 401)

En el frontend, `ProtectedRoute` llama a este endpoint al montar. Si no hay token o `valid !== true`, limpia `localStorage` y redirige a `/login`. La validación real la hace el backend.

## 7. Guard global y `@Public()`

`AppModule` registra el guard para toda la aplicación:

```typescript
providers: [
  { provide: APP_GUARD, useClass: JwtAuthGuard },
],
```

`JwtAuthGuard`:

1. Lee el metadata `isPublic` del handler y de la clase (con `Reflector.getAllAndOverride`).
2. Si `@Public()` está presente, permite la petición sin token.
3. Si no, exige `Authorization: Bearer <token>`; sin header o con formato incorrecto lanza `401 Token requerido`.
4. Verifica el token con `jwtService.verifyAsync`; si falla lanza `401 Token inválido`.
5. Adjunta el payload a `request.user`.

Decorador:

```typescript
import { Public } from '../../common/decorators/public.decorator';

@Public()
@Get('health')
healthCheck() { ... }
```

`@Public()` puede aplicarse a un método o a un controlador completo.

### Rutas públicas actuales

| Método | Ruta |
|--------|------|
| `POST` | `/api/auth/login` |
| `POST` | `/api/auth/register` |
| `POST` | `/api/auth/verify` |
| `GET` | `/api` |
| `GET` | `/api/health` |

### Rutas protegidas

El resto de endpoints de `appointments`, `clinical-histories`, `medical-sessions`, `treatments` y `payments` requiere JWT. No llevan `@Public()` y no necesitan `@UseGuards(JwtAuthGuard)`: el guard global ya se aplica.

Ejemplo:

```bash
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@clinica.com","password":"admin123"}' | jq -r .access_token)

curl http://localhost:3001/api/appointments \
  -H "Authorization: Bearer $TOKEN"
```

## 8. Validación global

En `main.ts`:

```typescript
app.setGlobalPrefix('api');
app.useGlobalPipes(new ValidationPipe({ transform: true }));
```

- `transform: true` convierte los payloads a los tipos declarados en los DTOs (por ejemplo, strings numéricos a `number`).
- No se usa `whitelist` para no descartar payloads anidados de odontograma y presupuestos.
- Los DTOs usan `class-validator`: `@IsEmail`, `@IsString`, `@IsNotEmpty`, `@MinLength`, etc.
- Un payload inválido devuelve `400 Bad Request` antes de llegar al servicio.

## 9. `JWT_SECRET` obligatorio

`app.module.ts` valida la variable al importar el módulo:

```typescript
const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error('JWT_SECRET no está configurada. El servidor no arrancará sin un secreto JWT seguro.');
}
```

No hay valor por defecto en el código. `docker-compose.yml` inyecta `${JWT_SECRET:-your-secret-key-change-in-production}` para desarrollo, pero en producción debe definirse un secreto largo y aleatorio en el entorno.

## 10. Cliente HTTP del frontend

`frontend/src/app/utils/api.ts` centraliza las peticiones:

- Lee `NEXT_PUBLIC_API_URL` (por defecto `http://localhost:3001`).
- Añade `Content-Type: application/json` y `Authorization: Bearer <token>` si existe `access_token` en `localStorage`.
- Si el backend responde `401`, elimina `access_token` y `user` y redirige a `/login` (salvo que ya esté en esa página).
- Expone `get`, `post`, `postFormData`, `put`, `patch`, `delete` y `resolveAssetUrl`.

## 11. Cómo replicar un módulo protegido

Usando como referencia los módulos existentes (por ejemplo `appointments`):

1. **Crear la carpeta y archivos** en `backend/src/modules/<nombre>/`: `<nombre>.module.ts`, `<nombre>.controller.ts`, `<nombre>.service.ts` y `dto/`.
2. **Service**: inyectar `PrismaService`. No hace falta declararlo en el módulo: `PrismaModule` es `@Global`. Acceder a los modelos directamente (`this.prisma.appointment`, `this.prisma.patient`, ...).
3. **Controller**: declarar `@Controller('<ruta>')`. **No** añadir `@Public()` salvo que la ruta deba ser abierta. El guard global ya exige JWT.
4. **DTOs**: usar decoradores de `class-validator`; el `ValidationPipe` global los aplica.
5. **Registrar el módulo** en `imports` de `app.module.ts`.
6. **Frontend**: consumir con `apiClient` desde `@/app/utils/api` usando rutas con prefijo `/api` (el cliente añade el token). Envolver la página en `ProtectedRoute` si es una vista privada.

Esqueleto mínimo:

```typescript
// <nombre>.service.ts
@Injectable()
export class PacientesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.patient.findMany();
  }
}
```

```typescript
// <nombre>.controller.ts
@Controller('pacientes')        // queda en /api/pacientes
export class PacientesController {
  constructor(private readonly pacientesService: PacientesService) {}

  @Get()                        // protegido por el guard global
  findAll() {
    return this.pacientesService.findAll();
  }
}
```

```typescript
// <nombre>.module.ts
@Module({
  controllers: [PacientesController],
  providers: [PacientesService],
})
export class PacientesModule {}
```

```typescript
// app.module.ts
imports: [/* ... */, PacientesModule],
```

## 12. Estado: hecho y pendiente

**Ya implementado**

- Autenticación real contra la tabla `users` con bcryptjs.
- Login, registro y verificación de token.
- `JwtAuthGuard` global vía `APP_GUARD` y decorador `@Public()`.
- `ValidationPipe` global con DTOs validados.
- `JWT_SECRET` obligatorio y JWT de 7 días.
- Seed idempotente de usuarios demo.
- Cliente HTTP del frontend con Bearer y manejo de 401.
- `ProtectedRoute` que valida el token contra `/api/auth/verify`.
- Tests unitarios base (Jest) y workflow de CI.

**Pendiente**

- Refresh tokens y rotación de sesión.
- Roles como enum en `User` y guard de autorización por rol (`@Roles`).
- Swagger/OpenAPI (no instalado; no existe `/api/docs`).
- Tests e2e de autenticación y de rutas protegidas.
- Observabilidad: `LOG_LEVEL` real, healthchecks de las aplicaciones y logs estructurados.
- Manejo proactivo de la expiración del token en el frontend (hoy se resuelve al recibir 401 o al validar en `ProtectedRoute`).

## 13. Pruebas rápidas con curl

```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@clinica.com","password":"admin123"}'

# Registro
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"nuevo@clinica.com","password":"pass123","fullName":"Dr. Nuevo"}'

# Verificar token
curl -X POST http://localhost:3001/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"token":"eyJhbGciOiJIUzI1NiIs..."}'

# Health (GET, público)
curl http://localhost:3001/api/health

# Ruta protegida sin token → 401
curl http://localhost:3001/api/appointments
```

## 14. URLs de desarrollo

```
Frontend:      http://localhost:3000
API:           http://localhost:3001/api
Health:        http://localhost:3001/api/health
PostgreSQL:    localhost:5432
pgAdmin:       http://localhost:5050
```

---

**Última actualización:** 2026-11-19
**Versión:** 2.0
