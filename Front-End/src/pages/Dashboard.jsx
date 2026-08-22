import React, { useState, useEffect, useMemo, useContext, useRef } from 'react';
import PullToRefresh from 'react-simple-pull-to-refresh';
import { AuthContext } from '../contexts/AuthContext';
import OffcanvasMenu from '../components/OffcanvasMenu';
import CardSettings from '../components/CardSettings';
import TransactionDetails from '../components/TransactionDetails';
import MonthSelector from '../components/MonthSelector';
import TransactionForm from '../components/TransactionForm';
import DonutChart from '../components/DonutChart';
import TransactionList from '../components/TransactionList';
import FlipCard from '../components/FlipCard';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import api from '../api/axios';
import categoriasService from '../api/categoriasService'; // NOVO IMPORT
import { 
  FiCoffee, FiTool, FiTruck, FiBookOpen, FiSmile, FiHome as FiHomeIcon, 
  FiDollarSign, FiGift, FiTag
} from 'react-icons/fi';
import { 
  mapaCategoriasAPI, 
  mapaContasAPI, 
  mapaCategoriasAPIReverse, 
  mapaContasAPIReverse, 
  coresCategorias, 
  coresPagamento,
  mapaCoresCartao,
  PALETA_CORES
} from '../utils/constants';
import { isPastOrToday } from '../utils/dateUtils';

