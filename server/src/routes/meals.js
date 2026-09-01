import { Router } from 'express';
import { db } from '../db/connection.js';
import { buildPlan } from '../db/planQueries.js';

export const mealsRouter = Router();

function planIdForMeal(mealId) {
  const meal = db.prepare('SELECT plan_id FROM plan_meals WHERE id = ?').get(mealId);
  return meal?.plan_id ?? null;
}

mealsRouter.put('/:id', (req, res) => {
  const meal = db.prepare('SELECT * FROM plan_meals WHERE id = ?').get(req.params.id);
  if (!meal) return res.status(404).json({ error: 'Comida no encontrada' });

  db.prepare('UPDATE plan_meals SET name = ?, sort_order = ? WHERE id = ?').run(
    req.body.name ?? meal.name,
    req.body.sort_order ?? meal.sort_order,
    req.params.id
  );

  res.json(buildPlan(meal.plan_id));
});

mealsRouter.delete('/:id', (req, res) => {
  const planId = planIdForMeal(req.params.id);
  if (!planId) return res.status(404).json({ error: 'Comida no encontrada' });

  db.prepare('DELETE FROM plan_meals WHERE id = ?').run(req.params.id);
  res.json(buildPlan(planId));
});

mealsRouter.post('/:id/items', (req, res) => {
  const meal = db.prepare('SELECT * FROM plan_meals WHERE id = ?').get(req.params.id);
  if (!meal) return res.status(404).json({ error: 'Comida no encontrada' });

  const { food_id, equivalents } = req.body;
  if (!food_id) return res.status(400).json({ error: 'food_id es requerido' });

  db.prepare('INSERT INTO plan_meal_items (plan_meal_id, food_id, equivalents) VALUES (?, ?, ?)').run(
    req.params.id,
    food_id,
    equivalents ?? 1
  );

  res.status(201).json(buildPlan(meal.plan_id));
});
