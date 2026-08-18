import React, { useState } from 'react';
import { Offcanvas } from 'react-bootstrap';
import { FiSettings, FiTrash2, FiAlertCircle } from 'react-icons/fi';
import api from '../api/axios';

function CardSettings({
  showCardSettings, setShowCardSettings,
  diaVencimento, diaFechamento, corCartao, apelidoCartao, finalCartao, bandeiraCartao,
  tempDiaVencimento, setTempDiaVencimento, tempDiaFechamento, setTempDiaFechamento,
  tempCor, setTempCor, tempApelido, setTempApelido, tempFinal, setTempFinal,
  tempBandeira, setTempBandeira, tempLimite, setTempLimite,
  handleSalvarConfigCartao,
  cartaoId,
  onDeletarCartao,
  temaAtual,
  onAtualizarCartaoTemp
}) {
  
  // Liberado se for um cartão novo com o apelido padrão, bloqueado se já tiver sido configurado
  const isLocked = !!cartaoId && apelidoCartao !== "Novo Cartão"; 
  const isDark = temaAtual === 'dark';

  const [mostrarConfirmacaoExclusao, setMostrarConfirmacaoExclusao] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEfetuarExclusaoCartao = async () => {
    if (!cartaoId) return;
    setIsDeleting(true);

    try {
      await api.delete(`/Cartoes/${cartaoId}`);
      setShowCardSettings(false);
      setMostrarConfirmacaoExclusao(false);
      
      if (typeof onDeletarCartao === 'function') {
        onDeletarCartao(cartaoId);
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error("Erro ao excluir cartão:", error);
      alert("Erro ao tentar excluir o cartão.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Offcanvas 
      show={showCardSettings} 
      onHide={async () => { 
        if (!isLocked && cartaoId) {
          try {
            await api.delete(`/Cartoes/${cartaoId}`);
            if (typeof onDeletarCartao === 'function') onDeletarCartao(cartaoId);
          } catch (e) {
            console.error("Erro ao limpar rascunho de cartão:", e);
          }
        }
        setShowCardSettings(false); 
        setMostrarConfirmacaoExclusao(false);
      }} 
      placement="bottom" 
      style={{ 
        height: 'auto', 
        maxHeight: '88vh',
        borderTopLeftRadius: '24px', 
        borderTopRightRadius: '24px', 
        backgroundColor: isDark ? '#1e1e24' : '#ffffff', 
        color: isDark ? '#fff' : '#212529'
      }}
    >
      <Offcanvas.Header className="pb-0 border-0 mt-3 position-relative d-flex justify-content-center align-items-center w-100 px-4">
        <Offcanvas.Title className="w-100 text-center fw-bold fs-6 d-flex align-items-center justify-content-center gap-2 m-0" style={{ color: isDark ? '#fff' : '#212529' }}>
          {isLocked ? 'Detalhes do Cartão' : 'Configurar Novo Cartão'}
        </Offcanvas.Title>

        <div className="position-absolute end-0 me-3 d-flex align-items-center" style={{ gap: '14px' }}>
          {isLocked && !mostrarConfirmacaoExclusao && (
            <button 
              type="button" 
              className="btn p-0 border-0 bg-transparent shadow-none d-flex align-items-center"
              onClick={() => setMostrarConfirmacaoExclusao(true)}
              title="Excluir Cartão"
              style={{ fontSize: '1.25rem', lineHeight: '1', color: isDark ? '#adb5bd' : '#6c757d' }}
            >
              <FiTrash2 />
            </button>
          )}
          <Offcanvas.Header closeButton closeVariant={isDark ? 'white' : undefined} className="p-0 position-static m-0" />
        </div>
      </Offcanvas.Header>

      <Offcanvas.Body className="pt-3 overflow-y-auto" style={{ paddingBottom: '35px' }}>
        <div className="d-flex flex-column gap-3 mb-3 mt-2">
          
          <div className="row g-2">
            <div className="col-8">
              <label className="form-label small mb-1" style={{ color: isDark ? 'rgba(255,255,255,0.75)' : '#6c757d' }}>Apelido do Cartão</label>
              <input 
                type="text" 
                className={`form-control shadow-none ${isDark ? 'bg-dark border-secondary text-white' : 'bg-light border text-dark'}`} 
                value={tempApelido}
                onChange={(e) => {
                  setTempApelido(e.target.value);
                  if (typeof onAtualizarCartaoTemp === 'function') onAtualizarCartaoTemp('apelidoCartao', e.target.value);
                }}
              />
            </div>
            <div className="col-4">
              <label className="form-label small mb-1" style={{ color: isDark ? 'rgba(255,255,255,0.75)' : '#6c757d' }}>Finais (4 dig)</label>
              <input 
                type="text" 
                maxLength="4"
                className={`form-control shadow-none text-center fw-bold text-info ${isDark ? 'bg-dark border-secondary text-white' : 'bg-light border text-dark'}`} 
                value={tempFinal}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setTempFinal(val);
                  if (typeof onAtualizarCartaoTemp === 'function') onAtualizarCartaoTemp('finalCartao', val);
                }}
              />
            </div>
          </div>

          <div className="row g-2">
            <div className="col-7">
              <label className="form-label small mb-1" style={{ color: isDark ? 'rgba(255,255,255,0.75)' : '#6c757d' }}>Limite Total (R$)</label>
              <input 
                type="number" 
                placeholder="Ex: 1500.00"
                className={`form-control shadow-none ${isDark ? 'bg-dark border-secondary text-white' : 'bg-light border text-dark'}`} 
                value={tempLimite}
                onChange={(e) => {
                  setTempLimite(e.target.value);
                  if (typeof onAtualizarCartaoTemp === 'function') onAtualizarCartaoTemp('limiteTotal', e.target.value);
                }}
              />
            </div>
            <div className="col-5">
              <label className="form-label small mb-1" style={{ color: isDark ? 'rgba(255,255,255,0.75)' : '#6c757d' }}>Bandeira</label>
              <select 
                className={`form-select shadow-none ${isDark ? 'bg-dark border-secondary text-white' : 'bg-light border text-dark'}`}
                value={tempBandeira}
                onChange={(e) => {
                  setTempBandeira(e.target.value);
                  if (typeof onAtualizarCartaoTemp === 'function') onAtualizarCartaoTemp('bandeiraCartao', e.target.value);
                }}
              >
                <option value="Mastercard">Mastercard</option>
                <option value="Visa">Visa</option>
                <option value="Elo">Elo</option>
              </select>
            </div>
          </div>

          <div className="row g-2">
            <div className="col-6">
              <label className="form-label small mb-1" style={{ color: isDark ? 'rgba(255,255,255,0.75)' : '#6c757d' }}>Dia Vencimento</label>
              <input 
                type="number"
                min="1"
                max="31"
                className={`form-control shadow-none text-center fw-bold ${isDark ? 'bg-dark border-secondary text-white' : 'bg-light border text-dark'}`}
                value={tempDiaVencimento}
                onChange={(e) => {
                  let val = e.target.value.replace(/\D/g, '');
                  if (val !== '' && parseInt(val, 10) > 31) val = '31';
                  setTempDiaVencimento(val);
                  if (typeof onAtualizarCartaoTemp === 'function') onAtualizarCartaoTemp('diaVencimento', val);
                }}
              />
            </div>
            
            <div className="col-6">
              <label className="form-label small mb-1" style={{ color: isDark ? 'rgba(255,255,255,0.75)' : '#6c757d' }}>Dia Fechamento</label>
              <input 
                type="number"
                min="1"
                max="31"
                className={`form-control shadow-none text-center text-warning fw-bold ${isDark ? 'bg-dark border-secondary text-white' : 'bg-light border text-dark'}`}
                value={tempDiaFechamento}
                onChange={(e) => {
                  let val = e.target.value.replace(/\D/g, '');
                  if (val !== '' && parseInt(val, 10) > 31) val = '31';
                  setTempDiaFechamento(val);
                  if (typeof onAtualizarCartaoTemp === 'function') onAtualizarCartaoTemp('diaFechamento', val);
                }}
              />
            </div>
          </div>
          
          <div>
            <label className="form-label small mb-1" style={{ color: isDark ? 'rgba(255,255,255,0.75)' : '#6c757d' }}>Cor do Cartão</label>
            <select 
              className={`form-select shadow-none ${isDark ? 'bg-dark border-secondary text-white' : 'bg-light border text-dark'}`}
              value={tempCor}
              onChange={(e) => {
                setTempCor(e.target.value);
                if (typeof onAtualizarCartaoTemp === 'function') onAtualizarCartaoTemp('corCartao', e.target.value);
              }}
            >
              <option value="linear-gradient(135deg, #8A05BE 0%, #4c0677 100%)">Nubank (Roxo)</option>
              <option value="linear-gradient(135deg, #FF7A00 0%, #FF500F 100%)">Inter (Laranja)</option>
              <option value="linear-gradient(135deg, #242424 0%, #000000 100%)">C6 Bank (Carbon)</option>
              <option value="linear-gradient(135deg, #CC0000 0%, #990000 100%)">Santander (Vermelho)</option>
              <option value="linear-gradient(135deg, #F9D342 0%, #F2C94C 100%)">Banco do Brasil (Amarelo)</option>
              <option value="linear-gradient(135deg, #005CA9 0%, #00457E 100%)">Caixa (Azul)</option>
              <option value="linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)">Padrão (Azul Escuro)</option>
            </select>
          </div>

        </div>

        {mostrarConfirmacaoExclusao ? (
          <div className="p-4 rounded-4 text-center my-3" style={{ border: '1px solid #ef4444', backgroundColor: isDark ? '#18181b' : '#fff' }}>
            <div className="text-danger mb-2 d-flex justify-content-center">
              <FiAlertCircle size={36} />
            </div>
            <h6 className="fw-bold mb-1" style={{ color: isDark ? '#fff' : '#212529' }}>Excluir Cartão?</h6>
            <p className="small text-muted mb-3">Essa ação não poderá ser desfeita.</p>
            
            <button 
              className="btn w-100 py-3 rounded-4 fw-bold text-white border-0 mb-2 shadow-sm"
              style={{ backgroundColor: '#ef4444' }}
              onClick={handleEfetuarExclusaoCartao}
              disabled={isDeleting}
            >
              <FiTrash2 className="me-2 mb-1" />
              {isDeleting ? 'Excluindo...' : 'Sim, excluir cartão'}
            </button>

            <button 
              className="btn w-100 py-2 rounded-4 fw-bold border-0 bg-transparent"
              style={{ color: isDark ? '#adb5bd' : '#6c757d' }}
              onClick={() => setMostrarConfirmacaoExclusao(false)}
              disabled={isDeleting}
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button 
            className="btn w-100 py-3 rounded-4 fw-bold shadow text-white border-0"
            style={{ backgroundColor: '#10b981' }}
            onClick={handleSalvarConfigCartao}
          >
            Salvar e Cadastrar
          </button>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
}

export default CardSettings;