// Formatação para o padrão de moeda brasileiro (BRL)
export const formatarMoeda = (valor) => {
  const num = Number(valor);
  if (isNaN(num) || valor === null || valor === undefined) return 'R$ 0,00';
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

// Pega a primeira letra do primeiro e do segundo nome para o Avatar
export const getIniciais = (nomeCompleto) => {
  if (!nomeCompleto) return 'US';
  const nomes = nomeCompleto.trim().split(/\s+/);
  if (nomes.length >= 2) {
    return (nomes[0][0] + nomes[1][0]).toUpperCase();
  }
  return nomes[0].substring(0, 2).toUpperCase();
};

// Limita a exibição a no máximo os dois primeiros nomes para evitar quebra de layout
export const getNomeCurto = (nomeCompleto) => {
  if (!nomeCompleto) return 'Usuário';
  const nomes = nomeCompleto.trim().split(/\s+/);
  if (nomes.length >= 2) {
    return `${nomes[0]} ${nomes[1]}`;
  }
  return nomes[0];
};