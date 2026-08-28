import React from 'react';
import { useNavigate } from 'react-router-dom';
import FundoEstelar from '../components/FundoEstelar'; // <-- Importe adicionado aqui
import './Welcome.css';

function Welcome() {
  const navigate = useNavigate();

  const handleAccess = (modo) => {
    localStorage.setItem('firmo_onboarding_done', 'true');
    if (modo === 'cadastro') {
      navigate('/login?modo=cadastro');
    } else {
      navigate('/login');
    }
  };

  return (
    // Wrapper do fundo animado envolvendo a tela
    <FundoEstelar>
      <div className="welcome-container">
        <div className="welcome-top">
          <div className="welcome-logo">FIRMO</div>
          <h1 className="welcome-title">
            O controle do seu dinheiro está te esperando
          </h1>
        </div>

        <div className="welcome-bottom-sheet">
          <button className="btn w-100 btn-glow welcome-btn-primary" onClick={() => handleAccess('cadastro')}>
            Inscreva-se gratuitamente
          </button>

          <div className="sso-divider my-3 text-muted">ou</div>

          <button className="btn w-100 welcome-btn-secondary" onClick={() => handleAccess('login')}>
            Entrar
          </button>
        </div>
      </div>
    </FundoEstelar>
  );
}

export default Welcome;