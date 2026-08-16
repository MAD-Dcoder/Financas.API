import { useState, useEffect } from 'react';

export function useCreditCard(usuarioLogado, setShowCardSettings) {
  const [diaVencimento, setDiaVencimento] = useState('00'); 
  const [diaFechamento, setDiaFechamento] = useState('00'); 
  const [corCartao, setCorCartao] = useState('linear-gradient(135deg, #8A05BE 0%, #4c0677 100%)'); 
  const [apelidoCartao, setApelidoCartao] = useState('Cartão Principal');
  const [finalCartao, setFinalCartao] = useState('0000');
  const [nomeCartao, setNomeCartao] = useState('SEU NOME');
  const [bandeiraCartao, setBandeiraCartao] = useState('Mastercard'); 

  useEffect(() => {
    if (usuarioLogado) {
      const savedCardSettings = localStorage.getItem(`firmo_card_${usuarioLogado.id}`);
      if (savedCardSettings) {
        const parsedSettings = JSON.parse(savedCardSettings);
        setDiaVencimento(parsedSettings.diaVencimento || '00');
        setDiaFechamento(parsedSettings.diaFechamento || '00');
        setCorCartao(parsedSettings.corCartao || 'linear-gradient(135deg, #8A05BE 0%, #4c0677 100%)');
        setApelidoCartao(parsedSettings.apelidoCartao || 'Cartão Principal');
        setFinalCartao(parsedSettings.finalCartao || '0000');
        setNomeCartao(parsedSettings.nomeCartao || (usuarioLogado?.nome || 'SEU NOME').toUpperCase());
        setBandeiraCartao(parsedSettings.bandeiraCartao || 'Mastercard');
      } else {
        setNomeCartao((usuarioLogado?.nome || 'SEU NOME').toUpperCase());
      }
    }
  }, [usuarioLogado]);

  const [tempDiaVencimento, setTempDiaVencimento] = useState('');
  const [tempDiaFechamento, setTempDiaFechamento] = useState('');
  const [tempCor, setTempCor] = useState('');
  const [tempApelido, setTempApelido] = useState('');
  const [tempFinal, setTempFinal] = useState('');
  const [tempNome, setTempNome] = useState('');
  const [tempBandeira, setTempBandeira] = useState('');

  const handleSalvarConfigCartao = () => {
    const vVenc = String(tempDiaVencimento || '00').padStart(2, '0');
    const vFech = String(tempDiaFechamento || '00').padStart(2, '0');
    const vNome = (tempNome || 'SEU NOME').toUpperCase();
    
    setDiaVencimento(vVenc);
    setDiaFechamento(vFech);
    setCorCartao(tempCor);
    setApelidoCartao(tempApelido || 'Cartão Principal');
    setFinalCartao(tempFinal || '0000');
    setNomeCartao(vNome);
    setBandeiraCartao(tempBandeira || 'Mastercard');
    
    if (usuarioLogado) {
      localStorage.setItem(`firmo_card_${usuarioLogado.id}`, JSON.stringify({
        diaVencimento: vVenc,
        diaFechamento: vFech,
        corCartao: tempCor,
        apelidoCartao: tempApelido || 'Cartão Principal',
        finalCartao: tempFinal || '0000',
        nomeCartao: vNome,
        bandeiraCartao: tempBandeira || 'Mastercard'
      }));
    }
    
    setShowCardSettings(false);
  };

  return {
    diaVencimento, diaFechamento, corCartao, apelidoCartao, finalCartao, nomeCartao, bandeiraCartao,
    tempDiaVencimento, setTempDiaVencimento, tempDiaFechamento, setTempDiaFechamento,
    tempCor, setTempCor, tempApelido, setTempApelido, tempFinal, setTempFinal,
    tempNome, setTempNome, tempBandeira, setTempBandeira,
    handleSalvarConfigCartao
  };
}