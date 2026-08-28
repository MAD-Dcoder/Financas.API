import { useState, useEffect, useMemo, useRef, useContext } from 'react';
import api from '../api/axios';
import categoriasService from '../api/categoriasService';
import { AuthContext } from '../contexts/AuthContext';
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
  const isDark = temaAtual === 'dark';
  const carrosselRef = useRef(null);

  // INICIALIZAÇÃO INTELIGENTE DO MODO PRIVACIDADE
  const [showBalance, setShowBalance] = useState(() => {
    const configsSalvas = localStorage.getItem('firmo_configs');
    if (configsSalvas) {
      try {
        const { ocultarValores } = JSON.parse(configsSalvas);
        return !ocultarValores; 
      } catch (error) {
        console.error("Erro ao ler configuração de privacidade:", error);
      }
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
  const [transacoes, setTransacoes] = useState([]);
  const [isChartAnimating, setIsChartAnimating] = useState(true); 
  const [coresDinamicas, setCoresDinamicas] = useState({ ...coresCategorias });
  
  // Mantemos true na inicialização para exibir o Skeleton enquanto o Render acorda
  const [isRefreshingUI, setIsRefreshingUI] = useState(true);

  const [mesFiltro, setMesFiltro] = useState(() => {
    const hoje = new Date();
    const nomesMeses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return {
      num: String(hoje.getMonth() + 1).padStart(2, '0'),
      ano: String(hoje.getFullYear()),
      nome: nomesMeses[hoje.getMonth()]
    };
  });

  const [hoveredCategory, setHoveredCategory] = useState(null); 
  const [selectedCategory, setSelectedCategory] = useState(null); 
  const [animatingStatusId, setAnimatingStatusId] = useState(null); 
  const [swipeStart, setSwipeStart] = useState(null);
  const [swipeEnd, setSwipeEnd] = useState(null);
  const minSwipeDistance = 50;
  const swipeCoords = useRef({ x: 0, y: 0 });

  const [meusCartoes, setMeusCartoes] = useState([
    {
      id: null, apelidoCartao: 'Novo Cartão', finalCartao: 'XXXX', bandeiraCartao: 'Mastercard',
      corCartao: 'linear-gradient(135deg, #214d80c2 0%, #575a5cc4 100%)', diaFechamento: '00', diaVencimento: '00', limiteTotal: 0
    }
  ]);
  
  const [cartaoAtivoIndex, setCartaoAtivoIndex] = useState(0);
  const cartaoAtivo = meusCartoes[cartaoAtivoIndex] || meusCartoes[0];

  const [tempDiaVencimento, setTempDiaVencimento] = useState('');
  const [tempDiaFechamento, setTempDiaFechamento] = useState('');
  const [tempCor, setTempCor] = useState('');
  const [tempApelido, setTempApelido] = useState('');
  const [tempFinal, setTempFinal] = useState('');
  const [tempBandeira, setTempBandeira] = useState('');
  const [tempLimite, setTempLimite] = useState('');

  const getFaturaVencimento = (dataStr, fechamentoCartao, vencimentoCartao) => {
    const partes = (dataStr || '').split('/');
    if (partes.length !== 3) return null;
    const diaTransacao = parseInt(partes[0], 10);
    let mesTransacao = parseInt(partes[1], 10);
    let anoTransacao = parseInt(partes[2], 10);
    
    const diaFechamento = parseInt(fechamentoCartao, 10) || 0;
    const diaVencimento = parseInt(vencimentoCartao, 10) || 0;

    if (diaFechamento === 0 || diaVencimento === 0) {
      return { num: String(mesTransacao).padStart(2, '0'), ano: String(anoTransacao) };
    }

    let mesFechamento = mesTransacao;
    let anoFechamento = anoTransacao;

    if (diaTransacao >= diaFechamento) {
      mesFechamento += 1;
      if (mesFechamento > 12) {
        mesFechamento = 1;
        anoFechamento += 1;
      }
    }

    let mesVencimento = mesFechamento;
    let anoVencimento = anoFechamento;

    if (diaVencimento < diaFechamento) {
      mesVencimento += 1;
      if (mesVencimento > 12) {
        mesVencimento = 1;
        anoVencimento += 1;
      }
    }
    return { num: String(mesVencimento).padStart(2, '0'), ano: String(anoVencimento) };
  };

  const calcularDadosFatura = (cartao) => {
    const diaFechamento = parseInt(cartao.diaFechamento, 10) || 0;
    const diaVencimento = parseInt(cartao.diaVencimento, 10) || 0;
    let mesExibicaoNum = parseInt(mesFiltro.num, 10);
    let anoExibicaoNum = parseInt(mesFiltro.ano, 10);
    
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); 

    const dataVencimentoFatura = new Date(anoExibicaoNum, mesExibicaoNum - 1, diaVencimento);
    const isMesAtualFiltro = mesExibicaoNum === (hoje.getMonth() + 1) && anoExibicaoNum === hoje.getFullYear();

    if (isMesAtualFiltro && hoje > dataVencimentoFatura) {
      mesExibicaoNum += 1;
      if (mesExibicaoNum > 12) {
        mesExibicaoNum = 1;
        anoExibicaoNum += 1;
      }
    }

    let mesFechamentoReal = mesExibicaoNum;
    let anoFechamentoReal = anoExibicaoNum;

    if (diaVencimento < diaFechamento) {
      mesFechamentoReal -= 1;
      if (mesFechamentoReal < 1) {
        mesFechamentoReal = 12;
        anoFechamentoReal -= 1;
      }
    }

    const dataFechamentoFatura = new Date(anoFechamentoReal, mesFechamentoReal - 1, diaFechamento);
    const dataVencimentoReal = new Date(anoExibicaoNum, mesExibicaoNum - 1, diaVencimento);

    let statusTexto = 'Aberta';
    let statusCor = 'text-success'; 

    if (hoje > dataVencimentoReal) {
      statusTexto = 'Vencida';
      statusCor = 'text-danger';
    } else if (hoje >= dataFechamentoFatura) {
      statusTexto = 'Fechada';
      statusCor = 'text-danger'; 
    }

    const nomesMeses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const nomeMesVencimentoFatura = nomesMeses[mesExibicaoNum - 1];
    const mesVencimentoFaturaStr = String(mesExibicaoNum).padStart(2, '0');
    const anoVencimentoFaturaStr = String(anoExibicaoNum);

    const total = transacoes.filter(t => {
      if (t.pagamento === 'Crédito' && t.tipo === 'despesa') {
        if (t.cartaoId && t.cartaoId !== cartao.id) return false;
        const fatura = getFaturaVencimento(t.data, cartao.diaFechamento, cartao.diaVencimento);
        return fatura && fatura.num === mesVencimentoFaturaStr && fatura.ano === anoVencimentoFaturaStr;
      }
      return false;
    }).reduce((acc, t) => acc + (Number(t.valor) || 0), 0);

    return { 
      total, 
      status: { texto: statusTexto, cor: statusCor }, 
      mesVencimentoFatura: mesVencimentoFaturaStr, 
      anoVencimentoFatura: anoVencimentoFaturaStr,
      nomeMesVencimentoFatura 
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
          if (t.pagamento === 'Crédito') {
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
      lista.push({
        nome: nomesMeses[current.getMonth()],
        num: String(current.getMonth() + 1).padStart(2, '0'),
        ano: String(current.getFullYear())
      });
      current.setMonth(current.getMonth() - 1);
    }
    return lista;
  }, [transacoes, cartaoAtivo.diaFechamento, cartaoAtivo.diaVencimento]);

  const transacoesDaAbaAtiva = transacoes.filter(t => {
    if (isCardFlipped) {
      if (t.pagamento === 'Crédito') {
        if (t.cartaoId && t.cartaoId !== cartaoAtivo.id) {
          return false;
        }
        const fatura = getFaturaVencimento(t.data, cartaoAtivo.diaFechamento, cartaoAtivo.diaVencimento);
        const dadosFaturaExibida = calcularDadosFatura(cartaoAtivo);
        return fatura && fatura.num === dadosFaturaExibida.mesVencimentoFatura && fatura.ano === dadosFaturaExibida.anoVencimentoFatura;
      }
      return false;
    } else {
      const partes = (t.data || '').split('/');
      if (partes.length === 3) {
        return partes[1] === mesFiltro.num && partes[2] === mesFiltro.ano;
      }
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
      if (!grupos[t.data]) {
        grupos[t.data] = [];
      }
      grupos[t.data].push(t);
    });

    const chavesOrdenadas = Object.keys(grupos).sort((a, b) => {
      const [diaA, mesA, anoA] = a.split('/');
      const [diaB, mesB, anoB] = b.split('/');
      const dataA = new Date(anoA, mesA - 1, diaA);
      const dataB = new Date(anoB, mesB - 1, diaB);
      return dataB - dataA;
    });

    return chavesOrdenadas.map(chave => ({
      dataString: chave,
      transacoes: grupos[chave].sort((a, b) => b.id - a.id) 
    }));
  };

  const transacoesAgrupadas = agruparTransacoesPorData(transacoesParaExibir);

  const handleAtualizarCartaoTemp = (campo, valor) => {
    const novosCartoes = [...meusCartoes];
    if (novosCartoes[cartaoAtivoIndex]) {
      novosCartoes[cartaoAtivoIndex] = {
        ...novosCartoes[cartaoAtivoIndex],
        [campo]: valor
      };
      setMeusCartoes(novosCartoes);
    }
  };

  const carregarCartoes = async () => {
    if (!isLoggedIn || !usuarioLogado?.id) return;
    try {
      const response = await api.get(`/Cartoes/usuario/${usuarioLogado.id}`);
      if (response.data && response.data.length > 0) {
        const cartoesDoBanco = response.data.map(c => ({
          id: c.id,
          apelidoCartao: c.nome || 'Nome do Cartão',
          finalCartao: c.ultimosDigitos || 'XXXX',
          bandeiraCartao: c.bandeira || 'Mastercard',
          corCartao: c.corFundo || 'linear-gradient(135deg, #059669 0%, #047857 100%)',
          diaFechamento: String(c.diaFechamento).padStart(2, '0'),
          diaVencimento: String(c.diaVencimento).padStart(2, '0'),
          limiteTotal: c.limiteTotal || 0
        }));
        setMeusCartoes(cartoesDoBanco);
      }
    } catch (error) {
      console.error("Erro ao carregar cartões da API:", error);
    }
  };

  useEffect(() => { carregarCartoes(); }, [isLoggedIn, usuarioLogado]);

  const carregarTransacoes = async () => {
    if (!isLoggedIn || !usuarioLogado) return;
    try {
      const catResponse = await categoriasService.getCategorias(usuarioLogado.id);
      const mapaCategoriasAtivas = {};
      const mapaCoresDinamicas = { ...coresCategorias };
      
      catResponse.forEach((c, index) => {
        mapaCategoriasAtivas[c.id] = { nome: c.nome, cor: c.corHex };
        const corOficial = c.corHex || PALETA_CORES[index % PALETA_CORES.length];
        mapaCoresDinamicas[c.nome] = corOficial;
      });
      setCoresDinamicas(mapaCoresDinamicas);

      const response = await api.get(`${TRANSACOES_API_URL}/usuario/${usuarioLogado.id}`);
      const transacoesDoBanco = response.data.map(t => {
        const dataStr = t.dataTransacao || new Date().toISOString();
        const dataQuebrada = dataStr.split('T');
        const dataBruta = dataQuebrada[0].split('-'); 
        const dataCerta = dataBruta.length === 3 ? `${dataBruta[2]}/${dataBruta[1]}/${dataBruta[0]}` : '01/01/2000';
        const horaCerta = dataQuebrada[1] ? dataQuebrada[1].substring(0, 5) : '00:00';
        
        const categoriaInfo = mapaCategoriasAtivas[t.categoriaId];
        const nomeCategoria = categoriaInfo 
            ? categoriaInfo.nome 
            : (mapaCategoriasAPIReverse[t.categoriaId] || 'Outros');
        
        return {
          id: t.id,
          titulo: t.descricao || 'Lançamento sem título',
          categoria: nomeCategoria, 
          categoriaId: t.categoriaId,
          pagamento: mapaContasAPIReverse[t.contaOrigemId] || mapaContasAPIReverse[t.contaDestinoId] || 'Pix',
          observacao: t.observacao || '',
          data: dataCerta,
          hora: horaCerta,
          valor: Number(t.valor) || 0,
          tipo: t.tipo || 'despesa',
          recorrente: t.ehRecorrente || false,
          pago: t.pago !== undefined ? t.pago : true,
          cartaoId: t.cartaoId
        };
      });
      setTransacoes(transacoesDoBanco);
    } catch (error) {
      // Validação de segurança aprimorada para o Render:
      // Só desloga se o erro for explicitamente 401 E o token JWT local realmente estiver expirado.
      if (error.response && error.response.status === 401) {
        const savedData = localStorage.getItem('firmo_user');
        if (savedData) {
          try {
            const { token } = JSON.parse(savedData);
            const decoded = jwtDecode(token);
            if (decoded.exp < Date.now() / 1000) {
              handleLogout();
              alert("Sua sessão expirou, faça login novamente.");
            }
          } catch (e) {
            handleLogout();
          }
        }
      } else {
        console.error("Erro de conexão/servidor ao buscar transações (Servidor acordando?):", error);
      }
    } finally {
      // Garante que o Skeleton desliga após a primeira tentativa (mesmo se o servidor demorar)
      setIsRefreshingUI(false);
    }
  };

  useEffect(() => { 
    carregarTransacoes(); 
  }, [isLoggedIn, usuarioLogado]);

  const handleToggleFlip = (novoEstado) => {
    setIsCardFlipped(novoEstado);
    if (carrosselRef.current) {
      setTimeout(() => {
        const ativoEl = document.getElementById(`cartao-idx-${cartaoAtivoIndex}`);
        if (ativoEl) {
          carrosselRef.current.scrollTo({
            left: ativoEl.offsetLeft - (carrosselRef.current.offsetWidth - ativoEl.offsetWidth) / 2,
            behavior: 'instant'
          });
        }
      }, 10);
    }
  };

  useEffect(() => {
    setTempDiaVencimento(cartaoAtivo.diaVencimento);
    setTempDiaFechamento(cartaoAtivo.diaFechamento);
    setTempCor(cartaoAtivo.corCartao);
    setTempApelido(cartaoAtivo.apelidoCartao);
    setTempFinal(cartaoAtivo.finalCartao);
    setTempBandeira(cartaoAtivo.bandeiraCartao);
    setTempLimite(cartaoAtivo.limiteTotal || ''); 
  }, [cartaoAtivo]);

  useEffect(() => {
    if (!isCardFlipped && carrosselRef.current) {
      setTimeout(() => {
        const ativoEl = document.getElementById(`cartao-idx-${cartaoAtivoIndex}`);
        if (ativoEl) {
          carrosselRef.current.scrollTo({
            left: ativoEl.offsetLeft - (carrosselRef.current.offsetWidth - ativoEl.offsetWidth) / 2,
            behavior: 'instant'
          });
        }
      }, 10);
    }
  }, [isCardFlipped, cartaoAtivoIndex]);

  const handleSalvarConfigCartao = async () => {
    const dadosCartao = {
      id: cartaoAtivo.id ? Number(cartaoAtivo.id) : 0,
      usuarioId: usuarioLogado.id,
      nome: tempApelido || 'Novo Cartão',
      ultimosDigitos: tempFinal || '0000',
      bandeira: tempBandeira || 'Mastercard',
      limiteTotal: parseFloat(tempLimite || 0),
      diaVencimento: parseInt(tempDiaVencimento || '9', 10),
      diaFechamento: parseInt(tempDiaFechamento || '2', 10),
      corFundo: tempCor,
      corTexto: '#FFFFFF'
    };
  
    try {
      if (cartaoAtivo.id) {
        await api.put(`/Cartoes/${cartaoAtivo.id}`, dadosCartao);
      } else {
        await api.post('/Cartoes', dadosCartao);
      }
      await carregarCartoes();
      setShowCardSettings(false);
    } catch (error) {
      console.error("Erro ao salvar o cartão no banco:", error);
      alert("Houve um erro ao salvar o cartão.");
    }
  };

  const handleHorizontalSwipeStart = (e) => {
    swipeCoords.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

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
    let closestIndex = 0;
    let minDistance = Infinity;
    
    Array.from(container.children).forEach((child, index) => {
      const childCenter = child.offsetLeft + child.offsetWidth / 2;
      const distance = Math.abs(childCenter - center);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    if (closestIndex !== cartaoAtivoIndex && closestIndex < meusCartoes.length) {
      setCartaoAtivoIndex(closestIndex);
    }
  };

  const handleGoHome = () => {
    setTermoBusca('');
    setSelectedCategory(null);
    setHoveredCategory(null);
    handleToggleFlip(false);
    setAbaGrafico(0);
    setShowBottomSheet(false);
    setShowProfile(false);
    setTransacaoSelecionada(null);
    setMenuAcaoDetalhes(0);
    
    const hoje = new Date();
    const nomesMeses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    setMesFiltro({
      num: String(hoje.getMonth() + 1).padStart(2, '0'),
      ano: String(hoje.getFullYear()),
      nome: nomesMeses[hoje.getMonth()]
    });

    setIsChartAnimating(true);
    setTimeout(() => setIsChartAnimating(false), 800);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    setSelectedCategory(null);
    setHoveredCategory(null);
    setIsChartAnimating(true);
    const timer = setTimeout(() => setIsChartAnimating(false), 800); 
    return () => clearTimeout(timer);
  }, [mesFiltro, abaGrafico, isCardFlipped, cartaoAtivoIndex]);

  useEffect(() => {
    if (showMonthSelector) {
      setTimeout(() => {
        const el = document.getElementById('btn-mes-ativo');
        if (el) el.scrollIntoView({ behavior: 'auto', block: 'center' });
      }, 50);
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

  const despesasGrafico = transacoesParaGrafico.filter(t => t.tipo === 'despesa').reduce((acc, t) => {
      acc[t.categoria] = (acc[t.categoria] || 0) + (Number(t.valor) || 0);
      return acc;
    }, {});

  const pagamentosGrafico = transacoesParaGrafico.filter(t => t.tipo === 'despesa').reduce((acc, t) => {
      acc[t.pagamento] = (acc[t.pagamento] || 0) + (Number(t.valor) || 0);
      return acc;
    }, {});
    
  const totalDespesasAtivas = transacoesParaGrafico.filter(t => t.tipo === 'despesa').reduce((acc, t) => acc + (Number(t.valor) || 0), 0);
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
      
      return {
        key, value, percent, dasharray, dashoffset,
        color: coresMapa[key] || '#6b7280'
      };
    });
  };

  const svgSegments = getSVGSegments();

  const handleTouchStart = (e) => {
    if (!e.targetTouches || e.targetTouches.length === 0) return;
    setSwipeEnd(null);
    setSwipeStart(e.targetTouches[0].clientX);
    swipeCoords.current = { x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY };
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
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && abaGrafico === 0) setAbaGrafico(1); 
    if (isRightSwipe && abaGrafico === 1) setAbaGrafico(0); 
    
    setSwipeStart(null);
    setSwipeEnd(null);
  }

  const handleAbrirEdicao = () => {
    setTransacaoParaEditar(transacaoSelecionada);
    setTransacaoSelecionada(null); 
    setShowBottomSheet(true);      
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
      id: transacaoSelecionada.id,
      usuarioId: usuarioLogado.id,
      contaOrigemId: transacaoSelecionada.tipo === 'despesa' ? contaId : null,
      contaDestinoId: transacaoSelecionada.tipo === 'receita' ? contaId : null,
      categoriaId: transacaoSelecionada.categoriaId || 10,
      descricao: transacaoSelecionada.titulo,
      valor: transacaoSelecionada.valor,
      tipo: transacaoSelecionada.tipo,
      dataTransacao: dataSegura,
      pago: novoStatus,
      ehRecorrente: transacaoSelecionada.recorrente,
      observacao: transacaoSelecionada.observacao
    };

    try {
      await api.put(`${TRANSACOES_API_URL}/${transacaoSelecionada.id}`, payload);
      setTransacoes(transacoes.map(t => t.id === transacaoSelecionada.id ? { ...t, pago: novoStatus } : t));
      setTransacaoSelecionada({ ...transacaoSelecionada, pago: novoStatus });
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      alert("Erro de conexão ao tentar mudar o status de pagamento.");
    }
  };

  const handleEfetuarExclusao = async (apagarFuturos) => {
    setIsDeleting(true);
    try {
      if (apagarFuturos && transacaoSelecionada.recorrente) {
        const tituloBase = (transacaoSelecionada.titulo || '').replace(/\(\d+\/\d+\)/g, '').trim();
        const partesSel = (transacaoSelecionada.data || '').split('/');
        const dataSelecionadaObj = partesSel.length === 3 ? new Date(partesSel[2], partesSel[1] - 1, partesSel[0]) : new Date(2000, 0, 1);

        const transacoesParaExcluir = transacoes.filter(t => {
          if (!t.recorrente) return false;
          const tTituloBase = (t.titulo || '').replace(/\(\d+\/\d+\)/g, '').trim();
          if (tTituloBase !== tituloBase) return false;
          const partesT = (t.data || '').split('/');
          const tDataObj = partesT.length === 3 ? new Date(partesT[2], partesT[1] - 1, partesT[0]) : new Date(2000, 0, 1);
          return tDataObj >= dataSelecionadaObj;
        });
        
        for (const t of transacoesParaExcluir) {
          await api.delete(`${TRANSACOES_API_URL}/${t.id}`);
        }
        await carregarTransacoes();
      } else {
        await api.delete(`${TRANSACOES_API_URL}/${transacaoSelecionada.id}`);
        await carregarTransacoes();
      }
      setTransacaoSelecionada(null);
      setMenuAcaoDetalhes(0);
    } catch (error) {
      console.error("Erro ao excluir transação:", error);
      alert("Houve um erro ao tentar excluir. Tente novamente.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRefresh = async () => {
    if (navigator.vibrate) navigator.vibrate(50); 
    setIsRefreshingUI(true);
    try {
      await Promise.all([carregarCartoes(), carregarTransacoes()]);
    } catch (error) {
      console.error("Erro ao atualizar os dados no pull-to-refresh:", error);
    } finally {
      setIsRefreshingUI(false);
      setIsChartAnimating(true);
      setTimeout(() => setIsChartAnimating(false), 800);
    }
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
    carregarCartoes, carregarTransacoes, handleToggleFlip, handleSalvarConfigCartao,
    handleHorizontalSwipeStart, handleHorizontalSwipeMove, handleScrollCartoes,
    handleGoHome, saldoAtual, receitasDoMes, despesasDoMes, historicoData,
    maxFaturaHist, despesasGrafico, pagamentosGrafico, despesasArray, pagamentosArray,
    totalDespesasAtivas, svgSegments, handleTouchStart, handleTouchMove, handleTouchEnd,
    handleAbrirEdicao, handleToggleStatusPagamento, handleEfetuarExclusao, handleRefresh
  };
}