import React from 'react';
import { Offcanvas } from 'react-bootstrap';
import { FiSettings } from 'react-icons/fi';

function CardSettings({
  showCardSettings, setShowCardSettings,
  diaVencimento, diaFechamento, corCartao, apelidoCartao, finalCartao, nomeCartao, bandeiraCartao,
  tempDiaVencimento, setTempDiaVencimento, tempDiaFechamento, setTempDiaFechamento,
  tempCor, setTempCor, tempApelido, setTempApelido, tempFinal, setTempFinal,
  tempNome, setTempNome, tempBandeira, setTempBandeira,
  handleSalvarConfigCartao
}) {
  return (
    <Offcanvas 
      show={showCardSettings} 
      onHide={() => { 
        setShowCardSettings(false); 
        setTempDiaVencimento(diaVencimento); 
        setTempDiaFechamento(diaFechamento);
        setTempCor(corCartao);
        setTempApelido(apelidoCartao);
        setTempFinal(finalCartao);
        setTempNome(nomeCartao);
        setTempBandeira(bandeiraCartao);
      }} 
      placement="bottom" 
      style={{ height: 'auto', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', backgroundColor: '#1e1e24', color: '#fff', paddingBottom: '20px' }}
    >
      <Offcanvas.Header closeButton closeVariant="white" className="pb-0 border-0 mt-2">
        <Offcanvas.Title className="w-100 text-center fw-bold fs-6 text-white d-flex align-items-center justify-content-center gap-2">
          <FiSettings /> Configurar Cartão
        </Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <div className="d-flex flex-column gap-3 mb-4 mt-2">
          
          <div className="row g-2">
            <div className="col-8">
              <label className="form-label text-light opacity-75 small mb-1">Apelido do Cartão</label>
              <input 
                type="text" 
                className="form-control bg-dark border-secondary text-white shadow-none" 
                value={tempApelido}
                onChange={(e) => setTempApelido(e.target.value)}
              />
            </div>
            <div className="col-4">
              <label className="form-label text-light opacity-75 small mb-1">Finais (4 dig)</label>
              <input 
                type="text" 
                maxLength="4"
                className="form-control bg-dark border-secondary text-white shadow-none text-center fw-bold text-info" 
                value={tempFinal}
                onChange={(e) => setTempFinal(e.target.value.replace(/\D/g, ''))}
              />
            </div>
          </div>

          <div className="row g-2">
            <div className="col-7">
              <label className="form-label text-light opacity-75 small mb-1">Nome impresso</label>
              <input 
                type="text" 
                className="form-control bg-dark border-secondary text-white shadow-none text-uppercase" 
                value={tempNome}
                onChange={(e) => setTempNome(e.target.value)}
              />
            </div>
            <div className="col-5">
              <label className="form-label text-light opacity-75 small mb-1">Bandeira</label>
              <select 
                className="form-select bg-dark border-secondary text-white shadow-none"
                value={tempBandeira}
                onChange={(e) => setTempBandeira(e.target.value)}
              >
                <option value="Mastercard">Mastercard</option>
                <option value="Visa">Visa</option>
                <option value="Elo">Elo</option>
              </select>
            </div>
          </div>

          <div className="row g-2">
            <div className="col-6">
              <label className="form-label text-light opacity-75 small mb-1">Dia Vencimento</label>
              <input 
                type="number"
                min="1"
                max="31"
                className="form-control bg-dark border-secondary text-white shadow-none text-center fw-bold"
                value={tempDiaVencimento}
                onChange={(e) => {
                  let val = e.target.value.replace(/\D/g, '');
                  if (val !== '' && parseInt(val, 10) > 31) val = '31';
                  setTempDiaVencimento(val);
                }}
              />
            </div>
            
            <div className="col-6">
              <label className="form-label text-light opacity-75 small mb-1">Dia Fechamento</label>
              <input 
                type="number"
                min="1"
                max="31"
                className="form-control bg-dark border-secondary text-white shadow-none text-center text-warning fw-bold"
                value={tempDiaFechamento}
                onChange={(e) => {
                  let val = e.target.value.replace(/\D/g, '');
                  if (val !== '' && parseInt(val, 10) > 31) val = '31';
                  setTempDiaFechamento(val);
                }}
              />
            </div>
          </div>
          
          <div>
            <label className="form-label text-light opacity-75 small mb-1">Cor do Cartão</label>
            <select 
              className="form-select bg-dark border-secondary text-white shadow-none"
              value={tempCor}
              onChange={(e) => setTempCor(e.target.value)}
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

        <button 
          className="btn w-100 py-3 rounded-4 fw-bold shadow text-white border-0"
          style={{ backgroundColor: '#10b981' }}
          onClick={handleSalvarConfigCartao}
        >
          Salvar Alterações
        </button>
      </Offcanvas.Body>
    </Offcanvas>
  );
}

export default CardSettings;