import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import api from '../api/axios';
import { 
  FiArrowLeft, FiUser, FiMail, FiCalendar, 
  FiBriefcase, FiHome, FiCheck, FiLock,
  FiTarget, FiTruck, FiBarChart2, FiAlertTriangle, FiCompass, FiCreditCard
} from 'react-icons/fi';

export default function MeusDados({ temaAtual }) {
  const navigate = useNavigate();
  const { usuarioLogado } = useContext(AuthContext);
  const isDark = temaAtual === 'dark';

  // Estados do formulário
  const [nome, setNome] = useState(usuarioLogado?.nome || '');
  const [email, setEmail] = useState(usuarioLogado?.email || '');
  const [dataNascimento, setDataNascimento] = useState('');
  const [profissao, setProfissao] = useState('');
  const [moraCom, setMoraCom] = useState('');

  const [objetivo, setObjetivo] = useState('');
  const [veiculo, setVeiculo] = useState('');
  const [conhecimento, setConhecimento] = useState('');
  
  const [momentoVida, setMomentoVida] = useState('');
  const [pecado, setPecado] = useState('');
  const [usoCartao, setUsoCartao] = useState('');

  // Buscar os dados do banco garantindo mapeamento correto e robusto
  useEffect(() => {
    let isMounted = true;

    async function carregarDadosUsuario() {
      if (!usuarioLogado?.id) return;
      
      try {
        const response = await api.get(`/Usuarios/${usuarioLogado.id}`);
        const dados = response.data;

        // LOG REMOVIDO PARA SEGURANÇA
        // console.log("Dados recebidos da API:", dados); 

        if (!isMounted) return;

        if (dados.nome || dados.Nome) setNome(dados.nome || dados.Nome);
        if (dados.email || dados.Email) setEmail(dados.email || dados.Email);
        
        const rawData = dados.dataNascimento || dados.DataNascimento;
        if (rawData) {
          setDataNascimento(rawData.split('T')[0]);
        }
        
        if (dados.profissao || dados.Profissao) {
          setProfissao(dados.profissao || dados.Profissao);
        }
        
        // Mapeando moradia (aceita tanto camelCase quanto PascalCase)
        const moradia = dados.configuracaoMoradia || dados.ConfiguracaoMoradia;
        if (moradia) setMoraCom(moradia);

        // Mapeando momento de vida
        const momento = dados.momentoVida || dados.MomentoVida;
        if (momento) setMomentoVida(momento);

        // Mapeando objetivo financeiro
        const obj = dados.objetivoFinanceiro || dados.ObjetivoFinanceiro;
        if (obj) setObjetivo(obj);

        // Mapeando veículo
        const veh = dados.possuiVeiculo || dados.PossuiVeiculo;
        if (veh) setVeiculo(veh);

        // Mapeando maior pecado
        const pec = dados.maiorPecado || dados.MaiorPecado;
        if (pec) setPecado(pec);

        // Mapeando uso do cartão
        const cartao = dados.usoCartao || dados.UsoCartao;
        if (cartao) setUsoCartao(cartao);

        // Mapeando nível de conhecimento
        const niv = dados.nivelConhecimento || dados.NivelConhecimento;
        if (niv) setConhecimento(niv);

      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
      }
    }

    carregarDadosUsuario();

    return () => {
      isMounted = false;
    };
  }, [usuarioLogado?.id]);

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

  // Função para salvar os dados mantendo o usuário na tela e atualizando o estado local
  const handleSalvar = async (e) => {
    e.preventDefault();
    
    if (!usuarioLogado?.id) {
      alert("Erro ao identificar o usuário logado.");
      return;
    }

    const payload = {
      dataNascimento: dataNascimento ? new Date(dataNascimento).toISOString() : null,
      configuracaoMoradia: moraCom,
      profissao: profissao,
      momentoVida: momentoVida,
      objetivoFinanceiro: objetivo,
      possuiVeiculo: veiculo,
      maiorPecado: pecado,
      usoCartao: usoCartao,
      nivelConhecimento: conhecimento
    };

    try {
      await api.put(`/Usuarios/${usuarioLogado.id}`, payload);
      alert('Perfil FIRMO atualizado com sucesso no banco de dados!');
    } catch (error) {
      console.error("Erro ao salvar dados do perfil:", error);
      alert("Houve um erro ao tentar salvar as informações no servidor.");
    }
  };

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
          <h4 className="mt-3 mb-1 fw-bold" style={{ letterSpacing: '-0.5px' }}>{nome ? nome.split(' ')[0] : 'Usuário'}</h4>
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

          {/* Nome Completo */}
          <div className="mb-4">
            <label className="mb-2 ms-2 fw-medium d-flex align-items-center gap-2" style={{ fontSize: '0.80rem', color: textMuted, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Nome Completo <FiLock size={12} opacity={0.6} />
            </label>
            <div className="d-flex align-items-center px-3 py-1 shadow-sm" style={{ backgroundColor: bgInput, borderRadius: '20px', border: isDark ? '1px solid rgba(255,255,255,0.03)' : '1px solid rgba(0,0,0,0.03)', opacity: 0.65 }}>
              <div className="d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '36px', height: '36px', backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f0f2f5', borderRadius: '12px', marginRight: '12px' }}>
                <FiUser size={18} color={textMuted} />
              </div>
              <input type="text" className="form-control shadow-none border-0 bg-transparent py-3" value={nome} readOnly style={{ color: textColor, fontSize: '0.95rem', cursor: 'not-allowed' }} />
            </div>
          </div>

          {/* E-mail */}
          <div className="mb-4">
            <label className="mb-2 ms-2 fw-medium d-flex align-items-center gap-2" style={{ fontSize: '0.80rem', color: textMuted, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              E-mail <FiLock size={12} opacity={0.6} />
            </label>
            <div className="d-flex align-items-center px-3 py-1 shadow-sm" style={{ backgroundColor: bgInput, borderRadius: '20px', border: isDark ? '1px solid rgba(255,255,255,0.03)' : '1px solid rgba(0,0,0,0.03)', opacity: 0.65 }}>
              <div className="d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '36px', height: '36px', backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f0f2f5', borderRadius: '12px', marginRight: '12px' }}>
                <FiMail size={18} color={textMuted} />
              </div>
              <input type="email" className="form-control shadow-none border-0 bg-transparent py-3" value={email} readOnly style={{ color: textColor, fontSize: '0.95rem', cursor: 'not-allowed' }} />
            </div>
          </div>

          {/* Data de Nascimento */}
          <div className="mb-4">
            <label className="mb-2 ms-2 fw-medium d-flex align-items-center gap-2" style={{ fontSize: '0.80rem', color: textMuted, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Data de Nascimento
            </label>
            <div className="d-flex align-items-center px-3 py-1 shadow-sm" style={{ backgroundColor: bgInput, borderRadius: '20px', border: isDark ? '1px solid rgba(255,255,255,0.03)' : '1px solid rgba(0,0,0,0.03)' }}>
              <div className="d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '36px', height: '36px', backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f0f2f5', borderRadius: '12px', marginRight: '12px' }}>
                <FiCalendar size={18} color={textMuted} />
              </div>
              <input type="date" className="form-control shadow-none border-0 bg-transparent py-3" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} style={{ color: textColor, fontSize: '0.95rem' }} />
            </div>
          </div>

          {/* Configuração de Moradia */}
          <div className="mb-4">
            <label className="mb-2 ms-2 fw-medium d-flex align-items-center gap-2" style={{ fontSize: '0.80rem', color: textMuted, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Configuração de Moradia
            </label>
            <div className="d-flex align-items-center px-3 py-1 shadow-sm" style={{ backgroundColor: bgInput, borderRadius: '20px', border: isDark ? '1px solid rgba(255,255,255,0.03)' : '1px solid rgba(0,0,0,0.03)' }}>
              <div className="d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '36px', height: '36px', backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f0f2f5', borderRadius: '12px', marginRight: '12px' }}>
                <FiHome size={18} color={textMuted} />
              </div>
              <select className="form-select shadow-none border-0 bg-transparent py-3" value={moraCom} onChange={(e) => setMoraCom(e.target.value)} style={{ color: textColor, fontSize: '0.95rem', cursor: 'pointer' }}>
                <option value="" disabled style={{ backgroundColor: bgInput, color: textMuted }}>Selecione uma opção...</option>
                <option value="sozinho" style={{ backgroundColor: bgInput, color: textColor }}>Moro sozinho</option>
                <option value="familia" style={{ backgroundColor: bgInput, color: textColor }}>Moro com familiares</option>
                <option value="conjuge" style={{ backgroundColor: bgInput, color: textColor }}>Moro com parceiro(a)</option>
                <option value="amigos" style={{ backgroundColor: bgInput, color: textColor }}>Divido residência</option>
              </select>
            </div>
          </div>

          {/* Ocupação / Formação */}
          <div className="mb-4">
            <label className="mb-2 ms-2 fw-medium d-flex align-items-center gap-2" style={{ fontSize: '0.80rem', color: textMuted, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Ocupação / Formação
            </label>
            <div className="d-flex align-items-center px-3 py-1 shadow-sm" style={{ backgroundColor: bgInput, borderRadius: '20px', border: isDark ? '1px solid rgba(255,255,255,0.03)' : '1px solid rgba(0,0,0,0.03)' }}>
              <div className="d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '36px', height: '36px', backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f0f2f5', borderRadius: '12px', marginRight: '12px' }}>
                <FiBriefcase size={18} color={textMuted} />
              </div>
              <input type="text" className="form-control shadow-none border-0 bg-transparent py-3" value={profissao} onChange={(e) => setProfissao(e.target.value)} placeholder="Ex: Estudante de ADS, Técnico..." style={{ color: textColor, fontSize: '0.95rem' }} />
            </div>
          </div>

          <hr className="my-5" style={{ opacity: isDark ? 0.1 : 0.05, borderTopWidth: '2px' }} />

          {/* SEÇÃO 2: PERFIL FINANCEIRO E COMPORTAMENTO */}
          <div className="mb-4">
            <h5 className="fw-bold mb-1" style={{ letterSpacing: '-0.3px' }}>Perfil & Hábitos</h5>
            <p style={{ color: textMuted, fontSize: '0.85rem' }}>Para o FIRMO personalizar suas dicas e alertas diários.</p>
          </div>

          {/* Momento de Vida / Carreira */}
          <div className="mb-4">
            <label className="mb-2 ms-2 fw-medium d-flex align-items-center gap-2" style={{ fontSize: '0.80rem', color: textMuted, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Momento de Vida / Carreira
            </label>
            <div className="d-flex align-items-center px-3 py-1 shadow-sm" style={{ backgroundColor: bgInput, borderRadius: '20px', border: isDark ? '1px solid rgba(255,255,255,0.03)' : '1px solid rgba(0,0,0,0.03)' }}>
              <div className="d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '36px', height: '36px', backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f0f2f5', borderRadius: '12px', marginRight: '12px' }}>
                <FiCompass size={18} color={textMuted} />
              </div>
              <select className="form-select shadow-none border-0 bg-transparent py-3" value={momentoVida} onChange={(e) => setMomentoVida(e.target.value)} style={{ color: textColor, fontSize: '0.95rem', cursor: 'pointer' }}>
                <option value="" disabled style={{ backgroundColor: bgInput, color: textMuted }}>Selecione uma opção...</option>
                <option value="estudante" style={{ backgroundColor: bgInput, color: textColor }}>Estudante</option>
                <option value="inicio_carreira" style={{ backgroundColor: bgInput, color: textColor }}>Início de Carreira</option>
                <option value="buscando_estabilidade" style={{ backgroundColor: bgInput, color: textColor }}>Buscando Estabilidade</option>
                <option value="estabelecido" style={{ backgroundColor: bgInput, color: textColor }}>Estabelecido Profissionalmente</option>
                <option value="construindo_patrimonio" style={{ backgroundColor: bgInput, color: textColor }}>Construindo Patrimônio</option>
              </select>
            </div>
          </div>

          {/* Objetivo Principal */}
          <div className="mb-4">
            <label className="mb-2 ms-2 fw-medium d-flex align-items-center gap-2" style={{ fontSize: '0.80rem', color: textMuted, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Objetivo Principal
            </label>
            <div className="d-flex align-items-center px-3 py-1 shadow-sm" style={{ backgroundColor: bgInput, borderRadius: '20px', border: isDark ? '1px solid rgba(255,255,255,0.03)' : '1px solid rgba(0,0,0,0.03)' }}>
              <div className="d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '36px', height: '36px', backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f0f2f5', borderRadius: '12px', marginRight: '12px' }}>
                <FiTarget size={18} color={textMuted} />
              </div>
              <select className="form-select shadow-none border-0 bg-transparent py-3" value={objetivo} onChange={(e) => setObjetivo(e.target.value)} style={{ color: textColor, fontSize: '0.95rem', cursor: 'pointer' }}>
                <option value="" disabled style={{ backgroundColor: bgInput, color: textMuted }}>Selecione uma opção...</option>
                <option value="reserva" style={{ backgroundColor: bgInput, color: textColor }}>Criar reserva de emergência</option>
                <option value="dividas" style={{ backgroundColor: bgInput, color: textColor }}>Sair do vermelho / Quitar dívidas</option>
                <option value="veiculo" style={{ backgroundColor: bgInput, color: textColor }}>Comprar/Trocar de veículo</option>
                <option value="estudos" style={{ backgroundColor: bgInput, color: textColor }}>Investir nos estudos / Carreira</option>
                <option value="futuro" style={{ backgroundColor: bgInput, color: textColor }}>Investir para o futuro</option>
              </select>
            </div>
          </div>

          {/* Veículos na Garagem */}
          <div className="mb-4">
            <label className="mb-2 ms-2 fw-medium d-flex align-items-center gap-2" style={{ fontSize: '0.80rem', color: textMuted, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Veículos na Garagem
            </label>
            <div className="d-flex align-items-center px-3 py-1 shadow-sm" style={{ backgroundColor: bgInput, borderRadius: '20px', border: isDark ? '1px solid rgba(255,255,255,0.03)' : '1px solid rgba(0,0,0,0.03)' }}>
              <div className="d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '36px', height: '36px', backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f0f2f5', borderRadius: '12px', marginRight: '12px' }}>
                <FiTruck size={18} color={textMuted} />
              </div>
              <select className="form-select shadow-none border-0 bg-transparent py-3" value={veiculo} onChange={(e) => setVeiculo(e.target.value)} style={{ color: textColor, fontSize: '0.95rem', cursor: 'pointer' }}>
                <option value="" disabled style={{ backgroundColor: bgInput, color: textMuted }}>Selecione uma opção...</option>
                <option value="nenhum" style={{ backgroundColor: bgInput, color: textColor }}>Não possuo veículo</option>
                <option value="carro" style={{ backgroundColor: bgInput, color: textColor }}>Apenas Carro</option>
                <option value="moto" style={{ backgroundColor: bgInput, color: textColor }}>Apenas Moto</option>
                <option value="carro_moto" style={{ backgroundColor: bgInput, color: textColor }}>Carro de uso diário e Moto</option>
                <option value="classico_moto" style={{ backgroundColor: bgInput, color: textColor }}>Carro clássico/projeto e Moto</option>
              </select>
            </div>
          </div>

          {/* Seu Maior Pecado Financeiro */}
          <div className="mb-4">
            <label className="mb-2 ms-2 fw-medium d-flex align-items-center gap-2" style={{ fontSize: '0.80rem', color: textMuted, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Seu Maior Pecado Financeiro
            </label>
            <div className="d-flex align-items-center px-3 py-1 shadow-sm" style={{ backgroundColor: bgInput, borderRadius: '20px', border: isDark ? '1px solid rgba(255,255,255,0.03)' : '1px solid rgba(0,0,0,0.03)' }}>
              <div className="d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '36px', height: '36px', backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f0f2f5', borderRadius: '12px', marginRight: '12px' }}>
                <FiAlertTriangle size={18} color={textMuted} />
              </div>
              <select className="form-select shadow-none border-0 bg-transparent py-3" value={pecado} onChange={(e) => setPecado(e.target.value)} style={{ color: textColor, fontSize: '0.95rem', cursor: 'pointer' }}>
                <option value="" disabled style={{ backgroundColor: bgInput, color: textMuted }}>Selecione uma opção...</option>
                <option value="lanches" style={{ backgroundColor: bgInput, color: textColor }}>Lanches e Delivery (Méqui, iFood, etc.)</option>
                <option value="acessorios_auto" style={{ backgroundColor: bgInput, color: textColor }}>Acessórios e estética automotiva</option>
                <option value="tech" style={{ backgroundColor: bgInput, color: textColor }}>Tecnologia, Gadgets e Setup</option>
                <option value="roles" style={{ backgroundColor: bgInput, color: textColor }}>Saídas e rolês de fim de semana</option>
                <option value="compras_online" style={{ backgroundColor: bgInput, color: textColor }}>Compras online por impulso</option>
              </select>
            </div>
          </div>

          {/* Uso do Cartão de Crédito */}
          <div className="mb-4">
            <label className="mb-2 ms-2 fw-medium d-flex align-items-center gap-2" style={{ fontSize: '0.80rem', color: textMuted, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Uso do Cartão de Crédito
            </label>
            <div className="d-flex align-items-center px-3 py-1 shadow-sm" style={{ backgroundColor: bgInput, borderRadius: '20px', border: isDark ? '1px solid rgba(255,255,255,0.03)' : '1px solid rgba(0,0,0,0.03)' }}>
              <div className="d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '36px', height: '36px', backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f0f2f5', borderRadius: '12px', marginRight: '12px' }}>
                <FiCreditCard size={18} color={textMuted} />
              </div>
              <select className="form-select shadow-none border-0 bg-transparent py-3" value={usoCartao} onChange={(e) => setUsoCartao(e.target.value)} style={{ color: textColor, fontSize: '0.95rem', cursor: 'pointer' }}>
                <option value="" disabled style={{ backgroundColor: bgInput, color: textMuted }}>Selecione uma opção...</option>
                <option value="tudo" style={{ backgroundColor: bgInput, color: textColor }}>Passo até bala no crédito (Uso pra tudo)</option>
                <option value="grandes" style={{ backgroundColor: bgInput, color: textColor }}>Uso só para compras grandes e parceladas</option>
                <option value="medo" style={{ backgroundColor: bgInput, color: textColor }}>Tenho medo e fujo do cartão de crédito</option>
              </select>
            </div>
          </div>

          {/* Conhecimento Financeiro */}
          <div className="mb-4">
            <label className="mb-2 ms-2 fw-medium d-flex align-items-center gap-2" style={{ fontSize: '0.80rem', color: textMuted, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Conhecimento Financeiro
            </label>
            <div className="d-flex align-items-center px-3 py-1 shadow-sm" style={{ backgroundColor: bgInput, borderRadius: '20px', border: isDark ? '1px solid rgba(255,255,255,0.03)' : '1px solid rgba(0,0,0,0.03)' }}>
              <div className="d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '36px', height: '36px', backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f0f2f5', borderRadius: '12px', marginRight: '12px' }}>
                <FiBarChart2 size={18} color={textMuted} />
              </div>
              <select className="form-select shadow-none border-0 bg-transparent py-3" value={conhecimento} onChange={(e) => setConhecimento(e.target.value)} style={{ color: textColor, fontSize: '0.95rem', cursor: 'pointer' }}>
                <option value="" disabled style={{ backgroundColor: bgInput, color: textMuted }}>Selecione uma opção...</option>
                <option value="iniciante" style={{ backgroundColor: bgInput, color: textColor }}>Iniciante: Sou novo por aqui</option>
                <option value="intermediario" style={{ backgroundColor: bgInput, color: textColor }}>Intermediário: Já poupo um pouco</option>
                <option value="avancado" style={{ backgroundColor: bgInput, color: textColor }}>Avançado: Controlo e planejo o futuro</option>
              </select>
            </div>
            {conhecimento && descricoesConhecimento[conhecimento] && (
              <div className="mt-2 ms-3 pe-2" style={{ fontSize: '0.78rem', color: textMuted, opacity: 0.85, lineHeight: '1.4' }}>
                {descricoesConhecimento[conhecimento]}
              </div>
            )}
          </div>

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