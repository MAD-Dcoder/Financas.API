
import React from 'react';
import { FiCreditCard, FiSliders, FiCalendar, FiEdit3, FiCheckCircle } from 'react-icons/fi';

function CardControleLimite({
  cartao,
  isDark,
  limiteTotalCartao,
  valorFaturaAtual,
  valorProximaFatura,
  totalComprometido,
  pendentes,
  temTransacoes,
  nomeMes,
  estaEditando,
  setEditandoLimiteId,
  handlePagarFatura,
  processandoPagamento,
  handleEditarCartaoEspecifico
}) {
  
  // Calcula quantos dias faltam exatos para a data alvo neste ou no próximo mês
  const getDiasPara = (diaAlvo) => {
    if (!diaAlvo) return null;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    let dataAlvo = new Date(hoje.getFullYear(), hoje.getMonth(), diaAlvo);
    
    // Se a data já passou no mês atual, joga o alvo para o próximo mês
    if (dataAlvo < hoje) {
      dataAlvo.setMonth(dataAlvo.getMonth() + 1);
    }
    
    const diffTime = dataAlvo.getTime() - hoje.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getDynamicColor = (percent) => {
    let hue = percent <= 60 ? 140 : percent <= 80 ? 140 - ((percent - 60) * 5) : Math.max(0, 40 - ((percent - 80) * 2));
    return `hsl(${hue}, 85%, ${isDark ? '55%' : '45%'})`;
  };

  const extrairCorBase = (corString) => {
    if (!corString) return '#10b981';
    if (corString.startsWith('#')) return corString;
    const matchHex = corString.match(/#[0-9a-fA-F]{6}/);
    return matchHex ? matchHex[0] : '#10b981';
  };

  // A fatura só é considerada "Fechada" no dia SEGUINTE ao fechamento.
  // No próprio dia, ela ainda está aberta (FECHA HOJE).
  const isFaturaFechada = () => {
    const hoje = new Date();
    const diaHoje = hoje.getDate();
    const df = parseInt(cartao.diaFechamento || cartao.DiaFechamento, 10);
    const dv = parseInt(cartao.diaVencimento || cartao.DiaVencimento, 10);

    if (!df || !dv) return false;

    if (dv > df) {
      return diaHoje > df && diaHoje <= dv;
    } else {
      return diaHoje > df || diaHoje <= dv;
    }
  };

  const porcentagemUso = limiteTotalCartao > 0 ? Math.min(Math.round((totalComprometido / limiteTotalCartao) * 100), 100) : 0;
  const valorDisponivel = limiteTotalCartao > 0 ? Math.max(limiteTotalCartao - totalComprometido, 0) : 0;
  const isEstourado = porcentagemUso > 85;

  const corDinamica = getDynamicColor(porcentagemUso);
  const corBaseCartao = extrairCorBase(cartao.corFundo || cartao.corCartao);

  const nomeCartao = cartao.apelidoCartao || cartao.ApelidoCartao || cartao.nome || cartao.Nome || 'Cartão';
  const finalDigitos = cartao.finalCartao || cartao.FinalCartao || cartao.ultimosDigitos || cartao.UltimosDigitos || '0000';

  const diaFechamentoInt = parseInt(cartao.diaFechamento || cartao.DiaFechamento, 10);
  const diaVencimentoInt = parseInt(cartao.diaVencimento || cartao.DiaVencimento, 10);
  
  const diasParaFechar = getDiasPara(diaFechamentoInt); 
  const diasParaVencer = getDiasPara(diaVencimentoInt);
  const faturaFechada = isFaturaFechada();

  // Lógica inteligente de transição da pílula
  let showAlert = false;
  let tipoAlerta = '';
  let diasAlerta = 0;

  if (faturaFechada) {
    if (pendentes) {
      // Se fechou e não está pago, mostra contagem de VENCIMENTO direto (mesmo que falte 10 dias)
      showAlert = true;
      tipoAlerta = 'vencimento';
      diasAlerta = diasParaVencer;
    }
  } else {
    if (diasParaFechar !== null && diasParaFechar <= 7) {
      // Se está aberta, avisa do FECHAMENTO só nos últimos 7 dias
      showAlert = true;
      tipoAlerta = 'fechamento';
      diasAlerta = diasParaFechar;
    }
  }

  return (
    <div 
      className="config-card p-4" 
      style={{ 
        flexDirection: 'column', 
        alignItems: 'stretch', 
        gap: '0', 
        borderRadius: '20px',
        border: isEstourado ? '1px solid rgba(239, 68, 68, 0.4)' : (isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.04)'),
        boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.2)' : '0 4px 20px rgba(0,0,0,0.02)'
      }}
    >
      <div className="d-flex justify-content-between align-items-center gap-2 mb-3">
        <div className="d-flex align-items-center gap-3" style={{ minWidth: 0, flex: 1 }}>
          <div 
            className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
            style={{ width: '42px', height: '42px', backgroundColor: `${corBaseCartao}25`, color: corBaseCartao }}
          >
            <FiCreditCard size={20} />
          </div>
          
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="d-flex align-items-center gap-1">
              <span className="fw-bold text-truncate" style={{ fontSize: '0.95rem', color: isDark ? '#fff' : '#111', maxWidth: '140px' }}>
                {nomeCartao}
              </span>
              <span className="text-muted text-nowrap flex-shrink-0" style={{ fontSize: '0.75rem' }}>
                (Final {finalDigitos})
              </span>
            </div>
            
            {showAlert ? (
              <div 
                className="mt-1 px-2 py-0 rounded-pill d-inline-flex align-items-center justify-content-center shadow-sm" 
                style={{ 
                  background: tipoAlerta === 'vencimento' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(245, 158, 11, 0.12)', 
                  border: `1px solid ${tipoAlerta === 'vencimento' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)'}` 
                }}
              >
                <span 
                  className="spinner-grow spinner-grow-sm me-1" 
                  style={{ width: '0.30rem', height: '0.30rem', backgroundColor: tipoAlerta === 'vencimento' ? '#ef4444' : '#f59e0b', animationDuration: '1.5s' }}
                ></span>
                <span 
                  className="fw-bold" 
                  style={{ fontSize: '0.65rem', letterSpacing: '0.5px', color: tipoAlerta === 'vencimento' ? '#ef4444' : (isDark ? '#fbbf24' : '#d97706') }}
                >
                  {tipoAlerta === 'vencimento' 
                    ? (diasAlerta === 0 ? 'VENCE HOJE' : `VENCE EM ${diasAlerta} DIA${diasAlerta > 1 ? 'S' : ''}`) 
                    : (diasAlerta === 0 ? 'FECHA HOJE' : `FECHA EM ${diasAlerta} DIA${diasAlerta > 1 ? 'S' : ''}`)
                  }
                </span>
              </div>
            ) : (
              <span className="text-muted d-block mt-1" style={{ fontSize: '0.73rem' }}>Fatura atual em aberto</span>
            )}
          </div>
        </div>

        <button 
          className="btn btn-sm d-flex align-items-center justify-content-center p-2 rounded-circle flex-shrink-0 ms-1"
          style={{ 
            width: '32px', height: '32px',
            backgroundColor: estaEditando ? '#10b981' : (isDark ? 'rgba(255,255,255,0.08)' : '#f0f2f5'), 
            color: estaEditando ? '#ffffff' : (isDark ? '#cbd5e1' : '#4b5563'),
            border: 'none', transition: 'all 0.2s'
          }}
          onClick={() => setEditandoLimiteId(estaEditando ? null : cartao.id)}
          title="Detalhes"
        >
          <FiSliders size={14} />
        </button>
      </div>

      <div 
        className="p-3 rounded-4 mb-3" 
        style={{ 
          backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#f8f9fa',
          border: isDark ? '1px solid rgba(255,255,255,0.03)' : '1px solid #e9ecef'
        }}
      >
        <div className="d-flex justify-content-between align-items-end">
          <div>
            <span className="text-muted d-block mb-1" style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Fatura Atual</span>
            <span className="fw-bold" style={{ color: corDinamica, fontSize: '1.25rem', transition: 'color 0.4s ease' }}>
              R$ {valorFaturaAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="text-end">
            <span className="text-muted d-block mb-1" style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Limite Total</span>
            <span className={`fw-bold ${isDark ? 'text-light' : 'text-dark'}`} style={{ fontSize: '0.95rem' }}>
              R$ {limiteTotalCartao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      <div>
        <div className="w-100" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#e9ecef', borderRadius: '10px', height: '10px', overflow: 'hidden' }}>
          <div 
            style={{ 
              width: `${porcentagemUso}%`, 
              backgroundColor: corDinamica, 
              height: '100%', 
              borderRadius: '10px', 
              transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.4s ease' 
            }}
          ></div>
        </div>
        <div className="d-flex justify-content-between align-items-center mt-2" style={{ fontSize: '0.75rem' }}>
          <span className="text-muted">Disponível: R$ {valorDisponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          <span className="fw-bold" style={{ color: corDinamica, transition: 'color 0.4s ease' }}>
            {porcentagemUso}% utilizado
          </span>
        </div>
      </div>

      {temTransacoes && faturaFechada && (
        <div 
          className="mt-3 p-3 rounded-4 d-flex justify-content-between align-items-center animate-fadeIn" 
          style={{ 
            backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)', 
            border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.3)'}` 
          }}
        >
          {pendentes ? (
            <>
              <span style={{ fontSize: '0.82rem', color: isDark ? '#34d399' : '#059669', fontWeight: '600' }}>
                A fatura de {nomeMes} já foi paga?
              </span>
              <button 
                className="btn btn-sm rounded-pill fw-bold px-3 py-1" 
                style={{ backgroundColor: '#10b981', color: '#fff', fontSize: '0.75rem', border: 'none', transition: 'all 0.2s' }} 
                onClick={() => handlePagarFatura(cartao)} 
                disabled={processandoPagamento === cartao.id}
              >
                {processandoPagamento === cartao.id ? <span className="spinner-border spinner-border-sm" /> : 'Sim, paguei'}
              </button>
            </>
          ) : (
            <>
              <span style={{ fontSize: '0.82rem', color: isDark ? '#34d399' : '#059669', fontWeight: '600' }}>
                Fatura de {nomeMes} paga!
              </span>
              <FiCheckCircle size={20} color={isDark ? '#34d399' : '#059669'} />
            </>
          )}
        </div>
      )}

      {estaEditando && (
        <div className="pt-4 mt-3 animate-fadeIn" style={{ borderTop: `1px dashed ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
          <div 
            className="d-flex align-items-center justify-content-between py-2 px-3 rounded-4 mb-3" 
            style={{ 
              backgroundColor: isDark ? 'rgba(139, 92, 246, 0.08)' : '#f9f5ff',
              border: isDark ? '1px solid rgba(139, 92, 246, 0.2)' : '1px solid #f3e8ff'
            }}
          >
            <div className="d-flex align-items-center gap-2">
              <div 
                className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" 
                style={{ width: '26px', height: '26px', backgroundColor: isDark ? 'rgba(139, 92, 246, 0.2)' : '#f3e8ff', color: '#8b5cf6' }}
              >
                <FiCalendar size={13} />
              </div>
              <span style={{ fontSize: '0.8rem', color: isDark ? '#cbd5e1' : '#4b5563', fontWeight: '500' }}>
                Próxima Fatura Estimada
              </span>
            </div>
            <span className="fw-bold" style={{ color: '#8b5cf6', fontSize: '0.9rem', letterSpacing: '0.3px' }}>
              R$ {valorProximaFatura.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <button 
            className="btn btn-link p-0 text-decoration-none d-flex align-items-center gap-1"
            style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: '500' }}
            onClick={() => handleEditarCartaoEspecifico(cartao.id)}
          >
            <FiEdit3 size={15}/> Configurações avançadas do cartão
          </button>
        </div>
      )}
    </div>
  );
}

export default CardControleLimite;