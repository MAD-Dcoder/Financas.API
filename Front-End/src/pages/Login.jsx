import React, { useState } from 'react';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiShield } from 'react-icons/fi';
import api from '../api/axios';

function Login({ onLoginSuccess }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setErrorMsg('');
    setNome('');
    setSenha('');
    setConfirmaSenha('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !senha || (!isLoginMode && (!nome || !confirmaSenha))) {
      setErrorMsg('Por favor, preencha todos os campos.');
      return;
    }

    if (!isLoginMode && senha !== confirmaSenha) {
      setErrorMsg('As senhas não coincidem. Verifique e tente novamente.');
      return;
    }

    setIsLoading(true);

    try {
      let response;
      if (isLoginMode) {
        response = await api.post('/Usuarios/login', { email, senhaHash: senha });
      } else {
        response = await api.post('/Usuarios', { nome, email, senhaHash: senha });
      }

      const { token, usuario } = response.data;
      localStorage.setItem('firmo_user', JSON.stringify({ token, usuario }));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      onLoginSuccess(usuario);
      
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setErrorMsg('E-mail ou senha inválidos. Tente novamente.');
      } else {
        setErrorMsg(error.response?.data?.message || 'Erro de conexão. O servidor pode estar iniciando, tente novamente em instantes.');
      }
      setIsLoading(false);
    }
  };

  const marqueeText = (
    <>
      <span>• PROJETO DESENVOLVIDO POR MATHEUS AURÉLIO</span>
      <span>• STACK: REACT.JS, .NET, C#, JAVASCRIPT, POSTGRESQL, CSS & BOOTSTRAP</span>
      <span>• ESTUDANTE DE ANÁLISE E DESENVOLVIMENTO DE SISTEMAS NA PUC MINAS</span>
      <span>• ARQUITETURA LIMPA E ESCALÁVEL</span>
      <span>• GESTÃO FINANCEIRA SIMPLIFICADA E SEGURA</span>
    </>
  );

  return (
    <div className="app-container d-flex flex-column align-items-center justify-content-center px-4 position-relative py-5" 
         style={{ minHeight: '100vh', background: 'radial-gradient(circle at top, #064e3b 0%, #121214 40%)', overflowX: 'hidden' }}>
      
      {/* TELA DE LOADING COM BLUR E AS 3 BOLINHAS INTERATIVAS */}
      {isLoading && (
        <div className="auth-loading-overlay">
          <div className="dots-loader-container">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
          <p className="text-white fw-bold mb-1 mt-2" style={{ fontSize: '1.1rem', letterSpacing: '0.5px' }}>
            {isLoginMode ? 'Acessando sua conta...' : 'Criando sua conta...'}
          </p>
          <p className="text-secondary small">Preparando seu ambiente financeiro</p>
        </div>
      )}

      <div className="w-100 my-auto" style={{ maxWidth: '400px', zIndex: 1, paddingBottom: '3rem' }}>
        
        <div className="text-center mb-4">
          <h2 className="fw-bold text-white mb-1" style={{ letterSpacing: '1px', fontSize: '2.3rem' }}>
            {isLoginMode ? 'Entrar no Firmo' : 'Criar Conta'}
          </h2>
          <p className="text-light opacity-50 small">
            {isLoginMode ? 'O controle do seu dinheiro na palma da mão.' : 'Junte-se ao FIRMO'}
          </p>
        </div>

        <form 
          onSubmit={handleSubmit} 
          className="card dark-card p-4 shadow-lg border border-secondary border-opacity-25" 
          style={{ background: 'rgba(30, 30, 36, 0.7)', backdropFilter: 'blur(10px)', borderRadius: '20px' }}
        >
          {errorMsg && (
            <div className="alert alert-danger py-2 small text-center border-0 mb-4" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#f87171' }}>
              {errorMsg}
            </div>
          )}

          {!isLoginMode && (
            <div className="soft-input-group slide-down-fade">
              <input 
                type="text" 
                className="form-control soft-input" 
                placeholder="Seu nome completo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
              <FiUser className="input-icon-left" size={18} />
            </div>
          )}

          <div className="soft-input-group">
            <input 
              type="email" 
              className="form-control soft-input" 
              placeholder="Seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <FiMail className="input-icon-left" size={18} />
          </div>

          <div className="soft-input-group">
            <input 
              type={showPassword ? "text" : "password"} 
              className="form-control soft-input" 
              placeholder={isLoginMode ? "Sua senha" : "Crie uma senha"}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
            <FiLock className="input-icon-left" size={18} />
            <div className="input-icon-right" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </div>
          </div>

          {!isLoginMode && (
            <div className="soft-input-group slide-down-fade">
              <input 
                type={showPassword ? "text" : "password"} 
                className="form-control soft-input" 
                placeholder="Repita a senha"
                value={confirmaSenha}
                onChange={(e) => setConfirmaSenha(e.target.value)}
              />
              <FiLock className="input-icon-left" size={18} />
            </div>
          )}

          <button 
            type="submit" 
            className="btn w-100 py-3 rounded-4 fw-bold shadow text-white border-0 mt-2" 
            style={{ background: 'linear-gradient(to right, #10b981, #059669)', transition: 'all 0.3s' }}
            disabled={isLoading}
          >
            {isLoginMode ? 'Acessar Conta' : 'Abrir minha conta'}
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-light opacity-50 small">
            {isLoginMode ? 'Ainda não tem conta? ' : 'Já tem uma conta? '}
            <span 
              onClick={toggleMode} 
              className="text-emerald fw-bold" 
              style={{ cursor: 'pointer', transition: 'color 0.2s' }}
            >
              {isLoginMode ? 'Criar conta' : 'Fazer login'}
            </span>
          </p>
        </div>

        <div className="mt-4 d-flex align-items-center justify-content-center text-light opacity-25" style={{ fontSize: '0.75rem' }}>
          <FiShield className="me-2" size={14} />
          Dados criptografados de ponta a ponta
        </div>
      </div>

      <div className="marquee-wrapper">
        <div className="marquee-content">
          {marqueeText}
          {marqueeText}
        </div>
      </div>

    </div>
  );
}

export default Login;