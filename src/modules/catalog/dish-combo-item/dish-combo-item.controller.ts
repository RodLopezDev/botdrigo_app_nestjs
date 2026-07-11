import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { DishComboItemService } from './dish-combo-item.service';
import { CreateDishComboItemDto } from './dto/create-dish-combo-item.dto';
import { UpdateDishComboItemDto } from './dto/update-dish-combo-item.dto';
import { TenantAuth } from '../../auth/decorators/tenant-auth.decorator';
import { TenantRoles } from '../../auth/decorators/tenant-roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { TenantRole } from '../../../domain/enums/auth/tenant-role.enum';
import type { AccessTokenPayload } from '../../auth/interfaces/jwt-payload.interface';

@ApiTags('catalog/dish-combo-items')
@Controller('catalog/dishes/:comboDishId/combo-items')
export class DishComboItemController {
  constructor(private readonly comboItemService: DishComboItemService) {}

  @Get()
  @TenantAuth()
  @ApiOperation({ summary: 'Lista los componentes de un combo' })
  findAll(
    @CurrentUser() user: AccessTokenPayload,
    @Param('comboDishId', ParseUUIDPipe) comboDishId: string,
  ) {
    return this.comboItemService.findAll(user.tenantId!, comboDishId);
  }

  @Post()
  @TenantRoles(TenantRole.OWNER)
  @ApiOperation({ summary: 'Agrega un componente al combo (solo OWNER)' })
  create(
    @CurrentUser() user: AccessTokenPayload,
    @Param('comboDishId', ParseUUIDPipe) comboDishId: string,
    @Body() dto: CreateDishComboItemDto,
  ) {
    return this.comboItemService.create(user.tenantId!, comboDishId, dto);
  }

  @Patch(':id')
  @TenantRoles(TenantRole.OWNER)
  @ApiOperation({
    summary: 'Actualiza la cantidad de un componente (solo OWNER)',
  })
  update(
    @CurrentUser() user: AccessTokenPayload,
    @Param('comboDishId', ParseUUIDPipe) comboDishId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDishComboItemDto,
  ) {
    return this.comboItemService.update(user.tenantId!, comboDishId, id, dto);
  }

  @Delete(':id')
  @TenantRoles(TenantRole.OWNER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Quita un componente del combo (solo OWNER)' })
  remove(
    @CurrentUser() user: AccessTokenPayload,
    @Param('comboDishId', ParseUUIDPipe) comboDishId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.comboItemService.remove(user.tenantId!, comboDishId, id);
  }
}
