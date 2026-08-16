export const formatarMoeda = (valor) => {
  const num = Number(valor);
  if (isNaN(num) || valor === null || valor === undefined) return 'R$ 0,00';
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};