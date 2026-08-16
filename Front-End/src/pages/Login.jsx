import React, { useState } from 'react';
import { FiUser, FiMail, FiLock } from 'react-icons/fi';
import api from '../api/axios';

function Login({ onLoginSuccess }) {
  const [isRegistering, setIsRegistering] = useState(false);
  
  const [emailLogin, setEmailLogin] = useState('');
  const [senhaLogin, setSenhaLogin] = useState('');
  const [loginError, setLoginError] = useState('');

  const [nomeCadastro, setNomeCadastro] = useState('');
  const [emailCadastro, setEmailCadastro] = useState('');
  const [senhaCadastro, setSenhaCadastro] = useState('');
  const [confirmaSenhaCadastro, setConfirmaSenhaCadastro] = useState('');
  const [registerError, setRegisterError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (!emailLogin || !senhaLogin) {
      setLoginError('Preencha e-mail e senha para entrar!');
      return;
    }

    try {
      // Usando nosso axios configurado
      const response = await api.post('/Usuarios/login', {
        email: emailLogin,
        senhaHash: senhaLogin 
      });
      
      const { token, usuario } = response.data;

      localStorage.setItem('firmo_user', JSON.stringify({ token, usuario }));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Avisa o App.jsx que o login deu certo
      onLoginSuccess(usuario);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setLoginError('E-mail ou senha inválidos. Tente novamente.');
      } else {
        setLoginError('Erro de conexão com o servidor.');
      }
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterError('');

    if (!nomeCadastro || !emailCadastro || !senhaCadastro || !confirmaSenhaCadastro) {
      setRegisterError('Por favor, preencha todos os campos.');
      return;
    }

    if (senhaCadastro !== confirmaSenhaCadastro) {
      setRegisterError('As senhas não coincidem.');
      return;
    }

    try {
      const response = await api.post('/Usuarios', {
        nome: nomeCadastro,
        email: emailCadastro,
        senhaHash: senhaCadastro 
      });

      const { token, usuario } = response.data;

      localStorage.setItem('firmo_user', JSON.stringify({ token, usuario }));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      onLoginSuccess(usuario);
    } catch (error) {
      setRegisterError('Erro ao criar conta. Verifique os dados ou o servidor.');
    }
  };

  if (isRegistering) {
    return (
      <div className="app-container d-flex flex-column align-items-center justify-content-center px-4" 
           style={{ minHeight: '100vh', background: 'radial-gradient(circle at top, #064e3b 0%, #121214 40%)' }}>
        <div className="w-100" style={{ maxWidth: '400px', zIndex: 1 }}>
          
          <div className="text-center mb-4">
            <h2 className="fw-bold text-white mb-1" style={{ letterSpacing: '1px' }}>Criar Conta</h2>
            <p className="text-light opacity-50">Junte-se ao FIRMO</p>
          </div>

          <form onSubmit={handleRegister} className="card dark-card p-4 shadow-lg border border-secondary border-opacity-25" style={{ background: 'rgba(30, 30, 36, 0.7)', backdropFilter: 'blur(10px)' }}>
            
            {registerError && (
              <div className="alert alert-danger py-2 small text-center border-0" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#f87171' }} role="alert">
                {registerError}
              </div>
            )}

            <div className="mb-3">
              <label className="form-label text-light opacity-75 small mb-1">Nome Completo</label>
              <div className="input-group">
                <span className="input-group-text bg-dark border-secondary border-opacity-25 text-light opacity-50"><FiUser /></span>
                <input 
                  type="text" 
                  className="form-control bg-dark border-secondary border-opacity-25 text-white shadow-none" 
                  placeholder="Seu nome"
                  value={nomeCadastro}
                  onChange={(e) => setNomeCadastro(e.target.value)}
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label text-light opacity-75 small mb-1">E-mail</label>
              <div className="input-group">
                <span className="input-group-text bg-dark border-secondary border-opacity-25 text-light opacity-50"><FiMail /></span>
                <input 
                  type="email" 
                  className="form-control bg-dark border-secondary border-opacity-25 text-white shadow-none" 
                  placeholder="Seu e-mail"
                  value={emailCadastro}
                  onChange={(e) => setEmailCadastro(e.target.value)}
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label text-light opacity-75 small mb-1">Senha</label>
              <div className="input-group">
                <span className="input-group-text bg-dark border-secondary border-opacity-25 text-light opacity-50"><FiLock /></span>
                <input 
                  type="password" 
                  className="form-control bg-dark border-secondary border-opacity-25 text-white shadow-none" 
                  placeholder="Crie uma senha"
                  value={senhaCadastro}
                  onChange={(e) => setSenhaCadastro(e.target.value)}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label text-light opacity-75 small mb-1">Confirmar Senha</label>
              <div className="input-group">
                <span className="input-group-text bg-dark border-secondary border-opacity-25 text-light opacity-50"><FiLock /></span>
                <input 
                  type="password" 
                  className="form-control bg-dark border-secondary border-opacity-25 text-white shadow-none" 
                  placeholder="Repita a senha"
                  value={confirmaSenhaCadastro}
                  onChange={(e) => setConfirmaSenhaCadastro(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn w-100 py-3 rounded-4 fw-bold shadow text-white border-0" style={{ background: 'linear-gradient(to right, #10b981, #059669)' }}>
              Criar Conta
            </button>
          </form>

          <div className="text-center mt-4">
            <p className="text-light opacity-50 small">
              Já tem uma conta? <span onClick={() => setIsRegistering(false)} className="text-emerald fw-bold" style={{ cursor: 'pointer' }}>Entrar</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container d-flex flex-column align-items-center justify-content-center px-4" 
         style={{ minHeight: '100vh', background: 'radial-gradient(circle at top, #064e3b 0%, #121214 40%)' }}>
      <div className="w-100" style={{ maxWidth: '400px', zIndex: 1 }}>
        
        <div className="text-center mb-5">
          <div className="rounded-circle d-flex justify-content-center align-items-center mx-auto mb-3 shadow-lg" 
               style={{ width: '80px', height: '80px', background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', color: '#fff', fontWeight: 'bold', fontSize: '36px' }}>
            F
          </div>
          <h1 className="fw-bold text-white mb-1" style={{ letterSpacing: '3px' }}>FIRMO</h1>
          <p className="text-light opacity-50" style={{ fontSize: '14px' }}>Controle financeiro pessoal</p>
        </div>

        <form onSubmit={handleLogin} className="card dark-card p-4 shadow-lg border border-secondary border-opacity-25" style={{ background: 'rgba(30, 30, 36, 0.7)', backdropFilter: 'blur(10px)' }}>
          
          {loginError && (
            <div className="alert alert-danger py-2 small text-center border-0" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#f87171' }} role="alert">
              {loginError}
            </div>
          )}

          <div className="mb-3">
            <label className="form-label text-light opacity-75 small mb-1">E-mail</label>
            <div className="input-group">
              <span className="input-group-text bg-dark border-secondary border-opacity-25 text-light opacity-50"><FiMail /></span>
              <input 
                type="email" 
                className="form-control bg-dark border-secondary border-opacity-25 text-white shadow-none" 
                placeholder="Seu e-mail"
                value={emailLogin}
                onChange={(e) => setEmailLogin(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label text-light opacity-75 small mb-1">Senha</label>
            <div className="input-group">
              <span className="input-group-text bg-dark border-secondary border-opacity-25 text-light opacity-50"><FiLock /></span>
              <input 
                type="password" 
                className="form-control bg-dark border-secondary border-opacity-25 text-white shadow-none" 
                placeholder="Sua senha"
                value={senhaLogin}
                onChange={(e) => setSenhaLogin(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn w-100 py-3 rounded-4 fw-bold shadow text-white border-0" style={{ background: 'linear-gradient(to right, #10b981, #059669)' }}>
            Entrar
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-light opacity-50 small">
            Ainda não tem conta? <span onClick={() => setIsRegistering(true)} className="text-emerald fw-bold" style={{ cursor: 'pointer' }}>Criar conta</span>
          </p>
        </div>

      </div>
    </div>
  );
}

export default Login;