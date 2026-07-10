import { ApiProperty } from '@nestjs/swagger';

import { TenantRole } from '../../../domain/enums/auth/tenant-role.enum';

export class TenantSummaryResponse {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Botdrigo' })
  name: string;

  @ApiProperty({ example: 'botdrigo' })
  slug: string;

  @ApiProperty({ enum: TenantRole })
  role: TenantRole;

  @ApiProperty()
  active: boolean;
}
