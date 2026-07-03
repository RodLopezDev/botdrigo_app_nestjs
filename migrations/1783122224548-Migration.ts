import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1783122224548 implements MigrationInterface {
  name = 'Migration1783122224548';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "tenants" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" text NOT NULL, "slug" text NOT NULL, "timezone" text NOT NULL DEFAULT 'America/Lima', "currency" text NOT NULL DEFAULT 'PEN', "business_hours" jsonb, "settings" jsonb NOT NULL DEFAULT '{}', "plan" text NOT NULL DEFAULT 'free', "active" boolean NOT NULL DEFAULT true, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_2310ecc5cb8be427097154b18fc" UNIQUE ("slug"), CONSTRAINT "PK_53be67a04681c66b87ee27c9321" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."tenant_role" AS ENUM('OWNER', 'ADMIN', 'WAITER', 'COOK', 'CASHIER')`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_tenants" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "tenant_id" uuid NOT NULL, "role" "public"."tenant_role" NOT NULL, "active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_01847c3ffef489ea549f205d1ed" UNIQUE ("user_id", "tenant_id"), CONSTRAINT "PK_aff681c6ee0171ce3cb116ea83f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_user_tenants_user" ON "user_tenants"  ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_user_tenants_tenant" ON "user_tenants"  ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" text NOT NULL, "password_hash" text NOT NULL, "full_name" text NOT NULL, "active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "refresh_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "current_tenant_id" uuid, "token_hash" text NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "revoked_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "staff_shifts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenant_id" uuid NOT NULL, "user_tenant_id" uuid NOT NULL, "clock_in" TIMESTAMP WITH TIME ZONE NOT NULL, "clock_out" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "chk_clock_out_after_in" CHECK ("clock_out" IS NULL OR "clock_out" > "clock_in"), CONSTRAINT "PK_7861d1bb0a4252ed8d3f5107656" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_staff_shifts_tenant" ON "staff_shifts"  ("tenant_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tenants" ADD CONSTRAINT "FK_63a8ef4ed4fad61231cdfc3dc63" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tenants" ADD CONSTRAINT "FK_a1feca39273dfd9a32c7cc4153c" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_f86f3bc07f1e570357a38e061dc" FOREIGN KEY ("current_tenant_id") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "staff_shifts" ADD CONSTRAINT "FK_94b8592504f74b5f53459889762" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "staff_shifts" ADD CONSTRAINT "FK_7b0604d73fdcb01d4820b6fbb4d" FOREIGN KEY ("user_tenant_id") REFERENCES "user_tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "staff_shifts" DROP CONSTRAINT "FK_7b0604d73fdcb01d4820b6fbb4d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "staff_shifts" DROP CONSTRAINT "FK_94b8592504f74b5f53459889762"`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_f86f3bc07f1e570357a38e061dc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tenants" DROP CONSTRAINT "FK_a1feca39273dfd9a32c7cc4153c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tenants" DROP CONSTRAINT "FK_63a8ef4ed4fad61231cdfc3dc63"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_staff_shifts_tenant"`);
    await queryRunner.query(`DROP TABLE "staff_shifts"`);
    await queryRunner.query(`DROP TABLE "refresh_tokens"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP INDEX "public"."idx_user_tenants_tenant"`);
    await queryRunner.query(`DROP INDEX "public"."idx_user_tenants_user"`);
    await queryRunner.query(`DROP TABLE "user_tenants"`);
    await queryRunner.query(`DROP TYPE "public"."tenant_role"`);
    await queryRunner.query(`DROP TABLE "tenants"`);
  }
}
