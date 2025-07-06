// 📁 frontend/src/utils/api.js
import axios from 'axios';

const api = axios.create({ baseURL: '/api/v1' });
// Attach JWT (stored in localStorage) to each request
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});
export default api;