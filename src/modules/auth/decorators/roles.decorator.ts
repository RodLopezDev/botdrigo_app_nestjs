import { SetMetadata } from '@nestjs/common';

import { TenantRole } from '../../../domain/enums/auth/tenant-role.enum';

export const ROLES_KEY = 'roles';

/**
 * Marca los roles de tenant permitidos para una ruta.
 * Se evalúa junto con {@link RolesGuard}.
 */
export const Roles = (...roles: TenantRole[]) => SetMetadata(ROLES_KEY, roles);
