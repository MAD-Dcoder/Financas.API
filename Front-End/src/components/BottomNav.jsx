import React from 'react';
import { FiHome, FiPlus, FiCreditCard } from 'react-icons/fi';

function BottomNav({ handleGoHome, setShowBottomSheet, setIsCardFlipped, temaAtual, abaAtiva = 'home' }) {
  const isDark = temaAtual === 'dark';

  return (
    <nav className="bottom-bar" style={{ 
      backgroundColor: isDark ? '' : '#ffffff', 
      borderTop: isDark ? '' : '1px solid #e9ecef',
      boxShadow: isDark ? '' : '0 -4px 12px rgba(0,0,0,0.05)' 
    }}>
      <div 
        className={`nav-icon ${abaAtiva === 'home' ? 'active' : ''}`} 
        style={{ cursor: 'pointer' }} 
        onClick={handleGoHome}
      >
        <FiHome size={28} />
      </div>
      
      <div className="fab-container">
        <button 
          className="fab-button" 
          onClick={() => setShowBottomSheet(true)}
        >
          <FiPlus size={32} />
        </button>
      </div>
      
      <div 
        className={`nav-icon ${abaAtiva === 'cartoes' ? 'active' : ''}`} 
        style={{ cursor: 'pointer' }} 
        onClick={() => { 
          handleGoHome(); 
          setIsCardFlipped(true); 
        }}
      >
        <FiCreditCard size={28} />
      </div>
    </nav>
  );
}

export default BottomNav;