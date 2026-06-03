// Guía de Autenticación - Clínica Dental

# 🔐 SISTEMA DE AUTENTICACIÓN - GUÍA COMPLETA

## 📋 TABLA DE CONTENIDOS
1. [Arquitectura General](#arquitectura)
2. [Flujo de Login](#flujo-login)
3. [Flujo de Registro](#flujo-registro)
4. [Estructura del Código](#estructura)
5. [Cómo Replicar en Otros Módulos](#replicar)
6. [URLs y Endpoints](#urls)

---

## 🏗️ ARQUITECTURA

### Backend (NestJS)
```
/backend/src/modules/auth/
├── auth.module.ts          ← Configuración del módulo
├── auth.controller.ts       ← Manejo de rutas HTTP
├── auth.service.ts          ← Lógica de negocio
│
└── dto/
    ├── login.dto.ts         ← Validación de login
    └── register.dto.ts      ← Validación de registro
```

### Frontend (Next.js)
```
/frontend/src/app/
├── page.tsx                 ← Redirección inicial
├── login/page.tsx           ← Página de login
├── register/page.tsx        ← Página de registro
├── dashboard/page.tsx       ← Página protegida
│
├── components/
│   └── ProtectedRoute.tsx   ← Guard para rutas
│
└── utils/
    └── api.ts               ← Cliente HTTP
```

---

## 🔄 FLUJO DE LOGIN

### 1️⃣ Usuario llega a http://localhost:3000

```
Home Component (page.tsx)
  ↓
  ¿Existe token en localStorage?
  ├─ SÍ → Ver /dashboard
  └─ NO → Ver /login
```

### 2️⃣ Usuario ingresa credenciales en /login

1. Usuario completa email y contraseña
2. Click en "Ingresar"
3. Frontend valida:
   - Email no vacío
   - Contraseña no vacía
   - Email tiene formato válido

### 3️⃣ Frontend envía petición al backend

```javascript
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "email": "admin@clinica.com",
  "password": "admin123"
}
```

### 4️⃣ Backend verifica credenciales

```
Backend recibe petición
  ↓
Busca usuario en BD (o en DEMO_USERS)
  ↓
¿Credenciales correctas?
  ├─ SÍ → Generar JWT token
  │        Devolver: { access_token, user }
  │
  └─ NO → Devolver error 401
           "Credenciales inválidas"
```

### 5️⃣ Frontend recibe respuesta

**Caso exitoso (200 OK):**
```javascript
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1",
    "email": "admin@clinica.com",
    "fullName": "Admin User",
    "role": "admin"
  }
}
```

**Caso error (401 Unauthorized):**
```javascript
{
  "statusCode": 401,
  "message": "Credenciales inválidas"
}
```

### 6️⃣ Frontend guarda datos

Si login exitoso:
```javascript
localStorage.setItem('access_token', data.access_token);
localStorage.setItem('user', JSON.stringify(data.user));

// Redirigir
router.push('/dashboard');
```

Si login fallido:
```javascript
mostrar error en UI
limpiar contraseña
permitir reintentar
```

---

## 📝 FLUJO DE REGISTRO

```
Usuario en /register
  ↓
Completa: nombre, email, password, confirmar password
  ↓
Frontend valida:
  - Email válido
  - Contraseña >= 6 caracteres
  - Passwords coinciden
  ↓
POST /api/auth/register
  ↓
Backend crea usuario en BD
  ↓
Backend autentica automáticamente
  ↓
Devuelve: { access_token, user }
  ↓
Frontend guarda token y redirige a dashboard
```

---

## 📂 ESTRUCTURA DEL CÓDIGO

### Backend: auth.controller.ts

```typescript
// 3 rutas principales

POST /api/auth/login
  Input: { email, password }
  Output: { access_token, user }

POST /api/auth/register
  Input: { email, password, fullName }
  Output: { access_token, user }

POST /api/auth/verify
  Input: { token }
  Output: { valid: boolean, payload }
```

### Frontend: login/page.tsx

```typescript
// Estados
- email: string
- password: string
- error: string
- isLoading: boolean

// Funciones
- handleLogin(e): Enviar credenciales
- handleRegister(): Ir a /register

// Validaciones
- Email y password no vacíos
- Email formato válido
```

### Frontend: dashboard/page.tsx

```typescript
// Effect al cargar:
¿Existe token en localStorage?
  ├─ NO → Redirigir a /login
  └─ SÍ → Cargar datos del usuario

// Funciones
- handleLogout(): Limpiar localStorage + redirigir
```

---

## 🔁 CÓMO REPLICAR EN OTROS MÓDULOS

### PASO 1: Crear estructura de carpetas

```bash
mkdir -p src/modules/pacientes/dto
mkdir -p src/modules/pacientes/

touch src/modules/pacientes/pacientes.module.ts
touch src/modules/pacientes/pacientes.controller.ts
touch src/modules/pacientes/pacientes.service.ts
touch src/modules/pacientes/dto/create-paciente.dto.ts
touch src/modules/pacientes/dto/update-paciente.dto.ts
```

### PASO 2: Copiar patrón de DTOs

**De auth.service.ts, copiar:**
- Decoradores de validación (@IsEmail, @IsString, etc.)
- Estructura de DTOs
- Comentarios explicativos

```typescript
// ANTERIOR (Auth)
@IsEmail()
email: string;

// NUEVO (Pacientes)
@IsString()
nombre: string;

@IsEmail()
email_paciente: string;
```

### PASO 3: Crear Service con misma estructura

```typescript
// PATRÓN REPLICADO

export class PacientesService {
  /**
   * CRUD básicas
   */
  async create(createPacienteDto: CreatePacienteDto) {
    // Lógica: guardar en BD
  }

  async findAll() {
    // Lógica: obtener todos
  }

  async findOne(id: string) {
    // Lógica: obtener por ID
  }

  async update(id: string, updatePacienteDto: UpdatePacienteDto) {
    // Lógica: actualizar
  }

  async delete(id: string) {
    // Lógica: eliminar
  }
}
```

### PASO 4: Crear Controller con misma estructura

```typescript
// PATRÓN REPLICADO

@Controller('api/pacientes')
export class PacientesController {
  constructor(private readonly pacientesService: PacientesService) {}

  @Post()
  create(@Body() createPacienteDto: CreatePacienteDto) {
    return this.pacientesService.create(createPacienteDto);
  }

  @Get()
  findAll() {
    return this.pacientesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pacientesService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updatePacienteDto) {
    return this.pacientesService.update(id, updatePacienteDto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.pacientesService.delete(id);
  }
}
```

### PASO 5: Importar en app.module.ts

```typescript
import { PacientesModule } from './modules/pacientes/pacientes.module';

@Module({
  imports: [AuthModule, PacientesModule], // ← Agregado
})
export class AppModule {}
```

### PASO 6: Frontend - Crear página con mismo patrón

```typescript
// PATRÓN: Login de la guía
// NUEVO: Página de pacientes

'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/app/utils/api';
import ProtectedRoute from '@/app/components/ProtectedRoute';

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarPacientes();
  }, []);

  const cargarPacientes = async () => {
    try {
      const data = await apiClient.get('/api/pacientes');
      setPacientes(data);
    } catch (err) {
      setError('Error al cargar pacientes');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      {/* Contenido protegido */}
    </ProtectedRoute>
  );
}
```

---

## 🌐 URLs Y ENDPOINTS

### Backend

| Método | Endpoint | Autenticación | Descripción |
|--------|----------|---------------|-------------|
| POST | /api/auth/login | NO | Iniciar sesión |
| POST | /api/auth/register | NO | Crear cuenta |
| POST | /api/auth/verify | NO | Validar token |
| GET | /api/health | NO | Estado del servidor |

### Frontend

| Ruta | Autenticación | Descripción |
|------|---------------|-------------|
| / | NO (redirige) | Home - Redirección |
| /login | NO | Página de login |
| /register | NO | Página de registro |
| /dashboard | **SÍ** | Dashboard privado |

### URLs de Desarrollo

```
Frontend:     http://localhost:3000
Backend API:  http://localhost:3001
Base de datos: localhost:5432
pgAdmin:      http://localhost:5050
```

### Credenciales de Prueba

```
👨‍💼 ADMIN
Email:    admin@clinica.com
Password: admin123
Rol:      admin

👨‍⚕️ DOCTOR
Email:    doctor@clinica.com
Password: doctor123
Rol:      doctor
```

---

## 🔍 FLUJO COMPLETO (Paso a Paso)

```
1. usuario abre http://localhost:3000
   ↓
2. Frontend verifica: ¿Existe access_token en localStorage?
   ├─ NO → Redirige a /login
   │
3. Usuario ingresa admin@clinica.com y admin123
   ├─ Click "Ingresar"
   │
4. Frontend valida y envía POST a http://localhost:3001/api/auth/login
   ├─ Backend busca usuario
   ├─ Verifica contraseña
   ├─ Genera JWT token (7 días de validez)
   │
5. Backend devuelve:
   {
     "access_token": "eyJhbGc...",
     "user": { "id": "1", "email": "admin@clinica.com", ... }
   }
   │
6. Frontend guarda en localStorage:
   ├─ access_token (para autenticación futura)
   ├─ user (para mostrar en UI)
   │
7. Frontend redirige a /dashboard
   │
8. Dashboard verifica: ¿Existe token?
   ├─ SÍ → Mostrar dashboard
   │
9. Usuario ve bienvenida personalizada
   │
10. Cuando usuario hace logout:
    ├─ Borra access_token de localStorage
    ├─ Borra user de localStorage
    ├─ Redirige a /login

SIGUIENTE LOGIN: token ya está en localStorage
                  ✓ Usuario va directo a /dashboard
```

---

## 🛠️ HERRAMIENTAS ÚTILES

### Pruebas de endpoints (sin frontend)

```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@clinica.com","password":"admin123"}'

# Registro
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"new@clinica.com","password":"pass123","fullName":"Dr. Nuevo"}'

# Verificar token
curl -X POST http://localhost:3001/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"token":"eyJhbGc..."}'
```

### Ver localStorage en navegador

```javascript
// F12 → Console

// Ver token
localStorage.getItem('access_token')

// Ver usuario
JSON.parse(localStorage.getItem('user'))

// Limpiar todo
localStorage.clear()
```

---

## 📝 NOTAS IMPORTANTES

✅ **Ya está hecho:**
- Backend auth module completamente funcional
- DTOs con validación automática
- JWT tokens con 7 días de expiración
- Frontend login y registro
- Dashboard protegido
- API client centralizado
- ProtectedRoute component

⚠️ **Todavía por hacer:**
- Password hashing con bcrypt (en producción)
- Guards de rutas en backend (@UseGuards)
- Refresh tokens
- Tests unitarios
- Swagger documentation
- Validar token en cada petición protegida
- Manejo de expiración de token en frontend

---

## 🎓 PATRÓN DE REPLICACIÓN

**Para crear CUALQUIER nuevo módulo:**

1. Copiar estructura de carpetas de `auth/`
2. Actualizar nombres (auth → pacientes)
3. Copiar comentarios (enseña el patrón)
4. Adaptar lógica al nuevo módulo
5. Importar en app.module.ts
6. Crear página en frontend con ProtectedRoute
7. Usar apiClient para comunicarse

¡Cada módulo sigue la misma estructura! 🎯

---

**Última actualización:** 2026-05-09
**Versión:** 2.0 Beta
**Estado:** 🟢 Funcional
