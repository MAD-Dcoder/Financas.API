import axios from 'axios';

const hostname = window.location.hostname;

const isLocal = hostname === 'localhost' || hostname.startsWith('192.168.');

const api = axios.create({
  baseURL: isLocal
    ? `http://${hostname}:5146/api`                   // Mudou para HTTP e porta 5146
    : 'https://financas-api-v5lj.onrender.com/api'    // Produção continua normal
});

export default api;