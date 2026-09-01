import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import api from '../api/axios';
import { FiArrowLeft, FiPieChart, FiBell, FiPlus, FiTarget, FiLock, FiCheck, FiHelpCircle, FiCreditCard } from 'react-icons/fi';
import toast from 'react-hot-toast';
import CardControleLimite from '../components/CardControleLimite';

function LimitesMetas({ temaAtual }) {
  const navigate = useNavigate();
  const { usuarioLogado } = useContext(AuthContext);
  const isDark = temaAtual === 'dark'; 
  
  const initialState = { limiteMensal: '', alertaPorcentagem: '', travaAtiva: false };
  const [formState, setFormState] = useState(initialState);
  const [savedConfig, setSavedConfig] = useState(initialState);
  const [hasChanges, setHasChanges] = useState(false);
  const [ajudaAtiva, setAjudaAtiva] = useState(null); 
  const [cartoes, setCartoes] = useState([]);
  const [transacoes, setTransacoes] = useState([]);
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
        } catch (e) { console.error("Erro", e); }
      }
    }
  }, [usuarioLogado?.id]);

  const carregarDadosGerais = async () => {
    if (!usuarioLogado?.id) return;
    try {
      const [resCartoes, resTrans] = await Promise.all([
        api.get(`/Cartoes/usuario/${usuarioLogado.id}`),
        api.get(`/Transacoes/usuario/${usuarioLogado.id}`)
      ]);

      setCartoes(resCartoes.data || []);

      const transacoesNormalizadas = (resTrans.data || []).map(t => {
        const dataStr = t.dataTransacao || t.DataTransacao || t.data || t.Data || new Date().toISOString();
        const dataQuebrada = dataStr.split('T');
        const dataBruta = dataQuebrada[0].split('-');
        const dataCerta = dataBruta.length === 3 ? `${dataBruta[2]}/${dataBruta[1]}/${dataBruta[0]}` : '01/01/2000';
        return {
           ...t,
           dataStrFormatada: dataCerta,
           dataObj: dataBruta.length === 3 ? new Date(dataBruta[0], dataBruta[1] - 1, dataBruta[2]) : new Date(2000, 0, 1),
           valorNumerico: Number(t.valor || t.Valor) || 0,
           cartaoIdNumerico: Number(t.cartaoId || t.CartaoId),
           tipoStr: (t.tipo || t.Tipo || '').toLowerCase(),
           isPago: t.pago === true || t.Pago === true || t.pago === 1 || t.Pago === 1
        };
      });
      
      setTransacoes(transacoesNormalizadas);
      const limitesIniciais = {};
      (resCartoes.data || []).forEach(c => limitesIniciais[c.id] = Number(c.limiteTotal || c.LimiteTotal) || 0);
      setLimitesCartoes(limitesIniciais);
    } catch (error) { console.error("Erro ao carregar", error); }
  };

  useEffect(() => { carregarDadosGerais(); }, [usuarioLogado?.id]);

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
      for (const cartao of cartoes) {
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

    const diaFechamento = parseInt(fechamentoCartao, 10) || 0;
    const diaVencimento = parseInt(vencimentoCartao, 10) || 0;

    if (diaFechamento === 0 || diaVencimento === 0) return { num: String(mesTransacao).padStart(2, '0'), ano: String(anoTransacao) };

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
    return { num: String(mesVencimento).padStart(2, '0'), ano: String(anoVencimento) };
  };

  const getMesVencimentoFaturaStr = (cartao) => {
    const diaVencimento = parseInt(cartao.diaVencimento || cartao.DiaVencimento, 10) || 0;
    const hoje = new Date();
    let mesExibicaoNum = hoje.getMonth() + 1;
    let anoExibicaoNum = hoje.getFullYear();
    const dataVencimentoFatura = new Date(anoExibicaoNum, mesExibicaoNum - 1, diaVencimento);

    if (hoje > dataVencimentoFatura) {
      mesExibicaoNum += 1;
      if (mesExibicaoNum > 12) { mesExibicaoNum = 1; anoExibicaoNum += 1; }
    }
    
    const nomesMeses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return { num: String(mesExibicaoNum).padStart(2, '0'), ano: String(anoExibicaoNum), nomeMes: nomesMeses[mesExibicaoNum - 1] };
  };

  const getTransacoesFaturaAtual = (cartao) => {
    const diaFechamento = parseInt(cartao.diaFechamento || cartao.DiaFechamento, 10) || 0;
    const diaVencimento = parseInt(cartao.diaVencimento || cartao.DiaVencimento, 10) || 0;
    const { num, ano } = getMesVencimentoFaturaStr(cartao);

    return transacoes.filter(t => {
      if (t.cartaoIdNumerico !== Number(cartao.id) || t.tipoStr !== 'despesa') return false;
      const fatura = getFaturaVencimento(t.dataStrFormatada, diaFechamento, diaVencimento);
      return fatura && fatura.num === num && fatura.ano === ano;
    });
  };

  const handlePagarFatura = async (cartao) => {
    setProcessandoPagamento(cartao.id);
    try {
      const transacoesDaFatura = getTransacoesFaturaAtual(cartao).filter(t => !t.isPago);
      
      for (const t of transacoesDaFatura) {
        const payload = { ...t, pago: true };
        await api.put(`/Transacoes/${t.id}`, payload);
      }
      
      setTransacoes(prev => prev.map(t => {
        if (transacoesDaFatura.some(tdf => tdf.id === t.id)) {
          return { ...t, isPago: true, pago: true };
        }
        return t;
      }));
      
      toast.success('Fatura paga com sucesso! Limite liberado.');
    } catch (error) {
      console.error("Erro ao pagar fatura:", error);
      toast.error('Erro ao processar o pagamento.');
    } finally {
      setProcessandoPagamento(null);
    }
  };

  const calcularFaturaAtualExata = (cartao) => {
    return getTransacoesFaturaAtual(cartao).reduce((acc, t) => acc + t.valorNumerico, 0);
  };

  const calcularProximaFaturaExata = (cartao) => {
    const diaFechamento = parseInt(cartao.diaFechamento || cartao.DiaFechamento, 10) || 0;
    const diaVencimento = parseInt(cartao.diaVencimento || cartao.DiaVencimento, 10) || 0;
    let { num, ano } = getMesVencimentoFaturaStr(cartao);
    
    let proxNum = parseInt(num, 10) + 1;
    let proxAno = parseInt(ano, 10);
    if (proxNum > 12) {
      proxNum = 1;
      proxAno += 1;
    }

    return transacoes.filter(t => {
      if (t.cartaoIdNumerico !== Number(cartao.id) || t.tipoStr !== 'despesa') return false;
      const fatura = getFaturaVencimento(t.dataStrFormatada, diaFechamento, diaVencimento);
      return fatura && fatura.num === String(proxNum).padStart(2, '0') && fatura.ano === String(proxAno);
    }).reduce((acc, t) => acc + t.valorNumerico, 0);
  };

  const calcularLimiteUtilizado = (cartao) => {
    const diaFechamento = Number(cartao.diaFechamento || cartao.DiaFechamento || 1);
    const hoje = new Date();
    let mesFechamentoAnterior = hoje.getMonth() - 1;
    let anoFechamentoAnterior = hoje.getFullYear();
    if (mesFechamentoAnterior < 0) { mesFechamentoAnterior = 11; anoFechamentoAnterior -= 1; }
    const dataCorteAnterior = new Date(anoFechamentoAnterior, mesFechamentoAnterior, diaFechamento);

    return transacoes.filter(t => {
      if (t.cartaoIdNumerico !== Number(cartao.id) || t.tipoStr !== 'despesa') return false;
      
      const isPendente = !t.isPago;
      const isAtualOuFuturo = t.dataObj > dataCorteAnterior;
      return isAtualOuFuturo || isPendente; 
    }).reduce((acc, t) => acc + t.valorNumerico, 0);
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

        {cartoes.length === 0 ? (
          <div className="config-card p-4 text-center" style={{ flexDirection: 'column', gap: '10px' }}>
            <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto" style={{ width: '48px', height: '48px', backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
              <FiCreditCard size={22} />
            </div>
            <h6 className="fw-bold m-0" style={{ fontSize: '0.95rem' }}>Configurar Cartão Padrão</h6>
            <p className="text-muted small m-0" style={{ lineHeight: '1.4' }}>
              O FIRMO já deixa um cartão rascunho pronto para você. Clique abaixo para personalizá-lo, definir limite e bandeira.
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
          cartoes.map((cartao) => {
            const limiteTotalCartao = limitesCartoes[cartao.id] || 0;
            const valorFaturaAtual = calcularFaturaAtualExata(cartao);
            const valorProximaFatura = calcularProximaFaturaExata(cartao);
            const totalComprometido = calcularLimiteUtilizado(cartao);
            const transacoesDaFatura = getTransacoesFaturaAtual(cartao);
            
            const temTransacoes = transacoesDaFatura.length > 0;
            const pendentes = transacoesDaFatura.some(t => !t.isPago);
            const { nomeMes } = getMesVencimentoFaturaStr(cartao);
            const estaEditando = editandoLimiteId === cartao.id;

            return (
              <CardControleLimite 
                key={cartao.id}
                cartao={cartao}
                isDark={isDark}
                limiteTotalCartao={limiteTotalCartao}
                valorFaturaAtual={valorFaturaAtual}
                valorProximaFatura={valorProximaFatura}
                totalComprometido={totalComprometido}
                pendentes={pendentes}
                temTransacoes={temTransacoes}
                nomeMes={nomeMes}
                estaEditando={estaEditando}
                setEditandoLimiteId={setEditandoLimiteId}
                handlePagarFatura={handlePagarFatura}
                processandoPagamento={processandoPagamento}
                handleEditarCartaoEspecifico={handleEditarCartaoEspecifico}
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