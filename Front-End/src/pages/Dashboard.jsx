import React, { useState, useEffect, useMemo, useContext } from 'react';
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
  coresPagamento 
} from '../utils/constants';
import { isPastOrToday } from '../utils/dateUtils';

function Dashboard() {
  const TRANSACOES_API_URL = '/Transacoes';

  const { usuarioLogado, isLoggedIn, handleLogout } = useContext(AuthContext);

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

  // ==========================================
  // ESTADOS DO CARTÃO 
  // ==========================================
  const [diaVencimento, setDiaVencimento] = useState('00'); 
  const [diaFechamento, setDiaFechamento] = useState('00'); 
  const [corCartao, setCorCartao] = useState('linear-gradient(135deg, #8A05BE 0%, #4c0677 100%)'); 
  const [apelidoCartao, setApelidoCartao] = useState('Cartão Principal');
  const [finalCartao, setFinalCartao] = useState('0000');
  const [nomeCartao, setNomeCartao] = useState('SEU NOME');
  const [bandeiraCartao, setBandeiraCartao] = useState('Mastercard'); 

  useEffect(() => {
    if (usuarioLogado) {
      const savedCardSettings = localStorage.getItem(`firmo_card_${usuarioLogado.id}`);
      if (savedCardSettings) {
        const parsedSettings = JSON.parse(savedCardSettings);
        setDiaVencimento(parsedSettings.diaVencimento || '00');
        setDiaFechamento(parsedSettings.diaFechamento || '00');
        setCorCartao(parsedSettings.corCartao || 'linear-gradient(135deg, #8A05BE 0%, #4c0677 100%)');
        setApelidoCartao(parsedSettings.apelidoCartao || 'Cartão Principal');
        setFinalCartao(parsedSettings.finalCartao || '0000');
        setNomeCartao(parsedSettings.nomeCartao || (usuarioLogado?.nome || 'SEU NOME').toUpperCase());
        setBandeiraCartao(parsedSettings.bandeiraCartao || 'Mastercard');
      } else {
        setNomeCartao((usuarioLogado?.nome || 'SEU NOME').toUpperCase());
      }
    }
  }, [usuarioLogado]);

  const [tempDiaVencimento, setTempDiaVencimento] = useState('');
  const [tempDiaFechamento, setTempDiaFechamento] = useState('');
  const [tempCor, setTempCor] = useState('');
  const [tempApelido, setTempApelido] = useState('');
  const [tempFinal, setTempFinal] = useState('');
  const [tempNome, setTempNome] = useState('');
  const [tempBandeira, setTempBandeira] = useState('');

  const handleSalvarConfigCartao = () => {
    const vVenc = String(tempDiaVencimento || '00').padStart(2, '0');
    const vFech = String(tempDiaFechamento || '00').padStart(2, '0');
    const vNome = (tempNome || 'SEU NOME').toUpperCase();
    
    setDiaVencimento(vVenc);
    setDiaFechamento(vFech);
    setCorCartao(tempCor);
    setApelidoCartao(tempApelido || 'Cartão Principal');
    setFinalCartao(tempFinal || '0000');
    setNomeCartao(vNome);
    setBandeiraCartao(tempBandeira || 'Mastercard');
    
    if (usuarioLogado) {
      localStorage.setItem(`firmo_card_${usuarioLogado.id}`, JSON.stringify({
        diaVencimento: vVenc,
        diaFechamento: vFech,
        corCartao: tempCor,
        apelidoCartao: tempApelido || 'Cartão Principal',
        finalCartao: tempFinal || '0000',
        nomeCartao: vNome,
        bandeiraCartao: tempBandeira || 'Mastercard'
      }));
    }
    setShowCardSettings(false);
  };

  // ==========================================
  // ESTADOS DE MICROINTERAÇÃO E DINAMICIDADE
  // ==========================================
  const [hoveredCategory, setHoveredCategory] = useState(null); 
  const [selectedCategory, setSelectedCategory] = useState(null); 
  const [animatingStatusId, setAnimatingStatusId] = useState(null); 
  
  const [swipeStart, setSwipeStart] = useState(null);
  const [swipeEnd, setSwipeEnd] = useState(null);
  const minSwipeDistance = 50;

  const [isChartAnimating, setIsChartAnimating] = useState(true); 

  // ==========================================
  // INTELIGÊNCIA E GERAÇÃO DA LISTA DE MESES
  // ==========================================
  const getMesFatura = (dataStr) => {
    const partes = (dataStr || '').split('/');
    if (partes.length !== 3) return null;
    let dia = parseInt(partes[0], 10);
    let mes = parseInt(partes[1], 10);
    let ano = parseInt(partes[2], 10);
    const fechamento = parseInt(diaFechamento, 10);

    if (fechamento > 0 && dia >= fechamento) {
      mes += 1;
      if (mes > 12) {
        mes = 1;
        ano += 1;
      }
    }
    return { num: String(mes).padStart(2, '0'), ano: String(ano) };
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
            const fatura = getMesFatura(t.data);
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
  }, [transacoes, diaFechamento]);

  const [mesFiltro, setMesFiltro] = useState(() => {
    const hoje = new Date();
    const nomesMeses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return {
      num: String(hoje.getMonth() + 1).padStart(2, '0'),
      ano: String(hoje.getFullYear()),
      nome: nomesMeses[hoje.getMonth()]
    };
  });

  const handleGoHome = () => {
    setTermoBusca('');
    setSelectedCategory(null);
    setHoveredCategory(null);
    setIsCardFlipped(false);
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
  }, [mesFiltro, abaGrafico, isCardFlipped]);

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

  const carregarTransacoes = async () => {
    if (!isLoggedIn || !usuarioLogado) return;
    try {
      const response = await api.get(`${TRANSACOES_API_URL}/usuario/${usuarioLogado.id}`);
      
      const transacoesDoBanco = response.data.map(t => {
        const dataStr = t.dataTransacao || new Date().toISOString();
        const dataQuebrada = dataStr.split('T');
        const dataBruta = dataQuebrada[0].split('-'); 
        const dataCerta = dataBruta.length === 3 ? `${dataBruta[2]}/${dataBruta[1]}/${dataBruta[0]}` : '01/01/2000';
        const horaCerta = dataQuebrada[1] ? dataQuebrada[1].substring(0, 5) : '00:00';
        
        return {
          id: t.id,
          titulo: t.descricao || 'Lançamento sem título',
          categoria: mapaCategoriasAPIReverse[t.categoriaId] || 'Outros',
          pagamento: mapaContasAPIReverse[t.contaOrigemId] || mapaContasAPIReverse[t.contaDestinoId] || 'Pix',
          observacao: t.observacao || '',
          data: dataCerta,
          hora: horaCerta,
          valor: Number(t.valor) || 0,
          tipo: t.tipo || 'despesa',
          recorrente: t.ehRecorrente || false,
          pago: t.pago !== undefined ? t.pago : true 
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

  // Lógica de Separação (Contábil) - Extrato X Fatura X Gráficos
  const transacoesDaAbaAtiva = transacoes.filter(t => {
    if (isCardFlipped) {
      if (t.pagamento === 'Crédito') {
        const fatura = getMesFatura(t.data);
        return fatura && fatura.num === mesFiltro.num && fatura.ano === mesFiltro.ano;
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

  // Cálculos Financeiros
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

  const totalFaturaMes = transacoes.filter(t => {
    if (t.pagamento === 'Crédito' && t.tipo === 'despesa') {
      const fatura = getMesFatura(t.data);
      return fatura && fatura.num === mesFiltro.num && fatura.ano === mesFiltro.ano;
    }
    return false;
  }).reduce((acc, t) => acc + (Number(t.valor) || 0), 0);

  const mesVencimentoFatura = String((Number(mesFiltro.num) % 12) + 1).padStart(2, '0');

  const calcularStatusFatura = () => {
    const hoje = new Date();
    const mesAtual = hoje.getMonth() + 1;
    const anoAtual = hoje.getFullYear();
    const diaAtual = hoje.getDate();

    const fMes = Number(mesFiltro.num);
    const fAno = Number(mesFiltro.ano);

    let mesVenc = fMes + 1;
    let anoVenc = fAno;
    if (mesVenc > 12) {
      mesVenc = 1;
      anoVenc++;
    }

    if (anoAtual > anoVenc || (anoAtual === anoVenc && mesAtual > mesVenc) || (anoAtual === anoVenc && mesAtual === mesVenc && diaAtual > Number(diaVencimento))) {
      return { texto: 'Paga', cor: 'text-emerald' };
    } 
    else if (anoAtual > fAno || (anoAtual === fAno && mesAtual > fMes)) {
      return { texto: 'Fechada', cor: 'text-danger' };
    } 
    else {
      return { texto: 'Aberta', cor: 'text-warning' }; 
    }
  };
  const statusFatura = calcularStatusFatura();

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
      default: return <FiTag size={18} />;
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
           const fatura = getMesFatura(t.data);
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
    const coresMapa = abaGrafico === 0 ? coresCategorias : coresPagamento;
    
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
  }

  const handleTouchMove = (e) => {
    if (!e.targetTouches || e.targetTouches.length === 0) return;
    setSwipeEnd(e.targetTouches[0].clientX);
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
      categoriaId: mapaCategoriasAPI[transacaoSelecionada.categoria] || 10,
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

        await Promise.all(transacoesParaExcluir.map(t => api.delete(`${TRANSACOES_API_URL}/${t.id}`)));

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
      <span>🔮 BUGS FORAM PREVISTOS NESTA VERSÃO DO FIRMO  💰 Dica: A melhor forma de economizar é não sair de casa, não comer, não beber e não viver. Siga-me para mais dicas!</span>
      <span>🔮 BUGS FORAM PREVISTOS NESTA VERSÃO DO FIRMO  💰 Dica: A melhor forma de economizar é não sair de casa, não comer, não beber e não viver. Siga-me para mais dicas!</span>
    </>
  );

  return (
    <div className="app-container pt-4 px-3">
      <style>{`
        .flip-container { perspective: 1000px; margin-bottom: 0.5rem; cursor: pointer; }
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
        
        /* Letreiro bem fino, compacto e ajustado entre os cards */
        .dashboard-ticker {
          width: 100%;
          overflow: hidden;
          background: rgba(16, 185, 129, 0.03);
          border-top: 1px dashed rgba(16, 185, 129, 0.12);
          border-bottom: 1px dashed rgba(16, 185, 129, 0.12);
          padding: 4px 0;
          margin: 0.4rem 0 0.6rem 0;
          display: flex;
          white-space: nowrap;
        }
        .dashboard-ticker-content {
          display: inline-block;
          animation: ticker-scroll 40s linear infinite;
          color: #fae902be;
          font-family: monospace, sans-serif;
          font-size: 0.68rem;
          letter-spacing: 1px;
          text-transform: uppercase;
          opacity: 0.9;
        }
        .dashboard-ticker-content span {
          margin: 0 14px;
        }
        @keyframes ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      <Header usuarioLogado={usuarioLogado} showBalance={showBalance} setShowBalance={setShowBalance} setShowProfile={setShowProfile} />
      <FlipCard isCardFlipped={isCardFlipped} setIsCardFlipped={setIsCardFlipped} showBalance={showBalance} saldoAtual={saldoAtual} receitasDoMes={receitasDoMes} despesasDoMes={despesasDoMes} mesFiltro={mesFiltro} corCartao={corCartao} apelidoCartao={apelidoCartao} diaVencimento={diaVencimento} diaFechamento={diaFechamento} finalCartao={finalCartao} nomeCartao={nomeCartao} bandeiraCartao={bandeiraCartao} totalFaturaMes={totalFaturaMes} statusFatura={statusFatura} mesVencimentoFatura={mesVencimentoFatura} setShowCardSettings={setShowCardSettings} setTempDiaVencimento={setTempDiaVencimento} setTempDiaFechamento={setTempDiaFechamento} setTempCor={setTempCor} setTempApelido={setTempApelido} setTempFinal={setTempFinal} setTempNome={setTempNome} setTempBandeira={setTempBandeira} />
      
      {/* LETREIRO INTERMEDIÁRIO MAIS FINO E COM O NOVO TEXTO */}
      <div className="dashboard-ticker">
        <div className="dashboard-ticker-content">
          {dashboardTickerText}
          {dashboardTickerText}
        </div>
      </div>

      <DonutChart isCardFlipped={isCardFlipped} abaGrafico={abaGrafico} handleTouchStart={handleTouchStart} handleTouchMove={handleTouchMove} handleTouchEnd={handleTouchEnd} totalDespesasAtivas={totalDespesasAtivas} svgSegments={svgSegments} hoveredCategory={hoveredCategory} setHoveredCategory={setHoveredCategory} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} isChartAnimating={isChartAnimating} showBalance={showBalance} despesasGrafico={despesasGrafico} pagamentosGrafico={pagamentosGrafico} despesasArray={despesasArray} pagamentosArray={pagamentosArray} historicoData={historicoData} maxFaturaHist={maxFaturaHist} listaMeses={listaMeses} setMesFiltro={setMesFiltro} />
      <TransactionList termoBusca={termoBusca} setTermoBusca={setTermoBusca} selectedCategory={selectedCategory} isCardFlipped={isCardFlipped} abaGrafico={abaGrafico} mesFiltro={mesFiltro} setShowMonthSelector={setShowMonthSelector} transacoesAgrupadas={transacoesAgrupadas} setTransacaoSelecionada={setTransacaoSelecionada} setMenuAcaoDetalhes={setMenuAcaoDetalhes} showBalance={showBalance} obterIconeCategoria={obterIconeCategoria} />
      <BottomNav handleGoHome={handleGoHome} setShowBottomSheet={setShowBottomSheet} setIsCardFlipped={setIsCardFlipped} />
      <OffcanvasMenu showProfile={showProfile} setShowProfile={setShowProfile} usuarioLogado={usuarioLogado} handleLogout={() => { setShowProfile(false); handleLogout(); }} />
      <CardSettings showCardSettings={showCardSettings} setShowCardSettings={setShowCardSettings} diaVencimento={diaVencimento} diaFechamento={diaFechamento} corCartao={corCartao} apelidoCartao={apelidoCartao} finalCartao={finalCartao} nomeCartao={nomeCartao} bandeiraCartao={bandeiraCartao} tempDiaVencimento={tempDiaVencimento} setTempDiaVencimento={setTempDiaVencimento} tempDiaFechamento={tempDiaFechamento} setTempDiaFechamento={setTempDiaFechamento} tempCor={tempCor} setTempCor={setTempCor} tempApelido={tempApelido} setTempApelido={setTempApelido} tempFinal={tempFinal} setTempFinal={setTempFinal} tempNome={tempNome} setTempNome={setTempNome} tempBandeira={tempBandeira} setTempBandeira={setTempBandeira} handleSalvarConfigCartao={handleSalvarConfigCartao} />
      <MonthSelector showMonthSelector={showMonthSelector} setShowMonthSelector={setShowMonthSelector} listaMeses={listaMeses} mesFiltro={mesFiltro} setMesFiltro={setMesFiltro} setTermoBusca={setTermoBusca} setSelectedCategory={setSelectedCategory} />
      <TransactionForm showBottomSheet={showBottomSheet} setShowBottomSheet={setShowBottomSheet} usuarioLogado={usuarioLogado} carregarTransacoes={carregarTransacoes} transacaoParaEditar={transacaoParaEditar} setTransacaoParaEditar={setTransacaoParaEditar} />
      <TransactionDetails transacaoSelecionada={transacaoSelecionada} setTransacaoSelecionada={setTransacaoSelecionada} menuAcaoDetalhes={menuAcaoDetalhes} setMenuAcaoDetalhes={setMenuAcaoDetalhes} showBalance={showBalance} obterIconeCategoria={obterIconeCategoria} animatingStatusId={animatingStatusId} handleToggleStatusPagamento={handleToggleStatusPagamento} handleAbrirEdicao={handleAbrirEdicao} handleEfetuarExclusao={handleEfetuarExclusao} isDeleting={isDeleting} />
  </div>
  );
}

export default Dashboard;