import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { eventosService, dashboardService, pedidosService } from '../services/api';
import Header from '../components/Header';
import Loading from '../components/Loading';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Pizza, Users, DollarSign, Calendar, TrendingUp, AlertCircle, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#E63946', '#F4A261', '#457B9D', '#2A9D8F', '#E9C46A', '#F77F00', '#06AED5', '#8338EC'];

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [eventoAtivo, setEventoAtivo] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [agrupamento, setAgrupamento] = useState(null);
  const [meuPedido, setMeuPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
    
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const eventoResponse = await eventosService.getAtivo();
      const evento = eventoResponse.data;
      setEventoAtivo(evento);

      const dashboardResponse = await dashboardService.getEvento(evento.id);
      setDashboardData(dashboardResponse.data);

      // Buscar agrupamento inteligente
      const agrupamentoResponse = await dashboardService.getAgrupamentoInteligente(evento.id);
      setAgrupamento(agrupamentoResponse.data);

      try {
        const pedidosResponse = await pedidosService.getMeusPedidos();
        const pedidoEvento = pedidosResponse.data.find(p => p.evento_id === evento.id);
        setMeuPedido(pedidoEvento);
      } catch (err) {
        setMeuPedido(null);
      }

      setError('');
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Não há evento ativo no momento. Aguarde o próximo!');
      } else {
        setError('Erro ao carregar dados');
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

  if (loading) {
    return <Loading message="Carregando dashboard..." />;
  }

  if (error) {
    return (
      <div>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="card text-center">
            <AlertCircle size={64} className="text-secondary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Nenhum Evento Ativo</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const chartData = dashboardData?.estatisticas_por_sabor.map(sabor => ({
    name: sabor.sabor_nome,
    value: sabor.total_pedacos,
    pizzasCompletas: sabor.pizzas_completas,
    pedacosRestantes: sabor.pedacos_restantes
  })) || [];

  const totalPizzas = agrupamento?.total_pizzas_completas || 0;

  return (
    <div className="min-h-screen bg-light">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-dark mb-2">
            {eventoAtivo.nome || 'Pizzada do Roger'}
          </h1>
          <p className="text-gray-600">
            Evento de {new Date(eventoAtivo.data_evento).toLocaleDateString('pt-BR')}
          </p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-primary to-primary/80 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Participantes</p>
                <p className="text-3xl font-bold">{dashboardData?.total_participantes || 0}</p>
              </div>
              <Users size={48} className="opacity-50" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-secondary to-secondary/80 text-dark">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Pizzas Completas</p>
                <p className="text-3xl font-bold">{totalPizzas}</p>
              </div>
              <Pizza size={48} className="opacity-50" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-accent to-accent/80 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Valor Total</p>
                <p className="text-3xl font-bold">
                  R$ {dashboardData?.valor_total_evento.toFixed(2) || '0.00'}
                </p>
              </div>
              <DollarSign size={48} className="opacity-50" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Pedidos</p>
                <p className="text-3xl font-bold">{dashboardData?.total_pedidos || 0}</p>
              </div>
              <TrendingUp size={48} className="opacity-50" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gráfico de Pizza */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-4">Distribuição de Pedidos</h2>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500">Ainda não há pedidos</p>
            )}
          </div>

          {/* Agrupamento Inteligente */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-4">Pizzas Organizadas</h2>
            <div className="space-y-4 max-h-[300px] overflow-y-auto">
              {/* Pizzas Inteiras */}
              {agrupamento?.pizzas_inteiras.map((pizza, idx) => (
                <div key={`inteira-${idx}`} className="border-l-4 border-green-500 pl-4 py-2">
                  <p className="font-bold text-green-700">
                    {pizza.quantidade}x Pizza{pizza.quantidade > 1 ? 's' : ''} Inteira{pizza.quantidade > 1 ? 's' : ''}
                  </p>
                  <p className="text-sm text-gray-600">{pizza.sabor} ({pizza.pedacos} pedaços)</p>
                </div>
              ))}

              {/* Pizzas Meio a Meio */}
              {agrupamento?.pizzas_meio_a_meio.map((pizza, idx) => (
                <div key={`meio-${idx}`} className="border-l-4 border-blue-500 pl-4 py-2">
                  <p className="font-bold text-blue-700">Pizza Meio a Meio</p>
                  <p className="text-sm text-gray-600">
                    {pizza.sabor1} + {pizza.sabor2} (8 pedaços)
                  </p>
                </div>
              ))}

              {/* Pedaços Avulsos */}
              {agrupamento?.pedacos_avulsos.map((avulso, idx) => (
                <div key={`avulso-${idx}`} className="border-l-4 border-yellow-500 pl-4 py-2">
                  <p className="font-bold text-yellow-700">
                    {avulso.tipo === 'meia_esperando' ? 'Meia Pizza Esperando' : 'Pedaços Avulsos'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {avulso.sabor}: {avulso.pedacos} pedaços
                    {avulso.faltam && (
                      <span className="text-primary font-semibold"> (faltam {avulso.faltam}!)</span>
                    )}
                  </p>
                </div>
              ))}

              {!agrupamento?.pizzas_inteiras.length && 
               !agrupamento?.pizzas_meio_a_meio.length && 
               !agrupamento?.pedacos_avulsos.length && (
                <p className="text-center text-gray-500">Nenhum pedido ainda</p>
              )}
            </div>
          </div>
        </div>

        {/* Meu Pedido */}
        <div className="card mt-8">
          {meuPedido ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Meu Pedido</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={handleEditarPedido}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <Edit size={20} />
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={handleCancelarPedido}
                    className="btn-outline flex items-center space-x-2 text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
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
                      <span>{item.quantidade}x {item.sabor_nome}</span>
                      <span>R$ {item.subtotal.toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between text-sm">
                      <span>Frete</span>
                      <span>R$ {meuPedido.valor_frete.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg mt-2">
                      <span>Total</span>
                      <span>R$ {(meuPedido.valor_total + meuPedido.valor_frete).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Faça seu Pedido!</h2>
              <p className="text-gray-600 mb-6">
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
      </div>
    </div>
  );
};

export default Dashboard;