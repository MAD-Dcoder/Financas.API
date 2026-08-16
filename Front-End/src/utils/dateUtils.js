// src/utils/dateUtils.js

export const isPastOrToday = (dataStr) => {
  if (!dataStr) return true;
  const partes = dataStr.split('/');
  if (partes.length !== 3) return true;
  const [dia, mes, ano] = partes;
  const dateObj = new Date(ano, mes - 1, dia);
  const hoje = new Date();
  hoje.setHours(23, 59, 59, 999);
  return dateObj <= hoje;
};

export const isDataInputFuture = (dateString) => {
  if(!dateString) return false;
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const dia = String(hoje.getDate()).padStart(2, '0');
  const hojeStr = `${ano}-${mes}-${dia}`;
  return dateString > hojeStr;
};

export const formatarCabecalhoData = (dataStr) => {
  const hojeObj = new Date();
  const hoje = hojeObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  
  const ontemObj = new Date(hojeObj);
  ontemObj.setDate(ontemObj.getDate() - 1);
  const ontem = ontemObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  if (dataStr === hoje) return 'Hoje';
  if (dataStr === ontem) return 'Ontem';
  
  const partes = (dataStr || '').split('/');
  return partes.length === 3 ? `${partes[0]}/${partes[1]}` : dataStr;
};