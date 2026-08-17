import React from 'react';
import { Offcanvas } from 'react-bootstrap';

function MonthSelector({
  showMonthSelector, setShowMonthSelector,
  listaMeses, mesFiltro, setMesFiltro,
  setTermoBusca, setSelectedCategory,
  temaAtual
}) {
  const isDark = temaAtual === 'dark';

  return (
    <Offcanvas 
      show={showMonthSelector} 
      onHide={() => setShowMonthSelector(false)} 
      placement="bottom" 
      style={{ 
        maxHeight: '75vh', 
        borderTopLeftRadius: '24px', 
        borderTopRightRadius: '24px', 
        backgroundColor: isDark ? '#1e1e24' : '#ffffff', 
        color: isDark ? '#fff' : '#212529' 
      }}
    >
      <Offcanvas.Header closeButton closeVariant={isDark ? "white" : undefined} className="pb-0 border-0 mt-2">
        <Offcanvas.Title className={`w-100 text-center fw-bold fs-6 ${isDark ? 'text-white' : 'text-dark'}`}>
          Selecione o Mês
        </Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body style={{ overflowY: 'auto' }}>
        <div className="d-flex flex-column gap-2 mt-2">
          {listaMeses.map((mes) => {
            const isAtivo = mesFiltro.num === mes.num && mesFiltro.ano === mes.ano;
            return (
              <button 
                id={isAtivo ? 'btn-mes-ativo' : ''}
                key={`${mes.num}-${mes.ano}`}
                className={`btn w-100 py-3 rounded-4 fw-bold shadow-sm border-0 ${
                  isAtivo 
                    ? 'text-white' 
                    : (isDark ? 'btn-dark text-light' : 'bg-light text-dark')
                }`}
                style={isAtivo ? { backgroundColor: '#10b981' } : {}}
                onClick={() => {
                  setMesFiltro(mes);
                  setShowMonthSelector(false);
                  setTermoBusca(''); 
                  setSelectedCategory(null);
                }}
              >
                {mes.nome} {mes.ano}
              </button>
            );
          })}
        </div>
      </Offcanvas.Body>
    </Offcanvas>
  );
}

export default MonthSelector;