import { MigrationInterface, QueryRunner } from 'typeorm';

const VIEW_EXPRESSION = `SELECT
      d.id            AS dish_id,
      d.tenant_id     AS tenant_id,
      d.sale_price    AS sale_price,
      SUM(di.quantity * i.cost_per_unit) AS theoretical_cost,
      ROUND(
        SUM(di.quantity * i.cost_per_unit) / NULLIF(d.sale_price, 0) * 100,
        2
      ) AS food_cost_pct
    FROM catalog_dishes d
    JOIN catalog_dish_ingredients di ON di.dish_id = d.id AND di.deleted = false
    JOIN catalog_ingredients i ON i.id = di.ingredient_id AND i.deleted = false
    WHERE d.deleted = false
    GROUP BY d.id, d.tenant_id, d.sale_price`;

const PREVIOUS_VIEW_EXPRESSION = `SELECT
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
    GROUP BY d.id, d.tenant_id, d.sale_price`;

export class CatalogSoftDelete1783806720000 implements MigrationInterface {
  name = 'CatalogSoftDelete1783806720000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "catalog_categories" ADD "deleted" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "catalog_dishes" ADD "deleted" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "catalog_ingredients" ADD "deleted" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "catalog_dish_ingredients" ADD "deleted" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "catalog_dish_combo_items" ADD "deleted" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "catalog_dish_price_history" ADD "deleted" boolean NOT NULL DEFAULT false`,
    );

    await queryRunner.query(
      `ALTER TABLE "catalog_categories" DROP CONSTRAINT "UQ_cb3bf1dd914fad1b1a0276196c7"`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_categories_tenant_name_active" ON "catalog_categories" ("tenant_id", "name") WHERE "deleted" = false`,
    );

    await queryRunner.query(
      `ALTER TABLE "catalog_ingredients" DROP CONSTRAINT "UQ_570a38d2ac44ff8e8f5f3aa9bf6"`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_ingredients_tenant_name_active" ON "catalog_ingredients" ("tenant_id", "name") WHERE "deleted" = false`,
    );

    await queryRunner.query(
      `ALTER TABLE "catalog_dish_ingredients" DROP CONSTRAINT "UQ_551a4001765d04da14a55bab860"`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_dish_ingredients_dish_ingredient_active" ON "catalog_dish_ingredients" ("dish_id", "ingredient_id") WHERE "deleted" = false`,
    );

    await queryRunner.query(
      `ALTER TABLE "catalog_dish_combo_items" DROP CONSTRAINT "UQ_992cfe8044de9e73d5acef590c8"`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_combo_items_combo_component_active" ON "catalog_dish_combo_items" ("combo_dish_id", "component_dish_id") WHERE "deleted" = false`,
    );

    await queryRunner.query(
      `ALTER TABLE "catalog_dish_ingredients" DROP CONSTRAINT "FK_d767d76d0f19129b918786c6905"`,
    );
    await queryRunner.query(
      `ALTER TABLE "catalog_dish_ingredients" ADD CONSTRAINT "FK_d767d76d0f19129b918786c6905" FOREIGN KEY ("dish_id") REFERENCES "catalog_dishes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "catalog_dish_combo_items" DROP CONSTRAINT "FK_2e83d51216973989b007f82bd51"`,
    );
    await queryRunner.query(
      `ALTER TABLE "catalog_dish_combo_items" ADD CONSTRAINT "FK_2e83d51216973989b007f82bd51" FOREIGN KEY ("combo_dish_id") REFERENCES "catalog_dishes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "catalog_dish_price_history" DROP CONSTRAINT "FK_d6ed62b9c661fa8ad9d994fca06"`,
    );
    await queryRunner.query(
      `ALTER TABLE "catalog_dish_price_history" ADD CONSTRAINT "FK_d6ed62b9c661fa8ad9d994fca06" FOREIGN KEY ("dish_id") REFERENCES "catalog_dishes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    await queryRunner.query(`DROP VIEW "catalog_dish_theoretical_cost"`);
    await queryRunner.query(
      `CREATE VIEW "catalog_dish_theoretical_cost" AS ${VIEW_EXPRESSION}`,
    );
    await queryRunner.query(
      `UPDATE "typeorm_metadata" SET "value" = $1 WHERE "type" = $2 AND "name" = $3 AND "schema" = $4`,
      [VIEW_EXPRESSION, 'VIEW', 'catalog_dish_theoretical_cost', 'public'],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP VIEW "catalog_dish_theoretical_cost"`);
    await queryRunner.query(
      `CREATE VIEW "catalog_dish_theoretical_cost" AS ${PREVIOUS_VIEW_EXPRESSION}`,
    );
    await queryRunner.query(
      `UPDATE "typeorm_metadata" SET "value" = $1 WHERE "type" = $2 AND "name" = $3 AND "schema" = $4`,
      [
        PREVIOUS_VIEW_EXPRESSION,
        'VIEW',
        'catalog_dish_theoretical_cost',
        'public',
      ],
    );

    await queryRunner.query(
      `ALTER TABLE "catalog_dish_price_history" DROP CONSTRAINT "FK_d6ed62b9c661fa8ad9d994fca06"`,
    );
    await queryRunner.query(
      `ALTER TABLE "catalog_dish_price_history" ADD CONSTRAINT "FK_d6ed62b9c661fa8ad9d994fca06" FOREIGN KEY ("dish_id") REFERENCES "catalog_dishes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "catalog_dish_combo_items" DROP CONSTRAINT "FK_2e83d51216973989b007f82bd51"`,
    );
    await queryRunner.query(
      `ALTER TABLE "catalog_dish_combo_items" ADD CONSTRAINT "FK_2e83d51216973989b007f82bd51" FOREIGN KEY ("combo_dish_id") REFERENCES "catalog_dishes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "catalog_dish_ingredients" DROP CONSTRAINT "FK_d767d76d0f19129b918786c6905"`,
    );
    await queryRunner.query(
      `ALTER TABLE "catalog_dish_ingredients" ADD CONSTRAINT "FK_d767d76d0f19129b918786c6905" FOREIGN KEY ("dish_id") REFERENCES "catalog_dishes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `DROP INDEX "public"."uq_combo_items_combo_component_active"`,
    );
    await queryRunner.query(
      `ALTER TABLE "catalog_dish_combo_items" ADD CONSTRAINT "UQ_992cfe8044de9e73d5acef590c8" UNIQUE ("combo_dish_id", "component_dish_id")`,
    );

    await queryRunner.query(
      `DROP INDEX "public"."uq_dish_ingredients_dish_ingredient_active"`,
    );
    await queryRunner.query(
      `ALTER TABLE "catalog_dish_ingredients" ADD CONSTRAINT "UQ_551a4001765d04da14a55bab860" UNIQUE ("dish_id", "ingredient_id")`,
    );

    await queryRunner.query(
      `DROP INDEX "public"."uq_ingredients_tenant_name_active"`,
    );
    await queryRunner.query(
      `ALTER TABLE "catalog_ingredients" ADD CONSTRAINT "UQ_570a38d2ac44ff8e8f5f3aa9bf6" UNIQUE ("tenant_id", "name")`,
    );

    await queryRunner.query(
      `DROP INDEX "public"."uq_categories_tenant_name_active"`,
    );
    await queryRunner.query(
      `ALTER TABLE "catalog_categories" ADD CONSTRAINT "UQ_cb3bf1dd914fad1b1a0276196c7" UNIQUE ("tenant_id", "name")`,
    );

    await queryRunner.query(
      `ALTER TABLE "catalog_dish_price_history" DROP COLUMN "deleted"`,
    );
    await queryRunner.query(
      `ALTER TABLE "catalog_dish_combo_items" DROP COLUMN "deleted"`,
    );
    await queryRunner.query(
      `ALTER TABLE "catalog_dish_ingredients" DROP COLUMN "deleted"`,
    );
    await queryRunner.query(
      `ALTER TABLE "catalog_ingredients" DROP COLUMN "deleted"`,
    );
    await queryRunner.query(
      `ALTER TABLE "catalog_dishes" DROP COLUMN "deleted"`,
    );
    await queryRunner.query(
      `ALTER TABLE "catalog_categories" DROP COLUMN "deleted"`,
    );
  }
}
