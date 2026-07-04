import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Tenant } from '../../domain/entities/auth/tenant.entity';
import { UserTenant } from '../../domain/entities/auth/user-tenant.entity';

@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepo: Repository<Tenant>,
    @InjectRepository(UserTenant)
    private readonly userTenantRepo: Repository<UserTenant>,
  ) {}

  async getTenantById(tenantId: string, userId: string) {
    const membership = await this.userTenantRepo.findOne({
      where: { userId, tenantId, active: true },
    });

    if (!membership) {
      throw new ForbiddenException('No tienes acceso a este tenant');
    }

    const tenant = await this.tenantRepo.findOne({
      where: { id: tenantId, active: true },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant no encontrado');
    }

    return {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      timezone: tenant.timezone,
      currency: tenant.currency,
      businessHours: tenant.businessHours,
      settings: tenant.settings,
      plan: tenant.plan,
      active: tenant.active,
      createdAt: tenant.createdAt,
      role: membership.role,
    };
  }
}
