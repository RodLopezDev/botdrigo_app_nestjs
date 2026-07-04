import { applyDecorators, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { TenantScopeGuard } from '../guards/tenant-scope.guard';

/**
 * Autentica el token y además exige que tenga un tenant seleccionado.
 * Úsalo en toda ruta que opere dentro de un tenant.
 */
export function TenantAuth() {
  return applyDecorators(
    UseGuards(JwtAuthGuard, TenantScopeGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Token inválido o ausente' }),
    ApiForbiddenResponse({ description: 'No hay un tenant seleccionado' }),
  );
}
