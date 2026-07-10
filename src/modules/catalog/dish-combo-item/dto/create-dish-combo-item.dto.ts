import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsUUID } from 'class-validator';

export class CreateDishComboItemDto {
  @ApiProperty({
    format: 'uuid',
    description: 'Plato componente que forma parte del combo',
  })
  @IsUUID()
  componentDishId: string;

  @ApiProperty({ example: 1, description: 'Cantidad del componente (> 0)' })
  @IsInt()
  @IsPositive()
  quantity: number;
}
