import axios from 'axios';

// Configuração base do axios
const api = axios.create({
  baseURL: 'http://127.0.0.1:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ===== VACINAS =====
export const vacinaService = {
  getAll: () => api.get('/vacinas'),
  getById: (id) => api.get(`/vacinas/${id}`),
  create: (data) => api.post('/vacinas', data),
  update: (id, data) => api.put(`/vacinas/${id}`, data),
  delete: (id) => api.delete(`/vacinas/${id}`),
};

// ===== CALENDÁRIOS VACINAIS =====
export const calendarioService = {
  getAll: () => api.get('/calendarios-vacinais'),
  getById: (id) => api.get(`/calendarios-vacinais/${id}`),
  create: (data) => api.post('/calendarios-vacinais', data),
  update: (id, data) => api.put(`/calendarios-vacinais/${id}`, data),
  delete: (id) => api.delete(`/calendarios-vacinais/${id}`),
};

// ===== ESQUEMAS VACINAIS =====
export const esquemaService = {
  getAll: () => api.get('/esquemas-vacinais'),
  getById: (id) => api.get(`/esquemas-vacinais/${id}`),
  create: (data) => api.post('/esquemas-vacinais', data),
  update: (id, data) => api.put(`/esquemas-vacinais/${id}`, data),
  delete: (id) => api.delete(`/esquemas-vacinais/${id}`),
};

export default api;