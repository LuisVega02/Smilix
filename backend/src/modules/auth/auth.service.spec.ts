import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthService } from './auth.service';

/**
 * Tests unitarios de AuthService.
 *
 * Se instancia el servicio directamente con mocks de PrismaService y
 * JwtService: no se abre ninguna conexión real a la base de datos.
 */
describe('AuthService', () => {
  const plainPassword = 'Secreta123';

  let service: AuthService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
    };
  };
  let jwtService: {
    sign: jest.Mock;
    verify: jest.Mock;
  };

  const buildUser = (overrides: Record<string, unknown> = {}) => ({
    id: 1,
    email: 'ana@clinica.com',
    password: 'hash-pendiente',
    fullName: 'Ana Torres',
    role: 'admin',
    isActive: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  });

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    jwtService = {
      sign: jest.fn(() => 'token'),
      verify: jest.fn(),
    };

    service = new AuthService(
      prisma as unknown as PrismaService,
      jwtService as unknown as JwtService,
    );
  });

  describe('login', () => {
    it('devuelve el token y los datos públicos del usuario con credenciales válidas', async () => {
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      prisma.user.findUnique.mockResolvedValue(
        buildUser({ password: hashedPassword }),
      );

      const result = await service.login({
        email: 'ana@clinica.com',
        password: plainPassword,
      });

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'ana@clinica.com' },
      });
      expect(result).toEqual({
        access_token: 'token',
        user: {
          id: 1,
          email: 'ana@clinica.com',
          fullName: 'Ana Torres',
          role: 'admin',
        },
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 1,
        email: 'ana@clinica.com',
        role: 'admin',
      });
    });

    it('lanza UnauthorizedException si la contraseña no coincide', async () => {
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      prisma.user.findUnique.mockResolvedValue(
        buildUser({ password: hashedPassword }),
      );

      await expect(
        service.login({
          email: 'ana@clinica.com',
          password: 'contraseña-incorrecta',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);

      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('lanza UnauthorizedException si el usuario está inactivo', async () => {
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      prisma.user.findUnique.mockResolvedValue(
        buildUser({ password: hashedPassword, isActive: false }),
      );

      await expect(
        service.login({
          email: 'ana@clinica.com',
          password: plainPassword,
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);

      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });

  describe('register', () => {
    it('lanza BadRequestException si el email ya está registrado', async () => {
      prisma.user.findUnique.mockResolvedValue(buildUser());

      await expect(
        service.register({
          email: 'ana@clinica.com',
          password: plainPassword,
          fullName: 'Ana Torres',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('crea el usuario con la contraseña hasheada y devuelve el token', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockImplementation(
        async ({ data }: { data: Record<string, unknown> }) =>
          buildUser({
            id: 2,
            ...data,
          }),
      );

      const result = await service.register({
        email: 'nuevo@clinica.com',
        password: plainPassword,
        fullName: 'Nuevo Usuario',
      });

      expect(prisma.user.create).toHaveBeenCalledTimes(1);

      const createdData = prisma.user.create.mock.calls[0][0].data;
      expect(createdData).toMatchObject({
        email: 'nuevo@clinica.com',
        fullName: 'Nuevo Usuario',
        role: 'user',
      });
      expect(createdData.password).not.toBe(plainPassword);
      await expect(
        bcrypt.compare(plainPassword, createdData.password),
      ).resolves.toBe(true);

      expect(result.access_token).toBe('token');
      expect(result.user).toEqual({
        id: 2,
        email: 'nuevo@clinica.com',
        fullName: 'Nuevo Usuario',
        role: 'user',
      });
    });
  });
});
