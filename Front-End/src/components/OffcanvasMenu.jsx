import React from 'react';
import { Offcanvas } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { 
  FiUser, FiSettings, FiShield, FiBell, FiHelpCircle, 
  FiLogOut, FiChevronRight, FiX, FiSun, FiMoon, FiList, FiTarget 
} from 'react-icons/fi';
import { getIniciais, getNomeCurto } from '../utils/formatters';

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
        borderRight: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        transition: 'background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease'
      }}
    >
      <Offcanvas.Body className="p-0 d-flex flex-column">
        
        <div className="p-4 text-center position-relative" style={{ 
            background: isDark ? 'linear-gradient(to bottom, rgba(16, 185, 129, 0.15), transparent)' : 'linear-gradient(to bottom, rgba(16, 185, 129, 0.10), transparent)', 
            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
            transition: 'background 0.3s ease, border-color 0.3s ease'
          }}>
          <button 
            className={`btn btn-link position-absolute top-0 end-0 mt-3 me-2 opacity-50 shadow-none border-0 ${isDark ? 'text-white' : 'text-dark'}`}
            onClick={() => setShowProfile(false)}
          >
            <FiX size={24} />
          </button>
          <div className="rounded-circle d-flex justify-content-center align-items-center mx-auto mb-3 mt-3 shadow-lg" 
                style={{ width: '80px', height: '80px', background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', color: '#fff', fontWeight: 'bold', fontSize: '32px' }}>
            {getIniciais(usuarioLogado?.nome)}
          </div>
          <h5 className={`fw-bold mb-1 ${isDark ? 'text-white' : 'text-dark'}`} style={{ transition: 'color 0.3s ease' }}>{getNomeCurto(usuarioLogado?.nome)}</h5>
          <small className={isDark ? "text-light opacity-75" : "text-muted"} style={{ transition: 'color 0.3s ease' }}>{usuarioLogado?.email}</small>
        </div>

        <div className="px-3 pt-4 flex-grow-1 overflow-auto">
          
          <small className={`${isDark ? 'text-light' : 'text-dark'} opacity-50 fw-bold ms-2 mb-2 d-block`} style={{ fontSize: '11px', letterSpacing: '1px', transition: 'color 0.3s ease' }}>MINHA CONTA</small>
          <div className={`card ${isDark ? 'dark-card bg-dark' : 'bg-white'} border-0 mb-4 shadow-sm`} style={{ borderRadius: '1rem', transition: 'background-color 0.3s ease, box-shadow 0.3s ease' }}>
            <div className={`d-flex align-items-center justify-content-between p-3 border-bottom ${isDark ? 'border-secondary border-opacity-25' : 'border-light'}`} style={{ cursor: 'pointer', transition: 'border-color 0.3s ease' }} onClick={() => { setShowProfile(false); navigate('/meus-dados'); }}>
              <div className="d-flex align-items-center gap-3">
                <div className={`p-2 rounded-circle d-flex align-items-center justify-content-center ${isDark ? 'bg-secondary bg-opacity-25 text-white' : 'bg-light text-dark'}`} style={{ transition: 'background-color 0.3s ease, color 0.3s ease' }}><FiUser size={18} /></div>
                <span className={isDark ? "text-white" : "text-dark"} style={{ fontSize: '14px', transition: 'color 0.3s ease' }}>Meus Dados</span>
              </div>
              <FiChevronRight className={`${isDark ? 'text-light' : 'text-dark'} opacity-50`} />
            </div>
            <div className="d-flex align-items-center justify-content-between p-3" style={{ cursor: 'pointer' }} onClick={() => { setShowProfile(false); navigate('/seguranca'); }}>
              <div className="d-flex align-items-center gap-3">
                <div className={`p-2 rounded-circle d-flex align-items-center justify-content-center ${isDark ? 'bg-secondary bg-opacity-25 text-white' : 'bg-light text-dark'}`} style={{ transition: 'background-color 0.3s ease, color 0.3s ease' }}><FiShield size={18} /></div>
                <span className={isDark ? "text-white" : "text-dark"} style={{ fontSize: '14px', transition: 'color 0.3s ease' }}>Segurança</span>
              </div>
              <FiChevronRight className={`${isDark ? 'text-light' : 'text-dark'} opacity-50`} />
            </div>
          </div>

          <small className={`${isDark ? 'text-light' : 'text-dark'} opacity-50 fw-bold ms-2 mb-2 d-block`} style={{ fontSize: '11px', letterSpacing: '1px', transition: 'color 0.3s ease' }}>GESTÃO & PLANEJAMENTO</small>
          <div className={`card ${isDark ? 'dark-card bg-dark' : 'bg-white'} border-0 mb-4 shadow-sm`} style={{ borderRadius: '1rem', transition: 'background-color 0.3s ease, box-shadow 0.3s ease' }}>
            <div className={`d-flex align-items-center justify-content-between p-3 border-bottom ${isDark ? 'border-secondary border-opacity-25' : 'border-light'}`} style={{ cursor: 'pointer', transition: 'border-color 0.3s ease' }} onClick={() => { setShowProfile(false); navigate('/gerenciar-categorias'); }}>
              <div className="d-flex align-items-center gap-3">
                <div className={`p-2 rounded-circle d-flex align-items-center justify-content-center ${isDark ? 'bg-secondary bg-opacity-25 text-white' : 'bg-light text-dark'}`} style={{ transition: 'background-color 0.3s ease, color 0.3s ease' }}><FiList size={18} /></div>
                <span className={isDark ? "text-white" : "text-dark"} style={{ fontSize: '14px', transition: 'color 0.3s ease' }}>Gerenciar Categorias</span>
              </div>
              <FiChevronRight className={`${isDark ? 'text-light' : 'text-dark'} opacity-50`} />
            </div>
            <div className="d-flex align-items-center justify-content-between p-3" style={{ cursor: 'pointer' }} onClick={() => { setShowProfile(false); navigate('/metas'); }}>
              <div className="d-flex align-items-center gap-3">
                <div className={`p-2 rounded-circle d-flex align-items-center justify-content-center ${isDark ? 'bg-success bg-opacity-25 text-success' : 'bg-success bg-opacity-10 text-success'}`} style={{ transition: 'background-color 0.3s ease, color 0.3s ease' }}><FiTarget size={18} /></div>
                <span className={isDark ? "text-white" : "text-dark"} style={{ fontSize: '14px', transition: 'color 0.3s ease' }}>Limites & Metas</span>
              </div>
              <FiChevronRight className={`${isDark ? 'text-light' : 'text-dark'} opacity-50`} />
            </div>
          </div>

          <small className={`${isDark ? 'text-light' : 'text-dark'} opacity-50 fw-bold ms-2 mb-2 d-block`} style={{ fontSize: '11px', letterSpacing: '1px', transition: 'color 0.3s ease' }}>PREFERÊNCIAS</small>
          <div className={`card ${isDark ? 'dark-card bg-dark' : 'bg-white'} border-0 mb-4 shadow-sm`} style={{ borderRadius: '1rem', transition: 'background-color 0.3s ease, box-shadow 0.3s ease' }}>
            <div className={`d-flex align-items-center justify-content-between p-3 border-bottom ${isDark ? 'border-secondary border-opacity-25' : 'border-light'}`} style={{ cursor: 'pointer', transition: 'border-color 0.3s ease' }} onClick={toggleTema}>
              <div className="d-flex align-items-center gap-3">
                <div className={`p-2 rounded-circle d-flex align-items-center justify-content-center ${isDark ? 'bg-secondary bg-opacity-25 text-warning' : 'bg-light text-warning'}`} style={{ transition: 'background-color 0.3s ease, color 0.3s ease' }}>
                  {isDark ? <FiMoon size={18} /> : <FiSun size={18} />}
                </div>
                <span className={isDark ? "text-white" : "text-dark"} style={{ fontSize: '14px', transition: 'color 0.3s ease' }}>Aparência</span>
              </div>
              
              {/* 🟢 TOGGLE ACELERADO VIA GPU - TAMANHO EXATO DO PADRÃO 🟢 */}
              <div 
                className="d-flex align-items-center" 
                style={{ 
                  width: '40px', 
                  height: '20px', 
                  borderRadius: '20px', 
                  backgroundColor: !isDark ? '#10b981' : 'transparent',
                  border: `1px solid ${!isDark ? '#10b981' : 'rgba(255,255,255,0.3)'}`,
                  padding: '1px',
                  position: 'relative',
                  transition: 'background-color 0.3s ease, border-color 0.3s ease'
                }}
              >
                <div 
                  style={{ 
                    width: '16px', 
                    height: '16px', 
                    borderRadius: '50%', 
                    backgroundColor: !isDark ? '#fff' : 'rgba(255,255,255,0.5)',
                    transform: !isDark ? 'translateX(20px)' : 'translateX(0)',
                    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s ease',
                    willChange: 'transform',
                    boxShadow: !isDark ? '0 1px 2px rgba(0,0,0,0.2)' : 'none'
                  }} 
                />
              </div>

            </div>
            <div className={`d-flex align-items-center justify-content-between p-3 border-bottom ${isDark ? 'border-secondary border-opacity-25' : 'border-light'}`} style={{ cursor: 'pointer', transition: 'border-color 0.3s ease' }} onClick={() => { setShowProfile(false); navigate('/configuracoes'); }}>
              <div className="d-flex align-items-center gap-3">
                <div className={`p-2 rounded-circle d-flex align-items-center justify-content-center ${isDark ? 'bg-secondary bg-opacity-25 text-white' : 'bg-light text-dark'}`} style={{ transition: 'background-color 0.3s ease, color 0.3s ease' }}><FiSettings size={18} /></div>
                <span className={isDark ? "text-white" : "text-dark"} style={{ fontSize: '14px', transition: 'color 0.3s ease' }}>Configurações Globais</span>
              </div>
              <FiChevronRight className={`${isDark ? 'text-light' : 'text-dark'} opacity-50`} />
            </div>
            <div className="d-flex align-items-center justify-content-between p-3" style={{ cursor: 'pointer' }} onClick={() => { setShowProfile(false); navigate('/notificacoes'); }}>
              <div className="d-flex align-items-center gap-3">
                <div className={`p-2 rounded-circle d-flex align-items-center justify-content-center ${isDark ? 'bg-secondary bg-opacity-25 text-white' : 'bg-light text-dark'}`} style={{ transition: 'background-color 0.3s ease, color 0.3s ease' }}><FiBell size={18} /></div>
                <span className={isDark ? "text-white" : "text-dark"} style={{ fontSize: '14px', transition: 'color 0.3s ease' }}>Notificações</span>
              </div>
              <FiChevronRight className={`${isDark ? 'text-light' : 'text-dark'} opacity-50`} />
            </div>
          </div>

          <small className={`${isDark ? 'text-light' : 'text-dark'} opacity-50 fw-bold ms-2 mb-2 d-block`} style={{ fontSize: '11px', letterSpacing: '1px', transition: 'color 0.3s ease' }}>SUPORTE</small>
          <div className={`card ${isDark ? 'dark-card bg-dark' : 'bg-white'} border-0 mb-4 shadow-sm`} style={{ borderRadius: '1rem', transition: 'background-color 0.3s ease, box-shadow 0.3s ease' }}>
            <div className="d-flex align-items-center justify-content-between p-3" style={{ cursor: 'pointer' }} onClick={() => { setShowProfile(false); navigate('/central-ajuda'); }}>
              <div className="d-flex align-items-center gap-3">
                <div className={`p-2 rounded-circle d-flex align-items-center justify-content-center ${isDark ? 'bg-secondary bg-opacity-25 text-white' : 'bg-light text-dark'}`} style={{ transition: 'background-color 0.3s ease, color 0.3s ease' }}><FiHelpCircle size={18} /></div>
                <span className={isDark ? "text-white" : "text-dark"} style={{ fontSize: '14px', transition: 'color 0.3s ease' }}>Central de Ajuda</span>
              </div>
              <FiChevronRight className={`${isDark ? 'text-light' : 'text-dark'} opacity-50`} />
            </div>
          </div>

        </div>

        <div className="p-4 mt-auto border-top border-secondary border-opacity-10" style={{ transition: 'border-color 0.3s ease' }}>
          <button 
            className={`btn btn-outline-danger w-100 py-3 rounded-4 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 border text-danger ${isDark ? 'border-danger' : ''}`}
            style={{ background: isDark ? 'transparent' : '#fff', transition: 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease' }}
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