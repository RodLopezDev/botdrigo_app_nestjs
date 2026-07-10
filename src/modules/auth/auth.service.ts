import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { IsNull, Repository } from 'typeorm';
import type { SignOptions } from 'jsonwebtoken';
import { createHash, randomBytes } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';

import {
  AccessTokenPayload,
  ResetTokenPayload,
} from './interfaces/jwt-payload.interface';
import { User } from '../../domain/entities/auth/user.entity';
import { UserTenant } from '../../domain/entities/auth/user-tenant.entity';
import { RefreshToken } from '../../domain/entities/auth/refresh-token.entity';

@Injectable()
export class AuthService {
  private readonly accessExpires: string;
  private readonly resetSecret: string;
  private readonly resetExpires: string;
  private readonly refreshDays: number;

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(UserTenant)
    private readonly userTenantRepo: Repository<UserTenant>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,
    private readonly jwtService: JwtService,
    configService: ConfigService,
  ) {
    this.accessExpires = configService.get<string>('JWT_ACCESS_EXPIRES', '15m');
    this.resetSecret = configService.get<string>('JWT_RESET_SECRET', '');
    this.resetExpires = configService.get<string>('JWT_RESET_EXPIRES', '15m');
    this.refreshDays = parseInt(
      configService.get<string>('REFRESH_TOKEN_EXPIRES_DAYS', '30'),
      10,
    );
  }

  async login(email: string, password: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user || !user.active) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordValid = await this.verifyPassword(
      user.passwordHash,
      password,
    );
    if (!passwordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const memberships = await this.getActiveMemberships(user.id);

    // Solo auto-seleccionamos el tenant cuando hay exactamente uno.
    // Con varios, el token se emite sin tenant y el usuario debe elegirlo
    // vía POST /auth/select-tenant.
    const membership = memberships.length === 1 ? memberships[0] : null;

    return this.issueTokens(user, membership, memberships);
  }

  async selectTenant(userId: string, tenantId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user || !user.active) {
      throw new UnauthorizedException();
    }

    const memberships = await this.getActiveMemberships(userId);
    const membership = memberships.find((item) => item.tenantId === tenantId);

    if (!membership) {
      throw new ForbiddenException('No tienes acceso a este tenant');
    }

    return this.issueTokens(user, membership, memberships);
  }

  async me(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user || !user.active) {
      throw new UnauthorizedException();
    }

    const memberships = await this.userTenantRepo.find({
      where: { userId: user.id, active: true },
      relations: { tenant: true },
      order: { createdAt: 'ASC' },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        active: user.active,
        createdAt: user.createdAt,
      },
      tenants: memberships.map((membership) => ({
        id: membership.tenant.id,
        name: membership.tenant.name,
        slug: membership.tenant.slug,
        role: membership.role,
        active: membership.tenant.active,
      })),
    };
  }

  async refresh(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);
    const stored = await this.refreshTokenRepo.findOne({
      where: { tokenHash },
    });

    if (!stored || stored.revokedAt || stored.expiresAt <= new Date()) {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }

    const user = await this.userRepo.findOne({ where: { id: stored.userId } });
    if (!user || !user.active) {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }

    stored.revokedAt = new Date();
    await this.refreshTokenRepo.save(stored);

    const membership = stored.currentTenantId
      ? await this.userTenantRepo.findOne({
          where: {
            userId: user.id,
            tenantId: stored.currentTenantId,
            active: true,
          },
        })
      : null;

    return this.issueTokens(user, membership);
  }

  async forgotPassword(email: string) {
    const genericMessage =
      'Si el correo está registrado, se enviará un enlace de recuperación.';
    const user = await this.userRepo.findOne({ where: { email } });

    if (!user || !user.active) {
      return { message: genericMessage };
    }

    const resetToken = await this.jwtService.signAsync(
      { sub: user.id, type: 'reset' } satisfies ResetTokenPayload,
      {
        secret: this.buildResetSecret(user),
        expiresIn: this.resetExpires as SignOptions['expiresIn'],
      },
    );

    // NOTE: en producción este token debe enviarse por correo, no en la respuesta.
    return { message: genericMessage, resetToken };
  }

  async resetPassword(token: string, newPassword: string) {
    const decoded = this.jwtService.decode<ResetTokenPayload | null>(token);
    if (!decoded?.sub || decoded.type !== 'reset') {
      throw new BadRequestException('Token inválido');
    }

    const user = await this.userRepo.findOne({ where: { id: decoded.sub } });
    if (!user) {
      throw new BadRequestException('Token inválido');
    }

    try {
      await this.jwtService.verifyAsync<ResetTokenPayload>(token, {
        secret: this.buildResetSecret(user),
      });
    } catch {
      throw new BadRequestException('Token inválido o expirado');
    }

    user.passwordHash = await argon2.hash(newPassword, {
      type: argon2.argon2id,
    });
    await this.userRepo.save(user);

    await this.refreshTokenRepo.update(
      { userId: user.id, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );

    return { message: 'Contraseña actualizada correctamente.' };
  }

  private async issueTokens(
    user: User,
    membership: UserTenant | null,
    memberships?: UserTenant[],
  ) {
    const tenantMemberships =
      memberships ?? (await this.getActiveMemberships(user.id));

    const payload: AccessTokenPayload = {
      sub: user.id,
      email: user.email,
      tenantId: membership?.tenantId ?? null,
      role: membership?.role ?? null,
    };

    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = randomBytes(48).toString('hex');
    await this.persistRefreshToken(
      user.id,
      membership?.tenantId ?? null,
      refreshToken,
    );

    return {
      tokenType: 'Bearer',
      accessToken,
      refreshToken,
      expiresIn: this.accessExpires,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
      tenantId: payload.tenantId,
      role: payload.role,
      tenants: this.mapTenants(tenantMemberships),
    };
  }

  private getActiveMemberships(userId: string) {
    return this.userTenantRepo.find({
      where: { userId, active: true },
      relations: { tenant: true },
      order: { createdAt: 'ASC' },
    });
  }

  private mapTenants(memberships: UserTenant[]) {
    return memberships.map((membership) => ({
      id: membership.tenant.id,
      name: membership.tenant.name,
      slug: membership.tenant.slug,
      role: membership.role,
      active: membership.tenant.active,
    }));
  }

  private async persistRefreshToken(
    userId: string,
    tenantId: string | null,
    token: string,
  ) {
    const expiresAt = new Date(
      Date.now() + this.refreshDays * 24 * 60 * 60 * 1000,
    );

    const entity = this.refreshTokenRepo.create({
      userId,
      currentTenantId: tenantId,
      tokenHash: this.hashToken(token),
      expiresAt,
    });

    await this.refreshTokenRepo.save(entity);
  }

  private async verifyPassword(hash: string, password: string) {
    try {
      return await argon2.verify(hash, password);
    } catch {
      return false;
    }
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private buildResetSecret(user: User) {
    // El secreto depende del hash actual: al cambiar la contraseña,
    // los tokens de reset previos quedan invalidados automáticamente.
    return `${this.resetSecret}.${user.passwordHash}`;
  }
}
