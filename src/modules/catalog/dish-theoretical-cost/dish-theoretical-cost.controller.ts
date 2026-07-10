import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { DishTheoreticalCostService } from './dish-theoretical-cost.service';
import { TenantAuth } from '../../auth/decorators/tenant-auth.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { AccessTokenPayload } from '../../auth/interfaces/jwt-payload.interface';

@ApiTags('catalog/theoretical-cost')
@Controller('catalog/theoretical-cost')
export class DishTheoreticalCostController {
  constructor(
    private readonly theoreticalCostService: DishTheoreticalCostService,
  ) {}

  @Get()
  @TenantAuth()
  @ApiOperation({
    summary: 'Lista el costo teórico y food cost % de los platos del tenant',
  })
  findAll(@CurrentUser() user: AccessTokenPayload) {
    return this.theoreticalCostService.findAll(user.tenantId!);
  }

  @Get(':dishId')
  @TenantAuth()
  @ApiOperation({ summary: 'Obtiene el costo teórico de un plato' })
  findByDish(
    @CurrentUser() user: AccessTokenPayload,
    @Param('dishId', ParseUUIDPipe) dishId: string,
  ) {
    return this.theoreticalCostService.findByDish(user.tenantId!, dishId);
  }
}
