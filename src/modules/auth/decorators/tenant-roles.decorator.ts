import { applyDecorators, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { TenantScopeGuard } from '../guards/tenant-scope.guard';
import { Roles } from './roles.decorator';
import { TenantRole } from '../../../domain/enums/auth/tenant-role.enum';

/**
 * Autentica el token, exige un tenant seleccionado y además restringe la ruta
 * a los roles indicados. Úsalo en operaciones que solo ciertos roles pueden
 * ejecutar (por ejemplo, crear/editar/eliminar recursos).
 */
export function TenantRoles(...roles: TenantRole[]) {
  return applyDecorators(
    UseGuards(JwtAuthGuard, TenantScopeGuard, RolesGuard),
    Roles(...roles),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Token inválido o ausente' }),
    ApiForbiddenResponse({
      description: 'No hay un tenant seleccionado o el rol es insuficiente',
    }),
  );
}
