import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Category } from '../../domain/entities/catalog/category.entity';
import { Dish } from '../../domain/entities/catalog/dish.entity';
import { Ingredient } from '../../domain/entities/catalog/ingredient.entity';
import { DishIngredient } from '../../domain/entities/catalog/dish-ingredient.entity';
import { DishComboItem } from '../../domain/entities/catalog/dish-combo-item.entity';
import { DishPriceHistory } from '../../domain/entities/catalog/dish-price-history.entity';
import { DishTheoreticalCost } from '../../domain/view/catalog/dish-theoretical-cost.view';

import { CategoryController } from './category/category.controller';
import { CategoryService } from './category/category.service';
import { IngredientController } from './ingredient/ingredient.controller';
import { IngredientService } from './ingredient/ingredient.service';
import { DishController } from './dish/dish.controller';
import { DishService } from './dish/dish.service';
import { DishIngredientController } from './dish-ingredient/dish-ingredient.controller';
import { DishIngredientService } from './dish-ingredient/dish-ingredient.service';
import { DishComboItemController } from './dish-combo-item/dish-combo-item.controller';
import { DishComboItemService } from './dish-combo-item/dish-combo-item.service';
import { DishPriceHistoryController } from './dish-price-history/dish-price-history.controller';
import { DishPriceHistoryService } from './dish-price-history/dish-price-history.service';
import { DishTheoreticalCostController } from './dish-theoretical-cost/dish-theoretical-cost.controller';
import { DishTheoreticalCostService } from './dish-theoretical-cost/dish-theoretical-cost.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Category,
      Dish,
      Ingredient,
      DishIngredient,
      DishComboItem,
      DishPriceHistory,
      DishTheoreticalCost,
    ]),
  ],
  controllers: [
    CategoryController,
    IngredientController,
    DishController,
    DishIngredientController,
    DishComboItemController,
    DishPriceHistoryController,
    DishTheoreticalCostController,
  ],
  providers: [
    CategoryService,
    IngredientService,
    DishService,
    DishIngredientService,
    DishComboItemService,
    DishPriceHistoryService,
    DishTheoreticalCostService,
  ],
})
export class CatalogModule {}
