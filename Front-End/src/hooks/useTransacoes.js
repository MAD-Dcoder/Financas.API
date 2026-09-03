import { useState, useContext } from 'react';
import { FinanceiroContext } from '../contexts/FinanceiroContext';

export function useTransacoes() {
  const { transacoesGlobais, setTransacoesGlobais, carregarDadosFinanceiros } = useContext(FinanceiroContext);
  const [termoBusca, setTermoBusca] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [abaGrafico, setAbaGrafico] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  return {
    transacoes: transacoesGlobais,
    setTransacoes: setTransacoesGlobais,
    carregarTransacoes: carregarDadosFinanceiros,
    termoBusca, setTermoBusca,
    selectedCategory, setSelectedCategory,
    abaGrafico, setAbaGrafico,
    isCardFlipped, setIsCardFlipped
  };
}