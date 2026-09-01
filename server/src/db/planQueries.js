import { db } from './connection.js';

// Construye la representación completa de un plan: metas por grupo,
// comidas con sus alimentos, y el resumen nutrimental (real vs. meta).
export function buildPlan(planId) {
  const plan = db.prepare('SELECT * FROM meal_plans WHERE id = ?').get(planId);
  if (!plan) return null;

  const groups = db.prepare('SELECT * FROM food_groups ORDER BY sort_order ASC').all();

  const targetsRows = db
    .prepare('SELECT group_id, equivalents FROM plan_group_targets WHERE plan_id = ?')
    .all(planId);
  const targetsByGroup = Object.fromEntries(targetsRows.map((t) => [t.group_id, t.equivalents]));

  const meals = db
    .prepare('SELECT * FROM plan_meals WHERE plan_id = ? ORDER BY sort_order ASC, id ASC')
    .all(planId);

  const itemStmt = db.prepare(`
    SELECT plan_meal_items.id, plan_meal_items.equivalents, foods.id AS food_id,
           foods.name, foods.portion_description, foods.portion_grams,
           foods.kcal AS unit_kcal, foods.protein_g AS unit_protein_g,
           foods.carbs_g AS unit_carbs_g, foods.lipids_g AS unit_lipids_g,
           foods.group_id, food_groups.key AS group_key, food_groups.name AS group_name
    FROM plan_meal_items
    JOIN foods ON foods.id = plan_meal_items.food_id
    JOIN food_groups ON food_groups.id = foods.group_id
    WHERE plan_meal_items.plan_meal_id = ?
    ORDER BY plan_meal_items.id ASC
  `);

  const zeroTotals = () => ({ kcal: 0, protein_g: 0, carbs_g: 0, lipids_g: 0 });
  const addTotals = (a, b, factor = 1) => ({
    kcal: a.kcal + b.kcal * factor,
    protein_g: a.protein_g + b.protein_g * factor,
    carbs_g: a.carbs_g + b.carbs_g * factor,
    lipids_g: a.lipids_g + b.lipids_g * factor,
  });

  const dayTotals = zeroTotals();
  const equivalentsByGroup = {};

  const mealsOut = meals.map((meal) => {
    const items = itemStmt.all(meal.id).map((row) => ({
      id: row.id,
      equivalents: row.equivalents,
      food: {
        id: row.food_id,
        name: row.name,
        portion_description: row.portion_description,
        portion_grams: row.portion_grams,
        kcal: row.unit_kcal,
        protein_g: row.unit_protein_g,
        carbs_g: row.unit_carbs_g,
        lipids_g: row.unit_lipids_g,
        group_id: row.group_id,
        group_key: row.group_key,
        group_name: row.group_name,
      },
    }));

    let mealTotals = zeroTotals();
    for (const item of items) {
      mealTotals = addTotals(mealTotals, item.food, item.equivalents);
      equivalentsByGroup[item.food.group_id] =
        (equivalentsByGroup[item.food.group_id] || 0) + item.equivalents;
    }

    return { ...meal, items, totals: mealTotals };
  });

  for (const meal of mealsOut) {
    dayTotals.kcal += meal.totals.kcal;
    dayTotals.protein_g += meal.totals.protein_g;
    dayTotals.carbs_g += meal.totals.carbs_g;
    dayTotals.lipids_g += meal.totals.lipids_g;
  }

  const groupSummary = groups.map((g) => {
    const target = targetsByGroup[g.id] || 0;
    const actual = equivalentsByGroup[g.id] || 0;
    return {
      group_id: g.id,
      group_key: g.key,
      group_name: g.name,
      target_equivalents: target,
      actual_equivalents: actual,
      difference: actual - target,
    };
  });

  const targetTotals = groupSummary.reduce(
    (acc, g) => {
      const group = groups.find((x) => x.id === g.group_id);
      return addTotals(acc, group, g.target_equivalents);
    },
    zeroTotals()
  );

  return {
    ...plan,
    meals: mealsOut,
    group_summary: groupSummary,
    totals: { day: dayTotals, target: targetTotals },
  };
}
