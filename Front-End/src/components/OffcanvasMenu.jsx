import React from 'react';
import { Offcanvas } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { 
  FiUser, FiSettings, FiShield, FiBell, FiHelpCircle, 
  FiLogOut, FiChevronRight, FiX, FiSun, FiMoon, FiList 
} from 'react-icons/fi';

function OffcanvasMenu({ showProfile, setShowProfile, usuarioLogado, handleLogout, temaAtual, toggleTema }) {
  const isDark = temaAtual === 'dark';
  const navigate = useNavigate();

  return (
    <Offcanvas 
      show={showProfile} 
      onHide={() => setShowProfile(false)} 
      placement="start" 
      style={{ 
        backgroundColor: isDark ? '#1e1e24' : '#f0f2f5', 
        color: isDark ? '#fff' : '#212529', 
        maxWidth: '300px', 
        borderRight: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` 
      }}
    >
      <Offcanvas.Body className="p-0 d-flex flex-column">
        
        {/* CABEÇALHO DO PERFIL */}
        <div className="p-4 text-center position-relative" style={{ background: isDark ? 'linear-gradient(to bottom, rgba(16, 185, 129, 0.15), transparent)' : 'linear-gradient(to bottom, rgba(16, 185, 129, 0.10), transparent)', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` }}>
          <button 
            className={`btn btn-link position-absolute top-0 end-0 mt-3 me-2 opacity-50 shadow-none border-0 ${isDark ? 'text-white' : 'text-dark'}`}
            onClick={() => setShowProfile(false)}
          >
            <FiX size={24} />
          </button>
          <div className="rounded-circle d-flex justify-content-center align-items-center mx-auto mb-3 mt-3 shadow-lg" 
               style={{ width: '80px', height: '80px', background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', color: '#fff', fontWeight: 'bold', fontSize: '32px' }}>
            {usuarioLogado?.nome ? usuarioLogado.nome.charAt(0).toUpperCase() : 'U'}
          </div>
          <h5 className={`fw-bold mb-1 ${isDark ? 'text-white' : 'text-dark'}`}>{usuarioLogado?.nome}</h5>
          <small className={isDark ? "text-light opacity-75" : "text-muted"}>{usuarioLogado?.email}</small>
        </div>
        

        {/* LISTA DE OPÇÕES */}
        <div className="px-3 pt-4 flex-grow-1 overflow-auto">
          
          <small className={`${isDark ? 'text-light' : 'text-dark'} opacity-50 fw-bold ms-2 mb-2 d-block`} style={{ fontSize: '11px', letterSpacing: '1px' }}>MINHA CONTA</small>
          
          <div className={`card ${isDark ? 'dark-card bg-dark' : 'bg-white'} border-0 mb-4 shadow-sm`} style={{ borderRadius: '1rem' }}>
            
            {/* OPÇÃO: MEUS DADOS */}
            <div 
              className={`d-flex align-items-center justify-content-between p-3 border-bottom ${isDark ? 'border-secondary border-opacity-25' : 'border-light'}`} 
              style={{ cursor: 'pointer' }}
              onClick={() => {
                setShowProfile(false);
                navigate('/meus-dados');
              }}
            >
              <div className="d-flex align-items-center gap-3">
                <div className={`p-2 rounded-circle d-flex align-items-center justify-content-center ${isDark ? 'bg-secondary bg-opacity-25 text-white' : 'bg-light text-dark'}`}><FiUser size={18} /></div>
                <span className={isDark ? "text-white" : "text-dark"} style={{ fontSize: '14px' }}>Meus Dados</span>
              </div>
              <FiChevronRight className={`${isDark ? 'text-light' : 'text-dark'} opacity-50`} />
            </div>

            {/* APARÊNCIA */}
            <div 
              className={`d-flex align-items-center justify-content-between p-3 border-bottom ${isDark ? 'border-secondary border-opacity-25' : 'border-light'}`} 
              style={{ cursor: 'pointer' }}
              onClick={toggleTema}
            >
              <div className="d-flex align-items-center gap-3">
                <div className={`p-2 rounded-circle d-flex align-items-center justify-content-center ${isDark ? 'bg-secondary bg-opacity-25 text-warning' : 'bg-light text-warning'}`}>
                  {isDark ? <FiMoon size={18} /> : <FiSun size={18} />}
                </div>
                <span className={isDark ? "text-white" : "text-dark"} style={{ fontSize: '14px' }}>Aparência</span>
              </div>
              <div className="form-check form-switch m-0 p-0 d-flex align-items-center">
                <input 
                  className="form-check-input ms-0" type="checkbox" role="switch" checked={!isDark} readOnly 
                  style={{ cursor: 'pointer', width: '2.5em', height: '1.25em' }}
                />
              </div>
            </div>

            {/* CONFIGURAÇÕES GLOBAIS - AQUI FOI ADICIONADO O ONCLICK */}
            <div 
              className={`d-flex align-items-center justify-content-between p-3 border-bottom ${isDark ? 'border-secondary border-opacity-25' : 'border-light'}`} 
              style={{ cursor: 'pointer' }}
              onClick={() => {
                setShowProfile(false);
                navigate('/configuracoes');
              }}
            >
              <div className="d-flex align-items-center gap-3">
                <div className={`p-2 rounded-circle d-flex align-items-center justify-content-center ${isDark ? 'bg-secondary bg-opacity-25 text-white' : 'bg-light text-dark'}`}><FiSettings size={18} /></div>
                <span className={isDark ? "text-white" : "text-dark"} style={{ fontSize: '14px' }}>Configurações Globais</span>
              </div>
              <FiChevronRight className={`${isDark ? 'text-light' : 'text-dark'} opacity-50`} />
            </div>

            {/* OPÇÃO: GERENCIAR CATEGORIAS */}
            <div 
              className={`d-flex align-items-center justify-content-between p-3 border-bottom ${isDark ? 'border-secondary border-opacity-25' : 'border-light'}`} 
              style={{ cursor: 'pointer' }}
              onClick={() => {
                setShowProfile(false);
                navigate('/gerenciar-categorias');
              }}
            >
              <div className="d-flex align-items-center gap-3">
                <div className={`p-2 rounded-circle d-flex align-items-center justify-content-center ${isDark ? 'bg-secondary bg-opacity-25 text-white' : 'bg-light text-dark'}`}>
                  <FiList size={18} />
                </div>
                <span className={isDark ? "text-white" : "text-dark"} style={{ fontSize: '14px' }}>Gerenciar Categorias</span>
              </div>
              <FiChevronRight className={`${isDark ? 'text-light' : 'text-dark'} opacity-50`} />
            </div>

            {/* SEGURANÇA */}
            <div className="d-flex align-items-center justify-content-between p-3" style={{ cursor: 'pointer' }}>
              <div className="d-flex align-items-center gap-3">
                <div className={`p-2 rounded-circle d-flex align-items-center justify-content-center ${isDark ? 'bg-secondary bg-opacity-25 text-white' : 'bg-light text-dark'}`}><FiShield size={18} /></div>
                <span className={isDark ? "text-white" : "text-dark"} style={{ fontSize: '14px' }}>Segurança</span>
              </div>
              <FiChevronRight className={`${isDark ? 'text-light' : 'text-dark'} opacity-50`} />
            </div>
          </div>

          <small className={`${isDark ? 'text-light' : 'text-dark'} opacity-50 fw-bold ms-2 mb-2 d-block`} style={{ fontSize: '11px', letterSpacing: '1px' }}>MAIS OPÇÕES</small>
          
          <div className={`card ${isDark ? 'dark-card bg-dark' : 'bg-white'} border-0 mb-4 shadow-sm`} style={{ borderRadius: '1rem' }}>
            <div className={`d-flex align-items-center justify-content-between p-3 border-bottom ${isDark ? 'border-secondary border-opacity-25' : 'border-light'}`} style={{ cursor: 'pointer' }}>
              <div className="d-flex align-items-center gap-3">
                <div className={`p-2 rounded-circle d-flex align-items-center justify-content-center ${isDark ? 'bg-secondary bg-opacity-25 text-white' : 'bg-light text-dark'}`}><FiBell size={18} /></div>
                <span className={isDark ? "text-white" : "text-dark"} style={{ fontSize: '14px' }}>Notificações</span>
              </div>
              <FiChevronRight className={`${isDark ? 'text-light' : 'text-dark'} opacity-50`} />
            </div>
            
            <div className="d-flex align-items-center justify-content-between p-3" style={{ cursor: 'pointer' }}>
              <div className="d-flex align-items-center gap-3">
                <div className={`p-2 rounded-circle d-flex align-items-center justify-content-center ${isDark ? 'bg-secondary bg-opacity-25 text-white' : 'bg-light text-dark'}`}><FiHelpCircle size={18} /></div>
                <span className={isDark ? "text-white" : "text-dark"} style={{ fontSize: '14px' }}>Central de Ajuda</span>
              </div>
              <FiChevronRight className={`${isDark ? 'text-light' : 'text-dark'} opacity-50`} />
            </div>
          </div>

        </div>

        <div className="p-4 mt-auto border-top border-secondary border-opacity-10">
          <button 
            className={`btn btn-outline-danger w-100 py-3 rounded-4 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 border text-danger ${isDark ? 'border-danger' : ''}`}
            style={{ background: isDark ? 'transparent' : '#fff' }}
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