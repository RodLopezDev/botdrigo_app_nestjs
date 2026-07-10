-- ============================================================
-- Seed de ejemplo: tenant "My-food-store" con un usuario OWNER
-- ============================================================
-- Contraseña del usuario de ejemplo: Password123!
-- (hash generado con argon2id, el mismo algoritmo que usa la app)
--
-- Cubre todas las tablas del esquema:
--   tenants, users, user_tenants, refresh_tokens, staff_shifts
--
-- Ejecutar:
--   psql -h localhost -U postgres -d botdrigo -f script.sql
-- ============================================================

BEGIN;

-- IDs fijos para poder enlazar las FKs de forma legible
-- tenant:       b82be9de-08f0-45de-8ddd-1f020b31a687
-- user:         cf5eff28-217c-4681-bd13-7f8213e8a385
-- user_tenant:  5b9e547b-ec39-435b-8997-34c122a4b4e6
-- refresh_token:40b96f27-c783-4f02-8ac8-1eff6f8ff89a
-- staff_shift:  7aebd363-24c3-42c1-a9f3-8acc0b277838

-- ------------------------------------------------------------
-- 1. Tenant
-- ------------------------------------------------------------
INSERT INTO "auth_tenants" (
  "id", "name", "slug", "timezone", "currency",
  "business_hours", "settings", "plan", "active", "created_at"
) VALUES (
  'b82be9de-08f0-45de-8ddd-1f020b31a687',
  'My-food-store',
  'my-food-store',
  'America/Lima',
  'PEN',
  '{"open": "08:00", "close": "22:00"}'::jsonb,
  '{"theme": "default", "language": "es"}'::jsonb,
  'free',
  true,
  now()
);

INSERT INTO "auth_tenants" (
  "id", "name", "slug", "timezone", "currency",
  "business_hours", "settings", "plan", "active", "created_at"
) VALUES (
  '3a8b8e62-8542-41ae-ab3b-a36211065cdf',
  'My-second-food-store',
  'my-second-food-store',
  'America/Lima',
  'PEN',
  '{"open": "08:00", "close": "22:00"}'::jsonb,
  '{"theme": "default", "language": "es"}'::jsonb,
  'free',
  true,
  now()
);

-- ------------------------------------------------------------
-- 2. Usuario
--    email: owner@my-food-store.com
--    password: Password123!
-- ------------------------------------------------------------
INSERT INTO "auth_users" (
  "id", "email", "password_hash", "full_name", "active", "created_at"
) VALUES (
  'cf5eff28-217c-4681-bd13-7f8213e8a385',
  'owner@my-food-store.com',
  '$argon2id$v=19$m=65536,t=3,p=4$OEZdF+EEVa3hUR0PloBmkQ$pVl4sZOuqk3nYC4+GqkJVo5/sMLzZi53r4mhQJRhw44',
  'María Owner',
  true,
  now()
);

-- ------------------------------------------------------------
-- 3. Membresía usuario <-> tenant (rol OWNER)
-- ------------------------------------------------------------
INSERT INTO "auth_user_tenants" (
  "id", "user_id", "tenant_id", "role", "active", "created_at"
) VALUES (
  '5b9e547b-ec39-435b-8997-34c122a4b4e6',
  'cf5eff28-217c-4681-bd13-7f8213e8a385',
  'b82be9de-08f0-45de-8ddd-1f020b31a687',
  'OWNER',
  true,
  now()
);

INSERT INTO "auth_user_tenants" (
  "id", "user_id", "tenant_id", "role", "active", "created_at"
) VALUES (
  'ad5c1d3a-717e-47e2-a06f-cdb6749d2c91',
  'cf5eff28-217c-4681-bd13-7f8213e8a385',
  '3a8b8e62-8542-41ae-ab3b-a36211065cdf',
  'OWNER',
  true,
  now()
);

-- ------------------------------------------------------------
-- 4. Refresh token (activo, expira en 30 días)
-- ------------------------------------------------------------
INSERT INTO "auth_refresh_tokens" (
  "id", "user_id", "current_tenant_id", "token_hash",
  "expires_at", "revoked_at", "created_at"
) VALUES (
  '40b96f27-c783-4f02-8ac8-1eff6f8ff89a',
  'cf5eff28-217c-4681-bd13-7f8213e8a385',
  'b82be9de-08f0-45de-8ddd-1f020b31a687',
  -- sha256 de 'example-refresh-token' (valor ficticio para el seed)
  '38e87049ba3c2f2d8c3b0d84a9ab51c1ff3f990aac3d8aa1ea03f53cadb46e9b',
  now() + interval '30 days',
  NULL,
  now()
);

-- ------------------------------------------------------------
-- 5. Turno del staff (clock_in y clock_out del día)
-- ------------------------------------------------------------
INSERT INTO "auth_staff_shifts" (
  "id", "tenant_id", "user_tenant_id", "clock_in", "clock_out", "created_at"
) VALUES (
  '7aebd363-24c3-42c1-a9f3-8acc0b277838',
  'b82be9de-08f0-45de-8ddd-1f020b31a687',
  '5b9e547b-ec39-435b-8997-34c122a4b4e6',
  now() - interval '8 hours',
  now(),
  now()
);

COMMIT;
