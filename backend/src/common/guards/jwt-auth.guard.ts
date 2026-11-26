import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * Guard JWT global basado únicamente en @nestjs/jwt (sin passport).
 *
 * - Omite la verificación en rutas decoradas con @Public().
 * - Espera el header: Authorization: Bearer <token>.
 * - Adjunta el payload verificado a request.user.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authorization: string | undefined = request.headers?.authorization;

    if (!authorization) {
      throw new UnauthorizedException('Token requerido');
    }

    const [type, token] = authorization.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Token requerido');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      (request as { user?: unknown }).user = payload;
    } catch {
      throw new UnauthorizedException('Token inválido');
    }

    return true;
  }
}
