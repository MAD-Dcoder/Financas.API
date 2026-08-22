// src/utils/constants.js
export const mapaCategoriasAPI = {
  'Alimentação': 1, 'Moto': 2, 'Carro': 3, 'Educação': 4,
  'Lazer': 5, 'Moradia': 6, 'Salário': 7, 'Vale (VR + VT)': 8,
  'Rendimento': 9, 'Outros': 10
};

export const mapaContasAPI = {
  'Pix': 2, 'Crédito': 3, 'Débito': 4, 'Dinheiro': 5, 'Boleto': 6
};

export const mapaCategoriasAPIReverse = Object.fromEntries(
  Object.entries(mapaCategoriasAPI).map(([key, value]) => [value, key])
);

export const mapaContasAPIReverse = Object.fromEntries(
  Object.entries(mapaContasAPI).map(([key, value]) => [value, key])
);

export const coresCategorias = {
  'Alimentação': '#818cf8',
  'Moto': '#10b981',
  'Carro Clássico': '#f59e0b',
  'Carro': '#f59e0b',
  'Educação': '#3b82f6',
  'Lazer': '#f43f5e',
  'Moradia': '#a855f7',
  'Outros': '#6b7280'
};

export const coresPagamento = {
  'Pix': '#06b6d4',
  'Crédito': '#ec4899',
  'Débito': '#8b5cf6',
  'Dinheiro': '#eab308',
  'Boleto': '#f97316'
};

// Dicionário de cores para os cartões
export const mapaCoresCartao = {
  'roxo': 'linear-gradient(135deg, #8A05BE 0%, #4c0677 100%)',
  'laranja': 'linear-gradient(135deg, #ff8000 0%, #ff8000 100%)',
  'carbon': 'linear-gradient(135deg, #000000 0%, #252525 100%)',
  'vermelho': 'linear-gradient(135deg, #302929 0%, #7e0000 100%)',
  'amarelo': 'linear-gradient(135deg, #fffb00fa 0%, #474334 100%)',
  'azul': 'linear-gradient(135deg, #0d8df7 0%, #7bb3e0 100%)',
  'ouro': 'linear-gradient(135deg, #C5A059 0%, #4e380f 100%)',
  'prata': 'linear-gradient(135deg, #D3D3D3 0%, #535856 100%)',
  'padrao': 'linear-gradient(135deg, #6467b8 0%, #0004f0d5 100%)'
};

export const PALETA_CORES = [
  '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', 
  '#ec4899', '#06b6d4', '#f97316', '#a3e635', '#6366f1'
];