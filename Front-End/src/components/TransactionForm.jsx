import React, { useState, useEffect } from 'react';
import { Offcanvas } from 'react-bootstrap';
import { FiAlertCircle } from 'react-icons/fi';
import { isDataInputFuture } from '../utils/dateUtils';
import { formatarMoeda } from '../utils/formatters';
import { mapaContasAPI, mapaCategoriasAPI } from '../utils/constants';
import api from '../api/axios';

function TransactionForm({
  showBottomSheet, setShowBottomSheet,
  usuarioLogado, carregarTransacoes,
  transacaoParaEditar, setTransacaoParaEditar
}) {
  const TRANSACOES_API_URL = '/Transacoes';

  const [tipoTransacao, setTipoTransacao] = useState('despesa');
  const [valorInput, setValorInput] = useState('');
  const [tituloInput, setTituloInput] = useState('');
  const [categoriaInput, setCategoriaInput] = useState('');
  const [pagamentoInput, setPagamentoInput] = useState('');
  const [dataInput, setDataInput] = useState(new Date().toISOString().substring(0,10));
  const [observacaoInput, setObservacaoInput] = useState('');
  const [ehRecorrente, setEhRecorrente] = useState(false);
  const [pagoInput, setPagoInput] = useState(true);
  
  const [tipoRecorrencia, setTipoRecorrencia] = useState('fixo');
  const [tipoValorParcela, setTipoValorParcela] = useState('total');
  const [qtdParcelas, setQtdParcelas] = useState(2);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const editandoId = transacaoParaEditar ? transacaoParaEditar.id : null;

  // Preenche o formulário automaticamente se for edição
  useEffect(() => {
    if (transacaoParaEditar) {
      setValorInput((Number(transacaoParaEditar.valor) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
      setTituloInput(transacaoParaEditar.titulo || '');
      setCategoriaInput(transacaoParaEditar.categoria || '');
      setPagamentoInput(transacaoParaEditar.pagamento || '');
      const partes = (transacaoParaEditar.data || '').split('/');
      setDataInput(partes.length === 3 ? `${partes[2]}-${partes[1]}-${partes[0]}` : new Date().toISOString().substring(0,10));
      setObservacaoInput(transacaoParaEditar.observacao || '');
      setTipoTransacao(transacaoParaEditar.tipo || 'despesa');
      setEhRecorrente(transacaoParaEditar.recorrente || false);
      setPagoInput(transacaoParaEditar.pago !== false);
    } else {
      // Limpa tudo se for um novo lançamento
      setValorInput('');
      setTituloInput('');
      setCategoriaInput('');
      setPagamentoInput('');
      setDataInput(new Date().toISOString().substring(0,10));
      setObservacaoInput('');
      setTipoTransacao('despesa');
      setEhRecorrente(false);
      setPagoInput(true);
      setTipoRecorrencia('fixo');
      setTipoValorParcela('total');
      setQtdParcelas(2);
    }
  }, [transacaoParaEditar, showBottomSheet]);

  useEffect(() => {
    if (!editandoId && dataInput) {
      setPagoInput(!isDataInputFuture(dataInput));
    }
  }, [dataInput, editandoId]);

  const handleValorChange = (e) => {
    const apenasNumeros = e.target.value.replace(/\D/g, ''); 
    if (!apenasNumeros) {
      setValorInput('');
      return;
    }
    const valorFormatado = (parseInt(apenasNumeros, 10) / 100).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    setValorInput(valorFormatado);
  };

  const handleConfirmarLancamento = async () => {
    if (isSubmitting) return;

    if (!valorInput || !tituloInput || !categoriaInput || !pagamentoInput) {
      alert("Por favor, preencha o valor, título, categoria e forma de pagamento!");
      return;
    }

    setIsSubmitting(true);

    const valorNumerico = parseFloat(valorInput.replace(/\./g, '').replace(',', '.'));
    const tituloFormatado = (tituloInput || '').trim().toLowerCase().split(/\s+/).map(word => word ? word.charAt(0).toUpperCase() + word.slice(1) : '').join(' ');
    const horaAtual = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const isParcelado = ehRecorrente && tipoRecorrencia === 'parcelado';
    const isFixo = ehRecorrente && tipoRecorrencia === 'fixo';
    
    const parcelas = isParcelado ? qtdParcelas : (isFixo ? 12 : 1);
    const valorFinalTransacao = isParcelado ? (tipoValorParcela === 'total' ? (valorNumerico / qtdParcelas) : valorNumerico) : valorNumerico;

    const payloadParaAPI = {
      id: editandoId || 0,
      usuarioId: usuarioLogado.id, 
      contaOrigemId: mapaContasAPI[pagamentoInput], 
      contaDestinoId: null, 
      categoriaId: mapaCategoriasAPI[categoriaInput],
      valor: valorFinalTransacao,
      tipo: tipoTransacao,
      pago: pagoInput,
      ehRecorrente: ehRecorrente,
      observacao: observacaoInput
    };

    try {
      if (editandoId) {
        const dataHoraLocal = `${dataInput}T${horaAtual}:00`;
        await api.put(`${TRANSACOES_API_URL}/${editandoId}`, {
          ...payloadParaAPI, 
          descricao: tituloFormatado, 
          dataTransacao: dataHoraLocal 
        });
        await carregarTransacoes();
      } else {
        for (let i = 0; i < parcelas; i++) {
          const dataParcela = new Date(`${dataInput}T12:00:00`);
          dataParcela.setMonth(dataParcela.getMonth() + i);
          const dataFormatada = dataParcela.toISOString().substring(0, 10);
          
          let tituloFinal = tituloFormatado;
          if (isParcelado) {
            tituloFinal = `${tituloFormatado} (${i + 1}/${parcelas})`;
          }

          const statusPagoParcela = i === 0 ? pagoInput : false;

          const payloadCriacao = { 
            ...payloadParaAPI, 
            descricao: tituloFinal,
            dataTransacao: `${dataFormatada}T${horaAtual}:00`,
            pago: statusPagoParcela
          };
          
          await api.post(TRANSACOES_API_URL, payloadCriacao);
        }
        await carregarTransacoes();
      }
      fecharModal();
    } catch (error) {
      console.error("Erro ao salvar transação:", error);
      alert("Houve um erro ao salvar. Verifique se a API está rodando.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fecharModal = () => {
    setShowBottomSheet(false);
    setTransacaoParaEditar(null);
  };

  return (
    <Offcanvas 
      show={showBottomSheet} 
      onHide={fecharModal} 
      placement="bottom" 
      style={{ height: 'auto', maxHeight: '90vh', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', backgroundColor: '#1e1e24', color: '#fff' }}
    >
      <Offcanvas.Header closeButton closeVariant="white" className="pb-0 border-0 mt-2">
        <Offcanvas.Title className="w-100 text-center fw-bold fs-6 text-white">
          {editandoId ? 'Editar Lançamento' : 'Novo Lançamento'}
        </Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body style={{ overflowY: 'auto', paddingBottom: '0' }}>
        
        <div className="mt-2">
          <div className="d-flex justify-content-center mb-3 bg-dark rounded-pill p-1 mx-auto" style={{ maxWidth: '250px' }}>
            <button 
              className={`btn rounded-pill w-50 fw-bold border-0 ${tipoTransacao === 'despesa' ? 'text-white' : 'text-light opacity-50'}`} 
              style={{ backgroundColor: tipoTransacao === 'despesa' ? '#374151' : 'transparent' }}
              onClick={() => { setTipoTransacao('despesa'); setCategoriaInput(''); }}
            >
              Despesa
            </button>
            <button 
              className={`btn rounded-pill w-50 fw-bold border-0 ${tipoTransacao === 'receita' ? 'text-dark' : 'text-light opacity-50'}`} 
              style={{ backgroundColor: tipoTransacao === 'receita' ? '#10b981' : 'transparent' }}
              onClick={() => { setTipoTransacao('receita'); setCategoriaInput(''); }}
            >
              Receita
            </button>
          </div>

          <div className="text-center mb-3">
            <small className="text-light opacity-75 fw-bold d-block mb-1">VALOR</small>
            <input 
              type="text" 
              inputMode="numeric"
              className={`form-control bg-transparent border-0 text-center fw-bold fs-1 py-0 shadow-none w-100 ${tipoTransacao === 'despesa' ? 'text-white input-valor-despesa' : 'text-emerald input-valor-receita'}`} 
              style={{ color: tipoTransacao === 'receita' ? '#10b981 !important' : '#ffffff' }}
              placeholder="R$ 0,00" 
              value={valorInput ? `R$ ${valorInput}` : ''}
              onChange={handleValorChange}
            />
          </div>
        </div>

        <div className="d-flex flex-column gap-2 mb-3">
          <div className="row g-2">
            <div className="col-6">
              <label className="form-label text-light opacity-75 small mb-1">Título</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  className="form-control bg-dark border-secondary text-white shadow-none" 
                  placeholder="Ex: Troca de óleo" 
                  value={tituloInput}
                  onChange={(e) => setTituloInput(e.target.value)}
                  maxLength={30}
                  style={{ paddingRight: '40px' }} 
                />
                <span 
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '10px', color: '#6c757d', pointerEvents: 'none' }}
                >
                  {tituloInput.length}/30
                </span>
              </div>
            </div>
            <div className="col-6">
              <label className="form-label text-light opacity-75 small mb-1">Categoria</label>
              <select 
                className="form-select bg-dark border-secondary text-white shadow-none"
                value={categoriaInput}
                onChange={(e) => setCategoriaInput(e.target.value)}
              >
                <option value="" disabled>Selecione...</option>
                {tipoTransacao === 'receita' ? (
                  <>
                    <option value="Salário">Salário</option>
                    <option value="Vale (VR + VT)">Vale (VR + VT)</option>
                    <option value="Rendimento">Rendimento</option>
                    <option value="Outros">Outros</option>
                  </>
                ) : (
                  <>
                    <option value="Alimentação">Alimentação</option>
                    <option value="Moto">Moto</option>
                    <option value="Carro">Carro</option>
                    <option value="Educação">Educação</option>
                    <option value="Lazer">Lazer</option>
                    <option value="Moradia">Moradia</option>
                    <option value="Outros">Outros</option>
                  </>
                )}
              </select>
            </div>
          </div>
          
          <div className="row g-2">
            <div className="col-6">
              <label className="form-label text-light opacity-75 small mb-1">Forma de Pagamento</label>
              <select 
                className="form-select bg-dark border-secondary text-white shadow-none"
                value={pagamentoInput}
                onChange={(e) => setPagamentoInput(e.target.value)}
              >
                <option value="" disabled>Selecione...</option>
                <option value="Pix">Pix</option>
                <option value="Crédito">Cartão de Crédito</option>
                <option value="Débito">Cartão de Débito</option>
                <option value="Dinheiro">Dinheiro</option>
                <option value="Boleto">Boleto</option>
              </select>
            </div>
            <div className="col-6">
              <label className="form-label text-light opacity-75 small mb-1">Data</label>
              <input 
                type="date" 
                className="form-control bg-dark border-secondary text-white shadow-none" 
                value={dataInput}
                onChange={(e) => setDataInput(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="form-label text-light opacity-75 small mb-1">Observação</label>
            <div style={{ position: 'relative' }}>
              <textarea 
                className="form-control bg-dark border-secondary text-white shadow-none" 
                rows="2"
                placeholder="Detalhes adicionais (Opcional)" 
                value={observacaoInput}
                onChange={(e) => setObservacaoInput(e.target.value)}
                maxLength={255}
                style={{ paddingBottom: '20px' }} 
              />
              <span 
                style={{ position: 'absolute', right: '10px', bottom: '8px', fontSize: '10px', color: '#6c757d', pointerEvents: 'none' }}
              >
                {observacaoInput.length}/255
              </span>
            </div>
          </div>
        </div>

        {isDataInputFuture(dataInput) && (
          <div className="form-check form-switch d-flex align-items-center justify-content-between px-0 mb-3">
            <label className="form-check-label text-light opacity-75 ms-0" htmlFor="statusPago">Lançamento já foi pago/recebido?</label>
            <input 
              className="form-check-input ms-3 shadow-none mt-0" 
              type="checkbox" 
              role="switch" 
              id="statusPago" 
              style={{ width: '45px', height: '24px', cursor: 'pointer' }}
              checked={pagoInput}
              onChange={(e) => setPagoInput(e.target.checked)}
            />
          </div>
        )}

        <div className="form-check form-switch d-flex align-items-center justify-content-between px-0 mb-3">
          <label className="form-check-label text-light opacity-75 ms-0" htmlFor="recorrente">É uma transação fixa/recorrente?</label>
          <input 
            className="form-check-input ms-3 shadow-none mt-0" 
            type="checkbox" 
            role="switch" 
            id="recorrente" 
            style={{ width: '45px', height: '24px', cursor: editandoId ? 'not-allowed' : 'pointer' }}
            checked={ehRecorrente}
            onChange={(e) => setEhRecorrente(e.target.checked)}
            disabled={!!editandoId} 
          />
        </div>
        
        {ehRecorrente && tipoRecorrencia === 'parcelado' && (
          <div className="form-check form-switch d-flex align-items-center justify-content-between px-0 mb-3">
            <label className="form-check-label text-light opacity-75 ms-0" htmlFor="toggleTotal">É o valor total do lançamento?</label>
            <input 
              className="form-check-input ms-3 shadow-none mt-0" 
              type="checkbox" 
              role="switch" 
              id="toggleTotal" 
              style={{ width: '45px', height: '24px', cursor: 'pointer' }}
              checked={tipoValorParcela === 'total'}
              onChange={(e) => setTipoValorParcela(e.target.checked ? 'total' : 'parcela')}
            />
          </div>
        )}

        {ehRecorrente && (
          <>
            <div className="d-flex justify-content-between mb-3 bg-dark rounded-pill p-1 mx-auto" style={{ maxWidth: '300px' }}>
              <button
                className={`btn rounded-pill w-50 fw-bold border-0 ${tipoRecorrencia === 'fixo' ? 'text-white' : 'text-light opacity-50'}`}
                style={{ backgroundColor: tipoRecorrencia === 'fixo' ? '#3b82f6' : 'transparent', transition: '0.2s' }}
                onClick={() => setTipoRecorrencia('fixo')}
              >
                Conta Fixa
              </button>
              <button
                className={`btn rounded-pill w-50 fw-bold border-0 ${tipoRecorrencia === 'parcelado' ? 'text-white' : 'text-light opacity-50'}`}
                style={{ backgroundColor: tipoRecorrencia === 'parcelado' ? '#8b5cf6' : 'transparent', transition: '0.2s' }}
                onClick={() => setTipoRecorrencia('parcelado')}
              >
                Parcelada
              </button>
            </div>

            <div className="card bg-dark border-secondary border-opacity-25 p-3 mb-3 rounded-4 shadow-sm">
              {editandoId ? (
                <small className="text-warning text-center d-block opacity-75">
                  <FiAlertCircle className="me-1 mb-1" /> Você está editando apenas esta parcela individual. Para mudar a regra geral de recorrência, exclua e crie um novo lançamento.
                </small>
              ) : (
                <>
                  {tipoRecorrencia === 'parcelado' && (
                    <div>
                      <label className="form-label text-light opacity-75 small mb-1">Quantidade de Parcelas</label>
                      <div className="d-flex align-items-center gap-3">
                        <input
                          type="range"
                          className="form-range flex-grow-1 custom-range"
                          min="2"
                          max="24"
                          value={qtdParcelas}
                          onChange={(e) => setQtdParcelas(parseInt(e.target.value))}
                        />
                        <span className="fw-bold text-white fs-5">{qtdParcelas}x</span>
                      </div>
                      <div className="text-light opacity-50 mt-2 text-center lh-sm" style={{ fontSize: '12px' }}>
                        {tipoValorParcela === 'total' 
                          ? <>Total de R$ {valorInput || '0,00'} dividido em {qtdParcelas}x de <strong>{valorInput ? formatarMoeda(parseFloat(valorInput.replace(/\./g, '').replace(',', '.')) / qtdParcelas) : 'R$ 0,00'}</strong>.</>
                          : <>{qtdParcelas}x de R$ {valorInput || '0,00'} (Total: <strong>{valorInput ? formatarMoeda(parseFloat(valorInput.replace(/\./g, '').replace(',', '.')) * qtdParcelas) : 'R$ 0,00'}</strong>).</>
                        }
                      </div>
                    </div>
                  )}
                  {tipoRecorrencia === 'fixo' && (
                    <small className="text-light opacity-50 d-block text-center mt-1">
                      O valor de R$ {valorInput || '0,00'} será projetado automaticamente por 12 meses.
                    </small>
                  )}
                </>
              )}
            </div>
          </>
        )}

        <button 
          className={`btn w-100 py-3 rounded-4 fw-bold shadow border-0 mt-2 ${isSubmitting ? 'text-white' : 'text-dark'}`}
          style={{ backgroundColor: isSubmitting ? '#6b7280' : '#10b981', transition: '0.3s' }}
          onClick={handleConfirmarLancamento}
          disabled={isSubmitting} 
        >
          {isSubmitting ? (
            <div className="d-flex align-items-center justify-content-center">
              Salvando
              <div className="typing-indicator ms-1">
                <span></span><span></span><span></span>
              </div>
            </div>
          ) : (editandoId ? 'Salvar Alterações' : 'Confirmar Lançamento')}
        </button>
      </Offcanvas.Body>
    </Offcanvas>
  );
}

export default TransactionForm;