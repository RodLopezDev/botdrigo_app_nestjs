import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsUUID } from 'class-validator';

export class CreateDishIngredientDto {
  @ApiProperty({ format: 'uuid', description: 'Ingrediente de la receta' })
  @IsUUID()
  ingredientId: string;

  @ApiProperty({ example: 150, description: 'Cantidad usada (> 0)' })
  @IsNumber({ maxDecimalPlaces: 3 })
  @IsPositive()
  quantity: number;
}
