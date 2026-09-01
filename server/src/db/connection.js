import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.SMAE_DB_PATH || path.join(__dirname, '..', '..', 'data', 'smae.sqlite3');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function migrate() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS food_groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      kcal REAL NOT NULL,
      protein_g REAL NOT NULL,
      carbs_g REAL NOT NULL,
      lipids_g REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS foods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id INTEGER NOT NULL REFERENCES food_groups(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      portion_description TEXT NOT NULL,
      portion_grams REAL,
      kcal REAL NOT NULL,
      protein_g REAL NOT NULL,
      carbs_g REAL NOT NULL,
      lipids_g REAL NOT NULL,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      sex TEXT,
      birth_date TEXT,
      height_cm REAL,
      weight_kg REAL,
      goal_kcal REAL,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS meal_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS plan_group_targets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plan_id INTEGER NOT NULL REFERENCES meal_plans(id) ON DELETE CASCADE,
      group_id INTEGER NOT NULL REFERENCES food_groups(id) ON DELETE CASCADE,
      equivalents REAL NOT NULL DEFAULT 0,
      UNIQUE(plan_id, group_id)
    );

    CREATE TABLE IF NOT EXISTS plan_meals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plan_id INTEGER NOT NULL REFERENCES meal_plans(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS plan_meal_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plan_meal_id INTEGER NOT NULL REFERENCES plan_meals(id) ON DELETE CASCADE,
      food_id INTEGER NOT NULL REFERENCES foods(id) ON DELETE RESTRICT,
      equivalents REAL NOT NULL DEFAULT 1
    );
  `);
}
