import { Router } from 'express';
import { db } from '../db/connection.js';

export const foodsRouter = Router();

foodsRouter.get('/', (req, res) => {
  const { group, q } = req.query;
  let sql = `
    SELECT foods.*, food_groups.key AS group_key, food_groups.name AS group_name
    FROM foods
    JOIN food_groups ON food_groups.id = foods.group_id
    WHERE 1 = 1
  `;
  const params = [];

  if (group) {
    sql += ' AND food_groups.key = ?';
    params.push(group);
  }
  if (q) {
    sql += ' AND foods.name LIKE ?';
    params.push(`%${q}%`);
  }
  sql += ' ORDER BY food_groups.sort_order ASC, foods.name ASC';

  res.json(db.prepare(sql).all(...params));
});

foodsRouter.post('/', (req, res) => {
  const { group_id, name, portion_description, portion_grams, kcal, protein_g, carbs_g, lipids_g, notes } = req.body;

  if (!group_id || !name || !portion_description) {
    return res.status(400).json({ error: 'group_id, name y portion_description son requeridos' });
  }

  const result = db
    .prepare(`
      INSERT INTO foods (group_id, name, portion_description, portion_grams, kcal, protein_g, carbs_g, lipids_g, notes)
      VALUES (@group_id, @name, @portion_description, @portion_grams, @kcal, @protein_g, @carbs_g, @lipids_g, @notes)
    `)
    .run({
      group_id,
      name,
      portion_description,
      portion_grams: portion_grams ?? null,
      kcal: kcal ?? 0,
      protein_g: protein_g ?? 0,
      carbs_g: carbs_g ?? 0,
      lipids_g: lipids_g ?? 0,
      notes: notes ?? null,
    });

  const food = db.prepare('SELECT * FROM foods WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(food);
});

foodsRouter.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM foods WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Alimento no encontrado' });

  const merged = { ...existing, ...req.body };
  db.prepare(`
    UPDATE foods SET
      group_id = @group_id, name = @name, portion_description = @portion_description,
      portion_grams = @portion_grams, kcal = @kcal, protein_g = @protein_g,
      carbs_g = @carbs_g, lipids_g = @lipids_g, notes = @notes
    WHERE id = @id
  `).run(merged);

  res.json(db.prepare('SELECT * FROM foods WHERE id = ?').get(req.params.id));
});

foodsRouter.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM foods WHERE id = ?').run(req.params.id);
  res.status(204).send();
});
