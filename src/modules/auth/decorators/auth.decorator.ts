import {
  ApiBearerAuth,
  ApiHeader,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { applyDecorators, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../guards/jwt-auth.guard';

export function Auth() {
  return applyDecorators(
    UseGuards(JwtAuthGuard),
    ApiBearerAuth(),
    ApiHeader({
      name: 'Authorization',
      description: 'Bearer <access_token>',
      required: true,
    }),
    ApiUnauthorizedResponse({ description: 'Token inválido o ausente' }),
  );
}
