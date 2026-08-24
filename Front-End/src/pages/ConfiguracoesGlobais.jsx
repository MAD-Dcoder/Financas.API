import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, FiDollarSign, FiCalendar, FiClock, 
  FiTag, FiEyeOff, FiGlobe, FiDroplet, FiDownload, FiCheck,
  FiLayout, FiRepeat, FiTrash2
} from 'react-icons/fi';

export default function ConfiguracoesGlobais({ temaAtual }) {
  const navigate = useNavigate();
  const isDark = temaAtual === 'dark';

  // 1. Inicia o estado lendo o localStorage (se existir)
  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem('firmo_configs');
    const defaultConfigs = {
      moeda: 'BRL',
      formatoData: 'DD/MM/AAAA',
      inicioMes: 1,
      categoriaPadrao: 'Outros',
      ocultarValores: false,
      telaInicialPadrao: 'dashboard',
      lancamentoContinuo: false,
      confirmacaoExcluir: true,
      idioma: 'pt-BR',
      tema: 'padrao'
    };

    if (saved) {
      try {
        return { ...defaultConfigs, ...JSON.parse(saved) };
      } catch (error) {
        console.error("Erro ao ler configs", error);
      }
    }
    return defaultConfigs;
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig((prev) => ({ ...prev, [name]: value }));
  };

  const toggleSwitch = (chave) => {
    setConfig((prev) => ({ ...prev, [chave]: !prev[chave] }));
  };

  // 2. Salva no localStorage ao clicar no botão
  const handleSalvar = (e) => {
    e.preventDefault();
    localStorage.setItem('firmo_configs', JSON.stringify(config));
    console.log('Configurações salvas:', config);
    alert('Preferências salvas com sucesso!');
  };

  const handleExportar = (formato) => {
    alert(`Exportação em ${formato} iniciada (Simulação).`);
  };

  // Paleta de Cores Premium (idêntica ao MeusDados)
  const bgPage = isDark ? '#0d0d0f' : '#f4f6f8'; 
  const bgInput = isDark ? '#1a1a1e' : '#ffffff'; 
  const textColor = isDark ? '#f8f9fa' : '#1a1a1e';
  const textMuted = isDark ? '#8b8b99' : '#6e6e7a';
  const accentColor = '#10b981'; 

  return (
    <div style={{ backgroundColor: bgPage, minHeight: '100vh', color: textColor, transition: 'background-color 0.3s ease' }}>
      
      {/* HEADER COM SETA DE VOLTAR */}
      <header className="d-flex align-items-center p-4 pb-2" style={{ backgroundColor: 'transparent' }}>
        <button 
          onClick={() => navigate(-1)} 
          className="btn btn-link p-0 me-3 shadow-none border-0" 
        >
          <FiArrowLeft size={24} color={textColor} />
        </button>
      </header>

      <div className="container px-4 pb-5">
        
        {/* TÍTULO DA PÁGINA */}
        <div className="mb-4 mt-2">
          <h4 className="fw-bold mb-1" style={{ letterSpacing: '-0.5px' }}>Configurações Globais</h4>
          <p style={{ color: textMuted, fontSize: '0.85rem' }}>Personalize sua experiência no aplicativo.</p>
        </div>

        <form onSubmit={handleSalvar}>
          
          {/* SEÇÃO 1: PREFERÊNCIAS */}
          
          {/* Tela Inicial Padrão */}
          <div className="mb-4">
            <label className="mb-2 ms-2 fw-medium d-flex align-items-center gap-2" style={{ fontSize: '0.80rem', color: textMuted, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Tela ao Abrir o App
            </label>
            <div className="d-flex align-items-center px-3 py-1 shadow-sm" style={{ backgroundColor: bgInput, borderRadius: '20px', border: isDark ? '1px solid rgba(255,255,255,0.03)' : '1px solid rgba(0,0,0,0.03)' }}>
              <div className="d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '36px', height: '36px', backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f0f2f5', borderRadius: '12px', marginRight: '12px' }}>
                <FiLayout size={18} color={textMuted} />
              </div>
              <select name="telaInicialPadrao" className="form-select shadow-none border-0 bg-transparent py-3" value={config.telaInicialPadrao} onChange={handleChange} style={{ color: textColor, fontSize: '0.95rem', cursor: 'pointer' }}>
                <option value="dashboard" style={{ backgroundColor: bgInput, color: textColor }}>Dashboard Geral</option>
                <option value="transacoes" style={{ backgroundColor: bgInput, color: textColor }}>Lista de Transações</option>
                <option value="cartoes" style={{ backgroundColor: bgInput, color: textColor }}>Meus Cartões</option>
                <option value="novo_lancamento" style={{ backgroundColor: bgInput, color: textColor }}>Tela de Lançamento (Atalho Rápido)</option>
              </select>
            </div>
          </div>

          {/* Moeda Padrão */}
          <div className="mb-4">
            <label className="mb-2 ms-2 fw-medium d-flex align-items-center gap-2" style={{ fontSize: '0.80rem', color: textMuted, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Moeda Padrão
            </label>
            <div className="d-flex align-items-center px-3 py-1 shadow-sm" style={{ backgroundColor: bgInput, borderRadius: '20px', border: isDark ? '1px solid rgba(255,255,255,0.03)' : '1px solid rgba(0,0,0,0.03)' }}>
              <div className="d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '36px', height: '36px', backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f0f2f5', borderRadius: '12px', marginRight: '12px' }}>
                <FiDollarSign size={18} color={textMuted} />
              </div>
              <select name="moeda" className="form-select shadow-none border-0 bg-transparent py-3" value={config.moeda} onChange={handleChange} style={{ color: textColor, fontSize: '0.95rem', cursor: 'pointer' }}>
                <option value="BRL" style={{ backgroundColor: bgInput, color: textColor }}>Real (R$)</option>
                <option value="USD" disabled style={{ backgroundColor: bgInput, color: textMuted }}>Dólar (US$) - Em breve</option>
                <option value="EUR" disabled style={{ backgroundColor: bgInput, color: textMuted }}>Euro (€) - Em breve</option>
              </select>
            </div>
          </div>

          {/* Formato de Data */}
          <div className="mb-4">
            <label className="mb-2 ms-2 fw-medium d-flex align-items-center gap-2" style={{ fontSize: '0.80rem', color: textMuted, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Formato de Data
            </label>
            <div className="d-flex align-items-center px-3 py-1 shadow-sm" style={{ backgroundColor: bgInput, borderRadius: '20px', border: isDark ? '1px solid rgba(255,255,255,0.03)' : '1px solid rgba(0,0,0,0.03)' }}>
              <div className="d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '36px', height: '36px', backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f0f2f5', borderRadius: '12px', marginRight: '12px' }}>
                <FiCalendar size={18} color={textMuted} />
              </div>
              <select name="formatoData" className="form-select shadow-none border-0 bg-transparent py-3" value={config.formatoData} onChange={handleChange} style={{ color: textColor, fontSize: '0.95rem', cursor: 'pointer' }}>
                <option value="DD/MM/AAAA" style={{ backgroundColor: bgInput, color: textColor }}>DD/MM/AAAA (Brasil)</option>
                <option value="MM/DD/AAAA" style={{ backgroundColor: bgInput, color: textColor }}>MM/DD/AAAA (EUA)</option>
              </select>
            </div>
          </div>

          {/* Dia de Início do Mês Financeiro */}
          <div className="mb-4">
            <label className="mb-2 ms-2 fw-medium d-flex align-items-center gap-2" style={{ fontSize: '0.80rem', color: textMuted, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Início do Mês Financeiro
            </label>
            <div className="d-flex align-items-center px-3 py-1 shadow-sm" style={{ backgroundColor: bgInput, borderRadius: '20px', border: isDark ? '1px solid rgba(255,255,255,0.03)' : '1px solid rgba(0,0,0,0.03)' }}>
              <div className="d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '36px', height: '36px', backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f0f2f5', borderRadius: '12px', marginRight: '12px' }}>
                <FiClock size={18} color={textMuted} />
              </div>
              <input 
                type="number" 
                name="inicioMes" 
                min="1" 
                max="31" 
                className="form-control shadow-none border-0 bg-transparent py-3" 
                value={config.inicioMes} 
                onChange={handleChange} 
                style={{ color: textColor, fontSize: '0.95rem' }} 
              />
            </div>
            <div className="mt-2 ms-3 pe-2" style={{ fontSize: '0.78rem', color: textMuted, opacity: 0.85, lineHeight: '1.4' }}>
              Define que dia o cálculo do seu mês reinicia (ex: dia 5).
            </div>
          </div>

          {/* Categoria Padrão */}
          <div className="mb-4">
            <label className="mb-2 ms-2 fw-medium d-flex align-items-center gap-2" style={{ fontSize: '0.80rem', color: textMuted, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Categoria Padrão (Lançamento)
            </label>
            <div className="d-flex align-items-center px-3 py-1 shadow-sm" style={{ backgroundColor: bgInput, borderRadius: '20px', border: isDark ? '1px solid rgba(255,255,255,0.03)' : '1px solid rgba(0,0,0,0.03)' }}>
              <div className="d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '36px', height: '36px', backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f0f2f5', borderRadius: '12px', marginRight: '12px' }}>
                <FiTag size={18} color={textMuted} />
              </div>
              <select name="categoriaPadrao" className="form-select shadow-none border-0 bg-transparent py-3" value={config.categoriaPadrao} onChange={handleChange} style={{ color: textColor, fontSize: '0.95rem', cursor: 'pointer' }}>
                <option value="Alimentacao" style={{ backgroundColor: bgInput, color: textColor }}>Alimentação</option>
                <option value="Transporte" style={{ backgroundColor: bgInput, color: textColor }}>Transporte</option>
                <option value="Lazer" style={{ backgroundColor: bgInput, color: textColor }}>Lazer</option>
                <option value="Outros" style={{ backgroundColor: bgInput, color: textColor }}>Outros</option>
              </select>
            </div>
          </div>

          <hr className="my-5" style={{ opacity: isDark ? 0.1 : 0.05, borderTopWidth: '2px' }} />

          {/* SEÇÃO 2: FLUXO E COMPORTAMENTO (Toggles) */}
          <div className="mb-4">
            <h5 className="fw-bold mb-1" style={{ letterSpacing: '-0.3px' }}>Comportamento</h5>
            <p style={{ color: textMuted, fontSize: '0.85rem' }}>Ajuste como o app reage às suas ações.</p>
          </div>

          {/* Ocultar Valores por Padrão (Modo Privacidade) */}
          <div className="mb-4">
            <div 
              className="d-flex align-items-center px-3 py-2 shadow-sm" 
              style={{ backgroundColor: bgInput, borderRadius: '20px', border: isDark ? '1px solid rgba(255,255,255,0.03)' : '1px solid rgba(0,0,0,0.03)', cursor: 'pointer' }}
              onClick={() => toggleSwitch('ocultarValores')}
            >
              <div className="d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '36px', height: '36px', backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f0f2f5', borderRadius: '12px', marginRight: '12px' }}>
                <FiEyeOff size={18} color={textMuted} />
              </div>
              <div className="flex-grow-1">
                <span className="d-block" style={{ color: textColor, fontSize: '0.90rem', fontWeight: '500' }}>Modo Privacidade</span>
                <span className="d-block" style={{ color: textMuted, fontSize: '0.75rem' }}>Ocultar saldos ao abrir o app</span>
              </div>
              <div className="form-check form-switch m-0 p-0 d-flex align-items-center">
                <input 
                  className="form-check-input ms-0" type="checkbox" role="switch" checked={config.ocultarValores} readOnly 
                  style={{ cursor: 'pointer', width: '2.5em', height: '1.25em' }}
                />
              </div>
            </div>
          </div>

          {/* Lançamento Contínuo */}
          <div className="mb-4">
            <div 
              className="d-flex align-items-center px-3 py-2 shadow-sm" 
              style={{ backgroundColor: bgInput, borderRadius: '20px', border: isDark ? '1px solid rgba(255,255,255,0.03)' : '1px solid rgba(0,0,0,0.03)', cursor: 'pointer' }}
              onClick={() => toggleSwitch('lancamentoContinuo')}
            >
              <div className="d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '36px', height: '36px', backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f0f2f5', borderRadius: '12px', marginRight: '12px' }}>
                <FiRepeat size={18} color={textMuted} />
              </div>
              <div className="flex-grow-1">
                <span className="d-block" style={{ color: textColor, fontSize: '0.90rem', fontWeight: '500' }}>Lançamento Contínuo</span>
                <span className="d-block" style={{ color: textMuted, fontSize: '0.75rem' }}>Manter janela aberta após salvar</span>
              </div>
              <div className="form-check form-switch m-0 p-0 d-flex align-items-center">
                <input 
                  className="form-check-input ms-0" type="checkbox" role="switch" checked={config.lancamentoContinuo} readOnly 
                  style={{ cursor: 'pointer', width: '2.5em', height: '1.25em' }}
                />
              </div>
            </div>
          </div>

          {/* Confirmação ao Excluir */}
          <div className="mb-4">
            <div 
              className="d-flex align-items-center px-3 py-2 shadow-sm" 
              style={{ backgroundColor: bgInput, borderRadius: '20px', border: isDark ? '1px solid rgba(255,255,255,0.03)' : '1px solid rgba(0,0,0,0.03)', cursor: 'pointer' }}
              onClick={() => toggleSwitch('confirmacaoExcluir')}
            >
              <div className="d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '36px', height: '36px', backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f0f2f5', borderRadius: '12px', marginRight: '12px' }}>
                <FiTrash2 size={18} color={textMuted} />
              </div>
              <div className="flex-grow-1">
                <span className="d-block" style={{ color: textColor, fontSize: '0.90rem', fontWeight: '500' }}>Confirmar Exclusões</span>
                <span className="d-block" style={{ color: textMuted, fontSize: '0.75rem' }}>Perguntar antes de apagar registros</span>
              </div>
              <div className="form-check form-switch m-0 p-0 d-flex align-items-center">
                <input 
                  className="form-check-input ms-0" type="checkbox" role="switch" checked={config.confirmacaoExcluir} readOnly 
                  style={{ cursor: 'pointer', width: '2.5em', height: '1.25em' }}
                />
              </div>
            </div>
          </div>

          <hr className="my-5" style={{ opacity: isDark ? 0.1 : 0.05, borderTopWidth: '2px' }} />

          {/* SEÇÃO 3: IDIOMA E TEMA */}
          {/* Idioma */}
          <div className="mb-4">
            <label className="mb-2 ms-2 fw-medium d-flex align-items-center gap-2" style={{ fontSize: '0.80rem', color: textMuted, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Idioma
            </label>
            <div className="d-flex align-items-center px-3 py-1 shadow-sm" style={{ backgroundColor: bgInput, borderRadius: '20px', border: isDark ? '1px solid rgba(255,255,255,0.03)' : '1px solid rgba(0,0,0,0.03)' }}>
              <div className="d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '36px', height: '36px', backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f0f2f5', borderRadius: '12px', marginRight: '12px' }}>
                <FiGlobe size={18} color={textMuted} />
              </div>
              <select name="idioma" className="form-select shadow-none border-0 bg-transparent py-3" value={config.idioma} onChange={handleChange} style={{ color: textColor, fontSize: '0.95rem', cursor: 'pointer' }}>
                <option value="pt-BR" style={{ backgroundColor: bgInput, color: textColor }}>Português (Brasil)</option>
                <option value="en-US" disabled style={{ backgroundColor: bgInput, color: textMuted }}>English - Em breve</option>
              </select>
            </div>
          </div>

          {/* Tema (Gamificação) */}
          <div className="mb-4">
            <label className="mb-2 ms-2 fw-medium d-flex align-items-center gap-2" style={{ fontSize: '0.80rem', color: textMuted, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Tema de Cor (Acento)
            </label>
            <div className="d-flex align-items-center px-3 py-1 shadow-sm" style={{ backgroundColor: bgInput, borderRadius: '20px', border: isDark ? '1px solid rgba(255,255,255,0.03)' : '1px solid rgba(0,0,0,0.03)' }}>
              <div className="d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '36px', height: '36px', backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f0f2f5', borderRadius: '12px', marginRight: '12px' }}>
                <FiDroplet size={18} color={textMuted} />
              </div>
              <select name="tema" className="form-select shadow-none border-0 bg-transparent py-3" value={config.tema} onChange={handleChange} style={{ color: textColor, fontSize: '0.95rem', cursor: 'pointer' }}>
                <option value="padrao" style={{ backgroundColor: bgInput, color: textColor }}>Verde FIRMO (Padrão)</option>
                <option value="gold" disabled style={{ backgroundColor: bgInput, color: textMuted }}>Dourado (Desbloqueia no Nvl 10)</option>
                <option value="purple" disabled style={{ backgroundColor: bgInput, color: textMuted }}>Roxo Neon (Premium)</option>
              </select>
            </div>
          </div>

          <hr className="my-5" style={{ opacity: isDark ? 0.1 : 0.05, borderTopWidth: '2px' }} />

          {/* SEÇÃO 4: DADOS E EXPORTAÇÃO */}
          <div className="mb-4">
            <h5 className="fw-bold mb-1" style={{ letterSpacing: '-0.3px' }}>Exportar Dados</h5>
            <p style={{ color: textMuted, fontSize: '0.85rem' }}>Baixe um extrato completo de suas movimentações.</p>
            
            <div className="d-flex gap-3 mt-4">
              <button 
                type="button" 
                onClick={() => handleExportar('CSV')}
                className="btn w-100 d-flex align-items-center justify-content-center gap-2 shadow-sm" 
                style={{ backgroundColor: bgInput, color: textColor, border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)', borderRadius: '20px', padding: '14px' }}
              >
                <FiDownload size={18} color={textMuted}/> <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Gerar CSV</span>
              </button>
              
              <button 
                type="button" 
                onClick={() => handleExportar('PDF')}
                className="btn w-100 d-flex align-items-center justify-content-center gap-2 shadow-sm" 
                style={{ backgroundColor: bgInput, color: textColor, border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)', borderRadius: '20px', padding: '14px' }}
              >
                <FiDownload size={18} color={textMuted}/> <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Gerar PDF</span>
              </button>
            </div>
          </div>

          {/* Espaçador para o botão não sobrepor o conteúdo */}
          <div style={{ height: '90px' }}></div>

          {/* BOTÃO FIXO NO RODAPÉ */}
          <div 
            className="position-fixed w-100 start-0 px-4 pb-4 pt-3" 
            style={{ 
              bottom: 0, 
              background: `linear-gradient(to top, ${bgPage} 70%, transparent)`,
              zIndex: 10
            }}
          >
            <button 
              type="submit" 
              className="btn w-100 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-lg"
              style={{ 
                backgroundColor: accentColor, color: '#fff', 
                borderRadius: '100px',
                padding: '16px 0', 
                fontSize: '1rem',
                border: 'none',
                transition: 'transform 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <FiCheck size={22} />
              Salvar Preferências
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}