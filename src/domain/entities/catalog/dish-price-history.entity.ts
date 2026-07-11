import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Tenant } from '../auth/tenant.entity';
import { User } from '../auth/user.entity';
import { Dish } from './dish.entity';

@Entity('catalog_dish_price_history')
@Index('idx_dish_price_history_dish', ['dishId', 'changedAt'])
export class DishPriceHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Column({ name: 'dish_id', type: 'uuid' })
  dishId: string;

  @Column({
    name: 'old_sale_price',
    type: 'numeric',
    precision: 10,
    scale: 2,
  })
  oldSalePrice: string;

  @Column({
    name: 'new_sale_price',
    type: 'numeric',
    precision: 10,
    scale: 2,
  })
  newSalePrice: string;

  @Column({ name: 'changed_by', type: 'uuid' })
  changedBy: string;

  @Column({ type: 'boolean', default: false })
  deleted: boolean;

  @CreateDateColumn({ name: 'changed_at', type: 'timestamptz' })
  changedAt: Date;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => Dish, (dish) => dish.priceHistory)
  @JoinColumn({ name: 'dish_id' })
  dish: Dish;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'changed_by' })
  changedByUser: User;
}
