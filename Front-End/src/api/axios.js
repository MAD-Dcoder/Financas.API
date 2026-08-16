import axios from 'axios';

const api = axios.create({
  baseURL: 'https://financas-api-v5lj.onrender.com/api',
});

export default api;