// axiosConfig.js
import axios from 'axios';

// Configure o axios (sem o token JWT)
axios.interceptors.request.use(
  config => {
    // Remova a configuração do token JWT
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

export default axios;
