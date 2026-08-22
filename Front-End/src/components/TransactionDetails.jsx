import React from 'react';
import { Offcanvas } from 'react-bootstrap';
import { 
  FiTrash2, FiAlertCircle, FiCheckCircle, FiClock, 
  FiTag, FiCalendar, FiCreditCard, FiFileText, FiEdit2, FiRefreshCw 
} from 'react-icons/fi';
import { formatarMoeda } from '../utils/formatters';
import { isPastOrToday } from '../utils/dateUtils';

function TransactionDetails({
  transacaoSelecionada, setTransacaoSelecionada,
  menuAcaoDetalhes, setMenuAcaoDetalhes,
  showBalance, obterIconeCategoria,
  animatingStatusId, handleToggleStatusPagamento,
  handleAbrirEdicao, handleEfetuarExclusao, isDeleting,
  temaAtual, meusCartoes 
}) {
  const isDark = temaAtual === 'dark';

  let nomeCartaoUsado = null;
  if (transacaoSelecionada?.pagamento === 'Crédito' && transacaoSelecionada?.cartaoId && meusCartoes) {
    const cartaoEncontrado = meusCartoes.find(c => c.id === transacaoSelecionada.cartaoId);
    if (cartaoEncontrado) {
      nomeCartaoUsado = cartaoEncontrado.apelidoCartao || 'Cartão Desconhecido';
    }
  }

  return (
    <Offcanvas 
      show={!!transacaoSelecionada} 
      onHide={() => { setTransacaoSelecionada(null); setMenuAcaoDetalhes(0); }} 
      placement="bottom" 
      style={{ 
        height: 'auto', 
        maxHeight: '85vh',
        borderTopLeftRadius: '24px', 
        borderTopRightRadius: '24px', 
        backgroundColor: isDark ? '#1e1e24' : '#ffffff', 
        color: isDark ? '#fff' : '#212529'
      }}
    >
      <Offcanvas.Header className="pb-0 border-0 mt-2 d-flex align-items-center justify-content-center position-relative">
        <Offcanvas.Title className={`fw-bold fs-6 m-0 ${isDark ? 'text-white' : 'text-dark'}`}>
          Detalhes do Lançamento
        </Offcanvas.Title>

        <div className="position-absolute end-0 top-50 translate-middle-y pe-3 d-flex align-items-center gap-3 mt-2">
          {!menuAcaoDetalhes && (
            <button 
              className={`btn btn-link p-0 shadow-none d-flex align-items-center justify-content-center border-0 ${isDark ? 'text-white opacity-75' : 'text-danger'}`}
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
            className={`btn-close shadow-none ${isDark ? 'btn-close-white' : ''}`} 
            aria-label="Close" 
            onClick={() => { setTransacaoSelecionada(null); setMenuAcaoDetalhes(0); }}
          ></button>
        </div>
      </Offcanvas.Header>
      
      {transacaoSelecionada && (
        <Offcanvas.Body className="overflow-y-auto" style={{ paddingBottom: 'max(40px, env(safe-area-inset-bottom))' }}>
          <div className={`text-center ${menuAcaoDetalhes ? 'mb-2' : 'mb-4'}`}>
            <div 
  className={`rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2 ${isDark ? 'bg-secondary bg-opacity-25 text-white' : 'bg-light text-dark border'}`}
  style={{ width: '56px', height: '56px' }}
>
  {obterIconeCategoria(transacaoSelecionada.categoria)}
</div>
            <h4 className={`fw-bold mb-1 ${isDark ? 'text-white' : 'text-dark'}`}>{transacaoSelecionada.titulo}</h4>
            <h2 className={transacaoSelecionada.tipo === 'despesa' ? (isDark ? 'text-white' : 'text-dark') : 'text-emerald'}>
              {showBalance 
                ? <>{transacaoSelecionada.tipo === 'despesa' ? '- ' : '+ '} {formatarMoeda(transacaoSelecionada.valor)}</>
                : 'R$ •••••••'
              }
            </h2>
          </div>

          <div className={`card p-3 ${menuAcaoDetalhes ? 'mb-2' : 'mb-4'} border-0 ${isDark ? 'dark-card bg-dark' : 'bg-light'}`}>
            
            {transacaoSelecionada.recorrente && (
              <div className={`d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom ${isDark ? 'border-secondary border-opacity-25' : 'border-secondary border-opacity-10'}`}>
                <span className={isDark ? "text-light opacity-75" : "text-secondary"}><FiRefreshCw className="me-2"/> Tipo de Lançamento</span>
                <span 
                  className="badge d-flex align-items-center fw-bold"
                  style={{ 
                    backgroundColor: isDark ? '#27272a' : '#f8f9fa', 
                    color: isDark ? '#a1a1aa' : '#6c757d', 
                    border: '1px solid',
                    borderColor: isDark ? '#3f3f46' : '#dee2e6',
                    padding: '6px 10px',
                    borderRadius: '20px',
                    letterSpacing: '0.3px'
                  }}
                >
                  Fixo / Parcelado
                </span>
              </div>
            )}

            {nomeCartaoUsado && (
              <div className={`d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom ${isDark ? 'border-secondary border-opacity-25' : 'border-secondary border-opacity-10'}`}>
                <span className={isDark ? "text-light opacity-75" : "text-secondary"}><FiCreditCard className="me-2"/> Cartão Utilizado</span>
                <span 
                  className="badge d-flex align-items-center fw-bold text-uppercase"
                  style={{ 
                    backgroundColor: isDark ? '#27272a' : '#f8f9fa', 
                    color: isDark ? '#a1a1aa' : '#6c757d', 
                    border: '1px solid',
                    borderColor: isDark ? '#3f3f46' : '#dee2e6',
                    padding: '6px 10px',
                    borderRadius: '20px',
                    letterSpacing: '0.3px',
                    fontSize: '11px'
                  }}
                >
                  {nomeCartaoUsado}
                </span>
              </div>
            )}

            {!isPastOrToday(transacaoSelecionada.data) && (
              <div className={`d-flex justify-content-between mb-2 pb-2 border-bottom mt-1 ${isDark ? 'border-secondary border-opacity-25' : 'border-secondary border-opacity-10'}`}>
                <span className={`d-flex align-items-center ${isDark ? 'text-light opacity-75' : 'text-secondary'}`}><FiClock className="me-2"/> Status</span>
                
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
              <span className={isDark ? "text-light opacity-75" : "text-secondary"}><FiTag className="me-2"/> Categoria</span>
              <span className={`fw-bold ${isDark ? 'text-white' : 'text-dark'}`}>{transacaoSelecionada.categoria}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className={isDark ? "text-light opacity-75" : "text-secondary"}><FiCalendar className="me-2"/> Data</span>
              <span className={`fw-bold ${isDark ? 'text-white' : 'text-dark'}`}>{transacaoSelecionada.data}</span>
            </div>
            {transacaoSelecionada.hora && (
              <div className="d-flex justify-content-between mb-2">
                <span className={isDark ? "text-light opacity-75" : "text-secondary"}><FiClock className="me-2"/> Horário do Registro</span>
                <span className={`fw-bold ${isDark ? 'text-white' : 'text-dark'}`}>{transacaoSelecionada.hora}</span>
              </div>
            )}
            <div className="d-flex justify-content-between">
              <span className={isDark ? "text-light opacity-75" : "text-secondary"}><FiCreditCard className="me-2"/> Forma de Pagamento</span>
              <span className={`fw-bold ${isDark ? 'text-white' : 'text-dark'}`}>{transacaoSelecionada.pagamento}</span>
            </div>
          </div>

          {transacaoSelecionada.observacao && !menuAcaoDetalhes && (
            <div className="mb-4">
              <h6 className={`mb-2 ${isDark ? 'text-light opacity-75' : 'text-secondary'}`}><FiFileText className="me-2"/> Observações</h6>
              <div className={`card p-3 border-0 ${isDark ? 'dark-card bg-dark text-white opacity-75' : 'bg-light text-dark'}`}>
                {transacaoSelecionada.observacao}
              </div>
            </div>
          )}

          {!menuAcaoDetalhes && (
            <button 
              className={`btn w-100 py-3 rounded-4 fw-bold d-flex align-items-center justify-content-center gap-2 mt-2 shadow-none border-0 ${isDark ? 'btn-secondary text-white' : 'btn-light text-dark border'}`}
              style={isDark ? { backgroundColor: '#27272a' } : {}}
              onClick={handleAbrirEdicao}
            >
              <FiEdit2 size={18} /> Editar dados do lançamento
            </button>
          )}

          {menuAcaoDetalhes === 2 && (
            <div className={`p-3 rounded-4 border border-danger border-opacity-50 text-center mt-2 ${isDark ? 'bg-dark' : 'bg-white shadow-sm'}`}>
              <div className="mb-3">
                <FiAlertCircle size={36} className="text-danger mb-2" />
                <p className={`fw-bold mb-1 ${isDark ? 'text-white' : 'text-dark'}`}>Excluir Lançamento?</p>
                {transacaoSelecionada.recorrente ? (
                  <p className={`small mb-0 ${isDark ? 'text-light opacity-75' : 'text-secondary'}`}>Este lançamento faz parte de uma série. Como deseja prosseguir?</p>
                ) : (
                  <p className={`small mb-0 ${isDark ? 'text-light opacity-75' : 'text-secondary'}`}>Essa ação não poderá ser desfeita.</p>
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
                  className={`btn btn-link mt-2 shadow-none border-0 ${isDark ? 'text-light opacity-75' : 'text-secondary'}`} 
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
  );
}

export default TransactionDetails;