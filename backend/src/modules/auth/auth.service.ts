/**
 * Servicio de Autenticación (auth.service.ts)
 *
 * RESPONSABILIDADES:
 * - Validar credenciales del usuario contra la base de datos
 * - Crear y verificar tokens JWT
 * - Hashear contraseñas con bcryptjs
 * - Interactuar con la tabla `users` a través de Prisma
 */

import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

interface AuthUser {
  id: number;
  email: string;
  fullName: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * LOGIN - Autentica un usuario y devuelve un token JWT
   *
   * @param loginDto - {email, password}
   * @returns {access_token, user} - Token JWT y datos públicos del usuario
   * @throws UnauthorizedException - Si email/password son incorrectos o la cuenta está inactiva
   */
  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    // Mensaje genérico para no revelar si el email existe
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Email o contraseña inválidos');
    }

    const passwordMatches = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Email o contraseña inválidos');
    }

    return this.buildAuthResponse(user);
  }

  /**
   * REGISTRAR - Crea un nuevo usuario con contraseña hasheada
   *
   * @param registerDto - {email, password, fullName}
   * @returns {access_token, user} - Token JWT (login automático)
   * @throws BadRequestException - Si el email ya existe
   */
  async register(registerDto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Este email ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    try {
      const newUser = await this.prisma.user.create({
        data: {
          email: registerDto.email,
          password: hashedPassword,
          fullName: registerDto.fullName,
          role: 'user',
        },
      });

      return this.buildAuthResponse(newUser);
    } catch (error) {
      // Protege contra condiciones de carrera sobre el email único
      if ((error as { code?: string })?.code === 'P2002') {
        throw new BadRequestException('Este email ya está registrado');
      }
      throw error;
    }
  }

  /**
   * VALIDAR TOKEN - Verifica que un token JWT sea válido
   *
   * @param token - Token JWT
   * @returns payload - Datos decodificados del token {sub, email, role}
   * @throws UnauthorizedException - Si el token es inválido o expiró
   */
  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      return payload;
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }

  /**
   * Firma el token y construye la respuesta que consume el frontend.
   * Forma EXACTA: { access_token, user: { id, email, fullName, role } }
   */
  private buildAuthResponse(user: AuthUser) {
    const access_token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

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
}
