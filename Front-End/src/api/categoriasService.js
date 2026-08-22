import api from './axios'; // Importa a instância do axios já configurada (com baseURL, etc)

const categoriasService = {
  // Busca as categorias ativas e ordenadas de um usuário específico
  getCategorias: async (usuarioId) => {
    const response = await api.get(`/Categorias/usuario/${usuarioId}`);
    return response.data;
  },

  // Cria uma nova categoria
  createCategoria: async (categoriaData) => {
    const response = await api.post('/Categorias', categoriaData);
    return response.data;
  },

  // Atualiza uma categoria existente (nome, cor ou a ordem na lista)
  updateCategoria: async (id, categoriaData) => {
    const response = await api.put(`/Categorias/${id}`, categoriaData);
    return response.data;
  },

  // Oculta a categoria (Exclusão Lógica)
  deleteCategoria: async (id) => {
    const response = await api.delete(`/Categorias/${id}`);
    return response.data;
  },
};

export default categoriasService;