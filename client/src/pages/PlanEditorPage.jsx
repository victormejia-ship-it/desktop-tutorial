import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api.js';

function round(n) {
  return Math.round((n + Number.EPSILON) * 10) / 10;
}

function diffClass(diff) {
  if (diff > 0.05) return 'diff-over';
  if (diff < -0.05) return 'diff-under';
  return 'diff-ok';
}

function TargetsEditor({ plan, groups, onSave }) {
  const [values, setValues] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const map = {};
    for (const g of plan.group_summary) map[g.group_id] = g.target_equivalents;
    setValues(map);
  }, [plan.id]);

  async function handleSave() {
    setSaving(true);
    const targets = groups.map((g) => ({ group_id: g.id, equivalents: Number(values[g.id]) || 0 }));
    await onSave(targets);
    setSaving(false);
  }

  return (
    <div className="card">
      <h2>Prescripción de equivalentes por grupo (diario)</h2>
      <table>
        <thead>
          <tr>
            <th>Grupo</th>
            <th>Equivalentes/día</th>
            <th>Kcal por equivalente</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((g) => (
            <tr key={g.id}>
              <td>{g.name}</td>
              <td>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  style={{ width: '5rem' }}
                  value={values[g.id] ?? 0}
                  onChange={(e) => setValues({ ...values, [g.id]: e.target.value })}
                />
              </td>
              <td className="muted">{g.kcal} kcal</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: '0.75rem' }}>
        <button onClick={handleSave} disabled={saving}>
          {saving ? 'Guardando…' : 'Guardar prescripción'}
        </button>
      </div>
    </div>
  );
}

function AddItemRow({ groups, mealId, onAdded }) {
  const [groupKey, setGroupKey] = useState('');
  const [foods, setFoods] = useState([]);
  const [foodId, setFoodId] = useState('');
  const [equivalents, setEquivalents] = useState(1);

  useEffect(() => {
    if (!groupKey) {
      setFoods([]);
      setFoodId('');
      return;
    }
    api.getFoods({ group: groupKey }).then((f) => {
      setFoods(f);
      setFoodId(f[0]?.id || '');
    });
  }, [groupKey]);

  async function handleAdd() {
    if (!foodId) return;
    await onAdded(mealId, Number(foodId), Number(equivalents) || 1);
    setEquivalents(1);
  }

  return (
    <div className="toolbar" style={{ marginTop: '0.5rem' }}>
      <select value={groupKey} onChange={(e) => setGroupKey(e.target.value)}>
        <option value="">Grupo…</option>
        {groups.map((g) => (
          <option key={g.key} value={g.key}>
            {g.name}
          </option>
        ))}
      </select>
      <select value={foodId} onChange={(e) => setFoodId(e.target.value)} disabled={!foods.length}>
        {foods.length === 0 && <option value="">Elige un grupo primero</option>}
        {foods.map((f) => (
          <option key={f.id} value={f.id}>
            {f.name} ({f.portion_description})
          </option>
        ))}
      </select>
      <input
        type="number"
        min="0.25"
        step="0.25"
        style={{ width: '4.5rem' }}
        value={equivalents}
        onChange={(e) => setEquivalents(e.target.value)}
      />
      <button className="secondary" onClick={handleAdd} disabled={!foodId}>
        + Agregar
      </button>
    </div>
  );
}

