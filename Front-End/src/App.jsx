import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Offcanvas } from 'react-bootstrap';
import './App.css';
import { 
  FiEye, FiEyeOff, FiHome, FiCreditCard, FiPlus, FiUser, FiSettings, 
  FiLogOut, FiChevronRight, FiTag, FiCalendar, FiFileText, 
  FiCoffee, FiTool, FiTruck, FiBookOpen, FiSmile, FiHome as FiHomeIcon, FiDollarSign, FiGift 
} from 'react-icons/fi';

function App() {
  const [showBalance, setShowBalance] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [transacaoSelecionada, setTransacaoSelecionada] = useState(null);
  const [tipoTransacao, setTipoTransacao] = useState('despesa');

  // Estado para controlar se exibe os botões de confirmação de exclusão
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);

  // Estado para alternar entre os gráficos (0 = Categorias, 1 = Formas de Pagamento)
  const [abaGrafico, setAbaGrafico] = useState(0);

  // ESTADOS DO FORMULÁRIO
  const [valorInput, setValorInput] = useState('');
  const [tituloInput, setTituloInput] = useState('');
  const [categoriaInput, setCategoriaInput] = useState('');
  const [pagamentoInput, setPagamentoInput] = useState('');
  const [dataInput, setDataInput] = useState(new Date().toISOString().substring(0,10));
  const [observacaoInput, setObservacaoInput] = useState('');
  const [ehRecorrente, setEhRecorrente] = useState(false);
  
  const [transacoes, setTransacoes] = useState([]);

  // CÁLCULOS DINÂMICOS DE SALDO
  const totalReceitas = transacoes.filter(t => t.tipo === 'receita').reduce((acc, t) => acc + t.valor, 0);
  const totalDespesas = transacoes.filter(t => t.tipo === 'despesa').reduce((acc, t) => acc + t.valor, 0);
  const saldoAtual = totalReceitas - totalDespesas;

  const formatarMoeda = (valor) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // FUNÇÃO INTELIGENTE PARA RETORNAR O ÍCONE CORRESPONDENTE À CATEGORIA
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

  // 1. DADOS POR CATEGORIA (Despesas)
  const despesasPorCategoria = transacoes
    .filter(t => t.tipo === 'despesa')
    .reduce((acc, t) => {
      acc[t.categoria] = (acc[t.categoria] || 0) + t.valor;
      return acc;
    }, {});

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

  // 2. DADOS POR FORMA DE PAGAMENTO (Despesas)
  const despesasPorPagamento = transacoes
    .filter(t => t.tipo === 'despesa')
    .reduce((acc, t) => {
      acc[t.pagamento] = (acc[t.pagamento] || 0) + t.valor;
      return acc;
    }, {});

  const coresPagamento = {
    'Pix': '#06b6d4',
    'Crédito': '#ec4899',
    'Débito': '#8b5cf6',
    'Dinheiro': '#eab308'
  };

  // Função auxiliar para gerar o background do gráfico
  const gerarBackgroundGrafico = (dados, mapaCores) => {
    if (totalDespesas === 0) return '#27272a';
    const chaves = Object.keys(dados);
    if (chaves.length === 1) {
      return mapaCores[chaves[0]] || '#10b981';
    }
    let acumulado = 0;
    const gradientStops = Object.entries(dados).map(([chave, valor]) => {
      const porcentagem = (valor / totalDespesas) * 100;
      const inicio = acumulado;
      const fim = acumulado + porcentagem;
      acumulado = fim;
      const cor = mapaCores[chave] || '#cbd5e1';
      return `${cor} ${inicio}% ${fim}%`;
    });
    return `conic-gradient(${gradientStops.join(', ')})`;
  };

  const backgroundGraficoCat = gerarBackgroundGrafico(despesasPorCategoria, coresCategorias);
  const backgroundGraficoPag = gerarBackgroundGrafico(despesasPorPagamento, coresPagamento);

  // MÁSCARA DE MOEDA
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

  // SALVAR NOVO GASTO
  const handleConfirmarLancamento = () => {
    if (!valorInput || !tituloInput || !categoriaInput || !pagamentoInput) {
      alert("Por favor, preencha o valor, título, categoria e forma de pagamento!");
      return;
    }

    const valorNumerico = parseFloat(valorInput.replace(/\./g, '').replace(',', '.'));

    const novaTransacao = {
      id: Date.now(),
      titulo: tituloInput,
      categoria: categoriaInput,
      pagamento: pagamentoInput,
      observacao: observacaoInput,
      data: dataInput.split('-').reverse().join('/'),
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
  };

  // EXCLUIR DE FATO
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
             <small className="text-light opacity-75 d-block mb-1">Receitas ↙</small>
             <span className="text-emerald fw-bold">
               {showBalance ? formatarMoeda(totalReceitas) : 'R$ •••••'}
             </span>
          </div>
          <div className="text-end">
             <small className="text-light opacity-75 d-block mb-1">Despesas ↗</small>
             <span className="text-white fw-bold">
               {showBalance ? formatarMoeda(totalDespesas) : 'R$ •••••'}
             </span>
          </div>
        </div>
      </section>

      {/* SEÇÃO: CARROSSEL DE GRÁFICOS */}
      <section className="card dark-card p-4 mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <small className="text-light opacity-75 d-block" style={{ fontSize: '11px' }}>Este mês</small>
            <h6 className="mb-0 fw-bold text-white">
              {abaGrafico === 0 ? 'Distribuição por Categoria' : 'Formas de Pagamento'}
            </h6>
          </div>
          
          <div className="d-flex align-items-center gap-3">
            <span className="badge bg-secondary bg-opacity-25 text-light px-3 py-2 rounded-pill text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
              Agosto
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

        {/* ABA 0: GRÁFICO DE CATEGORIAS */}
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
              {totalDespesas === 0 ? (
                <span className="text-light opacity-50 text-center w-100">Sem despesas</span>
              ) : (
                Object.entries(despesasPorCategoria).map(([cat, valor]) => {
                  const porcentagem = ((valor / totalDespesas) * 100).toFixed(0);
                  const corCat = coresCategorias[cat] || '#ffffff';
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

        {/* ABA 1: GRÁFICO DE FORMAS DE PAGAMENTO */}
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
              {totalDespesas === 0 ? (
                <span className="text-light opacity-50 text-center w-100">Sem despesas</span>
              ) : (
                Object.entries(despesasPorPagamento).map(([pag, valor]) => {
                  const porcentagem = ((valor / totalDespesas) * 100).toFixed(0);
                  const corPag = coresPagamento[pag] || '#ffffff';
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

      {/* ÚLTIMAS TRANSAÇÕES COM ÍCONES DINÂMICOS */}
      <section className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="text-white mb-0 fw-bold">Últimas transações</h6>
          <span className="text-light opacity-75" style={{ fontSize: '13px', cursor: 'pointer' }}>Mais recentes</span>
        </div>
        
        {transacoes.length === 0 ? (
          <div className="card dark-card text-center p-4">
            <p className="text-light opacity-50 mb-0">Nenhuma transação ainda.</p>
            <small className="text-light opacity-50">Comece adicionando no botão + abaixo!</small>
          </div>
        ) : (
          transacoes.map((t) => (
            <div 
              key={t.id} 
              className="card dark-card p-3 d-flex flex-row justify-content-between align-items-center mb-2 transaction-hover"
              style={{ cursor: 'pointer' }}
              onClick={() => { setTransacaoSelecionada(t); setConfirmandoExclusao(false); }}
            >
              <div className="d-flex align-items-center">
                  <div className="bg-secondary bg-opacity-25 p-2 rounded-circle me-3 text-white d-flex align-items-center justify-content-center" style={{ width: '38px', height: '38px' }}>
                    {/* Ícone dinâmico correspondente à categoria */}
                    {obterIconeCategoria(t.categoria)}
                  </div>
                  <div>
                    <h6 className="mb-0 text-white">{t.titulo}</h6>
                    <small className="text-light opacity-75">{t.categoria} • {t.pagamento}</small>
                  </div>
              </div>
              <span className={t.tipo === 'despesa' ? 'text-white fw-bold' : 'text-emerald fw-bold'}>
                {showBalance 
                  ? <>{t.tipo === 'despesa' ? '- ' : '+ '} {formatarMoeda(t.valor)}</>
                  : '••••••••'
                }
              </span>
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

      {/* GAVETA LATERAL DE PERFIL */}
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

      {/* BOTTOM SHEET: NOVA TRANSAÇÃO */}
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
                      <option value="Carro Clássico">Carro</option>
                      <option value="Educação / Faculdade">Educação / Faculdade</option>
                      <option value="Lazer">Lazer</option>
                      <option value="Fatura">Fatura Cartão</option>
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
                  <option value="Boleto">Boleto</option>
                  <option value="Dinheiro">Dinheiro</option>
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

      {/* DETALHES DA TRANSAÇÃO */}
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
                {/* Ícone correspondente na gaveta de detalhes */}
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