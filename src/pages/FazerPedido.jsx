import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { saboresService, eventosService, pedidosService } from '../services/api';
import Header from '../components/Header';
import Loading from '../components/Loading';
import { Plus, Minus, ShoppingCart, AlertCircle, Edit } from 'lucide-react';

const FazerPedido = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sabores, setSabores] = useState([]);
  const [eventosAtivos, setEventosAtivos] = useState([]);
  const [eventoSelecionado, setEventoSelecionado] = useState(null);
  const [carrinho, setCarrinho] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [modoEdicao, setModoEdicao] = useState(false);
  const [pedidoEditando, setPedidoEditando] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [saboresRes, eventosRes] = await Promise.all([
        saboresService.getAll(true),
        eventosService.getAtivos()
      ]);

      setSabores(saboresRes.data);
      const eventos = eventosRes.data;
      setEventosAtivos(eventos);

      if (eventos.length === 0) {
        setError('Não há evento ativo no momento');
        setLoading(false);
        return;
      }

      // Seleciona o evento vindo do state ou o primeiro da lista
      let eventoInicial = eventos[0];
      if (location.state?.eventoId) {
        const evt = eventos.find(e => e.id === location.state.eventoId);
        if (evt) eventoInicial = evt;
      }
      setEventoSelecionado(eventoInicial);

      if (location.state?.editando && location.state?.pedidoId) {
        setModoEdicao(true);
        const pedidoRes = await pedidosService.getById(location.state.pedidoId);
        setPedidoEditando(pedidoRes.data);

        // Selecionar o evento correto do pedido sendo editado
        const eventoDoPedido = eventos.find(e => e.id === pedidoRes.data.evento_id);
        if (eventoDoPedido) {
          setEventoSelecionado(eventoDoPedido);
        }

        const carrinhoExistente = {};
        pedidoRes.data.itens.forEach(item => {
          carrinhoExistente[item.sabor_id] = item.quantidade;
        });
        setCarrinho(carrinhoExistente);
      }
    } catch (err) {
      setError('Erro ao carregar dados ou não há evento ativo');
    } finally {
      setLoading(false);
    }
  };

  const adicionarPedaco = (saborId) => {
    setCarrinho(prev => {
      const qtdAtual = prev[saborId] || 0;
      if (qtdAtual >= 8) return prev;
      return {
        ...prev,
        [saborId]: qtdAtual + 1
      };
    });
  };

  const removerPedaco = (saborId) => {
    setCarrinho(prev => {
      const novo = { ...prev };
      if (novo[saborId] > 0) {
        novo[saborId]--;
        if (novo[saborId] === 0) delete novo[saborId];
      }
      return novo;
    });
  };

  const calcularTotal = () => {
    let total = 1.00; // Frete
    sabores.forEach(sabor => {
      if (carrinho[sabor.id]) {
        total += sabor.preco_pedaco * carrinho[sabor.id];
      }
    });
    return total;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const totalPedacos = Object.values(carrinho).reduce((a, b) => a + b, 0);
    if (totalPedacos === 0) {
      setError('Adicione pelo menos um pedaço ao carrinho');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const itens = Object.entries(carrinho).map(([saborId, quantidade]) => ({
        sabor_id: parseInt(saborId),
        quantidade: quantidade
      }));

      const pedidoData = {
        evento_id: eventoSelecionado.id,
        itens: itens
      };

      if (modoEdicao) {
        await pedidosService.editar(pedidoEditando.id, pedidoData);
        alert('Pedido atualizado com sucesso!');
      } else {
        await pedidosService.create(pedidoData);
        alert('Pedido realizado com sucesso!');
      }

      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || `Erro ao ${modoEdicao ? 'atualizar' : 'fazer'} pedido`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;

  const totalCarrinho = Object.values(carrinho).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Seletor de Eventos (se múltiplos) */}
          {eventosAtivos.length > 1 && (
            <div className="card mb-6">
              <label className="label">
                {modoEdicao ? 'Evento do Pedido (Não editável):' : 'Escolha o evento para fazer seu pedido:'}
              </label>
              <select
                className="input disabled:opacity-50 disabled:cursor-not-allowed"
                value={eventoSelecionado?.id || ''}
                disabled={modoEdicao}
                onChange={(e) => {
                  const evt = eventosAtivos.find(ev => ev.id === parseInt(e.target.value));
                  setEventoSelecionado(evt);
                }}
              >
                {eventosAtivos.map(evt => (
                  <option key={evt.id} value={evt.id}>
                    {evt.tipo === 'RELAMPAGO' ? '⚡ ' : ''}
                    {evt.nome || `Pizzada de ${new Date(evt.data_evento).toLocaleDateString('pt-BR')}`}
                    {' - Pedidos até ' + new Date(evt.data_limite).toLocaleString('pt-BR')}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center space-x-3 mb-8 animate-fadeIn">
            {modoEdicao && <Edit size={32} className="text-primary" />}
            <h1 className="text-4xl font-bold text-text-primary">
              {modoEdicao ? 'Editar Pedido' : 'Fazer Pedido'}
            </h1>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center space-x-2 animate-fadeIn">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {modoEdicao && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 animate-fadeIn">
            ℹ️ Você está editando seu pedido. Faça as alterações e clique em "Atualizar Pedido".
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de Sabores */}
          {/* Lista de Sabores */}
          <div className="lg:col-span-2 animate-fadeIn" style={{ animationDelay: '0.2s' }}>

            {/* Seção Salgadas */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-text-primary">
                🍕 Pizzas Salgadas
                <span className="text-sm px-3 py-1 rounded-full bg-orange-500/20 text-orange-500">
                  {sabores.filter(s => s.tipo !== 'DOCE').length} opções
                </span>
              </h2>
              <div className="space-y-4">
                {sabores.filter(s => s.tipo !== 'DOCE').map(sabor => (
                  <div key={sabor.id} className="card flex flex-col sm:flex-row items-start sm:items-center justify-between hover:shadow-xl transition-shadow">
                    <div className="flex-1 mb-4 sm:mb-0">
                      <h3 className="text-xl font-bold text-text-primary">{sabor.nome}</h3>
                      {sabor.descricao && (
                        <p className="text-sm text-text-secondary mb-1 italic">{sabor.descricao}</p>
                      )}
                      <p className="text-text-secondary">R$ {sabor.preco_pedaco.toFixed(2)} por pedaço</p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => removerPedaco(sabor.id)}
                        className="p-3 bg-border-color hover:bg-gray-300 rounded-full transition-colors disabled:opacity-50"
                        disabled={!carrinho[sabor.id]}
                      >
                        <Minus size={20} />
                      </button>

                      <span className="text-2xl font-bold w-12 text-center text-text-primary">
                        {carrinho[sabor.id] || 0}
                      </span>

                      <button
                        onClick={() => adicionarPedaco(sabor.id)}
                        className="p-3 bg-primary hover:bg-primary-hover text-white rounded-full transition-colors disabled:opacity-50"
                        disabled={(carrinho[sabor.id] || 0) >= 8}
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Seção Doces */}
            {sabores.some(s => s.tipo === 'DOCE') && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-text-primary mt-8 border-t border-border-color pt-8">
                  🍫 Pizzas Doces
                  <span className="text-sm px-3 py-1 rounded-full bg-pink-500/20 text-pink-500">
                    {sabores.filter(s => s.tipo === 'DOCE').length} opções
                  </span>
                </h2>
                <div className="space-y-4">
                  {sabores.filter(s => s.tipo === 'DOCE').map(sabor => (
                    <div key={sabor.id} className="card flex flex-col sm:flex-row items-start sm:items-center justify-between hover:shadow-xl transition-shadow border-l-4 border-pink-500">
                      <div className="flex-1 mb-4 sm:mb-0">
                        <h3 className="text-xl font-bold text-text-primary">{sabor.nome}</h3>
                        {sabor.descricao && (
                          <p className="text-sm text-text-secondary mb-1 italic">{sabor.descricao}</p>
                        )}
                        <p className="text-text-secondary">R$ {sabor.preco_pedaco.toFixed(2)} por pedaço</p>
                      </div>

                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => removerPedaco(sabor.id)}
                          className="p-3 bg-border-color hover:bg-gray-300 rounded-full transition-colors disabled:opacity-50"
                          disabled={!carrinho[sabor.id]}
                        >
                          <Minus size={20} />
                        </button>

                        <span className="text-2xl font-bold w-12 text-center text-text-primary">
                          {carrinho[sabor.id] || 0}
                        </span>

                        <button
                          onClick={() => adicionarPedaco(sabor.id)}
                          className="p-3 bg-pink-500 hover:bg-pink-600 text-white rounded-full transition-colors disabled:opacity-50"
                          disabled={(carrinho[sabor.id] || 0) >= 8}
                        >
                          <Plus size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Resumo do Pedido */}
          <div className="lg:col-span-1 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
            <div className="card sticky top-28">
              <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2 text-text-primary">
                <ShoppingCart />
                <span>Resumo</span>
              </h2>

              {totalCarrinho === 0 ? (
                <p className="text-text-secondary text-center py-8">
                  Seu carrinho está vazio
                </p>
              ) : (
                <>
                  <div className="space-y-2 mb-4 max-h-48 overflow-y-auto pr-2">
                    {Object.entries(carrinho).map(([saborId, qtd]) => {
                      if (qtd === 0) return null;
                      const sabor = sabores.find(s => s.id === parseInt(saborId));
                      if (!sabor) return null;

                      return (
                        <div key={saborId} className="flex justify-between text-sm">
                          <span className="text-text-secondary">{qtd}x {sabor.nome}</span>
                          <span className="text-text-primary font-medium">R$ {(sabor.preco_pedaco * qtd).toFixed(2)}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-border-color pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">Frete</span>
                      <span className="text-text-primary font-medium">R$ 1.00</span>
                    </div>

                    <div className="flex justify-between text-xl font-bold text-text-primary">
                      <span>Total</span>
                      <span>R$ {calcularTotal().toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleSubmit}
                    className="btn-primary w-full mt-6"
                    disabled={submitting || totalCarrinho === 0}
                  >
                    {submitting ? 'Processando...' :
                      modoEdicao ? 'Atualizar Pedido' : 'Confirmar Pedido'}
                  </button>

                  {modoEdicao && (
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="btn-outline w-full mt-3"
                    >
                      Cancelar Edição
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FazerPedido;