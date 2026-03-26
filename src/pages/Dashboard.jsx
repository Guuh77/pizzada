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

  const handleVotar = async (votacaoId, escolhaId) => {
    setVotando(votacaoId);
    try {
      await votacoesService.votar(votacaoId, escolhaId);
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
        <div className="card text-center animate-fadeIn">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Pizza size={32} className="text-primary animate-pulse-soft" />
            </div>
          </div>
          <h2 className="text-xl font-bold mb-2 text-text-primary">Ops!</h2>
          <p className="text-text-secondary">{error}</p>
        </div>
        {renderVotacoes()}
      </div>
    </div>
  );

  const StatCard = ({ title, value, icon: Icon, delay }) => (
    <div
      className="card group animate-fadeIn hover:border-primary/30 transition-all duration-300"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
          <Icon size={20} className="text-primary" />
        </div>
      </div>
      <p className="text-xs font-medium text-text-secondary mb-1">{title}</p>
      <p className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary">{value}</p>
    </div>
  );

  const renderStatsCards = () => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard title="Participantes" value={dashboardData?.total_participantes || 0} icon={Users} delay={100} />
      <StatCard title="Pizzas Completas" value={agrupamento?.total_pizzas_completas || 0} icon={Pizza} delay={200} />
      <StatCard title="Pedidos" value={dashboardData?.total_pedidos || 0} icon={TrendingUp} delay={300} />
      {isAdmin() && (
        <StatCard title="Receita" value={`R$ ${(dashboardData?.valor_total_evento ?? 0).toFixed(2)}`} icon={DollarSign} delay={400} />
      )}
    </div>
  );

  const renderMeuPedido = () => (
    <div className="card animate-fadeIn border-l-4 border-primary">
      {meuPedido ? (
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b border-border-color">
            <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
              Meu Pedido
            </h2>
            <div className="flex gap-2 w-full sm:w-auto mt-3 sm:mt-0">
              <button
                onClick={handleEditarPedido}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-border-color text-text-primary hover:bg-card hover:border-primary text-sm font-medium transition-all"
              >
                <Edit size={14} />
                <span>Editar</span>
              </button>
              <button
                onClick={handleCancelarPedido}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-primary/30 text-primary hover:bg-primary/10 text-sm font-medium transition-all"
              >
                <Trash2 size={14} />
                <span>Cancelar</span>
              </button>
            </div>
          </div>
          <div className="space-y-3">
            {meuPedido.itens.map((item, index) => (
              <div key={index} className="flex justify-between text-sm border-b border-border-color/50 border-dashed pb-2 last:border-0">
                <span className="text-text-primary font-medium"><span className="text-primary font-bold mr-1">{item.quantidade}x</span> {item.sabor_nome}</span>
                <span className="text-text-secondary font-medium">R$ {item.subtotal.toFixed(2)}</span>
              </div>
            ))}
            <div className="pt-4 mt-2 border-t border-border-color">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-text-secondary">Frete</span>
                <span className="text-text-primary font-medium">R$ {meuPedido.valor_frete.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-baseline pt-2">
                <span className="text-lg font-bold text-text-primary">Total</span>
                <span className="text-2xl font-bold text-primary">R$ {(meuPedido.valor_total + meuPedido.valor_frete).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-10">
          <div className="w-16 h-16 rounded-2xl bg-card border border-border-color flex items-center justify-center mx-auto mb-4">
            <Pizza size={32} className="text-text-secondary" />
          </div>
          <h2 className="text-xl font-bold mb-2 text-text-primary">Faça seu pedido</h2>
          <p className="text-sm text-text-secondary mb-6">
            Você ainda não fez um pedido neste evento.
          </p>
          <button
            onClick={() => navigate('/fazer-pedido', { state: { eventoId: eventoSelecionado?.id } })}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Pizza size={18} />
            Fazer Pedido
          </button>
        </div>
      )}
    </div>
  );

  const renderOportunidades = () => (
    <div className="card animate-fadeIn border-l-4 border-secondary">
      <h2 className="text-xl font-bold mb-1 text-text-primary">Complete uma Pizza!</h2>
      <p className="text-sm text-text-secondary mb-6">
        Esses sabores estão quase fechando. Ajude a completar!
      </p>
      {oportunidades && oportunidades.oportunidades.length > 0 ? (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          {oportunidades.oportunidades.map(op => (
            <div key={op.sabor_id} className="group relative bg-background rounded-lg border border-border-color hover:border-secondary/50 transition-all overflow-hidden">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center relative z-10 p-4">
                <div className="mb-3 sm:mb-0">
                  <p className="font-bold text-text-primary group-hover:text-secondary transition-colors">{op.sabor_nome}</p>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Faltam <span className="text-secondary font-bold">{op.pedacos_para_completar}</span> pedaços
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (meuPedido) {
                      navigate('/fazer-pedido', {
                        state: { editando: true, pedidoId: meuPedido.id, eventoId: eventoSelecionado?.id }
                      });
                    } else {
                      navigate('/fazer-pedido', { state: { eventoId: eventoSelecionado?.id } });
                    }
                  }}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg bg-secondary/10 text-secondary hover:bg-secondary hover:text-white font-medium text-sm transition-all"
                >
                  Completar
                </button>
              </div>
              <div
                className="absolute bottom-0 left-0 h-1 bg-secondary/30 group-hover:bg-secondary/50 transition-all duration-700"
                style={{ width: `${(op.total_pedacos_atual / 8) * 100}%` }}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-background rounded-lg border border-dashed border-border-color">
          <p className="text-text-secondary text-sm">
            {oportunidades?.mensagem || "Nenhuma oportunidade disponível no momento"}
          </p>
        </div>
      )}
    </div>
  );

  const VotingCard = ({ votacao, isResult = false }) => {
    const [alterandoVoto, setAlterandoVoto] = useState(false);
    const jaVotou = votacao.usuario_votou || isResult;
    const podeAlterar = jaVotou && !isResult;
    const mostrarOpcoes = (!jaVotou && !isResult) || alterandoVoto;

    return (
      <div className="card animate-fadeIn border-l-4 border-blue-500">
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2 text-text-primary">
          <Vote className="text-blue-400" size={20} />
          {votacao.titulo}
        </h2>

        {isResult && (
          <div className="text-sm text-text-secondary mb-4">
            Votação encerrada • Resultado até {new Date(votacao.data_resultado_ate).toLocaleString('pt-BR')}
          </div>
        )}

        {mostrarOpcoes ? (
          <div className="space-y-3">
            <p className="text-text-secondary text-sm mb-3">
              {alterandoVoto ? 'Selecione a nova opção:' : 'Escolha uma opção:'}
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
                  className={`w-full p-4 text-left rounded-xl border transition-all flex justify-between items-center group disabled:opacity-50 ${isMyVote && alterandoVoto
                    ? 'bg-blue-500/20 border-blue-500'
                    : 'bg-background hover:bg-blue-500/10 border-border-color hover:border-blue-500/50'
                  }`}
                >
                  <span className="font-medium text-text-primary group-hover:text-blue-400 flex items-center gap-2">
                    {escolha.texto}
                    {isMyVote && alterandoVoto && <span className="text-xs bg-blue-500/20 px-2 py-0.5 rounded-full text-blue-400">Voto atual</span>}
                  </span>
                  <Check size={18} className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              );
            })}
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-text-secondary">
                Até {new Date(votacao.data_limite).toLocaleString('pt-BR')}
              </p>
              {alterandoVoto && (
                <button onClick={() => setAlterandoVoto(false)} className="text-xs text-text-secondary hover:text-text-primary">
                  Cancelar
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <Check size={16} />
                <span>Você votou! {votacao.total_votos} votos no total</span>
              </div>
              {podeAlterar && (
                <button
                  onClick={() => setAlterandoVoto(true)}
                  className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded-full border border-blue-500/30 transition-colors"
                >
                  <Edit size={12} />
                  Alterar Voto
                </button>
              )}
            </div>
            {podeAlterar && (
              <p className="text-xs text-text-secondary -mt-1">
                Pode alterar até {new Date(votacao.data_limite).toLocaleString('pt-BR')}
              </p>
            )}
            {votacao.escolhas?.map((escolha) => {
              const isMyVote = escolha.id === votacao.escolha_usuario;
              return (
                <div key={escolha.id}>
                  <div className={`flex justify-between items-center mb-1 ${isMyVote ? 'text-blue-400' : 'text-text-primary'}`}>
                    <span className="font-medium flex items-center gap-2 text-sm">
                      {escolha.texto}
                      {isMyVote && <span className="text-xs bg-blue-500/20 px-2 py-0.5 rounded-full">Seu voto</span>}
                    </span>
                    <span className="font-bold text-sm">{escolha.porcentagem}%</span>
                  </div>
                  <div className="w-full bg-border-color rounded-full h-2 overflow-hidden">
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
    const todasVotacoes = [
      ...votacoesAtivas.map(v => ({ ...v, isResult: false })),
      ...votacoesResultados.filter(r => !votacoesAtivas.find(a => a.id === r.id)).map(v => ({ ...v, isResult: true }))
    ];

    if (todasVotacoes.length === 0) return null;

    return (
      <div className="mt-8 space-y-4">
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
          <div className="w-16 h-16 rounded-2xl bg-card border border-border-color flex items-center justify-center mx-auto mb-4">
            <Pizza size={32} className="text-text-secondary" />
          </div>
          <h3 className="text-xl font-bold text-text-primary mb-2">Nenhum pedido ainda</h3>
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
      <div className="animate-fadeIn space-y-8">
        {agrupamento.pizzas_meio_a_meio.length > 0 && (
          <div className="card">
            <h2 className="text-lg font-bold mb-4 text-text-primary flex items-center gap-2">
              <span className="w-1.5 h-6 bg-secondary rounded-full"></span>
              Pizzas Meio a Meio
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {agrupamento.pizzas_meio_a_meio.map((pizza, idx) => {
                const type1 = flavorTypes[pizza.sabor1] || 'SALGADA';
                const type2 = flavorTypes[pizza.sabor2] || 'SALGADA';

                let color1 = "#FACC15";
                let color2 = "#EF4444";

                if (type1 === 'DOCE') color1 = "#5D4037";
                if (type2 === 'DOCE') color2 = "#5D4037";

                if (type1 === 'DOCE' && type2 === 'DOCE') {
                  color1 = "#D946EF";
                  color2 = "#5D4037";
                }

                return (
                  <div key={`meia-${idx}`} className="transform hover:scale-105 transition-transform duration-300">
                    <MeiaPizzaProgress sabor1={pizza.sabor1} sabor2={pizza.sabor2} color1={color1} color2={color2} />
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
            <div key={sabor} className="card">
              <h2 className="text-lg font-bold mb-4 text-text-primary flex items-center gap-2">
                <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                {sabor}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Array.from({ length: pizzasPorSabor[sabor].inteiras }).map((_, i) => (
                  <div key={`inteira-${sabor}-${i}`} className="transform hover:scale-105 transition-transform duration-300">
                    <PizzaProgress sabor={`${sabor} (${i + 1})`} total_pedacos={8} color={color} />
                  </div>
                ))}

                {pizzasPorSabor[sabor].avulsos > 0 && (
                  <div className="transform hover:scale-105 transition-transform duration-300">
                    <PizzaProgress sabor={sabor} total_pedacos={pizzasPorSabor[sabor].avulsos} color={color} />
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
    <div className="min-h-screen pb-24 bg-background">
      <Header />

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 py-6 lg:py-10">
        {/* Event Selector */}
        {eventosAtivos.length > 1 && (
          <div className="mb-8 flex flex-wrap gap-2">
            {eventosAtivos.map(evt => (
              <button
                key={evt.id}
                onClick={() => changeEvento(evt)}
                className={`px-4 py-2.5 rounded-lg transition-all font-medium text-sm ${eventoSelecionado?.id === evt.id
                  ? 'bg-primary text-white shadow-primary'
                  : 'bg-card border border-border-color text-text-secondary hover:text-text-primary hover:border-primary/30'
                }`}
              >
                {evt.tipo === 'RELAMPAGO' && '⚡ '}
                {evt.nome || new Date(evt.data_evento).toLocaleDateString('pt-BR')}
              </button>
            ))}
          </div>
        )}

        {/* Page Header */}
        <div className="mb-8 animate-fadeIn">
          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-text-primary tracking-tight leading-none">
                {eventoSelecionado.nome || 'Pizzada do Lelo'}
              </h1>
              {eventoSelecionado.tipo === 'RELAMPAGO' && (
                <span className="text-3xl sm:text-4xl animate-pulse-soft bg-primary/10 rounded-xl p-2">⚡</span>
              )}
            </div>
            <div className="flex items-center gap-3 bg-card rounded-xl px-4 py-3 border border-border-color">
              <Calendar size={18} className="text-primary hidden sm:block" />
              <div className="text-right">
                <span className="text-xs text-text-secondary block">Prazo limite</span>
                <span className="text-sm font-semibold text-text-primary">
                  {new Date(eventoSelecionado.data_limite).toLocaleString('pt-BR')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {renderStatsCards()}

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex gap-1 bg-card rounded-xl p-1 border border-border-color w-fit">
            <button
              onClick={() => setActiveTab('resumo')}
              className={`flex items-center gap-2 py-2.5 px-5 rounded-lg font-medium text-sm transition-all
                ${activeTab === 'resumo'
                  ? 'bg-primary text-white shadow-primary'
                  : 'text-text-secondary hover:text-text-primary'
                }`}
            >
              <BarChart2 size={16} />
              <span>Visão Geral</span>
            </button>
            <button
              onClick={() => setActiveTab('pizzas')}
              className={`flex items-center gap-2 py-2.5 px-5 rounded-lg font-medium text-sm transition-all
                ${activeTab === 'pizzas'
                  ? 'bg-secondary text-white shadow-secondary'
                  : 'text-text-secondary hover:text-text-primary'
                }`}
            >
              <PieChart size={16} />
              <span>Pizzas em Tempo Real</span>
            </button>
          </div>
        </div>

        {activeTab === 'resumo' ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
            {renderOportunidades()}
            {renderMeuPedido()}
          </div>
        ) : (
          renderPizzasEmTempoReal()
        )}

        <div className="mt-12">
          {renderVotacoes()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;