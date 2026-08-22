import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiTrash2, FiPlus, FiEdit2, FiCheck, FiX, FiMenu } from 'react-icons/fi';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import categoriasService from '../api/categoriasService';
import { PALETA_CORES } from '../utils/constants'; // Importação da paleta inteligente

function GerenciarCategorias({ show, onHide, usuarioLogado, temaAtual }) {
  const isDark = temaAtual === 'dark';
  const [categorias, setCategorias] = useState([]);
  const [novaCategoria, setNovaCategoria] = useState('');
  const [tipoNovaCategoria, setTipoNovaCategoria] = useState('despesa');
  
  const [editandoId, setEditandoId] = useState(null);
  const [nomeEditado, setNomeEditado] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (show && usuarioLogado?.id) {
      carregarCategorias();
    }
  }, [show, usuarioLogado]);

  const carregarCategorias = async () => {
    try {
      const data = await categoriasService.getCategorias(usuarioLogado.id);
      setCategorias(data);
    } catch (error) {
      console.error("Erro ao carregar categorias", error);
    }
  };

  const handleAdicionar = async (e) => {
    e.preventDefault();
    if (!novaCategoria.trim() || isSubmitting) return;
    setIsSubmitting(true);
    
    // Escolhe uma cor da paleta de forma sequencial com base no tamanho da lista
    const corEscolhida = PALETA_CORES[categorias.length % PALETA_CORES.length];

    try {
      await categoriasService.createCategoria({ 
        nome: novaCategoria, 
        tipo: tipoNovaCategoria,
        usuarioId: usuarioLogado.id,
        corHex: corEscolhida, // Aplica a cor inteligente
        ordem: categorias.length + 1
      });
      setNovaCategoria('');
      await carregarCategorias();
    } catch (error) {
      console.error("Erro ao salvar", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExcluir = async (id) => {
    if(window.confirm("Deseja realmente ocultar esta categoria?")) {
      await categoriasService.deleteCategoria(id);
      carregarCategorias();
    }
  };

  const iniciarEdicao = (cat) => {
    setEditandoId(cat.id);
    setNomeEditado(cat.nome);
  };

  const salvarEdicao = async (cat) => {
    if (!nomeEditado.trim() || nomeEditado === cat.nome) {
      setEditandoId(null);
      return;
    }
    await categoriasService.updateCategoria(cat.id, { ...cat, nome: nomeEditado });
    setEditandoId(null);
    carregarCategorias();
  };

  // ==========================================
  // LÓGICA DE DRAG AND DROP FLUIDO
  // ==========================================
  const handleOnDragEnd = async (result) => {
    if (!result.destination) return;
    if (result.source.index === result.destination.index) return;

    const items = Array.from(categorias);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setCategorias(items);

    const promises = items.map((cat, index) => {
      const novaOrdem = index + 1;
      if (cat.ordem !== novaOrdem) {
        return categoriasService.updateCategoria(cat.id, { ...cat, ordem: novaOrdem });
      }
      return null;
    }).filter(p => p !== null);

    await Promise.all(promises);
  };

  if (!show) return null;

  const bgClass = isDark ? 'bg-dark text-white' : 'bg-white text-dark';
  const borderClass = isDark ? 'border-secondary border-opacity-25' : 'border-light-subtle';
  const inputClass = isDark ? "bg-transparent text-white border-secondary shadow-none" : "bg-transparent text-dark border-light-subtle shadow-none";

  return (
    <div 
      className={bgClass} 
      style={{ position: 'fixed', inset: 0, zIndex: 1060, overflowY: 'auto', transition: 'all 0.3s ease-in-out' }}
    >
      <div className={`d-flex align-items-center p-4 border-bottom ${borderClass}`}>
        <button onClick={onHide} className={`btn btn-link p-0 text-decoration-none shadow-none ${isDark ? 'text-white' : 'text-dark'}`}>
          <FiArrowLeft size={24} />
        </button>
        <h5 className="mb-0 ms-3 fw-bold">Gerenciar Categorias</h5>
      </div>

      <div className="p-4">
        <p className={`small mb-4 ${isDark ? 'text-light opacity-75' : 'text-secondary'}`}>
          Adicione, edite ou altere a prioridade de exibição das suas categorias.
        </p>

        <form onSubmit={handleAdicionar} className="d-flex gap-2 mb-4">
          <select 
            value={tipoNovaCategoria} 
            onChange={(e) => setTipoNovaCategoria(e.target.value)}
            className={`form-select ${inputClass}`}
            style={{ width: '120px' }}
            disabled={isSubmitting}
          >
            <option value="despesa">Despesa</option>
            <option value="receita">Receita</option>
          </select>
          <input 
            type="text" 
            placeholder="Nova categoria..." 
            value={novaCategoria}
            onChange={(e) => setNovaCategoria(e.target.value)}
            className={`form-control ${inputClass}`}
            disabled={isSubmitting}
          />
          <button 
            type="submit" 
            className={`btn border shadow-sm d-flex align-items-center justify-content-center ${isDark ? 'btn-outline-light border-secondary' : 'btn-light border-light-subtle'}`}
            style={{ width: '42px' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="spinner-border spinner-border-sm" role="status"><span className="visually-hidden">Carregando...</span></div>
            ) : (<FiPlus />)}
          </button>
        </form>

        <div className={`card border ${borderClass} bg-transparent`}>
          
          <DragDropContext onDragEnd={handleOnDragEnd}>
            <Droppable droppableId="categorias-lista">
              {(provided) => (
                <ul 
                  className="list-group list-group-flush rounded-3" 
                  {...provided.droppableProps} 
                  ref={provided.innerRef}
                >
                  {categorias.map((cat, index) => (
                    <Draggable key={String(cat.id)} draggableId={String(cat.id)} index={index}>
                      {(provided, snapshot) => (
                        <li 
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`list-group-item d-flex justify-content-between align-items-center py-3 border-bottom ${borderClass} ${snapshot.isDragging ? 'shadow-lg rounded' : ''}`}
                          style={{ 
                            ...provided.draggableProps.style,
                            backgroundColor: isDark ? (snapshot.isDragging ? '#2d2d36' : 'transparent') : (snapshot.isDragging ? '#f8f9fa' : 'transparent')
                          }}
                        >
                          <div className="d-flex align-items-center gap-3 w-100">
                            
                            <div {...provided.dragHandleProps} className="p-1" style={{ cursor: 'grab' }}>
                              <FiMenu className={`${isDark ? 'text-secondary' : 'text-muted'} opacity-50`} size={20} />
                            </div>
                            
                            {editandoId === cat.id ? (
                              <input 
                                type="text" 
                                className={`form-control form-control-sm ${inputClass} w-75`}
                                value={nomeEditado}
                                onChange={(e) => setNomeEditado(e.target.value)}
                                autoFocus
                              />
                            ) : (
                              <div className="d-flex align-items-center gap-2">
                                {/* Bolinha colorida puxando diretamente a cor cadastrada no banco */}
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: cat.corHex || '#6b7280' }} />
                                <span className={isDark ? 'text-light' : 'text-dark'}>{cat.nome}</span>
                              </div>
                            )}
                          </div>

                          <div className="d-flex gap-2 ms-2">
                            {editandoId === cat.id ? (
                              <>
                                <button className="btn btn-link p-0 text-success shadow-none" onClick={() => salvarEdicao(cat)}><FiCheck size={18} /></button>
                                <button className="btn btn-link p-0 text-secondary shadow-none" onClick={() => setEditandoId(null)}><FiX size={18} /></button>
                              </>
                            ) : (
                              <>
                                <button className="btn btn-link p-0 text-secondary opacity-75 shadow-none" onClick={() => iniciarEdicao(cat)}><FiEdit2 size={16} /></button>
                                <button className="btn btn-link p-0 text-danger opacity-75 shadow-none ms-2" onClick={() => handleExcluir(cat.id)}><FiTrash2 size={16} /></button>
                              </>
                            )}
                          </div>
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>

          {categorias.length === 0 && (
            <div className={`text-center py-4 ${isDark ? 'text-light opacity-50' : 'text-muted'}`}>
              Nenhuma categoria cadastrada.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GerenciarCategorias;