import express from 'express';
import cors from 'cors';

import { migrate, db } from './db/connection.js';
import { groupsRouter } from './routes/groups.js';
import { foodsRouter } from './routes/foods.js';
import { patientsRouter } from './routes/patients.js';
import { plansRouter } from './routes/plans.js';
import { mealsRouter } from './routes/meals.js';
import { itemsRouter } from './routes/items.js';

migrate();

// Si la base está vacía (primer arranque), sembrar el catálogo SMAE.
const groupCount = db.prepare('SELECT COUNT(*) AS c FROM food_groups').get().c;
if (groupCount === 0) {
  await import('./db/seed.js');
}

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/groups', groupsRouter);
app.use('/api/foods', foodsRouter);
app.use('/api/patients', patientsRouter);
app.use('/api/plans', plansRouter);
app.use('/api/meals', mealsRouter);
app.use('/api/items', itemsRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`SMAE API escuchando en http://localhost:${PORT}`);
});
