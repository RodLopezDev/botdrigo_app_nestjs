import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Tenant } from './tenant.entity';
import { UserTenant } from './user-tenant.entity';

@Entity('auth_staff_shifts')
@Index('idx_staff_shifts_tenant', ['tenantId'])
@Check(
  'chk_clock_out_after_in',
  '"clock_out" IS NULL OR "clock_out" > "clock_in"',
)
export class StaffShift {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Column({ name: 'user_tenant_id', type: 'uuid' })
  userTenantId: string;

  @Column({ name: 'clock_in', type: 'timestamptz' })
  clockIn: Date;

  @Column({ name: 'clock_out', type: 'timestamptz', nullable: true })
  clockOut: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => UserTenant)
  @JoinColumn({ name: 'user_tenant_id' })
  userTenant: UserTenant;
}
