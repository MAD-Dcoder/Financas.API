import React from 'react';
import { FiHome, FiTarget, FiPlus, FiCreditCard, FiMenu } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom'; // <-- IMPORT ADICIONADO

function BottomNav({ handleGoHome, setShowBottomSheet, setIsCardFlipped, setShowProfile, temaAtual, abaAtiva = 'home' }) {
  const isDark = temaAtual === 'dark';
  const navigate = useNavigate(); // <-- HOOK DE NAVEGAÇÃO

  return (
    <nav 
      className="bottom-bar" 
      style={{ 
        backgroundColor: isDark ? 'rgba(18, 18, 20, 0.75)' : 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.05)',
        boxShadow: isDark ? '0 -4px 20px rgba(0,0,0,0.3)' : '0 -4px 20px rgba(0,0,0,0.05)'
      }}
    >
      <div 
        className={`nav-icon ${abaAtiva === 'home' ? 'active' : ''}`} 
        onClick={handleGoHome}
        style={{ padding: '10px', zIndex: 5 }}
      >
        <FiHome size={26} />
      </div>

      {/* 🟢 NAVEGAÇÃO PARA A NOVA TELA */}
      <div 
        className={`nav-icon ${abaAtiva === 'metas' ? 'active' : ''}`} 
        onClick={() => navigate('/metas')}
        style={{ padding: '10px', zIndex: 5 }}
      >
        <FiTarget size={26} />
      </div>
      
      <div style={{ width: '65px', pointerEvents: 'none' }}></div>
      
      <div 
        className={`nav-icon ${abaAtiva === 'cartoes' ? 'active' : ''}`} 
        onClick={() => { handleGoHome(); setIsCardFlipped(true); }}
        style={{ padding: '10px', zIndex: 5 }}
      >
        <FiCreditCard size={26} />
      </div>

      <div 
        className="nav-icon" 
        onClick={() => setShowProfile(true)}
        style={{ padding: '10px', zIndex: 5 }}
      >
        <FiMenu size={26} />
      </div>

      <div className="fab-container">
        <button className="fab-button" onClick={() => setShowBottomSheet(true)}>
          <FiPlus size={32} />
        </button>
      </div>
    </nav>
  );
}

export default BottomNav;