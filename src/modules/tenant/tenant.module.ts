import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TenantController } from './tenant.controller';
import { TenantService } from './tenant.service';
import { Tenant } from '../../domain/entities/auth/tenant.entity';
import { UserTenant } from '../../domain/entities/auth/user-tenant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tenant, UserTenant])],
  controllers: [TenantController],
  providers: [TenantService],
  exports: [TenantService],
})
export class TenantModule {}
