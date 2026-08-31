import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiBell, FiMoon, FiPieChart, FiCalendar } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import './ConfigPages.css';

const Notificacoes = ({ temaAtual }) => {
  const navigate = useNavigate();
  const isDark = temaAtual === 'dark';
  
  // 1. Unificamos os estados
  const initialState = {
    dailyReminder: true,
    reminderTime: '18:00', // Captura o valor do select também
    weekendMute: false,
    limitAlert: true,
    monthTurn: true
  };

  const [formState, setFormState] = useState(initialState);
  const [hasChanges, setHasChanges] = useState(false);

  // 2. Compara em tempo real
  useEffect(() => {
    const isDifferent = JSON.stringify(initialState) !== JSON.stringify(formState);
    setHasChanges(isDifferent);
  }, [formState]);

  const handleChange = (field, value) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    toast.success('Notificações atualizadas com sucesso!');
    // 3. Reseta o estado para ocultar o botão
    setHasChanges(false);
  };

  const getToggleStyle = (checked) => ({
    cursor: 'pointer',
    width: '2.5em',
    height: '1.25em',
    backgroundColor: checked ? '#10b981' : (isDark ? 'transparent' : '#ffffff'),
    borderColor: checked ? '#10b981' : (isDark ? 'rgba(255,255,255,0.3)' : '#cbd5e1'),
    borderWidth: '1px',
    borderStyle: 'solid'
  });

  return (
    <div className={`config-page ${isDark ? 'theme-dark' : 'theme-light'}`} data-bs-theme={temaAtual}>
      <div className="config-header">
        <button 
          onClick={() => navigate(-1)} 
          className={`btn btn-link p-0 border-0 mb-3 shadow-none ${isDark ? 'text-white' : 'text-dark'}`}
        >
          <FiArrowLeft size={24} />
        </button>
        <h1 className={isDark ? 'text-white' : 'text-dark'}>Notificações</h1>
        <p>Configure os lembretes para manter o hábito.</p>
      </div>

      <div className="config-section">
        <p className="config-section-title">Rotina de Lançamentos</p>
        
        <div className="config-card" style={{flexDirection: 'column', alignItems: 'stretch'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: formState.dailyReminder ? '16px' : '0'}}>
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
                checked={formState.dailyReminder} 
                onChange={() => handleChange('dailyReminder', !formState.dailyReminder)}
                style={getToggleStyle(formState.dailyReminder)}
              />
            </div>
          </div>
          
          {formState.dailyReminder && (
            <div style={{display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.05)' : '#e2e8f0'}`, paddingTop: '12px', paddingLeft: '32px'}}>
              <span style={{fontSize: '14px', color: '#9ca3af'}}>Horário do alerta</span>
              <select 
                className={`config-select shadow-none ${isDark ? 'text-white' : 'text-dark'}`}
                value={formState.reminderTime}
                onChange={(e) => handleChange('reminderTime', e.target.value)}
              >
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
              checked={formState.weekendMute} 
              onChange={() => handleChange('weekendMute', !formState.weekendMute)}
              style={getToggleStyle(formState.weekendMute)}
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
              checked={formState.limitAlert} 
              onChange={() => handleChange('limitAlert', !formState.limitAlert)}
              style={getToggleStyle(formState.limitAlert)}
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
              checked={formState.monthTurn} 
              onChange={() => handleChange('monthTurn', !formState.monthTurn)}
              style={getToggleStyle(formState.monthTurn)}
            />
          </div>
        </div>
      </div>

      {/* 4. Renderização Condicional */}
      {hasChanges && (
        <div className="config-bottom-bar">
          <button className="config-btn-save text-white" onClick={handleSave}>✓ Salvar Preferências</button>
        </div>
      )}
    </div>
  );
};

export default Notificacoes;