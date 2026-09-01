import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';

const emptyForm = { name: '', sex: '', birth_date: '', height_cm: '', weight_kg: '', goal_kcal: '' };

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function load() {
    api
      .getPatients()
      .then(setPatients)
      .catch((e) => setError(e.message));
  }

  useEffect(load, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    setError('');
    try {
      await api.createPatient({
        name: form.name,
        sex: form.sex || null,
        birth_date: form.birth_date || null,
        height_cm: form.height_cm ? Number(form.height_cm) : null,
        weight_kg: form.weight_kg ? Number(form.weight_kg) : null,
        goal_kcal: form.goal_kcal ? Number(form.goal_kcal) : null,
      });
      setForm(emptyForm);
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar este paciente y todos sus planes?')) return;
    await api.deletePatient(id);
    load();
  }

  return (
    <div>
      <h1>Pacientes</h1>
      {error && <div className="error-banner">{error}</div>}

      <form className="card" onSubmit={handleSubmit}>
        <h2>Nuevo paciente</h2>
        <div className="grid-3">
          <input
            placeholder="Nombre completo"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <select value={form.sex} onChange={(e) => setForm({ ...form, sex: e.target.value })}>
            <option value="">Sexo</option>
            <option value="F">Femenino</option>
            <option value="M">Masculino</option>
          </select>
          <input
            type="date"
            value={form.birth_date}
            onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
          />
          <input
            type="number"
            placeholder="Estatura (cm)"
            value={form.height_cm}
            onChange={(e) => setForm({ ...form, height_cm: e.target.value })}
          />
          <input
            type="number"
            placeholder="Peso (kg)"
            value={form.weight_kg}
            onChange={(e) => setForm({ ...form, weight_kg: e.target.value })}
          />
          <input
            type="number"
            placeholder="Meta kcal/día"
            value={form.goal_kcal}
            onChange={(e) => setForm({ ...form, goal_kcal: e.target.value })}
          />
        </div>
        <div style={{ marginTop: '0.75rem' }}>
          <button type="submit" disabled={saving}>
            {saving ? 'Guardando…' : 'Agregar paciente'}
          </button>
        </div>
      </form>

      <div className="card">
        {patients.length === 0 ? (
          <p className="empty-state">Aún no hay pacientes registrados.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Sexo</th>
                <th>Meta kcal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link to={`/pacientes/${p.id}`}>{p.name}</Link>
                  </td>
                  <td>{p.sex || '—'}</td>
                  <td>{p.goal_kcal || '—'}</td>
                  <td>
                    <button className="danger" onClick={() => handleDelete(p.id)}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
