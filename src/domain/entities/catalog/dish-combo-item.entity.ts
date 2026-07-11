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

@Entity('catalog_dish_combo_items')
@Index(
  'uq_combo_items_combo_component_active',
  ['comboDishId', 'componentDishId'],
  {
    unique: true,
    where: '"deleted" = false',
  },
)
@Check('chk_combo_quantity_positive', '"quantity" > 0')
@Check('chk_combo_distinct_dish', '"combo_dish_id" <> "component_dish_id"')
export class DishComboItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Column({ name: 'combo_dish_id', type: 'uuid' })
  comboDishId: string;

  @Column({ name: 'component_dish_id', type: 'uuid' })
  componentDishId: string;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'boolean', default: false })
  deleted: boolean;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => Dish, (dish) => dish.comboItems)
  @JoinColumn({ name: 'combo_dish_id' })
  comboDish: Dish;

  @ManyToOne(() => Dish)
  @JoinColumn({ name: 'component_dish_id' })
  componentDish: Dish;
}
