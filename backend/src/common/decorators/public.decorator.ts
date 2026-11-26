import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marca una ruta (o controlador) como pública para que el JwtAuthGuard
 * global no exija el header Authorization.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
