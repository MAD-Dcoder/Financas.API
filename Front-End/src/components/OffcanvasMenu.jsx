import React from 'react';
import { Offcanvas } from 'react-bootstrap';
import { 
  FiUser, FiSettings, FiShield, FiBell, FiHelpCircle, 
  FiLogOut, FiChevronRight, FiX 
} from 'react-icons/fi';

function OffcanvasMenu({ showProfile, setShowProfile, usuarioLogado, handleLogout }) {
  return (
    <Offcanvas 
      show={showProfile} 
      onHide={() => setShowProfile(false)} 
      placement="start" 
      style={{ backgroundColor: '#1e1e24', color: '#fff', maxWidth: '300px', borderRight: '1px solid rgba(255,255,255,0.1)' }}
    >
      <Offcanvas.Body className="p-0 d-flex flex-column">
        
        <div className="p-4 text-center position-relative" style={{ background: 'linear-gradient(to bottom, rgba(16, 185, 129, 0.15), transparent)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <button 
            className="btn btn-link position-absolute top-0 end-0 mt-3 me-2 text-white opacity-50 shadow-none border-0"
            onClick={() => setShowProfile(false)}
          >
            <FiX size={24} />
          </button>
          <div className="rounded-circle d-flex justify-content-center align-items-center mx-auto mb-3 mt-3 shadow-lg" 
               style={{ width: '80px', height: '80px', background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', color: '#fff', fontWeight: 'bold', fontSize: '32px' }}>
            {usuarioLogado?.nome ? usuarioLogado.nome.charAt(0).toUpperCase() : 'U'}
          </div>
          <h5 className="fw-bold mb-1 text-white">{usuarioLogado?.nome}</h5>
          <small className="text-light opacity-75">{usuarioLogado?.email}</small>
        </div>

        <div className="px-3 pt-4 flex-grow-1 overflow-auto">
          
          <small className="text-light opacity-50 fw-bold ms-2 mb-2 d-block" style={{ fontSize: '11px', letterSpacing: '1px' }}>MINHA CONTA</small>
          <div className="card dark-card bg-dark border-0 mb-4 shadow-sm" style={{ borderRadius: '1rem' }}>
            <div className="d-flex align-items-center justify-content-between p-3 border-bottom border-secondary border-opacity-25" style={{ cursor: 'pointer' }}>
              <div className="d-flex align-items-center gap-3">
                <div className="bg-secondary bg-opacity-25 p-2 rounded-circle text-white d-flex align-items-center justify-content-center"><FiUser size={18} /></div>
                <span className="text-white" style={{ fontSize: '14px' }}>Meus Dados</span>
              </div>
              <FiChevronRight className="text-light opacity-50" />
            </div>
            <div className="d-flex align-items-center justify-content-between p-3 border-bottom border-secondary border-opacity-25" style={{ cursor: 'pointer' }}>
              <div className="d-flex align-items-center gap-3">
                <div className="bg-secondary bg-opacity-25 p-2 rounded-circle text-white d-flex align-items-center justify-content-center"><FiSettings size={18} /></div>
                <span className="text-white" style={{ fontSize: '14px' }}>Configurações Globais</span>
              </div>
              <FiChevronRight className="text-light opacity-50" />
            </div>
            <div className="d-flex align-items-center justify-content-between p-3" style={{ cursor: 'pointer' }}>
              <div className="d-flex align-items-center gap-3">
                <div className="bg-secondary bg-opacity-25 p-2 rounded-circle text-white d-flex align-items-center justify-content-center"><FiShield size={18} /></div>
                <span className="text-white" style={{ fontSize: '14px' }}>Segurança</span>
              </div>
              <FiChevronRight className="text-light opacity-50" />
            </div>
          </div>

          <small className="text-light opacity-50 fw-bold ms-2 mb-2 d-block" style={{ fontSize: '11px', letterSpacing: '1px' }}>MAIS OPÇÕES</small>
          <div className="card dark-card bg-dark border-0 mb-4 shadow-sm" style={{ borderRadius: '1rem' }}>
            <div className="d-flex align-items-center justify-content-between p-3 border-bottom border-secondary border-opacity-25" style={{ cursor: 'pointer' }}>
              <div className="d-flex align-items-center gap-3">
                <div className="bg-secondary bg-opacity-25 p-2 rounded-circle text-white d-flex align-items-center justify-content-center"><FiBell size={18} /></div>
                <span className="text-white" style={{ fontSize: '14px' }}>Notificações</span>
              </div>
              <FiChevronRight className="text-light opacity-50" />
            </div>
            <div className="d-flex align-items-center justify-content-between p-3" style={{ cursor: 'pointer' }}>
              <div className="d-flex align-items-center gap-3">
                <div className="bg-secondary bg-opacity-25 p-2 rounded-circle text-white d-flex align-items-center justify-content-center"><FiHelpCircle size={18} /></div>
                <span className="text-white" style={{ fontSize: '14px' }}>Central de Ajuda</span>
              </div>
              <FiChevronRight className="text-light opacity-50" />
            </div>
          </div>

        </div>

        <div className="p-4 mt-auto">
          <button 
            className="btn btn-outline-danger w-100 py-3 rounded-4 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 border border-danger text-danger"
            style={{ background: 'transparent' }}
            onClick={handleLogout}
          >
            <FiLogOut size={18} /> Sair do App
          </button>
        </div>
      </Offcanvas.Body>
    </Offcanvas>
  );
}

export default OffcanvasMenu;