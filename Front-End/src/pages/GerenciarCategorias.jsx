import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { FiArrowLeft, FiTrash2, FiPlus, FiEdit2, FiCheck, FiX, FiMenu, FiChevronDown } from 'react-icons/fi';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import categoriasService from '../api/categoriasService';
import './ConfigPages.css';

function GerenciarCategorias({ temaAtual }) {
  const isDark = temaAtual === 'dark';
  const navigate = useNavigate();
  const { usuarioLogado } = useContext(AuthContext);

  const [categorias, setCategorias] = useState([]);
  const [novaCategoria, setNovaCategoria] = useState('');
  const [tipoNovaCategoria, setTipoNovaCategoria] = useState('despesa');
  const [corNovaCategoria, setCorNovaCategoria] = useState('#3b82f6');
  
  const [editandoId, setEditandoId] = useState(null);
  const [nomeEditado, setNomeEditado] = useState('');
  const [corEditada, setCorEditada] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (usuarioLogado?.id) {
      carregarCategorias();
    }
  }, [usuarioLogado]);

  useEffect(() => {
    setCorNovaCategoria(tipoNovaCategoria === 'receita' ? '#10b981' : '#3b82f6');
  }, [tipoNovaCategoria]);

  const carregarCategorias = async () => {
    try {
      const data = await categoriasService.getCategorias(usuarioLogado.id);
      setCategorias(data);
    } catch (error) {
      console.error("Erro ao carregar categorias", error);
    }
  };

  const categoriasFiltradas = categorias
    .filter(cat => cat.tipo === tipoNovaCategoria)
    .sort((a, b) => a.ordem - b.ordem);

  const handleAdicionar = async (e) => {
    e.preventDefault();
    if (!novaCategoria.trim() || isSubmitting) return;
    setIsSubmitting(true);
      
    const novaOrdem = categoriasFiltradas.length + 1;

    try {
      await categoriasService.createCategoria({ 
        nome: novaCategoria, 
        tipo: tipoNovaCategoria,
        usuarioId: usuarioLogado.id,
        corHex: corNovaCategoria, 
        ordem: novaOrdem
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
      try {
        await categoriasService.deleteCategoria(id);
        carregarCategorias();
      } catch (error) {
        console.error("Erro ao excluir", error);
      }
    }
  };

  const iniciarEdicao = (cat) => {
    setEditandoId(cat.id);
    setNomeEditado(cat.nome);
    setCorEditada(cat.corHex || '#6b7280'); 
  };

  const salvarEdicao = async (cat) => {
    if (!nomeEditado.trim()) {
      setEditandoId(null);
      return;
    }
    try {
      await categoriasService.updateCategoria(cat.id, { ...cat, nome: nomeEditado, corHex: corEditada });
      setEditandoId(null);
      carregarCategorias();
    } catch (error) {
      console.error("Erro ao atualizar", error);
    }
  };

  const handleOnDragEnd = async (result) => {
    if (!result.destination) return;
    if (result.source.index === result.destination.index) return;

    const itemsVisiveis = Array.from(categoriasFiltradas);
    const [reorderedItem] = itemsVisiveis.splice(result.source.index, 1);
    itemsVisiveis.splice(result.destination.index, 0, reorderedItem);

    const updatedVisibleItems = itemsVisiveis.map((cat, index) => ({
      ...cat,
      ordem: index + 1
    }));

    const itemsOcultos = categorias.filter(cat => cat.tipo !== tipoNovaCategoria);
    setCategorias([...itemsOcultos, ...updatedVisibleItems]);

    const promises = updatedVisibleItems.map(cat => {
      const originalCat = categoriasFiltradas.find(c => c.id === cat.id);
      if (originalCat && originalCat.ordem !== cat.ordem) {
        return categoriasService.updateCategoria(cat.id, { ...cat, ordem: cat.ordem });
      }
      return null;
    }).filter(p => p !== null);

    try {
      await Promise.all(promises);
    } catch (error) {
      console.error("Erro ao salvar ordem", error);
      carregarCategorias();
    }
  };

  return (
    <div className={`config-page ${isDark ? 'theme-dark' : 'theme-light'}`} data-bs-theme={temaAtual}>
      
      <div className="config-header">
        <button 
          onClick={() => navigate(-1)} 
          className={`btn btn-link p-0 border-0 mb-3 shadow-none ${isDark ? 'text-white' : 'text-dark'}`}
        >
          <FiArrowLeft size={24} />
        </button>
        <h1 className={isDark ? 'text-white' : 'text-dark'}>Gerenciar Categorias</h1>
        <p>Adicione, edite ou altere a prioridade e a cor das suas categorias.</p>
      </div>

      <div className="config-section">
        
        <form onSubmit={handleAdicionar} className="config-card p-2 d-flex gap-2 mb-4 align-items-center">
          
          <div className="position-relative d-flex align-items-center" style={{ width: 'auto', minWidth: '95px', flexShrink: 0 }}>
            <select 
              value={tipoNovaCategoria} 
              onChange={(e) => setTipoNovaCategoria(e.target.value)}
              className="config-select m-0 pe-4"
              style={{ 
                appearance: 'none', 
                WebkitAppearance: 'none', 
                backgroundColor: 'transparent',
                border: 'none',
                color: isDark ? '#e5e7eb' : '#1e293b',
                fontSize: '15px',
                fontWeight: '400',
                outline: 'none',
                cursor: 'pointer'
              }}
              disabled={isSubmitting}
            >
              <option value="despesa" className={isDark ? "bg-dark" : ""}>Despesa</option>
              <option value="receita" className={isDark ? "bg-dark" : ""}>Receita</option>
            </select>
            <FiChevronDown 
              className="position-absolute" 
              style={{ right: '4px', pointerEvents: 'none', color: '#9ca3af' }} 
              size={18} 
            />
          </div>
          
          <label 
            className="d-flex align-items-center justify-content-center mb-0 ms-1"
            style={{ width: '36px', padding: 0, flexShrink: 0, cursor: 'pointer' }}
            title="Escolher cor"
          >
            <div 
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: corNovaCategoria,
                boxShadow: isDark ? '0 0 0 1px rgba(255,255,255,0.15)' : '0 0 0 1px rgba(0,0,0,0.15)'
              }}
            />
            <input 
              type="color" 
              value={corNovaCategoria}
              onChange={(e) => setCorNovaCategoria(e.target.value)}
              style={{ 
                position: 'absolute', opacity: 0, width: '1px', height: '1px', 
                padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', border: 0 
              }}
              disabled={isSubmitting}
            />
          </label>

          <input 
            type="text" 
            placeholder="Nome da categoria..." 
            value={novaCategoria}
            onChange={(e) => setNovaCategoria(e.target.value)}
            className="flex-grow-1 bg-transparent border-0 shadow-none px-1"
            style={{ color: isDark ? '#e5e7eb' : '#1e293b', outline: 'none', fontSize: '15px' }}
            disabled={isSubmitting}
          />

          <button 
            type="submit" 
            className="btn btn-link p-0 text-success shadow-none d-flex align-items-center justify-content-center me-2"
            style={{ width: '32px', flexShrink: 0 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="spinner-border spinner-border-sm" role="status"><span className="visually-hidden">...</span></div>
            ) : (<FiPlus size={22} />)}
          </button>
        </form>

        <p className="config-section-title">Suas Categorias</p>

        <div>
          <DragDropContext onDragEnd={handleOnDragEnd}>
            <Droppable droppableId="categorias-lista">
              {(provided) => (
                <ul 
                  className="list-unstyled m-0" 
                  {...provided.droppableProps} 
                  ref={provided.innerRef}
                >
                  {categoriasFiltradas.map((cat, index) => (
                    <Draggable key={String(cat.id)} draggableId={String(cat.id)} index={index}>
                      {(provided, snapshot) => (
                        <li 
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`config-card mb-2 ${snapshot.isDragging ? 'shadow-lg' : ''}`} 
                          style={{ 
                            ...provided.draggableProps.style,
                            ...(snapshot.isDragging && { 
                              backgroundColor: isDark ? '#2d2d36' : '#f8fafc',
                              borderColor: isDark ? '#3d3d44' : '#e2e8f0' 
                            })
                          }}
                        >
                          <div className="config-card-left w-100 gap-2">
                            <div {...provided.dragHandleProps} className="p-1" style={{ cursor: 'grab' }}>
                              <FiMenu className="config-icon opacity-50" size={20} />
                            </div>
                            
                            {editandoId === cat.id ? (
                              <div className="d-flex align-items-center gap-2 w-100 pe-2">
                                <label 
                                  className="d-flex align-items-center justify-content-center mb-0"
                                  style={{ width: '32px', height: '32px', padding: 0, flexShrink: 0, cursor: 'pointer' }}
                                >
                                  <div 
                                    style={{
                                      width: '14px', height: '14px', borderRadius: '50%', backgroundColor: corEditada,
                                      boxShadow: isDark ? '0 0 0 1px rgba(255,255,255,0.15)' : '0 0 0 1px rgba(0,0,0,0.15)'
                                    }}
                                  />
                                  <input 
                                    type="color" 
                                    value={corEditada}
                                    onChange={(e) => setCorEditada(e.target.value)}
                                    style={{ position: 'absolute', opacity: 0, width: '1px', height: '1px', overflow: 'hidden' }}
                                  />
                                </label>
                                <input 
                                  type="text" 
                                  className="flex-grow-1 bg-transparent border-0 shadow-none"
                                  style={{ color: isDark ? '#e5e7eb' : '#1e293b', outline: 'none', borderBottom: '1px solid #10b981' }}
                                  value={nomeEditado}
                                  onChange={(e) => setNomeEditado(e.target.value)}
                                  autoFocus
                                />
                              </div>
                            ) : (
                              <div className="d-flex align-items-center gap-2 ms-1">
                                <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: cat.corHex || '#6b7280' }} />
                                <span className="config-text-main">{cat.nome}</span>
                              </div>
                            )}
                          </div>

                          <div className="d-flex gap-3 ms-2">
                            {editandoId === cat.id ? (
                              <>
                                <button className="btn btn-link p-0 text-success shadow-none" onClick={() => salvarEdicao(cat)}><FiCheck size={20} /></button>
                                <button className="btn btn-link p-0 text-secondary shadow-none" onClick={() => setEditandoId(null)}><FiX size={20} /></button>
                              </>
                            ) : (
                              <>
                                <button className="btn btn-link p-0 text-secondary opacity-75 shadow-none" onClick={() => iniciarEdicao(cat)}><FiEdit2 size={18} /></button>
                                <button className="btn btn-link p-0 text-danger opacity-75 shadow-none" onClick={() => handleExcluir(cat.id)}><FiTrash2 size={18} /></button>
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

          {categoriasFiltradas.length === 0 && (
            <div className="text-center py-4 config-text-sub">
              Nenhuma categoria de {tipoNovaCategoria} cadastrada.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GerenciarCategorias;