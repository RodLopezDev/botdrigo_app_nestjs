import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { UserTenant } from './user-tenant.entity';
import { BusinessHours } from '../../enums/auth/business-ours.json';

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', unique: true })
  slug: string;

  @Column({ type: 'text', default: 'America/Lima' })
  timezone: string;

  @Column({ type: 'text', default: 'PEN' })
  currency: string;

  @Column({ name: 'business_hours', type: 'jsonb', nullable: true })
  businessHours: BusinessHours | null;

  @Column({ type: 'jsonb', default: {} })
  settings: Record<string, unknown>;

  @Column({ type: 'text', default: 'free' })
  plan: string;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @OneToMany(() => UserTenant, (userTenant) => userTenant.tenant)
  userTenants: UserTenant[];
}
