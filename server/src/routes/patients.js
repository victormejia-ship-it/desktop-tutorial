import { Router } from 'express';
import { db } from '../db/connection.js';

export const patientsRouter = Router();

patientsRouter.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM patients ORDER BY created_at DESC').all());
});

patientsRouter.get('/:id', (req, res) => {
  const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(req.params.id);
  if (!patient) return res.status(404).json({ error: 'Paciente no encontrado' });
  res.json(patient);
});

patientsRouter.post('/', (req, res) => {
  const { name, sex, birth_date, height_cm, weight_kg, goal_kcal, notes } = req.body;
  if (!name) return res.status(400).json({ error: 'name es requerido' });

  const result = db
    .prepare(`
      INSERT INTO patients (name, sex, birth_date, height_cm, weight_kg, goal_kcal, notes)
      VALUES (@name, @sex, @birth_date, @height_cm, @weight_kg, @goal_kcal, @notes)
    `)
    .run({
      name,
      sex: sex ?? null,
      birth_date: birth_date ?? null,
      height_cm: height_cm ?? null,
      weight_kg: weight_kg ?? null,
      goal_kcal: goal_kcal ?? null,
      notes: notes ?? null,
    });

  res.status(201).json(db.prepare('SELECT * FROM patients WHERE id = ?').get(result.lastInsertRowid));
});

patientsRouter.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM patients WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Paciente no encontrado' });

  const merged = { ...existing, ...req.body, id: req.params.id };
  db.prepare(`
    UPDATE patients SET
      name = @name, sex = @sex, birth_date = @birth_date, height_cm = @height_cm,
      weight_kg = @weight_kg, goal_kcal = @goal_kcal, notes = @notes
    WHERE id = @id
  `).run(merged);

  res.json(db.prepare('SELECT * FROM patients WHERE id = ?').get(req.params.id));
});

patientsRouter.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM patients WHERE id = ?').run(req.params.id);
  res.status(204).send();
});
