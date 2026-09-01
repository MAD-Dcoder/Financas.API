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

  const verificarFaturaAtualReal = () => {
    if (!diaVencimento) return false;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    let mesEsperado = hoje.getMonth() + 1;
    let anoEsperado = hoje.getFullYear();

    const dataVencimentoReal = new Date(anoEsperado, mesEsperado - 1, parseInt(diaVencimento, 10));
    
    if (hoje > dataVencimentoReal) {
      mesEsperado += 1;
      if (mesEsperado > 12) {
        mesEsperado = 1;
        anoEsperado += 1;
      }
    }
    
    return mesVencimentoFatura === String(mesEsperado).padStart(2, '0');
  };

  const getDiasParaAlvo = (diaAlvoInt) => {
    if (!diaAlvoInt) return null;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    let dataAlvo = new Date(hoje.getFullYear(), hoje.getMonth(), diaAlvoInt);
    if (hoje > dataAlvo) {
      dataAlvo.setMonth(dataAlvo.getMonth() + 1);
    }

    const diffTime = dataAlvo.getTime() - hoje.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const isFaturaFechada = () => {
    const hoje = new Date();
    const diaHoje = hoje.getDate();
    const df = parseInt(diaFechamento, 10);
    const dv = parseInt(diaVencimento, 10);

    if (!df || !dv) return false;

    if (dv > df) {
      return diaHoje > df && diaHoje <= dv;
    } else {
      return diaHoje > df || diaHoje <= dv;
    }
  };

  const diaFechamentoInt = parseInt(diaFechamento, 10);
  const diaVencimentoInt = parseInt(diaVencimento, 10);

  const diasParaFechar = getDiasParaAlvo(diaFechamentoInt);
  const diasParaVencer = getDiasParaAlvo(diaVencimentoInt);
  const faturaFechada = isFaturaFechada();
  const isFaturaAtual = verificarFaturaAtualReal();

  let showAlert = false;
  let tipoAlerta = '';
  let diasAlerta = 0;

  if (isFaturaAtual) {
    if (faturaFechada) {
      if (diasParaVencer !== null && diasParaVencer <= 7) {
        showAlert = true;
        tipoAlerta = 'vencimento';
        diasAlerta = diasParaVencer;
      }
    } else {
      if (diasParaFechar !== null && diasParaFechar <= 7) {
        showAlert = true;
        tipoAlerta = 'fechamento';
        diasAlerta = diasParaFechar;
      }
    }
  }

  return (
    <section className="flip-container position-relative" style={{ perspective: '1000px', marginTop: '10px' }}>
      
      <div 
        className="flip-card-inner position-relative w-100" 
        onClick={() => setIsCardFlipped(!isCardFlipped)}
        style={{ 
          transform: isCardFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          transformStyle: 'preserve-3d',
          minHeight: '218px',
          height: '100%',
          cursor: 'pointer'
        }}
      >
        
        {/* =======================================================
            FRENTE DO CARTÃO (SALDO LIVRE)
            ======================================================= */}
        <div 
          className={`card d-flex flex-column justify-content-between w-100 h-100 ${isDark ? 'dark-card' : 'bg-white border-0'}`}
          style={{ 
            padding: '1.25rem 1.25rem 1rem 1.25rem',
            borderRadius: '1rem',
            position: 'absolute',
            top: 0,
            left: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            zIndex: 2
          }}
        >
          <div 
            className="position-absolute d-flex align-items-center justify-content-center shadow-sm" 
            style={{ 
              top: '15px', right: '15px', color: '#10b981', zIndex: 10,
              background: 'rgba(16, 185, 129, 0.1)', padding: '0 10px', 
              borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)',
              height: '26px', minHeight: '26px', pointerEvents: 'none'
            }}
          >
            <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', marginRight: '6px', fontWeight: 'bold' }}>
              Verso
            </span>
            <FiRefreshCw size={12} />
          </div>

          <div style={{ marginTop: '2px' }}>
            <p className={`mb-1 ${isDark ? 'text-light opacity-75' : 'text-secondary'}`} style={{ fontSize: '0.9rem' }}>Saldo atual livre</p>
            <h1 className={`mb-0 fw-bold ${isDark ? 'text-white' : 'text-dark'}`} style={{ letterSpacing: '-0.5px' }}>
              {showBalance ? formatarMoeda(saldoAtual) : 'R$ •••••••'}
            </h1>
          </div>
          
          <div className="d-flex justify-content-between mt-auto w-100">
            <div>
               <small className={`d-block mb-1 ${isDark ? 'text-light opacity-75' : 'text-secondary'}`} style={{ fontSize: '0.75rem' }}>Receitas ({mesFiltro.nome}) ↙</small>
               <span className="text-emerald fw-bold" style={{ fontSize: '0.95rem' }}>
                 {showBalance ? formatarMoeda(receitasDoMes) : 'R$ •••••'}
               </span>
            </div>
            <div className="text-end">
               <small className={`d-block mb-1 ${isDark ? 'text-light opacity-75' : 'text-secondary'}`} style={{ fontSize: '0.75rem' }}>Despesas ({mesFiltro.nome}) ↗</small>
               <span className={`fw-bold ${isDark ? 'text-white' : 'text-dark'}`} style={{ fontSize: '0.95rem' }}>
                 {showBalance ? formatarMoeda(despesasDoMes) : 'R$ •••••'}
               </span>
            </div>
          </div>
        </div>

        {/* =======================================================
            VERSO DO CARTÃO (CARTÃO DE CRÉDITO)
            ======================================================= */}
        <div 
          className="w-100 h-100" 
          style={{ 
            background: corCartao, 
            padding: '1.15rem 1.25rem', 
            borderRadius: '1rem',
            border: '1px solid rgba(255,255,255,0.1)', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'space-between', 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            overflow: 'hidden',
            backfaceVisibility: 'hidden', 
            WebkitBackfaceVisibility: 'hidden', 
            transform: 'rotateY(180deg)',
            zIndex: 1
          }}
        >
            {isMagalu && (
              <div style={{
                position: 'absolute', top: 0, bottom: 0, left: 0, width: '6px',
                background: 'linear-gradient(180deg, #00A3E0 0%, #009944 25%, #FFDF00 50%, #FF8200 75%, #E4002B 100%)', zIndex: 0
              }} />
            )}

            <button 
              type="button"
              className="btn btn-link text-white shadow-none border-0 d-flex align-items-center justify-content-center" 
              style={{ 
                position: 'absolute', top: '10px', right: '10px', width: '40px', height: '40px',
                zIndex: 99999, cursor: 'pointer', transform: 'translateZ(50px)', padding: 0, margin: 0
              }}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { 
                e.preventDefault();        
                e.stopPropagation();        
                setTempDiaVencimento(diaVencimento); setTempDiaFechamento(diaFechamento); setTempCor(corCartao); setTempApelido(apelidoCartao); setTempFinal(finalCartao); setTempBandeira(bandeiraCartao);
                setShowCardSettings(true); 
              }}
            >
              <FiMoreVertical size={24} />
            </button>

            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
              
              <div className="d-flex justify-content-between align-items-start" style={{ minHeight: '30px' }}>
                <div className="d-flex align-items-center">
                  <span className="text-white fw-bold opacity-75" style={{ fontSize: '0.95rem', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                    {apelidoCartao}
                  </span>
                </div>
                <div style={{ width: '30px', height: '30px' }}></div>
              </div>

              <div className="text-center my-1">
                <small className="text-light opacity-75 d-block mb-1" style={{ fontSize: '0.75rem' }}>
                  Fatura de {nomeMesVencimentoFatura || mesFiltro.nome}
                </small>
                
                <h2 className="mb-0 fw-bold text-white" style={{ fontSize: '1.5rem', textShadow: '1px 1px 3px rgba(0,0,0,0.4)' }}>
                  {showBalance ? formatarMoeda(totalFaturaMes) : 'R$ •••••••'}
                </h2>
                
                {/* --- ÁREA DINÂMICA DE STATUS --- */}
                <div className="d-flex justify-content-center align-items-center mt-1" style={{ minHeight: '26px' }}>
                  {showAlert ? (
                    <div 
                      className="px-3 py-1 rounded-pill d-inline-flex align-items-center justify-content-center shadow-sm" 
                      style={{ 
                        background: tipoAlerta === 'vencimento' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)', 
                        border: `1px solid ${tipoAlerta === 'vencimento' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`, 
                        backdropFilter: 'blur(4px)' 
                      }}
                    >
                      <span className="spinner-grow spinner-grow-sm me-2" style={{ width: '0.35rem', height: '0.35rem', backgroundColor: tipoAlerta === 'vencimento' ? '#ef4444' : '#f59e0b', animationDuration: '1.5s' }}></span>
                      <span className="text-white fw-bold" style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}>
                        {tipoAlerta === 'vencimento' 
                          ? (diasAlerta === 0 ? 'VENCE HOJE' : `VENCE EM ${diasAlerta} DIA${diasAlerta > 1 ? 'S' : ''}`) 
                          : (diasAlerta === 0 ? 'FECHA HOJE' : `FECHA EM ${diasAlerta} DIA${diasAlerta > 1 ? 'S' : ''}`)
                        }
                      </span>
                    </div>
                  ) : (
                    <div className="d-flex align-items-center gap-2" style={{ fontSize: '0.75rem' }}>
                      <span className="text-light opacity-75">Vence: {diaVencimento === '00' ? '00/00' : `${diaVencimento}/${mesVencimentoFatura}`}</span>
                      <span className={`badge bg-dark bg-opacity-25 border border-light border-opacity-25 shadow-sm ${statusFatura.cor}`}>
                        {statusFatura.texto}
                      </span>
                    </div>
                  )}
                </div>
                {/* ------------------------------ */}
              </div>

              <div className="mt-auto pt-1">
                <h5 className="text-white mb-1 fw-bold opacity-75" style={{ letterSpacing: '2px', fontSize: '1rem', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                  **** **** **** {finalCartao}
                </h5>
                <div className="d-flex justify-content-between align-items-end">
                  {/* Fonte do nome ajustada para 0.82rem */}
                  <small className="text-light opacity-75 text-uppercase fw-bold m-0 p-0" style={{ fontSize: '0.82rem', letterSpacing: '1px' }}>
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