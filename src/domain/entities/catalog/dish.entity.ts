import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Tenant } from '../auth/tenant.entity';
import { Category } from './category.entity';
import { DishIngredient } from './dish-ingredient.entity';
import { DishComboItem } from './dish-combo-item.entity';
import { DishPriceHistory } from './dish-price-history.entity';

@Entity('catalog_dishes')
@Index('idx_dishes_tenant_active', ['tenantId', 'active'])
@Check('chk_dish_sale_price_non_negative', '"sale_price" >= 0')
@Check(
  'chk_dish_target_food_cost_pct',
  '"target_food_cost_pct" > 0 AND "target_food_cost_pct" <= 100',
)
export class Dish {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Column({ name: 'category_id', type: 'uuid', nullable: true })
  categoryId: string | null;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    name: 'sale_price',
    type: 'numeric',
    precision: 10,
    scale: 2,
  })
  salePrice: string;

  @Column({
    name: 'target_food_cost_pct',
    type: 'numeric',
    precision: 5,
    scale: 2,
    default: 30,
  })
  targetFoodCostPct: string;

  @Column({ name: 'is_combo', type: 'boolean', default: false })
  isCombo: boolean;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @Column({ type: 'boolean', default: false })
  deleted: boolean;

  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => Category, (category) => category.dishes, { nullable: true })
  @JoinColumn({ name: 'category_id' })
  category: Category | null;

  @OneToMany(() => DishIngredient, (dishIngredient) => dishIngredient.dish)
  dishIngredients: DishIngredient[];

  @OneToMany(() => DishComboItem, (comboItem) => comboItem.comboDish)
  comboItems: DishComboItem[];

  @OneToMany(() => DishPriceHistory, (priceHistory) => priceHistory.dish)
  priceHistory: DishPriceHistory[];
}
