import { Router } from 'express';
import { db } from '../db/connection.js';
import { buildPlan } from '../db/planQueries.js';

export const itemsRouter = Router();

function planIdForItem(itemId) {
  const row = db
    .prepare(`
      SELECT plan_meals.plan_id AS plan_id
      FROM plan_meal_items
      JOIN plan_meals ON plan_meals.id = plan_meal_items.plan_meal_id
      WHERE plan_meal_items.id = ?
    `)
    .get(itemId);
  return row?.plan_id ?? null;
}

itemsRouter.put('/:id', (req, res) => {
  const planId = planIdForItem(req.params.id);
  if (!planId) return res.status(404).json({ error: 'Ítem no encontrado' });

  db.prepare('UPDATE plan_meal_items SET equivalents = ? WHERE id = ?').run(
    req.body.equivalents,
    req.params.id
  );

  res.json(buildPlan(planId));
});

itemsRouter.delete('/:id', (req, res) => {
  const planId = planIdForItem(req.params.id);
  if (!planId) return res.status(404).json({ error: 'Ítem no encontrado' });

  db.prepare('DELETE FROM plan_meal_items WHERE id = ?').run(req.params.id);
  res.json(buildPlan(planId));
});
