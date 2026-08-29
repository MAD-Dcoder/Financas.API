import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiShield, FiArrowRight, FiArrowLeft, FiKey } from 'react-icons/fi';
import api from '../api/axios';
import FundoEstelar from '../components/FundoEstelar';
import { getIniciais, getNomeCurto } from '../utils/formatters';
import './Login.css';

function Login({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const modoInicial = searchParams.get('modo') === 'cadastro' ? 'cadastro' : 'login';
  const [viewMode, setViewMode] = useState(modoInicial); 
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [contaSalva, setContaSalva] = useState(null);

  const [formData, setFormData] = useState({
    nome: '', email: '', senha: '', confirmaSenha: '', chaveMestra: ''
  });

  const CHAVE_ESPERADA = "FIRMO_BETA_2026";

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
    setViewMode(viewMode === 'login' ? 'cadastro' : 'login');
    setErrorMsg('');
    setSuccessMsg('');
    setFormData({ nome: '', email: '', senha: '', confirmaSenha: '', chaveMestra: '' });
  };

  const limparContaSalva = () => {
    localStorage.removeItem('firmo_conta_salva');
    setContaSalva(null);
    setFormData({ nome: '', email: '', senha: '', confirmaSenha: '', chaveMestra: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const emailLimpo = formData.email.trim();
    const chaveMestraLimpa = formData.chaveMestra.trim();
    const { nome, senha, confirmaSenha } = formData;

    if (viewMode === 'login' && (!emailLimpo || !senha)) {
      setErrorMsg('Por favor, preencha todos os campos.');
      return;
    }
    if (viewMode === 'cadastro' && (!nome || !emailLimpo || !senha || !confirmaSenha)) {
      setErrorMsg('Por favor, preencha todos os campos.');
      return;
    }
    if (viewMode === 'recuperacao') {
      if (!emailLimpo || !chaveMestraLimpa || !senha || !confirmaSenha) {
        setErrorMsg('Por favor, preencha todos os campos.');
        return;
      }
      if (chaveMestraLimpa !== CHAVE_ESPERADA) {
        setErrorMsg('A chave mestre informada é inválida.');
        return;
      }
    }
    if ((viewMode === 'cadastro' || viewMode === 'recuperacao') && senha !== confirmaSenha) {
      setErrorMsg('As senhas não coincidem.');
      return;
    }

    setIsLoading(true);

    try {
      if (viewMode === 'recuperacao') {
        await api.post('/Usuarios/reset-temporario', { 
          email: emailLimpo, 
          novaSenha: senha, 
          chaveMestra: chaveMestraLimpa 
        });
        
        setSuccessMsg('Senha alterada com sucesso! Faça login.');
        setViewMode('login');
        setFormData(prev => ({ ...prev, senha: '', confirmaSenha: '', chaveMestra: '' }));
        setIsLoading(false);
        return;
      }

      let response;
      if (viewMode === 'login') {
        response = await api.post('/Usuarios/login', { email: emailLimpo, senhaHash: senha });
      } else {
        response = await api.post('/Usuarios', { nome, email: emailLimpo, senhaHash: senha });
      }

      const { token, usuario } = response.data;
      localStorage.setItem('firmo_user', JSON.stringify({ token, usuario }));
      
      localStorage.setItem('firmo_conta_salva', JSON.stringify({ 
        nome: usuario.nome || nome || 'Usuário', 
        email: emailLimpo 
      }));

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      onLoginSuccess(usuario);
      navigate('/'); 

    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Ocorreu um erro. Verifique seus dados.');
      setIsLoading(false);
    }
  };

  const getTitulo = () => {
    if (viewMode === 'login') return contaSalva ? 'Bem-vindo de volta' : 'Entrar no Firmo';
    if (viewMode === 'cadastro') return 'Criar Conta';
    return 'Recuperar Senha';
  };

  const getSubtitulo = () => {
    if (viewMode === 'login') return 'O controle do seu dinheiro na palma da mão.';
    if (viewMode === 'cadastro') return 'Junte-se ao FIRMO';
    return 'Crie uma nova senha usando a chave mestre.';
  };

  const isChaveValida = formData.chaveMestra.trim() === CHAVE_ESPERADA;
  const isChavePreenchida = formData.chaveMestra.trim().length > 0;

  return (
    <FundoEstelar>
      <div className="login-screen-container">
        
        <button 
          className="btn-close-app" 
          onClick={() => navigate('/welcome')} 
          title="Voltar para a tela inicial"
        >
          <FiArrowLeft size={22} color="#ffffff" style={{ minWidth: '22px', minHeight: '22px' }} />
        </button>

        {isLoading && (
          <div className="auth-loading-overlay">
            <div className="dots-loader-container">
              <div className="dot"></div><div className="dot"></div><div className="dot"></div>
            </div>
            <p className="text-white fw-bold mb-1 mt-2">
              {viewMode === 'login' ? 'Acessando sua conta...' : viewMode === 'cadastro' ? 'Criando sua conta...' : 'Alterando senha...'}
            </p>
          </div>
        )}

        <div className="main-content-wrapper">
          <div className="w-100 mx-auto layout-limiter">
            
            <div className="text-center header-spacing">
              <h2 className="text-white mb-1 title-responsive">{getTitulo()}</h2>
              <p className="text-light opacity-50 subtitle-responsive mb-0">{getSubtitulo()}</p>
            </div>

            <form onSubmit={handleSubmit} className="card dark-card shadow-lg border border-secondary border-opacity-25 glass-panel">
              
              {errorMsg && (
                <div className="alert alert-danger py-2 small text-center border-0 mb-3" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#f87171' }}>
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="alert alert-success py-2 small text-center border-0 mb-3" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                  {successMsg}
                </div>
              )}

              {contaSalva && viewMode === 'login' ? (
                <div className="saved-profile-badge mb-3">
                  <div className="d-flex align-items-center">
                    <div className="avatar-circle me-3">
                      {getIniciais(contaSalva.nome)}
                    </div>
                    <div className="profile-info text-start overflow-hidden">
                      <h6 className="mb-0 text-white fw-bold text-truncate" style={{ fontSize: '0.95rem' }}>
                        {getNomeCurto(contaSalva.nome)}
                      </h6>
                      <small className="text-light opacity-50">{contaSalva.email.replace(/(.{2})(.*)(?=@)/, '$1***')}</small>
                    </div>
                  </div>
                  <button type="button" className="btn-trocar" onClick={limparContaSalva}>Trocar</button>
                </div>
              ) : (
                <>
                  {viewMode === 'cadastro' && (
                    <div className="soft-input-group mb-3">
                      <input type="text" className="form-control soft-input" name="nome" placeholder="Seu nome completo" value={formData.nome} onChange={handleInputChange} />
                      <FiUser className="input-icon-left" size={18} />
                    </div>
                  )}
                  <div className="soft-input-group mb-3">
                    <input type="email" className="form-control soft-input" name="email" placeholder="Seu e-mail" value={formData.email} onChange={handleInputChange} autoComplete="username" />
                    <FiMail className="input-icon-left" size={18} />
                  </div>
                </>
              )}

              {viewMode === 'recuperacao' && (
                <div className="soft-input-group mb-3">
                  <input 
                    type="text" 
                    className="form-control soft-input" 
                    name="chaveMestra" 
                    placeholder="Código de Segurança" 
                    value={formData.chaveMestra} 
                    onChange={handleInputChange} 
                    style={{ 
                      borderColor: isChavePreenchida ? (isChaveValida ? '#10b981' : '#f87171') : '',
                      transition: 'border-color 0.3s ease'
                    }}
                  />
                  <FiKey 
                    className="input-icon-left" 
                    size={18} 
                    style={{ 
                      color: isChavePreenchida ? (isChaveValida ? '#10b981' : '#f87171') : '',
                      transition: 'color 0.3s ease'
                    }} 
                  />
                </div>
              )}

              <div className={`soft-input-group ${viewMode === 'login' ? 'mb-2' : 'mb-3'}`}>
                <input type={showPassword ? "text" : "password"} className="form-control soft-input" name="senha" placeholder={viewMode === 'login' ? "Sua senha" : "Crie uma senha"} value={formData.senha} onChange={handleInputChange} autoComplete="current-password" />
                <FiLock className="input-icon-left" size={18} />
                <div className="input-icon-right" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </div>
              </div>

              {viewMode === 'login' && (
                <div className="text-end mb-3 pe-1">
                  <span className="forgot-password-link" onClick={() => { setViewMode('recuperacao'); setErrorMsg(''); setSuccessMsg(''); }}>Esqueci minha senha</span>
                </div>
              )}

              {viewMode !== 'login' && (
                <div className="soft-input-group mb-4">
                  <input type={showPassword ? "text" : "password"} className="form-control soft-input" name="confirmaSenha" placeholder="Repita a senha" value={formData.confirmaSenha} onChange={handleInputChange} />
                  <FiLock className="input-icon-left" size={18} />
                </div>
              )}

              <button type="submit" className="btn w-100 py-3 rounded-4 fw-bold shadow text-white border-0 btn-glow d-flex justify-content-center align-items-center gap-2" disabled={isLoading}>
                {viewMode === 'login' ? 'Acessar Conta' : viewMode === 'cadastro' ? 'Abrir minha conta' : 'Redefinir Senha'}
                <FiArrowRight className="arrow-icon" />
              </button>
              
              {viewMode !== 'recuperacao' && (!contaSalva || viewMode !== 'login') && (
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

            <div className="text-center link-spacing">
              {viewMode === 'recuperacao' ? (
                 <p className="text-light opacity-50 small mb-0 font-weight-medium">
                   Lembrou da senha? <span onClick={() => { setViewMode('login'); setErrorMsg(''); }} className="text-emerald fw-bold" style={{ cursor: 'pointer' }}>Voltar ao Login</span>
                 </p>
              ) : (!contaSalva || viewMode !== 'login') && (
                <p className="text-light opacity-50 small mb-0 font-weight-medium">
                  {viewMode === 'login' ? 'Ainda não tem conta? ' : 'Já tem uma conta? '}
                  <span onClick={toggleMode} className="text-emerald fw-bold" style={{ cursor: 'pointer', transition: 'color 0.2s' }}>
                    {viewMode === 'login' ? 'Criar conta' : 'Fazer login'}
                  </span>
                </p>
              )}
            </div>

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