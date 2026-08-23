import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import api from '../api/axios'; // <-- IMPORT DO AXIOS ADICIONADO AQUI
import { 
  FiArrowLeft, FiUser, FiMail, FiCalendar, 
  FiBriefcase, FiHome, FiCheck, FiLock,
  FiTarget, FiTruck, FiBarChart2, FiAlertTriangle, FiCompass, FiCreditCard
} from 'react-icons/fi';

export default function MeusDados({ temaAtual }) {
  const navigate = useNavigate();
  const { usuarioLogado } = useContext(AuthContext);
  const isDark = temaAtual === 'dark';

  // Estados do formulário (Dados Pessoais)
  const [nome, setNome] = useState(usuarioLogado?.nome || 'Matheus Aurélio Duarte');
  const [email, setEmail] = useState('matheus@teste.com');
  const [dataNascimento, setDataNascimento] = useState('2001-03-20');
  const [profissao, setProfissao] = useState('Técnico em Manutenção e Automação');
  const [moraCom, setMoraCom] = useState('sozinho');

  // Estados (Perfil Financeiro FIRMO 1.0.1v)
  const [objetivo, setObjetivo] = useState('reserva');
  const [veiculo, setVeiculo] = useState('classico_moto');
  const [conhecimento, setConhecimento] = useState('intermediario');
  
  // Novos Estados (Comportamento e Hábitos)
  const [momentoVida, setMomentoVida] = useState('estudante');
  const [pecado, setPecado] = useState('acessorios_auto');
  const [usoCartao, setUsoCartao] = useState('tudo');

  // Paleta de Cores Premium (Soft Contrast)
  const bgPage = isDark ? '#0d0d0f' : '#f4f6f8'; 
  const bgInput = isDark ? '#1a1a1e' : '#ffffff'; 
  const textColor = isDark ? '#f8f9fa' : '#1a1a1e';
  const textMuted = isDark ? '#8b8b99' : '#6e6e7a';
  const accentColor = '#10b981'; 

  // Textos explicativos dinâmicos para o nível de conhecimento
  const descricoesConhecimento = {
    iniciante: "Você está dando os primeiros passos. O objetivo aqui é mapear seus gastos diários, entender seus hábitos e parar de se assustar com a fatura no fim do mês.",
    intermediario: "Você já tem uma noção de controle e consegue fazer sobrar um pouco. O foco agora é criar orçamentos mais inteligentes e otimizar seus recursos.",
    avancado: "Você já domina seu orçamento e foca no longo prazo. O FIRMO será sua ferramenta de precisão para manter a disciplina e acompanhar sua evolução."
  };

  // FUNÇÃO ATUALIZADA: Agora envia os dados reais para o banco!
  const handleSalvar = async (e) => {
    e.preventDefault();
    
    if (!usuarioLogado?.id) {
      alert("Erro ao identificar o usuário logado.");
      return;
    }

    // Mapeamento exato dos campos que o C# está esperando
    const payload = {
      dataNascimento: dataNascimento ? new Date(dataNascimento).toISOString() : null,
      configuracaoMoradia: moraCom,
      profissao: profissao,
      momentoVida: momentoVida,
      objetivoFinanceiro: objetivo, // Mapeado para o BD
      possuiVeiculo: veiculo,       // Mapeado para o BD
      maiorPecado: pecado,
      usoCartao: usoCartao,
      nivelConhecimento: conhecimento
    };

    try {
      await api.put(`/Usuarios/${usuarioLogado.id}`, payload);
      alert('Perfil FIRMO atualizado com sucesso no banco de dados!');
      navigate(-1);
    } catch (error) {
      console.error("Erro ao salvar dados do perfil:", error);
      alert("Houve um erro ao tentar salvar as informações no servidor.");
    }
  };

  // Componente interno para padronizar os inputs com ajuste de texto longo
  const PremiumInput = ({ icon: Icon, label, type = "text", value, onChange, placeholder, options, readOnly = false, description }) => (
    <div className="mb-4">
      <label className="mb-2 ms-2 fw-medium d-flex align-items-center gap-2" style={{ fontSize: '0.80rem', color: textMuted, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
        {label}
        {readOnly && <FiLock size={12} opacity={0.6} title="Campo bloqueado para edição" />}
      </label>
      
      <div 
        className="d-flex align-items-center px-3 py-1 shadow-sm" 
        style={{ 
          backgroundColor: bgInput, 
          borderRadius: '20px', 
          border: isDark ? '1px solid rgba(255,255,255,0.03)' : '1px solid rgba(0,0,0,0.03)',
          transition: 'all 0.3s ease',
          opacity: readOnly ? 0.65 : 1, 
        }}
      >
        <div className="d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '36px', height: '36px', backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f0f2f5', borderRadius: '12px', marginRight: '12px' }}>
          <Icon size={18} color={textMuted} />
        </div>
        
        {options ? (
          <select 
            className="form-select shadow-none border-0 bg-transparent py-3" 
            value={value}
            onChange={onChange}
            disabled={readOnly}
            style={{ 
              color: textColor, 
              fontSize: '0.95rem', 
              cursor: readOnly ? 'not-allowed' : 'pointer',
              paddingLeft: '0',
              paddingRight: '36px',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              overflow: 'hidden'
            }}
          >
            {options.map(opt => (
              <option key={opt.value} value={opt.value} style={{ backgroundColor: bgInput, color: textColor }}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input 
            type={type} 
            className="form-control shadow-none border-0 bg-transparent py-3" 
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            readOnly={readOnly}
            style={{ 
              color: textColor, 
              fontSize: '0.95rem', 
              cursor: readOnly ? 'not-allowed' : 'text',
              paddingLeft: '0',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              overflow: 'hidden'
            }}
          />
        )}
      </div>

      {description && (
        <div 
          className="mt-2 ms-3 pe-2" 
          style={{ 
            fontSize: '0.78rem', 
            color: textMuted, 
            opacity: 0.85, 
            lineHeight: '1.4',
            transition: 'all 0.3s ease'
          }}
        >
          {description}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ backgroundColor: bgPage, minHeight: '100vh', color: textColor, transition: 'background-color 0.3s ease' }}>
      
      <header className="d-flex align-items-center p-4 pb-2" style={{ backgroundColor: 'transparent' }}>
        <button 
          onClick={() => navigate(-1)} 
          className="btn btn-link p-0 me-3 shadow-none border-0" 
        >
          <FiArrowLeft size={24} color={textColor} />
        </button>
      </header>

      <div className="container px-4 pb-5">
        
        <div className="d-flex flex-column align-items-center mb-5 mt-2">
          <div 
            className="rounded-circle d-flex align-items-center justify-content-center shadow"
            style={{ 
              width: '96px', height: '96px', 
              background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', 
              color: '#fff', fontSize: '2.2rem', fontWeight: 'bold',
              border: `4px solid ${bgPage}`
            }}
          >
            {nome ? nome.charAt(0).toUpperCase() : 'U'}
          </div>
          <h4 className="mt-3 mb-1 fw-bold" style={{ letterSpacing: '-0.5px' }}>{nome.split(' ')[0]}</h4>
          <button 
            className="btn btn-sm border-0 mt-1 fw-semibold" 
            style={{ color: accentColor, background: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.15)', borderRadius: '20px', padding: '6px 20px' }}
          >
            Alterar Foto
          </button>
        </div>

        <form onSubmit={handleSalvar}>
          
          {/* SEÇÃO 1: INFORMAÇÕES PESSOAIS */}
          <div className="mb-4 mt-2">
            <h5 className="fw-bold mb-1" style={{ letterSpacing: '-0.3px' }}>Informações Pessoais</h5>
            <p style={{ color: textMuted, fontSize: '0.85rem' }}>O básico sobre você.</p>
          </div>

          <PremiumInput 
            icon={FiUser} label="Nome Completo" 
            value={nome} onChange={(e) => setNome(e.target.value)} 
            readOnly={true}
          />
          
          <PremiumInput 
            icon={FiMail} label="E-mail" type="email"
            value={email} onChange={(e) => setEmail(e.target.value)} 
            readOnly={true}
          />
          
          <PremiumInput 
            icon={FiCalendar} label="Data de Nascimento" type="date"
            value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} 
          />

          <PremiumInput 
            icon={FiHome} label="Configuração de Moradia" 
            value={moraCom} onChange={(e) => setMoraCom(e.target.value)} 
            options={[
              { value: 'sozinho', label: 'Moro sozinho' },
              { value: 'familia', label: 'Moro com familiares' },
              { value: 'conjuge', label: 'Moro com parceiro(a)' },
              { value: 'amigos', label: 'Divido residência' }
            ]}
          />
          
          <PremiumInput 
            icon={FiBriefcase} label="Ocupação / Formação" 
            value={profissao} onChange={(e) => setProfissao(e.target.value)} 
            placeholder="Ex: Estudante de ADS, Técnico..."
          />

          <hr className="my-5" style={{ opacity: isDark ? 0.1 : 0.05, borderTopWidth: '2px' }} />

          {/* SEÇÃO 2: PERFIL FINANCEIRO E COMPORTAMENTO */}
          <div className="mb-4">
            <h5 className="fw-bold mb-1" style={{ letterSpacing: '-0.3px' }}>Perfil & Hábitos</h5>
            <p style={{ color: textMuted, fontSize: '0.85rem' }}>Para o FIRMO personalizar suas dicas e alertas diários.</p>
          </div>

          <PremiumInput 
            icon={FiCompass} label="Momento de Vida / Carreira" 
            value={momentoVida} onChange={(e) => setMomentoVida(e.target.value)} 
            options={[
              { value: 'estudante', label: 'Estudante conciliando grana e estudos' },
              { value: 'mercado', label: 'Já inserido no mercado / Técnico / CLT' },
              { value: 'freelancer', label: 'Freelancer / Autônomo (Renda variável)' },
              { value: 'recolocacao', label: 'Buscando recolocação profissional' }
            ]}
          />

          <PremiumInput 
            icon={FiTarget} label="Objetivo Principal" 
            value={objetivo} onChange={(e) => setObjetivo(e.target.value)} 
            options={[
              { value: 'reserva', label: 'Criar reserva de emergência' },
              { value: 'dividas', label: 'Sair do vermelho / Quitar dívidas' },
              { value: 'veiculo', label: 'Comprar/Trocar de veículo' },
              { value: 'estudos', label: 'Investir nos estudos / Carreira' },
              { value: 'futuro', label: 'Investir para o futuro' }
            ]}
          />

          <PremiumInput 
            icon={FiTruck} label="Veículos na Garagem" 
            value={veiculo} onChange={(e) => setVeiculo(e.target.value)} 
            options={[
              { value: 'nenhum', label: 'Não possuo veículo' },
              { value: 'carro', label: 'Apenas Carro' },
              { value: 'moto', label: 'Apenas Moto' },
              { value: 'carro_moto', label: 'Carro de uso diário e Moto' },
              { value: 'classico_moto', label: 'Carro clássico/projeto e Moto' }
            ]}
          />

          <PremiumInput 
            icon={FiAlertTriangle} label="Seu Maior Pecado Financeiro" 
            value={pecado} onChange={(e) => setPecado(e.target.value)} 
            options={[
              { value: 'lanches', label: 'Lanches e Delivery (Méqui, iFood, etc.)' },
              { value: 'acessorios_auto', label: 'Acessórios e estética automotiva' },
              { value: 'tech', label: 'Tecnologia, Gadgets e Setup' },
              { value: 'roles', label: 'Saídas e rolês de fim de semana' },
              { value: 'compras_online', label: 'Compras online por impulso' }
            ]}
          />

          <PremiumInput 
            icon={FiCreditCard} label="Uso do Cartão de Crédito" 
            value={usoCartao} onChange={(e) => setUsoCartao(e.target.value)} 
            options={[
              { value: 'tudo', label: 'Passo até bala no crédito (Uso pra tudo)' },
              { value: 'grandes', label: 'Uso só para compras grandes e parceladas' },
              { value: 'medo', label: 'Tenho medo e fujo do cartão de crédito' }
            ]}
          />

          <PremiumInput 
            icon={FiBarChart2} label="Conhecimento Financeiro" 
            value={conhecimento} onChange={(e) => setConhecimento(e.target.value)} 
            description={descricoesConhecimento[conhecimento]}
            options={[
              { value: 'iniciante', label: 'Iniciante: Sou novo por aqui' },
              { value: 'intermediario', label: 'Intermediário: Já poupo um pouco' },
              { value: 'avancado', label: 'Avançado: Controlo e planejo o futuro' }
            ]}
          />

          <div style={{ height: '80px' }}></div>

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
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}