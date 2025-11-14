import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { eventosService, dashboardService, pedidosService } from '../services/api';
import Header from '../components/Header';
import Loading from '../components/Loading';
import PizzaProgress, { MeiaPizzaProgress } from '../components/PizzaProgress';
import { 
  Pizza, Users, DollarSign, Calendar, TrendingUp, AlertCircle, 
  Edit, Trash2, Zap, BarChart2, PieChart 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [eventoAtivo, setEventoAtivo] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [agrupamento, setAgrupamento] = useState(null);
  const [oportunidades, setOportunidades] = useState(null);
  const [meuPedido, setMeuPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('resumo');

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [eventoRes, pedidosRes] = await Promise.all([
        eventosService.getAtivo(),
        pedidosService.getMeusPedidos().catch(() => ({ data: [] }))
      ]);

      const evento = eventoRes.data;
      setEventoAtivo(evento);

      const pedidoEvento = pedidosRes.data.find(p => p.evento_id === evento.id);
      setMeuPedido(pedidoEvento || null);

      const [dashboardRes, agrupamentoRes, oportunidadesRes] = await Promise.all([
        dashboardService.getEvento(evento.id),
        dashboardService.getAgrupamentoInteligente(evento.id),
        dashboardService.getOportunidades(evento.id)
      ]);

      setDashboardData(dashboardRes.data);
      setAgrupamento(agrupamentoRes.data);
      setOportunidades(oportunidadesRes.data);

      setError('');
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Não há evento ativo no momento. Aguarde o próximo!');
      } else {
        console.error("Erro ao carregar dados:", err);
        setError('Erro ao carregar dados do dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditarPedido = () => {
    navigate('/fazer-pedido', { state: { editando: true, pedidoId: meuPedido.id } });
  };

  const handleCancelarPedido = async () => {
    if (!confirm('Deseja realmente cancelar seu pedido?')) return;
    
    try {
      await pedidosService.cancel(meuPedido.id);
      alert('Pedido cancelado com sucesso!');
      loadData();
    } catch (err) {
      alert('Erro ao cancelar pedido');
    }
  };

  const renderLoading = () => <Loading message="Carregando dashboard..." />;

  const renderError = () => (
    <div>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="card text-center animate-fadeIn">
          <AlertCircle size={64} className="text-secondary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Ops!</h2>
          <p className="text-text-secondary">{error}</p>
        </div>
      </div>
    </div>
  );

  const renderStatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="card bg-gradient-to-br from-primary to-primary-hover text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80">Participantes</p>
            <p className="text-3xl font-bold">{dashboardData?.total_participantes || 0}</p>
          </div>
          <Users size={48} className="opacity-50" />
        </div>
      </div>

      <div className="card bg-gradient-to-br from-secondary to-secondary-hover text-text-primary">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80">Pizzas Completas</p>
            <p className="text-3xl font-bold">{agrupamento?.total_pizzas_completas || 0}</p>
          </div>
          <Pizza size={48} className="opacity-50" />
        </div>
      </div>

      <div className="card bg-gradient-to-br from-text-secondary to-text-primary text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80">Pedidos</p>
            <p className="text-3xl font-bold">{dashboardData?.total_pedidos || 0}</p>
          </div>
          <TrendingUp size={48} className="opacity-50" />
        </div>
      </div>

      {isAdmin() && (
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">Valor Total (Admin)</p>
              <p className="text-3xl font-bold">
                R$ {dashboardData?.valor_total_evento.toFixed(2) || '0.00'}
              </p>
            </div>
            <DollarSign size={48} className="opacity-50" />
          </div>
        </div>
      )}
    </div>
  );

  const renderMeuPedido = () => (
    <div className="card mt-8 lg:mt-0 animate-fadeIn">
      {meuPedido ? (
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <h2 className="text-2xl font-bold mb-3 sm:mb-0 text-text-primary">Meu Pedido</h2>
            <div className="flex space-x-2 w-full sm:w-auto">
              <button
                onClick={handleEditarPedido}
                className="btn-secondary flex-1 sm:flex-none flex items-center justify-center space-x-2"
              >
                <Edit size={20} />
                <span>Editar</span>
              </button>
              <button
                onClick={handleCancelarPedido}
                className="btn-outline flex-1 sm:flex-none flex items-center justify-center space-x-2 text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
              >
                <Trash2 size={20} />
                <span>Cancelar</span>
              </button>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 font-semibold mb-2">✅ Pedido realizado!</p>
            <div className="space-y-2">
              {meuPedido.itens.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-text-secondary">{item.quantidade}x {item.sabor_nome}</span>
                  <span className="text-text-primary font-medium">R$ {item.subtotal.toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-green-200 pt-2 mt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Frete</span>
                  <span className="text-text-primary font-medium">R$ {meuPedido.valor_frete.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg mt-2">
                  <span className="text-text-primary">Total</span>
                  <span className="text-text-primary">R$ {(meuPedido.valor_total + meuPedido.valor_frete).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-text-primary">Faça seu Pedido!</h2>
          <p className="text-text-secondary mb-6">
            Você ainda não fez seu pedido para este evento.
          </p>
          <button
            onClick={() => navigate('/fazer-pedido')}
            className="btn-primary text-lg px-8 py-3"
          >
            Fazer Pedido Agora
          </button>
        </div>
      )}
    </div>
  );

  const renderOportunidades = () => (
    <div className="card animate-fadeIn">
      <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2 text-text-primary">
        <Zap className="text-secondary" />
        <span>Oportunidades!</span>
      </h2>
      <p className="text-text-secondary mb-6">
        Ajude a completar as pizzas! Estes sabores estão quase lá:
      </p>
      {oportunidades && oportunidades.oportunidades.length > 0 ? (
        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
          {oportunidades.oportunidades.map(op => (
            <div key={op.sabor_id} className="border-l-4 border-secondary pl-4 py-2 bg-yellow-50 rounded-r-lg">
              <p className="font-bold text-lg text-text-primary">{op.sabor_nome}</p>
              <p className="text-text-secondary">
                Faltam <span className="text-2xl font-bold text-primary">{op.pedacos_para_completar}</span> pedaços!
              </p>
              <p className="text-sm text-gray-500">
                (Atualmente com {op.total_pedacos_atual} de 8)
              </p>
              <button
                onClick={() => navigate('/fazer-pedido')}
                className="btn-primary text-sm mt-2"
              >
                Pedir agora!
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-text-secondary py-8">
          {oportunidades?.mensagem || "Nenhuma oportunidade no momento. Seja o primeiro!"}
        </p>
      )}
    </div>
  );

  const renderPizzasEmTempoReal = () => {
    if (!agrupamento || (
         agrupamento.pizzas_inteiras.length === 0 &&
         agrupamento.pizzas_meio_a_meio.length === 0 &&
         agrupamento.pedacos_avulsos.length === 0
       )) {
      return (
        <div className="card text-center py-12 animate-fadeIn">
           <Pizza size={48} className="mx-auto text-gray-400 mb-4" />
           <h3 className="text-xl font-semibold">Nenhum pedido ainda</h3>
           <p className="text-text-secondary">Seja o primeiro a pedir e monte a primeira pizza!</p>
        </div>
      );
    }

    const pizzasPorSabor = {};

    agrupamento.pizzas_inteiras.forEach(pizza => {
      if (!pizzasPorSabor[pizza.sabor]) {
        pizzasPorSabor[pizza.sabor] = { inteiras: 0, avulsos: 0 };
      }
      pizzasPorSabor[pizza.sabor].inteiras += pizza.quantidade;
    });

    agrupamento.pedacos_avulsos.forEach(avulso => {
      if (!pizzasPorSabor[avulso.sabor]) {
        pizzasPorSabor[avulso.sabor] = { inteiras: 0, avulsos: 0 };
      }
      pizzasPorSabor[avulso.sabor].avulsos = avulso.pedacos;
    });

    return (
      <div className="animate-fadeIn space-y-8">
        {agrupamento.pizzas_meio_a_meio.length > 0 && (
          <div className="card">
            <h2 className="text-2xl font-bold mb-4 text-text-primary">Pizzas Meio a Meio</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {agrupamento.pizzas_meio_a_meio.map((pizza, idx) => (
                <MeiaPizzaProgress
                  key={`meia-${idx}`}
                  sabor1={pizza.sabor1}
                  sabor2={pizza.sabor2}
                />
              ))}
            </div>
          </div>
        )}
        
        {Object.keys(pizzasPorSabor).sort().map(sabor => (
          <div key={sabor} className="card">
            <h2 className="text-2xl font-bold mb-4 text-text-primary">{sabor}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: pizzasPorSabor[sabor].inteiras }).map((_, i) => (
                <PizzaProgress 
                  key={`inteira-${sabor}-${i}`}
                  sabor={`${sabor} (${i + 1})`}
                  total_pedacos={8}
                />
              ))}
              
              {pizzasPorSabor[sabor].avulsos > 0 && (
                <PizzaProgress
                  sabor={sabor}
                  total_pedacos={pizzasPorSabor[sabor].avulsos}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) return renderLoading();
  if (error) return renderError();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-fadeIn">
          <h1 className="text-4xl font-bold text-text-primary mb-2">
            {eventoAtivo.nome || `PIZZADA DO LELO`}
          </h1>
          <p className="text-text-secondary flex items-center space-x-2">
            <Calendar size={16} />
            <span>
              Pedidos até: {new Date(eventoAtivo.data_limite).toLocaleString('pt-BR')}
            </span>
          </p>
        </div>

        {renderStatsCards()}

        <div className="mb-6">
          <div className="flex border-b border-border-color">
            <button
              onClick={() => setActiveTab('resumo')}
              className={`flex items-center space-x-2 py-3 px-6 font-semibold transition-colors
                ${activeTab === 'resumo'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-text-secondary hover:text-text-primary'
                }`}
            >
              <BarChart2 size={20} />
              <span>Resumo</span>
            </button>
            <button
              onClick={() => setActiveTab('pizzas')}
              className={`flex items-center space-x-2 py-3 px-6 font-semibold transition-colors
                ${activeTab === 'pizzas'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-text-secondary hover:text-text-primary'
                }`}
            >
              <PieChart size={20} />
              <span>Pizzas em Tempo Real</span>
            </button>
          </div>
        </div>

        {activeTab === 'resumo' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {renderOportunidades()}
            {renderMeuPedido()}
          </div>
        ) : (
          renderPizzasEmTempoReal()
        )}

      </div>
    </div>
  );
};

export default Dashboard;