import React from 'react';
import { Offcanvas } from 'react-bootstrap';

function MonthSelector({
  showMonthSelector, setShowMonthSelector,
  listaMeses, mesFiltro, setMesFiltro,
  setTermoBusca, setSelectedCategory
}) {
  return (
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
  );
}

export default MonthSelector;