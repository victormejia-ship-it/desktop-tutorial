import { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api.js';

export default function CatalogPage() {
  const [groups, setGroups] = useState([]);
  const [foods, setFoods] = useState([]);
  const [groupFilter, setGroupFilter] = useState('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getGroups()
      .then(setGroups)
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (groupFilter) params.group = groupFilter;
    if (search) params.q = search;
    const timeout = setTimeout(() => {
      api
        .getFoods(params)
        .then(setFoods)
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }, 200);
    return () => clearTimeout(timeout);
  }, [groupFilter, search]);

  const groupsByKey = useMemo(
    () => Object.fromEntries(groups.map((g) => [g.key, g])),
    [groups]
  );

  return (
    <div>
      <h1>Catálogo SMAE</h1>
      <p className="muted">
        Sistema Mexicano de Alimentos Equivalentes: valores nutrimentales por equivalente,
        agrupados por categoría de alimento.
      </p>

      {error && <div className="error-banner">{error}</div>}

      <div className="toolbar">
        <select value={groupFilter} onChange={(e) => setGroupFilter(e.target.value)}>
          <option value="">Todos los grupos</option>
          {groups.map((g) => (
            <option key={g.key} value={g.key}>
              {g.name}
            </option>
          ))}
        </select>
        <input
          type="search"
          placeholder="Buscar alimento…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {groupFilter && groupsByKey[groupFilter] && (
        <div className="card">
          <strong>{groupsByKey[groupFilter].name}</strong> — valores por equivalente:{' '}
          {groupsByKey[groupFilter].kcal} kcal, {groupsByKey[groupFilter].protein_g} g proteína,{' '}
          {groupsByKey[groupFilter].carbs_g} g HC, {groupsByKey[groupFilter].lipids_g} g lípidos
        </div>
      )}

      <div className="card">
        {loading ? (
          <p className="muted">Cargando…</p>
        ) : foods.length === 0 ? (
          <p className="empty-state">Sin resultados.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Alimento</th>
                <th>Grupo</th>
                <th>Medida casera</th>
                <th>Kcal</th>
                <th>Proteína (g)</th>
                <th>HC (g)</th>
                <th>Lípidos (g)</th>
              </tr>
            </thead>
            <tbody>
              {foods.map((f) => (
                <tr key={f.id}>
                  <td>{f.name}</td>
                  <td>
                    <span className="pill">{f.group_name}</span>
                  </td>
                  <td>{f.portion_description}</td>
                  <td>{f.kcal}</td>
                  <td>{f.protein_g}</td>
                  <td>{f.carbs_g}</td>
                  <td>{f.lipids_g}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
