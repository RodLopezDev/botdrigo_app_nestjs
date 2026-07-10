import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class SelectTenantDto {
  @ApiProperty({
    description: 'ID del tenant al que el usuario quiere entrar',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  tenantId: string;
}
