import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { Auth } from './decorators/auth.decorator';
import { SelectTenantDto } from './dto/select-tenant.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import { MeResponse } from './response/me.response';
import { MessageResponse } from './response/message.response';
import { AuthTokensResponse } from './response/auth-tokens.response';
import { ForgotPasswordResponse } from './response/forgot-password.response';
import type { AccessTokenPayload } from './interfaces/jwt-payload.interface';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Inicia sesión y devuelve access + refresh token' })
  @ApiOkResponse({ type: AuthTokensResponse })
  login(@Body() dto: LoginDto): Promise<AuthTokensResponse> {
    return this.authService.login(dto.email, dto.password);
  }

  @Get('me')
  @Auth()
  @ApiOperation({
    summary: 'Devuelve el usuario autenticado y los tenants a los que accede',
  })
  @ApiOkResponse({ type: MeResponse })
  me(@CurrentUser() user: AccessTokenPayload): Promise<MeResponse> {
    return this.authService.me(user.sub);
  }

  @Post('select-tenant')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Selecciona el tenant activo y emite tokens scopeados a él',
  })
  @ApiOkResponse({ type: AuthTokensResponse })
  selectTenant(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: SelectTenantDto,
  ): Promise<AuthTokensResponse> {
    return this.authService.selectTenant(user.sub, dto.tenantId);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renueva el access token usando un refresh token' })
  @ApiOkResponse({ type: AuthTokensResponse })
  refresh(@Body() dto: RefreshTokenDto): Promise<AuthTokensResponse> {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Solicita un token para restablecer la contraseña' })
  @ApiOkResponse({ type: ForgotPasswordResponse })
  forgotPassword(
    @Body() dto: ForgotPasswordDto,
  ): Promise<ForgotPasswordResponse> {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restablece la contraseña con un token válido' })
  @ApiOkResponse({ type: MessageResponse })
  resetPassword(@Body() dto: ResetPasswordDto): Promise<MessageResponse> {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }
}
