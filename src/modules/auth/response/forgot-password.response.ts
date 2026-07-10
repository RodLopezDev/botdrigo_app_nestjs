import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ForgotPasswordResponse {
  @ApiProperty({
    example:
      'Si el correo está registrado, se enviará un enlace de recuperación.',
  })
  message: string;

  @ApiPropertyOptional({
    description:
      'Token de recuperación. Solo se expone en entornos de desarrollo; en producción se envía por correo.',
  })
  resetToken?: string;
}
