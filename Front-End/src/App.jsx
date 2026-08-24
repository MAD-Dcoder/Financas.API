import React, { useContext, useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { AuthContext } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MeusDados from './pages/MeusDados';
import GerenciarCategorias from './pages/GerenciarCategorias';
import ConfiguracoesGlobais from './pages/ConfiguracoesGlobais';

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

  // 4. Função para descobrir qual é a tela inicial do usuário
  const getRotaInicial = () => {
    const configsStr = localStorage.getItem('firmo_configs');
    if (!configsStr) return '/dashboard';

    try {
      const configsSalvas = JSON.parse(configsStr);
      const tela = configsSalvas.telaInicialPadrao || 'dashboard';

      switch (tela) {
        case 'transacoes':
          return '/transacoes'; 
        case 'cartoes':
          return '/meus-cartoes';
        case 'novo_lancamento':
          return '/dashboard?acao=novolancamento'; // NOME ATUALIZADO AQUI!
        default:
          return '/dashboard';
      }
    } catch (error) {
      return '/dashboard';
    }
  };

  // 5. Sistema de Rotas
  return (
    <Routes>
      {isLoggedIn ? (
        <>
          <Route path="/dashboard" element={<Dashboard temaAtual={temaAtual} toggleTema={toggleTema} />} />
          <Route path="/" element={<Navigate to={getRotaInicial()} replace />} />
          <Route path="/configuracoes" element={<ConfiguracoesGlobais temaAtual={temaAtual} />} />
          <Route path="/meus-dados" element={<MeusDados temaAtual={temaAtual} />} />
          <Route path="/gerenciar-categorias" element={<GerenciarCategorias temaAtual={temaAtual} />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </>
      ) : (
        <>
          <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      )}
    </Routes>
  );
}

export default App;