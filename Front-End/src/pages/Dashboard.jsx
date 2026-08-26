import React, { useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import PullToRefresh from 'react-simple-pull-to-refresh';
import { useDashboard } from '../hooks/useDashboard';
import './Dashboard.css';

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
import SkeletonDashboard from '../components/SkeletonDashboard';
import DashboardTicker from '../components/DashboardTicker';
import api from '../api/axios';

import { 
  FiCoffee, FiTool, FiTruck, FiBookOpen, FiSmile, FiHome as FiHomeIcon, 
  FiDollarSign, FiGift, FiTag
} from 'react-icons/fi';
import { mapaCoresCartao } from '../utils/constants';

function Dashboard ({ temaAtual, toggleTema }) {  
  const dash = useDashboard(temaAtual);
  
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  // EFEITO ÚNICO DE INICIALIZAÇÃO DA TELA
  useEffect(() => {
    let vaiFlipar = false;
    let vaiAbrirForm = false;

    // 1. Checa se veio ordem da URL
    if (searchParams.get('acao') === 'novolancamento') {
      vaiAbrirForm = true;
      navigate(location.pathname, { replace: true });
    } 
    // 2. Checa se veio ordem do Login
    else if (location.state?.acaoInicial) {
      if (location.state.acaoInicial === 'abrir_gaveta_lancamento') {
        vaiAbrirForm = true;
      } else if (location.state.acaoInicial === 'flip_cartoes') {
        vaiFlipar = true;
      }
      window.history.replaceState({}, document.title);
    }
    // 3. Checa direto do LocalStorage (Caso o usuário apenas volte da tela de configs ou recarregue a página)
    else {
      const configs = localStorage.getItem('firmo_configs');
      if (configs) {
        try {
          const { telaInicialPadrao } = JSON.parse(configs);
          if (telaInicialPadrao === 'cartoes') {
            vaiFlipar = true;
          } else if (telaInicialPadrao === 'novo_lancamento') {
            vaiAbrirForm = true;
          }
        } catch (e) {
          console.error("Erro ao ler configs iniciais", e);
        }
      }
    }

    // Aplica as ações com um leve atraso (150ms)
    // Isso evita que a ação seja atropelada pelo carregamento inicial do SkeletonDashboard
    if (vaiFlipar) {
      setTimeout(() => dash.setIsCardFlipped(true), 150);
    }
    if (vaiAbrirForm) {
      setTimeout(() => dash.setShowBottomSheet(true), 150);
    }

    // A dependência vazia garante que isso rode apenas UMA VEZ ao montar o Dashboard
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

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

  const dashboardStyle = {
    backgroundColor: dash.isDark ? '#121214' : '#f0f2f5', 
    minHeight: '100vh', 
    transition: 'background-color 0.3s ease',
    '--ticker-bg': dash.isDark ? 'rgba(16, 185, 129, 0.03)' : 'rgba(217, 119, 6, 0.05)',
    '--ticker-border': dash.isDark ? 'rgba(16, 185, 129, 0.12)' : 'rgba(217, 119, 6, 0.25)',
    '--ticker-color': dash.isDark ? '#fae902be' : '#d97706',
    '--skeleton-bg-start': dash.isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.05)',
    '--skeleton-bg-end': dash.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.15)',
    '--spinner-border': dash.isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.2)',
  };

  return (
    <div style={dashboardStyle}>
      <PullToRefresh 
        onRefresh={dash.handleRefresh}
        pullDownThreshold={60} 
        maxPullDownDistance={95} 
        pullingContent={
          <div style={{ height: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: dash.isDark ? '#adb5bd' : '#6c757d', fontSize: '13px', opacity: 0.7 }}>
            <div className="spinner-inter" style={{ animation: 'none', borderColor: 'transparent', borderTopColor: '#8b5cf6', marginBottom: '4px' }}></div>
            <span>Puxe para atualizar...</span>
          </div>
        }
        refreshingContent={
          <div style={{ height: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: dash.isDark ? '#adb5bd' : '#6c757d', fontSize: '13px' }}>
            <div className="spinner-inter" style={{ marginBottom: '4px' }}></div>
            <span>Atualizando dados...</span>
          </div>
        }
      >
        <div className="app-container pt-4 px-3" style={{ minHeight: '100vh', overflowX: 'hidden' }}>

          <Header usuarioLogado={dash.usuarioLogado} showBalance={dash.showBalance} setShowBalance={dash.setShowBalance} setShowProfile={dash.setShowProfile} temaAtual={temaAtual} />
          
          {dash.isRefreshingUI ? (
            <SkeletonDashboard />
          ) : (
            <>
              <div 
                className={`carrossel-cartoes ${!dash.isCardFlipped ? 'modo-saldo-livre' : 'modo-cartoes'}`} 
                onScroll={dash.isCardFlipped ? dash.handleScrollCartoes : undefined}
                onTouchStart={dash.handleHorizontalSwipeStart}
                onTouchMove={dash.handleHorizontalSwipeMove}
                ref={dash.carrosselRef}
              >
                {dash.meusCartoes.map((cartao, index) => {
                  const { total, status, mesVencimentoFatura, nomeMesVencimentoFatura } = dash.calcularDadosFatura(cartao);
                  const isAtivo = index === dash.cartaoAtivoIndex;
                  
                  return (
                    <div 
                      className={`carrossel-item ${isAtivo ? 'ativo' : 'inativo'}`} 
                      key={cartao.id || index}
                      id={`cartao-idx-${index}`}
                      onClickCapture={(e) => {
                        if (!isAtivo && dash.isCardFlipped) {
                          e.stopPropagation();
                          e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                          dash.setCartaoAtivoIndex(index);
                        }
                      }}
                    >
                      <FlipCard 
                        isCardFlipped={dash.isCardFlipped} 
                        setIsCardFlipped={dash.handleToggleFlip} 
                        showBalance={dash.showBalance} 
                        saldoAtual={dash.saldoAtual} 
                        receitasDoMes={dash.receitasDoMes} 
                        despesasDoMes={dash.despesasDoMes} 
                        mesFiltro={dash.mesFiltro} 
                        corCartao={mapaCoresCartao[cartao.corCartao] || cartao.corCartao} 
                        apelidoCartao={cartao.apelidoCartao} 
                        diaVencimento={cartao.diaVencimento} 
                        diaFechamento={cartao.diaFechamento} 
                        finalCartao={cartao.finalCartao} 
                        nomeCartao={(dash.usuarioLogado?.nome || 'USUÁRIO').toUpperCase()} 
                        bandeiraCartao={cartao.bandeiraCartao} 
                        totalFaturaMes={total} 
                        statusFatura={status} 
                        mesVencimentoFatura={mesVencimentoFatura}
                        nomeMesVencimentoFatura={nomeMesVencimentoFatura}
                        setShowCardSettings={dash.setShowCardSettings} 
                        setTempDiaVencimento={dash.setTempDiaVencimento} 
                        setTempDiaFechamento={dash.setTempDiaFechamento} 
                        setTempCor={dash.setTempCor} 
                        setTempApelido={dash.setTempApelido} 
                        setTempFinal={dash.setTempFinal} 
                        setTempBandeira={dash.setTempBandeira} 
                        setTempNome={() => {}}
                        temaAtual={temaAtual} 
                      />
                    </div>
                  );
                })}

                {dash.isCardFlipped && (
                  <div className="carrossel-item item-adicionar d-flex align-items-center">
                    <div 
                      className="w-100 d-flex flex-column align-items-center justify-content-center"
                      style={{ 
                        minHeight: '210px', borderRadius: '1rem', 
                        border: `2px dashed ${dash.isDark ? '#495057' : '#ced4da'}`, 
                        cursor: 'pointer', color: dash.isDark ? '#adb5bd' : '#6c757d',
                        backgroundColor: dash.isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'
                      }}
                      onClick={async () => {
                        if (dash.meusCartoes.length >= 3) {
                          alert("Você atingiu o limite máximo de 3 cartões cadastrados.");
                          return;
                        }
                        try {
                          const rascunhoCartao = {
                            id: 0, usuarioId: dash.usuarioLogado.id, nome: 'Novo Cartão', ultimosDigitos: '0000', bandeira: 'Selecionar',
                            limiteTotal: 0, diaVencimento: 0, diaFechamento: 0, corFundo: 'roxo', corTexto: '#FFFFFF'
                          };
                          const response = await api.post('/Cartoes', rascunhoCartao);
                          const cartaoCriado = response.data;
                          await dash.carregarCartoes();
                          
                          const novaListaResp = await api.get(`/Cartoes/usuario/${dash.usuarioLogado.id}`);
                          const indexCriado = novaListaResp.data.findIndex(c => c.id === cartaoCriado.id);

                          dash.setTempApelido('Novo Cartão');
                          dash.setTempFinal('0000');
                          dash.setTempLimite('');
                          dash.setTempBandeira('Selecionar');
                          dash.setTempDiaVencimento('00');
                          dash.setTempDiaFechamento('00');
                          dash.setTempCor('roxo');

                          if (indexCriado !== -1) {
                            dash.setCartaoAtivoIndex(indexCriado);
                            setTimeout(() => {
                              const el = document.getElementById(`cartao-idx-${indexCriado}`);
                              if (el && dash.carrosselRef.current) {
                                dash.carrosselRef.current.scrollTo({
                                  left: el.offsetLeft - (dash.carrosselRef.current.offsetWidth - el.offsetWidth) / 2,
                                  behavior: 'smooth'
                                });
                              }
                            }, 50);
                          }
                          dash.setShowCardSettings(true);
                        } catch (error) {
                          console.error("Erro ao criar rascunho de cartão:", error);
                          alert("Erro ao iniciar cadastro de novo cartão.");
                        }
                      }}
                    >
                      <div className="rounded-circle d-flex align-items-center justify-content-center mb-2" style={{ width: '45px', height: '45px', backgroundColor: dash.isDark ? '#2b2b31' : '#e9ecef' }}>
                         <span style={{ fontSize: '26px', lineHeight: '0', marginBottom: '4px' }}>+</span>
                      </div>
                      <span className="fw-bold small text-center">Adicionar cartão</span>
                    </div>
                  </div>
                )}
              </div>

              <DashboardTicker />

              <DonutChart isCardFlipped={dash.isCardFlipped} abaGrafico={dash.abaGrafico} handleTouchStart={dash.handleTouchStart} handleTouchMove={dash.handleTouchMove} handleTouchEnd={dash.handleTouchEnd} totalDespesasAtivas={dash.totalDespesasAtivas} svgSegments={dash.svgSegments} hoveredCategory={dash.hoveredCategory} setHoveredCategory={dash.setHoveredCategory} selectedCategory={dash.selectedCategory} setSelectedCategory={dash.setSelectedCategory} isChartAnimating={dash.isChartAnimating} showBalance={dash.showBalance} despesasGrafico={dash.despesasGrafico} pagamentosGrafico={dash.pagamentosGrafico} despesasArray={dash.despesasArray} pagamentosArray={dash.pagamentosArray} historicoData={dash.historicoData} maxFaturaHist={dash.maxFaturaHist} listaMeses={dash.listaMeses} setMesFiltro={dash.setMesFiltro} temaAtual={temaAtual} cores={dash.coresDinamicas}/>
              <TransactionList termoBusca={dash.termoBusca} setTermoBusca={dash.setTermoBusca} selectedCategory={dash.selectedCategory} isCardFlipped={dash.isCardFlipped} abaGrafico={dash.abaGrafico} mesFiltro={dash.mesFiltro} setShowMonthSelector={dash.setShowMonthSelector} transacoesAgrupadas={dash.transacoesAgrupadas} setTransacaoSelecionada={dash.setTransacaoSelecionada} setMenuAcaoDetalhes={dash.setMenuAcaoDetalhes} showBalance={dash.showBalance} obterIconeCategoria={obterIconeCategoria} temaAtual={temaAtual} />
            </>
          )}

          <BottomNav handleGoHome={dash.handleGoHome} setShowBottomSheet={dash.setShowBottomSheet} setIsCardFlipped={dash.setIsCardFlipped} temaAtual={temaAtual} />
          <OffcanvasMenu showProfile={dash.showProfile} setShowProfile={dash.setShowProfile} usuarioLogado={dash.usuarioLogado} handleLogout={() => { dash.setShowProfile(false); dash.handleLogout(); }} temaAtual={temaAtual} toggleTema={toggleTema} />
          
          <CardSettings 
            showCardSettings={dash.showCardSettings} setShowCardSettings={dash.setShowCardSettings} 
            diaVencimento={dash.cartaoAtivo?.diaVencimento} diaFechamento={dash.cartaoAtivo?.diaFechamento} 
            corCartao={mapaCoresCartao[dash.cartaoAtivo?.corCartao] || dash.cartaoAtivo?.corCartao} 
            apelidoCartao={dash.cartaoAtivo?.apelidoCartao} finalCartao={dash.cartaoAtivo?.finalCartao} 
            bandeiraCartao={dash.cartaoAtivo?.bandeiraCartao} tempDiaVencimento={dash.tempDiaVencimento} 
            setTempDiaVencimento={dash.setTempDiaVencimento} tempDiaFechamento={dash.tempDiaFechamento} 
            setTempDiaFechamento={dash.setTempDiaFechamento} tempCor={dash.tempCor} setTempCor={dash.setTempCor} 
            tempApelido={dash.tempApelido} setTempApelido={dash.setTempApelido} tempFinal={dash.tempFinal} 
            setTempFinal={dash.setTempFinal} tempBandeira={dash.tempBandeira} setTempBandeira={dash.setTempBandeira} 
            tempLimite={dash.tempLimite} setTempLimite={dash.setTempLimite} 
            handleSalvarConfigCartao={dash.handleSalvarConfigCartao} cartaoId={dash.cartaoAtivo?.id}
            onDeletarCartao={() => dash.carregarCartoes()} temaAtual={temaAtual}
            onAtualizarCartaoTemp={dash.handleAtualizarCartaoTemp}
          />
          
          <MonthSelector showMonthSelector={dash.showMonthSelector} setShowMonthSelector={dash.setShowMonthSelector} listaMeses={dash.listaMeses} mesFiltro={dash.mesFiltro} setMesFiltro={dash.setMesFiltro} setTermoBusca={dash.setTermoBusca} setSelectedCategory={dash.setSelectedCategory} temaAtual={temaAtual} />
          <TransactionForm 
            showBottomSheet={dash.showBottomSheet} setShowBottomSheet={dash.setShowBottomSheet} 
            usuarioLogado={dash.usuarioLogado} carregarTransacoes={dash.carregarTransacoes} 
            transacaoParaEditar={dash.transacaoParaEditar} setTransacaoParaEditar={dash.setTransacaoParaEditar} 
            meusCartoes={dash.meusCartoes} temaAtual={temaAtual} 
          />
          <TransactionDetails transacaoSelecionada={dash.transacaoSelecionada} setTransacaoSelecionada={dash.setTransacaoSelecionada} menuAcaoDetalhes={dash.menuAcaoDetalhes} setMenuAcaoDetalhes={dash.setMenuAcaoDetalhes} showBalance={dash.showBalance} obterIconeCategoria={obterIconeCategoria} animatingStatusId={dash.animatingStatusId} handleToggleStatusPagamento={dash.handleToggleStatusPagamento} handleAbrirEdicao={dash.handleAbrirEdicao} handleEfetuarExclusao={dash.handleEfetuarExclusao} isDeleting={dash.isDeleting} temaAtual={temaAtual} meusCartoes={dash.meusCartoes} />
        </div>
      </PullToRefresh>
    </div>
  );
}

export default Dashboard;