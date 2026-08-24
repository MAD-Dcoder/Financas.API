import React, { useContext, useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { AuthContext } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MeusDados from './pages/MeusDados';
import GerenciarCategorias from './components/GerenciarCategorias';

function App() {
  const { isLoggedIn, handleLoginSuccess } = useContext(AuthContext);

  // 1. Estado do Tema
  const [temaAtual, setTemaAtual] = useState(localStorage.getItem('firmo_tema') || 'dark');

  // 2. Efeito que aplica o tema
  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', temaAtual);
    localStorage.setItem('firmo_tema', temaAtual);
  }, [temaAtual]);

  // 3. Função que inverte o tema
  const toggleTema = () => {
    setTemaAtual(temaAtual === 'dark' ? 'light' : 'dark');
  };

  // 4. Sistema de Rotas
  return (
    <Routes>
      {isLoggedIn ? (
        // ROTAS PRIVADAS (Só entra se estiver logado)
        <>
          {/* Nova rota do Dashboard com o endpoint na URL */}
          <Route path="/dashboard" element={<Dashboard temaAtual={temaAtual} toggleTema={toggleTema} />} />
          
          {/* Se acessar apenas "/", redireciona para "/dashboard" */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          <Route path="/meus-dados" element={<MeusDados temaAtual={temaAtual} />} />
          <Route path="/gerenciar-categorias" element={<GerenciarCategorias temaAtual={temaAtual} />} />
          
          {/* Se tentar acessar uma URL inválida logado, volta pro Dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </>
      ) : (
        // ROTAS PÚBLICAS (Se não estiver logado)
        <>
          <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
          
          {/* Se tentar acessar qualquer coisa sem estar logado, joga pro Login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      )}
    </Routes>
  );
}

export default App;