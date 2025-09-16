import axios from 'axios';

// Cria uma instância do axios
const api = axios.create({
  baseURL: 'http://127.0.0.1:8080/api', // URL base do seu backend
});

// Adiciona um interceptor para incluir o token em todas as requisições
api.interceptors.request.use(
  (config) => {
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
