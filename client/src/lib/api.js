const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Error ${res.status} en ${path}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  getGroups: () => request('/groups'),
  getFoods: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/foods${qs ? `?${qs}` : ''}`);
  },
  createFood: (data) => request('/foods', { method: 'POST', body: JSON.stringify(data) }),
  updateFood: (id, data) => request(`/foods/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteFood: (id) => request(`/foods/${id}`, { method: 'DELETE' }),

  getPatients: () => request('/patients'),
  getPatient: (id) => request(`/patients/${id}`),
  createPatient: (data) => request('/patients', { method: 'POST', body: JSON.stringify(data) }),
  updatePatient: (id, data) => request(`/patients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePatient: (id) => request(`/patients/${id}`, { method: 'DELETE' }),

  getPlans: (patientId) => request(`/plans?patient_id=${patientId}`),
  getPlan: (id) => request(`/plans/${id}`),
  createPlan: (data) => request('/plans', { method: 'POST', body: JSON.stringify(data) }),
  deletePlan: (id) => request(`/plans/${id}`, { method: 'DELETE' }),
  setTargets: (planId, targets) =>
    request(`/plans/${planId}/targets`, { method: 'PUT', body: JSON.stringify({ targets }) }),

  addMeal: (planId, name) =>
    request(`/plans/${planId}/meals`, { method: 'POST', body: JSON.stringify({ name }) }),
  deleteMeal: (mealId) => request(`/meals/${mealId}`, { method: 'DELETE' }),

  addItem: (mealId, foodId, equivalents) =>
    request(`/meals/${mealId}/items`, {
      method: 'POST',
      body: JSON.stringify({ food_id: foodId, equivalents }),
    }),
  updateItem: (itemId, equivalents) =>
    request(`/items/${itemId}`, { method: 'PUT', body: JSON.stringify({ equivalents }) }),
  deleteItem: (itemId) => request(`/items/${itemId}`, { method: 'DELETE' }),
};
