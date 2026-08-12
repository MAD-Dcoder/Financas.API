import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Offcanvas } from 'react-bootstrap';
import axios from 'axios';
import './App.css';
import { 
  FiEye, FiEyeOff, FiHome, FiCreditCard, FiPlus, FiUser, FiSettings, 
  FiLogOut, FiChevronRight, FiTag, FiCalendar, FiFileText, 
  FiCoffee, FiTool, FiTruck, FiBookOpen, FiSmile, FiHome as FiHomeIcon, 
  FiDollarSign, FiGift, FiChevronDown, FiSearch, FiClock, FiMoreVertical,
  FiEdit2, FiTrash2, FiLock, FiMail, FiShield, FiBell, FiHelpCircle
} from 'react-icons/fi';

function App() {
  // ==========================================
  // CONSTANTES DA API
  // ==========================================
  const TRANSACOES_API_URL = 'https://localhost:7231/api/Transacoes';
  const USUARIOS_API_URL = 'https://localhost:7231/api/Usuarios';

  // ==========================================
  // ESTADOS DE AUTENTICAÇÃO E LOGIN (FIRMO)
  // ==========================================
  
  // INICIALIZAÇÃO INTELIGENTE: Olha o LocalStorage antes de decidir a tela
  const [usuarioLogado, setUsuarioLogado] = useState(() => {
    const savedUser = localStorage.getItem('firmo_user');
    return savedUser ? JSON.parse(savedUser) : null;
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
      
      // SALVA NO BOLSO (LocalStorage) E NO ESTADO
      localStorage.setItem('firmo_user', JSON.stringify(response.data));
      setUsuarioLogado(response.data);
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

      // SALVA NO BOLSO (LocalStorage) E NO ESTADO
      localStorage.setItem('firmo_user', JSON.stringify(response.data));
      setUsuarioLogado(response.data);
      setIsLoggedIn(true);
    } catch (error) {
      setRegisterError('Erro ao criar conta. Verifique os dados ou o servidor.');
    }
  };

  const handleLogout = () => {
    // APAGA DO BOLSO (LocalStorage)
    localStorage.removeItem('firmo_user');
    
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
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [abaGrafico, setAbaGrafico] = useState(0);
  
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [showCardSettings, setShowCardSettings] = useState(false);
  const [diaVencimento, setDiaVencimento] = useState('09'); 
  const [corCartao, setCorCartao] = useState('linear-gradient(135deg, #b45309 0%, #d97706 100%)'); 
  const [apelidoCartao, setApelidoCartao] = useState('Cartão Principal');
  const [finalCartao, setFinalCartao] = useState('3911');
  const [nomeCartao, setNomeCartao] = useState('');
  const [bandeiraCartao, setBandeiraCartao] = useState('Mastercard'); 

  const [tempDiaVencimento, setTempDiaVencimento] = useState(diaVencimento);
  const [tempCor, setTempCor] = useState(corCartao);
  const [tempApelido, setTempApelido] = useState(apelidoCartao);
  const [tempFinal, setTempFinal] = useState(finalCartao);
  const [tempNome, setTempNome] = useState(nomeCartao);
  const [tempBandeira, setTempBandeira] = useState(bandeiraCartao);

  const [termoBusca, setTermoBusca] = useState('');

  const gerarListaMeses = () => {
    const nomesMeses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const lista = [];
    const dataAtual = new Date();
    
    dataAtual.setMonth(dataAtual.getMonth() + 6);
    let mes = dataAtual.getMonth();
    let ano = dataAtual.getFullYear();

    for (let i = 0; i < 18; i++) {
      lista.push({
        nome: nomesMeses[mes],
        num: String(mes + 1).padStart(2, '0'),
        ano: String(ano)
      });
      
      mes--;
      if (mes < 0) {
        mes = 11;
        ano--;
      }
    }
    return lista;
  };

  const listaMeses = gerarListaMeses();

  const [mesFiltro, setMesFiltro] = useState(() => {
    const mesAtual = String(new Date().getMonth() + 1).padStart(2, '0');
    const anoAtual = String(new Date().getFullYear());
    return listaMeses.find(m => m.num === mesAtual && m.ano === anoAtual) || listaMeses[0];
  });

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
  
  const [transacoes, setTransacoes] = useState([]);

  const mapaCategoriasAPI = {
    'Alimentação': 1, 'Moto': 2, 'Carro': 3, 'Educação / Faculdade': 4,
    'Lazer': 5, 'Moradia': 6, 'Salário': 7, 'Vale (VR + VT)': 8,
    'Rendimento': 9, 'Outros': 10
  };

  const mapaContasAPI = {
    'Pix': 2, 'Crédito': 3, 'Débito': 4, 'Dinheiro': 5, 'Boleto': 6
  };

  const mapaCategoriasAPIReverse = Object.fromEntries(Object.entries(mapaCategoriasAPI).map(([key, value]) => [value, key]));
  const mapaContasAPIReverse = Object.fromEntries(Object.entries(mapaContasAPI).map(([key, value]) => [value, key]));

  useEffect(() => {
    const buscarTransacoes = async () => {
      if (!isLoggedIn || !usuarioLogado) return;

      try {
        const response = await axios.get(`${TRANSACOES_API_URL}/usuario/${usuarioLogado.id}`);
        
        const transacoesDoBanco = response.data.map(t => {
          const dataQuebrada = t.dataTransacao.split('T');
          const dataBruta = dataQuebrada[0].split('-'); 
          const dataCerta = `${dataBruta[2]}/${dataBruta[1]}/${dataBruta[0]}`; 
          const horaCerta = dataQuebrada[1].substring(0, 5); 
          
          return {
            id: t.id,
            titulo: t.descricao,
            categoria: mapaCategoriasAPIReverse[t.categoriaId] || 'Outros',
            pagamento: mapaContasAPIReverse[t.contaOrigemId] || mapaContasAPIReverse[t.contaDestinoId] || 'Pix',
            observacao: t.observacao || '',
            data: dataCerta,
            hora: horaCerta,
            valor: t.valor,
            tipo: t.tipo,
            recorrente: t.ehRecorrente
          };
        });

        setTransacoes(transacoesDoBanco);
      } catch (error) {
        console.error("Erro ao buscar transações da API:", error);
      }
    };

    buscarTransacoes();
  }, [isLoggedIn, usuarioLogado, mapaCategoriasAPIReverse, mapaContasAPIReverse]);

  const transacoesDoMes = transacoes.filter(t => {
    const partes = t.data.split('/');
    if (partes.length === 3) {
      return partes[1] === mesFiltro.num && partes[2] === mesFiltro.ano;
    }
    return true;
  });

  const transacoesDaAbaAtiva = transacoesDoMes.filter(t => {
    if (isCardFlipped) return t.pagamento === 'Crédito';
    return true; 
  });

  const transacoesParaExibir = termoBusca 
    ? transacoesDaAbaAtiva.filter(t => {
        const termo = termoBusca.toLowerCase();
        return (
          t.titulo.toLowerCase().includes(termo) ||
          t.categoria.toLowerCase().includes(termo) ||
          t.pagamento.toLowerCase().includes(termo) ||
          t.data.includes(termo) ||
          (t.hora && t.hora.includes(termo)) ||
          (t.observacao && t.observacao.toLowerCase().includes(termo)) ||
          t.valor.toString().includes(termo)
        );
      })
    : transacoesDaAbaAtiva;

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
    
    const [dia, mes] = dataStr.split('/');
    return `${dia}/${mes}`;
  };

  const totalReceitasGeral = transacoes.filter(t => t.tipo === 'receita').reduce((acc, t) => acc + t.valor, 0);
  const totalDespesasGeral = transacoes.filter(t => t.tipo === 'despesa').reduce((acc, t) => acc + t.valor, 0);
  const saldoAtual = totalReceitasGeral - totalDespesasGeral;

  const receitasDoMes = transacoesDoMes.filter(t => t.tipo === 'receita').reduce((acc, t) => acc + t.valor, 0);
  const despesasDoMes = transacoesDoMes.filter(t => t.tipo === 'despesa').reduce((acc, t) => acc + t.valor, 0);

  const totalFaturaMes = transacoesDoMes.filter(t => t.pagamento === 'Crédito' && t.tipo === 'despesa').reduce((acc, t) => acc + t.valor, 0);
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
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const coresCategorias = {
    'Alimentação': '#818cf8',
    'Moto': '#10b981',
    'Carro Clássico': '#f59e0b',
    'Carro': '#f59e0b',
    'Educação / Faculdade': '#3b82f6',
    'Lazer': '#f43f5e',
    'Moradia': '#a855f7',
    'Outros': '#6b7280'
  };

  const coresPagamento = {
    'Pix': '#06b6d4',
    'Crédito': '#ec4899',
    'Débito': '#8b5cf6',
    'Dinheiro': '#eab308'
  };

  const obterIconeCategoria = (categoria) => {
    switch (categoria) {
      case 'Alimentação': return <FiCoffee size={18} />;
      case 'Moto': return <FiTool size={18} />;
      case 'Carro Clássico':
      case 'Carro': return <FiTruck size={18} />;
      case 'Educação / Faculdade': return <FiBookOpen size={18} />;
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
           const partes = t.data.split('/');
           return partes[1] === mes.num && partes[2] === mes.ano;
        })
        .reduce((acc, t) => acc + t.valor, 0);
      return { nome: mes.nome.substring(0, 3).toUpperCase(), total, num: mes.num, ano: mes.ano };
    });
  };

  const historicoData = isCardFlipped && abaGrafico === 1 ? gerarHistoricoFaturas() : [];
  const maxFaturaHist = historicoData.length > 0 ? Math.max(...historicoData.map(h => h.total), 1) : 1;

  const despesasGrafico = transacoesDaAbaAtiva
    .filter(t => t.tipo === 'despesa')
    .reduce((acc, t) => {
      acc[t.categoria] = (acc[t.categoria] || 0) + t.valor;
      return acc;
    }, {});

  const pagamentosGrafico = transacoesDaAbaAtiva
    .filter(t => t.tipo === 'despesa')
    .reduce((acc, t) => {
      acc[t.pagamento] = (acc[t.pagamento] || 0) + t.valor;
      return acc;
    }, {});
    
  const totalDespesasAtivas = transacoesDaAbaAtiva.filter(t => t.tipo === 'despesa').reduce((acc, t) => acc + t.valor, 0);

  const gerarBackgroundGrafico = (dados, mapaCores, total) => {
    if (total === 0) return '#27272a';
    const chaves = Object.keys(dados);
    if (chaves.length === 1) {
      return mapaCores[chaves[0]] || '#10b981';
    }
    let acumulado = 0;
    const gradientStops = Object.entries(dados).map(([chave, valor]) => {
      const porcentagem = (valor / total) * 100;
      const inicio = acumulado;
      const fim = acumulado + porcentagem;
      acumulado = fim;
      const cor = mapaCores[chave] || '#6b7280';
      return `${cor} ${inicio}% ${fim}%`;
    });
    return `conic-gradient(${gradientStops.join(', ')})`;
  };

  const backgroundGraficoCat = gerarBackgroundGrafico(despesasGrafico, coresCategorias, totalDespesasAtivas);
  const backgroundGraficoPag = gerarBackgroundGrafico(pagamentosGrafico, coresPagamento, totalDespesasAtivas);

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

  const handleSalvarConfigCartao = () => {
    setDiaVencimento(String(tempDiaVencimento).padStart(2, '0'));
    setCorCartao(tempCor);
    setApelidoCartao(tempApelido);
    setFinalCartao(tempFinal || '0000');
    setNomeCartao(tempNome.toUpperCase());
    setBandeiraCartao(tempBandeira);
    setShowCardSettings(false);
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
    setValorInput((transacaoSelecionada.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    setTituloInput(transacaoSelecionada.titulo);
    setCategoriaInput(transacaoSelecionada.categoria);
    setPagamentoInput(transacaoSelecionada.pagamento);
    const [dia, mes, ano] = transacaoSelecionada.data.split('/');
    setDataInput(`${ano}-${mes}-${dia}`);
    setObservacaoInput(transacaoSelecionada.observacao || '');
    setTipoTransacao(transacaoSelecionada.tipo);
    setEhRecorrente(transacaoSelecionada.recorrente);
    setEditandoId(transacaoSelecionada.id);

    setTransacaoSelecionada(null); 
    setShowBottomSheet(true);      
  };

  const handleConfirmarLancamento = async () => {
    if (!valorInput || !tituloInput || !categoriaInput || !pagamentoInput) {
      alert("Por favor, preencha o valor, título, categoria e forma de pagamento!");
      return;
    }

    const valorNumerico = parseFloat(valorInput.replace(/\./g, '').replace(',', '.'));
    const tituloFormatado = tituloInput.trim().toLowerCase().split(/\s+/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    const horaAtual = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const dataHoraLocal = `${dataInput}T${horaAtual}:00`;

    const payloadParaAPI = {
      id: editandoId || 0,
      usuarioId: usuarioLogado.id, 
      contaOrigemId: mapaContasAPI[pagamentoInput], 
      contaDestinoId: null, 
      categoriaId: mapaCategoriasAPI[categoriaInput],
      descricao: tituloFormatado,
      valor: valorNumerico,
      tipo: tipoTransacao,
      dataTransacao: dataHoraLocal,
      pago: true,
      ehRecorrente: ehRecorrente,
      observacao: observacaoInput
    };

    try {
      if (editandoId) {
        await axios.put(`${TRANSACOES_API_URL}/${editandoId}`, payloadParaAPI);
        
        const dataCertaRetorno = `${dataInput.split('-')[2]}/${dataInput.split('-')[1]}/${dataInput.split('-')[0]}`;
        const transacaoAtualizada = {
          id: editandoId,
          titulo: tituloFormatado,
          categoria: categoriaInput, 
          pagamento: pagamentoInput, 
          observacao: observacaoInput,
          data: dataCertaRetorno,
          hora: horaAtual,
          valor: valorNumerico, 
          tipo: tipoTransacao,
          recorrente: ehRecorrente
        };

        setTransacoes(transacoes.map(t => t.id === editandoId ? transacaoAtualizada : t));
      } else {
        const parcelas = ehRecorrente ? 12 : 1;
        let primeiraTransacaoSalva = null;

        for (let i = 0; i < parcelas; i++) {
          const dataParcela = new Date(`${dataInput}T12:00:00`);
          dataParcela.setMonth(dataParcela.getMonth() + i);
          const dataFormatada = dataParcela.toISOString().substring(0, 10);
          
          const payloadCriacao = { ...payloadParaAPI, dataTransacao: `${dataFormatada}T${horaAtual}:00` };
          const response = await axios.post(TRANSACOES_API_URL, payloadCriacao);
          
          if (i === 0) primeiraTransacaoSalva = response.data;
        }
        
        if (primeiraTransacaoSalva) {
          const dataQuebradaRetorno = primeiraTransacaoSalva.dataTransacao.split('T');
          const dataBrutaRetorno = dataQuebradaRetorno[0].split('-');
          const novaTransacao = {
            id: primeiraTransacaoSalva.id,
            titulo: primeiraTransacaoSalva.descricao,
            categoria: categoriaInput, 
            pagamento: pagamentoInput, 
            observacao: primeiraTransacaoSalva.observacao || '',
            data: `${dataBrutaRetorno[2]}/${dataBrutaRetorno[1]}/${dataBrutaRetorno[0]}`,
            hora: dataQuebradaRetorno[1].substring(0, 5),
            valor: primeiraTransacaoSalva.valor, 
            tipo: primeiraTransacaoSalva.tipo,
            recorrente: primeiraTransacaoSalva.ehRecorrente
          };
          setTransacoes(transacoesAntigas => [novaTransacao, ...transacoesAntigas]);
        }
      }
      
      setValorInput('');
      setTituloInput('');
      setCategoriaInput('');
      setPagamentoInput('');
      setObservacaoInput('');
      setEhRecorrente(false);
      setEditandoId(null);
      setShowBottomSheet(false);
      
      const mesNovo = dataInput.split('-')[1];
      const anoNovo = dataInput.split('-')[0];
      const objMes = listaMeses.find(m => m.num === mesNovo && m.ano === anoNovo);
      if (objMes) setMesFiltro(objMes);

    } catch (error) {
      console.error("Erro ao salvar transação:", error);
      alert("Houve um erro ao salvar. Verifique se a API está rodando.");
    }
  };

  const handleEfetuarExclusao = async (id) => {
    try {
      await axios.delete(`${TRANSACOES_API_URL}/${id}`);
      
      setTransacoes(transacoes.filter(t => t.id !== id));
      setTransacaoSelecionada(null);
      setConfirmandoExclusao(false);
    } catch (error) {
      console.error("Erro ao excluir transação:", error);
      alert("Houve um erro ao tentar excluir. Tente novamente.");
    }
  };

  // ==========================================
  // RENDERIZAÇÃO CONDICIONAL: TELA DE LOGIN / CADASTRO
  // ==========================================
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
      `}</style>

      {/* HEADER (COM NOME FIRMO APP E NOME DO USUÁRIO LOGADO) */}
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
        <button className="btn btn-link text-light opacity-75 p-0" onClick={() => setShowBalance(!showBalance)}>
          {showBalance ? <FiEye size={24} /> : <FiEyeOff size={24} />}
        </button>
      </header>

      {/* CARD PRINCIPAL COM FLIP */}
      <section className="flip-container" onClick={() => setIsCardFlipped(!isCardFlipped)}>
        <div className="flip-card-inner" style={{ transform: isCardFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
          
          {/* FRENTE: SALDO GERAL */}
          <div className="flip-card-front card dark-card p-4">
            <p className="text-light opacity-75 mb-1">Saldo atual livre</p>
            <h1 className="mb-4 fw-bold text-white">
              {showBalance ? formatarMoeda(saldoAtual) : 'R$ •••••••'}
            </h1>
            
            <div className="d-flex justify-content-between">
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

          {/* COSTAS: CARTÃO DE CRÉDITO REALISTA */}
          <div 
            className="flip-card-back shadow-lg" 
            style={{ 
              background: corCartao, 
              padding: '1.25rem', 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'space-between', 
              borderRadius: '1rem',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <div className="d-flex justify-content-between align-items-start">
              <span className="text-white fw-bold opacity-75" style={{ fontSize: '1rem' }}>{apelidoCartao}</span>
              <button 
                className="btn btn-link p-0 text-white shadow-none" 
                onClick={(e) => { 
                  e.stopPropagation(); 
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
                <span className="text-light opacity-75">Vence: {diaVencimento}/{mesVencimentoFatura}</span>
                <span className={`badge bg-dark bg-opacity-25 border border-light border-opacity-25 ${statusFatura.cor}`}>
                  {statusFatura.texto}
                </span>
              </div>
            </div>

            <div className="mt-auto">
              <h5 className="text-white mb-2 fw-bold opacity-75" style={{ letterSpacing: '2px', fontSize: '1.1rem' }}>
                **** **** **** {finalCartao}
              </h5>
              <div className="d-flex justify-content-between align-items-end">
                <small className="text-light opacity-75 text-uppercase fw-bold m-0 p-0" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>
                  {nomeCartao || (usuarioLogado ? usuarioLogado.nome : '')}
                </small>
                {renderLogoBandeira()}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* CARROSSEL DE GRÁFICOS */}
      <section className="card dark-card p-4 mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <small className="text-light opacity-75 d-block" style={{ fontSize: '11px' }}>
              {isCardFlipped ? 'Este mês (Cartão)' : 'Este mês (Geral)'}
            </small>
            <h6 className="mb-0 fw-bold text-white">
              {isCardFlipped 
                ? (abaGrafico === 0 ? 'Distribuição por Categoria' : 'Histórico de Faturas') 
                : (abaGrafico === 0 ? 'Distribuição por Categoria' : 'Formas de Pagamento')
              }
            </h6>
          </div>
          
          <div className="d-flex align-items-center gap-3">
            <span 
              className="badge bg-secondary bg-opacity-25 text-light px-3 py-2 rounded-pill text-uppercase d-flex align-items-center gap-1" 
              style={{ fontSize: '11px', letterSpacing: '0.5px', cursor: 'pointer' }}
              onClick={() => setShowMonthSelector(true)}
            >
              {mesFiltro.nome} <FiChevronDown size={14} className="ms-1" />
            </span>

            <div className="d-flex align-items-center gap-1 bg-dark bg-opacity-50 px-2 py-1 rounded-pill">
              <span 
                style={{ 
                  width: abaGrafico === 0 ? '16px' : '6px', 
                  height: '6px', 
                  borderRadius: '3px', 
                  backgroundColor: abaGrafico === 0 ? '#10b981' : '#6b7280', 
                  cursor: 'pointer',
                  transition: '0.3s'
                }}
                onClick={() => setAbaGrafico(0)}
              ></span>
              <span 
                style={{ 
                  width: abaGrafico === 1 ? '16px' : '6px', 
                  height: '6px', 
                  borderRadius: '3px', 
                  backgroundColor: abaGrafico === 1 ? '#10b981' : '#6b7280', 
                  cursor: 'pointer',
                  transition: '0.3s'
                }}
                onClick={() => setAbaGrafico(1)}
              ></span>
            </div>
          </div>
        </div>

        {/* ABA 0: SEMPRE CATEGORIAS (Cartão ou Geral) */}
        {abaGrafico === 0 && (
          <div 
            className="d-flex align-items-center justify-content-between mt-3"
            style={{ cursor: 'pointer' }}
            onClick={() => setAbaGrafico(1)}
          >
            <div 
              style={{ 
                width: '110px', 
                height: '110px', 
                borderRadius: '50%', 
                background: backgroundGraficoCat,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
              }}
            >
              <div style={{ width: '70px', height: '70px', borderRadius: '50%', backgroundColor: '#1e1e24' }}></div>
            </div>

            <div className="d-flex flex-column gap-2" style={{ fontSize: '13px', width: '160px' }}>
              {totalDespesasAtivas === 0 ? (
                <span className="text-light opacity-50 text-center w-100">Sem despesas</span>
              ) : (
                Object.entries(despesasGrafico).map(([cat, valor]) => {
                  const porcentagem = ((valor / totalDespesasAtivas) * 100).toFixed(0);
                  const corCat = coresCategorias[cat] || '#6b7280';
                  return (
                    <div key={cat} className="d-flex align-items-center justify-content-between">
                      <span className="d-flex align-items-center text-light opacity-75 text-truncate" style={{ maxWidth: '100px' }}>
                        <span className="rounded-circle me-2 flex-shrink-0" style={{ width: '8px', height: '8px', backgroundColor: corCat }}></span> {cat}
                      </span>
                      <span className="fw-bold text-white">{porcentagem}%</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ABA 1 + CARTÃO: HISTÓRICO DE FATURAS SEM BARRAS CLICÁVEIS */}
        {abaGrafico === 1 && isCardFlipped && (
          <div 
            className="d-flex justify-content-between align-items-end mt-3 pb-1"
            style={{ height: '110px', padding: '0 10px' }}
          >
            {historicoData.map((hist, i) => {
              const heightPct = Math.max((hist.total / maxFaturaHist) * 100, 5);
              return (
                <div 
                  key={i} 
                  className="d-flex flex-column align-items-center justify-content-end" 
                  style={{ height: '100%' }}
                >
                  <span className="text-light opacity-75 mb-2" style={{ fontSize: '9px', whiteSpace: 'nowrap' }}>
                    {hist.total > 0 ? `R$ ${Math.round(hist.total)}` : '-'}
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
          <div 
            className="d-flex align-items-center justify-content-between mt-3"
            style={{ cursor: 'pointer' }}
            onClick={() => setAbaGrafico(0)}
          >
            <div 
              style={{ 
                width: '110px', 
                height: '110px', 
                borderRadius: '50%', 
                background: backgroundGraficoPag,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
              }}
            >
              <div style={{ width: '70px', height: '70px', borderRadius: '50%', backgroundColor: '#1e1e24' }}></div>
            </div>

            <div className="d-flex flex-column gap-2" style={{ fontSize: '13px', width: '160px' }}>
              {totalDespesasAtivas === 0 ? (
                <span className="text-light opacity-50 text-center w-100">Sem despesas</span>
              ) : (
                Object.entries(pagamentosGrafico).map(([pag, valor]) => {
                  const porcentagem = ((valor / totalDespesasAtivas) * 100).toFixed(0);
                  const corPag = coresPagamento[pag] || '#6b7280';
                  return (
                    <div key={pag} className="d-flex align-items-center justify-content-between">
                      <span className="d-flex align-items-center text-light opacity-75 text-truncate" style={{ maxWidth: '100px' }}>
                        <span className="rounded-circle me-2 flex-shrink-0" style={{ width: '8px', height: '8px', backgroundColor: corPag }}></span> {pag}
                      </span>
                      <span className="fw-bold text-white">{porcentagem}%</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
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

      {/* LISTA DE TRANSAÇÕES AGRUPADAS POR DATA */}
      <section className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="text-white mb-0 fw-bold">
            {termoBusca 
              ? 'Resultados da busca' 
              : (isCardFlipped ? `Gastos no Cartão - ${mesFiltro.nome}` : `Transações Gerais - ${mesFiltro.nome}`)
            }
          </h6>
        </div>
        
        {transacoesAgrupadas.length === 0 ? (
          <div className="card dark-card text-center p-4">
            <p className="text-light opacity-50 mb-0">Nenhuma transação encontrada.</p>
            {!termoBusca && <small className="text-light opacity-50">Que tal adicionar alguma?</small>}
          </div>
        ) : (
          transacoesAgrupadas.map(grupo => (
            <div key={grupo.dataString} className="mb-4">
              
              <small className="text-light opacity-50 fw-bold d-block mb-2 ms-2">
                {formatarCabecalhoData(grupo.dataString)}
              </small>

              {grupo.transacoes.map((t) => (
                <div 
                  key={t.id} 
                  className="card dark-card p-3 d-flex flex-row justify-content-between align-items-center mb-2 transaction-hover border-0 shadow-sm"
                  style={{ cursor: 'pointer' }}
                  onClick={() => { setTransacaoSelecionada(t); setConfirmandoExclusao(false); }}
                >
                  <div className="d-flex align-items-center">
                      <div className="bg-secondary bg-opacity-25 p-2 rounded-circle me-3 text-white d-flex align-items-center justify-content-center" style={{ width: '38px', height: '38px' }}>
                        {obterIconeCategoria(t.categoria)}
                      </div>
                      <div>
                        <h6 className="mb-0 text-white" style={{ fontSize: '15px' }}>{t.titulo}</h6>
                        <small className="text-light opacity-75">{t.categoria} • {t.pagamento}</small>
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
              ))}
            </div>
          ))
        )}
      </section>

      {/* DOWNBAR */}
      <nav className="bottom-bar">
        <div className="nav-icon active"><FiHome size={28} /></div>
        <div className="fab-container">
          <button className="fab-button" onClick={() => setShowBottomSheet(true)}>
            <FiPlus size={32} />
          </button>
        </div>
        <div className="nav-icon"><FiCreditCard size={28} /></div>
      </nav>

      {/* MENU PERFIL (DESIGN PREMIUM BANCOS) */}
      <Offcanvas 
        show={showProfile} 
        onHide={() => setShowProfile(false)} 
        placement="start" 
        style={{ backgroundColor: '#1e1e24', color: '#fff', maxWidth: '300px', borderRight: '1px solid rgba(255,255,255,0.1)' }}
      >
        <Offcanvas.Body className="p-0 d-flex flex-column">
          
          {/* CABEÇALHO DO PERFIL COM GLOW */}
          <div className="p-4 text-center position-relative" style={{ background: 'linear-gradient(to bottom, rgba(16, 185, 129, 0.15), transparent)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <button 
              className="btn btn-link position-absolute top-0 end-0 mt-3 me-2 text-white opacity-50 shadow-none"
              onClick={() => setShowProfile(false)}
            >
              X
            </button>
            <div className="rounded-circle d-flex justify-content-center align-items-center mx-auto mb-3 mt-3 shadow-lg" 
                 style={{ width: '80px', height: '80px', background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', color: '#fff', fontWeight: 'bold', fontSize: '32px' }}>
              {usuarioLogado?.nome ? usuarioLogado.nome.charAt(0).toUpperCase() : 'U'}
            </div>
            <h5 className="fw-bold mb-1 text-white">{usuarioLogado?.nome}</h5>
            <small className="text-light opacity-75">{usuarioLogado?.email}</small>
          </div>

          {/* LISTA DE OPÇÕES AGRUPADAS */}
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
              <div className="col-5">
                <label className="form-label text-light opacity-75 small mb-1">Vencimento</label>
                <input 
                  type="number"
                  min="1"
                  max="31"
                  className="form-control bg-dark border-secondary text-white shadow-none"
                  value={tempDiaVencimento}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, '');
                    if (val !== '' && parseInt(val, 10) > 31) val = '31';
                    setTempDiaVencimento(val);
                  }}
                />
              </div>
              
              <div className="col-7">
                <label className="form-label text-light opacity-75 small mb-1">Cor do Cartão</label>
                <select 
                  className="form-select bg-dark border-secondary text-white shadow-none"
                  value={tempCor}
                  onChange={(e) => setTempCor(e.target.value)}
                >
                  <option value="linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)">Roxo (Padrão)</option>
                  <option value="linear-gradient(135deg, #b45309 0%, #d97706 100%)">Ouro / Gold</option>
                  <option value="linear-gradient(135deg, #064e3b 0%, #047857 100%)">Esmeralda</option>
                  <option value="linear-gradient(135deg, #171717 0%, #3f3f46 100%)">Black</option>
                  <option value="linear-gradient(135deg, #7f1d1d 0%, #b91c1c 100%)">Vermelho</option>
                </select>
              </div>
            </div>

          </div>

          <button 
            className="btn w-100 py-3 rounded-4 fw-bold shadow text-white"
            style={{ backgroundColor: '#10b981' }}
            onClick={handleSalvarConfigCartao}
          >
            Salvar Alterações
          </button>
        </Offcanvas.Body>
      </Offcanvas>

      {/* GAVETA DE MÊS COM SCROLL PARA NÃO CORTAR MESES ANTIGOS */}
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
                className={`btn w-100 py-3 rounded-4 fw-bold shadow-sm ${mesFiltro.num === mes.num && mesFiltro.ano === mes.ano ? 'text-white' : 'btn-dark text-light'}`}
                style={mesFiltro.num === mes.num && mesFiltro.ano === mes.ano ? { backgroundColor: '#10b981', borderColor: '#10b981' } : {}}
                onClick={() => {
                  setMesFiltro(mes);
                  setShowMonthSelector(false);
                  setTermoBusca(''); 
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
        }} 
        placement="bottom" 
        style={{ height: 'auto', maxHeight: '90vh', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', backgroundColor: '#1e1e24', color: '#fff' }}
      >
        <Offcanvas.Header closeButton closeVariant="white" className="pb-0 border-0 mt-2">
          <Offcanvas.Title className="w-100 text-center fw-bold fs-6 text-white">
            {editandoId ? 'Editar Lançamento' : 'Novo Lançamento'}
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body style={{ overflowY: 'auto', paddingBottom: '80px' }}>
          <div className="d-flex justify-content-center mb-4 bg-dark rounded-pill p-1 mx-auto" style={{ maxWidth: '250px' }}>
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

          <div className="text-center mb-4">
            <small className="text-light opacity-75 fw-bold d-block mb-2">VALOR</small>
            <input 
              type="text" 
              inputMode="numeric"
              className={`form-control bg-transparent border-0 text-center fw-bold fs-1 py-0 shadow-none w-100 ${tipoTransacao === 'despesa' ? 'text-white' : 'text-emerald'}`} 
              style={{ color: tipoTransacao === 'receita' ? '#10b981 !important' : '#ffffff' }}
              placeholder="R$ 0,00" 
              value={valorInput ? `R$ ${valorInput}` : ''}
              onChange={handleValorChange}
            />
          </div>

          <div className="d-flex flex-column gap-3 mb-4">
            <div className="row g-2">
              <div className="col-6">
                <label className="form-label text-light opacity-75 small mb-1">Título</label>
                <input 
                  type="text" 
                  className="form-control bg-dark border-secondary text-white shadow-none" 
                  placeholder="Ex: Troca de óleo" 
                  value={tituloInput}
                  onChange={(e) => setTituloInput(e.target.value)}
                />
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
                      <option value="Educação / Faculdade">Educação / Faculdade</option>
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
              <textarea 
                className="form-control bg-dark border-secondary text-white shadow-none" 
                rows="2"
                placeholder="Detalhes adicionais (Opcional)" 
                value={observacaoInput}
                onChange={(e) => setObservacaoInput(e.target.value)}
              />
            </div>
          </div>

          {!editandoId && (
            <div className="form-check form-switch d-flex align-items-center justify-content-between px-0 mb-4">
              <label className="form-check-label text-light opacity-75 ms-0" htmlFor="recorrente">É uma transação fixa/recorrente?</label>
              <input 
                className="form-check-input ms-3 shadow-none mt-0" 
                type="checkbox" 
                role="switch" 
                id="recorrente" 
                style={{ width: '45px', height: '24px', cursor: 'pointer' }}
                checked={ehRecorrente}
                onChange={(e) => setEhRecorrente(e.target.checked)}
              />
            </div>
          )}

          <button 
            className="btn w-100 py-3 rounded-4 fw-bold shadow text-dark"
            style={{ backgroundColor: '#10b981' }}
            onClick={handleConfirmarLancamento}
          >
            {editandoId ? 'Salvar Alterações' : 'Confirmar Lançamento'}
          </button>
        </Offcanvas.Body>
      </Offcanvas>

      {/* GAVETA DETALHES TRANSAÇÃO (COM MENU SUPERIOR) */}
      <Offcanvas 
        show={!!transacaoSelecionada} 
        onHide={() => { setTransacaoSelecionada(null); setConfirmandoExclusao(false); }} 
        placement="bottom" 
        style={{ height: 'auto', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', backgroundColor: '#1e1e24', color: '#fff', paddingBottom: '20px' }}
      >
        <Offcanvas.Header closeButton closeVariant="white" className="pb-0 border-0 mt-2">
          {/* BOTÃO DE OPÇÕES (TRES PONTINHOS) */}
          <Offcanvas.Title className="w-100 text-center fw-bold fs-6 text-white position-relative">
            Detalhes do Lançamento
            {!confirmandoExclusao && (
              <button 
                className="btn btn-link p-0 position-absolute end-0 top-0 text-white shadow-none opacity-75"
                style={{ marginRight: '35px' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmandoExclusao(true); 
                }}
              >
                <FiMoreVertical size={20} />
              </button>
            )}
          </Offcanvas.Title>
        </Offcanvas.Header>
        
        {transacaoSelecionada && (
          <Offcanvas.Body>
            <div className="text-center mb-4">
              <div className="bg-secondary bg-opacity-25 p-3 rounded-circle d-inline-block text-white mb-2">
                {obterIconeCategoria(transacaoSelecionada.categoria)}
              </div>
              <h4 className="fw-bold mb-1">{transacaoSelecionada.titulo}</h4>
              <h2 className={transacaoSelecionada.tipo === 'despesa' ? 'text-white' : 'text-emerald'}>
                {showBalance 
                  ? <>{transacaoSelecionada.tipo === 'despesa' ? '- ' : '+ '} {formatarMoeda(transacaoSelecionada.valor)}</>
                  : '••••••••'
                }
              </h2>
            </div>

            <div className="card dark-card p-3 mb-4 bg-dark border-0">
              <div className="d-flex justify-content-between mb-2">
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

            {transacaoSelecionada.observacao && (
              <div className="mb-4">
                <h6 className="text-light opacity-75 mb-2"><FiFileText className="me-2"/> Observações</h6>
                <div className="card dark-card p-3 bg-dark border-0 text-white opacity-75">
                  {transacaoSelecionada.observacao}
                </div>
              </div>
            )}

            {/* OPÇÕES SECUNDÁRIAS OCULTAS ATRÁS DO CLIQUE */}
            {confirmandoExclusao && (
              <div className="p-3 rounded-4 bg-dark border border-secondary border-opacity-25 text-center">
                <p className="text-light small mb-3 fw-bold">O que deseja fazer com este lançamento?</p>
                <div className="d-flex flex-column gap-2">
                  <button 
                    className="btn btn-secondary w-100 py-3 rounded-3 fw-bold text-white d-flex align-items-center justify-content-center gap-2"
                    onClick={handleAbrirEdicao}
                  >
                    <FiEdit2 size={18} /> Editar dados
                  </button>
                  <button 
                    className="btn btn-outline-danger w-100 py-3 rounded-3 fw-bold text-danger d-flex align-items-center justify-content-center gap-2"
                    onClick={() => {
                      if(window.confirm('Tem certeza que deseja apagar? Essa ação não pode ser desfeita.')) {
                        handleEfetuarExclusao(transacaoSelecionada.id);
                      }
                    }}
                  >
                    <FiTrash2 size={18} /> Excluir permanentemente
                  </button>
                  <button className="btn btn-link text-light opacity-75 mt-2" onClick={() => setConfirmandoExclusao(false)}>
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