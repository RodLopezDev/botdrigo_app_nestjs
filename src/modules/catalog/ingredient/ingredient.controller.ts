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

import { IngredientService } from './ingredient.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { TenantAuth } from '../../auth/decorators/tenant-auth.decorator';
import { TenantRoles } from '../../auth/decorators/tenant-roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { TenantRole } from '../../../domain/enums/auth/tenant-role.enum';
import type { AccessTokenPayload } from '../../auth/interfaces/jwt-payload.interface';

@ApiTags('catalog/ingredients')
@Controller('catalog/ingredients')
export class IngredientController {
  constructor(private readonly ingredientService: IngredientService) {}

  @Get()
  @TenantAuth()
  @ApiOperation({ summary: 'Lista los ingredientes del tenant' })
  findAll(@CurrentUser() user: AccessTokenPayload) {
    return this.ingredientService.findAll(user.tenantId!);
  }

  @Get(':id')
  @TenantAuth()
  @ApiOperation({ summary: 'Obtiene un ingrediente por id' })
  findOne(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.ingredientService.findOne(user.tenantId!, id);
  }

  @Post()
  @TenantRoles(TenantRole.OWNER)
  @ApiOperation({ summary: 'Crea un ingrediente (solo OWNER)' })
  create(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: CreateIngredientDto,
  ) {
    return this.ingredientService.create(user.tenantId!, dto);
  }

  @Patch(':id')
  @TenantRoles(TenantRole.OWNER)
  @ApiOperation({ summary: 'Actualiza un ingrediente (solo OWNER)' })
  update(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateIngredientDto,
  ) {
    return this.ingredientService.update(user.tenantId!, id, dto);
  }

  @Delete(':id')
  @TenantRoles(TenantRole.OWNER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Elimina un ingrediente (solo OWNER)' })
  remove(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.ingredientService.remove(user.tenantId!, id);
  }
}
