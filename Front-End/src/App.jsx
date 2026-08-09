import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Offcanvas } from 'react-bootstrap';
import './App.css';
import { 
  FiEye, FiEyeOff, FiHome, FiCreditCard, FiPlus, FiUser, FiSettings, 
  FiLogOut, FiChevronRight, FiTag, FiCalendar, FiFileText, 
  FiCoffee, FiTool, FiTruck, FiBookOpen, FiSmile, FiHome as FiHomeIcon, FiDollarSign, FiGift, FiChevronDown, FiSearch, FiClock 
} from 'react-icons/fi';

function App() {
  const [showBalance, setShowBalance] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [showMonthSelector, setShowMonthSelector] = useState(false);
  const [transacaoSelecionada, setTransacaoSelecionada] = useState(null);
  const [tipoTransacao, setTipoTransacao] = useState('despesa');
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [abaGrafico, setAbaGrafico] = useState(0);

  // ESTADO DA BUSCA
  const [termoBusca, setTermoBusca] = useState('');

  // ESTADO DO MÊS SELECIONADO (Filtro)
  const [mesFiltro, setMesFiltro] = useState({ nome: 'Agosto', num: '08', ano: '2026' });

  const listaMeses = [
    { nome: 'Agosto', num: '08', ano: '2026' },
    { nome: 'Julho', num: '07', ano: '2026' },
    { nome: 'Junho', num: '06', ano: '2026' },
    { nome: 'Maio', num: '05', ano: '2026' },
    { nome: 'Abril', num: '04', ano: '2026' }
  ];

  // ESTADOS DO FORMULÁRIO
  const [valorInput, setValorInput] = useState('');
  const [tituloInput, setTituloInput] = useState('');
  const [categoriaInput, setCategoriaInput] = useState('');
  const [pagamentoInput, setPagamentoInput] = useState('');
  const [dataInput, setDataInput] = useState(new Date().toISOString().substring(0,10));
  const [observacaoInput, setObservacaoInput] = useState('');
  const [ehRecorrente, setEhRecorrente] = useState(false);
  
  const [transacoes, setTransacoes] = useState([]);

  // LÓGICA DE FILTRAGEM POR MÊS E BUSCA GLOBAL
  const transacoesDoMes = transacoes.filter(t => {
    const partes = t.data.split('/');
    if (partes.length === 3) {
      return partes[1] === mesFiltro.num && partes[2] === mesFiltro.ano;
    }
    return true;
  });

  const transacoesParaExibir = termoBusca 
    ? transacoes.filter(t => {
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
    : transacoesDoMes;

  // LÓGICA DE AGRUPAMENTO POR DIA 
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

  // --- DICIONÁRIOS DE TRADUÇÃO (FRONT -> BACK) ---
  const mapaCategoriasAPI = {
    'Alimentação': 1,
    'Moto': 2,
    'Carro': 3,
    'Educação / Faculdade': 4,
    'Lazer': 5,
    'Moradia': 6,
    'Salário': 7,
    'Vale (VR + VT)': 8,
    'Rendimento': 9,
    'Outros': 10
  };

  const mapaContasAPI = {
    'Pix': 2,
    'Crédito': 3,
    'Débito': 4,
    'Dinheiro': 5,
    'Boleto': 6
  };
  // ---------------------------------------------------------

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

  const despesasPorCategoria = transacoesDoMes
    .filter(t => t.tipo === 'despesa')
    .reduce((acc, t) => {
      acc[t.categoria] = (acc[t.categoria] || 0) + t.valor;
      return acc;
    }, {});

  const despesasPorPagamento = transacoesDoMes
    .filter(t => t.tipo === 'despesa')
    .reduce((acc, t) => {
      acc[t.pagamento] = (acc[t.pagamento] || 0) + t.valor;
      return acc;
    }, {});

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

  const backgroundGraficoCat = gerarBackgroundGrafico(despesasPorCategoria, coresCategorias, despesasDoMes);
  const backgroundGraficoPag = gerarBackgroundGrafico(despesasPorPagamento, coresPagamento, despesasDoMes);

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

  const handleConfirmarLancamento = () => {
    if (!valorInput || !tituloInput || !categoriaInput || !pagamentoInput) {
      alert("Por favor, preencha o valor, título, categoria e forma de pagamento!");
      return;
    }

    const valorNumerico = parseFloat(valorInput.replace(/\./g, '').replace(',', '.'));
    const tituloFormatado = tituloInput.charAt(0).toUpperCase() + tituloInput.slice(1);
    const horaAtual = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    // --- PACOTE DE DADOS PARA A API C# (Onde a mágica da integração começa) ---
    // Ajuste 3: Tratando a data local (Input type="date") para o padrão ISO que o C# aceita
    const dataHoraIso = new Date(`${dataInput}T${horaAtual}:00`).toISOString();

    const payloadParaAPI = {
      usuarioId: 1, // Ajuste 4: Mockado para o usuário provisório
      contaOrigemId: tipoTransacao === 'despesa' ? mapaContasAPI[pagamentoInput] : null,
      contaDestinoId: tipoTransacao === 'receita' ? mapaContasAPI[pagamentoInput] : null,
      categoriaId: mapaCategoriasAPI[categoriaInput], // Ajuste 1: Usando dicionário
      descricao: tituloFormatado, // Ajuste 2: Mudando de titulo para descricao
      valor: valorNumerico,
      tipo: tipoTransacao,
      dataTransacao: dataHoraIso, // Ajuste 3: Data convertida
      pago: true, // Ajuste 4: Obrigatório na sua API
      ehRecorrente: ehRecorrente,
      observacao: observacaoInput
    };
    
    // Deixei este console para você inspecionar e ver o formato perfeito saindo do React
    console.log("Dados prontos para o POST na API:", payloadParaAPI);
    // --------------------------------------------------------------------------

    // A partir daqui mantemos o estado visual local por enquanto (será trocado pelo Axios depois)
    const novaTransacao = {
      id: Date.now(),
      titulo: tituloFormatado,
      categoria: categoriaInput,
      pagamento: pagamentoInput,
      observacao: observacaoInput,
      data: dataInput.split('-').reverse().join('/'),
      hora: horaAtual,
      valor: valorNumerico, 
      tipo: tipoTransacao,
      recorrente: ehRecorrente
    };

    setTransacoes([novaTransacao, ...transacoes]);
    
    setValorInput('');
    setTituloInput('');
    setCategoriaInput('');
    setPagamentoInput('');
    setObservacaoInput('');
    setEhRecorrente(false);
    setShowBottomSheet(false);
    
    const mesNovo = dataInput.split('-')[1];
    const anoNovo = dataInput.split('-')[0];
    const objMes = listaMeses.find(m => m.num === mesNovo && m.ano === anoNovo);
    if (objMes) setMesFiltro(objMes);
  };

  const handleEfetuarExclusao = (id) => {
    setTransacoes(transacoes.filter(t => t.id !== id));
    setTransacaoSelecionada(null);
    setConfirmandoExclusao(false);
  };

  return (
    <div className="app-container pt-4 px-3">
      
      {/* HEADER */}
      <header className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <div 
            className="rounded-circle d-flex justify-content-center align-items-center me-3 shadow-sm" 
            style={{ width: '48px', height: '48px', backgroundColor: '#10b981', color: '#121214', fontWeight: 'bold', fontSize: '20px', cursor: 'pointer' }}
            onClick={() => setShowProfile(true)}
          >
            M
          </div>
          <div>
            <span className="text-light opacity-75 small d-block" style={{ fontSize: '12px', letterSpacing: '1px' }}>BEM-VINDO</span>
            <h5 className="mb-0 fw-bold text-white">Olá, Matheus</h5>
          </div>
        </div>
        <button className="btn btn-link text-light opacity-75 p-0" onClick={() => setShowBalance(!showBalance)}>
          {showBalance ? <FiEye size={24} /> : <FiEyeOff size={24} />}
        </button>
      </header>

      {/* CARD PRINCIPAL */}
      <section className="card dark-card p-4 mb-4">
        <p className="text-light opacity-75 mb-1">Saldo atual</p>
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
      </section>

      {/* CARROSSEL DE GRÁFICOS */}
      <section className="card dark-card p-4 mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <small className="text-light opacity-75 d-block" style={{ fontSize: '11px' }}>Este mês</small>
            <h6 className="mb-0 fw-bold text-white">
              {abaGrafico === 0 ? 'Distribuição por Categoria' : 'Formas de Pagamento'}
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
              {despesasDoMes === 0 ? (
                <span className="text-light opacity-50 text-center w-100">Sem despesas</span>
              ) : (
                Object.entries(despesasPorCategoria).map(([cat, valor]) => {
                  const porcentagem = ((valor / despesasDoMes) * 100).toFixed(0);
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

        {abaGrafico === 1 && (
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
              {despesasDoMes === 0 ? (
                <span className="text-light opacity-50 text-center w-100">Sem despesas</span>
              ) : (
                Object.entries(despesasPorPagamento).map(([pag, valor]) => {
                  const porcentagem = ((valor / despesasDoMes) * 100).toFixed(0);
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
            {termoBusca ? 'Resultados da busca' : `Transações de ${mesFiltro.nome}`}
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
              
              {/* CABEÇALHO DA DATA DO GRUPO */}
              <small className="text-light opacity-50 fw-bold d-block mb-2 ms-2">
                {formatarCabecalhoData(grupo.dataString)}
              </small>

              {/* TRANSAÇÕES DESTE DIA */}
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
                  {/* LIMPEZA NO VALOR: Removida a data para evitar poluição */}
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

      {/* MENU PERFIL */}
      <Offcanvas show={showProfile} onHide={() => setShowProfile(false)} placement="start" style={{ backgroundColor: '#1e1e24', color: '#fff', maxWidth: '300px' }}>
        <Offcanvas.Header closeButton closeVariant="white" className="border-bottom border-secondary border-opacity-25">
          <Offcanvas.Title className="fw-bold">Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="position-relative">
          <div className="text-center mb-5 mt-3">
            <div className="rounded-circle d-flex justify-content-center align-items-center mx-auto mb-3 shadow" style={{ width: '80px', height: '80px', backgroundColor: '#10b981', color: '#121214', fontWeight: 'bold', fontSize: '32px' }}>M</div>
            <h5 className="fw-bold mb-1 text-white">Matheus Aurélio Duarte</h5>
            <small className="text-light opacity-75">matheus@teste.com</small>
          </div>
          <div className="d-flex flex-column gap-3">
            <div className="d-flex align-items-center justify-content-between p-3 dark-card" style={{ cursor: 'pointer' }}>
              <div className="d-flex align-items-center gap-3"><FiUser className="text-emerald" size={20} /><span className="text-white">Meus Dados</span></div>
              <FiChevronRight className="text-light opacity-75" />
            </div>
            <div className="d-flex align-items-center justify-content-between p-3 dark-card" style={{ cursor: 'pointer' }}>
              <div className="d-flex align-items-center gap-3"><FiSettings className="text-emerald" size={20} /><span className="text-white">Configurações</span></div>
              <FiChevronRight className="text-light opacity-75" />
            </div>
          </div>
          <div className="position-absolute bottom-0 start-0 w-100 p-4">
            <button className="btn btn-outline-danger w-100 d-flex justify-content-center align-items-center gap-2 py-2"><FiLogOut /> Sair do App</button>
          </div>
        </Offcanvas.Body>
      </Offcanvas>

      {/* GAVETA DE MÊS */}
      <Offcanvas 
        show={showMonthSelector} 
        onHide={() => setShowMonthSelector(false)} 
        placement="bottom" 
        style={{ height: 'auto', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', backgroundColor: '#1e1e24', color: '#fff', paddingBottom: '20px' }}
      >
        <Offcanvas.Header closeButton closeVariant="white" className="pb-0 border-0 mt-2">
          <Offcanvas.Title className="w-100 text-center fw-bold fs-6 text-white">Selecione o Mês</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <div className="d-flex flex-column gap-2 mt-2">
            {listaMeses.map((mes) => (
              <button 
                key={mes.num}
                className={`btn w-100 py-3 rounded-4 fw-bold shadow-sm ${mesFiltro.num === mes.num ? 'text-white' : 'btn-dark text-light'}`}
                style={mesFiltro.num === mes.num ? { backgroundColor: '#10b981', borderColor: '#10b981' } : {}}
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

      {/* GAVETA NOVO LANÇAMENTO */}
      <Offcanvas 
        show={showBottomSheet} 
        onHide={() => setShowBottomSheet(false)} 
        placement="bottom" 
        style={{ height: 'auto', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', backgroundColor: '#1e1e24', color: '#fff', paddingBottom: '20px' }}
      >
        <Offcanvas.Header closeButton closeVariant="white" className="pb-0 border-0 mt-2">
          <Offcanvas.Title className="w-100 text-center fw-bold fs-6 text-white">Novo Lançamento</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
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

          <button 
            className="btn w-100 py-3 rounded-4 fw-bold shadow text-dark"
            style={{ backgroundColor: '#10b981' }}
            onClick={handleConfirmarLancamento}
          >
            Confirmar Lançamento
          </button>
        </Offcanvas.Body>
      </Offcanvas>

      {/* GAVETA DETALHES TRANSAÇÃO */}
      <Offcanvas 
        show={!!transacaoSelecionada} 
        onHide={() => { setTransacaoSelecionada(null); setConfirmandoExclusao(false); }} 
        placement="bottom" 
        style={{ height: 'auto', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', backgroundColor: '#1e1e24', color: '#fff', paddingBottom: '20px' }}
      >
        <Offcanvas.Header closeButton closeVariant="white" className="pb-0 border-0 mt-2">
          <Offcanvas.Title className="w-100 text-center fw-bold fs-6 text-white">Detalhes do Lançamento</Offcanvas.Title>
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
              {/* HORÁRIO CONTINUA AQUI NOS DETALHES */}
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

            {!confirmandoExclusao ? (
              <button 
                className="btn btn-outline-danger w-100 py-3 rounded-4 fw-bold shadow-sm"
                onClick={() => setConfirmandoExclusao(true)}
              >
                Apagar Transação
              </button>
            ) : (
              <div className="p-3 rounded-4 bg-dark border border-danger border-opacity-50 text-center">
                <p className="text-light small mb-3 fw-bold d-flex align-items-center justify-content-center gap-2">
                  Deseja realmente excluir este lançamento?
                </p>
                <div className="d-flex gap-2">
                  <button 
                    className="btn btn-secondary w-50 py-2 rounded-3 fw-bold text-white"
                    onClick={() => setConfirmandoExclusao(false)}
                  >
                    Cancelar
                  </button>
                  <button 
                    className="btn btn-danger w-50 py-2 rounded-3 fw-bold text-white"
                    onClick={() => handleEfetuarExclusao(transacaoSelecionada.id)}
                  >
                    Sim, apagar
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