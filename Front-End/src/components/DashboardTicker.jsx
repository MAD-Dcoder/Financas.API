import React, { useMemo, useState, useEffect } from 'react';

export default function DashboardTicker() {
  const frasesTicker = [
    "🚧 FIRMO EM DESENVOLVIMENTO: OBRIGADO POR TESTAR ESSA BAGUNÇA! 💸 CUIDADO: A frase \"eu trabalho é para isso mesmo\" é a maior inimiga do seu saldo bancário.",
    "🚧 FIRMO EM DESENVOLVIMENTO: OBRIGADO POR TESTAR ESSA BAGUNÇA! 💰 ALERTA: O saldo da sua conta não é infinito. Evite compras por impulso hoje!",
    "🚧 FIRMO EM DESENVOLVIMENTO: OBRIGADO POR TESTAR ESSA BAGUNÇA! 💳 CUIDADO: O limite do cartão de crédito não é seu amigo. Evite compras por impulso hoje!",
    "🚧 FIRMO EM DESENVOLVIMENTO: OBRIGADO POR TESTAR ESSA BAGUNÇA! 🚨 ALERTA: Seu dinheiro está sumindo mais rápido que salário no dia 5. Segure a emoção!",
    "🚧 FIRMO EM DESENVOLVIMENTO: OBRIGADO POR TESTAR ESSA BAGUNÇA! 🛒 DICA DE OURO: Colocar na sacola da loja online e fechar o app é terapia gratuita. Não clique em comprar!",
    "🚧 FIRMO EM DESENVOLVIMENTO: OBRIGADO POR TESTAR ESSA BAGUNÇA! 💳 A fatura não tem pena dos seus sentimentos, nem coração. Evite compras por impulso hoje!",
    "🚧 FIRMO EM DESENVOLVIMENTO: OBRIGADO POR TESTAR ESSA BAGUNÇA! 📦 STATUS: Só porque o frete é grátis não significa que você precisa comprar. Feche o app!",
    "🚧 FIRMO EM DESENVOLVIMENTO: OBRIGADO POR TESTAR ESSA BAGUNÇA! 💸 AVISO: O botão de fazer Pix é uma armadilha. Respire fundo antes de digitar a senha.",
    "🚧 FIRMO EM DESENVOLVIMENTO: OBRIGADO POR TESTAR ESSA BAGUNÇA! 📆 MATEMÁTICA BÁSICA: Se o mês tem 30 dias, por que o salário tem que acabar no dia 10?",
    "🚧 FIRMO EM DESENVOLVIMENTO: OBRIGADO POR TESTAR ESSA BAGUNÇA! 🛑 ALERTA: 'Parcelar em 12x sem juros' é o feitiço mais perigoso inventado pelo comércio.",
    "🚧 FIRMO EM DESENVOLVIMENTO: OBRIGADO POR TESTAR ESSA BAGUNÇA! 🧘 TERAPIA FINANCEIRA: Contar até 10 antes de passar o cartão evita lágrimas na hora de pagar a fatura.",
    "🚧 FIRMO EM DESENVOLVIMENTO: OBRIGADO POR TESTAR ESSA BAGUNÇA! 💳 LEMBRETE: O cartão aprovar a compra não significa que você tem dinheiro para pagar por ela.",
    "🚧 FIRMO EM DESENVOLVIMENTO: OBRIGADO POR TESTAR ESSA BAGUNÇA! 👀 DICA AMIGA: Ficar rico começa parando de gastar como se já fosse.",
  ];

  // Adicionamos um state para forçar a re-renderização caso o usuário deixe o app aberto na virada das 7h
  const [agora, setAgora] = useState(new Date());

  useEffect(() => {
    // Atualiza o relógio interno a cada 1 minuto para garantir que a frase vire se o app ficar aberto
    const interval = setInterval(() => {
      setAgora(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const dashboardTickerText = useMemo(() => {
    const dataCalculo = new Date(agora);
    
    // Se a hora atual for menor que 7 da manhã, subtraímos 1 dia da data de cálculo.
    // Assim, a frase de "ontem" continua valendo até as 06:59:59.
    if (dataCalculo.getHours() < 7) {
      dataCalculo.setDate(dataCalculo.getDate() - 1);
    }

    // Criamos uma data base fixa para iniciar a contagem (ex: 1 de Janeiro de 2024)
    const dataBase = new Date(2026, 7, 23);
    
    // Zeramos as horas para comparar apenas os dias inteiros passados
    dataCalculo.setHours(0, 0, 0, 0);
    dataBase.setHours(0, 0, 0, 0);

    // Calculamos a diferença em dias
    const diffTempo = dataCalculo.getTime() - dataBase.getTime();
    const diasPassados = Math.floor(diffTempo / (1000 * 60 * 60 * 24));

    // O resto da divisão garante que o índice ande de 1 em 1 e volte ao zero no final do array
    const indiceDiario = diasPassados % frasesTicker.length;
    const fraseEscolhida = frasesTicker[indiceDiario];

    return (
      <>
        <span>{fraseEscolhida}</span>
        <span>{fraseEscolhida}</span>
      </>
    );
  }, [agora]); 

  return (
    <div className="dashboard-ticker">
      <div className="dashboard-ticker-content">
        {dashboardTickerText}
        {dashboardTickerText}
      </div>
    </div>
  );
}