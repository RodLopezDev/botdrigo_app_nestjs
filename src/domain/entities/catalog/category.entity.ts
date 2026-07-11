import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Tenant } from '../auth/tenant.entity';
import { Dish } from './dish.entity';

@Entity('catalog_categories')
@Index('uq_categories_tenant_name_active', ['tenantId', 'name'], {
  unique: true,
  where: '"deleted" = false',
})
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @Column({ type: 'boolean', default: false })
  deleted: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @OneToMany(() => Dish, (dish) => dish.category)
  dishes: Dish[];
}
