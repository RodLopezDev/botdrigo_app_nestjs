import { ApiProperty } from '@nestjs/swagger';

import { TenantRole } from '../../../domain/enums/auth/tenant-role.enum';
import { TenantSummaryResponse } from './tenant-summary.response';

export class AuthTokenUserResponse {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'owner@botdrigo.com' })
  email: string;

  @ApiProperty({ example: 'Rodrigo Pérez' })
  fullName: string;
}

export class AuthTokensResponse {
  @ApiProperty({ example: 'Bearer' })
  tokenType: string;

  @ApiProperty({ description: 'JWT de acceso' })
  accessToken: string;

  @ApiProperty({ description: 'Refresh token opaco' })
  refreshToken: string;

  @ApiProperty({
    example: '15m',
    description: 'Tiempo de vida del access token',
  })
  expiresIn: string;

  @ApiProperty({ type: AuthTokenUserResponse })
  user: AuthTokenUserResponse;

  @ApiProperty({
    format: 'uuid',
    nullable: true,
    description:
      'Tenant activo del token. Null cuando aún no se ha seleccionado.',
  })
  tenantId: string | null;

  @ApiProperty({
    enum: TenantRole,
    nullable: true,
    description: 'Rol dentro del tenant activo.',
  })
  role: TenantRole | null;

  @ApiProperty({ type: [TenantSummaryResponse] })
  tenants: TenantSummaryResponse[];
}
