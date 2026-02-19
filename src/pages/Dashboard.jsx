import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { eventosService, dashboardService, pedidosService, saboresService, votacoesService } from '../services/api';
import Header from '../components/Header';
import Loading from '../components/Loading';
import PizzaProgress, { MeiaPizzaProgress } from '../components/PizzaProgress';
import {
  Pizza, Users, DollarSign, Calendar, TrendingUp, AlertCircle,
  Edit, Trash2, Zap, BarChart2, PieChart, Vote, Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [eventosAtivos, setEventosAtivos] = useState([]);
  const [eventoSelecionado, setEventoSelecionado] = useState(null);
  const selectedEventIdRef = useRef(null);

  const [dashboardData, setDashboardData] = useState(null);
  const [agrupamento, setAgrupamento] = useState(null);
  const [oportunidades, setOportunidades] = useState(null);
  const [meuPedido, setMeuPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('resumo');
  const [flavorTypes, setFlavorTypes] = useState({});

  // Estados para Votações
  const [votacoesAtivas, setVotacoesAtivas] = useState([]);
  const [votacoesResultados, setVotacoesResultados] = useState([]);
  const [votando, setVotando] = useState(null);

  useEffect(() => {
    selectedEventIdRef.current = eventoSelecionado?.id;
  }, [eventoSelecionado]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [eventosRes, pedidosRes, saboresRes, votacoesAtivasRes, votacoesResultadosRes] = await Promise.all([
        eventosService.getAtivos(),
        pedidosService.getMeusPedidos().catch(() => ({ data: [] })),
        saboresService.getAll(false).catch(() => ({ data: [] })),
        votacoesService.listarAtivas().catch(() => ({ data: [] })),
        votacoesService.listarResultadosVisiveis().catch(() => ({ data: [] }))
      ]);

      setVotacoesAtivas(votacoesAtivasRes.data);
      setVotacoesResultados(votacoesResultadosRes.data);

      const typeMap = {};
      saboresRes.data.forEach(s => {
        typeMap[s.nome] = s.tipo;
      });
      setFlavorTypes(typeMap);

      const eventos = eventosRes.data;
      setEventosAtivos(eventos);

      if (eventos.length === 0) {
        setError('Não há evento ativo no momento. Aguarde o próximo!');
        setLoading(false);
        return;
      }
      let eventoAtual;
      const currentId = selectedEventIdRef.current;

      if (currentId) {
        eventoAtual = eventos.find(e => e.id === currentId);
        if (!eventoAtual) {
          eventoAtual = eventos[0];
        }
      } else {
        eventoAtual = eventos[0];
      }
      setEventoSelecionado(eventoAtual);

      const pedidoEvento = pedidosRes.data.find(p => p.evento_id === eventoAtual.id);
      setMeuPedido(pedidoEvento || null);

      const [dashboardRes, agrupamentoRes, oportunidadesRes] = await Promise.all([
        dashboardService.getEvento(eventoAtual.id),
        dashboardService.getAgrupamentoInteligente(eventoAtual.id),
        dashboardService.getOportunidades(eventoAtual.id)
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

  const changeEvento = async (evento) => {
    try {
      setEventoSelecionado(evento);
      selectedEventIdRef.current = evento.id;
      setMeuPedido(null);
      setLoading(true);

      const [dashboardRes, agrupamentoRes, oportunidadesRes, pedidosRes] = await Promise.all([
        dashboardService.getEvento(evento.id),
        dashboardService.getAgrupamentoInteligente(evento.id),
        dashboardService.getOportunidades(evento.id),
        pedidosService.getMeusPedidos()
      ]);

      setDashboardData(dashboardRes.data);
      setAgrupamento(agrupamentoRes.data);
      setOportunidades(oportunidadesRes.data);

      const pedidoEvento = pedidosRes.data.find(p => p.evento_id === evento.id);
      setMeuPedido(pedidoEvento || null);
    } catch (err) {
      console.error("Erro ao trocar evento:", err);
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

  // Handler para votar
  const handleVotar = async (votacaoId, escolhaId) => {
    setVotando(votacaoId);
    try {
      await votacoesService.votar(votacaoId, escolhaId);
      // Recarregar votações
      const [ativasRes, resultadosRes] = await Promise.all([
        votacoesService.listarAtivas(),
        votacoesService.listarResultadosVisiveis()
      ]);
      setVotacoesAtivas(ativasRes.data);
      setVotacoesResultados(resultadosRes.data);
    } catch (err) {
      alert(err.response?.data?.detail || 'Erro ao votar');
    } finally {
      setVotando(null);
    }
  };

  const renderLoading = () => <Loading message="Carregando dashboard..." />;

  const renderError = () => (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="card text-center animate-fadeIn border-red-500/30 bg-red-500/10 backdrop-blur-md">
          <div className="flex justify-center animate-pulse text-primary mb-4">
            <Pizza size={64} />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-white">Ops!</h2>
          <p className="text-text-secondary">{error}</p>
        </div>

        {/* Votações aparecem mesmo sem evento ativo */}
        {renderVotacoes()}
      </div>
    </div>
  );

  const StatCard = ({ title, value, icon: Icon, gradient, delay }) => (
    <div
      className={`card ${gradient} text-white transform hover:scale-105 transition-all duration-300 animate-fadeIn`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between relative z-10">
        <div>
          <p className="text-sm opacity-80 font-medium uppercase tracking-wider">{title}</p>
          <p className="text-4xl font-bold mt-1 drop-shadow-lg">{value}</p>
        </div>
        <div className="p-3 bg-white/10 rounded-full backdrop-blur-sm">
          <Icon size={32} className="text-white" />
        </div>
      </div>
      <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
    </div>
  );

  const renderStatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      <StatCard
        title="Participantes"
        value={dashboardData?.total_participantes || 0}
        icon={Users}
        gradient="bg-gradient-to-br from-primary to-primary-hover shadow-neon-primary"
        delay={100}
      />
      <StatCard
        title="Pizzas Completas"
        value={agrupamento?.total_pizzas_completas || 0}
        icon={Pizza}
        gradient="bg-gradient-to-br from-secondary to-secondary-hover shadow-neon-secondary text-black"
        delay={200}
      />
      <StatCard
        title="Pedidos"
        value={dashboardData?.total_pedidos || 0}
        icon={TrendingUp}
        gradient="bg-gradient-to-br from-purple-600 to-purple-800 shadow-lg"
        delay={300}
      />
      {isAdmin() && (
        <StatCard
          title="Valor Total"
          value={`R$ ${dashboardData?.valor_total_evento.toFixed(2) || '0.00'}`}
          icon={DollarSign}
          gradient="bg-gradient-to-br from-green-500 to-green-700 shadow-lg"
          delay={400}
        />
      )}
    </div>
  );

  const renderMeuPedido = () => (
    <div className="card mt-8 lg:mt-0 animate-fadeIn border-l-4 border-primary">
      {meuPedido ? (
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
              <Pizza className="text-primary" /> Meu Pedido
            </h2>
            <div className="flex space-x-3 w-full sm:w-auto mt-4 sm:mt-0">
              <button
                onClick={handleEditarPedido}
                className="btn-secondary flex-1 sm:flex-none flex items-center justify-center space-x-2 text-sm"
              >
                <Edit size={18} />
                <span>Editar</span>
              </button>
              <button
                onClick={handleCancelarPedido}
                className="btn-outline flex-1 sm:flex-none flex items-center justify-center space-x-2 text-red-400 border-red-400 hover:bg-red-500 hover:text-white text-sm"
              >
                <Trash2 size={18} />
                <span>Cancelar</span>
              </button>
            </div>
          </div>
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4 text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="font-semibold uppercase tracking-wide text-sm">Pedido Confirmado</span>
            </div>
            <div className="space-y-3">
              {meuPedido.itens.map((item, index) => (
                <div key={index} className="flex justify-between text-base border-b border-white/10 pb-2 last:border-0">
                  <span className="text-text-secondary">{item.quantidade}x <span className="text-text-primary">{item.sabor_nome}</span></span>
                  <span className="text-text-primary font-bold">R$ {item.subtotal.toFixed(2)}</span>
                </div>
              ))}
              <div className="pt-4 mt-2 border-t border-white/20">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-text-secondary">Frete</span>
                  <span className="text-text-primary">R$ {meuPedido.valor_frete.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-xl text-white">
                  <span>Total</span>
                  <span>R$ {(meuPedido.valor_total + meuPedido.valor_frete).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-float">
            <Pizza size={40} className="text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-text-primary">Fome de Pizza?</h2>
          <p className="text-text-secondary mb-6 max-w-md mx-auto">
            Você ainda não fez seu pedido nessa Pizzada! Não deixe para a última hora!
          </p>
          <button
            onClick={() => navigate('/fazer-pedido', { state: { eventoId: eventoSelecionado?.id } })}
            className="btn-primary text-lg px-10 py-3 shadow-neon-primary"
          >
            Fazer Pedido Agora
          </button>
        </div>
      )}
    </div>
  );

  const renderOportunidades = () => (
    <div className="card animate-fadeIn border-l-4 border-secondary">
      <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2 text-text-primary">
        <Zap className="text-secondary animate-pulse" />
        <span>Oportunidades</span>
      </h2>
      <p className="text-text-secondary mb-6">
        Complete as pizzas e ajude a galera!
      </p>
      {oportunidades && oportunidades.oportunidades.length > 0 ? (
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {oportunidades.oportunidades.map(op => (
            <div key={op.sabor_id} className="group relative overflow-hidden bg-secondary/10 border border-secondary/30 rounded-xl p-4 transition-all hover:bg-secondary/20">
              <div className="flex justify-between items-center relative z-10">
                <div>
                  <p className="font-bold text-lg text-white group-hover:text-secondary transition-colors">{op.sabor_nome}</p>
                  <p className="text-text-secondary text-sm mt-1">
                    Faltam <span className="text-xl font-bold text-secondary">{op.pedacos_para_completar}</span> pedaços
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (meuPedido) {
                      navigate('/fazer-pedido', {
                        state: {
                          editando: true,
                          pedidoId: meuPedido.id,
                          eventoId: eventoSelecionado?.id
                        }
                      });
                    } else {
                      navigate('/fazer-pedido', {
                        state: {
                          eventoId: eventoSelecionado?.id
                        }
                      });
                    }
                  }}
                  className="btn-secondary text-xs py-2 px-4 shadow-none hover:shadow-neon-secondary"
                >
                  Pedir!
                </button>
              </div>
              {/* Progress Bar Background */}
              <div
                className="absolute bottom-0 left-0 h-1 bg-secondary/50 transition-all duration-1000"
                style={{ width: `${(op.total_pedacos_atual / 8) * 100}%` }}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-white/5 rounded-xl border border-white/5">
          <p className="text-text-secondary">
            {oportunidades?.mensagem || "Nenhuma oportunidade no momento. Seja o primeiro!"}
          </p>
        </div>
      )}
    </div>
  );

  // Componente de Votação
  const VotingCard = ({ votacao, isResult = false }) => {
    const [alterandoVoto, setAlterandoVoto] = useState(false);
    const jaVotou = votacao.usuario_votou || isResult;
    const podeAlterar = jaVotou && !isResult; // Votou mas votação ainda aberta

    const mostrarOpcoes = (!jaVotou && !isResult) || alterandoVoto;

    return (
      <div className="card animate-fadeIn border-l-4 border-blue-500">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-text-primary">
          <Vote className="text-blue-400" />
          {votacao.titulo}
        </h2>

        {isResult && (
          <div className="text-sm text-text-secondary mb-4">
            Votação encerrada • Resultado até {new Date(votacao.data_resultado_ate).toLocaleString('pt-BR')}
          </div>
        )}

        {mostrarOpcoes ? (
          // Opções para votar (ou alterar voto)
          <div className="space-y-3">
            <p className="text-text-secondary mb-4">
              {alterandoVoto
                ? 'Selecione a nova opção para alterar seu voto:'
                : 'Escolha uma opção abaixo para votar:'}
            </p>
            {votacao.escolhas?.map((escolha) => {
              const isMyVote = escolha.id === votacao.escolha_usuario;
              return (
                <button
                  key={escolha.id}
                  onClick={() => {
                    handleVotar(votacao.id, escolha.id);
                    setAlterandoVoto(false);
                  }}
                  disabled={votando === votacao.id}
                  className={`w-full p-4 text-left border rounded-xl transition-all flex justify-between items-center group disabled:opacity-50 ${isMyVote && alterandoVoto
                      ? 'bg-blue-500/20 border-blue-500'
                      : 'bg-white/5 hover:bg-blue-500/20 border-border-color hover:border-blue-500'
                    }`}
                >
                  <span className="font-medium text-text-primary group-hover:text-blue-400 flex items-center gap-2">
                    {escolha.texto}
                    {isMyVote && alterandoVoto && <span className="text-xs bg-blue-500/20 px-2 py-0.5 rounded-full text-blue-400">Voto atual</span>}
                  </span>
                  <Check size={20} className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              );
            })}
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-text-secondary">
                Limite: {new Date(votacao.data_limite).toLocaleString('pt-BR')}
              </p>
              {alterandoVoto && (
                <button
                  onClick={() => setAlterandoVoto(false)}
                  className="text-xs text-text-secondary hover:text-text-primary transition-colors"
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>
        ) : (
          // Resultados
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <Check size={16} />
                <span>Você já votou! Total: {votacao.total_votos} votos</span>
              </div>
              {podeAlterar && (
                <button
                  onClick={() => setAlterandoVoto(true)}
                  className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded-full border border-blue-500/30"
                >
                  <Edit size={12} />
                  Alterar Voto
                </button>
              )}
            </div>
            {podeAlterar && (
              <p className="text-xs text-text-secondary -mt-2">
                Você pode alterar seu voto até {new Date(votacao.data_limite).toLocaleString('pt-BR')}
              </p>
            )}
            {votacao.escolhas?.map((escolha) => {
              const isMyVote = escolha.id === votacao.escolha_usuario;
              return (
                <div key={escolha.id} className="relative">
                  <div className={`flex justify-between items-center mb-1 ${isMyVote ? 'text-blue-400' : 'text-text-primary'}`}>
                    <span className="font-medium flex items-center gap-2">
                      {escolha.texto}
                      {isMyVote && <span className="text-xs bg-blue-500/20 px-2 py-0.5 rounded-full">Seu voto</span>}
                    </span>
                    <span className="font-bold">{escolha.porcentagem}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${isMyVote ? 'bg-blue-500' : 'bg-primary'}`}
                      style={{ width: `${escolha.porcentagem}%` }}
                    />
                  </div>
                  <span className="text-xs text-text-secondary">{escolha.votos} votos</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderVotacoes = () => {
    // Combinar votações ativas (que o usuário ainda não votou ou votou)
    // com resultados visíveis de votações encerradas
    const todasVotacoes = [
      ...votacoesAtivas.map(v => ({ ...v, isResult: false })),
      ...votacoesResultados.filter(r => !votacoesAtivas.find(a => a.id === r.id)).map(v => ({ ...v, isResult: true }))
    ];

    if (todasVotacoes.length === 0) return null;

    return (
      <div className="mt-8 space-y-6">
        {todasVotacoes.map(votacao => (
          <VotingCard key={votacao.id} votacao={votacao} isResult={votacao.isResult} />
        ))}
      </div>
    );
  };

  const renderPizzasEmTempoReal = () => {
    if (!agrupamento || (
      agrupamento.pizzas_inteiras.length === 0 &&
      agrupamento.pizzas_meio_a_meio.length === 0 &&
      agrupamento.pedacos_avulsos.length === 0
    )) {
      return (
        <div className="card text-center py-16 animate-fadeIn">
          <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <Pizza size={48} className="text-gray-500" />
          </div>
          <h3 className="text-2xl font-bold text-text-primary mb-2">Nenhum pedido ainda</h3>
          <p className="text-text-secondary">Seja o pioneiro desta Pizzada!</p>
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
      <div className="animate-fadeIn space-y-10">
        {agrupamento.pizzas_meio_a_meio.length > 0 && (
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h2 className="text-2xl font-bold mb-6 text-text-primary flex items-center gap-2">
              <span className="w-2 h-8 bg-secondary rounded-full"></span>
              Pizzas Meio a Meio
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {agrupamento.pizzas_meio_a_meio.map((pizza, idx) => {
                const type1 = flavorTypes[pizza.sabor1] || 'SALGADA';
                const type2 = flavorTypes[pizza.sabor2] || 'SALGADA';

                let color1 = "#FACC15"; // Yellow
                let color2 = "#EF4444"; // Red

                if (type1 === 'DOCE') color1 = "#5D4037"; // Brown
                if (type2 === 'DOCE') color2 = "#5D4037"; // Brown

                // Special case: both sweet
                if (type1 === 'DOCE' && type2 === 'DOCE') {
                  color1 = "#D946EF"; // Neon Purple
                  color2 = "#5D4037"; // Brown
                }

                return (
                  <div key={`meia-${idx}`} className="transform hover:scale-105 transition-transform duration-300">
                    <MeiaPizzaProgress
                      sabor1={pizza.sabor1}
                      sabor2={pizza.sabor2}
                      color1={color1}
                      color2={color2}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {Object.keys(pizzasPorSabor).sort().map(sabor => {
          const type = flavorTypes[sabor] || 'SALGADA';
          const color = type === 'DOCE' ? "#5D4037" : "#FACC15";

          return (
            <div key={sabor} className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h2 className="text-2xl font-bold mb-6 text-text-primary flex items-center gap-2">
                <span className="w-2 h-8 bg-primary rounded-full"></span>
                {sabor}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {Array.from({ length: pizzasPorSabor[sabor].inteiras }).map((_, i) => (
                  <div key={`inteira-${sabor}-${i}`} className="transform hover:scale-105 transition-transform duration-300">
                    <PizzaProgress
                      sabor={`${sabor} (${i + 1})`}
                      total_pedacos={8}
                      color={color}
                    />
                  </div>
                ))}

                {pizzasPorSabor[sabor].avulsos > 0 && (
                  <div className="transform hover:scale-105 transition-transform duration-300">
                    <PizzaProgress
                      sabor={sabor}
                      total_pedacos={pizzasPorSabor[sabor].avulsos}
                      color={color}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) return renderLoading();
  if (error) return renderError();

  return (
    <div className="min-h-screen pb-12">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Seletor de Eventos (se houver múltiplos) */}
        {eventosAtivos.length > 1 && (
          <div className="mb-8 flex flex-wrap gap-3">
            {eventosAtivos.map(evt => (
              <button
                key={evt.id}
                onClick={() => changeEvento(evt)}
                className={`px-6 py-3 rounded-lg transition-all font-semibold ${eventoSelecionado?.id === evt.id
                  ? 'bg-primary text-white shadow-neon-primary scale-105'
                  : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
              >
                {evt.tipo === 'RELAMPAGO' && '⚡ '}
                {evt.nome || `Pizzada de ${new Date(evt.data_evento).toLocaleDateString('pt-BR')}`}
              </button>
            ))}
          </div>
        )}

        <div className="mb-10 animate-fadeIn text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start space-x-3 mb-3">
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary drop-shadow-sm">
              {eventoSelecionado.nome || `PIZZADA DO LELO`}
            </h1>
            {eventoSelecionado.tipo === 'RELAMPAGO' && (
              <span className="text-4xl animate-pulse">⚡</span>
            )}
          </div>
          <div className="inline-flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/10">
            <Calendar size={18} className="text-secondary" />
            <span className="text-text-primary font-medium">
              Pedidos até: <span className="text-white">{new Date(eventoSelecionado.data_limite).toLocaleString('pt-BR')}</span>
            </span>
          </div>
        </div>

        {renderStatsCards()}

        <div className="mb-8">
          <div className="flex justify-center lg:justify-start border-b border-white/10">
            <button
              onClick={() => setActiveTab('resumo')}
              className={`flex items-center space-x-2 py-4 px-8 font-bold text-lg transition-all relative
                ${activeTab === 'resumo'
                  ? 'text-primary'
                  : 'text-text-secondary hover:text-text-primary'
                }`}
            >
              <BarChart2 size={24} />
              <span>Resumo</span>
              {activeTab === 'resumo' && (
                <span className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full shadow-neon-primary"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('pizzas')}
              className={`flex items-center space-x-2 py-4 px-8 font-bold text-lg transition-all relative
                ${activeTab === 'pizzas'
                  ? 'text-secondary'
                  : 'text-text-secondary hover:text-text-primary'
                }`}
            >
              <PieChart size={24} />
              <span>Pizzas em Tempo Real</span>
              {activeTab === 'pizzas' && (
                <span className="absolute bottom-0 left-0 w-full h-1 bg-secondary rounded-t-full shadow-neon-secondary"></span>
              )}
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

        {/* Votações - aparecem abaixo do conteúdo principal */}
        {renderVotacoes()}

      </div>
    </div>
  );
};

export default Dashboard;