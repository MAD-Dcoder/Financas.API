import React, { useContext, useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { AuthContext } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
  const { isLoggedIn, handleLoginSuccess } = useContext(AuthContext);

  // 1. Estado do Tema (busca no localStorage ou define 'dark' como padrão)
  const [temaAtual, setTemaAtual] = useState(localStorage.getItem('firmo_tema') || 'dark');

  // 2. Efeito que aplica o tema no HTML da página e salva no navegador
  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', temaAtual);
    localStorage.setItem('firmo_tema', temaAtual);
  }, [temaAtual]);

  // 3. Função que inverte o tema
  const toggleTema = () => {
    setTemaAtual(temaAtual === 'dark' ? 'light' : 'dark');
  };

  // 4. Passamos o temaAtual e a função toggleTema para o Dashboard
  return isLoggedIn ? (
    <Dashboard temaAtual={temaAtual} toggleTema={toggleTema} />
  ) : (
    <Login onLoginSuccess={handleLoginSuccess} />
  );
}

export default App;