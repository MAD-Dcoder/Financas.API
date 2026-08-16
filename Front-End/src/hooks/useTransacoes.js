import { useState, useEffect, useMemo } from 'react';
import api from '../api/axios';
import { mapaCategoriasAPIReverse, mapaContasAPIReverse } from '../utils/constants';
import { isPastOrToday } from '../utils/dateUtils';

export function useTransacoes(usuarioLogado, isLoggedIn, handleLogout) {
  const TRANSACOES_API_URL = '/Transacoes';
  const [transacoes, setTransacoes] = useState([]);
  const [termoBusca, setTermoBusca] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [abaGrafico, setAbaGrafico] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  const carregarTransacoes = async () => {
    if (!isLoggedIn || !usuarioLogado) return;
    try {
      const response = await api.get(`${TRANSACOES_API_URL}/usuario/${usuarioLogado.id}`);
      
      const transacoesDoBanco = response.data.map(t => {
        const dataStr = t.dataTransacao || new Date().toISOString();
        const dataQuebrada = dataStr.split('T');
        const dataBruta = dataQuebrada[0].split('-'); 
        const dataCerta = dataBruta.length === 3 ? `${dataBruta[2]}/${dataBruta[1]}/${dataBruta[0]}` : '01/01/2000';
        const horaCerta = dataQuebrada[1] ? dataQuebrada[1].substring(0, 5) : '00:00';
        
        return {
          id: t.id,
          titulo: t.descricao || 'Lançamento sem título',
          categoria: mapaCategoriasAPIReverse[t.categoriaId] || 'Outros',
          pagamento: mapaContasAPIReverse[t.contaOrigemId] || mapaContasAPIReverse[t.contaDestinoId] || 'Pix',
          observacao: t.observacao || '',
          data: dataCerta,
          hora: horaCerta,
          valor: Number(t.valor) || 0,
          tipo: t.tipo || 'despesa',
          recorrente: t.ehRecorrente || false,
          pago: t.pago !== undefined ? t.pago : true 
        };
      });

      setTransacoes(transacoesDoBanco);
    } catch (error) {
      if(error.response && error.response.status === 401) {
         handleLogout();
         alert("Sua sessão expirou, faça login novamente.");
      }
      console.error("Erro ao buscar transações da API:", error);
    }
  };

  useEffect(() => {
    carregarTransacoes();
  }, [isLoggedIn, usuarioLogado]);

  return {
    transacoes, setTransacoes,
    carregarTransacoes,
    termoBusca, setTermoBusca,
    selectedCategory, setSelectedCategory,
    abaGrafico, setAbaGrafico,
    isCardFlipped, setIsCardFlipped
  };
}