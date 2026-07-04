import { ApiProperty } from '@nestjs/swagger';

import { TenantSummaryResponse } from './tenant-summary.response';

export class MeUserResponse {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'owner@botdrigo.com' })
  email: string;

  @ApiProperty({ example: 'Rodrigo Pérez' })
  fullName: string;

  @ApiProperty()
  active: boolean;

  @ApiProperty({ type: Date })
  createdAt: Date;
}

export class MeResponse {
  @ApiProperty({ type: MeUserResponse })
  user: MeUserResponse;

  @ApiProperty({ type: [TenantSummaryResponse] })
  tenants: TenantSummaryResponse[];
}
