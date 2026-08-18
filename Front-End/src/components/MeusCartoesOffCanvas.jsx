import React from 'react';
import { Offcanvas } from 'react-bootstrap';
import { FiPlus, FiCreditCard } from 'react-icons/fi';

// Adicionamos o onSelecionarCartao aqui nas propriedades
function MeusCartoesOffcanvas({ show, onHide, temaAtual, onSelecionarCartao }) {
  const isDark = temaAtual === 'dark';

  // Simulação de Cartões com as datas reais de fechamento e vencimento embutidas
  const cartoesSimulados = [
    {
      id: 1,
      apelido: 'Luiza Ouro Gold',
      final: '3911',
      bandeira: 'Mastercard',
      corBackground: '#ffbb00', 
      corTexto: '#1a1a1a',      
      bordaBotao: 'rgba(0,0,0,0.6)',
      melhorDia: '03',
      diaFechamento: '02', // <-- Fundamental para os cálculos do Dashboard
      diaVencimento: '09'  // <-- Fundamental para os cálculos do Dashboard
    },
    {
      id: 2,
      apelido: 'Azul Platinum',
      final: '5515',
      bandeira: 'Visa',
      corBackground: '#1877f2', 
      corTexto: '#ffffff',      
      bordaBotao: 'rgba(255,255,255,0.7)',
      melhorDia: '17',
      diaFechamento: '16', // Exemplo Nubank
      diaVencimento: '23'
    }
  ];

  const LogoMastercard = () => (
    <div className="d-flex align-items-center justify-content-center me-2 logo-cartao">
      <div className="mc-circle-red"></div>
      <div className="mc-circle-yellow"></div>
    </div>
  );

  return (
    <Offcanvas 
      show={show} 
      onHide={onHide} 
      placement="end" 
      style={{ 
        backgroundColor: isDark ? '#1e1e24' : '#f8f9fa', 
        color: isDark ? '#fff' : '#212529',
        borderLeft: 'none',
        width: '100%',
        maxWidth: '400px'
      }}
    >
      <Offcanvas.Header closeButton closeVariant={isDark ? "white" : undefined} className="border-bottom border-opacity-10 pb-3">
        <Offcanvas.Title className="fw-bold d-flex align-items-center gap-2">
          <FiCreditCard size={22} /> Meus Cartões
        </Offcanvas.Title>
      </Offcanvas.Header>
      
      <Offcanvas.Body className="p-0">
        <style>{`
          .cartoes-scroll-container {
            display: flex;
            overflow-x: auto;
            gap: 16px;
            padding: 20px;
            scroll-snap-type: x mandatory;
          }
          .cartoes-scroll-container::-webkit-scrollbar {
            height: 0px; 
          }
          
          .cartao-bancao {
            min-width: 280px;
            border-radius: 16px;
            padding: 20px;
            flex-shrink: 0;
            scroll-snap-align: center;
            box-shadow: 0 6px 15px rgba(0,0,0,0.15);
            transition: transform 0.2s ease;
            cursor: pointer; /* Indica que o cartão todo é clicável */
          }
          .cartao-bancao:active {
            transform: scale(0.98);
          }
          
          .logo-cartao {
            width: 44px;
            height: 30px;
            border: 1px solid rgba(0,0,0,0.1);
            border-radius: 6px;
            background-color: transparent;
          }
          .mc-circle-red { width: 15px; height: 15px; border-radius: 50%; background-color: #eb001b; z-index: 1; }
          .mc-circle-yellow { width: 15px; height: 15px; border-radius: 50%; background-color: #f79e1b; margin-left: -6px; z-index: 2; mix-blend-mode: multiply; }
          
          .btn-cartao-acao {
            background: transparent;
            border-radius: 6px;
            padding: 8px 0;
            flex: 1;
            font-weight: 600;
            font-size: 0.85rem;
            transition: background 0.2s;
            position: relative;
            z-index: 10;
          }
          .btn-cartao-acao:hover {
            background: rgba(0,0,0,0.05);
          }

          .card-adicionar {
            min-width: 140px;
            border: 2px dashed ${isDark ? '#495057' : '#ced4da'};
            border-radius: 16px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            color: ${isDark ? '#adb5bd' : '#6c757d'};
            cursor: pointer;
            transition: all 0.2s ease;
            scroll-snap-align: center;
          }
          .card-adicionar:hover {
            border-color: #10b981;
            color: #10b981;
            background: ${isDark ? 'rgba(16, 185, 129, 0.05)' : 'rgba(16, 185, 129, 0.1)'};
          }
        `}</style>

        <div className="cartoes-scroll-container">
          
          {cartoesSimulados.map((cartao) => (
            <div 
              key={cartao.id} 
              className="cartao-bancao d-flex flex-column justify-content-between" 
              style={{ backgroundColor: cartao.corBackground, color: cartao.corTexto }}
              onClick={() => {
                onSelecionarCartao(cartao); // <-- Dispara a função no Dashboard
                onHide(); // <-- Fecha o menu lateral sozinho após a seleção
              }}
            >
              <div className="d-flex align-items-center mb-4">
                <LogoMastercard />
                <div className="lh-sm">
                  <div className="fs-5" style={{ fontWeight: '500', opacity: 0.9 }}>{cartao.apelido}</div>
                  <div className="fs-6" style={{ fontWeight: '500', opacity: 0.7 }}>•••• {cartao.final}</div>
                </div>
              </div>

              <div className="mb-4 lh-sm">
                <div style={{ fontSize: '0.85rem', opacity: 0.85, fontWeight: '500' }}>melhor data de compra</div>
                <div className="fs-3 fw-bold mt-1">dia {cartao.melhorDia}</div>
              </div>

              <div className="d-flex gap-2">
                <button 
                  className="btn-cartao-acao" 
                  style={{ border: `1px solid ${cartao.bordaBotao}`, color: cartao.corTexto }}
                  onClick={(e) => {
                    e.stopPropagation(); // Evita que clique aqui também clique no cartão inteiro
                    alert('Abrir modal de gestão de Limite (Futuro)');
                  }}
                >
                  ver limite
                </button>
                <button 
                  className="btn-cartao-acao" 
                  style={{ border: `1px solid ${cartao.bordaBotao}`, color: cartao.corTexto }}
                  onClick={(e) => {
                    e.stopPropagation(); // Evita que clique aqui também clique no cartão inteiro
                    alert('Abrir tela de faturas (Futuro)');
                  }}
                >
                  ver fatura
                </button>
              </div>
            </div>
          ))}

          <div 
            className="card-adicionar p-3"
            onClick={() => {
              alert("Abrir formulário de cadastro de novo cartão!");
            }}
          >
            <div 
              className="rounded-circle d-flex align-items-center justify-content-center mb-2" 
              style={{ width: '40px', height: '40px', backgroundColor: isDark ? '#2b2b31' : '#e9ecef' }}
            >
              <FiPlus size={24} />
            </div>
            <span className="fw-bold small text-center">Adicionar<br/>cartão</span>
          </div>

        </div>
      </Offcanvas.Body>
    </Offcanvas>
  );
}

export default MeusCartoesOffcanvas;