function MealCard({ meal, groups, onAddItem, onUpdateItem, onDeleteItem, onDeleteMeal }) {
  return (
    <div className="card">
      <div className="toolbar" style={{ justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0 }}>{meal.name}</h2>
        <button className="danger" onClick={() => onDeleteMeal(meal.id)}>
          Eliminar comida
        </button>
      </div>

      {meal.items.length === 0 ? (
        <p className="empty-state">Sin alimentos agregados.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Alimento</th>
              <th>Grupo</th>
              <th>Equivalentes</th>
              <th>Kcal</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {meal.items.map((item) => (
              <tr key={item.id}>
                <td>
                  {item.food.name} <span className="muted">({item.food.portion_description})</span>
                </td>
                <td>
                  <span className="pill">{item.food.group_name}</span>
                </td>
                <td>
                  <input
                    type="number"
                    min="0.25"
                    step="0.25"
                    style={{ width: '4.5rem' }}
                    value={item.equivalents}
                    onChange={(e) => onUpdateItem(item.id, Number(e.target.value) || 0)}
                  />
                </td>
                <td>{round(item.food.kcal * item.equivalents)}</td>
                <td>
                  <button className="danger" onClick={() => onDeleteItem(item.id)}>
                    Quitar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <AddItemRow groups={groups} mealId={meal.id} onAdded={onAddItem} />

      <p className="muted" style={{ marginTop: '0.75rem' }}>
        Totales de la comida: {round(meal.totals.kcal)} kcal · {round(meal.totals.protein_g)} g prot ·{' '}
        {round(meal.totals.carbs_g)} g HC · {round(meal.totals.lipids_g)} g líp
      </p>
    </div>
  );
}

export default function PlanEditorPage() {
  const { planId } = useParams();
  const [plan, setPlan] = useState(null);
  const [groups, setGroups] = useState([]);
  const [mealName, setMealName] = useState('');
  const [error, setError] = useState('');

  function load() {
    Promise.all([api.getPlan(planId), api.getGroups()])
      .then(([p, g]) => {
        setPlan(p);
        setGroups(g);
      })
      .catch((e) => setError(e.message));
  }

  useEffect(load, [planId]);

  async function withReload(fn) {
    try {
      const result = await fn();
      setPlan(result);
    } catch (e) {
      setError(e.message);
    }
  }

  const handleSaveTargets = (targets) => withReload(() => api.setTargets(planId, targets));
  const handleAddMeal = (e) => {
    e.preventDefault();
    if (!mealName.trim()) return;
    withReload(() => api.addMeal(planId, mealName)).then(() => setMealName(''));
  };
  const handleAddItem = (mealId, foodId, equivalents) =>
    withReload(() => api.addItem(mealId, foodId, equivalents));
  const handleUpdateItem = (itemId, equivalents) =>
    withReload(() => api.updateItem(itemId, equivalents));
  const handleDeleteItem = (itemId) => withReload(() => api.deleteItem(itemId));
  const handleDeleteMeal = (mealId) => {
    if (!confirm('¿Eliminar esta comida y sus alimentos?')) return;
    withReload(() => api.deleteMeal(mealId));
  };

  if (error) return <div className="error-banner">{error}</div>;
  if (!plan) return <p className="muted">Cargando…</p>;

  return (
    <div>
      <p>
        <Link to={`/pacientes/${plan.patient_id}`}>← Volver al paciente</Link>
      </p>
      <h1>{plan.name}</h1>

      <div className="card">
        <h2>Resumen del día</h2>
        <div className="grid-2">
          <div>
            <p className="muted">Total consumido</p>
            <p>
              {round(plan.totals.day.kcal)} kcal · {round(plan.totals.day.protein_g)} g prot ·{' '}
              {round(plan.totals.day.carbs_g)} g HC · {round(plan.totals.day.lipids_g)} g líp
            </p>
          </div>
          <div>
            <p className="muted">Meta según prescripción</p>
            <p>
              {round(plan.totals.target.kcal)} kcal · {round(plan.totals.target.protein_g)} g prot ·{' '}
              {round(plan.totals.target.carbs_g)} g HC · {round(plan.totals.target.lipids_g)} g líp
            </p>
          </div>
        </div>

        <table style={{ marginTop: '0.75rem' }}>
          <thead>
            <tr>
              <th>Grupo</th>
              <th>Meta</th>
              <th>Real</th>
              <th>Diferencia</th>
            </tr>
          </thead>
          <tbody>
            {plan.group_summary
              .filter((g) => g.target_equivalents > 0 || g.actual_equivalents > 0)
              .map((g) => (
                <tr key={g.group_id}>
                  <td>{g.group_name}</td>
                  <td>{g.target_equivalents}</td>
                  <td>{g.actual_equivalents}</td>
                  <td className={diffClass(g.difference)}>
                    {g.difference > 0 ? '+' : ''}
                    {round(g.difference)}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <TargetsEditor plan={plan} groups={groups} onSave={handleSaveTargets} />

      <form className="card" onSubmit={handleAddMeal}>
        <h2>Agregar comida</h2>
        <div className="toolbar">
          <input
            placeholder="Ej. Desayuno, Colación, Comida, Cena"
            value={mealName}
            onChange={(e) => setMealName(e.target.value)}
          />
          <button type="submit">Agregar</button>
        </div>
      </form>

      {plan.meals.length === 0 ? (
        <p className="empty-state">Aún no hay comidas en este plan.</p>
      ) : (
        plan.meals.map((meal) => (
          <MealCard
            key={meal.id}
            meal={meal}
            groups={groups}
            onAddItem={handleAddItem}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
            onDeleteMeal={handleDeleteMeal}
          />
        ))
      )}
    </div>
  );
}
