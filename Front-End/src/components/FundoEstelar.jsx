import React from 'react';
import './FundoEstelar.css';

export default function FundoEstelar({ children }) {
  return (
    <div className="fundo-espacial-container">
      <div className="estrelas-1"></div>
      <div className="estrelas-2"></div>
      <div className="estrelas-3"></div>
      {/* O conteúdo da sua página (Login, Welcome) vai renderizar aqui dentro */}
      <div className="conteudo-pagina">
        {children}
      </div>
    </div>
  );
}