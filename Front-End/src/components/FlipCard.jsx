import React from 'react';
import { FiMoreVertical } from 'react-icons/fi';
import { formatarMoeda } from '../utils/formatters';

function FlipCard({
  isCardFlipped, setIsCardFlipped,
  showBalance,
  saldoAtual, receitasDoMes, despesasDoMes,
  mesFiltro,
  corCartao, apelidoCartao, diaVencimento, diaFechamento, finalCartao, nomeCartao, bandeiraCartao,
  totalFaturaMes, statusFatura, mesVencimentoFatura,
  setShowCardSettings, setTempDiaVencimento, setTempDiaFechamento, setTempCor, setTempApelido, setTempFinal, setTempNome, setTempBandeira
}) {

  const renderLogoBandeira = () => {
    if (bandeiraCartao === 'Visa') {
      return <div className="text-white fw-bold fst-italic" style={{ fontSize: '24px', letterSpacing: '-1px', textShadow: '1px 1px 2px rgba(0,0,0,0.5)', marginRight: '5px' }}>VISA</div>;
    }
    if (bandeiraCartao === 'Elo') {
      return (
        <div className="d-flex align-items-center justify-content-center" style={{ width: '42px', height: '26px', backgroundColor: '#000', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', marginRight: '5px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid #00a4e0', marginLeft: '4px' }}></div>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid #ffb71b', marginLeft: '-6px', zIndex: 1 }}></div>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid #ef3340', marginLeft: '-6px', zIndex: 2 }}></div>
        </div>
      );
    }
    return (
      <div className="d-flex" style={{ marginRight: '5px' }}>
        <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#eb001b', opacity: 0.8, marginRight: '-10px', zIndex: 1 }}></div>
        <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#f79e1b', opacity: 0.8 }}></div>
      </div>
    );
  };

  return (
    <section className="flip-container" onClick={() => setIsCardFlipped(!isCardFlipped)}>
      <div className="flip-card-inner" style={{ transform: isCardFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
        
        {/* CARTÃO GERAL (AJUSTADO PARA DESCER AS RECEITAS E DESPESAS) */}
        <div className="flip-card-front card dark-card p-4 d-flex flex-column justify-content-between h-100">
          <div>
            <p className="text-light opacity-75 mb-1">Saldo atual livre</p>
            <h1 className="mb-0 fw-bold text-white">
              {showBalance ? formatarMoeda(saldoAtual) : 'R$ •••••••'}
            </h1>
          </div>
          
          <div className="d-flex justify-content-between mt-auto pt-4" style={{ marginBottom: '-8px' }}>
            <div>
               <small className="text-light opacity-75 d-block mb-1">Receitas ({mesFiltro.nome}) ↙</small>
               <span className="text-emerald fw-bold">
                 {showBalance ? formatarMoeda(receitasDoMes) : 'R$ •••••'}
               </span>
            </div>
            <div className="text-end">
               <small className="text-light opacity-75 d-block mb-1">Despesas ({mesFiltro.nome}) ↗</small>
               <span className="text-white fw-bold">
                 {showBalance ? formatarMoeda(despesasDoMes) : 'R$ •••••'}
               </span>
            </div>
          </div>
        </div>

        {/* CARTÃO DE CRÉDITO */}
        <div 
          className="flip-card-back shadow-lg h-100" 
          style={{ 
            background: corCartao, 
            padding: '1.25rem', 
            borderRadius: '1rem',
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'space-between'
          }}
        >
            <div className="d-flex justify-content-between align-items-start">
              <span className="text-white fw-bold opacity-75" style={{ fontSize: '1rem', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>{apelidoCartao}</span>
              <button 
                className="btn btn-link p-0 text-white shadow-none border-0" 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setTempDiaVencimento(diaVencimento);
                  setTempDiaFechamento(diaFechamento);
                  setTempCor(corCartao);
                  setTempApelido(apelidoCartao);
                  setTempFinal(finalCartao);
                  setTempNome(nomeCartao);
                  setTempBandeira(bandeiraCartao);
                  setShowCardSettings(true); 
                }}
              >
                <FiMoreVertical size={22} />
              </button>
            </div>

            <div className="text-center my-2">
              <small className="text-light opacity-75 d-block mb-1" style={{ fontSize: '0.8rem' }}>Fatura de {mesFiltro.nome}</small>
              <h2 className="mb-1 fw-bold text-white" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.4)' }}>
                {showBalance ? formatarMoeda(totalFaturaMes) : 'R$ •••••••'}
              </h2>
              <div className="d-flex justify-content-center align-items-center gap-2 mt-1" style={{ fontSize: '0.75rem' }}>
                <span className="text-light opacity-75">Vence: {diaVencimento === '00' ? '00/00' : `${diaVencimento}/${mesVencimentoFatura}`}</span>
                <span className={`badge bg-dark bg-opacity-25 border border-light border-opacity-25 shadow-sm ${statusFatura.cor}`}>
                  {statusFatura.texto}
                </span>
              </div>
            </div>

            <div className="mt-auto">
              <h5 className="text-white mb-2 fw-bold opacity-75" style={{ letterSpacing: '2px', fontSize: '1.1rem', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                **** **** **** {finalCartao}
              </h5>
              <div className="d-flex justify-content-between align-items-end">
                <small className="text-light opacity-75 text-uppercase fw-bold m-0 p-0" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>
                  {nomeCartao}
                </small>
                {renderLogoBandeira()}
              </div>
            </div>
        </div>

      </div>
    </section>
  );
}

export default FlipCard;