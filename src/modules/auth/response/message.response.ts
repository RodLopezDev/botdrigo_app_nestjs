import { ApiProperty } from '@nestjs/swagger';

export class MessageResponse {
  @ApiProperty({ example: 'Contraseña actualizada correctamente.' })
  message: string;
}
