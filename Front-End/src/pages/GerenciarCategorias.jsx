import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { FiArrowLeft, FiTrash2, FiPlus, FiEdit2, FiCheck, FiX, FiMenu } from 'react-icons/fi';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import categoriasService from '../api/categoriasService';

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

  const bgClass = isDark ? '#121214' : '#f0f2f5';
  const textClass = isDark ? 'text-white' : 'text-dark';
  const borderClass = isDark ? 'border-secondary border-opacity-25' : 'border-light-subtle';
  const inputClass = isDark ? "bg-transparent text-white border-secondary shadow-none" : "bg-transparent text-dark border-light-subtle shadow-none";

  return (
    <div style={{ backgroundColor: bgClass, minHeight: '100vh', transition: 'all 0.3s ease-in-out' }}>
      
      <div className={`d-flex align-items-center p-4 border-bottom ${borderClass}`}>
        <button onClick={() => navigate(-1)} className={`btn btn-link p-0 text-decoration-none shadow-none ${textClass}`}>
          <FiArrowLeft size={24} />
        </button>
        <h5 className={`mb-0 ms-3 fw-bold ${textClass}`}>Gerenciar Categorias</h5>
      </div>

      <div className="p-4 container">
        <p className={`small mb-4 ${isDark ? 'text-light opacity-75' : 'text-secondary'}`}>
          Adicione, edite ou altere a prioridade e a cor das suas categorias.
        </p>

        <form onSubmit={handleAdicionar} className="d-flex gap-2 mb-4">
          <select 
            value={tipoNovaCategoria} 
            onChange={(e) => setTipoNovaCategoria(e.target.value)}
            className={`form-select ${inputClass}`}
            style={{ width: '110px', flexShrink: 0 }}
            disabled={isSubmitting}
          >
            <option value="despesa" className={isDark ? "bg-dark" : ""}>Despesa</option>
            <option value="receita" className={isDark ? "bg-dark" : ""}>Receita</option>
          </select>
          
          {/* NOVO LAYOUT: Caixa de cor separada, igual ao botão de '+' */}
          <div 
            className={`d-flex align-items-center justify-content-center border ${isDark ? 'border-secondary border-opacity-50' : 'border-light-subtle'} rounded`}
            style={{ 
              width: '42px', 
              flexShrink: 0, 
              position: 'relative', 
              overflow: 'hidden',
              backgroundColor: isDark ? 'transparent' : '#fff'
            }}
            title="Escolher cor"
          >
            {/* A bolinha visual */}
            <div 
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: corNovaCategoria,
                boxShadow: isDark ? '0 0 0 1px rgba(255,255,255,0.1)' : '0 0 0 1px rgba(0,0,0,0.1)'
              }}
            />
            {/* Input invisível cobrindo toda a caixa para facilitar o clique */}
            <input 
              type="color" 
              value={corNovaCategoria}
              onChange={(e) => setCorNovaCategoria(e.target.value)}
              style={{
                opacity: 0,
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                cursor: 'pointer'
              }}
              disabled={isSubmitting}
            />
          </div>

          <input 
            type="text" 
            placeholder="Nome..." 
            value={novaCategoria}
            onChange={(e) => setNovaCategoria(e.target.value)}
            className={`form-control ${inputClass} flex-grow-1`}
            disabled={isSubmitting}
          />

          <button 
            type="submit" 
            className={`btn border shadow-sm d-flex align-items-center justify-content-center ${isDark ? 'btn-outline-light border-secondary' : 'btn-light border-light-subtle'}`}
            style={{ width: '42px', flexShrink: 0 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="spinner-border spinner-border-sm" role="status"><span className="visually-hidden">...</span></div>
            ) : (<FiPlus />)}
          </button>
        </form>

        <div>
          <DragDropContext onDragEnd={handleOnDragEnd}>
            <Droppable droppableId="categorias-lista">
              {(provided) => (
                <ul 
                  className="list-unstyled mt-3" 
                  {...provided.droppableProps} 
                  ref={provided.innerRef}
                >
                  {categoriasFiltradas.map((cat, index) => (
                    <Draggable key={String(cat.id)} draggableId={String(cat.id)} index={index}>
                      {(provided, snapshot) => (
                        <li 
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`d-flex justify-content-between align-items-center p-3 rounded-3 mb-2 border ${snapshot.isDragging ? 'shadow-lg' : 'shadow-sm'} ${textClass}`} 
                          style={{ 
                            ...provided.draggableProps.style,
                            backgroundColor: isDark ? (snapshot.isDragging ? '#2d2d36' : '#1a1a1e') : (snapshot.isDragging ? '#ffffff' : '#ffffff'),
                            borderColor: isDark ? (snapshot.isDragging ? '#3d3d44' : '#2d2d36') : (snapshot.isDragging ? '#dee2e6' : '#dee2e6') 
                          }}
                        >
                          <div className="d-flex align-items-center gap-3 w-100">
                            <div {...provided.dragHandleProps} className="p-1" style={{ cursor: 'grab' }}>
                              <FiMenu className={`${isDark ? 'text-secondary' : 'text-muted'} opacity-50`} size={20} />
                            </div>
                            
                            {editandoId === cat.id ? (
                              <div className="d-flex align-items-center gap-2 w-100 pe-2">
                                {/* Caixa de cor separada também no modo de edição */}
                                <div 
                                  className={`d-flex align-items-center justify-content-center border ${isDark ? 'border-secondary border-opacity-50' : 'border-light-subtle'} rounded`}
                                  style={{ 
                                    width: '36px', 
                                    height: '32px',
                                    flexShrink: 0, 
                                    position: 'relative', 
                                    overflow: 'hidden',
                                    backgroundColor: isDark ? 'transparent' : '#fff'
                                  }}
                                >
                                  <div 
                                    style={{
                                      width: '14px',
                                      height: '14px',
                                      borderRadius: '50%',
                                      backgroundColor: corEditada,
                                      boxShadow: isDark ? '0 0 0 1px rgba(255,255,255,0.1)' : '0 0 0 1px rgba(0,0,0,0.1)'
                                    }}
                                  />
                                  <input 
                                    type="color" 
                                    value={corEditada}
                                    onChange={(e) => setCorEditada(e.target.value)}
                                    style={{
                                      opacity: 0,
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      width: '100%',
                                      height: '100%',
                                      cursor: 'pointer'
                                    }}
                                  />
                                </div>
                                <input 
                                  type="text" 
                                  className={`form-control form-control-sm ${inputClass} flex-grow-1`}
                                  value={nomeEditado}
                                  onChange={(e) => setNomeEditado(e.target.value)}
                                  autoFocus
                                />
                              </div>
                            ) : (
                              <div className="d-flex align-items-center gap-2">
                                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: cat.corHex || '#6b7280' }} />
                                <span>{cat.nome}</span>
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

          {categoriasFiltradas.length === 0 && (
            <div className={`text-center py-4 ${isDark ? 'text-light opacity-50' : 'text-muted'}`}>
              Nenhuma categoria de {tipoNovaCategoria} cadastrada.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GerenciarCategorias;