import { useState, useEffect, useMemo, useRef, useContext } from 'react';
import api from '../api/axios';
import categoriasService from '../api/categoriasService';
import { AuthContext } from '../contexts/AuthContext';
import { FinanceiroContext } from '../contexts/FinanceiroContext';
import { 
  mapaCategoriasAPIReverse, 
  mapaContasAPIReverse, 
  coresCategorias, 
  coresPagamento,
  mapaContasAPI,
  PALETA_CORES
} from '../utils/constants';
import { isPastOrToday } from '../utils/dateUtils';
import { jwtDecode } from 'jwt-decode';

export function useDashboard(temaAtual) {
  const TRANSACOES_API_URL = '/Transacoes';
  const { usuarioLogado, isLoggedIn, handleLogout } = useContext(AuthContext);
  const { cartoesGlobais, transacoesGlobais, setTransacoesGlobais, carregarDadosFinanceiros } = useContext(FinanceiroContext);
  
  const isDark = temaAtual === 'dark';
  const carrosselRef = useRef(null);

  const [showBalance, setShowBalance] = useState(() => {
    const configsSalvas = localStorage.getItem('firmo_configs');
    if (configsSalvas) {
      try {
        const { ocultarValores } = JSON.parse(configsSalvas);
        return !ocultarValores; 
      } catch (error) {}
    }
    return true; 
  });

  const [showProfile, setShowProfile] = useState(false);  
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [showMonthSelector, setShowMonthSelector] = useState(false);
  const [transacaoSelecionada, setTransacaoSelecionada] = useState(null);
  const [transacaoParaEditar, setTransacaoParaEditar] = useState(null);
  const [menuAcaoDetalhes, setMenuAcaoDetalhes] = useState(0); 
  const [abaGrafico, setAbaGrafico] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [showCardSettings, setShowCardSettings] = useState(false);
  const [termoBusca, setTermoBusca] = useState('');
  const [isChartAnimating, setIsChartAnimating] = useState(true); 
  const [coresDinamicas, setCoresDinamicas] = useState({ ...coresCategorias });
  const [mapaNomesCategorias, setMapaNomesCategorias] = useState({});
  const [isRefreshingUI, setIsRefreshingUI] = useState(false);

  const [mesFiltro, setMesFiltro] = useState(() => {
    const hoje = new Date();
    const nomesMeses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return { num: String(hoje.getMonth() + 1).padStart(2, '0'), ano: String(hoje.getFullYear()), nome: nomesMeses[hoje.getMonth()] };
  });

  const [hoveredCategory, setHoveredCategory] = useState(null); 
  const [selectedCategory, setSelectedCategory] = useState(null); 
  const [animatingStatusId, setAnimatingStatusId] = useState(null); 
  const [swipeStart, setSwipeStart] = useState(null);
  const [swipeEnd, setSwipeEnd] = useState(null);
  const minSwipeDistance = 50;
  const swipeCoords = useRef({ x: 0, y: 0 });

  const [meusCartoes, setMeusCartoes] = useState([]);
  
  useEffect(() => {
    if (cartoesGlobais && cartoesGlobais.length > 0) {
      setMeusCartoes(cartoesGlobais.map(c => ({
         id: c.id, apelidoCartao: c.nome || 'Nome do Cartão', finalCartao: c.ultimosDigitos || 'XXXX',
         bandeiraCartao: c.bandeira || 'Mastercard', corCartao: c.corFundo || 'linear-gradient(135deg, #059669 0%, #047857 100%)',
         diaFechamento: String(c.diaFechamento).padStart(2, '0'), diaVencimento: String(c.diaVencimento).padStart(2, '0'), limiteTotal: c.limiteTotal || 0
      })));
    } else {
      setMeusCartoes([{
        id: null, apelidoCartao: 'Novo Cartão', finalCartao: 'XXXX', bandeiraCartao: 'Mastercard',
        corCartao: 'linear-gradient(135deg, #214d80c2 0%, #575a5cc4 100%)', diaFechamento: '00', diaVencimento: '00', limiteTotal: 0
      }]);
    }
  }, [cartoesGlobais]);

  const [cartaoAtivoIndex, setCartaoAtivoIndex] = useState(0);
  const cartaoAtivo = meusCartoes[cartaoAtivoIndex] || meusCartoes[0] || {};

  const transacoes = useMemo(() => {
    return transacoesGlobais.map(t => {
      // 🟢 CORREÇÃO: Lê os nomes personalizados direto do banco para evitar a categoria "Outros" errada
      const nomeCategoria = mapaNomesCategorias[t.categoriaId] || mapaCategoriasAPIReverse[t.categoriaId] || 'Outros';
      return {
        id: t.id, titulo: t.descricao || t.titulo || 'Lançamento sem título',
        categoria: nomeCategoria, categoriaId: t.categoriaId,
        pagamento: mapaContasAPIReverse[t.contaOrigemId] || mapaContasAPIReverse[t.contaDestinoId] || 'Pix',
        observacao: t.observacao || '', data: t.dataStrFormatada || t.data,
        hora: t.dataTransacao ? t.dataTransacao.split('T')[1]?.substring(0, 5) : (t.hora || '00:00'),
        valor: t.valorNumerico || t.valor || 0, tipo: t.tipoStr || t.tipo,
        recorrente: t.ehRecorrente || t.recorrente, pago: t.isPago !== undefined ? t.isPago : t.pago, cartaoId: t.cartaoIdNumerico || t.cartaoId
      };
    });
  }, [transacoesGlobais, mapaNomesCategorias]);

  const [tempDiaVencimento, setTempDiaVencimento] = useState('');
  const [tempDiaFechamento, setTempDiaFechamento] = useState('');
  const [tempCor, setTempCor] = useState('');
  const [tempApelido, setTempApelido] = useState('');
  const [tempFinal, setTempFinal] = useState('');
  const [tempBandeira, setTempBandeira] = useState('');
  const [tempLimite, setTempLimite] = useState('');

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const catResponse = await categoriasService.getCategorias(usuarioLogado.id);
        const mapaCores = { ...coresCategorias };
        const mapaNomes = {};
        catResponse.forEach((c, index) => {
          const corOficial = c.corHex || PALETA_CORES[index % PALETA_CORES.length];
          mapaCores[c.nome] = corOficial;
          mapaNomes[c.id] = c.nome;
        });
        setCoresDinamicas(mapaCores);
        setMapaNomesCategorias(mapaNomes);
      } catch (e) {}
    };
    if (usuarioLogado?.id) fetchCategorias();
  }, [usuarioLogado]);

  // 🟢 REGRA BANCÁRIA: O mês da fatura é o mês ANTERIOR ao vencimento.
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

  // 🟢 AUTO-ROLLOVER FOCADO NO HISTÓRICO DE PAGAMENTOS
  useEffect(() => {
    if (!isCardFlipped || !cartaoAtivo || !cartaoAtivo.id || transacoes.length === 0) return;

    const faturasObj = {};
    transacoes.forEach(t => {
      if (t.cartaoId === cartaoAtivo.id && t.pagamento === 'Crédito' && t.tipo === 'despesa') {
        const f = getFaturaVencimento(t.data, cartaoAtivo.diaFechamento, cartaoAtivo.diaVencimento);
        if (f) {
          const key = `${f.ano}-${f.num}`;
          if (!faturasObj[key]) faturasObj[key] = { ...f, temPendente: false };
          if (!t.pago) faturasObj[key].temPendente = true;
        }
      }
    });

    const faturasPendentes = Object.values(faturasObj).filter(f => f.temPendente).sort((a, b) => {
        if (a.ano !== b.ano) return parseInt(a.ano) - parseInt(b.ano);
        return parseInt(a.num) - parseInt(b.num);
    });

    let alvoNum, alvoAno;

    if (faturasPendentes.length > 0) {
      alvoNum = parseInt(faturasPendentes[0].num, 10);
      alvoAno = parseInt(faturasPendentes[0].ano, 10);
    } else {
      const hoje = new Date();
      const hojeStr = `${String(hoje.getDate()).padStart(2, '0')}/${String(hoje.getMonth() + 1).padStart(2, '0')}/${hoje.getFullYear()}`;
      const fHoje = getFaturaVencimento(hojeStr, cartaoAtivo.diaFechamento, cartaoAtivo.diaVencimento);
      if (fHoje) {
        alvoNum = parseInt(fHoje.num, 10);
        alvoAno = parseInt(fHoje.ano, 10);
      }
    }

    if (alvoNum && alvoAno) {
      const nomesMeses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
      setMesFiltro(prev => {
        const nStr = String(alvoNum).padStart(2, '0');
        const aStr = String(alvoAno);
        if (prev.num !== nStr || prev.ano !== aStr) return { num: nStr, ano: aStr, nome: nomesMeses[alvoNum - 1] };
        return prev;
      });
    }
  }, [isCardFlipped, transacoes, cartaoAtivo]);

  const calcularDadosFatura = (cartao) => {
    if (!cartao || !cartao.id) return { total: 0, status: { texto: 'Aberta', cor: 'text-success' }, mesVencimentoFatura: '00', anoVencimentoFatura: '00', nomeMesVencimentoFatura: '' };

    const mesRefNum = parseInt(mesFiltro.num, 10);
    const anoRefNum = parseInt(mesFiltro.ano, 10);

    const transacoesDaFaturaExibida = transacoes.filter(t => {
      if (t.pagamento === 'Crédito' && t.tipo === 'despesa') {
        if (t.cartaoId && t.cartaoId !== cartao.id) return false;
        const fatura = getFaturaVencimento(t.data, cartao.diaFechamento, cartao.diaVencimento);
        return fatura && parseInt(fatura.num) === mesRefNum && parseInt(fatura.ano) === anoRefNum;
      }
      return false;
    });

    const diaFechamento = parseInt(cartao.diaFechamento, 10) || 1;
    const diaVencimento = parseInt(cartao.diaVencimento, 10) || 1;
    
    let mesVencimento = mesRefNum + 1;
    let anoVencimento = anoRefNum;
    if (mesVencimento > 12) { mesVencimento = 1; anoVencimento += 1; }

    let mesFechamento = mesVencimento;
    let anoFechamento = anoVencimento;
    if (diaVencimento < diaFechamento) {
      mesFechamento -= 1;
      if (mesFechamento < 1) { mesFechamento = 12; anoFechamento -= 1; }
    }

    const dataFechamentoFatura = new Date(anoFechamento, mesFechamento - 1, diaFechamento);
    const dataVencimentoFaturaReal = new Date(anoVencimento, mesVencimento - 1, diaVencimento);
    const dataAberturaFatura = new Date(anoFechamento, mesFechamento - 1, diaFechamento);
    dataAberturaFatura.setMonth(dataAberturaFatura.getMonth() - 1);

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const isFechada = hoje > dataFechamentoFatura;
    const temPendentes = transacoesDaFaturaExibida.some(t => !t.pago);

    // 🟢 MATEMÁTICA CORRIGIDA: Soma TODOS os lançamentos da fatura. Zera SOMENTE se foi tudo pago adiantado e a fatura não fechou.
    const totalBruto = transacoesDaFaturaExibida.reduce((acc, t) => acc + (Number(t.valor) || 0), 0);
    let total = totalBruto;
    if (!isFechada && !temPendentes && transacoesDaFaturaExibida.length > 0) {
      total = 0; 
    }

    let statusTexto = 'Aberta';
    let statusCor = 'text-success';
    const isFaturaPassada = hoje > dataFechamentoFatura;
    const isFaturaVencida = hoje > dataVencimentoFaturaReal;

    if (hoje <= dataAberturaFatura) {
      statusTexto = 'Futura'; statusCor = 'text-secondary';
    } else if (isFaturaPassada) {
      if (transacoesDaFaturaExibida.length === 0) {
        statusTexto = 'Fechada'; statusCor = 'text-warning';
      } else if (!temPendentes) {
        statusTexto = 'Paga'; statusCor = 'text-success'; 
      } else if (isFaturaVencida) {
        statusTexto = 'Vencida'; statusCor = 'text-danger';
      } else {
        statusTexto = 'Fechada'; statusCor = 'text-warning';
      }
    } else {
      if (transacoesDaFaturaExibida.length > 0 && !temPendentes) {
        statusTexto = 'Paga (Adiantada)'; statusCor = 'text-success';
      } else {
        statusTexto = 'Aberta'; statusCor = 'text-success';
      }
    }

    const nomesMeses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    return { 
      total, status: { texto: statusTexto, cor: statusCor }, 
      mesVencimentoFatura: String(mesVencimento).padStart(2, '0'), anoVencimentoFatura: String(anoVencimento),
      nomeMesVencimentoFatura: nomesMeses[mesRefNum - 1] 
    };
  };

  const listaMeses = useMemo(() => {
    const nomesMeses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const dataInicio = new Date(2026, 6, 1); 
    const dataAtual = new Date();
    let dataFim = new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 3, 1);

    if (transacoes && transacoes.length > 0) {
      transacoes.forEach(t => {
        if (t.data) {
          if (t.pagamento === 'Crédito' && cartaoAtivo.diaFechamento) {
            const fatura = getFaturaVencimento(t.data, cartaoAtivo.diaFechamento, cartaoAtivo.diaVencimento);
            if (fatura && !isNaN(fatura.num) && !isNaN(fatura.ano)) {
              const dataFatura = new Date(fatura.ano, parseInt(fatura.num, 10) - 1, 1);
              if (dataFatura > dataFim) dataFim = new Date(dataFatura);
            }
          } else {
            const partes = t.data.split('/');
            if (partes.length === 3) {
              const dataTransacao = new Date(partes[2], partes[1] - 1, 1);
              if (dataTransacao > dataFim) dataFim = new Date(dataTransacao);
            }
          }
        }
      });
    }

    const lista = [];
    let current = new Date(dataFim);

    while (current >= dataInicio) {
      lista.push({ nome: nomesMeses[current.getMonth()], num: String(current.getMonth() + 1).padStart(2, '0'), ano: String(current.getFullYear()) });
      current.setMonth(current.getMonth() - 1);
    }
    return lista;
  }, [transacoes, cartaoAtivo.diaFechamento, cartaoAtivo.diaVencimento]);

  const transacoesDaAbaAtiva = transacoes.filter(t => {
    if (isCardFlipped) {
      if (t.pagamento === 'Crédito') {
        if (t.cartaoId && t.cartaoId !== cartaoAtivo.id) return false;
        const fatura = getFaturaVencimento(t.data, cartaoAtivo.diaFechamento, cartaoAtivo.diaVencimento);
        return fatura && fatura.num === mesFiltro.num && fatura.ano === mesFiltro.ano;
      }
      return false;
    } else {
      const partes = (t.data || '').split('/');
      if (partes.length === 3) return partes[1] === mesFiltro.num && partes[2] === mesFiltro.ano;
      return true;
    }
  });

  const transacoesParaExibir = transacoesDaAbaAtiva.filter(t => {
    const termo = termoBusca ? termoBusca.toLowerCase() : '';
    const matchBusca = termo ? (
      (t.titulo || '').toLowerCase().includes(termo) ||
      (t.categoria || '').toLowerCase().includes(termo) ||
      (t.pagamento || '').toLowerCase().includes(termo) ||
      (t.data || '').includes(termo) ||
      (t.hora && (t.hora || '').includes(termo)) ||
      (t.observacao && (t.observacao || '').toLowerCase().includes(termo)) ||
      (t.valor && t.valor.toString().includes(termo))
    ) : true;

    const matchFiltroPizza = selectedCategory ? (
      (abaGrafico === 0 && t.categoria === selectedCategory) ||
      (abaGrafico === 1 && !isCardFlipped && t.pagamento === selectedCategory)
    ) : true;

    return matchBusca && matchFiltroPizza;
  });

  const agruparTransacoesPorData = (lista) => {
    const grupos = {};
    lista.forEach(t => {
      if (!grupos[t.data]) grupos[t.data] = [];
      grupos[t.data].push(t);
    });
    const chavesOrdenadas = Object.keys(grupos).sort((a, b) => {
      const [diaA, mesA, anoA] = a.split('/');
      const [diaB, mesB, anoB] = b.split('/');
      return new Date(anoB, mesB - 1, diaB) - new Date(anoA, mesA - 1, diaA);
    });
    return chavesOrdenadas.map(chave => ({ dataString: chave, transacoes: grupos[chave].sort((a, b) => b.id - a.id) }));
  };

  const transacoesAgrupadas = agruparTransacoesPorData(transacoesParaExibir);

  const handleAtualizarCartaoTemp = (campo, valor) => {
    const novosCartoes = [...meusCartoes];
    if (novosCartoes[cartaoAtivoIndex]) {
      novosCartoes[cartaoAtivoIndex] = { ...novosCartoes[cartaoAtivoIndex], [campo]: valor };
      setMeusCartoes(novosCartoes);
    }
  };

  const handleToggleFlip = (novoEstado) => {
    setIsCardFlipped(novoEstado);
    if (carrosselRef.current) {
      setTimeout(() => {
        const ativoEl = document.getElementById(`cartao-idx-${cartaoAtivoIndex}`);
        if (ativoEl) {
          carrosselRef.current.scrollTo({ left: ativoEl.offsetLeft - (carrosselRef.current.offsetWidth - ativoEl.offsetWidth) / 2, behavior: 'instant' });
        }
      }, 10);
    }
  };

  useEffect(() => {
    if(cartaoAtivo && cartaoAtivo.diaVencimento){
      setTempDiaVencimento(cartaoAtivo.diaVencimento); setTempDiaFechamento(cartaoAtivo.diaFechamento); setTempCor(cartaoAtivo.corCartao);
      setTempApelido(cartaoAtivo.apelidoCartao); setTempFinal(cartaoAtivo.finalCartao); setTempBandeira(cartaoAtivo.bandeiraCartao);
      setTempLimite(cartaoAtivo.limiteTotal || ''); 
    }
  }, [cartaoAtivo]);

  useEffect(() => {
    if (!isCardFlipped && carrosselRef.current) {
      setTimeout(() => {
        const ativoEl = document.getElementById(`cartao-idx-${cartaoAtivoIndex}`);
        if (ativoEl) carrosselRef.current.scrollTo({ left: ativoEl.offsetLeft - (carrosselRef.current.offsetWidth - ativoEl.offsetWidth) / 2, behavior: 'instant' });
      }, 10);
    }
  }, [isCardFlipped, cartaoAtivoIndex]);

  const handleSalvarConfigCartao = async () => {
    const dadosCartao = {
      id: cartaoAtivo.id ? Number(cartaoAtivo.id) : 0, usuarioId: usuarioLogado.id, nome: tempApelido || 'Novo Cartão',
      ultimosDigitos: tempFinal || '0000', bandeira: tempBandeira || 'Mastercard', limiteTotal: parseFloat(tempLimite || 0),
      diaVencimento: parseInt(tempDiaVencimento || '9', 10), diaFechamento: parseInt(tempDiaFechamento || '2', 10),
      corFundo: tempCor, corTexto: '#FFFFFF'
    };
    try {
      if (cartaoAtivo.id) await api.put(`/Cartoes/${cartaoAtivo.id}`, dadosCartao);
      else await api.post('/Cartoes', dadosCartao);
      await carregarDadosFinanceiros();
      setShowCardSettings(false);
    } catch (error) { alert("Houve um erro ao salvar o cartão."); }
  };

  const handleHorizontalSwipeStart = (e) => swipeCoords.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };

  const handleHorizontalSwipeMove = (e) => {
    if (!swipeCoords.current.x || !swipeCoords.current.y) return;
    const diffX = Math.abs(e.touches[0].clientX - swipeCoords.current.x);
    const diffY = Math.abs(e.touches[0].clientY - swipeCoords.current.y);
    if (diffX > diffY) e.stopPropagation();
  };

  const handleScrollCartoes = (e) => {
    if (!isCardFlipped) return; 
    const container = e.target;
    const center = container.scrollLeft + container.offsetWidth / 2;
    let closestIndex = 0; let minDistance = Infinity;
    Array.from(container.children).forEach((child, index) => {
      const distance = Math.abs((child.offsetLeft + child.offsetWidth / 2) - center);
      if (distance < minDistance) { minDistance = distance; closestIndex = index; }
    });
    if (closestIndex !== cartaoAtivoIndex && closestIndex < meusCartoes.length) setCartaoAtivoIndex(closestIndex);
  };

  const handleGoHome = () => {
    setTermoBusca(''); setSelectedCategory(null); setHoveredCategory(null); handleToggleFlip(false);
    setAbaGrafico(0); setShowBottomSheet(false); setShowProfile(false); setTransacaoSelecionada(null); setMenuAcaoDetalhes(0);
    const hoje = new Date();
    const nomesMeses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    setMesFiltro({ num: String(hoje.getMonth() + 1).padStart(2, '0'), ano: String(hoje.getFullYear()), nome: nomesMeses[hoje.getMonth()] });
    setIsChartAnimating(true);
    setTimeout(() => setIsChartAnimating(false), 800);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    setSelectedCategory(null); setHoveredCategory(null); setIsChartAnimating(true);
    const timer = setTimeout(() => setIsChartAnimating(false), 800); 
    return () => clearTimeout(timer);
  }, [mesFiltro, abaGrafico, isCardFlipped, cartaoAtivoIndex]);

  useEffect(() => {
    if (showMonthSelector) {
      setTimeout(() => { const el = document.getElementById('btn-mes-ativo'); if (el) el.scrollIntoView({ behavior: 'auto', block: 'center' }); }, 50);
    }
  }, [showMonthSelector]);

  const transacoesParaSaldo = transacoes.filter(t => isPastOrToday(t.data) || t.pago === true);
  const totalReceitasGeral = transacoesParaSaldo.filter(t => t.tipo === 'receita').reduce((acc, t) => acc + (Number(t.valor) || 0), 0);
  const totalDespesasGeral = transacoesParaSaldo.filter(t => t.tipo === 'despesa' && t.pagamento !== 'Crédito').reduce((acc, t) => acc + (Number(t.valor) || 0), 0);
  const saldoAtual = totalReceitasGeral - totalDespesasGeral;

  const receitasDoMes = transacoes.filter(t => {
    const partes = (t.data || '').split('/');
    return partes.length === 3 && partes[1] === mesFiltro.num && partes[2] === mesFiltro.ano && t.tipo === 'receita';
  }).reduce((acc, t) => acc + (Number(t.valor) || 0), 0);

  const despesasDoMes = transacoes.filter(t => {
    const partes = (t.data || '').split('/');
    return partes.length === 3 && partes[1] === mesFiltro.num && partes[2] === mesFiltro.ano && t.tipo === 'despesa' && t.pagamento !== 'Crédito';
  }).reduce((acc, t) => acc + (Number(t.valor) || 0), 0);

  const gerarHistoricoFaturas = () => {
    const idx = listaMeses.findIndex(m => m.num === mesFiltro.num && m.ano === mesFiltro.ano);
    if(idx === -1) return [];
    const mesesHistorico = listaMeses.slice(idx, idx + 5).reverse(); 

    return mesesHistorico.map(mes => {
      const total = transacoes
        .filter(t => t.pagamento === 'Crédito' && t.tipo === 'despesa')
        .filter(t => {
           if (t.cartaoId && t.cartaoId !== cartaoAtivo.id) return false;
           const fatura = getFaturaVencimento(t.data, cartaoAtivo.diaFechamento, cartaoAtivo.diaVencimento);
           return fatura && fatura.num === mes.num && fatura.ano === mes.ano;
        })
        .reduce((acc, t) => acc + (Number(t.valor) || 0), 0);
      return { nome: (mes.nome || '').substring(0, 3).toUpperCase(), total, num: mes.num, ano: mes.ano };
    });
  };

  const historicoData = isCardFlipped && abaGrafico === 1 ? gerarHistoricoFaturas() : [];
  const maxFaturaHist = historicoData.length > 0 ? Math.max(...historicoData.map(h => h.total), 1) : 1;

  const transacoesParaGrafico = transacoesDaAbaAtiva.filter(t => {
    if (!isCardFlipped && t.pagamento === 'Crédito') return false; 
    return true;
  });

  // 🟢 A Pizza do Dashboard também obedece a regra de esvaziar ao pagar adiantado
  const dadosFaturaAtiva = isCardFlipped ? calcularDadosFatura(cartaoAtivo) : null;
  const isPagaAdiantada = dadosFaturaAtiva?.status?.texto === 'Paga (Adiantada)';

  const getValorTratado = (t) => {
    if (isCardFlipped && t.pagamento === 'Crédito' && isPagaAdiantada) {
      return 0;
    }
    return Number(t.valor) || 0;
  };

  const despesasGrafico = transacoesParaGrafico.filter(t => t.tipo === 'despesa').reduce((acc, t) => {
      const v = getValorTratado(t);
      if (v > 0) acc[t.categoria] = (acc[t.categoria] || 0) + v; return acc;
    }, {});

  const pagamentosGrafico = transacoesParaGrafico.filter(t => t.tipo === 'despesa').reduce((acc, t) => {
      const v = getValorTratado(t);
      if (v > 0) acc[t.pagamento] = (acc[t.pagamento] || 0) + v; return acc;
    }, {});
    
  const totalDespesasAtivas = transacoesParaGrafico.filter(t => t.tipo === 'despesa').reduce((acc, t) => acc + getValorTratado(t), 0);
  const despesasArray = Object.entries(despesasGrafico).sort((a, b) => b[1] - a[1]);
  const pagamentosArray = Object.entries(pagamentosGrafico).sort((a, b) => b[1] - a[1]);

  const getSVGSegments = () => {
    if (totalDespesasAtivas === 0) return [];
    const dadosArray = abaGrafico === 0 ? despesasArray : pagamentosArray;
    const coresMapa = abaGrafico === 0 ? coresDinamicas : coresPagamento;
    let cumulativePercent = 0;
    return dadosArray.map(([key, value]) => {
      const percent = ((Number(value) || 0) / totalDespesasAtivas) * 100;
      const dasharray = `${percent} ${100 - percent}`;
      const dashoffset = 25 - cumulativePercent; 
      cumulativePercent += percent;
      return { key, value, percent, dasharray, dashoffset, color: coresMapa[key] || '#6b7280' };
    });
  };
  const svgSegments = getSVGSegments();

  const handleTouchStart = (e) => {
    if (!e.targetTouches || e.targetTouches.length === 0) return;
    setSwipeEnd(null); setSwipeStart(e.targetTouches[0].clientX); swipeCoords.current = { x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY };
  }

  const handleTouchMove = (e) => {
    if (!e.targetTouches || e.targetTouches.length === 0) return;
    setSwipeEnd(e.targetTouches[0].clientX);
    const diffX = Math.abs(e.targetTouches[0].clientX - swipeCoords.current.x);
    const diffY = Math.abs(e.targetTouches[0].clientY - swipeCoords.current.y);
    if (diffX > diffY) e.stopPropagation(); 
  }

  const handleTouchEnd = () => {
    if (!swipeStart || !swipeEnd) return;
    const distance = swipeStart - swipeEnd;
    if (distance > minSwipeDistance && abaGrafico === 0) setAbaGrafico(1); 
    if (distance < -minSwipeDistance && abaGrafico === 1) setAbaGrafico(0); 
    setSwipeStart(null); setSwipeEnd(null);
  }

  const handleAbrirEdicao = () => {
    setTransacaoParaEditar(transacaoSelecionada); setTransacaoSelecionada(null); setShowBottomSheet(true);      
  };

  const handleToggleStatusPagamento = async () => {
    setAnimatingStatusId(transacaoSelecionada.id);
    setTimeout(() => setAnimatingStatusId(null), 300);

    const novoStatus = !transacaoSelecionada.pago;
    const partes = (transacaoSelecionada.data || '').split('/');
    const horaAtual = transacaoSelecionada.hora || '12:00';
    const dataSegura = partes.length === 3 ? `${partes[2]}-${partes[1]}-${partes[0]}T${horaAtual}:00` : new Date().toISOString();
    const contaId = mapaContasAPI[transacaoSelecionada.pagamento] || 2;

    const payload = {
      id: transacaoSelecionada.id, usuarioId: usuarioLogado.id, contaOrigemId: transacaoSelecionada.tipo === 'despesa' ? contaId : null,
      contaDestinoId: transacaoSelecionada.tipo === 'receita' ? contaId : null, categoriaId: transacaoSelecionada.categoriaId || 10,
      descricao: transacaoSelecionada.titulo, valor: transacaoSelecionada.valor, tipo: transacaoSelecionada.tipo,
      dataTransacao: dataSegura, pago: novoStatus, ehRecorrente: transacaoSelecionada.recorrente, observacao: transacaoSelecionada.observacao
    };

    try {
      await api.put(`${TRANSACOES_API_URL}/${transacaoSelecionada.id}`, payload);
      setTransacoesGlobais(prev => prev.map(t => t.id === transacaoSelecionada.id ? { ...t, isPago: novoStatus, pago: novoStatus } : t));
      setTransacaoSelecionada({ ...transacaoSelecionada, pago: novoStatus });
    } catch (error) { alert("Erro de conexão ao tentar mudar o status de pagamento."); }
  };

  const handleEfetuarExclusao = async (apagarFuturos) => {
    setIsDeleting(true);
    try {
      if (apagarFuturos && transacaoSelecionada.recorrente) {
        const tituloBase = (transacaoSelecionada.titulo || '').replace(/\(\d+\/\d+\)/g, '').trim();
        const partesSel = (transacaoSelecionada.data || '').split('/');
        const dataSelecionadaObj = partesSel.length === 3 ? new Date(partesSel[2], partesSel[1] - 1, partesSel[0]) : new Date(2000, 0, 1);

        const transacoesParaExcluir = transacoesGlobais.filter(t => {
          if (!t.ehRecorrente && !t.recorrente) return false;
          const tTituloBase = (t.descricao || t.titulo || '').replace(/\(\d+\/\d+\)/g, '').trim();
          if (tTituloBase !== tituloBase) return false;
          return (t.dataObj || new Date(2000, 0, 1)) >= dataSelecionadaObj;
        });
        
        for (const t of transacoesParaExcluir) await api.delete(`${TRANSACOES_API_URL}/${t.id}`);
      } else {
        await api.delete(`${TRANSACOES_API_URL}/${transacaoSelecionada.id}`);
      }
      await carregarDadosFinanceiros();
      setTransacaoSelecionada(null); setMenuAcaoDetalhes(0);
    } catch (error) { alert("Houve um erro ao tentar excluir. Tente novamente."); } 
    finally { setIsDeleting(false); }
  };

  const handleRefresh = async () => {
    if (navigator.vibrate) navigator.vibrate(50); 
    setIsRefreshingUI(true);
    try { await carregarDadosFinanceiros(); } 
    catch (error) {} 
    finally { setIsRefreshingUI(false); setIsChartAnimating(true); setTimeout(() => setIsChartAnimating(false), 800); }
  };

  return {
    isDark, usuarioLogado, handleLogout, carrosselRef, 
    showBalance, setShowBalance, showProfile, setShowProfile, 
    showBottomSheet, setShowBottomSheet, showMonthSelector, setShowMonthSelector,
    transacaoSelecionada, setTransacaoSelecionada, transacaoParaEditar, setTransacaoParaEditar,
    menuAcaoDetalhes, setMenuAcaoDetalhes, abaGrafico, setAbaGrafico,
    isDeleting, isCardFlipped, setIsCardFlipped, showCardSettings, setShowCardSettings,
    termoBusca, setTermoBusca, isChartAnimating, coresDinamicas,
    isRefreshingUI, mesFiltro, setMesFiltro, hoveredCategory, setHoveredCategory,
    selectedCategory, setSelectedCategory, animatingStatusId,
    meusCartoes, setMeusCartoes, cartaoAtivoIndex, setCartaoAtivoIndex, cartaoAtivo,
    tempDiaVencimento, setTempDiaVencimento, tempDiaFechamento, setTempDiaFechamento,
    tempCor, setTempCor, tempApelido, setTempApelido, tempFinal, setTempFinal,
    tempBandeira, setTempBandeira, tempLimite, setTempLimite,
    calcularDadosFatura, listaMeses, transacoesAgrupadas, handleAtualizarCartaoTemp,
    carregarCartoes: carregarDadosFinanceiros, carregarTransacoes: carregarDadosFinanceiros, handleToggleFlip, handleSalvarConfigCartao,
    handleHorizontalSwipeStart, handleHorizontalSwipeMove, handleScrollCartoes,
    handleGoHome, saldoAtual, receitasDoMes, despesasDoMes, historicoData,
    maxFaturaHist, despesasGrafico, pagamentosGrafico, despesasArray, pagamentosArray,
    totalDespesasAtivas, svgSegments, handleTouchStart, handleTouchMove, handleTouchEnd,
    handleAbrirEdicao, handleToggleStatusPagamento, handleEfetuarExclusao, handleRefresh
  };
}