import React from 'react';
import { FiCoffee, FiCreditCard } from 'react-icons/fi';
import { formatarMoeda } from '../utils/formatters';
import { coresCategorias, coresPagamento } from '../utils/constants';

function DonutChart({
  isCardFlipped, abaGrafico,
  handleTouchStart, handleTouchMove, handleTouchEnd,
  totalDespesasAtivas, svgSegments,
  hoveredCategory, setHoveredCategory,
  selectedCategory, setSelectedCategory,
  isChartAnimating, showBalance,
  despesasGrafico, pagamentosGrafico,
  despesasArray, pagamentosArray,
  historicoData, maxFaturaHist,
  listaMeses, setMesFiltro, temaAtual,
  cores // Recebe as cores dinâmicas do Dashboard
}) {
  const isDark = temaAtual === 'dark';

  return (
    <section className={`card p-4 mb-4 ${isDark ? 'dark-card' : 'border-0 shadow-sm bg-white'}`}>
      
      {/* CABEÇALHO DO CARD DE GRÁFICOS */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <small className={`d-block ${isDark ? 'text-light opacity-75' : 'text-secondary'}`} style={{ fontSize: '11px' }}>
            {isCardFlipped ? 'Este mês (Cartão)' : 'Este mês (Geral)'}
          </small>
          <h6 className={`mb-0 fw-bold d-flex align-items-center gap-2 ${isDark ? 'text-white' : 'text-dark'}`}>
            {isCardFlipped 
              ? (abaGrafico === 0 ? 'Distribuição por Categoria' : 'Histórico de Faturas') 
              : (abaGrafico === 0 ? 'Distribuição por Categoria' : 'Formas de Pagamento')
            }
          </h6>
        </div>
        
        <div className="d-flex align-items-center gap-3">
          <div className={`d-flex align-items-center gap-1 px-2 py-1 rounded-pill ${isDark ? 'bg-dark bg-opacity-50' : 'bg-light'}`}>
            <span 
              style={{ 
                width: abaGrafico === 0 ? '16px' : '6px', 
                height: '6px', 
                borderRadius: '3px', 
                backgroundColor: abaGrafico === 0 ? '#10b981' : (isDark ? '#6b7280' : '#adb5bd'), 
                transition: '0.3s'
              }}
            ></span>
            <span 
              style={{ 
                width: abaGrafico === 1 ? '16px' : '6px', 
                height: '6px', 
                borderRadius: '3px', 
                backgroundColor: abaGrafico === 1 ? '#10b981' : (isDark ? '#6b7280' : '#adb5bd'), 
                transition: '0.3s'
              }}
            ></span>
          </div>
        </div>
      </div>

      <div 
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="w-100 swipeable-area" 
      >
        {/* ABA 0: SEMPRE CATEGORIAS */}
        {abaGrafico === 0 && (
          <div className="d-flex align-items-center justify-content-between mt-3 px-1">
            
            <div 
              style={{ 
                width: '150px', 
                height: '150px', 
                position: 'relative',
                marginLeft: '-10px'
              }}
            >
              {totalDespesasAtivas === 0 ? (
                <div className={`w-100 h-100 rounded-circle d-flex align-items-center justify-content-center border ${isDark ? 'bg-dark border-secondary border-opacity-25' : 'bg-light border-light'}`}>
                  <FiCoffee className={isDark ? "text-light opacity-25" : "text-secondary opacity-50"} size={28}/>
                </div>
              ) : (
                <>
                  <svg viewBox="0 0 42 42" className="w-100 h-100" style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
                    <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke={isDark ? "#27272a" : "#f1f3f5"} strokeWidth="4"></circle>
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
                  
                  <div className="position-absolute top-50 start-50 translate-middle text-center w-100 pe-none d-flex flex-column align-items-center justify-content-center" style={{ padding: '0 20px' }}>
                    {hoveredCategory || selectedCategory ? (
                      <>
                        <span className={`text-truncate w-100 d-block ${isDark ? 'text-light opacity-75' : 'text-secondary'}`} style={{fontSize: '11px'}}>{hoveredCategory || selectedCategory}</span>
                        <span className={`fw-bold ${isDark ? 'text-white' : 'text-dark'}`} style={{fontSize: '14px', textShadow: isDark ? '0px 2px 4px rgba(0,0,0,0.5)' : 'none'}}>
                          {showBalance ? formatarMoeda((abaGrafico === 0 ? despesasGrafico : pagamentosGrafico)[hoveredCategory || selectedCategory]) : 'R$ •••••'}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className={`text-uppercase d-block ${isDark ? 'text-light opacity-50' : 'text-secondary opacity-75'}`} style={{fontSize: '10px', letterSpacing: '0.5px'}}>Total</span>
                        <span className={`fw-bold ${isDark ? 'text-white' : 'text-dark'}`} style={{fontSize: '14px'}}>{showBalance ? formatarMoeda(totalDespesasAtivas) : 'R$ •••••'}</span>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* LEGENDA CORRESPONDENTE COM FALLBACK BLINDADO */}
            <div className="d-flex flex-column gap-1 text-end" style={{ fontSize: '13px', width: '135px' }}>
              {totalDespesasAtivas === 0 ? (
                <span className={`text-center w-100 ${isDark ? 'text-light opacity-50' : 'text-secondary opacity-75'}`}>Sem despesas</span>
              ) : (
                (abaGrafico === 0 ? despesasArray : pagamentosArray).map(([cat, valor]) => {
                  const porcentagem = ((Number(valor) || 0) / totalDespesasAtivas * 100).toFixed(0);
                  
                  const corCat = abaGrafico === 0 
                    ? (cores && cores[cat] ? cores[cat] : (coresCategorias[cat] || '#6b7280'))
                    : (coresPagamento[cat] || '#6b7280');

                  const isDimmed = (hoveredCategory || selectedCategory) && (hoveredCategory !== cat && selectedCategory !== cat);

                  return (
                    <div 
                      key={cat} 
                      className="d-flex align-items-center justify-content-between rounded px-1"
                      style={{ 
                        cursor: 'pointer', 
                        transition: '0.2s', 
                        opacity: isDimmed ? 0.4 : 1,
                        background: selectedCategory === cat ? (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)') : 'transparent',
                        paddingTop: '3px', paddingBottom: '3px'
                      }}
                      onMouseEnter={() => setHoveredCategory(cat)}
                      onMouseLeave={() => setHoveredCategory(null)}
                      onClick={(e) => { e.stopPropagation(); setSelectedCategory(selectedCategory === cat ? null : cat); setHoveredCategory(null); }}
                    >
                      <span className={`d-flex align-items-center text-truncate ${isDark ? 'text-light opacity-75' : 'text-secondary'}`} style={{ maxWidth: '95px' }}>
                        <span className="rounded-circle me-2 flex-shrink-0" style={{ width: '8px', height: '8px', backgroundColor: corCat }}></span> {cat}
                      </span>
                      <span className={`fw-bold ${isDark ? 'text-white' : 'text-dark'}`}>{showBalance ? `${porcentagem}%` : '***'}</span>
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
                  <span className={`mb-2 ${isDark ? 'text-light opacity-75' : 'text-secondary'}`} style={{ fontSize: '9px', whiteSpace: 'nowrap' }}>
                    {showBalance ? ((Number(hist.total) || 0) > 0 ? `R$ ${Math.round(hist.total)}` : '-') : '***'}
                  </span>
                  <div 
                    style={{ 
                      width: '14px', 
                      height: `${heightPct}%`, 
                      backgroundColor: i === 4 ? '#4f46e5' : (isDark ? '#3f3f46' : '#e9ecef'), 
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.5s ease-in-out'
                    }}
                  ></div>
                  <span className={`mt-2 fw-bold ${isDark ? 'text-white opacity-75' : 'text-dark'}`} style={{ fontSize: '10px' }}>{hist.nome}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* ABA 1 + GERAL: FORMAS DE PAGAMENTO */}
        {abaGrafico === 1 && !isCardFlipped && (
          <div className="d-flex align-items-center justify-content-between mt-3 px-1">
            
            <div style={{ width: '150px', height: '150px', position: 'relative', marginLeft: '-10px' }}>
              {totalDespesasAtivas === 0 ? (
                <div className={`w-100 h-100 rounded-circle d-flex align-items-center justify-content-center border ${isDark ? 'bg-dark border-secondary border-opacity-25' : 'bg-light border-light'}`}>
                  <FiCreditCard className={isDark ? "text-light opacity-25" : "text-secondary opacity-50"} size={28}/>
                </div>
              ) : (
                <>
                  <svg viewBox="0 0 42 42" className="w-100 h-100" style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
                    <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke={isDark ? "#27272a" : "#f1f3f5"} strokeWidth="4"></circle>
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
                        <span className={`text-truncate w-100 d-block ${isDark ? 'text-light opacity-75' : 'text-secondary'}`} style={{fontSize: '11px'}}>{hoveredCategory || selectedCategory}</span>
                        <span className={`fw-bold ${isDark ? 'text-white' : 'text-dark'}`} style={{fontSize: '14px', textShadow: isDark ? '0px 2px 4px rgba(0,0,0,0.5)' : 'none'}}>
                          {showBalance ? formatarMoeda((abaGrafico === 0 ? despesasGrafico : pagamentosGrafico)[hoveredCategory || selectedCategory]) : 'R$ •••••'}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className={`text-uppercase d-block ${isDark ? 'text-light opacity-50' : 'text-secondary opacity-75'}`} style={{fontSize: '10px', letterSpacing: '0.5px'}}>Total</span>
                        <span className={`fw-bold ${isDark ? 'text-white' : 'text-dark'}`} style={{fontSize: '14px'}}>{showBalance ? formatarMoeda(totalDespesasAtivas) : 'R$ •••••'}</span>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="d-flex flex-column gap-1 text-end" style={{ fontSize: '13px', width: '135px' }}>
              {totalDespesasAtivas === 0 ? (
                <span className={`text-center w-100 ${isDark ? 'text-light opacity-50' : 'text-secondary opacity-75'}`}>Sem despesas</span>
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
                        background: selectedCategory === cat ? (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)') : 'transparent',
                        paddingTop: '3px', paddingBottom: '3px'
                      }}
                      onMouseEnter={() => setHoveredCategory(cat)}
                      onMouseLeave={() => setHoveredCategory(null)}
                      onClick={(e) => { e.stopPropagation(); setSelectedCategory(selectedCategory === cat ? null : cat); setHoveredCategory(null); }}
                    >
                      <span className={`d-flex align-items-center text-truncate ${isDark ? 'text-light opacity-75' : 'text-secondary'}`} style={{ maxWidth: '95px' }}>
                        <span className="rounded-circle me-2 flex-shrink-0" style={{ width: '8px', height: '8px', backgroundColor: corCat }}></span> {cat}
                      </span>
                      <span className={`fw-bold ${isDark ? 'text-white' : 'text-dark'}`}>{showBalance ? `${porcentagem}%` : '***'}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default DonutChart;