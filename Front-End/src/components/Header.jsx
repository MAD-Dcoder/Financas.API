import React from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

function Header({ usuarioLogado, showBalance, setShowBalance, setShowProfile, temaAtual }) {
  const isDark = temaAtual === 'dark';

  return (
    <header className="d-flex justify-content-between align-items-center mb-4">
      <div className="d-flex align-items-center">
        <div 
          className="rounded-circle d-flex justify-content-center align-items-center me-3 shadow-sm" 
          style={{ width: '48px', height: '48px', backgroundColor: '#10b981', color: isDark ? '#121214' : '#fff', fontWeight: 'bold', fontSize: '20px', cursor: 'pointer' }}
          onClick={() => setShowProfile(true)}
        >
          {usuarioLogado?.nome ? usuarioLogado.nome.charAt(0).toUpperCase() : 'U'}
        </div>
        <div>
          <span className="text-emerald small d-block fw-bold" style={{ fontSize: '11px', letterSpacing: '1px' }}>FIRMO APP</span>
          <h5 className={`mb-0 fw-bold ${isDark ? 'text-white' : 'text-dark'}`}>Olá, {usuarioLogado?.nome ? usuarioLogado.nome.split(' ')[0] : ''}</h5>
        </div>
      </div>
      <button className={`btn btn-link p-0 shadow-none border-0 ${isDark ? 'text-light opacity-75' : 'text-dark opacity-50'}`} onClick={() => setShowBalance(!showBalance)}>
        {showBalance ? <FiEye size={24} /> : <FiEyeOff size={24} />}
      </button>
    </header>
  );
}

export default Header;