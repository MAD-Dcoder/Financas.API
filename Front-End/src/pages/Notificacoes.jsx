import React, { useState } from 'react';
import { FiArrowLeft, FiBell, FiMoon, FiPieChart, FiCalendar } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import './ConfigPages.css';

const Notificacoes = () => {
  const navigate = useNavigate();
  const [dailyReminder, setDailyReminder] = useState(true);
  const [weekendMute, setWeekendMute] = useState(false);
  const [limitAlert, setLimitAlert] = useState(true);
  const [monthTurn, setMonthTurn] = useState(true);

  return (
    <div className="config-page">
      <div className="config-header">
        <button onClick={() => navigate(-1)} className="btn btn-link text-white p-0 border-0 mb-3 shadow-none">
          <FiArrowLeft size={24} />
        </button>
        <h1>Notificações</h1>
        <p>Configure os lembretes para manter o hábito.</p>
      </div>

      <div className="config-section">
        <p className="config-section-title">Rotina de Lançamentos</p>
        
        <div className="config-card" style={{flexDirection: 'column', alignItems: 'stretch'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: dailyReminder ? '16px' : '0'}}>
            <div className="config-card-left">
              <FiBell className="config-icon" />
              <div>
                <span className="config-text-main">Lembrete Diário</span>
                <span className="config-text-sub">Aviso para registrar os gastos</span>
              </div>
            </div>
            <div className="form-check form-switch m-0 p-0 d-flex align-items-center">
              <input 
                className="form-check-input ms-0 shadow-none" 
                type="checkbox" 
                role="switch" 
                checked={dailyReminder} 
                onChange={() => setDailyReminder(!dailyReminder)}
                style={{ cursor: 'pointer', width: '2.5em', height: '1.25em', backgroundColor: dailyReminder ? '#10b981' : 'transparent', borderColor: dailyReminder ? '#10b981' : 'rgba(255,255,255,0.2)' }}
              />
            </div>
          </div>
          
          {dailyReminder && (
            <div style={{display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '12px', paddingLeft: '32px'}}>
              <span style={{fontSize: '14px', color: '#9ca3af'}}>Horário do alerta</span>
              <select className="config-select shadow-none" style={{color: '#fff'}}>
                <option value="18:00">18:00</option>
                <option value="20:00">20:00</option>
                <option value="22:00">22:00</option>
              </select>
            </div>
          )}
        </div>

        <div className="config-card">
          <div className="config-card-left">
            <FiMoon className="config-icon" />
            <div>
              <span className="config-text-main">Pausar no Fim de Semana</span>
              <span className="config-text-sub">Sem alertas sábados e domingos</span>
            </div>
          </div>
          <div className="form-check form-switch m-0 p-0 d-flex align-items-center">
            <input 
              className="form-check-input ms-0 shadow-none" 
              type="checkbox" 
              role="switch" 
              checked={weekendMute} 
              onChange={() => setWeekendMute(!weekendMute)}
              style={{ cursor: 'pointer', width: '2.5em', height: '1.25em', backgroundColor: weekendMute ? '#10b981' : 'transparent', borderColor: weekendMute ? '#10b981' : 'rgba(255,255,255,0.2)' }}
            />
          </div>
        </div>

        <div className="config-divider"></div>

        <p className="config-section-title">Metas e Orçamentos</p>
        
        <div className="config-card">
          <div className="config-card-left">
            <FiPieChart className="config-icon" />
            <div>
              <span className="config-text-main">Aviso de Limite (80%)</span>
              <span className="config-text-sub">Quando a categoria estourar</span>
            </div>
          </div>
          <div className="form-check form-switch m-0 p-0 d-flex align-items-center">
            <input 
              className="form-check-input ms-0 shadow-none" 
              type="checkbox" 
              role="switch" 
              checked={limitAlert} 
              onChange={() => setLimitAlert(!limitAlert)}
              style={{ cursor: 'pointer', width: '2.5em', height: '1.25em', backgroundColor: limitAlert ? '#10b981' : 'transparent', borderColor: limitAlert ? '#10b981' : 'rgba(255,255,255,0.2)' }}
            />
          </div>
        </div>

        <div className="config-card">
          <div className="config-card-left">
            <FiCalendar className="config-icon" />
            <div>
              <span className="config-text-main">Virada do Mês</span>
              <span className="config-text-sub">Lembrete para o novo ciclo</span>
            </div>
          </div>
          <div className="form-check form-switch m-0 p-0 d-flex align-items-center">
            <input 
              className="form-check-input ms-0 shadow-none" 
              type="checkbox" 
              role="switch" 
              checked={monthTurn} 
              onChange={() => setMonthTurn(!monthTurn)}
              style={{ cursor: 'pointer', width: '2.5em', height: '1.25em', backgroundColor: monthTurn ? '#10b981' : 'transparent', borderColor: monthTurn ? '#10b981' : 'rgba(255,255,255,0.2)' }}
            />
          </div>
        </div>
      </div>

      <div className="config-bottom-bar">
        <button className="config-btn-save">✓ Salvar Preferências</button>
      </div>
    </div>
  );
};

export default Notificacoes;