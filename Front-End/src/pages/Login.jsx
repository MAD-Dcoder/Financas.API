import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiShield, FiArrowRight } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import FundoEstelar from '../components/FundoEstelar'; // <-- Importe adicionado aqui
import './Login.css';

function Login({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Verifica se a URL veio com ?modo=cadastro para iniciar direto na tela de registro
  const [isLoginMode, setIsLoginMode] = useState(searchParams.get('modo') !== 'cadastro');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [contaSalva, setContaSalva] = useState(null);

  const [formData, setFormData] = useState({
    nome: '', email: '', senha: '', confirmaSenha: ''
  });

  useEffect(() => {
    const savedAccount = localStorage.getItem('firmo_conta_salva');
    if (savedAccount) {
      const parsedAccount = JSON.parse(savedAccount);
      setContaSalva(parsedAccount);
      setFormData(prev => ({ ...prev, email: parsedAccount.email }));
    }
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setErrorMsg('');
    setFormData({ nome: '', email: '', senha: '', confirmaSenha: '' });
  };

  const limparContaSalva = () => {
    localStorage.removeItem('firmo_conta_salva');
    setContaSalva(null);
    setFormData({ nome: '', email: '', senha: '', confirmaSenha: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const { nome, email, senha, confirmaSenha } = formData;

    if (!email || !senha || (!isLoginMode && (!nome || !confirmaSenha))) {
      setErrorMsg('Por favor, preencha todos os campos.');
      return;
    }

    if (!isLoginMode && senha !== confirmaSenha) {
      setErrorMsg('As senhas não coincidem.');
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
      
      localStorage.setItem('firmo_conta_salva', JSON.stringify({ 
        nome: usuario.nome || nome || 'Usuário', 
        email: email 
      }));

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      onLoginSuccess(usuario);
      navigate('/'); 

    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'E-mail ou senha inválidos.');
      setIsLoading(false);
    }
  };

  return (
    // Wrapper do fundo animado envolvendo a tela principal
    <FundoEstelar>
      <div className="login-screen-container">
        {isLoading && (
          <div className="auth-loading-overlay">
            <div className="dots-loader-container">
              <div className="dot"></div><div className="dot"></div><div className="dot"></div>
            </div>
            <p className="text-white fw-bold mb-1 mt-2">{isLoginMode ? 'Acessando sua conta...' : 'Criando sua conta...'}</p>
          </div>
        )}

        <div className="main-content-wrapper">
          <div className="w-100 mx-auto layout-limiter">
            
            <div className="text-center header-spacing">
              <h2 className="text-white mb-1 title-responsive">
                {isLoginMode ? (contaSalva ? 'Bem-vindo de volta' : 'Entrar no Firmo') : 'Criar Conta'}
              </h2>
              <p className="text-light opacity-50 subtitle-responsive mb-0">
                {isLoginMode ? 'O controle do seu dinheiro na palma da mão.' : 'Junte-se ao FIRMO'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="card dark-card shadow-lg border border-secondary border-opacity-25 glass-panel">
              {errorMsg && (
                <div className="alert alert-danger py-2 small text-center border-0 mb-3" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#f87171' }}>
                  {errorMsg}
                </div>
              )}

              {contaSalva && isLoginMode ? (
                <div className="saved-profile-badge mb-3">
                  <div className="d-flex align-items-center">
                    <div className="avatar-circle me-3">
                      {contaSalva.nome.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="profile-info text-start overflow-hidden">
                      <h6 className="mb-0 text-white fw-bold text-truncate" style={{ fontSize: '0.95rem' }}>{contaSalva.nome}</h6>
                      <small className="text-light opacity-50">{contaSalva.email.replace(/(.{2})(.*)(?=@)/, '$1***')}</small>
                    </div>
                  </div>
                  <button type="button" className="btn-trocar" onClick={limparContaSalva}>Trocar</button>
                </div>
              ) : (
                <>
                  {!isLoginMode && (
                    <div className="soft-input-group mb-2">
                      <input type="text" className="form-control soft-input" name="nome" placeholder="Seu nome completo" value={formData.nome} onChange={handleInputChange} />
                      <FiUser className="input-icon-left" size={18} />
                    </div>
                  )}
                  <div className="soft-input-group mb-2">
                    <input type="email" className="form-control soft-input" name="email" placeholder="Seu e-mail" value={formData.email} onChange={handleInputChange} autoComplete="username" />
                    <FiMail className="input-icon-left" size={18} />
                  </div>
                </>
              )}

              <div className={`soft-input-group ${isLoginMode ? 'mb-1' : 'mb-2'}`}>
                <input type={showPassword ? "text" : "password"} className="form-control soft-input" name="senha" placeholder={isLoginMode ? "Sua senha" : "Crie uma senha"} value={formData.senha} onChange={handleInputChange} autoComplete="current-password" />
                <FiLock className="input-icon-left" size={18} />
                <div className="input-icon-right" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </div>
              </div>

              {isLoginMode && (
                <div className="text-end mb-2 pe-1">
                  <span className="forgot-password-link">Esqueci minha senha</span>
                </div>
              )}

              {!isLoginMode && (
                <div className="soft-input-group mb-3 mt-2">
                  <input type={showPassword ? "text" : "password"} className="form-control soft-input" name="confirmaSenha" placeholder="Repita a senha" value={formData.confirmaSenha} onChange={handleInputChange} />
                  <FiLock className="input-icon-left" size={18} />
                </div>
              )}

              <button type="submit" className="btn w-100 py-3 rounded-4 fw-bold shadow text-white border-0 mt-2 btn-glow d-flex justify-content-center align-items-center gap-2" disabled={isLoading}>
                {isLoginMode ? 'Acessar Conta' : 'Abrir minha conta'}
                <FiArrowRight className="arrow-icon" />
              </button>
              
              {(!contaSalva || !isLoginMode) && (
                <div className="sso-container mt-3">
                  <div className="sso-divider"><span>ou continue com</span></div>
                  <div className="d-flex gap-2 mt-2">
                    <button type="button" className="btn btn-sso w-50 d-flex align-items-center justify-content-center gap-2">
                      <img src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png" alt="Google" style={{width: '16px'}} /> Google
                    </button>
                    <button type="button" className="btn btn-sso w-50 d-flex align-items-center justify-content-center gap-2">
                      <img src="https://cdn-icons-png.flaticon.com/512/0/747.png" alt="Apple" style={{width: '16px', filter: 'invert(1)'}} /> Apple
                    </button>
                  </div>
                </div>
              )}
            </form>

            {(!contaSalva || !isLoginMode) && (
              <div className="text-center link-spacing">
                <p className="text-light opacity-50 small mb-0 font-weight-medium">
                  {isLoginMode ? 'Ainda não tem conta? ' : 'Já tem uma conta? '}
                  <span onClick={toggleMode} className="text-emerald fw-bold" style={{ cursor: 'pointer', transition: 'color 0.2s' }}>
                    {isLoginMode ? 'Criar conta' : 'Fazer login'}
                  </span>
                </p>
              </div>
            )}

            <div className="d-flex align-items-center justify-content-center text-light opacity-25 mt-4 security-text">
              <FiShield className="me-2" size={14} /> Dados criptografados de ponta a ponta
            </div>

          </div>
        </div>

        <div className="footer-wrapper">
          <div className="marquee-wrapper">
            <div className="marquee-content d-flex">
              <span>• PROJETO DESENVOLVIDO POR MATHEUS AURÉLIO</span>
              <span>• STACK: REACT.JS, .NET, C#, JAVASCRIPT, POSTGRESQL, CSS & BOOTSTRAP</span>
              <span>• ESTUDANTE DE ANÁLISE E DESENVOLVIMENTO DE SISTEMAS NA PUC MINAS</span>
              <span>• ARQUITETURA LIMPA E ESCALÁVEL</span>
              <span>• PROJETO DESENVOLVIDO POR MATHEUS AURÉLIO</span>
              <span>• STACK: REACT.JS, .NET, C#, JAVASCRIPT, POSTGRESQL, CSS & BOOTSTRAP</span>
            </div>
          </div>
        </div>
      </div>
    </FundoEstelar>
  );
}

export default Login;