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
  handleAbrirEdicao, handleEfetuarExclusao, isDeleting
}) {
  return (
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
  );
}

export default TransactionDetails;