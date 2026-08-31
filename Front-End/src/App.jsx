import React, { useContext, useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { AuthContext } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MeusDados from './pages/MeusDados';
import GerenciarCategorias from './pages/GerenciarCategorias';
import ConfiguracoesGlobais from './pages/ConfiguracoesGlobais';
import Welcome from './pages/Welcome'; 
import Seguranca from './pages/Seguranca'; 
import Notificacoes from './pages/Notificacoes'; 
import CentralAjuda from './pages/CentralAjuda'; 
import LimitesMetas from './pages/LimitesMetas'; 
import api from './api/axios'; 

function App() {
  const { isLoggedIn, handleLoginSuccess } = useContext(AuthContext);
  const requiresOnboarding = !localStorage.getItem('firmo_onboarding_done');

  useEffect(() => {
    api.get('/Usuarios').catch(() => {});
  }, []);

  const [temaAtual, setTemaAtual] = useState(localStorage.getItem('firmo_tema') || 'dark');
  const isDark = temaAtual === 'dark';

  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', temaAtual);
    localStorage.setItem('firmo_tema', temaAtual);
  }, [temaAtual]);

  const toggleTema = () => {
    setTemaAtual(temaAtual === 'dark' ? 'light' : 'dark');
  };

  const getRotaInicial = () => {
    const configsStr = localStorage.getItem('firmo_configs');
    if (!configsStr) return '/dashboard';
    try {
      const configsSalvas = JSON.parse(configsStr);
      const tela = configsSalvas.telaInicialPadrao || 'dashboard';
      switch (tela) {
        case 'transacoes': return '/transacoes'; 
        case 'cartoes': return '/meus-cartoes';
        case 'novo_lancamento': return '/dashboard?acao=novolancamento';
        default: return '/dashboard';
      }
    } catch (error) {
      return '/dashboard';
    }
  };

  return (
    <>
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: isDark ? '#2b2b36' : '#ffffff',
            color: isDark ? '#ffffff' : '#212529',
            border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
          },
        }}
      />

      <Routes>
        {isLoggedIn ? (
          <>
            <Route path="/dashboard" element={<Dashboard temaAtual={temaAtual} toggleTema={toggleTema} />} />
            <Route path="/" element={<Navigate to={getRotaInicial()} replace />} />
            <Route path="/configuracoes" element={<ConfiguracoesGlobais temaAtual={temaAtual} />} />
            <Route path="/meus-dados" element={<MeusDados temaAtual={temaAtual} />} />
            <Route path="/gerenciar-categorias" element={<GerenciarCategorias temaAtual={temaAtual} />} />
            <Route path="/seguranca" element={<Seguranca temaAtual={temaAtual} />} />
            <Route path="/notificacoes" element={<Notificacoes temaAtual={temaAtual} />} />
            <Route path="/central-ajuda" element={<CentralAjuda temaAtual={temaAtual} />} />
            <Route path="/metas" element={<LimitesMetas temaAtual={temaAtual} />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </>
        ) : (
          <>
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
            <Route path="*" element={<Navigate to={requiresOnboarding ? "/welcome" : "/login"} replace />} />
          </>
        )}
      </Routes>
    </>
  );
}

export default App;