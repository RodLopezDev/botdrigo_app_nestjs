import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import { ROLES_KEY } from '../decorators/roles.decorator';
import { AccessTokenPayload } from '../interfaces/jwt-payload.interface';
import { TenantRole } from '../../../domain/enums/auth/tenant-role.enum';

/**
 * Restringe una ruta a un conjunto de roles de tenant.
 * Si la ruta no declara roles (via @Roles), permite el acceso.
 * Requiere que el token ya haya sido validado y tenga un tenant seleccionado.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<TenantRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as AccessTokenPayload | undefined;

    if (!user?.role || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        'No tienes permisos suficientes para realizar esta operación',
      );
    }

    return true;
  }
}
