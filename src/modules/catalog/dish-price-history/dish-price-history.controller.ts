import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { DishPriceHistoryService } from './dish-price-history.service';
import { TenantAuth } from '../../auth/decorators/tenant-auth.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { AccessTokenPayload } from '../../auth/interfaces/jwt-payload.interface';

@ApiTags('catalog/dish-price-history')
@Controller('catalog/dishes/:dishId/price-history')
export class DishPriceHistoryController {
  constructor(
    private readonly priceHistoryService: DishPriceHistoryService,
  ) {}

  @Get()
  @TenantAuth()
  @ApiOperation({ summary: 'Lista el historial de precios de un plato' })
  findByDish(
    @CurrentUser() user: AccessTokenPayload,
    @Param('dishId', ParseUUIDPipe) dishId: string,
  ) {
    return this.priceHistoryService.findByDish(user.tenantId!, dishId);
  }
}
