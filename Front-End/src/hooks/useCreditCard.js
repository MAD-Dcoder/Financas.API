import { useState, useEffect } from 'react';
import api from '../api/axios';

export function useCreditCard(usuarioLogado, setShowCardSettings, cartaoIdParaEditar = null) {
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

  // Se recebermos um ID específico para editar, busca os dados dele. Senão, busca o primeiro ou prepara para novo.
  useEffect(() => {
    async function carregarCartao() {
      if (usuarioLogado?.id) {
        try {
          const response = await api.get(`/Cartoes/usuario/${usuarioLogado.id}`);
          if (response.data && response.data.length > 0) {
            // Se foi passado um ID para edição, busca ele. Se não, pega o primeiro da lista.
            const cartaoDoBanco = cartaoIdParaEditar 
              ? response.data.find(c => c.id === cartaoIdParaEditar) || response.data[0]
              : response.data[0];
            
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
          }
          setNomeCartao((usuarioLogado?.nome || 'SEU NOME').toUpperCase());
        } catch (error) {
          console.error("Erro ao buscar cartões:", error);
        }
      }
    }
    carregarCartao();
  }, [usuarioLogado, cartaoIdParaEditar]);

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
        // Se já tem ID, atualiza especificamente este cartão (PUT)
        await api.put(`/Cartoes/${cartaoId}`, payload);
      } else {
        // Se não tem ID (Novo cartão sendo criado pelo botão "Adicionar cartão"), usa POST
        const response = await api.post('/Cartoes', payload);
        if (response.data && response.data.id) {
          setCartaoId(response.data.id);
        }
      }

      // Atualiza os estados locais
      setDiaVencimento(String(vVenc).padStart(2, '0'));
      setDiaFechamento(String(vFech).padStart(2, '0'));
      setCorCartao(vCor);
      setApelidoCartao(vApelido);
      setFinalCartao(vFinal);
      setBandeiraCartao(vBandeira);
      setLimiteTotal(vLimite);

      alert("Cartão salvo com sucesso!");
      setShowCardSettings(false);
    } catch (error) {
      console.error("Erro ao salvar cartão:", error);
      alert("Erro ao salvar o cartão. Verifique os campos.");
    }
  };

  return {
    cartaoId,
    diaVencimento, diaFechamento, corCartao, apelidoCartao, finalCartao, nomeCartao, bandeiraCartao, limiteTotal,
    tempDiaVencimento, setTempDiaVencimento, tempDiaFechamento, setTempDiaFechamento,
    tempCor, setTempCor, tempApelido, setTempApelido, tempFinal, setTempFinal,
    tempNome, setTempNome, tempBandeira, setTempBandeira, tempLimite, setTempLimite,
    handleSalvarConfigCartao
  };
}