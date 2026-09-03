import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from './AuthContext';

export const FinanceiroContext = createContext();

export const FinanceiroProvider = ({ children }) => {
  const { usuarioLogado, isLoggedIn, handleLogout } = useContext(AuthContext);
  const [cartoesGlobais, setCartoesGlobais] = useState([]);
  const [transacoesGlobais, setTransacoesGlobais] = useState([]);
  const [isCarregando, setIsCarregando] = useState(true);

  const carregarDadosFinanceiros = async () => {
    if (!isLoggedIn || !usuarioLogado?.id) return;
    
    try {
      setIsCarregando(true);
      const [resCartoes, resTrans] = await Promise.all([
        api.get(`/Cartoes/usuario/${usuarioLogado.id}`),
        api.get(`/Transacoes/usuario/${usuarioLogado.id}`)
      ]);

      setCartoesGlobais(resCartoes.data || []);

      const transacoesFormatadas = (resTrans.data || []).map(t => {
        const dataStr = t.dataTransacao || t.DataTransacao || t.data || t.Data || new Date().toISOString();
        const dataQuebrada = dataStr.split('T');
        const dataBruta = dataQuebrada[0].split('-');
        const dataCerta = dataBruta.length === 3 ? `${dataBruta[2]}/${dataBruta[1]}/${dataBruta[0]}` : '01/01/2000';
        
        return {
          ...t,
          dataStrFormatada: dataCerta,
          dataObj: dataBruta.length === 3 ? new Date(dataBruta[0], dataBruta[1] - 1, dataBruta[2]) : new Date(2000, 0, 1),
          valorNumerico: Number(t.valor || t.Valor) || 0,
          cartaoIdNumerico: Number(t.cartaoId || t.CartaoId),
          tipoStr: (t.tipo || t.Tipo || '').toLowerCase(),
          isPago: t.pago === true || t.Pago === true || t.pago === 1 || t.Pago === 1
        };
      });

      setTransacoesGlobais(transacoesFormatadas);
    } catch (error) {
      if(error.response && error.response.status === 401) {
         handleLogout();
         alert("Sua sessão expirou, faça login novamente.");
      }
      console.error("Erro ao carregar dados financeiros:", error);
    } finally {
      setIsCarregando(false);
    }
  };

  useEffect(() => {
    carregarDadosFinanceiros();
  }, [isLoggedIn, usuarioLogado]);

  return (
    <FinanceiroContext.Provider value={{
      cartoesGlobais, setCartoesGlobais,
      transacoesGlobais, setTransacoesGlobais,
      carregarDadosFinanceiros,
      isCarregando
    }}>
      {children}
    </FinanceiroContext.Provider>
  );
};