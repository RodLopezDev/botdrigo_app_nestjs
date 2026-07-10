import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

import { IngredientUnit } from '../../../../domain/enums/catalog/ingredient-unit.enum';

export class CreateIngredientDto {
  @ApiProperty({ example: 'Harina' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @ApiProperty({ enum: IngredientUnit, example: IngredientUnit.GRAM })
  @IsEnum(IngredientUnit)
  unit: IngredientUnit;

  @ApiProperty({
    example: 0.05,
    description: 'Costo por unidad de medida',
  })
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  costPerUnit: number;

  @ApiProperty({
    example: 1000,
    description: 'Cantidad en stock (opcional)',
    required: false,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  stockQuantity?: number;

  @ApiProperty({ example: true, required: false, default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
