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

import { DishIngredientService } from './dish-ingredient.service';
import { CreateDishIngredientDto } from './dto/create-dish-ingredient.dto';
import { UpdateDishIngredientDto } from './dto/update-dish-ingredient.dto';
import { TenantAuth } from '../../auth/decorators/tenant-auth.decorator';
import { TenantRoles } from '../../auth/decorators/tenant-roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { TenantRole } from '../../../domain/enums/auth/tenant-role.enum';
import type { AccessTokenPayload } from '../../auth/interfaces/jwt-payload.interface';

@ApiTags('catalog/dish-ingredients')
@Controller('catalog/dishes/:dishId/ingredients')
export class DishIngredientController {
  constructor(private readonly dishIngredientService: DishIngredientService) {}

  @Get()
  @TenantAuth()
  @ApiOperation({ summary: 'Lista los ingredientes (receta) de un plato' })
  findAll(
    @CurrentUser() user: AccessTokenPayload,
    @Param('dishId', ParseUUIDPipe) dishId: string,
  ) {
    return this.dishIngredientService.findAll(user.tenantId!, dishId);
  }

  @Post()
  @TenantRoles(TenantRole.OWNER)
  @ApiOperation({ summary: 'Agrega un ingrediente a la receta (solo OWNER)' })
  create(
    @CurrentUser() user: AccessTokenPayload,
    @Param('dishId', ParseUUIDPipe) dishId: string,
    @Body() dto: CreateDishIngredientDto,
  ) {
    return this.dishIngredientService.create(user.tenantId!, dishId, dto);
  }

  @Patch(':id')
  @TenantRoles(TenantRole.OWNER)
  @ApiOperation({
    summary: 'Actualiza la cantidad de un ingrediente (solo OWNER)',
  })
  update(
    @CurrentUser() user: AccessTokenPayload,
    @Param('dishId', ParseUUIDPipe) dishId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDishIngredientDto,
  ) {
    return this.dishIngredientService.update(user.tenantId!, dishId, id, dto);
  }

  @Delete(':id')
  @TenantRoles(TenantRole.OWNER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Quita un ingrediente de la receta (solo OWNER)' })
  remove(
    @CurrentUser() user: AccessTokenPayload,
    @Param('dishId', ParseUUIDPipe) dishId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.dishIngredientService.remove(user.tenantId!, dishId, id);
  }
}
