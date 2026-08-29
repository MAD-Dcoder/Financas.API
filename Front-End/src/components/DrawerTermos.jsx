import React, { useState, useRef, useEffect } from 'react';
import { FiX, FiCheck } from 'react-icons/fi';
import './DrawerTermos.css';

export default function DrawerTermos({ isOpen, onClose, onAccept }) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setHasScrolledToBottom(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleScroll = () => {
    if (contentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 35) {
        setHasScrolledToBottom(true);
      }
    }
  };

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-container" onClick={(e) => e.stopPropagation()}>
        
        <div className="drawer-header">
          <h4 className="text-white mb-0" style={{ fontSize: '1.1rem', fontWeight: '600' }}>Termos e Privacidade</h4>
          <button type="button" className="btn-close-drawer" onClick={onClose}>
            <FiX size={24} color="#fff" />
          </button>
        </div>

        <div className="drawer-body" onScroll={handleScroll} ref={contentRef}>
          <div className="legal-document">
            <h5 className="text-white fw-bold">Termos de Uso - Firmo</h5>
            <p className="opacity-75 small"><strong>Última atualização:</strong> 29 de agosto de 2026</p>
            
            <h6 className="text-white mt-4 fw-bold">1. Bem-vindo(a) ao Firmo!</h6>
            <p className="opacity-75">O Firmo é uma plataforma desenvolvida para ajudar você a assumir o controle do seu dinheiro. Nós fornecemos ferramentas de gestão, gráficos e histórico de gastos. <strong>Importante:</strong> não somos uma casa de análises. Não oferecemos consultoria financeira, dicas de investimento ou promessas de rentabilidade. As decisões tomadas a partir dos dados do app são totalmente suas.</p>

            <h6 className="text-white mt-4 fw-bold">2. Regras da Casa (Sua Conta)</h6>
            <p className="opacity-75">Para criar uma conta, você precisa ter 18 anos ou mais. Você é o único responsável por manter sua senha segura. Ao usar o Firmo, você concorda em não tentar burlar nossa segurança, não fazer engenharia reversa e não usar a plataforma para fins ilícitos ou fraudes.</p>

            <h6 className="text-white mt-4 fw-bold">3. Propriedade Intelectual</h6>
            <p className="opacity-75">Todo o código, design, logotipos e textos do Firmo pertencem aos seus desenvolvedores. Você tem a licença de uso do aplicativo, mas isso não concede o direito de copiar ou comercializar partes da nossa plataforma.</p>
            
            <h6 className="text-white mt-4 fw-bold">4. O App está em Beta</h6>
            <p className="opacity-75">O Firmo está em constante evolução. Isso significa que podemos adicionar ou remover recursos a qualquer momento. Trabalhamos duro para manter tudo online, mas podem ocorrer manutenções ou instabilidades temporárias. Não nos responsabilizamos por eventuais perdas devido a períodos offline.</p>

            <hr className="border-secondary border-opacity-25 my-4" />

            <h5 className="text-white fw-bold">Política de Privacidade</h5>
            <p className="opacity-75 small"><strong>Em conformidade com a LGPD (Lei nº 13.709/2018)</strong></p>
            
            <h6 className="text-white mt-4 fw-bold">1. Transparência Total</h6>
            <p className="opacity-75">Nós detestamos spam e empresas que vendem dados. Seu histórico financeiro é uma informação sensível e tratamos isso com o máximo de respeito.</p>

            <h6 className="text-white mt-4 fw-bold">2. O que coletamos e por quê?</h6>
            <p className="opacity-75">Coletamos apenas o estritamente necessário para o app funcionar: seu nome e e-mail (para criar a conta e recuperar senha), e os dados financeiros que você insere manualmente (receitas, despesas, categorias). Também registramos dados básicos de acesso (como modelo do celular) exclusivamente para corrigir bugs e melhorar a interface.</p>

            <h6 className="text-white mt-4 fw-bold">3. Segurança e Sigilo</h6>
            <p className="opacity-75">Suas senhas são criptografadas e o tráfego de informações entre seu celular e nossos servidores é protegido. <strong>Nós nunca venderemos, alugaremos ou compartilharemos seus dados financeiros com terceiros.</strong></p>
            
            <h6 className="text-white mt-4 fw-bold">4. O Direito de ser Esquecido</h6>
            <p className="opacity-75">O dinheiro é seu, e os dados também. A qualquer momento, você pode solicitar a exclusão definitiva da sua conta. Quando você faz isso, apagamos permanentemente todo o seu histórico financeiro e e-mail dos nossos bancos de dados, sem deixar rastros ou backups ocultos.</p>

            <h6 className="text-white mt-4 fw-bold">5. Mudanças nestes Termos</h6>
            <p className="opacity-75">Se fizermos alterações significativas nestas regras, avisaremos você por e-mail ou por um grande aviso dentro do próprio aplicativo antes que as mudanças entrem em vigor.</p>

            <div className="scroll-indicator mt-5 text-center text-emerald fw-bold">
              {!hasScrolledToBottom && "↓ Role até o final para aceitar ↓"}
            </div>
            
            <div style={{ height: '40px' }}></div>
          </div>
        </div>

        <div className="drawer-footer">
          <button 
            type="button"
            className={`btn w-100 py-3 rounded-4 fw-bold shadow border-0 d-flex justify-content-center align-items-center gap-2 ${hasScrolledToBottom ? 'btn-accept-active' : 'btn-accept-disabled'}`}
            disabled={!hasScrolledToBottom}
            onClick={() => {
              onAccept();
              onClose();
            }}
          >
            <FiCheck size={20} />
            {hasScrolledToBottom ? 'Li e Concordo' : 'Leia todo o documento'}
          </button>
        </div>

      </div>
    </div>
  );
}