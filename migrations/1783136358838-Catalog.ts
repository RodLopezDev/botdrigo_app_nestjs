import { MigrationInterface, QueryRunner } from 'typeorm';

export class Catalog1783136358838 implements MigrationInterface {
  name = 'Catalog1783136358838';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."ingredient_unit" AS ENUM('g', 'ml', 'unit')`,
    );
    await queryRunner.query(
      `CREATE TABLE "catalog_ingredients" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenant_id" uuid NOT NULL, "name" text NOT NULL, "unit" "public"."ingredient_unit" NOT NULL, "cost_per_unit" numeric(10,4) NOT NULL, "stock_quantity" numeric(10,2), "active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_570a38d2ac44ff8e8f5f3aa9bf6" UNIQUE ("tenant_id", "name"), CONSTRAINT "chk_ingredient_cost_non_negative" CHECK ("cost_per_unit" >= 0), CONSTRAINT "PK_cbd2e1e7055cc9cdffd4aeaf8d0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "catalog_dish_ingredients" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenant_id" uuid NOT NULL, "dish_id" uuid NOT NULL, "ingredient_id" uuid NOT NULL, "quantity" numeric(10,3) NOT NULL, CONSTRAINT "UQ_551a4001765d04da14a55bab860" UNIQUE ("dish_id", "ingredient_id"), CONSTRAINT "chk_dish_ingredient_quantity_positive" CHECK ("quantity" > 0), CONSTRAINT "PK_c8d2e246567ac9a79245dc3b031" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "catalog_dish_combo_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenant_id" uuid NOT NULL, "combo_dish_id" uuid NOT NULL, "component_dish_id" uuid NOT NULL, "quantity" integer NOT NULL DEFAULT '1', CONSTRAINT "UQ_992cfe8044de9e73d5acef590c8" UNIQUE ("combo_dish_id", "component_dish_id"), CONSTRAINT "chk_combo_distinct_dish" CHECK ("combo_dish_id" <> "component_dish_id"), CONSTRAINT "chk_combo_quantity_positive" CHECK ("quantity" > 0), CONSTRAINT "PK_08d8dc67b89b39a04511407da1e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "catalog_dish_price_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenant_id" uuid NOT NULL, "dish_id" uuid NOT NULL, "old_sale_price" numeric(10,2) NOT NULL, "new_sale_price" numeric(10,2) NOT NULL, "changed_by" uuid NOT NULL, "changed_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_367c0b1ca09c503af0b10990747" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_dish_price_history_dish" ON "catalog_dish_price_history"  ("dish_id", "changed_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "catalog_dishes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenant_id" uuid NOT NULL, "category_id" uuid, "name" text NOT NULL, "description" text, "sale_price" numeric(10,2) NOT NULL, "target_food_cost_pct" numeric(5,2) NOT NULL DEFAULT '30', "is_combo" boolean NOT NULL DEFAULT false, "active" boolean NOT NULL DEFAULT true, "image_url" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "chk_dish_target_food_cost_pct" CHECK ("target_food_cost_pct" > 0 AND "target_food_cost_pct" <= 100), CONSTRAINT "chk_dish_sale_price_non_negative" CHECK ("sale_price" >= 0), CONSTRAINT "PK_3ffc10b84d2e4a322a9797d315c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_dishes_tenant_active" ON "catalog_dishes"  ("tenant_id", "active") `,
    );
    await queryRunner.query(
      `CREATE TABLE "catalog_categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenant_id" uuid NOT NULL, "name" text NOT NULL, "sort_order" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_cb3bf1dd914fad1b1a0276196c7" UNIQUE ("tenant_id", "name"), CONSTRAINT "PK_e22b0520ebd3477c52ff4307dc2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "catalog_ingredients" ADD CONSTRAINT "FK_26177ac04c015eef5fc85dfca71" FOREIGN KEY ("tenant_id") REFERENCES "auth_tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "catalog_dish_ingredients" ADD CONSTRAINT "FK_d399860981de6f1e3b762106e3c" FOREIGN KEY ("tenant_id") REFERENCES "auth_tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "catalog_dish_ingredients" ADD CONSTRAINT "FK_d767d76d0f19129b918786c6905" FOREIGN KEY ("dish_id") REFERENCES "catalog_dishes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "catalog_dish_ingredients" ADD CONSTRAINT "FK_844cfd49d8380d3750957c3e546" FOREIGN KEY ("ingredient_id") REFERENCES "catalog_ingredients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "catalog_dish_combo_items" ADD CONSTRAINT "FK_3d28b158a9df9394e9846ad1d9d" FOREIGN KEY ("tenant_id") REFERENCES "auth_tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "catalog_dish_combo_items" ADD CONSTRAINT "FK_2e83d51216973989b007f82bd51" FOREIGN KEY ("combo_dish_id") REFERENCES "catalog_dishes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "catalog_dish_combo_items" ADD CONSTRAINT "FK_f6b8b0207fd99d717e5bd1b7361" FOREIGN KEY ("component_dish_id") REFERENCES "catalog_dishes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "catalog_dish_price_history" ADD CONSTRAINT "FK_b32023f4ce617e162762f4c5c63" FOREIGN KEY ("tenant_id") REFERENCES "auth_tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "catalog_dish_price_history" ADD CONSTRAINT "FK_d6ed62b9c661fa8ad9d994fca06" FOREIGN KEY ("dish_id") REFERENCES "catalog_dishes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "catalog_dish_price_history" ADD CONSTRAINT "FK_7000f73750487aeb25f26b377f5" FOREIGN KEY ("changed_by") REFERENCES "auth_users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "catalog_dishes" ADD CONSTRAINT "FK_188165f0aac3701e10b2dafb020" FOREIGN KEY ("tenant_id") REFERENCES "auth_tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "catalog_dishes" ADD CONSTRAINT "FK_c4eb80c82c3fb4a816315d3992b" FOREIGN KEY ("category_id") REFERENCES "catalog_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "catalog_categories" ADD CONSTRAINT "FK_6117985c127942f750bc2da2a91" FOREIGN KEY ("tenant_id") REFERENCES "auth_tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`CREATE VIEW "catalog_dish_theoretical_cost" AS 
    SELECT
      d.id            AS dish_id,
      d.tenant_id     AS tenant_id,
      d.sale_price    AS sale_price,
      SUM(di.quantity * i.cost_per_unit) AS theoretical_cost,
      ROUND(
        SUM(di.quantity * i.cost_per_unit) / NULLIF(d.sale_price, 0) * 100,
        2
      ) AS food_cost_pct
    FROM catalog_dishes d
    JOIN catalog_dish_ingredients di ON di.dish_id = d.id
    JOIN catalog_ingredients i ON i.id = di.ingredient_id
    GROUP BY d.id, d.tenant_id, d.sale_price
  `);
    await queryRunner.query(
      `INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      [
        'public',
        'VIEW',
        'catalog_dish_theoretical_cost',
        'SELECT\n      d.id            AS dish_id,\n      d.tenant_id     AS tenant_id,\n      d.sale_price    AS sale_price,\n      SUM(di.quantity * i.cost_per_unit) AS theoretical_cost,\n      ROUND(\n        SUM(di.quantity * i.cost_per_unit) / NULLIF(d.sale_price, 0) * 100,\n        2\n      ) AS food_cost_pct\n    FROM catalog_dishes d\n    JOIN catalog_dish_ingredients di ON di.dish_id = d.id\n    JOIN catalog_ingredients i ON i.id = di.ingredient_id\n    GROUP BY d.id, d.tenant_id, d.sale_price',
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ['VIEW', 'catalog_dish_theoretical_cost', 'public'],
    );
    await queryRunner.query(`DROP VIEW "catalog_dish_theoretical_cost"`);
    await queryRunner.query(
      `ALTER TABLE "catalog_categories" DROP CONSTRAINT "FK_6117985c127942f750bc2da2a91"`,
    );
    await queryRunner.query(
      `ALTER TABLE "catalog_dishes" DROP CONSTRAINT "FK_c4eb80c82c3fb4a816315d3992b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "catalog_dishes" DROP CONSTRAINT "FK_188165f0aac3701e10b2dafb020"`,
    );
    await queryRunner.query(
      `ALTER TABLE "catalog_dish_price_history" DROP CONSTRAINT "FK_7000f73750487aeb25f26b377f5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "catalog_dish_price_history" DROP CONSTRAINT "FK_d6ed62b9c661fa8ad9d994fca06"`,
    );
    await queryRunner.query(
      `ALTER TABLE "catalog_dish_price_history" DROP CONSTRAINT "FK_b32023f4ce617e162762f4c5c63"`,
    );
    await queryRunner.query(
      `ALTER TABLE "catalog_dish_combo_items" DROP CONSTRAINT "FK_f6b8b0207fd99d717e5bd1b7361"`,
    );
    await queryRunner.query(
      `ALTER TABLE "catalog_dish_combo_items" DROP CONSTRAINT "FK_2e83d51216973989b007f82bd51"`,
    );
    await queryRunner.query(
      `ALTER TABLE "catalog_dish_combo_items" DROP CONSTRAINT "FK_3d28b158a9df9394e9846ad1d9d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "catalog_dish_ingredients" DROP CONSTRAINT "FK_844cfd49d8380d3750957c3e546"`,
    );
    await queryRunner.query(
      `ALTER TABLE "catalog_dish_ingredients" DROP CONSTRAINT "FK_d767d76d0f19129b918786c6905"`,
    );
    await queryRunner.query(
      `ALTER TABLE "catalog_dish_ingredients" DROP CONSTRAINT "FK_d399860981de6f1e3b762106e3c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "catalog_ingredients" DROP CONSTRAINT "FK_26177ac04c015eef5fc85dfca71"`,
    );
    await queryRunner.query(`DROP TABLE "catalog_categories"`);
    await queryRunner.query(`DROP INDEX "public"."idx_dishes_tenant_active"`);
    await queryRunner.query(`DROP TABLE "catalog_dishes"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_dish_price_history_dish"`,
    );
    await queryRunner.query(`DROP TABLE "catalog_dish_price_history"`);
    await queryRunner.query(`DROP TABLE "catalog_dish_combo_items"`);
    await queryRunner.query(`DROP TABLE "catalog_dish_ingredients"`);
    await queryRunner.query(`DROP TABLE "catalog_ingredients"`);
    await queryRunner.query(`DROP TYPE "public"."ingredient_unit"`);
  }
}
