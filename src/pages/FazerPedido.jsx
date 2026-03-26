import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { saboresService, eventosService, pedidosService } from '../services/api';
import Header from '../components/Header';
import Loading from '../components/Loading';
import { Plus, Minus, ShoppingCart, AlertCircle, Edit, Star, ArrowRight } from 'lucide-react';

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
  const [favoritos, setFavoritos] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [saboresRes, eventosRes, favoritosRes] = await Promise.all([
        saboresService.getAll(true),
        eventosService.getAtivos(),
        pedidosService.getMeusFavoritos().catch(() => ({ data: [] }))
      ]);
      setFavoritos(favoritosRes.data);
      setSabores(saboresRes.data);
      const eventos = eventosRes.data;
      setEventosAtivos(eventos);

      if (eventos.length === 0) {
        setError('Não há evento ativo no momento');
        setLoading(false);
        return;
      }

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
      return { ...prev, [saborId]: qtdAtual + 1 };
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
    let total = 1.00;
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

      const pedidoData = { evento_id: eventoSelecionado.id, itens };

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
  const isComplete = totalCarrinho === 8;

  const FlavorItem = ({ sabor, accentColor = 'primary' }) => {
    const qtd = carrinho[sabor.id] || 0;
    return (
      <div className={`group flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-border-color hover:border-${accentColor}/30 bg-card transition-all duration-200 ${qtd > 0 ? `border-l-4 border-l-${accentColor}` : ''}`}>
        <div className="flex-1 mb-3 sm:mb-0">
          <h3 className="font-bold text-text-primary group-hover:text-primary transition-colors">
            {sabor.nome}
          </h3>
          {sabor.descricao && (
            <p className="text-xs text-text-secondary mt-0.5 max-w-md">{sabor.descricao}</p>
          )}
          <p className={`text-sm font-semibold mt-1 text-${accentColor}`}>R$ {sabor.preco_pedaco.toFixed(2)} / pedaço</p>
        </div>
        <div className="flex items-center gap-1 bg-background rounded-lg p-1 border border-border-color">
          <button
            onClick={() => removerPedaco(sabor.id)}
            className="p-2 rounded-md hover:bg-card text-text-secondary hover:text-text-primary transition-colors disabled:opacity-20"
            disabled={qtd === 0}
          >
            <Minus size={18} />
          </button>
          <span className="text-xl font-bold w-10 text-center text-text-primary tabular-nums">
            {qtd}
          </span>
          <button
            onClick={() => adicionarPedaco(sabor.id)}
            className={`p-2 rounded-md bg-${accentColor}/10 text-${accentColor} hover:bg-${accentColor} hover:text-white transition-colors disabled:opacity-20`}
            disabled={qtd >= 8}
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <div className="flex-1 max-w-[1600px] w-full mx-auto flex flex-col lg:flex-row relative">
        {/* Left — Flavor Selection */}
        <div className="flex-1 p-4 sm:p-6 lg:p-10 pb-32 lg:pb-10">
          
          {/* Event Selector */}
          {eventosAtivos.length > 1 && (
            <div className="card mb-8">
              <label className="label mb-3">
                {modoEdicao ? 'Evento vinculado' : 'Selecione o evento'}
              </label>
              <select
                className="input"
                value={eventoSelecionado?.id || ''}
                disabled={modoEdicao}
                onChange={(e) => {
                  const evt = eventosAtivos.find(ev => ev.id === parseInt(e.target.value));
                  setEventoSelecionado(evt);
                }}
              >
                {eventosAtivos.map(evt => (
                  <option key={evt.id} value={evt.id} className="bg-card">
                    {evt.tipo === 'RELAMPAGO' ? '⚡ ' : ''}
                    {evt.nome || `Pizzada - ${new Date(evt.data_evento).toLocaleDateString('pt-BR')}`}
                    {' (até ' + new Date(evt.data_limite).toLocaleString('pt-BR') + ')'}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-black text-text-primary tracking-tight flex items-center gap-3">
              {modoEdicao && <Edit className="text-primary" size={28} />}
              {modoEdicao ? 'Editar Pedido' : 'Fazer Pedido'}
            </h1>
            {modoEdicao && (
              <p className="text-sm text-secondary mt-2">Modo de edição ativado. Ajuste os sabores e confirme.</p>
            )}
          </div>

          {error && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg text-primary p-4 mb-6 font-medium flex items-start gap-3 text-sm animate-scaleIn">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-10">
            
            {/* Favoritos */}
            {favoritos.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                  <Star size={20} className="text-yellow-500 fill-yellow-500" />
                  Favoritos
                </h2>
                <div className="space-y-2">
                  {favoritos.map(fav => {
                    const sabor = sabores.find(s => s.id === fav.sabor_id);
                    if (!sabor) return null;
                    return <FlavorItem key={`fav-${sabor.id}`} sabor={sabor} accentColor="primary" />;
                  })}
                </div>
              </div>
            )}

            {/* Salgados */}
            <div>
              <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center justify-between">
                <span>Sabores Salgados</span>
                <span className="text-xs font-medium text-text-secondary bg-card px-3 py-1 rounded-full border border-border-color hidden sm:block">
                  {sabores.filter(s => s.tipo !== 'DOCE').length} opções
                </span>
              </h2>
              <div className="space-y-2">
                {sabores.filter(s => s.tipo !== 'DOCE').map(sabor => (
                  <FlavorItem key={sabor.id} sabor={sabor} accentColor="primary" />
                ))}
              </div>
            </div>

            {/* Doces */}
            {sabores.some(s => s.tipo === 'DOCE') && (
              <div>
                <h2 className="text-xl font-bold text-text-primary mb-4">
                  Sabores Doces 🍫
                </h2>
                <div className="space-y-2">
                  {sabores.filter(s => s.tipo === 'DOCE').map(sabor => (
                    <FlavorItem key={sabor.id} sabor={sabor} accentColor="secondary" />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right — Order Summary */}
        <div className="w-full lg:w-[380px] flex-shrink-0 lg:border-l border-border-color bg-card z-30 lg:min-h-screen relative">
          <div className="sticky top-0 p-6 lg:p-8 lg:pt-20 flex flex-col h-full lg:h-screen">
            
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-text-primary">Resumo</h2>
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <ShoppingCart size={20} className="text-primary" />
              </div>
            </div>

            <div className="flex justify-between items-baseline mb-6">
              <span className="text-xs text-text-secondary">Pedaços no carrinho</span>
              <span className={`text-2xl font-bold tabular-nums ${totalCarrinho > 0 ? 'text-primary' : 'text-text-secondary'}`}>{totalCarrinho}</span>
            </div>

            {totalCarrinho === 0 ? (
              <div className="flex-1 border border-dashed border-border-color rounded-xl flex items-center justify-center p-6">
                <p className="text-text-secondary text-sm text-center">
                  Selecione os sabores<br/>para montar seu pedido
                </p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto pr-2 space-y-2 mb-4">
                  {Object.entries(carrinho).map(([saborId, qtd]) => {
                    if (qtd === 0) return null;
                    const sabor = sabores.find(s => s.id === parseInt(saborId));
                    if (!sabor) return null;

                    return (
                      <div key={saborId} className="flex justify-between items-start text-sm pb-2 border-b border-border-color/50">
                        <span className="text-text-primary font-medium">
                          <span className="text-primary font-bold mr-1">{qtd}x</span> {sabor.nome}
                        </span>
                        <span className="text-text-secondary tabular-nums">R$ {(sabor.preco_pedaco * qtd).toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-border-color pt-4 space-y-2 mt-auto">
                  <div className="flex justify-between items-center text-sm text-text-secondary">
                    <span>Frete</span>
                    <span className="tabular-nums">R$ 1,00</span>
                  </div>
                  <div className="flex justify-between items-baseline pt-2">
                    <span className="font-bold text-text-primary">Total</span>
                    <span className="text-xl font-bold text-primary tabular-nums">R$ {calcularTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 space-y-3">
              <button
                onClick={handleSubmit}
                className={`w-full py-3.5 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${totalCarrinho > 0
                  ? 'btn-primary'
                  : 'bg-card border border-border-color text-text-secondary cursor-not-allowed opacity-60'}`}
                disabled={submitting || totalCarrinho === 0}
              >
                {submitting ? 'Processando...' : (modoEdicao ? 'Atualizar Pedido' : 'Registrar Pedido')}
                {!submitting && totalCarrinho > 0 && <ArrowRight size={16} />}
              </button>

              {modoEdicao && (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full py-2.5 rounded-lg font-medium text-xs border border-border-color text-text-secondary hover:bg-card transition-colors"
                >
                  Cancelar edição
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FazerPedido;