import React from 'react';
import { FiCreditCard, FiSliders, FiCalendar, FiEdit3 } from 'react-icons/fi';

function CardControleLimite({
  cartao,
  isDark,
  limiteTotalCartao,
  totalComprometido,
  estaEditando,
  setEditandoLimiteId,
  handlePagarFatura,
  processandoPagamento,
  handleEditarCartaoEspecifico,
  status
}) {

  const faturaAtual = status?.atual || { total: 0, nomeMes: 'Atual', pendentes: 0 };
  const faturaAnterior = status?.anterior;
  const faturaProxima = status?.proxima || { total: 0, nomeMes: 'Próxima' };

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

  const porcentagemUso = limiteTotalCartao > 0 ? Math.min(Math.round((totalComprometido / limiteTotalCartao) * 100), 100) : 0;
  const valorDisponivel = limiteTotalCartao > 0 ? Math.max(limiteTotalCartao - totalComprometido, 0) : 0;
  const isEstourado = porcentagemUso > 85;

  const corDinamica = getDynamicColor(porcentagemUso);
  const corBaseCartao = extrairCorBase(cartao.corFundo || cartao.corCartao);
  const nomeCartao = cartao.apelidoCartao || cartao.ApelidoCartao || cartao.nome || cartao.Nome || 'Cartão';
  const finalDigitos = cartao.finalCartao || cartao.FinalCartao || cartao.ultimosDigitos || cartao.UltimosDigitos || '0000';

  return (
    <div 
      className="config-card p-4" 
      style={{ 
        flexDirection: 'column', alignItems: 'stretch', gap: '0', borderRadius: '20px',
        border: isEstourado ? '1px solid rgba(239, 68, 68, 0.4)' : (isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.04)'),
        boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.2)' : '0 4px 20px rgba(0,0,0,0.02)'
      }}
    >
      <div className="d-flex justify-content-between align-items-center gap-2 mb-3">
        <div className="d-flex align-items-center gap-3" style={{ minWidth: 0, flex: 1 }}>
          <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '42px', height: '42px', backgroundColor: `${corBaseCartao}25`, color: corBaseCartao }}>
            <FiCreditCard size={20} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="d-flex align-items-center gap-1">
              <span className="fw-bold text-truncate" style={{ fontSize: '0.95rem', color: isDark ? '#fff' : '#111', maxWidth: '140px' }}>{nomeCartao}</span>
              <span className="text-muted text-nowrap flex-shrink-0" style={{ fontSize: '0.75rem' }}>(Final {finalDigitos})</span>
            </div>
            <span className="text-muted d-block mt-1" style={{ fontSize: '0.73rem' }}>Fatura atual em aberto</span>
          </div>
        </div>

        <button 
          className="btn btn-sm d-flex align-items-center justify-content-center p-2 rounded-circle flex-shrink-0 ms-1"
          style={{ width: '32px', height: '32px', backgroundColor: estaEditando ? '#10b981' : (isDark ? 'rgba(255,255,255,0.08)' : '#f0f2f5'), color: estaEditando ? '#ffffff' : (isDark ? '#cbd5e1' : '#4b5563'), border: 'none', transition: 'all 0.2s' }}
          onClick={() => setEditandoLimiteId(estaEditando ? null : cartao.id)}
        >
          <FiSliders size={14} />
        </button>
      </div>

      <div className="p-3 rounded-4 mb-3" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#f8f9fa', border: isDark ? '1px solid rgba(255,255,255,0.03)' : '1px solid #e9ecef' }}>
        <div className="d-flex justify-content-between align-items-end">
          <div>
            <span className="text-muted d-block mb-1" style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>FATURA DE {faturaAtual.nomeMes}</span>
            <span className="fw-bold" style={{ color: corDinamica, fontSize: '1.25rem', transition: 'color 0.4s ease' }}>
              R$ {faturaAtual.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
          <div style={{ width: `${porcentagemUso}%`, backgroundColor: corDinamica, height: '100%', borderRadius: '10px', transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.4s ease' }}></div>
        </div>
        <div className="d-flex justify-content-between align-items-center mt-2" style={{ fontSize: '0.75rem' }}>
          <span className="text-muted">Disponível: R$ {valorDisponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          <span className="fw-bold" style={{ color: corDinamica, transition: 'color 0.4s ease' }}>{porcentagemUso}% utilizado</span>
        </div>
      </div>

      {estaEditando && (
        <div className="pt-4 mt-3 animate-fadeIn" style={{ borderTop: `1px dashed ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
          
          {faturaAtual.pendentes > 0 ? (
            <div className="mb-3 p-3 rounded-4 d-flex justify-content-between align-items-center" style={{ backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)', border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.3)'}` }}>
              <span style={{ fontSize: '0.82rem', color: isDark ? '#34d399' : '#059669', fontWeight: '600' }}>
                A fatura de {faturaAtual.nomeMes} já foi paga?
              </span>
              <button 
                className="btn btn-sm rounded-pill fw-bold px-3 py-1" 
                style={{ backgroundColor: '#10b981', color: '#fff', fontSize: '0.75rem', border: 'none', transition: 'all 0.2s' }} 
                onClick={() => handlePagarFatura(cartao, faturaAtual, false)} 
                disabled={processandoPagamento === cartao.id}
              >
                {processandoPagamento === cartao.id ? <span className="spinner-border spinner-border-sm" /> : 'Sim, paguei'}
              </button>
            </div>
          ) : null}

          {faturaAtual.pendentes === 0 && faturaAtual.transacoes?.length > 0 && (
             <div className="mb-3 p-3 rounded-4 d-flex justify-content-between align-items-center" style={{ backgroundColor: isDark ? 'rgba(16, 185, 129, 0.05)' : 'rgba(16, 185, 129, 0.03)', border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.15)'}` }}>
                <span style={{ fontSize: '0.82rem', color: isDark ? '#34d399' : '#059669', fontWeight: '600' }}>
                  Fatura de {faturaAtual.nomeMes} paga!
                </span>
                <button 
                  className="btn btn-sm text-decoration-underline" 
                  style={{ color: isDark ? '#34d399' : '#059669', fontSize: '0.75rem', border: 'none', background: 'none', padding: 0 }} 
                  onClick={() => handlePagarFatura(cartao, faturaAtual, true)} 
                  disabled={processandoPagamento === cartao.id}
                >
                  {processandoPagamento === cartao.id ? 'Aguarde...' : 'Desfazer'}
                </button>
            </div>
          )}

          {faturaAnterior && faturaAnterior.pendentes === 0 && faturaAnterior.transacoes.length > 0 && (
            <div className="mb-3 p-3 rounded-4 d-flex justify-content-between align-items-center" style={{ backgroundColor: isDark ? 'rgba(16, 185, 129, 0.05)' : 'rgba(16, 185, 129, 0.03)', border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.15)'}` }}>
              <span style={{ fontSize: '0.82rem', color: isDark ? '#34d399' : '#059669', fontWeight: '600' }}>
                Fatura de {faturaAnterior.nomeMes} paga!
              </span>
              <button 
                className="btn btn-sm text-decoration-underline" 
                style={{ color: isDark ? '#34d399' : '#059669', fontSize: '0.75rem', border: 'none', background: 'none', padding: 0 }} 
                onClick={() => handlePagarFatura(cartao, faturaAnterior, true)} 
                disabled={processandoPagamento === cartao.id}
              >
                {processandoPagamento === cartao.id ? 'Aguarde...' : 'Desfazer'}
              </button>
            </div>
          )}

          <div className="d-flex align-items-center justify-content-between py-2 px-3 rounded-4 mb-3" style={{ backgroundColor: isDark ? 'rgba(139, 92, 246, 0.08)' : '#f9f5ff', border: isDark ? '1px solid rgba(139, 92, 246, 0.2)' : '1px solid #f3e8ff' }}>
            <div className="d-flex align-items-center gap-2">
              <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '26px', height: '26px', backgroundColor: isDark ? 'rgba(139, 92, 246, 0.2)' : '#f3e8ff', color: '#8b5cf6' }}>
                <FiCalendar size={13} />
              </div>
              <span style={{ fontSize: '0.8rem', color: isDark ? '#cbd5e1' : '#4b5563', fontWeight: '500' }}>
                Próxima Fatura Estimada ({faturaProxima.nomeMes})
              </span>
            </div>
            <span className="fw-bold" style={{ color: '#8b5cf6', fontSize: '0.9rem', letterSpacing: '0.3px' }}>
              R$ {faturaProxima.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <button className="btn btn-link p-0 text-decoration-none d-flex align-items-center gap-1" style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: '500' }} onClick={() => handleEditarCartaoEspecifico(cartao.id)}>
            <FiEdit3 size={15}/> Configurações avançadas do cartão
          </button>
        </div>
      )}
    </div>
  );
}

export default CardControleLimite;