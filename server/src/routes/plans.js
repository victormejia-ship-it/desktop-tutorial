import { Router } from 'express';
import { db } from '../db/connection.js';
import { buildPlan } from '../db/planQueries.js';

export const plansRouter = Router();

plansRouter.get('/', (req, res) => {
  const { patient_id } = req.query;
  let rows;
  if (patient_id) {
    rows = db
      .prepare('SELECT * FROM meal_plans WHERE patient_id = ? ORDER BY created_at DESC')
      .all(patient_id);
  } else {
    rows = db.prepare('SELECT * FROM meal_plans ORDER BY created_at DESC').all();
  }
  res.json(rows);
});

plansRouter.post('/', (req, res) => {
  const { patient_id, name } = req.body;
  if (!patient_id || !name) {
    return res.status(400).json({ error: 'patient_id y name son requeridos' });
  }
  const result = db
    .prepare('INSERT INTO meal_plans (patient_id, name) VALUES (?, ?)')
    .run(patient_id, name);
  res.status(201).json(buildPlan(result.lastInsertRowid));
});

plansRouter.get('/:id', (req, res) => {
  const plan = buildPlan(req.params.id);
  if (!plan) return res.status(404).json({ error: 'Plan no encontrado' });
  res.json(plan);
});

plansRouter.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM meal_plans WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Plan no encontrado' });
  db.prepare('UPDATE meal_plans SET name = ? WHERE id = ?').run(
    req.body.name ?? existing.name,
    req.params.id
  );
  res.json(buildPlan(req.params.id));
});

plansRouter.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM meal_plans WHERE id = ?').run(req.params.id);
  res.status(204).send();
});

// Reemplaza en bloque las metas de equivalentes por grupo para el plan.
plansRouter.put('/:id/targets', (req, res) => {
  const planId = req.params.id;
  const plan = db.prepare('SELECT * FROM meal_plans WHERE id = ?').get(planId);
  if (!plan) return res.status(404).json({ error: 'Plan no encontrado' });

  const targets = Array.isArray(req.body.targets) ? req.body.targets : [];

  const upsert = db.prepare(`
    INSERT INTO plan_group_targets (plan_id, group_id, equivalents)
    VALUES (@plan_id, @group_id, @equivalents)
    ON CONFLICT(plan_id, group_id) DO UPDATE SET equivalents = excluded.equivalents
  `);

  const run = db.transaction(() => {
    for (const t of targets) {
      upsert.run({ plan_id: planId, group_id: t.group_id, equivalents: t.equivalents });
    }
  });
  run();

  res.json(buildPlan(planId));
});

plansRouter.post('/:id/meals', (req, res) => {
  const planId = req.params.id;
  const plan = db.prepare('SELECT * FROM meal_plans WHERE id = ?').get(planId);
  if (!plan) return res.status(404).json({ error: 'Plan no encontrado' });

  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'name es requerido' });

  const maxOrder =
    db.prepare('SELECT MAX(sort_order) AS m FROM plan_meals WHERE plan_id = ?').get(planId).m ?? -1;

  db.prepare('INSERT INTO plan_meals (plan_id, name, sort_order) VALUES (?, ?, ?)').run(
    planId,
    name,
    maxOrder + 1
  );

  res.status(201).json(buildPlan(planId));
});
