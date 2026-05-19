const API_BASE = (window.APP_CONFIG && window.APP_CONFIG.API_URL) || 'http://localhost:3000/api';

function getToken() {
  return localStorage.getItem('token');
}

function setToken(token) {
  localStorage.setItem('token', token);
}

function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
}

async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.erro || 'Erro na requisição');
  }
  return data;
}

const Api = {
  login: (email, senha) => api('/auth/login', { method: 'POST', body: JSON.stringify({ email, senha }) }),
  perfil: () => api('/auth/perfil'),
  niveis: () => api('/niveis'),
  compras: () => api('/compras'),
  criarCompra: (itens) => api('/compras', { method: 'POST', body: JSON.stringify({ itens }) }),
  missoes: () => api('/missoes/minhas'),
  recompensas: () => api('/recompensas'),
  resgatar: (recompensa_id) => api('/recompensas/resgatar', { method: 'POST', body: JSON.stringify({ recompensa_id }) }),
  recomendacoes: () => api('/recomendacoes'),
  regenerarRec: () => api('/recomendacoes/regenerar', { method: 'POST' }),
  adminDashboard: () => api('/admin/dashboard'),
  adminClientes: () => api('/admin/clientes'),
  adminCampanhas: () => api('/admin/campanhas'),
};
