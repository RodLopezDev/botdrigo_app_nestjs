import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class UpdateDishComboItemDto {
  @ApiProperty({ example: 2, description: 'Cantidad del componente (> 0)' })
  @IsInt()
  @IsPositive()
  quantity: number;
}
