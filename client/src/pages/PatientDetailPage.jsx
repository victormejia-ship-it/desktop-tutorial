import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api.js';

export default function PatientDetailPage() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [plans, setPlans] = useState([]);
  const [planName, setPlanName] = useState('');
  const [error, setError] = useState('');

  function load() {
    Promise.all([api.getPatient(patientId), api.getPlans(patientId)])
      .then(([p, pl]) => {
        setPatient(p);
        setPlans(pl);
      })
      .catch((e) => setError(e.message));
  }

  useEffect(load, [patientId]);

  async function handleCreatePlan(e) {
    e.preventDefault();
    if (!planName.trim()) return;
    const plan = await api.createPlan({ patient_id: Number(patientId), name: planName });
    navigate(`/planes/${plan.id}`);
  }

  async function handleDeletePlan(id) {
    if (!confirm('¿Eliminar este plan?')) return;
    await api.deletePlan(id);
    load();
  }

  if (error) return <div className="error-banner">{error}</div>;
  if (!patient) return <p className="muted">Cargando…</p>;

  return (
    <div>
      <p>
        <Link to="/pacientes">← Volver a pacientes</Link>
      </p>
      <h1>{patient.name}</h1>
      <div className="card">
        <div className="grid-3">
          <div>
            <div className="muted">Sexo</div>
            <div>{patient.sex || '—'}</div>
          </div>
          <div>
            <div className="muted">Estatura</div>
            <div>{patient.height_cm ? `${patient.height_cm} cm` : '—'}</div>
          </div>
          <div>
            <div className="muted">Peso</div>
            <div>{patient.weight_kg ? `${patient.weight_kg} kg` : '—'}</div>
          </div>
          <div>
            <div className="muted">Meta calórica</div>
            <div>{patient.goal_kcal ? `${patient.goal_kcal} kcal/día` : '—'}</div>
          </div>
        </div>
      </div>

      <form className="card" onSubmit={handleCreatePlan}>
        <h2>Nuevo plan de alimentación</h2>
        <div className="toolbar">
          <input
            placeholder="Ej. Plan 1800 kcal - fase 1"
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
          />
          <button type="submit">Crear plan</button>
        </div>
      </form>

      <div className="card">
        <h2>Planes</h2>
        {plans.length === 0 ? (
          <p className="empty-state">Sin planes todavía.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Creado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {plans.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link to={`/planes/${p.id}`}>{p.name}</Link>
                  </td>
                  <td className="muted">{p.created_at}</td>
                  <td>
                    <button className="danger" onClick={() => handleDeletePlan(p.id)}>
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
