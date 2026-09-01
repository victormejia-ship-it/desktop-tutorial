import { Router } from 'express';
import { db } from '../db/connection.js';

export const groupsRouter = Router();

groupsRouter.get('/', (req, res) => {
  const groups = db
    .prepare('SELECT * FROM food_groups ORDER BY sort_order ASC')
    .all();
  res.json(groups);
});
