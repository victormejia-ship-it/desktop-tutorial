# SMAE · Sistema de Alimentos Equivalentes

Aplicación web para nutriólogos: catálogo del **Sistema Mexicano de Alimentos
Equivalentes (SMAE)**, gestión de pacientes y un editor de planes de
alimentación que calcula equivalentes y macronutrimentos en tiempo real.

## Estructura

```
server/   API REST (Express + SQLite vía better-sqlite3)
client/   Interfaz web (React + Vite)
```

## Funcionalidad

- **Catálogo SMAE**: los 18 grupos del sistema (verduras, frutas, cereales
  con/sin grasa, leguminosas, AOA por nivel de grasa, leche por tipo,
  aceites y grasas, azúcares, alimentos libres) con ~90 alimentos de
  ejemplo y sus valores por equivalente (kcal, proteína, HC, lípidos).
  Búsqueda y filtro por grupo.
- **Pacientes**: alta y listado con datos básicos (sexo, estatura, peso,
  meta calórica).
- **Planes de alimentación**: por paciente, se define una prescripción de
  equivalentes por grupo al día, se arman comidas (Desayuno, Comida, etc.)
  agregando alimentos del catálogo con su cantidad de equivalentes, y la
  app calcula automáticamente los totales por comida y por día, comparando
  lo real contra la prescripción.

Los valores nutrimentales por grupo en `server/src/db/seed.js` son los
valores de referencia estándar usados en la enseñanza de dietética en
México. **Valídalos contra la edición vigente del manual SMAE** antes de
usarlos en un caso clínico real; el catálogo de alimentos se puede editar
libremente desde la API (`POST/PUT/DELETE /api/foods`).

## Requisitos

- Node.js 18+

## Puesta en marcha

### 1. Backend

```bash
cd server
npm install
npm run dev       # http://localhost:4000
```

Al primer arranque crea `server/data/smae.sqlite3` y siembra el catálogo
SMAE automáticamente. Para resembrar manualmente: `npm run seed`.

### 2. Frontend

En otra terminal:

```bash
cd client
npm install
npm run dev       # http://localhost:5173
```

El cliente Vite tiene configurado un proxy de `/api` hacia
`http://localhost:4000`, así que con ambos procesos corriendo la app queda
lista en `http://localhost:5173`.

## API (resumen)

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/groups` | Grupos SMAE con valores por equivalente |
| GET | `/api/foods?group=&q=` | Alimentos, filtrables por grupo/búsqueda |
| POST/PUT/DELETE | `/api/foods[/:id]` | Alta/edición/borrado de alimentos |
| GET/POST | `/api/patients` | Pacientes |
| GET/PUT/DELETE | `/api/patients/:id` | Detalle/edición/borrado |
| GET/POST | `/api/plans?patient_id=` | Planes de un paciente |
| GET/PUT/DELETE | `/api/plans/:id` | Plan completo (comidas, ítems, resumen) |
| PUT | `/api/plans/:id/targets` | Prescripción de equivalentes por grupo |
| POST | `/api/plans/:id/meals` | Agregar comida |
| PUT/DELETE | `/api/meals/:id` | Editar/borrar comida |
| POST | `/api/meals/:id/items` | Agregar alimento a una comida |
| PUT/DELETE | `/api/items/:id` | Editar cantidad/borrar alimento de una comida |

## Próximos pasos sugeridos

- Exportar el plan a PDF para entregar al paciente.
- Autenticación si más de un nutriólogo va a usar la misma instancia.
- Ampliar el catálogo de alimentos con la tabla completa del manual SMAE.
