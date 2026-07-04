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
-- tenant:       11111111-1111-1111-1111-111111111111
-- user:         22222222-2222-2222-2222-222222222222
-- user_tenant:  33333333-3333-3333-3333-333333333333
-- refresh_token:44444444-4444-4444-4444-444444444444
-- staff_shift:  55555555-5555-5555-5555-555555555555

-- ------------------------------------------------------------
-- 1. Tenant
-- ------------------------------------------------------------
INSERT INTO "tenants" (
  "id", "name", "slug", "timezone", "currency",
  "business_hours", "settings", "plan", "active", "created_at"
) VALUES (
  '11111111-1111-1111-1111-111111111111',
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

-- ------------------------------------------------------------
-- 2. Usuario
--    email: owner@my-food-store.com
--    password: Password123!
-- ------------------------------------------------------------
INSERT INTO "users" (
  "id", "email", "password_hash", "full_name", "active", "created_at"
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  'owner@my-food-store.com',
  '$argon2id$v=19$m=65536,t=3,p=4$OEZdF+EEVa3hUR0PloBmkQ$pVl4sZOuqk3nYC4+GqkJVo5/sMLzZi53r4mhQJRhw44',
  'María Owner',
  true,
  now()
);

-- ------------------------------------------------------------
-- 3. Membresía usuario <-> tenant (rol OWNER)
-- ------------------------------------------------------------
INSERT INTO "user_tenants" (
  "id", "user_id", "tenant_id", "role", "active", "created_at"
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'OWNER',
  true,
  now()
);

-- ------------------------------------------------------------
-- 4. Refresh token (activo, expira en 30 días)
-- ------------------------------------------------------------
INSERT INTO "refresh_tokens" (
  "id", "user_id", "current_tenant_id", "token_hash",
  "expires_at", "revoked_at", "created_at"
) VALUES (
  '44444444-4444-4444-4444-444444444444',
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  -- sha256 de 'example-refresh-token' (valor ficticio para el seed)
  '38e87049ba3c2f2d8c3b0d84a9ab51c1ff3f990aac3d8aa1ea03f53cadb46e9b',
  now() + interval '30 days',
  NULL,
  now()
);

-- ------------------------------------------------------------
-- 5. Turno del staff (clock_in y clock_out del día)
-- ------------------------------------------------------------
INSERT INTO "staff_shifts" (
  "id", "tenant_id", "user_tenant_id", "clock_in", "clock_out", "created_at"
) VALUES (
  '55555555-5555-5555-5555-555555555555',
  '11111111-1111-1111-1111-111111111111',
  '33333333-3333-3333-3333-333333333333',
  now() - interval '8 hours',
  now(),
  now()
);

COMMIT;
