import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { TenantService } from './tenant.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AccessTokenPayload } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('tenant')
@Controller('tenant')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Get(':tenantId')
  @Auth()
  @ApiOperation({
    summary: 'Devuelve un tenant por id si el usuario tiene acceso',
  })
  getTenantById(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.tenantService.getTenantById(tenantId, user.sub);
  }
}
