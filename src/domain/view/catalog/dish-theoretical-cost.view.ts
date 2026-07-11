import { ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity({
  name: 'catalog_dish_theoretical_cost',
  expression: `
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
    JOIN catalog_dish_ingredients di ON di.dish_id = d.id AND di.deleted = false
    JOIN catalog_ingredients i ON i.id = di.ingredient_id AND i.deleted = false
    WHERE d.deleted = false
    GROUP BY d.id, d.tenant_id, d.sale_price
  `,
})
export class DishTheoreticalCost {
  @ViewColumn({ name: 'dish_id' })
  dishId: string;

  @ViewColumn({ name: 'tenant_id' })
  tenantId: string;

  @ViewColumn({ name: 'sale_price' })
  salePrice: string;

  @ViewColumn({ name: 'theoretical_cost' })
  theoreticalCost: string;

  @ViewColumn({ name: 'food_cost_pct' })
  foodCostPct: string;
}
