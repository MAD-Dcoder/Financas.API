import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { FinanceiroContext } from '../contexts/FinanceiroContext';
import api from '../api/axios';
import { FiArrowLeft, FiPieChart, FiBell, FiPlus, FiTarget, FiLock, FiCheck, FiHelpCircle, FiCreditCard } from 'react-icons/fi';
import toast from 'react-hot-toast';
import CardControleLimite from '../components/CardControleLimite';

function LimitesMetas({ temaAtual }) {
  const navigate = useNavigate();
  const { usuarioLogado } = useContext(AuthContext);
  const { cartoesGlobais, transacoesGlobais, setTransacoesGlobais } = useContext(FinanceiroContext);
  const isDark = temaAtual === 'dark'; 
  
  const initialState = { limiteMensal: '', alertaPorcentagem: '', travaAtiva: false };
  const [formState, setFormState] = useState(initialState);
  const [savedConfig, setSavedConfig] = useState(initialState);
  const [hasChanges, setHasChanges] = useState(false);
  const [ajudaAtiva, setAjudaAtiva] = useState(null); 
  const [limitesCartoes, setLimitesCartoes] = useState({}); 
  const [editandoLimiteId, setEditandoLimiteId] = useState(null);
  const [processandoPagamento, setProcessandoPagamento] = useState(null);

  useEffect(() => {
    if (usuarioLogado?.id) {
      const configSalva = localStorage.getItem(`firmo_limites_${usuarioLogado.id}`);
      if (configSalva) {
        try {
          const parsed = JSON.parse(configSalva);
          setFormState(parsed);
          setSavedConfig(parsed);
        } catch (e) {}
      }
    }
  }, [usuarioLogado?.id]);

  useEffect(() => {
    const limitesIniciais = {};
    cartoesGlobais.forEach(c => limitesIniciais[c.id] = Number(c.limiteTotal || c.LimiteTotal) || 0);
    setLimitesCartoes(limitesIniciais);
  }, [cartoesGlobais]);

  useEffect(() => {
    setHasChanges(JSON.stringify(formState) !== JSON.stringify(savedConfig));
  }, [formState, savedConfig]);

  const handleToggleTrava = () => setFormState(prev => ({ ...prev, travaAtiva: !prev.travaAtiva }));
  
  const handleChangeLimite = (e) => {
    const apenasNumeros = e.target.value.replace(/\D/g, ''); 
    if (!apenasNumeros) return setFormState(prev => ({ ...prev, limiteMensal: '' }));
    const valorFormatado = (parseInt(apenasNumeros, 10) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    setFormState(prev => ({ ...prev, limiteMensal: valorFormatado }));
  };

  const handleSave = async () => {
    try {
      for (const cartao of cartoesGlobais) {
        const novoLimite = limitesCartoes[cartao.id];
        const limiteAntigo = Number(cartao.limiteTotal || cartao.LimiteTotal) || 0;
        if (novoLimite !== limiteAntigo) {
          await api.put(`/Cartoes/${cartao.id}`, { ...cartao, limiteTotal: novoLimite });
        }
      }
      if (usuarioLogado?.id) {
        localStorage.setItem(`firmo_limites_${usuarioLogado.id}`, JSON.stringify(formState));
        setSavedConfig(formState);
      }
      toast.success('Limites e metas atualizados com sucesso!');
      setHasChanges(false); 
    } catch (error) { toast.error("Erro ao atualizar os limites no servidor."); }
  };

  const toggleAjuda = (tipo) => setAjudaAtiva(prev => (prev === tipo ? null : tipo));

  const getFaturaVencimento = (dataStr, fechamentoCartao, vencimentoCartao) => {
    const partes = (dataStr || '').split('/');
    if (partes.length !== 3) return null;
    const diaTransacao = parseInt(partes[0], 10);
    let mesTransacao = parseInt(partes[1], 10);
    let anoTransacao = parseInt(partes[2], 10);

    const diaFechamento = parseInt(fechamentoCartao, 10) || 1;
    const diaVencimento = parseInt(vencimentoCartao, 10) || 1;

    let mesFechamento = mesTransacao;
    let anoFechamento = anoTransacao;
    if (diaTransacao > diaFechamento) {
      mesFechamento += 1;
      if (mesFechamento > 12) { mesFechamento = 1; anoFechamento += 1; }
    }

    let mesVencimento = mesFechamento;
    let anoVencimento = anoFechamento;
    if (diaVencimento < diaFechamento) {
      mesVencimento += 1;
      if (mesVencimento > 12) { mesVencimento = 1; anoVencimento += 1; }
    }

    let mesReferencia = mesVencimento - 1;
    let anoReferencia = anoVencimento;
    if (mesReferencia < 1) { mesReferencia = 12; anoReferencia -= 1; }

    return { num: String(mesReferencia).padStart(2, '0'), ano: String(anoReferencia), vencimentoReal: { mes: mesVencimento, ano: anoVencimento } };
  };

  const getStatusFaturas = (cartao) => {
    const diaFechamento = parseInt(cartao.diaFechamento, 10) || 1;
    const diaVencimento = parseInt(cartao.diaVencimento, 10) || 1;
    const hoje = new Date();
    hoje.setHours(0,0,0,0);

    const faturasObj = {};
    
    const calcFechada = (mesVenc, anoVenc) => {
        let mFech = mesVenc;
        let aFech = anoVenc;
        if (diaVencimento < diaFechamento) {
            mFech -= 1;
            if (mFech < 1) { mFech = 12; aFech -= 1; }
        }
        const dataFech = new Date(aFech, mFech - 1, diaFechamento);
        return hoje > dataFech;
    };

    transacoesGlobais.forEach(t => {
      if (t.cartaoIdNumerico === cartao.id && t.tipoStr === 'despesa') {
        const f = getFaturaVencimento(t.dataStrFormatada || t.data, diaFechamento, diaVencimento);
        if (f) {
          const key = `${f.ano}-${f.num}`;
          if (!faturasObj[key]) {
            faturasObj[key] = { ...f, totalBruto: 0, pendentes: 0, transacoes: [], isFechada: calcFechada(f.vencimentoReal.mes, f.vencimentoReal.ano) };
          }
          faturasObj[key].transacoes.push(t);
          faturasObj[key].totalBruto += Number(t.valorNumerico);
          if (!t.isPago) {
            faturasObj[key].pendentes += 1;
          }
        }
      }
    });

    const hojeStr = `${String(hoje.getDate()).padStart(2, '0')}/${String(hoje.getMonth() + 1).padStart(2, '0')}/${hoje.getFullYear()}`;
    const fHoje = getFaturaVencimento(hojeStr, diaFechamento, diaVencimento);
    const keyHoje = `${fHoje.ano}-${fHoje.num}`;

    if (!faturasObj[keyHoje]) {
      faturasObj[keyHoje] = { ...fHoje, totalBruto: 0, pendentes: 0, transacoes: [], isFechada: calcFechada(fHoje.vencimentoReal.mes, fHoje.vencimentoReal.ano) };
    }

    Object.values(faturasObj).forEach(f => {
       f.total = f.totalBruto;
       if (!f.isFechada && f.pendentes === 0 && f.transacoes.length > 0) {
           f.total = 0;
       }
    });

    const faturas = Object.values(faturasObj).sort((a, b) => {
      if (a.ano !== b.ano) return parseInt(a.ano) - parseInt(b.ano);
      return parseInt(a.num) - parseInt(b.num);
    });

    const faturasPendentes = faturas.filter(f => f.pendentes > 0);
    let faturaAtual = faturasPendentes.length > 0 ? faturasPendentes[0] : faturasObj[keyHoje];

    let prevNum = parseInt(faturaAtual.num, 10) - 1;
    let prevAno = parseInt(faturaAtual.ano, 10);
    if (prevNum < 1) { prevNum = 12; prevAno -= 1; }
    const keyPrev = `${prevAno}-${String(prevNum).padStart(2, '0')}`;
    const faturaAnterior = faturasObj[keyPrev];

    let nextNum = parseInt(faturaAtual.num, 10) + 1;
    let nextAno = parseInt(faturaAtual.ano, 10);
    if (nextNum > 12) { nextNum = 1; nextAno += 1; }
    const keyNext = `${nextAno}-${String(nextNum).padStart(2, '0')}`;
    const faturaProxima = faturasObj[keyNext] || { num: String(nextNum).padStart(2, '0'), ano: String(nextAno), total: 0 };

    const nomesMeses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    return {
      atual: { ...faturaAtual, nomeMes: nomesMeses[parseInt(faturaAtual.num)-1] },
      anterior: faturaAnterior ? { ...faturaAnterior, nomeMes: nomesMeses[parseInt(faturaAnterior.num)-1] } : null,
      proxima: { ...faturaProxima, nomeMes: nomesMeses[parseInt(faturaProxima.num)-1] }
    };
  };

  const handlePagarFatura = async (cartao, faturaAlvo, desfazer = false) => {
    setProcessandoPagamento(cartao.id);
    try {
      const alvo = desfazer ? faturaAlvo.transacoes.filter(t => t.isPago) : faturaAlvo.transacoes.filter(t => !t.isPago);
      
      for (const t of alvo) {
        const payload = { ...t, pago: !desfazer };
        await api.put(`/Transacoes/${t.id}`, payload);
      }
      
      setTransacoesGlobais(prev => prev.map(t => {
        if (alvo.some(tdf => tdf.id === t.id)) {
          return { ...t, isPago: !desfazer, pago: !desfazer };
        }
        return t;
      }));
      
      toast.success(desfazer ? 'Pagamento desfeito! A fatura voltou.' : 'Fatura paga com sucesso! Limite liberado.');
    } catch (error) {
      toast.error('Erro ao processar o pagamento.');
    } finally {
      setProcessandoPagamento(null);
    }
  };

  const handleEditarCartaoEspecifico = (idAlvo) => {
    navigate('/dashboard', { state: { acaoInicial: 'abrir_gaveta_config_cartao_existente', cartaoIdAlvo: idAlvo !== null ? Number(idAlvo) : null } });
  };

  const getToggleStyle = (checked) => ({
    cursor: 'pointer', width: '2.5em', height: '1.25em',
    backgroundColor: checked ? '#10b981' : (isDark ? 'transparent' : '#ffffff'),
    borderColor: checked ? '#10b981' : (isDark ? 'rgba(255,255,255,0.3)' : '#cbd5e1'),
    borderWidth: '1px', borderStyle: 'solid',
    backgroundImage: checked ? "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='-4 -4 8 8'%3e%3ccircle r='3' fill='%23fff'/%3e%3c/svg%3e\")" : (isDark ? "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='-4 -4 8 8'%3e%3ccircle r='3' fill='rgba(255,255,255,0.5)'/%3e%3c/svg%3e\")" : "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='-4 -4 8 8'%3e%3ccircle r='3' fill='%23cbd5e1'/%3e%3c/svg%3e\")")
  });

  return (
    <div className={`config-page ${isDark ? 'theme-dark' : 'theme-light'}`} data-bs-theme={temaAtual}>
      <div className="config-header">
        <button onClick={() => navigate('/dashboard')} className={`btn btn-link p-0 border-0 mb-3 shadow-none ${isDark ? 'text-white' : 'text-dark'}`}><FiArrowLeft size={24} /></button>
        <h1 className={isDark ? 'text-white' : 'text-dark'}>Limites & Metas</h1>
        <p>Gerencie tetos globais, alertas e limites dos seus cartões.</p>
      </div>

      <div className="config-section">
        <div className="config-section-title">CONTROLE DE GASTOS</div>
        
        <div className="config-card" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <div className="d-flex justify-content-between align-items-center w-100">
            <div className="config-card-left">
              <FiPieChart className="config-icon" />
              <div>
                <div className="d-flex align-items-center gap-2">
                  <span className="config-text-main">Teto de Gastos Mensal</span>
                  <FiHelpCircle size={16} style={{ color: '#10b981', cursor: 'pointer', opacity: ajudaAtiva === 'teto' ? 1 : 0.8 }} onClick={() => toggleAjuda('teto')} />
                </div>
                <span className="config-text-sub">Definir valor máximo global</span>
              </div>
            </div>
            
            <div className="d-flex align-items-center justify-content-end" style={{ maxWidth: '160px' }}>
              <span className={`fw-bold me-1 ${isDark ? 'text-white' : 'text-dark'}`} style={{ fontSize: '1rem' }}>R$</span>
              <input type="text" inputMode="numeric" className="form-control shadow-none border-0 bg-transparent p-0 text-end fw-bold" value={formState.limiteMensal} onChange={handleChangeLimite} placeholder="0,00" style={{ color: formState.limiteMensal ? '#10b981' : (isDark ? '#adb5bd' : '#adb5bd'), fontSize: '1.1rem', width: `${Math.max((formState.limiteMensal || '0,00').length * 11, 45)}px`, transition: 'color 0.3s' }} />
            </div>
          </div>

          {ajudaAtiva === 'teto' && (
            <div className="mt-3 p-3 rounded-4" style={{ backgroundColor: isDark ? 'rgba(16, 185, 129, 0.08)' : 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.25)', fontSize: '0.82rem', color: isDark ? '#d1d5db' : '#374151', lineHeight: '1.45' }}>
              <strong>O que é o Teto de Gastos?</strong> É o limite máximo que você planeja gastar durante todo o mês. O FIRMO usará esse valor como sua âncora principal de saúde financeira.
            </div>
          )}

          <div className="d-flex gap-2 mt-3 pt-3" style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` }}>
            {['1.500,00', '3.000,00', '5.000,00', '10.000,00'].map((valor, idx) => {
              const isSelected = formState.limiteMensal === valor;
              return (
                <button key={idx} className="btn btn-sm rounded-pill fw-bold" style={{ backgroundColor: isSelected ? '#10b981' : (isDark ? 'rgba(255,255,255,0.05)' : '#f0f2f5'), color: isSelected ? '#ffffff' : (isDark ? '#adb5bd' : '#6c757d'), fontSize: '0.75rem', flex: 1, border: 'none', transition: 'all 0.2s ease' }} onClick={() => setFormState(prev => ({ ...prev, limiteMensal: valor }))}>
                  {valor === '1.500,00' ? '1.5k' : valor === '3.000,00' ? '3k' : valor === '5.000,00' ? '5k' : '10k'}
                </button>
              );
            })}
          </div>
        </div>

        <div className="config-card" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <div className="config-card-left mb-2">
            <FiBell className="config-icon" />
            <div>
              <div className="d-flex align-items-center gap-2">
                <span className="config-text-main">Aviso Antecipado de Limite</span>
                <FiHelpCircle size={16} style={{ color: '#10b981', cursor: 'pointer', opacity: ajudaAtiva === 'alerta' ? 1 : 0.8 }} onClick={() => toggleAjuda('alerta')} />
              </div>
              <span className="config-text-sub">Disparar alerta ao atingir a porcentagem</span>
            </div>
          </div>

          {ajudaAtiva === 'alerta' && (
            <div className="mt-2 mb-3 p-3 rounded-4" style={{ backgroundColor: isDark ? 'rgba(16, 185, 129, 0.08)' : 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.25)', fontSize: '0.82rem', color: isDark ? '#d1d5db' : '#374151', lineHeight: '1.45' }}>
              <strong>O que é o Aviso Antecipado?</strong> É o gatilho de segurança para você desacelerar antes de estourar o orçamento.
            </div>
          )}

          <div className="d-flex gap-2 mt-2">
            {['50', '70', '80', '90', '100'].map((porc) => {
              const isSelected = formState.alertaPorcentagem === porc;
              return (
                <button key={porc} className="btn btn-sm rounded-pill fw-bold" style={{ backgroundColor: isSelected ? '#10b981' : (isDark ? 'rgba(255,255,255,0.05)' : '#f0f2f5'), color: isSelected ? '#ffffff' : (isDark ? '#adb5bd' : '#6c757d'), fontSize: '0.75rem', flex: 1, border: 'none', padding: '8px 0', transition: 'all 0.2s ease' }} onClick={() => setFormState(prev => ({ ...prev, alertaPorcentagem: porc }))}>
                  {porc}%
                </button>
              );
            })}
          </div>
        </div>

        <div className="config-divider"></div>

        <div className="config-section-title">LIMITES DOS CARTÕES DE CRÉDITO</div>

        {cartoesGlobais.length === 0 ? (
          <div className="config-card p-4 text-center" style={{ flexDirection: 'column', gap: '10px' }}>
            <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto" style={{ width: '48px', height: '48px', backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
              <FiCreditCard size={22} />
            </div>
            <h6 className="fw-bold m-0" style={{ fontSize: '0.95rem' }}>Configurar Cartão Padrão</h6>
            <p className="text-muted small m-0" style={{ lineHeight: '1.4' }}>
              O FIRMO já deixa um cartão rascunho pronto para você. Clique abaixo para personalizá-lo.
            </p>
            <button 
              className="btn btn-sm fw-bold mt-2 text-white d-flex align-items-center justify-content-center gap-2 mx-auto" 
              style={{ backgroundColor: '#10b981', borderRadius: '100px', padding: '8px 20px', border: 'none' }}
              onClick={() => handleEditarCartaoEspecifico(null)}
            >
              <FiCreditCard size={16} /> Configurar Meu Cartão
            </button>
          </div>
        ) : (
          cartoesGlobais.map((cartao) => {
            const limiteTotalCartao = limitesCartoes[cartao.id] || 0;
            const status = getStatusFaturas(cartao);
            
            const totalComprometido = transacoesGlobais.filter(t => t.cartaoIdNumerico === cartao.id && t.tipoStr === 'despesa' && !t.isPago).reduce((acc, t) => acc + t.valorNumerico, 0);
            const estaEditando = editandoLimiteId === cartao.id;

            return (
              <CardControleLimite 
                key={cartao.id}
                cartao={cartao}
                isDark={isDark}
                limiteTotalCartao={limiteTotalCartao}
                totalComprometido={totalComprometido}
                estaEditando={estaEditando}
                setEditandoLimiteId={setEditandoLimiteId}
                handlePagarFatura={handlePagarFatura}
                processandoPagamento={processandoPagamento}
                handleEditarCartaoEspecifico={handleEditarCartaoEspecifico}
                status={status}
              />
            );
          })
        )}

        <div className="config-divider mt-4"></div>

        <div className="config-section-title">MINHAS CAIXINHAS</div>

        <div className="config-card">
          <div className="config-card-left">
            <FiTarget className="config-icon text-success" />
            <div>
              <span className="config-text-main">Nova Caixinha</span>
              <span className="config-text-sub">Crie uma meta com prazo e valor</span>
            </div>
          </div>
          <FiPlus className="config-icon" style={{ color: '#10b981', cursor: 'pointer' }} onClick={() => toast('Tela de criação em breve', { icon: '🚧' })} />
        </div>

        <div className="config-card" onClick={handleToggleTrava} style={{ cursor: 'pointer' }}>
          <div className="config-card-left">
            <FiLock className="config-icon" />
            <div>
              <span className="config-text-main">Modo "Foco na Meta"</span>
              <span className="config-text-sub">Bloqueia o resgate antecipado</span>
            </div>
          </div>
          <div className="form-check form-switch m-0 p-0 d-flex align-items-center">
            <input className="form-check-input ms-0 shadow-none" type="checkbox" role="switch" checked={formState.travaAtiva} readOnly style={getToggleStyle(formState.travaAtiva)} />
          </div>
        </div>
      </div>

      {hasChanges && (
        <div className="config-bottom-bar">
          <button className="config-btn-save text-white" onClick={handleSave}>
            <FiCheck size={20} /> Salvar Alterações
          </button>
        </div>
      )}
    </div>
  );
}

export default LimitesMetas;