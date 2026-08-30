import React from 'react';
import { FiHome, FiTarget, FiPlus, FiCreditCard, FiMenu } from 'react-icons/fi';

function BottomNav({ handleGoHome, setShowBottomSheet, setIsCardFlipped, setShowProfile, temaAtual, abaAtiva = 'home' }) {
  const isDark = temaAtual === 'dark';

  return (
    <nav 
      className="bottom-bar" 
      style={{ 
        /* Efeito Glassmorphism (Fundo translúcido) */
        backgroundColor: isDark ? 'rgba(18, 18, 20, 0.75)' : 'rgba(255, 255, 255, 0.85)',
        
        /* Desfoque do fundo (suporta navegadores modernos) */
        backdropFilter: 'blur(12px)',
        
        /* Suporte específico para iPhones/Safari */
        WebkitBackdropFilter: 'blur(12px)',
        
        /* Bordas sutis semi-transparentes para complementar o efeito de vidro */
        borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.05)',
        boxShadow: isDark ? '0 -4px 20px rgba(0,0,0,0.3)' : '0 -4px 20px rgba(0,0,0,0.05)'
      }}
    >
      
      {/* 1. Início */}
      <div 
        className={`nav-icon ${abaAtiva === 'home' ? 'active' : ''}`} 
        onClick={handleGoHome}
        style={{ padding: '10px', zIndex: 5 }}
      >
        <FiHome size={26} />
      </div>

      {/* 2. Metas */}
      <div 
        className={`nav-icon ${abaAtiva === 'metas' ? 'active' : ''}`} 
        onClick={() => alert("Em breve: Acompanhe suas economias e metas!")}
        style={{ padding: '10px', zIndex: 5 }}
      >
        <FiTarget size={26} />
      </div>
      
      {/* 3. ESPAÇADOR FANTASMA */}
      <div style={{ width: '65px', pointerEvents: 'none' }}></div>
      
      {/* 4. Cartões */}
      <div 
        className={`nav-icon ${abaAtiva === 'cartoes' ? 'active' : ''}`} 
        onClick={() => { handleGoHome(); setIsCardFlipped(true); }}
        style={{ padding: '10px', zIndex: 5 }}
      >
        <FiCreditCard size={26} />
      </div>

      {/* 5. Menu / Configurações */}
      <div 
        className="nav-icon" 
        onClick={() => setShowProfile(true)}
        style={{ padding: '10px', zIndex: 5 }}
      >
        <FiMenu size={26} />
      </div>

      {/* BOTÃO CENTRAL (+) */}
      <div className="fab-container">
        <button className="fab-button" onClick={() => setShowBottomSheet(true)}>
          <FiPlus size={32} />
        </button>
      </div>

    </nav>
  );
}

export default BottomNav;