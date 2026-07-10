import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';

import { AccessTokenPayload } from '../interfaces/jwt-payload.interface';

/**
 * Exige que el access token tenga un tenant seleccionado.
 * El token emitido por /auth/login sin tenant (multi-tenant) es un token
 * de "pre-sesión": solo sirve para /auth/select-tenant. Este guard bloquea
 * cualquier operación scopeada hasta que se haya elegido un tenant.
 */
@Injectable()
export class TenantScopeGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as AccessTokenPayload | undefined;

    if (!user?.tenantId) {
      throw new ForbiddenException(
        'Debes seleccionar un tenant antes de realizar esta operación',
      );
    }

    return true;
  }
}
