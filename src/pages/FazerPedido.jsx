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
  const [eventoAtivo, setEventoAtivo] = useState(null);
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
      const [saboresRes, eventoRes] = await Promise.all([
        saboresService.getAll(true),
        eventosService.getAtivo()
      ]);
      
      setSabores(saboresRes.data);
      setEventoAtivo(eventoRes.data);

      if (location.state?.editando && location.state?.pedidoId) {
        setModoEdicao(true);
        const pedidoRes = await pedidosService.getById(location.state.pedidoId);
        setPedidoEditando(pedidoRes.data);
        
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
        evento_id: eventoAtivo.id,
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
        <div className="flex items-center space-x-3 mb-8 animate-fadeIn">
          {modoEdicao && <Edit size={32} className="text-primary" />}
          <h1 className="text-4xl font-bold text-text-primary">
            {modoEdicao ? 'Editar Pedido' : 'Fazer Pedido'}
          </h1>
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
          <div className="lg:col-span-2 space-y-4 animate-fadeIn" style={{animationDelay: '0.2s'}}>
            {sabores.map(sabor => (
              <div key={sabor.id} className="card flex flex-col sm:flex-row items-start sm:items-center justify-between hover:shadow-xl transition-shadow">
                <div className="flex-1 mb-4 sm:mb-0">
                  <h3 className="text-xl font-bold text-text-primary">{sabor.nome}</h3>
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

          {/* Resumo do Pedido */}
          <div className="lg:col-span-1 animate-fadeIn" style={{animationDelay: '0.4s'}}>
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