function Dashboard ({ temaAtual, toggleTema }) {  
  const TRANSACOES_API_URL = '/Transacoes';
  const { usuarioLogado, isLoggedIn, handleLogout } = useContext(AuthContext);
  const isDark = temaAtual === 'dark';

  const carrosselRef = useRef(null);

  // ==========================================
  // ESTADOS GERAIS E INTERFACE
  // ==========================================
  const [showBalance, setShowBalance] = useState(true);
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
  const [coresDinamicas, setCoresDinamicas] = useState({ ...coresCategorias }); // ESTADO DAS CORES
  
  // ESTADO DO PULL TO REFRESH
  const [isRefreshingUI, setIsRefreshingUI] = useState(false);

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

  // ==========================================
  // ESTADOS DOS CARTÕES
  // ==========================================
  const [meusCartoes, setMeusCartoes] = useState([
    {
      id: null,
      apelidoCartao: 'Novo Cartão',
      finalCartao: 'XXXX',
      bandeiraCartao: 'Mastercard',
      corCartao: 'linear-gradient(135deg, #214d80c2 0%, #575a5cc4 100%)',
      diaFechamento: '00',
      diaVencimento: '00',
      limiteTotal: 0
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

  // ==========================================
  // FUNÇÕES CORE MÁGICA 1 E 2
  // ==========================================
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

  // ==========================================
  // LISTAS, FILTROS E AGRUPAMENTOS
  // ==========================================
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

  // ==========================================
  // FUNÇÕES DE AÇÃO E API
  // ==========================================
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

  useEffect(() => {
    carregarCartoes();
  }, [isLoggedIn, usuarioLogado]);

  const carregarTransacoes = async () => {
    if (!isLoggedIn || !usuarioLogado) return;
    try {
      // 1. Busca as categorias atualizadas do usuário
      const catResponse = await categoriasService.getCategorias(usuarioLogado.id);
      
      // Criamos um mapa para busca rápida: ID -> { nome, corHex }
      const mapaCategoriasAtivas = {};
      const mapaCoresDinamicas = { ...coresCategorias };
      
     catResponse.forEach((c, index) => {
      mapaCategoriasAtivas[c.id] = { nome: c.nome, cor: c.corHex };
      
      // Força o uso sequencial da paleta para garantir cores únicas
      const corDaPaleta = PALETA_CORES[index % PALETA_CORES.length];
      mapaCoresDinamicas[c.nome] = corDaPaleta;
    });
    setCoresDinamicas(mapaCoresDinamicas);

      // 2. Busca as transações
      const response = await api.get(`${TRANSACOES_API_URL}/usuario/${usuarioLogado.id}`);
      
      const transacoesDoBanco = response.data.map(t => {
        const dataStr = t.dataTransacao || new Date().toISOString();
        const dataQuebrada = dataStr.split('T');
        const dataBruta = dataQuebrada[0].split('-'); 
        const dataCerta = dataBruta.length === 3 ? `${dataBruta[2]}/${dataBruta[1]}/${dataBruta[0]}` : '01/01/2000';
        const horaCerta = dataQuebrada[1] ? dataQuebrada[1].substring(0, 5) : '00:00';
        
        // Lógica de resolução de categoria:
        // Prioridade 1: ID está no mapa dinâmico do usuário?
        // Prioridade 2: ID é uma das categorias padrão do sistema (constants.js)?
        // Prioridade 3: Fallback para "Outros"
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
      if(error.response && error.response.status === 401) {
          handleLogout();
          alert("Sua sessão expirou, faça login novamente.");
      }
      console.error("Erro ao buscar transações da API:", error);
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

  // ==========================================
  // CONTROLE DE VETOR: SWIPE HORIZONTAL NO CARROSSEL
  // ==========================================
  const handleHorizontalSwipeStart = (e) => {
    swipeCoords.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
  };

  const handleHorizontalSwipeMove = (e) => {
    if (!swipeCoords.current.x || !swipeCoords.current.y) return;
    
    const diffX = Math.abs(e.touches[0].clientX - swipeCoords.current.x);
    const diffY = Math.abs(e.touches[0].clientY - swipeCoords.current.y);

    if (diffX > diffY) {
      e.stopPropagation();
    }
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
        if (el) {
          el.scrollIntoView({ behavior: 'auto', block: 'center' });
        }
      }, 50);
    }
  }, [showMonthSelector]);

  // ==========================================
  // CÁLCULOS E GRÁFICOS
  // ==========================================
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

  const obterIconeCategoria = (categoria) => {
    switch (categoria) {
      case 'Alimentação': return <FiCoffee size={18} />;
      case 'Moto': return <FiTool size={18} />;
      case 'Carro Clássico':
      case 'Carro': return <FiTruck size={18} />;
      case 'Educação': return <FiBookOpen size={18} />;
      case 'Lazer': return <FiSmile size={18} />;
      case 'Moradia': return <FiHomeIcon size={18} />;
      case 'Salário':
      case 'Rendimento': return <FiDollarSign size={18} />;
      case 'Vale (VR + VT)': return <FiGift size={18} />;
      default: return <FiTag size={18} />; // As novas categorias caem aqui com a Etiqueta
    }
  };

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

  const despesasGrafico = transacoesParaGrafico
    .filter(t => t.tipo === 'despesa')
    .reduce((acc, t) => {
      acc[t.categoria] = (acc[t.categoria] || 0) + (Number(t.valor) || 0);
      return acc;
    }, {});

  const pagamentosGrafico = transacoesParaGrafico
    .filter(t => t.tipo === 'despesa')
    .reduce((acc, t) => {
      acc[t.pagamento] = (acc[t.pagamento] || 0) + (Number(t.valor) || 0);
      return acc;
    }, {});
    
  const totalDespesasAtivas = transacoesParaGrafico.filter(t => t.tipo === 'despesa').reduce((acc, t) => acc + (Number(t.valor) || 0), 0);
  const despesasArray = Object.entries(despesasGrafico).sort((a, b) => b[1] - a[1]);
  const pagamentosArray = Object.entries(pagamentosGrafico).sort((a, b) => b[1] - a[1]);

  const getSVGSegments = () => {
    if (totalDespesasAtivas === 0) return [];
    const dadosArray = abaGrafico === 0 ? despesasArray : pagamentosArray;
    const coresMapa = abaGrafico === 0 ? coresDinamicas : coresPagamento; // Puxa do estado de cores atualizado
    
    let cumulativePercent = 0;
    return dadosArray.map(([key, value]) => {
      const percent = ((Number(value) || 0) / totalDespesasAtivas) * 100;
      const dasharray = `${percent} ${100 - percent}`;
      const dashoffset = 25 - cumulativePercent; 
      cumulativePercent += percent;
      
      return {
        key,
        value,
        percent,
        dasharray,
        dashoffset,
        color: coresMapa[key] || '#6b7280'
      };
    });
  };

  const svgSegments = getSVGSegments();

  const handleTouchStart = (e) => {
    if (!e.targetTouches || e.targetTouches.length === 0) return;
    setSwipeEnd(null);
    setSwipeStart(e.targetTouches[0].clientX);
    
    swipeCoords.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    };
  }

  const handleTouchMove = (e) => {
    if (!e.targetTouches || e.targetTouches.length === 0) return;
    setSwipeEnd(e.targetTouches[0].clientX);

    const diffX = Math.abs(e.targetTouches[0].clientX - swipeCoords.current.x);
    const diffY = Math.abs(e.targetTouches[0].clientY - swipeCoords.current.y);

    if (diffX > diffY) {
      e.stopPropagation(); 
    }
  }

  const handleTouchEnd = () => {
    if (!swipeStart || !swipeEnd) return;
    const distance = swipeStart - swipeEnd;
    
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && abaGrafico === 0) {
      setAbaGrafico(1); 
    }
    if (isRightSwipe && abaGrafico === 1) {
      setAbaGrafico(0); 
    }
    
    setSwipeStart(null);
    setSwipeEnd(null);
  }

  const handleAbrirEdicao = () => {
    setTransacaoParaEditar(transacaoSelecionada);
    setTransacaoSelecionada(null); 
    setShowBottomSheet(true);      
  };

  // ==== AQUI ESTÁ A SEGUNDA CORREÇÃO IMPORTANTE ====
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
      categoriaId: transacaoSelecionada.categoriaId || 10, // USA O ID ORIGINAL SALVO!
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

  const dashboardTickerText = (
  <>
    <span>⚠️ ALERTA DE GASTO 🛍️ Se você não comprar nada, o desconto é de 100%!</span>
    <span>⚠️ ALERTA DE GASTO 🛍️ Se você não comprar nada, o desconto é de 100%!</span>
  </>
  );

  const handleRefresh = async () => {
    if (navigator.vibrate) {
      navigator.vibrate(50); 
    }
    
    setIsRefreshingUI(true);

    try {
      await Promise.all([
        carregarCartoes(),
        carregarTransacoes()
      ]);
    } catch (error) {
      console.error("Erro ao atualizar os dados no pull-to-refresh:", error);
    } finally {
      setIsRefreshingUI(false);
      setIsChartAnimating(true);
      setTimeout(() => setIsChartAnimating(false), 800);
    }
  };

  return (
    <div style={{ backgroundColor: isDark ? '#121214' : '#f0f2f5', minHeight: '100vh', transition: 'background-color 0.3s ease' }}>
      <PullToRefresh 
        onRefresh={handleRefresh}
        pullDownThreshold={60} 
        maxPullDownDistance={95} 
        pullingContent={
          <div style={{ height: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: isDark ? '#adb5bd' : '#6c757d', fontSize: '13px', opacity: 0.7 }}>
            <div className="spinner-inter" style={{ animation: 'none', borderColor: 'transparent', borderTopColor: '#8b5cf6', marginBottom: '4px' }}></div>
            <span>Puxe para atualizar...</span>
          </div>
        }
        refreshingContent={
          <div style={{ height: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: isDark ? '#adb5bd' : '#6c757d', fontSize: '13px' }}>
            <div className="spinner-inter" style={{ marginBottom: '4px' }}></div>
            <span>Atualizando dados...</span>
          </div>
        }
      >
        <div className="app-container pt-4 px-3" style={{ minHeight: '100vh', overflowX: 'hidden' }}>
          <style>{`
            .flip-container { perspective: 1000px; cursor: pointer; }
            .flip-card-inner { position: relative; width: 100%; min-height: 210px; transition: transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1); transform-style: preserve-3d; }
            .flip-card-front, .flip-card-back { position: absolute; top: 0; left: 0; width: 100%; height: 100%; backface-visibility: hidden; border-radius: 1rem; }
            .flip-card-front { transform: rotateY(0deg); }
            .flip-card-back { transform: rotateY(180deg); }
            .custom-range::-webkit-slider-thumb { background: #8b5cf6; }
            .input-valor-despesa::placeholder { color: rgba(255,255,255,0.4) !important; }
            .input-valor-receita::placeholder { color: rgba(16, 185, 129, 0.4) !important; }
            .typing-indicator { display: inline-flex; align-items: center; justify-content: center; gap: 3px; margin-left: 2px; }
            .typing-indicator span { width: 5px; height: 5px; background-color: currentColor; border-radius: 50%; animation: wave-dots 1.2s infinite ease-in-out; }
            .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
            .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }
            .typing-indicator span:nth-child(3) { animation-delay: 0s; }
            @keyframes wave-dots { 0%, 80%, 100% { transform: translateY(0) scale(0.8); opacity: 0.6; } 40% { transform: translateY(-3px) scale(1.2); opacity: 1; } }
            .btn-status-anim { animation: pop-status 0.3s ease; }
            @keyframes pop-status { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }
            .transaction-list-item { transition: all 0.3s ease; }
            .svg-chart-circle { transition: stroke-dashoffset 1s cubic-bezier(0.25, 1, 0.5, 1), stroke-width 0.3s ease, opacity 0.3s ease, transform 0.4s cubic-bezier(0.25, 1, 0.5, 1); transform-origin: center; }
            .svg-chart-circle-hovered { transform: scale(1.03); stroke-width: 6; opacity: 1 !important; z-index: 10; }
            .svg-chart-circle-dimmed { opacity: 0.15; transform: scale(0.98); }
            .swipeable-area { touch-action: pan-y; }
            
            .dashboard-ticker {
              width: 100%;
              overflow: hidden;
              background: ${isDark ? 'rgba(16, 185, 129, 0.03)' : 'rgba(217, 119, 6, 0.05)'};
              border-top: 1px dashed ${isDark ? 'rgba(16, 185, 129, 0.12)' : 'rgba(217, 119, 6, 0.25)'};
              border-bottom: 1px dashed ${isDark ? 'rgba(16, 185, 129, 0.12)' : 'rgba(217, 119, 6, 0.25)'};
              padding: 4px 0;
              margin: 0 0 0.6rem 0;
              display: flex;
              white-space: nowrap;
            }
            .dashboard-ticker-content {
              display: inline-block;
              animation: ticker-scroll 20s linear infinite;
              color: ${isDark ? '#fae902be' : '#d97706'}; 
              font-family: monospace, sans-serif;
              font-size: 0.68rem;
              letter-spacing: 1px;
              text-transform: uppercase;
              opacity: 0.9;
            }
            .dashboard-ticker-content span { margin: 0 14px; }
            @keyframes ticker-scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }

            /* MAGICA DO CARROSSEL DE CARTÕES */
            .carrossel-cartoes {
              display: flex;
              overflow-x: auto;
              scroll-snap-type: x mandatory;
              scrollbar-width: none;
              -ms-overflow-style: none;
              gap: 16px;
              padding-bottom: 10px;
              margin: 0 -1rem 0.5rem -1rem;
              padding-left: 1rem;
              padding-right: 1rem;
              scroll-behavior: smooth;
            }
            .carrossel-cartoes::-webkit-scrollbar { display: none; }
            
            .carrossel-cartoes.modo-saldo-livre {
              overflow-x: hidden;
              scroll-snap-type: none;
              padding-left: 0;
              padding-right: 0;
              margin-left: 0;
              margin-right: 0;
            }
            .carrossel-cartoes.modo-saldo-livre .carrossel-item {
              flex: 0 0 100% !important;
              display: none;
            }
            .carrossel-cartoes.modo-saldo-livre .carrossel-item.ativo {
              display: block !important;
            }

            .carrossel-item {
              flex: 0 0 92%;
              scroll-snap-align: center;
              transition: transform 0.4s cubic-bezier(0.4, 0.0, 0.2, 1), opacity 0.4s ease;
            }
            
            .carrossel-item.inativo {
              opacity: 0.5;
              transform: scale(0.95);
            }
            .carrossel-item.ativo {
              opacity: 1;
              transform: scale(1);
            }

            .flip-card-front > div {
              height: 100%;
            }

            /* MÁGICA DO SKELETON LOADING (WIREFRAME) */
            .skeleton-pulse {
              animation: skeleton-loading 1.2s infinite alternate;
            }
            @keyframes skeleton-loading {
              0% { background-color: ${isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.05)'}; }
              100% { background-color: ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.15)'}; }
            }
            .skeleton-box {
              border-radius: 12px;
              width: 100%;
              margin-bottom: 16px;
            }

            /* SPINNER TIPO BANCO INTER */
            .spinner-inter {
              width: 26px;
              height: 26px;
              border: 3px solid ${isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.2)'};
              border-top-color: #10b981;
              border-radius: 50%;
              animation: spin-inter 0.85s linear infinite;
            }
            @keyframes spin-inter {
              to { transform: rotate(360deg); }
            }
          `}</style>

          <Header usuarioLogado={usuarioLogado} showBalance={showBalance} setShowBalance={setShowBalance} setShowProfile={setShowProfile} temaAtual={temaAtual} />
          
          {isRefreshingUI ? (
            <div className="skeleton-container w-100" style={{ paddingBottom: '80px' }}>
              <div className="skeleton-pulse skeleton-box" style={{ height: '210px', borderRadius: '1rem', marginTop: '0.5rem' }}></div>
              <div className="skeleton-pulse skeleton-box" style={{ height: '24px', borderRadius: '4px', marginTop: '0.5rem', marginBottom: '1rem' }}></div>
              <div className="skeleton-pulse skeleton-box" style={{ height: '180px', borderRadius: '1rem' }}></div>
              <div className="mt-4">
                <div className="skeleton-pulse skeleton-box" style={{ height: '65px', borderRadius: '12px' }}></div>
                <div className="skeleton-pulse skeleton-box" style={{ height: '65px', borderRadius: '12px' }}></div>
                <div className="skeleton-pulse skeleton-box" style={{ height: '65px', borderRadius: '12px' }}></div>
                <div className="skeleton-pulse skeleton-box" style={{ height: '65px', borderRadius: '12px' }}></div>
              </div>
            </div>
          ) : (
            <>
              <div 
                className={`carrossel-cartoes ${!isCardFlipped ? 'modo-saldo-livre' : 'modo-cartoes'}`} 
                onScroll={isCardFlipped ? handleScrollCartoes : undefined}
                onTouchStart={handleHorizontalSwipeStart}
                onTouchMove={handleHorizontalSwipeMove}
                ref={carrosselRef}
              >
                {meusCartoes.map((cartao, index) => {
                  const { total, status, mesVencimentoFatura, nomeMesVencimentoFatura } = calcularDadosFatura(cartao);
                  const isAtivo = index === cartaoAtivoIndex;
                  
                  return (
                    <div 
                      className={`carrossel-item ${isAtivo ? 'ativo' : 'inativo'}`} 
                      key={cartao.id || index}
                      id={`cartao-idx-${index}`}
                      onClickCapture={(e) => {
                        if (!isAtivo && isCardFlipped) {
                          e.stopPropagation();
                          e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                          setCartaoAtivoIndex(index);
                        }
                      }}
                    >
                      <FlipCard 
                        isCardFlipped={isCardFlipped} 
                        setIsCardFlipped={handleToggleFlip} 
                        showBalance={showBalance} 
                        saldoAtual={saldoAtual} 
                        receitasDoMes={receitasDoMes} 
                        despesasDoMes={despesasDoMes} 
                        mesFiltro={mesFiltro} 
                        corCartao={mapaCoresCartao[cartao.corCartao] || cartao.corCartao} 
                        apelidoCartao={cartao.apelidoCartao} 
                        diaVencimento={cartao.diaVencimento} 
                        diaFechamento={cartao.diaFechamento} 
                        finalCartao={cartao.finalCartao} 
                        nomeCartao={(usuarioLogado?.nome || 'USUÁRIO').toUpperCase()} 
                        bandeiraCartao={cartao.bandeiraCartao} 
                        totalFaturaMes={total} 
                        statusFatura={status} 
                        mesVencimentoFatura={mesVencimentoFatura}
                        nomeMesVencimentoFatura={nomeMesVencimentoFatura}
                        setShowCardSettings={setShowCardSettings} 
                        setTempDiaVencimento={setTempDiaVencimento} 
                        setTempDiaFechamento={setTempDiaFechamento} 
                        setTempCor={setTempCor} 
                        setTempApelido={setTempApelido} 
                        setTempFinal={setTempFinal} 
                        setTempBandeira={setTempBandeira} 
                        setTempNome={() => {}}
                        temaAtual={temaAtual} 
                      />
                    </div>
                  );
                })}

                {isCardFlipped && (
                  <div className="carrossel-item item-adicionar d-flex align-items-center">
                    <div 
                      className="w-100 d-flex flex-column align-items-center justify-content-center"
                      style={{ 
                        minHeight: '210px', 
                        borderRadius: '1rem', 
                        border: `2px dashed ${isDark ? '#495057' : '#ced4da'}`, 
                        cursor: 'pointer', 
                        color: isDark ? '#adb5bd' : '#6c757d',
                        backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'
                      }}
                      onClick={async () => {
                        if (meusCartoes.length >= 3) {
                          alert("Você atingiu o limite máximo de 3 cartões cadastrados.");
                          return;
                        }

                        try {
                          const rascunhoCartao = {
                            id: 0,
                            usuarioId: usuarioLogado.id,
                            nome: 'Novo Cartão',
                            ultimosDigitos: '0000',
                            bandeira: 'Selecionar',
                            limiteTotal: 0,
                            diaVencimento: 0,
                            diaFechamento: 0,
                            corFundo: 'roxo',
                            corTexto: '#FFFFFF'
                          };

                          const response = await api.post('/Cartoes', rascunhoCartao);
                          const cartaoCriado = response.data;

                          await carregarCartoes();
                          
                          const novaListaResp = await api.get(`/Cartoes/usuario/${usuarioLogado.id}`);
                          const indexCriado = novaListaResp.data.findIndex(c => c.id === cartaoCriado.id);

                          setTempApelido('Novo Cartão');
                          setTempFinal('0000');
                          setTempLimite('');
                          setTempBandeira('Selecionar');
                          setTempDiaVencimento('00');
                          setTempDiaFechamento('00');
                          setTempCor('roxo');

                          if (indexCriado !== -1) {
                            setCartaoAtivoIndex(indexCriado);
                            setTimeout(() => {
                              const el = document.getElementById(`cartao-idx-${indexCriado}`);
                              if (el && carrosselRef.current) {
                                carrosselRef.current.scrollTo({
                                  left: el.offsetLeft - (carrosselRef.current.offsetWidth - el.offsetWidth) / 2,
                                  behavior: 'smooth'
                                });
                              }
                            }, 50);
                          }
                          setShowCardSettings(true);

                        } catch (error) {
                          console.error("Erro ao criar rascunho de cartão:", error);
                          alert("Erro ao iniciar cadastro de novo cartão.");
                        }
                      }}
                    >
                      <div className="rounded-circle d-flex align-items-center justify-content-center mb-2" style={{ width: '45px', height: '45px', backgroundColor: isDark ? '#2b2b31' : '#e9ecef' }}>
                         <span style={{ fontSize: '26px', lineHeight: '0', marginBottom: '4px' }}>+</span>
                      </div>
                      <span className="fw-bold small text-center">Adicionar cartão</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="dashboard-ticker">
                <div className="dashboard-ticker-content">
                  {dashboardTickerText}
                  {dashboardTickerText}
                </div>
              </div>

              <DonutChart isCardFlipped={isCardFlipped} abaGrafico={abaGrafico} handleTouchStart={handleTouchStart} handleTouchMove={handleTouchMove} handleTouchEnd={handleTouchEnd} totalDespesasAtivas={totalDespesasAtivas} svgSegments={svgSegments} hoveredCategory={hoveredCategory} setHoveredCategory={setHoveredCategory} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} isChartAnimating={isChartAnimating} showBalance={showBalance} despesasGrafico={despesasGrafico} pagamentosGrafico={pagamentosGrafico} despesasArray={despesasArray} pagamentosArray={pagamentosArray} historicoData={historicoData} maxFaturaHist={maxFaturaHist} listaMeses={listaMeses} setMesFiltro={setMesFiltro} temaAtual={temaAtual} cores={coresDinamicas}/>
              <TransactionList termoBusca={termoBusca} setTermoBusca={setTermoBusca} selectedCategory={selectedCategory} isCardFlipped={isCardFlipped} abaGrafico={abaGrafico} mesFiltro={mesFiltro} setShowMonthSelector={setShowMonthSelector} transacoesAgrupadas={transacoesAgrupadas} setTransacaoSelecionada={setTransacaoSelecionada} setMenuAcaoDetalhes={setMenuAcaoDetalhes} showBalance={showBalance} obterIconeCategoria={obterIconeCategoria} temaAtual={temaAtual} />
            </>
          )}

          <BottomNav handleGoHome={handleGoHome} setShowBottomSheet={setShowBottomSheet} setIsCardFlipped={setIsCardFlipped} temaAtual={temaAtual} />
          <OffcanvasMenu showProfile={showProfile} setShowProfile={setShowProfile} usuarioLogado={usuarioLogado} handleLogout={() => { setShowProfile(false); handleLogout(); }} temaAtual={temaAtual} toggleTema={toggleTema} />
          
          <CardSettings 
            showCardSettings={showCardSettings} 
            setShowCardSettings={setShowCardSettings} 
            diaVencimento={cartaoAtivo.diaVencimento} 
            diaFechamento={cartaoAtivo.diaFechamento} 
            corCartao={mapaCoresCartao[cartaoAtivo.corCartao] || cartaoAtivo.corCartao} 
            apelidoCartao={cartaoAtivo.apelidoCartao} 
            finalCartao={cartaoAtivo.finalCartao} 
            bandeiraCartao={cartaoAtivo.bandeiraCartao} 
            tempDiaVencimento={tempDiaVencimento} 
            setTempDiaVencimento={setTempDiaVencimento} 
            tempDiaFechamento={tempDiaFechamento} 
            setTempDiaFechamento={setTempDiaFechamento} 
            tempCor={tempCor} 
            setTempCor={setTempCor} 
            tempApelido={tempApelido} 
            setTempApelido={setTempApelido} 
            tempFinal={tempFinal} 
            setTempFinal={setTempFinal} 
            tempBandeira={tempBandeira} 
            setTempBandeira={setTempBandeira} 
            tempLimite={tempLimite}         
            setTempLimite={setTempLimite}   
            handleSalvarConfigCartao={handleSalvarConfigCartao} 
            cartaoId={cartaoAtivo.id}
            onDeletarCartao={() => carregarCartoes()}
            temaAtual={temaAtual}
            onAtualizarCartaoTemp={handleAtualizarCartaoTemp}
          />
          
          <MonthSelector showMonthSelector={showMonthSelector} setShowMonthSelector={setShowMonthSelector} listaMeses={listaMeses} mesFiltro={mesFiltro} setMesFiltro={setMesFiltro} setTermoBusca={setTermoBusca} setSelectedCategory={setSelectedCategory} temaAtual={temaAtual} />
          <TransactionForm 
            showBottomSheet={showBottomSheet} 
            setShowBottomSheet={setShowBottomSheet} 
            usuarioLogado={usuarioLogado} 
            carregarTransacoes={carregarTransacoes} 
            transacaoParaEditar={transacaoParaEditar} 
            setTransacaoParaEditar={setTransacaoParaEditar} 
            meusCartoes={meusCartoes} 
            temaAtual={temaAtual} 
          />
          <TransactionDetails transacaoSelecionada={transacaoSelecionada} setTransacaoSelecionada={setTransacaoSelecionada} menuAcaoDetalhes={menuAcaoDetalhes} setMenuAcaoDetalhes={setMenuAcaoDetalhes} showBalance={showBalance} obterIconeCategoria={obterIconeCategoria} animatingStatusId={animatingStatusId} handleToggleStatusPagamento={handleToggleStatusPagamento} handleAbrirEdicao={handleAbrirEdicao} handleEfetuarExclusao={handleEfetuarExclusao} isDeleting={isDeleting} temaAtual={temaAtual} meusCartoes={meusCartoes} />
        </div>
      </PullToRefresh>
    </div>
  );
}

export default Dashboard;