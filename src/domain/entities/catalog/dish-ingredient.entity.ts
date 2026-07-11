import {
  Check,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Tenant } from '../auth/tenant.entity';
import { Dish } from './dish.entity';
import { Ingredient } from './ingredient.entity';

@Entity('catalog_dish_ingredients')
@Index('uq_dish_ingredients_dish_ingredient_active', ['dishId', 'ingredientId'], {
  unique: true,
  where: '"deleted" = false',
})
@Check('chk_dish_ingredient_quantity_positive', '"quantity" > 0')
export class DishIngredient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Column({ name: 'dish_id', type: 'uuid' })
  dishId: string;

  @Column({ name: 'ingredient_id', type: 'uuid' })
  ingredientId: string;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 3,
  })
  quantity: string;

  @Column({ type: 'boolean', default: false })
  deleted: boolean;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => Dish, (dish) => dish.dishIngredients)
  @JoinColumn({ name: 'dish_id' })
  dish: Dish;

  @ManyToOne(() => Ingredient, (ingredient) => ingredient.dishIngredients)
  @JoinColumn({ name: 'ingredient_id' })
  ingredient: Ingredient;
}
