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

import { DishService } from './dish.service';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';
import { TenantAuth } from '../../auth/decorators/tenant-auth.decorator';
import { TenantRoles } from '../../auth/decorators/tenant-roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { TenantRole } from '../../../domain/enums/auth/tenant-role.enum';
import type { AccessTokenPayload } from '../../auth/interfaces/jwt-payload.interface';

@ApiTags('catalog/dishes')
@Controller('catalog/dishes')
export class DishController {
  constructor(private readonly dishService: DishService) {}

  @Get()
  @TenantAuth()
  @ApiOperation({ summary: 'Lista los platos del tenant' })
  findAll(@CurrentUser() user: AccessTokenPayload) {
    return this.dishService.findAll(user.tenantId!);
  }

  @Get(':id')
  @TenantAuth()
  @ApiOperation({ summary: 'Obtiene un plato por id' })
  findOne(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.dishService.findOne(user.tenantId!, id);
  }

  @Post()
  @TenantRoles(TenantRole.OWNER)
  @ApiOperation({ summary: 'Crea un plato (solo OWNER)' })
  create(@CurrentUser() user: AccessTokenPayload, @Body() dto: CreateDishDto) {
    return this.dishService.create(user.tenantId!, dto);
  }

  @Patch(':id')
  @TenantRoles(TenantRole.OWNER)
  @ApiOperation({
    summary:
      'Actualiza un plato (solo OWNER). Si cambia el precio, registra historial',
  })
  update(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDishDto,
  ) {
    return this.dishService.update(user.tenantId!, id, user.sub, dto);
  }

  @Delete(':id')
  @TenantRoles(TenantRole.OWNER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Elimina un plato (solo OWNER)' })
  remove(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.dishService.remove(user.tenantId!, id);
  }
}
