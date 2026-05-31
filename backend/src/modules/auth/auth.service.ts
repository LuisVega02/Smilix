/**
 * Servicio de Autenticación (auth.service.ts)
 * 
 * RESPONSABILIDADES:
 * - Validar credenciales del usuario
 * - Crear y verificar tokens JWT
 * - Hashear contraseñas
 * - Interactuar con la base de datos de usuarios
 * 
 * FLUJO DE LOGIN:
 * 1. Usuario envía email + password
 * 2. Service busca el usuario en BD por email
 * 3. Service compara password con hash almacenado
 * 4. Si es correcto, genera JWT token
 * 5. Frontend guarda el token y lo usa en futuras peticiones
 */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

// Para DEMOSTRACIÓN, simulamos usuarios en memoria
// En producción, usarías PrismaService para acceder a la BD real
const DEMO_USERS = [
  {
    id: 1,
    email: 'admin@clinica.com',
    // Password: "admin123" hasheado (en demo, es texto plano)
    password: 'admin123',
    fullName: 'Administrador',
    role: 'admin',
    isActive: true,
  },
  {
    id: 2,
    email: 'doctor@clinica.com',
    password: 'doctor123',
    fullName: 'Dr. Juan Pérez',
    role: 'doctor',
    isActive: true,
  },
];

@Injectable()
export class AuthService {
  /**
   * Constructor: Inyectamos las dependencias
   * 
   * @param jwtService - Servicio de JWT para crear y verificar tokens
   * 
   * Inyección de dependencias es un patrón que:
   * - Hace el código testeable
   * - Desacopla componentes
   * - Facilita el mantenimiento
   */
  constructor(private readonly jwtService: JwtService) {}

  /**
   * LOGIN - Autentica un usuario y devuelve un token JWT
   * 
   * FLUJO:
   * 1. Recibe email y password del usuario
   * 2. Busca el usuario en la BD
   * 3. Valida la contraseña
   * 4. Genera un JWT token con la información del usuario
   * 5. Devuelve el token al frontend
   * 
   * @param loginDto - {email, password}
   * @returns {access_token, user} - Token JWT y datos del usuario
   * 
   * @throws UnauthorizedException - Si email/password son incorrectos
   */
  async login(loginDto: LoginDto) {
    // PASO 1: Buscar usuario por email
    const user = DEMO_USERS.find((u) => u.email === loginDto.email);

    // PASO 2: Verificar que el usuario existe
    if (!user) {
      // NO decir "usuario no existe" por seguridad
      // Es mejor un mensaje genérico
      throw new UnauthorizedException('Email o contraseña inválidos');
    }

    // PASO 3: Verificar que la contraseña es correcta
    // EN PRODUCCIÓN: usar bcryptjs.compare(loginDto.password, user.password)
    // Aquí lo hacemos simple para la demo
    if (user.password !== loginDto.password) {
      throw new UnauthorizedException('Email o contraseña inválidos');
    }

    // PASO 4: Generar JWT Token
    // El token contiene:
    // - id: identificador único del usuario
    // - email: email del usuario
    // - sub: "subject" (estándar JWT) = id del usuario
    const access_token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    // PASO 5: Devolver token e info del usuario (SIN contraseña)
    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }

  /**
   * REGISTRAR - Crea un nuevo usuario en el sistema
   * 
   * FLUJO:
   * 1. Valida que el email no esté registrado
   * 2. Hashea la contraseña
   * 3. Crea el usuario en la BD
   * 4. Devuelve el token (login automático)
   * 
   * @param registerDto - {email, password, fullName}
   * @returns {access_token, user} - Token JWT
   * 
   * @throws BadRequestException - Si el email ya existe
   */
  async register(registerDto: RegisterDto) {
    // PASO 1: Verificar que el email no esté registrado
    const existingUser = DEMO_USERS.find((u) => u.email === registerDto.email);
    if (existingUser) {
      throw new Error('Este email ya está registrado');
    }

    // PASO 2: En producción, hashear la contraseña
    // const hashedPassword = await bcryptjs.hash(registerDto.password, 10);

    // PASO 3: Crear nuevo usuario en BD
    // const newUser = await this.prisma.user.create({
    //   data: {
    //     email: registerDto.email,
    //     password: hashedPassword,
    //     fullName: registerDto.fullName,
    //   },
    // });

    // Para demo, simulamos...
    const newUser = {
      id: DEMO_USERS.length + 1,
      email: registerDto.email,
      password: registerDto.password, // NO HACER EN PRODUCCIÓN
      fullName: registerDto.fullName,
      role: 'user',
      isActive: true,
    };
    DEMO_USERS.push(newUser);

    // PASO 4: Generar y devolver token
    const access_token = this.jwtService.sign({
      sub: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    return {
      access_token,
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        role: newUser.role,
      },
    };
  }

  /**
   * VALIDAR TOKEN - Verifica que un token JWT sea válido
   * 
   * Se usa en los Guards para proteger rutas
   * 
   * @param token - Token JWT
   * @returns payload - Datos decodificados del token {sub, email, role}
   * 
   * @throws UnauthorizedException - Si el token es inválido o expiró
   */
  async validateToken(token: string) {
    try {
      // Verificar y decodificar el token
      const payload = this.jwtService.verify(token);
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
