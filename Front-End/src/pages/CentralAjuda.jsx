import React, { useState } from 'react';
import { FiArrowLeft, FiChevronDown, FiPlayCircle, FiLifeBuoy, FiZap, FiArrowRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import './ConfigPages.css';

const CentralAjuda = ({ temaAtual }) => {
  const navigate = useNavigate();
  const isDark = temaAtual === 'dark';
  const [faqAberto, setFaqAberto] = useState(null);
  const [devDrawerOpen, setDevDrawerOpen] = useState(false);

  const toggleFaq = (index) => {
    setFaqAberto(faqAberto === index ? null : index);
  };

  const faqs = [
    {
      pergunta: "O Firmo se conecta ao meu banco?",
      resposta: "Não. O Firmo utiliza a metodologia de \"Rastreamento Ativo\". Acreditamos que o ato de registrar manualmente cada gasto gera mais consciência financeira."
    },
    {
      pergunta: "Meus dados financeiros estão seguros?",
      resposta: "Sim! Seus dados são protegidos com criptografia de ponta a ponta e armazenados em nuvem segura. Como o Firmo usa rastreamento manual, nós nunca pedimos ou armazenamos as senhas do seu banco."
    },
    {
      pergunta: "O Firmo respeita a LGPD?",
      resposta: "Com certeza. Seguimos rigorosamente a Lei Geral de Proteção de Dados (LGPD). Não vendemos suas informações para terceiros e você tem controle total: pode exportar ou excluir todos os seus dados definitivamente na aba 'Segurança'."
    },
    {
      pergunta: "Como lanço compras parceladas?",
      resposta: "Ao adicionar uma despesa, selecione \"Repetir Lançamento\" ou \"Parcelado\" e defina os meses. O Firmo alocará o valor automaticamente para os próximos meses."
    },
    {
      pergunta: "Meu salário cai no dia 5. O que faço?",
      resposta: "Vá em \"Configurações Globais\" e altere o \"Início do Mês Financeiro\" para o dia 5. Seus gráficos e limites resetarão nessa data."
    },
    {
      pergunta: "Como crio categorias específicas?",
      resposta: "Acesse a opção \"Gerenciar Categorias\" no menu principal. Lá você pode adicionar novas categorias personalizadas, escolher ícones e cores para organizar os gastos do seu jeito."
    },
    {
      pergunta: "O que é o Modo Pânico?",
      resposta: "É um recurso de privacidade. Quando ativado na aba \"Segurança\", basta virar a tela do seu celular para baixo para ocultar imediatamente todos os saldos e valores da tela."
    }
  ];

  return (
    <div className={`config-page ${isDark ? 'theme-dark' : 'theme-light'}`} data-bs-theme={temaAtual}>
      <div className="config-header">
        <button 
          onClick={() => navigate(-1)} 
          className={`btn btn-link p-0 border-0 mb-3 shadow-none ${isDark ? 'text-white' : 'text-dark'}`}
        >
          <FiArrowLeft size={24} />
        </button>
        <h1 className={isDark ? 'text-white' : 'text-dark'}>Central de Ajuda</h1>
        <p>Tire dúvidas e resolva problemas rápidos.</p>
      </div>

      <div className="config-section">
        
        <p className="config-section-title">Atalhos Rápidos</p>
        <div className="config-grid">
          <button className="config-grid-card">
            <div className="icon-circle-blue">
              <FiPlayCircle size={18} />
            </div>
            <div>
              <span className="config-text-main">Refazer Tutorial</span>
              <span className="config-text-sub">Entenda o app</span>
            </div>
          </button>

          <button className="config-grid-card" style={{border: '1px solid rgba(0, 201, 130, 0.3)'}}>
            <div className="icon-circle-green">
              <FiLifeBuoy size={18} />
            </div>
            <div>
              <span className="config-text-main">SOS de Saldo</span>
              <span className="config-text-sub">Corrigir diferença</span>
            </div>
          </button>
        </div>

        <div className="config-divider" style={{marginTop: 0}}></div>

        <p className="config-section-title">Perguntas Frequentes</p>
        <div>
          {faqs.map((faq, index) => (
            <div key={index} className="faq-item">
              <button onClick={() => toggleFaq(index)} className="faq-btn shadow-none">
                <span style={{color: faqAberto === index ? '#00c982' : (isDark ? '#e5e7eb' : '#1e293b'), fontSize: '13px'}}>{faq.pergunta}</span>
                <FiChevronDown style={{ transform: faqAberto === index ? 'rotate(180deg)' : 'none', transition: '0.3s', color: faqAberto === index ? '#00c982' : '#9ca3af'}} />
              </button>
              <div className={`faq-content ${faqAberto === index ? 'open' : ''}`}>
                {faq.resposta}
              </div>
            </div>
          ))}
        </div>

        <div className="config-divider"></div>

        <div className="neon-border-wrapper mb-4">
          <div className="neon-border-content p-3 border-0 d-flex flex-column justify-content-center">
            <button 
              onClick={() => setDevDrawerOpen(!devDrawerOpen)} 
              className="w-100 bg-transparent border-0 d-flex align-items-center justify-content-between p-0 shadow-none text-start"
            >
              <div className="config-card-left">
                <FiZap className="text-warning" size={20} />
                <div>
                  <span className="config-text-main">Falar com o Desenvolvedor</span>
                  <span className="config-text-sub">Sugerir função ou reportar erro</span>
                </div>
              </div>
            </button>

            <div 
              style={{ 
                maxHeight: devDrawerOpen ? '200px' : '0px', 
                opacity: devDrawerOpen ? 1 : 0,
                marginTop: devDrawerOpen ? '16px' : '0px',
                overflow: 'hidden',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <p className="mb-3" style={{ fontSize: '14px', color: '#9ca3af', lineHeight: '1.5' }}>
                O Firmo é feito com muito café e dedicação! ☕ Se você esbarrou em algum bug, teve uma ideia incrível para o app ou quer bater um papo sobre novas funções, me manda uma mensagem. Vou adorar te ouvir!
              </p>
              <a 
                href="https://wa.me/5531997148385" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-decoration-none d-inline-flex align-items-center gap-2"
                style={{ color: '#10b981', fontWeight: '600', fontSize: '14px' }}
              >
                Me chame no WhatsApp <FiArrowRight size={16} />
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CentralAjuda;