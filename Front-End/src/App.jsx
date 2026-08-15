import React, { useState, useEffect, useMemo } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Offcanvas } from 'react-bootstrap';
import axios from 'axios';
import './App.css';
import { 
  FiEye, FiEyeOff, FiHome, FiCreditCard, FiPlus, FiUser, FiSettings, 
  FiLogOut, FiChevronRight, FiTag, FiCalendar, FiFileText, 
  FiCoffee, FiTool, FiTruck, FiBookOpen, FiSmile, FiHome as FiHomeIcon, 
  FiDollarSign, FiGift, FiChevronDown, FiSearch, FiClock, FiMoreVertical,
  FiEdit2, FiTrash2, FiLock, FiMail, FiShield, FiBell, FiHelpCircle,
  FiRefreshCw, FiAlertCircle, FiCheckCircle, FiX
} from 'react-icons/fi';

function App() {
  // ==========================================
  // CONSTANTES DA API
  // ==========================================
  const TRANSACOES_API_URL = 'https://financas-api-v5lj.onrender.com/api/Transacoes';
  const USUARIOS_API_URL = 'https://financas-api-v5lj.onrender.com/api/Usuarios';

  // ==========================================
  // ESTADOS DE AUTENTICAÇÃO E LOGIN
  // ==========================================
  const [usuarioLogado, setUsuarioLogado] = useState(() => {
    const savedData = localStorage.getItem('firmo_user');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      axios.defaults.headers.common['Authorization'] = `Bearer ${parsedData.token}`;
      return parsedData.usuario;
    }
    return null;
  });

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!localStorage.getItem('firmo_user');
  });
  
  const [isRegistering, setIsRegistering] = useState(false);
  
  const [emailLogin, setEmailLogin] = useState('');
  const [senhaLogin, setSenhaLogin] = useState('');
  const [loginError, setLoginError] = useState('');

  const [nomeCadastro, setNomeCadastro] = useState('');
  const [emailCadastro, setEmailCadastro] = useState('');
  const [senhaCadastro, setSenhaCadastro] = useState('');
  const [confirmaSenhaCadastro, setConfirmaSenhaCadastro] = useState('');
  const [registerError, setRegisterError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (!emailLogin || !senhaLogin) {
      setLoginError('Preencha e-mail e senha para entrar!');
      return;
    }

    try {
      const response = await axios.post(`${USUARIOS_API_URL}/login`, {
        email: emailLogin,
        senhaHash: senhaLogin 
      });
      
      const { token, usuario } = response.data;

      localStorage.setItem('firmo_user', JSON.stringify({ token, usuario }));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setUsuarioLogado(usuario);
      setIsLoggedIn(true);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setLoginError('E-mail ou senha inválidos. Tente novamente.');
      } else {
        setLoginError('Erro de conexão com o servidor.');
      }
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterError('');

    if (!nomeCadastro || !emailCadastro || !senhaCadastro || !confirmaSenhaCadastro) {
      setRegisterError('Por favor, preencha todos os campos.');
      return;
    }

    if (senhaCadastro !== confirmaSenhaCadastro) {
      setRegisterError('As senhas não coincidem.');
      return;
    }

    try {
      const response = await axios.post(USUARIOS_API_URL, {
        nome: nomeCadastro,
        email: emailCadastro,
        senhaHash: senhaCadastro 
      });

      const { token, usuario } = response.data;

      localStorage.setItem('firmo_user', JSON.stringify({ token, usuario }));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setUsuarioLogado(usuario);
      setIsLoggedIn(true);
    } catch (error) {
      setRegisterError('Erro ao criar conta. Verifique os dados ou o servidor.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('firmo_user');
    delete axios.defaults.headers.common['Authorization'];
    
    setIsLoggedIn(false);
    setUsuarioLogado(null);
    setShowProfile(false); 
    setLoginError('');
    setRegisterError('');
    setEmailLogin('');
    setSenhaLogin('');
  };

  // ==========================================
  // ESTADOS GERAIS DO APP FIRMO
  // ==========================================
  const [showBalance, setShowBalance] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [showMonthSelector, setShowMonthSelector] = useState(false);
  const [transacaoSelecionada, setTransacaoSelecionada] = useState(null);
  const [tipoTransacao, setTipoTransacao] = useState('despesa');
  
  const [menuAcaoDetalhes, setMenuAcaoDetalhes] = useState(0); 
  const [abaGrafico, setAbaGrafico] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [tipoRecorrencia, setTipoRecorrencia] = useState('fixo'); 
  const [qtdParcelas, setQtdParcelas] = useState(2);
  const [pagoInput, setPagoInput] = useState(true);
  
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [showCardSettings, setShowCardSettings] = useState(false);
  const [termoBusca, setTermoBusca] = useState('');
  const [transacoes, setTransacoes] = useState([]);

  // ==========================================
  // ESTADOS E PERSISTÊNCIA DO CARTÃO DE CRÉDITO
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
        setNomeCartao(parsedSettings.nomeCartao || 'SEU NOME');
        setBandeiraCartao(parsedSettings.bandeiraCartao || 'Mastercard');
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

  // FUNÇÃO RESET: Volta tudo ao normal ao clicar na Casinha
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
    
    // Reseta pro mês atual
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

  const [valorInput, setValorInput] = useState('');
  const [tituloInput, setTituloInput] = useState('');
  const [categoriaInput, setCategoriaInput] = useState('');
  const [pagamentoInput, setPagamentoInput] = useState('');
  const [dataInput, setDataInput] = useState(new Date().toISOString().substring(0,10));
  const [observacaoInput, setObservacaoInput] = useState('');
  const [ehRecorrente, setEhRecorrente] = useState(false);
  const [editandoId, setEditandoId] = useState(null); 
  
  const isPastOrToday = (dataStr) => {
    if (!dataStr) return true;
    const partes = dataStr.split('/');
    if (partes.length !== 3) return true;
    const [dia, mes, ano] = partes;
    const dateObj = new Date(ano, mes - 1, dia);
    const hoje = new Date();
    hoje.setHours(23, 59, 59, 999);
    return dateObj <= hoje;
  };

  const isDataInputFuture = (dateString) => {
    if(!dateString) return false;
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    const hojeStr = `${ano}-${mes}-${dia}`;
    return dateString > hojeStr;
  }

  useEffect(() => {
    if (!editandoId && dataInput) {
      setPagoInput(!isDataInputFuture(dataInput));
    }
  }, [dataInput, editandoId]);

  const mapaCategoriasAPI = {
    'Alimentação': 1, 'Moto': 2, 'Carro': 3, 'Educação': 4,
    'Lazer': 5, 'Moradia': 6, 'Salário': 7, 'Vale (VR + VT)': 8,
    'Rendimento': 9, 'Outros': 10
  };

  const mapaContasAPI = {
    'Pix': 2, 'Crédito': 3, 'Débito': 4, 'Dinheiro': 5, 'Boleto': 6
  };

  const mapaCategoriasAPIReverse = Object.fromEntries(Object.entries(mapaCategoriasAPI).map(([key, value]) => [value, key]));
  const mapaContasAPIReverse = Object.fromEntries(Object.entries(mapaContasAPI).map(([key, value]) => [value, key]));

  const carregarTransacoes = async () => {
    if (!isLoggedIn || !usuarioLogado) return;
    try {
      const response = await axios.get(`${TRANSACOES_API_URL}/usuario/${usuarioLogado.id}`);
      
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

  const transacoesDoMes = transacoes.filter(t => {
    if (t.pagamento === 'Crédito') {
      const fatura = getMesFatura(t.data);
      return fatura && fatura.num === mesFiltro.num && fatura.ano === mesFiltro.ano;
    }
    const partes = (t.data || '').split('/');
    if (partes.length === 3) {
      return partes[1] === mesFiltro.num && partes[2] === mesFiltro.ano;
    }
    return true;
  });

  const transacoesDaAbaAtiva = transacoesDoMes.filter(t => {
    if (isCardFlipped) return t.pagamento === 'Crédito';
    return true; 
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

  const formatarCabecalhoData = (dataStr) => {
    const hojeObj = new Date();
    const hoje = hojeObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    
    const ontemObj = new Date(hojeObj);
    ontemObj.setDate(ontemObj.getDate() - 1);
    const ontem = ontemObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

    if (dataStr === hoje) return 'Hoje';
    if (dataStr === ontem) return 'Ontem';
    
    const partes = (dataStr || '').split('/');
    return partes.length === 3 ? `${partes[0]}/${partes[1]}` : dataStr;
  };

  const transacoesParaSaldo = transacoes.filter(t => isPastOrToday(t.data) || t.pago === true);
  const totalReceitasGeral = transacoesParaSaldo.filter(t => t.tipo === 'receita').reduce((acc, t) => acc + (Number(t.valor) || 0), 0);
  const totalDespesasGeral = transacoesParaSaldo.filter(t => t.tipo === 'despesa').reduce((acc, t) => acc + (Number(t.valor) || 0), 0);
  const saldoAtual = totalReceitasGeral - totalDespesasGeral;

  const receitasDoMes = transacoesDoMes.filter(t => t.tipo === 'receita').reduce((acc, t) => acc + (Number(t.valor) || 0), 0);
  const despesasDoMes = transacoesDoMes.filter(t => t.tipo === 'despesa').reduce((acc, t) => acc + (Number(t.valor) || 0), 0);

  const totalFaturaMes = transacoesDoMes.filter(t => t.pagamento === 'Crédito' && t.tipo === 'despesa').reduce((acc, t) => acc + (Number(t.valor) || 0), 0);
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

  const formatarMoeda = (valor) => {
    const num = Number(valor);
    if (isNaN(num) || valor === null || valor === undefined) return 'R$ 0,00';
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const coresCategorias = {
    'Alimentação': '#818cf8',
    'Moto': '#10b981',
    'Carro Clássico': '#f59e0b',
    'Carro': '#f59e0b',
    'Educação': '#3b82f6',
    'Lazer': '#f43f5e',
    'Moradia': '#a855f7',
    'Outros': '#6b7280'
  };

  const coresPagamento = {
    'Pix': '#06b6d4',
    'Crédito': '#ec4899',
    'Débito': '#8b5cf6',
    'Dinheiro': '#eab308',
    'Boleto': '#f97316'
  };

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

  // ==========================================
  // ORDENAÇÃO E PREPARAÇÃO DOS DADOS DO GRÁFICO
  // ==========================================
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

  const despesasGrafico = transacoesDaAbaAtiva
    .filter(t => t.tipo === 'despesa')
    .reduce((acc, t) => {
      acc[t.categoria] = (acc[t.categoria] || 0) + (Number(t.valor) || 0);
      return acc;
    }, {});

  const pagamentosGrafico = transacoesDaAbaAtiva
    .filter(t => t.tipo === 'despesa')
    .reduce((acc, t) => {
      acc[t.pagamento] = (acc[t.pagamento] || 0) + (Number(t.valor) || 0);
      return acc;
    }, {});
    
  const totalDespesasAtivas = transacoesDaAbaAtiva.filter(t => t.tipo === 'despesa').reduce((acc, t) => acc + (Number(t.valor) || 0), 0);

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

  // ==========================================
  // FUNÇÕES DE SWIPE SEGURO
  // ==========================================
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

  const handleValorChange = (e) => {
    const apenasNumeros = e.target.value.replace(/\D/g, ''); 
    if (!apenasNumeros) {
      setValorInput('');
      return;
    }
    const valorFormatado = (parseInt(apenasNumeros, 10) / 100).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    setValorInput(valorFormatado);
  };

  const handleTrocarTipo = (novoTipo) => {
    setTipoTransacao(novoTipo);
    setCategoriaInput('');
  };

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

  const handleAbrirEdicao = () => {
    setValorInput((Number(transacaoSelecionada.valor) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    setTituloInput(transacaoSelecionada.titulo || '');
    setCategoriaInput(transacaoSelecionada.categoria || '');
    setPagamentoInput(transacaoSelecionada.pagamento || '');
    const partes = (transacaoSelecionada.data || '').split('/');
    setDataInput(partes.length === 3 ? `${partes[2]}-${partes[1]}-${partes[0]}` : new Date().toISOString().substring(0,10));
    setObservacaoInput(transacaoSelecionada.observacao || '');
    setTipoTransacao(transacaoSelecionada.tipo || 'despesa');
    setEhRecorrente(transacaoSelecionada.recorrente || false);
    setPagoInput(transacaoSelecionada.pago !== false);
    setEditandoId(transacaoSelecionada.id);

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

    const payload = {
      id: transacaoSelecionada.id,
      usuarioId: usuarioLogado.id,
      contaOrigemId: mapaContasAPI[transacaoSelecionada.pagamento],
      contaDestinoId: null,
      categoriaId: mapaCategoriasAPI[transacaoSelecionada.categoria],
      descricao: transacaoSelecionada.titulo,
      valor: transacaoSelecionada.valor,
      tipo: transacaoSelecionada.tipo,
      dataTransacao: dataSegura,
      pago: novoStatus,
      ehRecorrente: transacaoSelecionada.recorrente,
      observacao: transacaoSelecionada.observacao
    };

    try {
      await axios.put(`${TRANSACOES_API_URL}/${transacaoSelecionada.id}`, payload);
      setTransacoes(transacoes.map(t => t.id === transacaoSelecionada.id ? { ...t, pago: novoStatus } : t));
      setTransacaoSelecionada({ ...transacaoSelecionada, pago: novoStatus });
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      alert("Erro de conexão ao tentar mudar o status de pagamento.");
    }
  };

  const handleConfirmarLancamento = async () => {
    if (isSubmitting) return;

    if (!valorInput || !tituloInput || !categoriaInput || !pagamentoInput) {
      alert("Por favor, preencha o valor, título, categoria e forma de pagamento!");
      return;
    }

    setIsSubmitting(true);

    const valorNumerico = parseFloat(valorInput.replace(/\./g, '').replace(',', '.'));
    const tituloFormatado = (tituloInput || '').trim().toLowerCase().split(/\s+/).map(word => word ? word.charAt(0).toUpperCase() + word.slice(1) : '').join(' ');
    const horaAtual = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const isParcelado = ehRecorrente && tipoRecorrencia === 'parcelado';
    const isFixo = ehRecorrente && tipoRecorrencia === 'fixo';
    
    const parcelas = isParcelado ? qtdParcelas : (isFixo ? 12 : 1);
    const valorFinalTransacao = isParcelado ? (valorNumerico / qtdParcelas) : valorNumerico;

    const payloadParaAPI = {
      id: editandoId || 0,
      usuarioId: usuarioLogado.id, 
      contaOrigemId: mapaContasAPI[pagamentoInput], 
      contaDestinoId: null, 
      categoriaId: mapaCategoriasAPI[categoriaInput],
      valor: valorFinalTransacao,
      tipo: tipoTransacao,
      pago: pagoInput,
      ehRecorrente: ehRecorrente,
      observacao: observacaoInput
    };

    try {
      if (editandoId) {
        const dataHoraLocal = `${dataInput}T${horaAtual}:00`;
        await axios.put(`${TRANSACOES_API_URL}/${editandoId}`, {
          ...payloadParaAPI, 
          descricao: tituloFormatado, 
          dataTransacao: dataHoraLocal 
        });
        
        await carregarTransacoes();
      } else {
        
        for (let i = 0; i < parcelas; i++) {
          const dataParcela = new Date(`${dataInput}T12:00:00`);
          dataParcela.setMonth(dataParcela.getMonth() + i);
          const dataFormatada = dataParcela.toISOString().substring(0, 10);
          
          let tituloFinal = tituloFormatado;
          if (isParcelado) {
            tituloFinal = `${tituloFormatado} (${i + 1}/${parcelas})`;
          }

          const statusPagoParcela = i === 0 ? pagoInput : false;

          const payloadCriacao = { 
            ...payloadParaAPI, 
            descricao: tituloFinal,
            dataTransacao: `${dataFormatada}T${horaAtual}:00`,
            pago: statusPagoParcela
          };
          
          await axios.post(TRANSACOES_API_URL, payloadCriacao);
        }
        
        // Força a recarga de todas as transações para já atualizar a home na hora
        await carregarTransacoes();
      }
      
      setValorInput('');
      setTituloInput('');
      setCategoriaInput('');
      setPagamentoInput('');
      setObservacaoInput('');
      setEhRecorrente(false);
      setTipoRecorrencia('fixo');
      setQtdParcelas(2);
      setPagoInput(true);
      setEditandoId(null);
      setShowBottomSheet(false);
      
    } catch (error) {
      console.error("Erro ao salvar transação:", error);
      alert("Houve um erro ao salvar. Verifique se a API está rodando.");
    } finally {
      setIsSubmitting(false);
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

        await Promise.all(transacoesParaExcluir.map(t => axios.delete(`${TRANSACOES_API_URL}/${t.id}`)));

        await carregarTransacoes();
      } else {
        await axios.delete(`${TRANSACOES_API_URL}/${transacaoSelecionada.id}`);
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

  if (!isLoggedIn) {
    if (isRegistering) {
      return (
        <div className="app-container d-flex flex-column align-items-center justify-content-center px-4" 
             style={{ minHeight: '100vh', background: 'radial-gradient(circle at top, #064e3b 0%, #121214 40%)' }}>
          <div className="w-100" style={{ maxWidth: '400px', zIndex: 1 }}>
            
            <div className="text-center mb-4">
              <h2 className="fw-bold text-white mb-1" style={{ letterSpacing: '1px' }}>Criar Conta</h2>
              <p className="text-light opacity-50">Junte-se ao FIRMO</p>
            </div>

            <form onSubmit={handleRegister} className="card dark-card p-4 shadow-lg border border-secondary border-opacity-25" style={{ background: 'rgba(30, 30, 36, 0.7)', backdropFilter: 'blur(10px)' }}>
              
              {registerError && (
                <div className="alert alert-danger py-2 small text-center border-0" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#f87171' }} role="alert">
                  {registerError}
                </div>
              )}

              <div className="mb-3">
                <label className="form-label text-light opacity-75 small mb-1">Nome Completo</label>
                <div className="input-group">
                  <span className="input-group-text bg-dark border-secondary border-opacity-25 text-light opacity-50"><FiUser /></span>
                  <input 
                    type="text" 
                    className="form-control bg-dark border-secondary border-opacity-25 text-white shadow-none" 
                    placeholder="Seu nome"
                    value={nomeCadastro}
                    onChange={(e) => setNomeCadastro(e.target.value)}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label text-light opacity-75 small mb-1">E-mail</label>
                <div className="input-group">
                  <span className="input-group-text bg-dark border-secondary border-opacity-25 text-light opacity-50"><FiMail /></span>
                  <input 
                    type="email" 
                    className="form-control bg-dark border-secondary border-opacity-25 text-white shadow-none" 
                    placeholder="Seu e-mail"
                    value={emailCadastro}
                    onChange={(e) => setEmailCadastro(e.target.value)}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label text-light opacity-75 small mb-1">Senha</label>
                <div className="input-group">
                  <span className="input-group-text bg-dark border-secondary border-opacity-25 text-light opacity-50"><FiLock /></span>
                  <input 
                    type="password" 
                    className="form-control bg-dark border-secondary border-opacity-25 text-white shadow-none" 
                    placeholder="Crie uma senha"
                    value={senhaCadastro}
                    onChange={(e) => setSenhaCadastro(e.target.value)}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label text-light opacity-75 small mb-1">Confirmar Senha</label>
                <div className="input-group">
                  <span className="input-group-text bg-dark border-secondary border-opacity-25 text-light opacity-50"><FiLock /></span>
                  <input 
                    type="password" 
                    className="form-control bg-dark border-secondary border-opacity-25 text-white shadow-none" 
                    placeholder="Repita a senha"
                    value={confirmaSenhaCadastro}
                    onChange={(e) => setConfirmaSenhaCadastro(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="btn w-100 py-3 rounded-4 fw-bold shadow text-white border-0" style={{ background: 'linear-gradient(to right, #10b981, #059669)' }}>
                Criar Conta
              </button>
            </form>

            <div className="text-center mt-4">
              <p className="text-light opacity-50 small">
                Já tem uma conta? <span onClick={() => setIsRegistering(false)} className="text-emerald fw-bold" style={{ cursor: 'pointer' }}>Entrar</span>
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="app-container d-flex flex-column align-items-center justify-content-center px-4" 
           style={{ minHeight: '100vh', background: 'radial-gradient(circle at top, #064e3b 0%, #121214 40%)' }}>
        <div className="w-100" style={{ maxWidth: '400px', zIndex: 1 }}>
          
          <div className="text-center mb-5">
            <div className="rounded-circle d-flex justify-content-center align-items-center mx-auto mb-3 shadow-lg" 
                 style={{ width: '80px', height: '80px', background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', color: '#fff', fontWeight: 'bold', fontSize: '36px' }}>
              F
            </div>
            <h1 className="fw-bold text-white mb-1" style={{ letterSpacing: '3px' }}>FIRMO</h1>
            <p className="text-light opacity-50" style={{ fontSize: '14px' }}>Controle financeiro pessoal</p>
          </div>

          <form onSubmit={handleLogin} className="card dark-card p-4 shadow-lg border border-secondary border-opacity-25" style={{ background: 'rgba(30, 30, 36, 0.7)', backdropFilter: 'blur(10px)' }}>
            
            {loginError && (
              <div className="alert alert-danger py-2 small text-center border-0" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#f87171' }} role="alert">
                {loginError}
              </div>
            )}

            <div className="mb-3">
              <label className="form-label text-light opacity-75 small mb-1">E-mail</label>
              <div className="input-group">
                <span className="input-group-text bg-dark border-secondary border-opacity-25 text-light opacity-50"><FiMail /></span>
                <input 
                  type="email" 
                  className="form-control bg-dark border-secondary border-opacity-25 text-white shadow-none" 
                  placeholder="Seu e-mail"
                  value={emailLogin}
                  onChange={(e) => setEmailLogin(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label text-light opacity-75 small mb-1">Senha</label>
              <div className="input-group">
                <span className="input-group-text bg-dark border-secondary border-opacity-25 text-light opacity-50"><FiLock /></span>
                <input 
                  type="password" 
                  className="form-control bg-dark border-secondary border-opacity-25 text-white shadow-none" 
                  placeholder="Sua senha"
                  value={senhaLogin}
                  onChange={(e) => setSenhaLogin(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn w-100 py-3 rounded-4 fw-bold shadow text-white border-0" style={{ background: 'linear-gradient(to right, #10b981, #059669)' }}>
              Entrar
            </button>
          </form>

          <div className="text-center mt-4">
            <p className="text-light opacity-50 small">
              Ainda não tem conta? <span onClick={() => setIsRegistering(true)} className="text-emerald fw-bold" style={{ cursor: 'pointer' }}>Criar conta</span>
            </p>
          </div>

        </div>
      </div>
    );
  }

  // ==========================================
  // RENDERIZAÇÃO: TELA PRINCIPAL (APP FIRMO)
  // ==========================================
  return (
    <div className="app-container pt-4 px-3">
      
      <style>{`
        .flip-container {
          perspective: 1000px;
          margin-bottom: 1.5rem;
          cursor: pointer;
        }
        .flip-card-inner {
          position: relative;
          width: 100%;
          min-height: 210px;
          transition: transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1);
          transform-style: preserve-3d;
        }
        .flip-card-front, .flip-card-back {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          border-radius: 1rem;
        }
        .flip-card-front {
          transform: rotateY(0deg);
        }
        .flip-card-back {
          transform: rotateY(180deg);
        }
        .custom-range::-webkit-slider-thumb {
          background: #8b5cf6;
        }

        .input-valor-despesa::placeholder { color: rgba(255,255,255,0.4) !important; }
        .input-valor-receita::placeholder { color: rgba(16, 185, 129, 0.4) !important; }

        /* Animação dos Pontinhos (Loading Wave) */
        .typing-indicator {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 3px;
          margin-left: 2px;
        }
        .typing-indicator span {
          width: 5px;
          height: 5px;
          background-color: currentColor;
          border-radius: 50%;
          animation: wave-dots 1.2s infinite ease-in-out;
        }
        .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
        .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }
        .typing-indicator span:nth-child(3) { animation-delay: 0s; }

        @keyframes wave-dots {
          0%, 80%, 100% { transform: translateY(0) scale(0.8); opacity: 0.6; }
          40% { transform: translateY(-3px) scale(1.2); opacity: 1; }
        }

        /* Efeito Pulo do Botão de Status */
        .btn-status-anim {
           animation: pop-status 0.3s ease;
        }
        @keyframes pop-status {
           0% { transform: scale(1); }
           50% { transform: scale(1.1); }
           100% { transform: scale(1); }
        }

        /* Efeito Lista Transações */
        .transaction-list-item {
          transition: all 0.3s ease;
        }

        /* Animação Premium SVG ("Ease-Out Quart" fluido da Apple) */
        .svg-chart-circle {
          transition: stroke-dashoffset 1s cubic-bezier(0.25, 1, 0.5, 1),
                      stroke-width 0.3s ease,
                      opacity 0.3s ease,
                      transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
          transform-origin: center;
        }
        
        .svg-chart-circle-hovered {
          transform: scale(1.03);
          stroke-width: 6;
          opacity: 1 !important;
          z-index: 10;
        }

        .svg-chart-circle-dimmed {
          opacity: 0.15;
          transform: scale(0.98);
        }
      `}</style>

      {/* HEADER */}
      <header className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <div 
            className="rounded-circle d-flex justify-content-center align-items-center me-3 shadow-sm" 
            style={{ width: '48px', height: '48px', backgroundColor: '#10b981', color: '#121214', fontWeight: 'bold', fontSize: '20px', cursor: 'pointer' }}
            onClick={() => setShowProfile(true)}
          >
            {usuarioLogado?.nome ? usuarioLogado.nome.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <span className="text-emerald small d-block fw-bold" style={{ fontSize: '11px', letterSpacing: '1px' }}>FIRMO APP</span>
            <h5 className="mb-0 fw-bold text-white">Olá, {usuarioLogado?.nome ? usuarioLogado.nome.split(' ')[0] : ''}</h5>
          </div>
        </div>
        <button className="btn btn-link text-light opacity-75 p-0 shadow-none border-0" onClick={() => setShowBalance(!showBalance)}>
          {showBalance ? <FiEye size={24} /> : <FiEyeOff size={24} />}
        </button>
      </header>

      {/* CARD PRINCIPAL COM FLIP */}
      <section className="flip-container" onClick={() => setIsCardFlipped(!isCardFlipped)}>
        <div className="flip-card-inner" style={{ transform: isCardFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
          
          {/* CARTÃO GERAL (AJUSTADO PARA DESCER AS RECEITAS E DESPESAS) */}
          <div className="flip-card-front card dark-card p-4 d-flex flex-column justify-content-between h-100">
            <div>
              <p className="text-light opacity-75 mb-1">Saldo atual livre</p>
              <h1 className="mb-0 fw-bold text-white">
                {showBalance ? formatarMoeda(saldoAtual) : 'R$ •••••••'}
              </h1>
            </div>
            
            <div className="d-flex justify-content-between mt-auto pt-4" style={{ marginBottom: '-8px' }}>
              <div>
                 <small className="text-light opacity-75 d-block mb-1">Receitas ({mesFiltro.nome}) ↙</small>
                 <span className="text-emerald fw-bold">
                   {showBalance ? formatarMoeda(receitasDoMes) : 'R$ •••••'}
                 </span>
              </div>
              <div className="text-end">
                 <small className="text-light opacity-75 d-block mb-1">Despesas ({mesFiltro.nome}) ↗</small>
                 <span className="text-white fw-bold">
                   {showBalance ? formatarMoeda(despesasDoMes) : 'R$ •••••'}
                 </span>
              </div>
            </div>
          </div>

          {/* CARTÃO DE CRÉDITO */}
          <div 
            className="flip-card-back shadow-lg h-100" 
            style={{ 
              background: corCartao, 
              padding: '1.25rem', 
              borderRadius: '1rem',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'space-between'
            }}
          >
              <div className="d-flex justify-content-between align-items-start">
                <span className="text-white fw-bold opacity-75" style={{ fontSize: '1rem', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>{apelidoCartao}</span>
                <button 
                  className="btn btn-link p-0 text-white shadow-none border-0" 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setTempDiaVencimento(diaVencimento);
                    setTempDiaFechamento(diaFechamento);
                    setTempCor(corCartao);
                    setTempApelido(apelidoCartao);
                    setTempFinal(finalCartao);
                    setTempNome(nomeCartao);
                    setTempBandeira(bandeiraCartao);
                    setShowCardSettings(true); 
                  }}
                >
                  <FiMoreVertical size={22} />
                </button>
              </div>

              <div className="text-center my-2">
                <small className="text-light opacity-75 d-block mb-1" style={{ fontSize: '0.8rem' }}>Fatura de {mesFiltro.nome}</small>
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
      </section>

      {/* CARROSSEL DE GRÁFICOS (COM SWIPE SEGURO) */}
      <section className="card dark-card p-4 mb-4">
        
        {/* CABEÇALHO DO CARD DE GRÁFICOS */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <small className="text-light opacity-75 d-block" style={{ fontSize: '11px' }}>
              {isCardFlipped ? 'Este mês (Cartão)' : 'Este mês (Geral)'}
            </small>
            <h6 className="mb-0 fw-bold text-white d-flex align-items-center gap-2">
              {isCardFlipped 
                ? (abaGrafico === 0 ? 'Distribuição por Categoria' : 'Histórico de Faturas') 
                : (abaGrafico === 0 ? 'Distribuição por Categoria' : 'Formas de Pagamento')
              }
            </h6>
          </div>
          
          <div className="d-flex align-items-center gap-3">
            {/* PONTINHOS DO SWIPE INDICATOR */}
            <div className="d-flex align-items-center gap-1 bg-dark bg-opacity-50 px-2 py-1 rounded-pill">
              <span 
                style={{ 
                  width: abaGrafico === 0 ? '16px' : '6px', 
                  height: '6px', 
                  borderRadius: '3px', 
                  backgroundColor: abaGrafico === 0 ? '#10b981' : '#6b7280', 
                  transition: '0.3s'
                }}
              ></span>
              <span 
                style={{ 
                  width: abaGrafico === 1 ? '16px' : '6px', 
                  height: '6px', 
                  borderRadius: '3px', 
                  backgroundColor: abaGrafico === 1 ? '#10b981' : '#6b7280', 
                  transition: '0.3s'
                }}
              ></span>
            </div>
          </div>
        </div>

        {/* CONTAINER DO SWIPE ISOLADO */}
        <div 
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="w-100"
        >
          {/* ABA 0: SEMPRE CATEGORIAS */}
          {abaGrafico === 0 && (
            <div className="d-flex align-items-center justify-content-between mt-3">
              
              {/* O DONUT CHART (SVG) PIZZA NA ESQUERDA */}
              <div 
                style={{ 
                  width: '150px', 
                  height: '150px', 
                  position: 'relative',
                  marginLeft: '-10px'
                }}
              >
                {totalDespesasAtivas === 0 ? (
                  <div className="w-100 h-100 rounded-circle bg-dark d-flex align-items-center justify-content-center border border-secondary border-opacity-25">
                    <FiCoffee className="text-light opacity-25" size={28}/>
                  </div>
                ) : (
                  <>
                    <svg viewBox="0 0 42 42" className="w-100 h-100" style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
                      <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#27272a" strokeWidth="4"></circle>
                      {svgSegments.map(seg => {
                        const isHighlighted = (hoveredCategory === seg.key) || (selectedCategory === seg.key);
                        const isDimmed = (hoveredCategory || selectedCategory) && !isHighlighted;
                        const currentDashOffset = isChartAnimating ? 100 : seg.dashoffset;
                        
                        let circleClass = "svg-chart-circle";
                        if (isHighlighted) circleClass += " svg-chart-circle-hovered";
                        if (isDimmed) circleClass += " svg-chart-circle-dimmed";

                        return (
                          <circle
                            key={seg.key}
                            className={circleClass}
                            cx="21"
                            cy="21"
                            r="15.91549430918954"
                            fill="transparent"
                            stroke={seg.color}
                            strokeWidth="4"
                            strokeDasharray={seg.dasharray}
                            strokeDashoffset={currentDashOffset}
                            style={{ cursor: 'pointer', pointerEvents: 'stroke' }}
                            onMouseEnter={() => setHoveredCategory(seg.key)}
                            onMouseLeave={() => setHoveredCategory(null)}
                            onClick={(e) => { e.stopPropagation(); setSelectedCategory(selectedCategory === seg.key ? null : seg.key); setHoveredCategory(null); }}
                          ></circle>
                        )
                      })}
                    </svg>
                    
                    {/* CENTRO DINÂMICO DA PIZZA */}
                    <div className="position-absolute top-50 start-50 translate-middle text-center w-100 pe-none d-flex flex-column align-items-center justify-content-center" style={{ padding: '0 20px' }}>
                      {hoveredCategory || selectedCategory ? (
                        <>
                          <span className="text-light opacity-75 text-truncate w-100 d-block" style={{fontSize: '11px'}}>{hoveredCategory || selectedCategory}</span>
                          <span className="fw-bold text-white" style={{fontSize: '14px', textShadow: '0px 2px 4px rgba(0,0,0,0.5)'}}>
                            {showBalance ? formatarMoeda((abaGrafico === 0 ? despesasGrafico : pagamentosGrafico)[hoveredCategory || selectedCategory]) : 'R$ •••••'}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-light opacity-50 text-uppercase d-block" style={{fontSize: '10px', letterSpacing: '0.5px'}}>Total</span>
                          <span className="fw-bold text-white" style={{fontSize: '14px'}}>{showBalance ? formatarMoeda(totalDespesasAtivas) : 'R$ •••••'}</span>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* LEGENDA (INTERATIVA E ORDENADA) NA DIREITA */}
              <div className="d-flex flex-column gap-1 text-end" style={{ fontSize: '13px', width: '135px' }}>
                {totalDespesasAtivas === 0 ? (
                  <span className="text-light opacity-50 text-center w-100">Sem despesas</span>
                ) : (
                  (abaGrafico === 0 ? despesasArray : pagamentosArray).map(([cat, valor]) => {
                    const porcentagem = ((Number(valor) || 0) / totalDespesasAtivas * 100).toFixed(0);
                    const corCat = (abaGrafico === 0 ? coresCategorias : coresPagamento)[cat] || '#6b7280';
                    const isDimmed = (hoveredCategory || selectedCategory) && (hoveredCategory !== cat && selectedCategory !== cat);

                    return (
                      <div 
                        key={cat} 
                        className="d-flex align-items-center justify-content-between rounded px-1"
                        style={{ 
                          cursor: 'pointer', 
                          transition: '0.2s', 
                          opacity: isDimmed ? 0.4 : 1,
                          background: selectedCategory === cat ? 'rgba(255,255,255,0.05)' : 'transparent',
                          paddingTop: '3px', paddingBottom: '3px'
                        }}
                        onMouseEnter={() => setHoveredCategory(cat)}
                        onMouseLeave={() => setHoveredCategory(null)}
                        onClick={(e) => { e.stopPropagation(); setSelectedCategory(selectedCategory === cat ? null : cat); setHoveredCategory(null); }}
                      >
                        <span className="d-flex align-items-center text-light opacity-75 text-truncate" style={{ maxWidth: '95px' }}>
                          <span className="rounded-circle me-2 flex-shrink-0" style={{ width: '8px', height: '8px', backgroundColor: corCat }}></span> {cat}
                        </span>
                        <span className="fw-bold text-white">{showBalance ? `${porcentagem}%` : '***'}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ABA 1 + CARTÃO: HISTÓRICO DE FATURAS */}
          {abaGrafico === 1 && isCardFlipped && (
            <div 
              className="d-flex justify-content-between align-items-end mt-3 pb-1 px-3"
              style={{ height: '150px' }}
            >
              {historicoData.map((hist, i) => {
                const heightPct = Math.max(((Number(hist.total) || 0) / maxFaturaHist) * 100, 5);
                return (
                  <div 
                    key={i} 
                    className="d-flex flex-column align-items-center justify-content-end" 
                    style={{ height: '100%', cursor: 'pointer' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      const objMes = listaMeses.find(m => m.num === hist.num && m.ano === hist.ano);
                      if (objMes) {
                        setMesFiltro(objMes);
                      }
                    }}
                  >
                    <span className="text-light opacity-75 mb-2" style={{ fontSize: '9px', whiteSpace: 'nowrap' }}>
                      {showBalance ? ((Number(hist.total) || 0) > 0 ? `R$ ${Math.round(hist.total)}` : '-') : '***'}
                    </span>
                    <div 
                      style={{ 
                        width: '14px', 
                        height: `${heightPct}%`, 
                        backgroundColor: i === 4 ? '#4f46e5' : '#3f3f46', 
                        borderRadius: '4px 4px 0 0',
                        transition: 'height 0.5s ease-in-out'
                      }}
                    ></div>
                    <span className="text-white mt-2 fw-bold opacity-75" style={{ fontSize: '10px' }}>{hist.nome}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* ABA 1 + GERAL: FORMAS DE PAGAMENTO */}
          {abaGrafico === 1 && !isCardFlipped && (
            <div className="d-flex align-items-center justify-content-between mt-3">
              
              <div style={{ width: '150px', height: '150px', position: 'relative', marginLeft: '-10px' }}>
                {totalDespesasAtivas === 0 ? (
                  <div className="w-100 h-100 rounded-circle bg-dark d-flex align-items-center justify-content-center border border-secondary border-opacity-25">
                    <FiCreditCard className="text-light opacity-25" size={28}/>
                  </div>
                ) : (
                  <>
                    <svg viewBox="0 0 42 42" className="w-100 h-100" style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
                      <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#27272a" strokeWidth="4"></circle>
                      {svgSegments.map(seg => {
                        const isHighlighted = (hoveredCategory === seg.key) || (selectedCategory === seg.key);
                        const isDimmed = (hoveredCategory || selectedCategory) && !isHighlighted;
                        const currentDashOffset = isChartAnimating ? 100 : seg.dashoffset;
                        
                        let circleClass = "svg-chart-circle";
                        if (isHighlighted) circleClass += " svg-chart-circle-hovered";
                        if (isDimmed) circleClass += " svg-chart-circle-dimmed";

                        return (
                          <circle
                            key={seg.key}
                            className={circleClass}
                            cx="21"
                            cy="21"
                            r="15.91549430918954"
                            fill="transparent"
                            stroke={seg.color}
                            strokeWidth="4"
                            strokeDasharray={seg.dasharray}
                            strokeDashoffset={currentDashOffset}
                            style={{
                               opacity: isDimmed ? 0.3 : 1,
                               cursor: 'pointer',
                               pointerEvents: 'stroke'
                            }}
                            onMouseEnter={() => setHoveredCategory(seg.key)}
                            onMouseLeave={() => setHoveredCategory(null)}
                            onClick={(e) => { e.stopPropagation(); setSelectedCategory(selectedCategory === seg.key ? null : seg.key); setHoveredCategory(null); }}
                          ></circle>
                        )
                      })}
                    </svg>
                    
                    <div className="position-absolute top-50 start-50 translate-middle text-center w-100 pe-none d-flex flex-column align-items-center justify-content-center" style={{ padding: '0 20px' }}>
                      {hoveredCategory || selectedCategory ? (
                        <>
                          <span className="text-light opacity-75 text-truncate w-100 d-block" style={{fontSize: '11px'}}>{hoveredCategory || selectedCategory}</span>
                          <span className="fw-bold text-white" style={{fontSize: '14px', textShadow: '0px 2px 4px rgba(0,0,0,0.5)'}}>
                            {showBalance ? formatarMoeda((abaGrafico === 0 ? despesasGrafico : pagamentosGrafico)[hoveredCategory || selectedCategory]) : 'R$ •••••'}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-light opacity-50 text-uppercase d-block" style={{fontSize: '10px', letterSpacing: '0.5px'}}>Total</span>
                          <span className="fw-bold text-white" style={{fontSize: '14px'}}>{showBalance ? formatarMoeda(totalDespesasAtivas) : 'R$ •••••'}</span>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* LEGENDA ORDENADA */}
              <div className="d-flex flex-column gap-1 text-end" style={{ fontSize: '13px', width: '135px' }}>
                {totalDespesasAtivas === 0 ? (
                  <span className="text-light opacity-50 text-center w-100">Sem despesas</span>
                ) : (
                  pagamentosArray.map(([cat, valor]) => {
                    const porcentagem = ((Number(valor) || 0) / totalDespesasAtivas * 100).toFixed(0);
                    const corCat = coresPagamento[cat] || '#6b7280';
                    const isDimmed = (hoveredCategory || selectedCategory) && (hoveredCategory !== cat && selectedCategory !== cat);

                    return (
                      <div 
                        key={cat} 
                        className="d-flex align-items-center justify-content-between rounded px-1"
                        style={{ 
                          cursor: 'pointer', 
                          transition: '0.2s', 
                          opacity: isDimmed ? 0.4 : 1,
                          background: selectedCategory === cat ? 'rgba(255,255,255,0.05)' : 'transparent',
                          paddingTop: '3px', paddingBottom: '3px'
                        }}
                        onMouseEnter={() => setHoveredCategory(cat)}
                        onMouseLeave={() => setHoveredCategory(null)}
                        onClick={(e) => { e.stopPropagation(); setSelectedCategory(selectedCategory === cat ? null : cat); setHoveredCategory(null); }}
                      >
                        <span className="d-flex align-items-center text-light opacity-75 text-truncate" style={{ maxWidth: '95px' }}>
                          <span className="rounded-circle me-2 flex-shrink-0" style={{ width: '8px', height: '8px', backgroundColor: corCat }}></span> {cat}
                        </span>
                        <span className="fw-bold text-white">{showBalance ? `${porcentagem}%` : '***'}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* BARRA DE PESQUISA GERAL */}
      <div className="d-flex align-items-center bg-dark bg-opacity-50 rounded-pill px-3 py-2 mb-4 border border-secondary border-opacity-25 shadow-sm">
        <FiSearch className="text-light opacity-50 me-2" size={18} />
        <input 
          type="text" 
          className="form-control bg-transparent border-0 text-white shadow-none p-0 input-busca" 
          placeholder="Pesquisar" 
          value={termoBusca}
          onChange={(e) => setTermoBusca(e.target.value)}
          style={{ fontSize: '14px' }}
        />
      </div>

      {/* LISTA DE TRANSAÇÕES AGRUPADAS POR DATA E BOTÃO DE MÊS */}
      <section className="mb-4 pb-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="text-white mb-0 fw-bold text-truncate me-2">
            {termoBusca 
              ? 'Resultados da busca' 
              : selectedCategory 
                ? `Filtrando: ${selectedCategory}` 
                : (isCardFlipped ? `Gastos com Cartão` : `Extrato Geral`)
            }
          </h6>
          
          <button 
            className="btn badge bg-secondary bg-opacity-25 text-light px-3 py-2 rounded-pill text-uppercase d-flex align-items-center gap-1 border-0 shadow-sm flex-shrink-0" 
            style={{ fontSize: '11px', letterSpacing: '0.5px' }}
            onClick={() => setShowMonthSelector(true)}
          >
            {mesFiltro.nome} <FiChevronDown size={14} className="ms-1" />
          </button>
        </div>
        
        {transacoesAgrupadas.length === 0 ? (
          <div className="card dark-card text-center p-4">
            <p className="text-light opacity-50 mb-0">Nenhuma transação encontrada.</p>
            {!termoBusca && !selectedCategory && <small className="text-light opacity-50">Que tal adicionar alguma?</small>}
          </div>
        ) : (
          transacoesAgrupadas.map(grupo => (
            <div key={grupo.dataString} className="mb-4">
              
              <small className="text-light opacity-50 fw-bold d-block mb-2 ms-2">
                {formatarCabecalhoData(grupo.dataString)}
              </small>

              {grupo.transacoes.map((t) => {
                const isPast = isPastOrToday(t.data);
                
                const isFilteredOut = selectedCategory && (
                  (abaGrafico === 0 && t.categoria !== selectedCategory) ||
                  (abaGrafico === 1 && !isCardFlipped && t.pagamento !== selectedCategory)
                );

                if(isFilteredOut) return null; 

                return (
                  <div 
                    key={t.id} 
                    className="card dark-card p-3 d-flex flex-row justify-content-between align-items-center mb-2 transaction-list-item border-0 shadow-sm"
                    style={{ cursor: 'pointer', opacity: (isPast || t.pago) ? 1 : 0.6 }} 
                    onClick={() => { setTransacaoSelecionada(t); setMenuAcaoDetalhes(0); }}
                  >
                    <div className="d-flex align-items-center">
                        <div className="bg-secondary bg-opacity-25 p-2 rounded-circle me-3 text-white d-flex align-items-center justify-content-center" style={{ width: '38px', height: '38px' }}>
                          {obterIconeCategoria(t.categoria)}
                        </div>
                        <div>
                          <h6 className="mb-0 text-white" style={{ fontSize: '15px' }}>{t.titulo}</h6>
                          <small className="text-light opacity-75 d-flex align-items-center mt-1" style={{ fontSize: '11px' }}>
                            {!isPast && (
                              t.pago 
                                ? <FiCheckCircle className="text-emerald me-1" size={10} /> 
                                : <FiClock className="text-warning me-1" size={10} />
                            )}
                            {t.categoria} • {t.pagamento}
                          </small>
                        </div>
                    </div>
                    <div className="text-end">
                      <span className={t.tipo === 'despesa' ? 'text-white fw-bold d-block mb-0' : 'text-emerald fw-bold d-block mb-0'}>
                        {showBalance 
                          ? <>{t.tipo === 'despesa' ? '- ' : '+ '} {formatarMoeda(t.valor)}</>
                          : '••••••••'
                        }
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </section>

      {/* DOWNBAR */}
      <nav className="bottom-bar">
        <div className="nav-icon active" style={{ cursor: 'pointer' }} onClick={handleGoHome}><FiHome size={28} /></div>
        <div className="fab-container">
          <button className="fab-button" onClick={() => setShowBottomSheet(true)}>
            <FiPlus size={32} />
          </button>
        </div>
        <div className="nav-icon" style={{ cursor: 'pointer' }} onClick={() => { handleGoHome(); setIsCardFlipped(true); }}><FiCreditCard size={28} /></div>
      </nav>

      {/* MENU PERFIL */}
      <Offcanvas 
        show={showProfile} 
        onHide={() => setShowProfile(false)} 
        placement="start" 
        style={{ backgroundColor: '#1e1e24', color: '#fff', maxWidth: '300px', borderRight: '1px solid rgba(255,255,255,0.1)' }}
      >
        <Offcanvas.Body className="p-0 d-flex flex-column">
          
          <div className="p-4 text-center position-relative" style={{ background: 'linear-gradient(to bottom, rgba(16, 185, 129, 0.15), transparent)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <button 
              className="btn btn-link position-absolute top-0 end-0 mt-3 me-2 text-white opacity-50 shadow-none border-0"
              onClick={() => setShowProfile(false)}
            >
              <FiX size={24} />
            </button>
            <div className="rounded-circle d-flex justify-content-center align-items-center mx-auto mb-3 mt-3 shadow-lg" 
                 style={{ width: '80px', height: '80px', background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', color: '#fff', fontWeight: 'bold', fontSize: '32px' }}>
              {usuarioLogado?.nome ? usuarioLogado.nome.charAt(0).toUpperCase() : 'U'}
            </div>
            <h5 className="fw-bold mb-1 text-white">{usuarioLogado?.nome}</h5>
            <small className="text-light opacity-75">{usuarioLogado?.email}</small>
          </div>

          <div className="px-3 pt-4 flex-grow-1 overflow-auto">
            
            <small className="text-light opacity-50 fw-bold ms-2 mb-2 d-block" style={{ fontSize: '11px', letterSpacing: '1px' }}>MINHA CONTA</small>
            <div className="card dark-card bg-dark border-0 mb-4 shadow-sm" style={{ borderRadius: '1rem' }}>
              <div className="d-flex align-items-center justify-content-between p-3 border-bottom border-secondary border-opacity-25" style={{ cursor: 'pointer' }}>
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-secondary bg-opacity-25 p-2 rounded-circle text-white d-flex align-items-center justify-content-center"><FiUser size={18} /></div>
                  <span className="text-white" style={{ fontSize: '14px' }}>Meus Dados</span>
                </div>
                <FiChevronRight className="text-light opacity-50" />
              </div>
              <div className="d-flex align-items-center justify-content-between p-3 border-bottom border-secondary border-opacity-25" style={{ cursor: 'pointer' }}>
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-secondary bg-opacity-25 p-2 rounded-circle text-white d-flex align-items-center justify-content-center"><FiSettings size={18} /></div>
                  <span className="text-white" style={{ fontSize: '14px' }}>Configurações Globais</span>
                </div>
                <FiChevronRight className="text-light opacity-50" />
              </div>
              <div className="d-flex align-items-center justify-content-between p-3" style={{ cursor: 'pointer' }}>
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-secondary bg-opacity-25 p-2 rounded-circle text-white d-flex align-items-center justify-content-center"><FiShield size={18} /></div>
                  <span className="text-white" style={{ fontSize: '14px' }}>Segurança</span>
                </div>
                <FiChevronRight className="text-light opacity-50" />
              </div>
            </div>

            <small className="text-light opacity-50 fw-bold ms-2 mb-2 d-block" style={{ fontSize: '11px', letterSpacing: '1px' }}>MAIS OPÇÕES</small>
            <div className="card dark-card bg-dark border-0 mb-4 shadow-sm" style={{ borderRadius: '1rem' }}>
              <div className="d-flex align-items-center justify-content-between p-3 border-bottom border-secondary border-opacity-25" style={{ cursor: 'pointer' }}>
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-secondary bg-opacity-25 p-2 rounded-circle text-white d-flex align-items-center justify-content-center"><FiBell size={18} /></div>
                  <span className="text-white" style={{ fontSize: '14px' }}>Notificações</span>
                </div>
                <FiChevronRight className="text-light opacity-50" />
              </div>
              <div className="d-flex align-items-center justify-content-between p-3" style={{ cursor: 'pointer' }}>
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-secondary bg-opacity-25 p-2 rounded-circle text-white d-flex align-items-center justify-content-center"><FiHelpCircle size={18} /></div>
                  <span className="text-white" style={{ fontSize: '14px' }}>Central de Ajuda</span>
                </div>
                <FiChevronRight className="text-light opacity-50" />
              </div>
            </div>

          </div>

          <div className="p-4 mt-auto">
            <button 
              className="btn btn-outline-danger w-100 py-3 rounded-4 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 border border-danger text-danger"
              style={{ background: 'transparent' }}
              onClick={handleLogout}
            >
              <FiLogOut size={18} /> Sair do App
            </button>
          </div>
        </Offcanvas.Body>
      </Offcanvas>

      {/* GAVETA: CONFIGURAÇÕES DO CARTÃO DE CRÉDITO */}
      <Offcanvas 
        show={showCardSettings} 
        onHide={() => { 
          setShowCardSettings(false); 
          setTempDiaVencimento(diaVencimento); 
          setTempDiaFechamento(diaFechamento);
          setTempCor(corCartao);
          setTempApelido(apelidoCartao);
          setTempFinal(finalCartao);
          setTempNome(nomeCartao);
          setTempBandeira(bandeiraCartao);
        }} 
        placement="bottom" 
        style={{ height: 'auto', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', backgroundColor: '#1e1e24', color: '#fff', paddingBottom: '20px' }}
      >
        <Offcanvas.Header closeButton closeVariant="white" className="pb-0 border-0 mt-2">
          <Offcanvas.Title className="w-100 text-center fw-bold fs-6 text-white d-flex align-items-center justify-content-center gap-2">
            <FiSettings /> Configurar Cartão
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <div className="d-flex flex-column gap-3 mb-4 mt-2">
            
            <div className="row g-2">
              <div className="col-8">
                <label className="form-label text-light opacity-75 small mb-1">Apelido do Cartão</label>
                <input 
                  type="text" 
                  className="form-control bg-dark border-secondary text-white shadow-none" 
                  value={tempApelido}
                  onChange={(e) => setTempApelido(e.target.value)}
                />
              </div>
              <div className="col-4">
                <label className="form-label text-light opacity-75 small mb-1">Finais (4 dig)</label>
                <input 
                  type="text" 
                  maxLength="4"
                  className="form-control bg-dark border-secondary text-white shadow-none text-center fw-bold text-info" 
                  value={tempFinal}
                  onChange={(e) => setTempFinal(e.target.value.replace(/\D/g, ''))}
                />
              </div>
            </div>

            <div className="row g-2">
              <div className="col-7">
                <label className="form-label text-light opacity-75 small mb-1">Nome impresso</label>
                <input 
                  type="text" 
                  className="form-control bg-dark border-secondary text-white shadow-none text-uppercase" 
                  value={tempNome}
                  onChange={(e) => setTempNome(e.target.value)}
                />
              </div>
              <div className="col-5">
                <label className="form-label text-light opacity-75 small mb-1">Bandeira</label>
                <select 
                  className="form-select bg-dark border-secondary text-white shadow-none"
                  value={tempBandeira}
                  onChange={(e) => setTempBandeira(e.target.value)}
                >
                  <option value="Mastercard">Mastercard</option>
                  <option value="Visa">Visa</option>
                  <option value="Elo">Elo</option>
                </select>
              </div>
            </div>

            <div className="row g-2">
              <div className="col-6">
                <label className="form-label text-light opacity-75 small mb-1">Dia Vencimento</label>
                <input 
                  type="number"
                  min="1"
                  max="31"
                  className="form-control bg-dark border-secondary text-white shadow-none text-center fw-bold"
                  value={tempDiaVencimento}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, '');
                    if (val !== '' && parseInt(val, 10) > 31) val = '31';
                    setTempDiaVencimento(val);
                  }}
                />
              </div>
              
              <div className="col-6">
                <label className="form-label text-light opacity-75 small mb-1">Dia Fechamento</label>
                <input 
                  type="number"
                  min="1"
                  max="31"
                  className="form-control bg-dark border-secondary text-white shadow-none text-center text-warning fw-bold"
                  value={tempDiaFechamento}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, '');
                    if (val !== '' && parseInt(val, 10) > 31) val = '31';
                    setTempDiaFechamento(val);
                  }}
                />
              </div>
            </div>
            
            <div>
              <label className="form-label text-light opacity-75 small mb-1">Cor do Cartão</label>
              <select 
                className="form-select bg-dark border-secondary text-white shadow-none"
                value={tempCor}
                onChange={(e) => setTempCor(e.target.value)}
              >
                <option value="linear-gradient(135deg, #8A05BE 0%, #4c0677 100%)">Nubank (Roxo)</option>
                <option value="linear-gradient(135deg, #FF7A00 0%, #FF500F 100%)">Inter (Laranja)</option>
                <option value="linear-gradient(135deg, #242424 0%, #000000 100%)">C6 Bank (Carbon)</option>
                <option value="linear-gradient(135deg, #CC0000 0%, #990000 100%)">Santander (Vermelho)</option>
                <option value="linear-gradient(135deg, #F9D342 0%, #F2C94C 100%)">Banco do Brasil (Amarelo)</option>
                <option value="linear-gradient(135deg, #005CA9 0%, #00457E 100%)">Caixa (Azul)</option>
                <option value="linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)">Padrão (Azul Escuro)</option>
              </select>
            </div>

          </div>

          <button 
            className="btn w-100 py-3 rounded-4 fw-bold shadow text-white border-0"
            style={{ backgroundColor: '#10b981' }}
            onClick={handleSalvarConfigCartao}
          >
            Salvar Alterações
          </button>
        </Offcanvas.Body>
      </Offcanvas>

      {/* GAVETA DE MÊS */}
      <Offcanvas 
        show={showMonthSelector} 
        onHide={() => setShowMonthSelector(false)} 
        placement="bottom" 
        style={{ maxHeight: '75vh', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', backgroundColor: '#1e1e24', color: '#fff' }}
      >
        <Offcanvas.Header closeButton closeVariant="white" className="pb-0 border-0 mt-2">
          <Offcanvas.Title className="w-100 text-center fw-bold fs-6 text-white">Selecione o Mês</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body style={{ overflowY: 'auto' }}>
          <div className="d-flex flex-column gap-2 mt-2">
            {listaMeses.map((mes) => (
              <button 
                id={mesFiltro.num === mes.num && mesFiltro.ano === mes.ano ? 'btn-mes-ativo' : ''}
                key={`${mes.num}-${mes.ano}`}
                className={`btn w-100 py-3 rounded-4 fw-bold shadow-sm border-0 ${mesFiltro.num === mes.num && mesFiltro.ano === mes.ano ? 'text-white' : 'btn-dark text-light'}`}
                style={mesFiltro.num === mes.num && mesFiltro.ano === mes.ano ? { backgroundColor: '#10b981' } : {}}
                onClick={() => {
                  setMesFiltro(mes);
                  setShowMonthSelector(false);
                  setTermoBusca(''); 
                  setSelectedCategory(null);
                }}
              >
                {mes.nome} {mes.ano}
              </button>
            ))}
          </div>
        </Offcanvas.Body>
      </Offcanvas>

      {/* GAVETA: NOVO / EDITAR LANÇAMENTO */}
      <Offcanvas 
        show={showBottomSheet} 
        onHide={() => {
          setShowBottomSheet(false);
          setEditandoId(null);
          setTipoRecorrencia('fixo');
          setQtdParcelas(2);
          setPagoInput(true);
        }} 
        placement="bottom" 
        style={{ height: 'auto', maxHeight: '90vh', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', backgroundColor: '#1e1e24', color: '#fff' }}
      >
        <Offcanvas.Header closeButton closeVariant="white" className="pb-0 border-0 mt-2">
          <Offcanvas.Title className="w-100 text-center fw-bold fs-6 text-white">
            {editandoId ? 'Editar Lançamento' : 'Novo Lançamento'}
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body style={{ overflowY: 'auto', paddingBottom: '0' }}>
          
          <div className="mt-2">
            <div className="d-flex justify-content-center mb-3 bg-dark rounded-pill p-1 mx-auto" style={{ maxWidth: '250px' }}>
              <button 
                className={`btn rounded-pill w-50 fw-bold border-0 ${tipoTransacao === 'despesa' ? 'text-white' : 'text-light opacity-50'}`} 
                style={{ backgroundColor: tipoTransacao === 'despesa' ? '#374151' : 'transparent' }}
                onClick={() => handleTrocarTipo('despesa')}
              >
                Despesa
              </button>
              <button 
                className={`btn rounded-pill w-50 fw-bold border-0 ${tipoTransacao === 'receita' ? 'text-dark' : 'text-light opacity-50'}`} 
                style={{ backgroundColor: tipoTransacao === 'receita' ? '#10b981' : 'transparent' }}
                onClick={() => handleTrocarTipo('receita')}
              >
                Receita
              </button>
            </div>

            <div className="text-center mb-3">
              <small className="text-light opacity-75 fw-bold d-block mb-1">VALOR</small>
              <input 
                type="text" 
                inputMode="numeric"
                className={`form-control bg-transparent border-0 text-center fw-bold fs-1 py-0 shadow-none w-100 ${tipoTransacao === 'despesa' ? 'text-white input-valor-despesa' : 'text-emerald input-valor-receita'}`} 
                style={{ color: tipoTransacao === 'receita' ? '#10b981 !important' : '#ffffff' }}
                placeholder="R$ 0,00" 
                value={valorInput ? `R$ ${valorInput}` : ''}
                onChange={handleValorChange}
              />
            </div>
          </div>

          <div className="d-flex flex-column gap-2 mb-3">
            <div className="row g-2">
              <div className="col-6">
                <label className="form-label text-light opacity-75 small mb-1">Título</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text" 
                    className="form-control bg-dark border-secondary text-white shadow-none" 
                    placeholder="Ex: Troca de óleo" 
                    value={tituloInput}
                    onChange={(e) => setTituloInput(e.target.value)}
                    maxLength={30}
                    style={{ paddingRight: '40px' }} 
                  />
                  <span 
                    style={{ 
                      position: 'absolute', 
                      right: '10px', 
                      top: '50%', 
                      transform: 'translateY(-50%)', 
                      fontSize: '10px', 
                      color: '#6c757d',
                      pointerEvents: 'none' 
                    }}
                  >
                    {tituloInput.length}/30
                  </span>
                </div>
              </div>
              <div className="col-6">
                <label className="form-label text-light opacity-75 small mb-1">Categoria</label>
                <select 
                  className="form-select bg-dark border-secondary text-white shadow-none"
                  value={categoriaInput}
                  onChange={(e) => setCategoriaInput(e.target.value)}
                >
                  <option value="" disabled>Selecione...</option>
                  {tipoTransacao === 'receita' ? (
                    <>
                      <option value="Salário">Salário</option>
                      <option value="Vale (VR + VT)">Vale (VR + VT)</option>
                      <option value="Rendimento">Rendimento</option>
                      <option value="Outros">Outros</option>
                    </>
                  ) : (
                    <>
                      <option value="Alimentação">Alimentação</option>
                      <option value="Moto">Moto</option>
                      <option value="Carro">Carro</option>
                      <option value="Educação">Educação</option>
                      <option value="Lazer">Lazer</option>
                      <option value="Moradia">Moradia</option>
                      <option value="Outros">Outros</option>
                    </>
                  )}
                </select>
              </div>
            </div>
            
            <div className="row g-2">
              <div className="col-6">
                <label className="form-label text-light opacity-75 small mb-1">Forma de Pagamento</label>
                <select 
                  className="form-select bg-dark border-secondary text-white shadow-none"
                  value={pagamentoInput}
                  onChange={(e) => setPagamentoInput(e.target.value)}
                >
                  <option value="" disabled>Selecione...</option>
                  <option value="Pix">Pix</option>
                  <option value="Crédito">Cartão de Crédito</option>
                  <option value="Débito">Cartão de Débito</option>
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="Boleto">Boleto</option>
                </select>
              </div>
              <div className="col-6">
                <label className="form-label text-light opacity-75 small mb-1">Data</label>
                <input 
                  type="date" 
                  className="form-control bg-dark border-secondary text-white shadow-none" 
                  value={dataInput}
                  onChange={(e) => setDataInput(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="form-label text-light opacity-75 small mb-1">Observação</label>
              <div style={{ position: 'relative' }}>
                <textarea 
                  className="form-control bg-dark border-secondary text-white shadow-none" 
                  rows="2"
                  placeholder="Detalhes adicionais (Opcional)" 
                  value={observacaoInput}
                  onChange={(e) => setObservacaoInput(e.target.value)}
                  maxLength={255}
                  style={{ paddingBottom: '20px' }} 
                />
                <span 
                  style={{ 
                    position: 'absolute', 
                    right: '10px', 
                    bottom: '8px', 
                    fontSize: '10px', 
                    color: '#6c757d',
                    pointerEvents: 'none'
                  }}
                >
                  {observacaoInput.length}/255
                </span>
              </div>
            </div>
          </div>

          {isDataInputFuture(dataInput) && (
            <div className="form-check form-switch d-flex align-items-center justify-content-between px-0 mb-3">
              <label className="form-check-label text-light opacity-75 ms-0" htmlFor="statusPago">Lançamento já foi pago/recebido?</label>
              <input 
                className="form-check-input ms-3 shadow-none mt-0" 
                type="checkbox" 
                role="switch" 
                id="statusPago" 
                style={{ width: '45px', height: '24px', cursor: 'pointer' }}
                checked={pagoInput}
                onChange={(e) => setPagoInput(e.target.checked)}
              />
            </div>
          )}

          <div className="form-check form-switch d-flex align-items-center justify-content-between px-0 mb-3">
            <label className="form-check-label text-light opacity-75 ms-0" htmlFor="recorrente">É uma transação fixa/recorrente?</label>
            <input 
              className="form-check-input ms-3 shadow-none mt-0" 
              type="checkbox" 
              role="switch" 
              id="recorrente" 
              style={{ width: '45px', height: '24px', cursor: editandoId ? 'not-allowed' : 'pointer' }}
              checked={ehRecorrente}
              onChange={(e) => setEhRecorrente(e.target.checked)}
              disabled={!!editandoId} 
            />
          </div>
          
          {ehRecorrente && (
            <div className="card bg-dark border-secondary border-opacity-25 p-3 mb-3 rounded-4 shadow-sm">
              {editandoId ? (
                <small className="text-warning text-center d-block opacity-75">
                  <FiAlertCircle className="me-1 mb-1" /> Você está editando apenas esta parcela individual. Para mudar a regra geral de recorrência, exclua e crie um novo lançamento.
                </small>
              ) : (
                <>
                  <div className="d-flex gap-2 mb-3">
                    <button
                      className={`btn flex-fill rounded-pill py-2 small fw-bold border-0 ${tipoRecorrencia === 'fixo' ? 'text-white' : 'text-light opacity-50'}`}
                      style={{ backgroundColor: tipoRecorrencia === 'fixo' ? '#3b82f6' : '#27272a' }}
                      onClick={() => setTipoRecorrencia('fixo')}
                    >
                      Conta Fixa (Mensal)
                    </button>
                    <button
                      className={`btn flex-fill rounded-pill py-2 small fw-bold border-0 ${tipoRecorrencia === 'parcelado' ? 'text-white' : 'text-light opacity-50'}`}
                      style={{ backgroundColor: tipoRecorrencia === 'parcelado' ? '#8b5cf6' : '#27272a' }}
                      onClick={() => setTipoRecorrencia('parcelado')}
                    >
                      Compra Parcelada
                    </button>
                  </div>

                  {tipoRecorrencia === 'parcelado' && (
                    <div>
                      <label className="form-label text-light opacity-75 small mb-1">Quantidade de Parcelas</label>
                      <div className="d-flex align-items-center gap-3">
                        <input
                          type="range"
                          className="form-range flex-grow-1 custom-range"
                          min="2"
                          max="24"
                          value={qtdParcelas}
                          onChange={(e) => setQtdParcelas(parseInt(e.target.value))}
                        />
                        <span className="fw-bold text-white fs-5">{qtdParcelas}x</span>
                      </div>
                      <small className="text-light opacity-50 d-block mt-2">
                        O valor total de R$ {valorInput || '0,00'} será dividido em {qtdParcelas} vezes de R$ {valorInput ? formatarMoeda(parseFloat(valorInput.replace(/\./g, '').replace(',', '.')) / qtdParcelas) : '0,00'}.
                      </small>
                    </div>
                  )}
                  {tipoRecorrencia === 'fixo' && (
                    <small className="text-light opacity-50 d-block text-center mt-1">
                      O valor de R$ {valorInput || '0,00'} será projetado automaticamente por 12 meses.
                    </small>
                  )}
                </>
              )}
            </div>
          )}

          <button 
            className={`btn w-100 py-3 rounded-4 fw-bold shadow border-0 mt-2 ${isSubmitting ? 'text-white' : 'text-dark'}`}
            style={{ 
              backgroundColor: isSubmitting ? '#6b7280' : '#10b981',
              transition: '0.3s'
            }}
            onClick={handleConfirmarLancamento}
            disabled={isSubmitting} 
          >
            {isSubmitting ? (
              <div className="d-flex align-items-center justify-content-center">
                Salvando
                <div className="typing-indicator ms-1">
                  <span></span><span></span><span></span>
                </div>
              </div>
            ) : (editandoId ? 'Salvar Alterações' : 'Confirmar Lançamento')}
          </button>
        </Offcanvas.Body>
      </Offcanvas>

      {/* GAVETA DETALHES TRANSAÇÃO */}
      <Offcanvas 
        show={!!transacaoSelecionada} 
        onHide={() => { setTransacaoSelecionada(null); setMenuAcaoDetalhes(0); }} 
        placement="bottom" 
        style={{ height: 'auto', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', backgroundColor: '#1e1e24', color: '#fff', paddingBottom: '20px' }}
      >
        <Offcanvas.Header className="pb-0 border-0 mt-2 d-flex align-items-center justify-content-center position-relative">
          <Offcanvas.Title className="fw-bold fs-6 text-white m-0">
            Detalhes do Lançamento
          </Offcanvas.Title>

          <div className="position-absolute end-0 top-50 translate-middle-y pe-3 d-flex align-items-center gap-3 mt-2">
            {!menuAcaoDetalhes && (
              <button 
                className="btn btn-link p-0 text-white shadow-none opacity-75 d-flex align-items-center justify-content-center border-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuAcaoDetalhes(2); 
                }}
              >
                <FiTrash2 size={20} />
              </button>
            )}
            <button 
              type="button" 
              className="btn-close btn-close-white shadow-none" 
              aria-label="Close" 
              onClick={() => { setTransacaoSelecionada(null); setMenuAcaoDetalhes(0); }}
            ></button>
          </div>
        </Offcanvas.Header>
        
        {transacaoSelecionada && (
          <Offcanvas.Body>
            <div className={`text-center ${menuAcaoDetalhes ? 'mb-2' : 'mb-4'}`}>
              <div className="bg-secondary bg-opacity-25 p-3 rounded-circle d-inline-block text-white mb-2">
                {obterIconeCategoria(transacaoSelecionada.categoria)}
              </div>
              <h4 className="fw-bold mb-1">{transacaoSelecionada.titulo}</h4>
              <h2 className={transacaoSelecionada.tipo === 'despesa' ? 'text-white' : 'text-emerald'}>
                {showBalance 
                  ? <>{transacaoSelecionada.tipo === 'despesa' ? '- ' : '+ '} {formatarMoeda(transacaoSelecionada.valor)}</>
                  : 'R$ •••••••'
                }
              </h2>
            </div>

            <div className={`card dark-card p-3 ${menuAcaoDetalhes ? 'mb-2' : 'mb-4'} bg-dark border-0`}>
              
              {transacaoSelecionada.recorrente && (
                <div className="d-flex justify-content-between mb-2 pb-2 border-bottom border-secondary border-opacity-25">
                  <span className="text-light opacity-75"><FiRefreshCw className="me-2"/> Tipo de Lançamento</span>
                  <span className="badge bg-primary bg-opacity-25 text-info border border-info border-opacity-25 d-flex align-items-center">
                    Fixo / Parcelado
                  </span>
                </div>
              )}

              {!isPastOrToday(transacaoSelecionada.data) && (
                <div className="d-flex justify-content-between mb-2 pb-2 border-bottom border-secondary border-opacity-25 mt-1">
                  <span className="text-light opacity-75 d-flex align-items-center"><FiClock className="me-2"/> Status</span>
                  
                  <button 
                      className={`btn btn-sm rounded-pill fw-bold d-flex align-items-center justify-content-center ${animatingStatusId === transacaoSelecionada.id ? 'btn-status-anim' : ''}`}
                      style={{ 
                        fontSize: '11px', 
                        borderWidth: '1px', 
                        borderStyle: 'solid', 
                        backgroundColor: 'transparent', 
                        borderColor: transacaoSelecionada.pago ? '#10b981' : '#f59e0b', 
                        color: transacaoSelecionada.pago ? '#10b981' : '#f59e0b',
                        transition: 'all 0.2s ease', 
                        minWidth: '95px' 
                      }}
                      onClick={handleToggleStatusPagamento}
                  >
                      {transacaoSelecionada.pago ? <><FiCheckCircle className="me-1 mb-1" /> PAGO</> : <><FiClock className="me-1 mb-1" /> PENDENTE</>}
                  </button>
                </div>
              )}

              <div className="d-flex justify-content-between mb-2 mt-2">
                <span className="text-light opacity-75"><FiTag className="me-2"/> Categoria</span>
                <span className="fw-bold text-white">{transacaoSelecionada.categoria}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-light opacity-75"><FiCalendar className="me-2"/> Data</span>
                <span className="fw-bold text-white">{transacaoSelecionada.data}</span>
              </div>
              {transacaoSelecionada.hora && (
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-light opacity-75"><FiClock className="me-2"/> Horário do Registro</span>
                  <span className="fw-bold text-white">{transacaoSelecionada.hora}</span>
                </div>
              )}
              <div className="d-flex justify-content-between">
                <span className="text-light opacity-75"><FiCreditCard className="me-2"/> Forma de Pagamento</span>
                <span className="fw-bold text-white">{transacaoSelecionada.pagamento}</span>
              </div>
            </div>

            {transacaoSelecionada.observacao && !menuAcaoDetalhes && (
              <div className="mb-4">
                <h6 className="text-light opacity-75 mb-2"><FiFileText className="me-2"/> Observações</h6>
                <div className="card dark-card p-3 bg-dark border-0 text-white opacity-75">
                  {transacaoSelecionada.observacao}
                </div>
              </div>
            )}

            {!menuAcaoDetalhes && (
              <button 
                className="btn btn-secondary w-100 py-3 rounded-4 fw-bold text-white d-flex align-items-center justify-content-center gap-2 mt-2 shadow-none border-0"
                style={{ backgroundColor: '#27272a' }}
                onClick={handleAbrirEdicao}
              >
                <FiEdit2 size={18} /> Editar dados do lançamento
              </button>
            )}

            {/* STEP 2: AVISO DE EXCLUSÃO */}
            {menuAcaoDetalhes === 2 && (
              <div className="p-3 rounded-4 bg-dark border border-danger border-opacity-50 text-center mt-2">
                <div className="mb-3">
                  <FiAlertCircle size={36} className="text-danger mb-2" />
                  <p className="text-white fw-bold mb-1">Excluir Lançamento?</p>
                  {transacaoSelecionada.recorrente ? (
                    <p className="text-light opacity-75 small mb-0">Este lançamento faz parte de uma série. Como deseja prosseguir?</p>
                  ) : (
                    <p className="text-light opacity-75 small mb-0">Essa ação não poderá ser desfeita.</p>
                  )}
                </div>
                
                <div className="d-flex flex-column gap-2">
                  {transacaoSelecionada.recorrente ? (
                    <>
                      <button 
                        className="btn btn-danger w-100 py-3 rounded-3 fw-bold border-0" 
                        onClick={() => handleEfetuarExclusao(false)} 
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <div className="d-flex align-items-center justify-content-center">
                            Excluindo
                            <div className="typing-indicator ms-1">
                              <span></span><span></span><span></span>
                            </div>
                          </div>
                        ) : 'Excluir apenas este'}
                      </button>
                      <button 
                        className="btn btn-outline-danger w-100 py-3 rounded-3 fw-bold" 
                        onClick={() => handleEfetuarExclusao(true)} 
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <div className="d-flex align-items-center justify-content-center">
                            Excluindo
                            <div className="typing-indicator ms-1">
                              <span></span><span></span><span></span>
                            </div>
                          </div>
                        ) : 'Excluir este e os futuros'}
                      </button>
                    </>
                  ) : (
                    <button 
                      className="btn btn-danger w-100 py-3 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-2 border-0" 
                      onClick={() => handleEfetuarExclusao(false)} 
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <div className="d-flex align-items-center justify-content-center">
                          <FiTrash2 size={18} className="me-2" />
                          Excluindo
                          <div className="typing-indicator ms-1">
                            <span></span><span></span><span></span>
                          </div>
                        </div>
                      ) : (
                        <><FiTrash2 size={18} /> Sim, excluir lançamento</>
                      )}
                    </button>
                  )}
                  <button 
                    className="btn btn-link text-light opacity-75 mt-2 shadow-none border-0" 
                    onClick={() => setMenuAcaoDetalhes(0)} 
                    disabled={isDeleting}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </Offcanvas.Body>
        )}
      </Offcanvas>

    </div>
  );
}

export default App;