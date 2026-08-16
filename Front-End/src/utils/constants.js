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