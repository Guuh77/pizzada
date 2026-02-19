import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Não redirecionar em rotas de redefinição de senha
    if (
      error.response?.status === 401 &&
      !window.location.pathname.includes('/reset-password')
    ) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Autenticação
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (data) => api.post('/auth/forgot-password', data), // (data agora é { email: "..." })
  resetPassword: (data) => api.post('/auth/reset-password', data),   // (data agora é { email, codigo, nova_senha })
  getAllUsers: () => api.get('/auth/usuarios'), // NOVO - lista todos os usuários (admin only)
};

// Sabores
export const saboresService = {
  getAll: (apenasAtivos = true) => api.get(`/sabores/?apenas_ativos=${apenasAtivos}`),
  getById: (id) => api.get(`/sabores/${id}`),
  create: (data) => api.post('/sabores/', data),
  update: (id, data) => api.put(`/sabores/${id}`, data),
  delete: (id) => api.delete(`/sabores/${id}`),
};

// Eventos
export const eventosService = {
  getAll: () => api.get('/eventos/'),
  getAtivo: () => api.get('/eventos/ativo'), // Singular - mantém para compatibilidade
  getAtivos: () => api.get('/eventos/ativos'), // NOVO - Plural, retorna array com NORMAL + RELAMPAGO
  getById: (id) => api.get(`/eventos/${id}`),
  create: (data) => api.post('/eventos/', data),
  update: (id, data) => api.put(`/eventos/${id}`, data),
  delete: (id) => api.delete(`/eventos/${id}`),
  getResumo: (id) => api.get(`/eventos/${id}/resumo`),
};

// Pedidos
export const pedidosService = {
  create: (data) => api.post('/pedidos/', data),
  getMeusPedidos: () => api.get('/pedidos/meus-pedidos'),
  getById: (id) => api.get(`/pedidos/${id}`),
  getPorEvento: (eventoId) => api.get(`/pedidos/evento/${eventoId}/todos`),
  update: (id, data) => api.put(`/pedidos/${id}`, data),
  editar: (id, data) => api.put(`/pedidos/${id}/editar`, data),
  editarAdmin: (id, data) => api.put(`/pedidos/${id}/admin-editar`, data),
  adminCriarPedido: (usuarioId, data) => api.post(`/pedidos/admin-criar?usuario_id=${usuarioId}`, data),
  cancel: (id) => api.delete(`/pedidos/${id}`),
};

// Dashboard
export const dashboardService = {
  getEvento: (eventoId) => api.get(`/dashboard/evento/${eventoId}`),
  getOportunidades: (eventoId) => api.get(`/dashboard/evento/${eventoId}/oportunidades`),
  getSugestoes: (eventoId) => api.get(`/dashboard/evento/${eventoId}/sugestao-combinacao`),
  getAgrupamentoInteligente: (eventoId) => api.get(`/dashboard/evento/${eventoId}/agrupamento-inteligente`),
};

// Pagamentos
export const pagamentosService = {
  getMeuHistorico: () => api.get('/pagamentos/meu-historico'),
  getRelatorio: (eventoId) => api.get(`/pagamentos/evento/${eventoId}/relatorio`),
  verificarDisponibilidade: (eventoId) => api.get(`/pagamentos/evento/${eventoId}/disponivel`),
  marcarComoPago: (eventoId, pedidoId) => api.put(`/pagamentos/evento/${eventoId}/marcar-pago/${pedidoId}`),
  desmarcarComoPago: (eventoId, pedidoId) => api.put(`/pagamentos/evento/${eventoId}/desmarcar-pago/${pedidoId}`),
  informarPagamento: (eventoId, pedidoId) => api.put(`/pagamentos/evento/${eventoId}/informar-pagamento/${pedidoId}`),
  getPagamentosPendentes: () => api.get('/pagamentos/pendentes'),
};

// Pizza Config (Admin overrides)
export const pizzaConfigService = {
  get: (eventoId) => api.get(`/pizza-config/${eventoId}`),
  save: (eventoId, config) => api.put(`/pizza-config/${eventoId}`, config),
};

// Votações
export const votacoesService = {
  // Admin
  criar: (data) => api.post('/votacoes/', data),
  listarTodas: () => api.get('/votacoes/'),
  atualizar: (id, data) => api.put(`/votacoes/${id}`, data),
  deletar: (id) => api.delete(`/votacoes/${id}`),
  obterDetalhes: (id) => api.get(`/votacoes/${id}/detalhes`),
  // User
  listarAtivas: () => api.get('/votacoes/ativas'),
  listarResultadosVisiveis: () => api.get('/votacoes/resultados-visiveis'),
  obter: (id) => api.get(`/votacoes/${id}`),
  votar: (id, escolhaId) => api.post(`/votacoes/${id}/votar`, { escolha_id: escolhaId }),
};

export default api;