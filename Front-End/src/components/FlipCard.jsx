import React from 'react';
import { FiMoreVertical, FiRefreshCw } from 'react-icons/fi';
import { formatarMoeda } from '../utils/formatters';

function FlipCard({
  isCardFlipped, setIsCardFlipped,
  showBalance,
  saldoAtual, receitasDoMes, despesasDoMes,
  mesFiltro,
  corCartao, apelidoCartao, diaVencimento, diaFechamento, finalCartao, nomeCartao, bandeiraCartao,
  totalFaturaMes, statusFatura, mesVencimentoFatura,
  nomeMesVencimentoFatura, 
  setShowCardSettings, setTempDiaVencimento, setTempDiaFechamento, setTempCor, setTempApelido, setTempFinal, setTempBandeira,
  temaAtual
}) {
  const isDark = temaAtual === 'dark';

  const isMagalu = corCartao && (corCartao.includes('#C5A059') || corCartao.includes('#D3D3D3'));

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
    <section className="flip-container position-relative" style={{ perspective: '1000px', marginTop: '10px' }}>
      
      <div 
        className="flip-card-inner position-relative" 
        onClick={() => setIsCardFlipped(!isCardFlipped)}
        style={{ 
          transform: isCardFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          transformStyle: 'preserve-3d',
          zIndex: 1
        }}
      >
        
        {/* INDICADOR VISUAL (APARECE APENAS NA FRENTE) */}
        {!isCardFlipped && (
          <div 
            className="position-absolute d-flex align-items-center" 
            style={{ 
              top: '15px', 
              right: '15px', 
              color: '#10b981', 
              zIndex: 10,
              background: 'rgba(16, 185, 129, 0.1)',
              padding: '4px 8px',
              borderRadius: '12px',
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}
          >
            <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', marginRight: '6px', fontWeight: 'bold' }}>
              Verso
            </span>
            <FiRefreshCw size={14} />
          </div>
        )}
        
        {/* CARTÃO GERAL (FRONT) */}
        <div className={`flip-card-front card p-4 d-flex flex-column justify-content-between h-100 ${isDark ? 'dark-card' : 'bg-white shadow-sm border-0'}`}>
          <div>
            <p className={`mb-1 ${isDark ? 'text-light opacity-75' : 'text-secondary'}`}>Saldo atual livre</p>
            <h1 className={`mb-0 fw-bold ${isDark ? 'text-white' : 'text-dark'}`}>
              {showBalance ? formatarMoeda(saldoAtual) : 'R$ •••••••'}
            </h1>
          </div>
          
          <div className="d-flex justify-content-between mt-auto pt-4" style={{ marginBottom: '-8px' }}>
            <div>
               <small className={`d-block mb-1 ${isDark ? 'text-light opacity-75' : 'text-secondary'}`}>Receitas ({mesFiltro.nome}) ↙</small>
               <span className="text-emerald fw-bold">
                 {showBalance ? formatarMoeda(receitasDoMes) : 'R$ •••••'}
               </span>
            </div>
            <div className="text-end">
               <small className={`d-block mb-1 ${isDark ? 'text-light opacity-75' : 'text-secondary'}`}>Despesas ({mesFiltro.nome}) ↗</small>
               <span className={`fw-bold ${isDark ? 'text-white' : 'text-dark'}`}>
                 {showBalance ? formatarMoeda(despesasDoMes) : 'R$ •••••'}
               </span>
            </div>
          </div>
        </div>

        {/* CARTÃO DE CRÉDITO (BACK) */}
        <div 
          className="flip-card-back shadow-lg h-100" 
          style={{ 
            background: corCartao, 
            padding: '1.25rem', 
            borderRadius: '1rem',
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'space-between',
            position: 'relative', 
            overflow: 'hidden'    
          }}
        >
            {/* FAIXA RAINBOW CONDICIONAL */}
            {isMagalu && (
              <div style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                width: '6px',
                background: 'linear-gradient(180deg, #00A3E0 0%, #009944 25%, #FFDF00 50%, #FF8200 75%, #E4002B 100%)',
                zIndex: 0
              }} />
            )}

            {/* BOTÃO ABSOLUTO COM TRANSLATE Z (CORREÇÃO DE CLIQUE 3D) */}
            <button 
              type="button"
              className="btn btn-link text-white shadow-none border-0 d-flex align-items-center justify-content-center" 
              style={{ 
                position: 'absolute',
                top: '12px',
                right: '12px',
                width: '45px',
                height: '45px',
                zIndex: 99999,
                cursor: 'pointer',
                transform: 'translateZ(50px)',
                padding: 0,
                margin: 0
              }}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { 
                e.preventDefault();         
                e.stopPropagation();        
                setTempDiaVencimento(diaVencimento);
                setTempDiaFechamento(diaFechamento);
                setTempCor(corCartao);
                setTempApelido(apelidoCartao);
                setTempFinal(finalCartao);
                setTempBandeira(bandeiraCartao);
                setShowCardSettings(true); 
              }}
            >
              <FiMoreVertical size={26} />
            </button>

            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
              <div className="d-flex justify-content-between align-items-start">
                <span className="text-white fw-bold opacity-75" style={{ fontSize: '1rem', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>{apelidoCartao}</span>
                {/* Espaçador invisível para garantir que o texto não ocupe a área do botão */}
                <div style={{ width: '35px', height: '35px' }}></div>
              </div>

              <div className="text-center my-2">
                {/* --- AQUI ESTÁ A ATUALIZAÇÃO --- */}
                <small className="text-light opacity-75 d-block mb-1" style={{ fontSize: '0.8rem' }}>
                  Fatura de {nomeMesVencimentoFatura || mesFiltro.nome}
                </small>
                {/* ------------------------------- */}
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
      </div>
    </section>
  );
}

export default FlipCard;