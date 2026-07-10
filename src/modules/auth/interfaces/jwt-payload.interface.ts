import { TenantRole } from '../../../domain/enums/auth/tenant-role.enum';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  tenantId: string | null;
  role: TenantRole | null;
}

export interface ResetTokenPayload {
  sub: string;
  type: 'reset';
}
