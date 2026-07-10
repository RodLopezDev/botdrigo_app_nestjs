import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { Tenant } from '../auth/tenant.entity';
import { DishIngredient } from './dish-ingredient.entity';
import { IngredientUnit } from '../../enums/catalog/ingredient-unit.enum';

@Entity('catalog_ingredients')
@Unique(['tenantId', 'name'])
@Check('chk_ingredient_cost_non_negative', '"cost_per_unit" >= 0')
export class Ingredient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'enum', enum: IngredientUnit, enumName: 'ingredient_unit' })
  unit: IngredientUnit;

  @Column({
    name: 'cost_per_unit',
    type: 'numeric',
    precision: 10,
    scale: 4,
  })
  costPerUnit: string;

  @Column({
    name: 'stock_quantity',
    type: 'numeric',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  stockQuantity: string | null;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @OneToMany(
    () => DishIngredient,
    (dishIngredient) => dishIngredient.ingredient,
  )
  dishIngredients: DishIngredient[];
}
