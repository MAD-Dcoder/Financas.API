import axios from 'axios';

const hostname = window.location.hostname;
const isLocal = hostname === 'localhost' || hostname.startsWith('192.168.');

const api = axios.create({
  baseURL: isLocal 
    ? `http://${hostname}:5146/api`        // Desenvolvimento local HTTP na porta 5146
    : 'https://financas-api-v5lj.onrender.com/api', // Produção no Render
  
  // O pulo do gato para o Render: 
  // Aumenta o tempo limite de espera para 60 segundos, evitando que 
  // a requisição falhe enquanto o servidor em C# acorda do modo "sleep".
  timeout: 60000, 
});

export default api;