import axios from 'axios';

// Detecta se está rodando localmente ou em produção
const isLocal = window.location.hostname === 'localhost';

const api = axios.create({
  baseURL: isLocal 
    ? 'https://localhost:7231/api'                // Porta do seu Visual Studio local
    : 'https://financas-api-v5lj.onrender.com/api' // URL do Render na nuvem
});

export default api;