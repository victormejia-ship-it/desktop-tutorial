import { NavLink, Route, Routes } from 'react-router-dom';
import CatalogPage from './pages/CatalogPage.jsx';
import PatientsPage from './pages/PatientsPage.jsx';
import PatientDetailPage from './pages/PatientDetailPage.jsx';
import PlanEditorPage from './pages/PlanEditorPage.jsx';

export default function App() {
  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">SMAE · Sistema de Equivalentes</div>
        <nav>
          <NavLink to="/" end>
            Catálogo
          </NavLink>
          <NavLink to="/pacientes">Pacientes</NavLink>
        </nav>
      </header>
      <main className="content">
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/pacientes" element={<PatientsPage />} />
          <Route path="/pacientes/:patientId" element={<PatientDetailPage />} />
          <Route path="/planes/:planId" element={<PlanEditorPage />} />
        </Routes>
      </main>
    </div>
  );
}
