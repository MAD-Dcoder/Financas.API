import { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { FinanceiroContext } from '../contexts/FinanceiroContext'; // Novo import

export function useCreditCard(usuarioLogado, setShowCardSettings, cartaoIdParaEditar = null) {
  const { cartoesGlobais, carregarDadosFinanceiros } = useContext(FinanceiroContext); // Puxa do contexto

  const [cartaoId, setCartaoId] = useState(cartaoIdParaEditar);
  const [diaVencimento, setDiaVencimento] = useState('00');
  const [diaFechamento, setDiaFechamento] = useState('00');
  const [corCartao, setCorCartao] = useState('linear-gradient(135deg, #8A05BE 0%, #4c0677 100%)');
  const [apelidoCartao, setApelidoCartao] = useState('Cartão Principal');
  const [finalCartao, setFinalCartao] = useState('0000');
  const [nomeCartao, setNomeCartao] = useState('SEU NOME');
  const [bandeiraCartao, setBandeiraCartao] = useState('Mastercard');
  const [limiteTotal, setLimiteTotal] = useState(0);

  // Estados temporários do formulário
  const [tempDiaVencimento, setTempDiaVencimento] = useState('');
  const [tempDiaFechamento, setTempDiaFechamento] = useState('');
  const [tempCor, setTempCor] = useState('');
  const [tempApelido, setTempApelido] = useState('');
  const [tempFinal, setTempFinal] = useState('');
  const [tempNome, setTempNome] = useState('');
  const [tempBandeira, setTempBandeira] = useState('');
  const [tempLimite, setTempLimite] = useState('');

  useEffect(() => {
    if (usuarioLogado?.id && cartoesGlobais.length > 0) {
      const cartaoDoBanco = cartaoIdParaEditar 
        ? cartoesGlobais.find(c => c.id === cartaoIdParaEditar) || cartoesGlobais[0]
        : cartoesGlobais[0];
      
      if (cartaoDoBanco) {
        setCartaoId(cartaoDoBanco.id);
        setDiaVencimento(String(cartaoDoBanco.diaVencimento).padStart(2, '0'));
        setDiaFechamento(String(cartaoDoBanco.diaFechamento).padStart(2, '0'));
        setCorCartao(cartaoDoBanco.corFundo || 'linear-gradient(135deg, #8A05BE 0%, #4c0677 100%)');
        setApelidoCartao(cartaoDoBanco.nome || 'Cartão Principal');
        setFinalCartao(cartaoDoBanco.ultimosDigitos || '0000');
        setBandeiraCartao(cartaoDoBanco.bandeira || 'Mastercard');
        setLimiteTotal(cartaoDoBanco.limiteTotal || 0);
      }
      setNomeCartao((usuarioLogado?.nome || 'SEU NOME').toUpperCase());
    }
  }, [usuarioLogado, cartaoIdParaEditar, cartoesGlobais]);

  const handleSalvarConfigCartao = async () => {
    const vVenc = parseInt(tempDiaVencimento || diaVencimento || '1', 10);
    const vFech = parseInt(tempDiaFechamento || diaFechamento || '1', 10);
    const vApelido = tempApelido || apelidoCartao || 'Cartão Principal';
    const vFinal = tempFinal || finalCartao || '0000';
    const vBandeira = tempBandeira || bandeiraCartao || 'Mastercard';
    const vCor = tempCor || corCartao;
    const vLimite = parseFloat(tempLimite || limiteTotal || 0);

    const payload = {
      id: cartaoId ? Number(cartaoId) : 0,
      usuarioId: usuarioLogado.id,
      nome: vApelido,
      ultimosDigitos: vFinal,
      bandeira: vBandeira,
      limiteTotal: vLimite,
      diaVencimento: vVenc,
      diaFechamento: vFech,
      corFundo: vCor,
      corTexto: "#FFFFFF"
    };

    try {
      if (cartaoId) {
        await api.put(`/Cartoes/${cartaoId}`, payload);
      } else {
        const response = await api.post('/Cartoes', payload);
        if (response.data && response.data.id) setCartaoId(response.data.id);
      }

      await carregarDadosFinanceiros(); // Atualiza tudo globalmente
      
      alert("Cartão salvo com sucesso!");
      setShowCardSettings(false);
    } catch (error) {
      console.error("Erro ao salvar cartão:", error);
      alert("Erro ao salvar o cartão. Verifique os campos.");
    }
  };

  return {
    cartaoId, diaVencimento, diaFechamento, corCartao, apelidoCartao, finalCartao, nomeCartao, bandeiraCartao, limiteTotal,
    tempDiaVencimento, setTempDiaVencimento, tempDiaFechamento, setTempDiaFechamento,
    tempCor, setTempCor, tempApelido, setTempApelido, tempFinal, setTempFinal,
    tempNome, setTempNome, tempBandeira, setTempBandeira, tempLimite, setTempLimite,
    handleSalvarConfigCartao
  };
}