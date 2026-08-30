import React, { useState } from 'react';
import { FiArrowLeft, FiSmartphone, FiClock, FiWind, FiTrash2 } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import './ConfigPages.css';

const Seguranca = ({ temaAtual }) => {
  const navigate = useNavigate();
  const isDark = temaAtual === 'dark';
  const [useBiometrics, setUseBiometrics] = useState(true);
  const [panicMode, setPanicMode] = useState(false);

  // Toggle com borda visível e fundo limpo (como na foto 2)
  const getToggleStyle = (checked) => ({
    cursor: 'pointer',
    width: '2.5em',
    height: '1.25em',
    backgroundColor: checked ? '#10b981' : (isDark ? 'transparent' : '#ffffff'),
    borderColor: checked ? '#10b981' : (isDark ? 'rgba(255,255,255,0.3)' : '#cbd5e1'),
    borderWidth: '1px',
    borderStyle: 'solid'
  });

  return (
    <div className={`config-page ${isDark ? 'theme-dark' : 'theme-light'}`} data-bs-theme={temaAtual}>
      <div className="config-header">
        <button 
          onClick={() => navigate(-1)} 
          className={`btn btn-link p-0 border-0 mb-3 shadow-none ${isDark ? 'text-white' : 'text-dark'}`}
        >
          <FiArrowLeft size={24} />
        </button>
        <h1 className={isDark ? 'text-white' : 'text-dark'}>Segurança e Privacidade</h1>
        <p>Controle o acesso e proteja seu histórico.</p>
      </div>

      <div className="config-section">
        <p className="config-section-title">Acesso ao App</p>
        
        <div className="config-card">
          <div className="config-card-left">
            <FiSmartphone className="config-icon" />
            <div>
              <span className="config-text-main">Exigir Biometria/PIN</span>
              <span className="config-text-sub">Solicitar ao abrir o app</span>
            </div>
          </div>
          <div className="form-check form-switch m-0 p-0 d-flex align-items-center">
            <input 
              className="form-check-input ms-0 shadow-none" 
              type="checkbox" 
              role="switch" 
              checked={useBiometrics} 
              onChange={() => setUseBiometrics(!useBiometrics)}
              style={getToggleStyle(useBiometrics)}
            />
          </div>
        </div>

        <div className="config-card">
          <div className="config-card-left">
            <FiClock className="config-icon" />
            <span className="config-text-main">Bloqueio Automático</span>
          </div>
          <select className="config-select shadow-none">
            <option value="0">Imediato</option>
            <option value="1">Após 1 minuto</option>
            <option value="5">Após 5 minutos</option>
          </select>
        </div>

        <div className="config-divider"></div>

        <p className="config-section-title">Privacidade em Público</p>
        <div className="config-card">
          <div className="config-card-left">
            <FiWind className="config-icon" />
            <div>
              <span className="config-text-main">Modo Pânico</span>
              <span className="config-text-sub">Vire a tela para ocultar</span>
            </div>
          </div>
          <div className="form-check form-switch m-0 p-0 d-flex align-items-center">
            <input 
              className="form-check-input ms-0 shadow-none" 
              type="checkbox" 
              role="switch" 
              checked={panicMode} 
              onChange={() => setPanicMode(!panicMode)}
              style={getToggleStyle(panicMode)}
            />
          </div>
        </div>

        <div className="config-divider"></div>

        <p className="config-section-title text-danger">Zona de Perigo</p>
        <button className="config-card config-card-danger bg-transparent">
          <div className="config-card-left">
            <FiTrash2 className="config-icon text-danger" />
            <div>
              <span className="config-text-main text-danger">Apagar todos os dados</span>
              <span className="config-text-sub">Zerar histórico e recomeçar</span>
            </div>
          </div>
        </button>
      </div>

      <div className="config-bottom-bar">
        <button className="config-btn-save text-white">✓ Salvar Preferências</button>
      </div>
    </div>
  );
};

export default Seguranca;