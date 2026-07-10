import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1783136154097 implements MigrationInterface {
  name = 'Migration1783136154097';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "auth_tenants" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" text NOT NULL, "slug" text NOT NULL, "timezone" text NOT NULL DEFAULT 'America/Lima', "currency" text NOT NULL DEFAULT 'PEN', "business_hours" jsonb, "settings" jsonb NOT NULL DEFAULT '{}', "plan" text NOT NULL DEFAULT 'free', "active" boolean NOT NULL DEFAULT true, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_72eace2ba750e68ed08599a3d9b" UNIQUE ("slug"), CONSTRAINT "PK_bac456e1348c37bc6fb670438d0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."tenant_role" AS ENUM('OWNER', 'ADMIN', 'WAITER', 'COOK', 'CASHIER')`,
    );
    await queryRunner.query(
      `CREATE TABLE "auth_user_tenants" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "tenant_id" uuid NOT NULL, "role" "public"."tenant_role" NOT NULL, "active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_7d42a919c74461925d7fb227c78" UNIQUE ("user_id", "tenant_id"), CONSTRAINT "PK_b5ab9bb0eee1a06a3eeb1da0fad" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_user_tenants_user" ON "auth_user_tenants"  ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_user_tenants_tenant" ON "auth_user_tenants"  ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "auth_users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" text NOT NULL, "password_hash" text NOT NULL, "full_name" text NOT NULL, "active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_13d8b49e55a8b06bee6bbc828fb" UNIQUE ("email"), CONSTRAINT "PK_c88cc8077366b470dafc2917366" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "auth_refresh_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "current_tenant_id" uuid, "token_hash" text NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "revoked_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_df6893d2063a4ea7bbf1eda31e5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "auth_staff_shifts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenant_id" uuid NOT NULL, "user_tenant_id" uuid NOT NULL, "clock_in" TIMESTAMP WITH TIME ZONE NOT NULL, "clock_out" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "chk_clock_out_after_in" CHECK ("clock_out" IS NULL OR "clock_out" > "clock_in"), CONSTRAINT "PK_48606e154dbf232adf4a093a34e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_staff_shifts_tenant" ON "auth_staff_shifts"  ("tenant_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "auth_user_tenants" ADD CONSTRAINT "FK_07f444501ead753fa0541cb300d" FOREIGN KEY ("user_id") REFERENCES "auth_users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth_user_tenants" ADD CONSTRAINT "FK_dae2bb471d560a689ba0c7c1382" FOREIGN KEY ("tenant_id") REFERENCES "auth_tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth_refresh_tokens" ADD CONSTRAINT "FK_f795ad14f31838e3ddc663ee150" FOREIGN KEY ("user_id") REFERENCES "auth_users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth_refresh_tokens" ADD CONSTRAINT "FK_35829d415d7137357600d4746f1" FOREIGN KEY ("current_tenant_id") REFERENCES "auth_tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth_staff_shifts" ADD CONSTRAINT "FK_99981e9c8bf9557903dbe04e480" FOREIGN KEY ("tenant_id") REFERENCES "auth_tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth_staff_shifts" ADD CONSTRAINT "FK_15bf01679dac0946531ec512c65" FOREIGN KEY ("user_tenant_id") REFERENCES "auth_user_tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "auth_staff_shifts" DROP CONSTRAINT "FK_15bf01679dac0946531ec512c65"`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth_staff_shifts" DROP CONSTRAINT "FK_99981e9c8bf9557903dbe04e480"`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth_refresh_tokens" DROP CONSTRAINT "FK_35829d415d7137357600d4746f1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth_refresh_tokens" DROP CONSTRAINT "FK_f795ad14f31838e3ddc663ee150"`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth_user_tenants" DROP CONSTRAINT "FK_dae2bb471d560a689ba0c7c1382"`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth_user_tenants" DROP CONSTRAINT "FK_07f444501ead753fa0541cb300d"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_staff_shifts_tenant"`);
    await queryRunner.query(`DROP TABLE "auth_staff_shifts"`);
    await queryRunner.query(`DROP TABLE "auth_refresh_tokens"`);
    await queryRunner.query(`DROP TABLE "auth_users"`);
    await queryRunner.query(`DROP INDEX "public"."idx_user_tenants_tenant"`);
    await queryRunner.query(`DROP INDEX "public"."idx_user_tenants_user"`);
    await queryRunner.query(`DROP TABLE "auth_user_tenants"`);
    await queryRunner.query(`DROP TYPE "public"."tenant_role"`);
    await queryRunner.query(`DROP TABLE "auth_tenants"`);
  }
}
