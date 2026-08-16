import React from 'react';
import { FiHome, FiPlus, FiCreditCard } from 'react-icons/fi';

function BottomNav({ handleGoHome, setShowBottomSheet, setIsCardFlipped }) {
  return (
    <nav className="bottom-bar">
      <div className="nav-icon active" style={{ cursor: 'pointer' }} onClick={handleGoHome}>
        <FiHome size={28} />
      </div>
      <div className="fab-container">
        <button className="fab-button" onClick={() => setShowBottomSheet(true)}>
          <FiPlus size={32} />
        </button>
      </div>
      <div className="nav-icon" style={{ cursor: 'pointer' }} onClick={() => { handleGoHome(); setIsCardFlipped(true); }}>
        <FiCreditCard size={28} />
      </div>
    </nav>
  );
}

export default BottomNav;