import React from 'react';
import { FiSearch, FiChevronDown, FiCheckCircle, FiClock } from 'react-icons/fi';
import { isPastOrToday, formatarCabecalhoData } from '../utils/dateUtils';
import { formatarMoeda } from '../utils/formatters';

function TransactionList({
  termoBusca, setTermoBusca,
  selectedCategory, isCardFlipped, abaGrafico,
  mesFiltro, setShowMonthSelector,
  transacoesAgrupadas,
  setTransacaoSelecionada, setMenuAcaoDetalhes,
  showBalance, obterIconeCategoria, temaAtual
}) {
  const isDark = temaAtual === 'dark';

  return (
    <>
      <div className={`d-flex align-items-center rounded-pill px-3 py-2 mb-4 border shadow-sm ${isDark ? 'bg-dark bg-opacity-50 border-secondary border-opacity-25' : 'bg-white border-light'}`}>
        <FiSearch className={`me-2 ${isDark ? 'text-light opacity-50' : 'text-secondary opacity-75'}`} size={18} />
        <input 
          type="text" 
          className={`form-control bg-transparent border-0 shadow-none p-0 input-busca ${isDark ? 'text-white' : 'text-dark'}`} 
          placeholder="Pesquisar" 
          value={termoBusca}
          onChange={(e) => setTermoBusca(e.target.value)}
          style={{ fontSize: '14px' }}
        />
      </div>

      <section className="mb-4 pb-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className={`mb-0 fw-bold text-truncate me-2 ${isDark ? 'text-white' : 'text-dark'}`}>
            {termoBusca 
              ? 'Resultados da busca' 
              : selectedCategory 
                ? `Filtrando: ${selectedCategory}` 
                : (isCardFlipped ? `Gastos com Cartão` : `Extrato Geral`)
            }
          </h6>
          
          <button 
            className={`btn badge px-3 py-2 rounded-pill text-uppercase d-flex align-items-center gap-1 border-0 shadow-sm flex-shrink-0 ${isDark ? 'bg-secondary bg-opacity-25 text-light' : 'bg-white text-dark border-light'}`} 
            style={{ fontSize: '11px', letterSpacing: '0.5px' }}
            onClick={() => setShowMonthSelector(true)}
          >
            {mesFiltro.nome} <FiChevronDown size={14} className="ms-1" />
          </button>
        </div>
        
        {transacoesAgrupadas.length === 0 ? (
          <div className={`card text-center p-4 ${isDark ? 'dark-card' : 'bg-white border-0 shadow-sm'}`}>
            <p className={`mb-0 ${isDark ? 'text-light opacity-50' : 'text-secondary'}`}>Nenhuma transação encontrada.</p>
            {!termoBusca && !selectedCategory && <small className={isDark ? 'text-light opacity-50' : 'text-secondary'}>Que tal adicionar alguma?</small>}
          </div>
        ) : (
          transacoesAgrupadas.map(grupo => (
            <div key={grupo.dataString} className="mb-4">
              
              <small className={`fw-bold d-block mb-2 ms-2 ${isDark ? 'text-light opacity-50' : 'text-secondary'}`}>
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
                    className={`card p-3 d-flex flex-row justify-content-between align-items-center mb-2 transaction-list-item border-0 shadow-sm ${isDark ? 'dark-card' : 'bg-white'}`}
                    style={{ cursor: 'pointer', opacity: (isPast || t.pago) ? 1 : 0.6 }} 
                    onClick={() => { setTransacaoSelecionada(t); setMenuAcaoDetalhes(0); }}
                  >
                    <div className="d-flex align-items-center">
                        <div className={`p-2 rounded-circle me-3 d-flex align-items-center justify-content-center ${isDark ? 'bg-secondary bg-opacity-25 text-white' : 'bg-light text-dark'}`} style={{ width: '38px', height: '38px' }}>
                          {obterIconeCategoria(t.categoria)}
                        </div>
                        <div>
                          <h6 className={`mb-0 ${isDark ? 'text-white' : 'text-dark'}`} style={{ fontSize: '15px' }}>{t.titulo}</h6>
                          <small className={`d-flex align-items-center mt-1 ${isDark ? 'text-light opacity-75' : 'text-secondary'}`} style={{ fontSize: '11px' }}>
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
                      <span className={t.tipo === 'despesa' ? `fw-bold d-block mb-0 ${isDark ? 'text-white' : 'text-dark'}` : 'text-emerald fw-bold d-block mb-0'}>
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
    </>
  );
}

export default TransactionList;