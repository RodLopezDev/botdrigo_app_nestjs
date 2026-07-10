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

import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { TenantAuth } from '../../auth/decorators/tenant-auth.decorator';
import { TenantRoles } from '../../auth/decorators/tenant-roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { TenantRole } from '../../../domain/enums/auth/tenant-role.enum';
import type { AccessTokenPayload } from '../../auth/interfaces/jwt-payload.interface';

@ApiTags('catalog/categories')
@Controller('catalog/categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @TenantAuth()
  @ApiOperation({ summary: 'Lista las categorías del tenant' })
  findAll(@CurrentUser() user: AccessTokenPayload) {
    return this.categoryService.findAll(user.tenantId!);
  }

  @Get(':id')
  @TenantAuth()
  @ApiOperation({ summary: 'Obtiene una categoría por id' })
  findOne(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.categoryService.findOne(user.tenantId!, id);
  }

  @Post()
  @TenantRoles(TenantRole.OWNER)
  @ApiOperation({ summary: 'Crea una categoría (solo OWNER)' })
  create(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: CreateCategoryDto,
  ) {
    return this.categoryService.create(user.tenantId!, dto);
  }

  @Patch(':id')
  @TenantRoles(TenantRole.OWNER)
  @ApiOperation({ summary: 'Actualiza una categoría (solo OWNER)' })
  update(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoryService.update(user.tenantId!, id, dto);
  }

  @Delete(':id')
  @TenantRoles(TenantRole.OWNER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Elimina una categoría (solo OWNER)' })
  remove(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.categoryService.remove(user.tenantId!, id);
  }
}
