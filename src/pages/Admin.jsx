import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header';
import { saboresService, eventosService, pedidosService, authService } from '../services/api';
import { Plus, Edit, Trash2, Save, X, Calendar, Users, AlertCircle, PieChart, Check, CheckCircle, Clock, Bell, RotateCcw } from 'lucide-react';
import AdminPizzaDashboard from '../components/AdminPizzaDashboard';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('notificacoes');
  const [sabores, setSabores] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [pagamentosPendentes, setPagamentosPendentes] = useState([]);
  const [editando, setEditando] = useState(null);
  const [novoSabor, setNovoSabor] = useState({ nome: '', preco_pedaco: '', tipo: 'SALGADA' });
  const [novoEvento, setNovoEvento] = useState({
    nome: '',
    data_evento: '',
    data_limite: '',
    tipo: 'NORMAL',
    allowed_users: []
  });
  const [mostrarFormSabor, setMostrarFormSabor] = useState(false);
  const [mostrarFormEvento, setMostrarFormEvento] = useState(false);
  const [eventoSelecionado, setEventoSelecionado] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [usuariosSelecionados, setUsuariosSelecionados] = useState([]);
  const [orderSort, setOrderSort] = useState('nome_asc'); // 'nome_asc' | 'nome_desc' | 'data_asc' | 'data_desc'
  const [pedidoEditando, setPedidoEditando] = useState(null); // Pedido sendo editado
  const [itensEditando, setItensEditando] = useState([]); // Itens do pedido sendo editado

  // Sorted pedidos based on selected filter
  const sortedPedidos = useMemo(() => {
    return [...pedidos].sort((a, b) => {
      switch (orderSort) {
        case 'nome_asc':
          return a.usuario_nome.localeCompare(b.usuario_nome);
        case 'nome_desc':
          return b.usuario_nome.localeCompare(a.usuario_nome);
        case 'data_asc':
          return new Date(a.data_pedido) - new Date(b.data_pedido);
        case 'data_desc':
          return new Date(b.data_pedido) - new Date(a.data_pedido);
        default:
          return 0;
      }
    });
  }, [pedidos, orderSort]);

  useEffect(() => {
    loadSabores();
    loadEventos();
    loadUsuarios();
    loadPagamentosPendentes();
  }, []);

  const loadPagamentosPendentes = async () => {
    try {
      // Usando import dinâmico para evitar problemas de dependência circular se houver
      const module = await import('../services/api');
      const res = await module.pagamentosService.getPagamentosPendentes();
      setPagamentosPendentes(res.data);
    } catch (err) {
      console.error('Erro ao carregar pagamentos pendentes:', err);
    }
  };

  const loadSabores = async () => {
    try {
      const res = await saboresService.getAll(false);
      setSabores(res.data);
    } catch (err) {
      alert('Erro ao carregar sabores');
    }
  };

  const loadEventos = async () => {
    try {
      const res = await eventosService.getAll();
      setEventos(res.data);
    } catch (err) {
      alert('Erro ao carregar eventos');
    }
  };

  const loadUsuarios = async () => {
    try {
      const res = await authService.getAllUsers();
      setUsuarios(res.data);
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
    }
  };

  const loadPedidosEvento = async (eventoId) => {
    try {
      const res = await pedidosService.getPorEvento(eventoId);
      setPedidos(res.data);
      setEventoSelecionado(eventoId);
    } catch (err) {
      alert('Erro ao carregar pedidos');
    }
  };

  const handleCriarSabor = async () => {
    try {
      await saboresService.create(novoSabor);
      setNovoSabor({ nome: '', preco_pedaco: '', tipo: 'SALGADA' });
      setMostrarFormSabor(false);
      loadSabores();
      alert('Sabor criado com sucesso!');
    } catch (err) {
      alert('Erro ao criar sabor');
    }
  };

  const handleCriarEvento = async () => {
    try {
      const eventoData = {
        ...novoEvento,
        allowed_users: novoEvento.tipo === 'RELAMPAGO' ? usuariosSelecionados : undefined
      };
      await eventosService.create(eventoData);
      setNovoEvento({ nome: '', data_evento: '', data_limite: '', tipo: 'NORMAL', allowed_users: [] });
      setUsuariosSelecionados([]);
      setMostrarFormEvento(false);
      loadEventos();
      alert('Evento criado com sucesso!');
    } catch (err) {
      alert(err.response?.data?.detail || 'Erro ao criar evento');
    }
  };

  const handleAtualizarSabor = async (id, dados) => {
    try {
      await saboresService.update(id, dados);
      setEditando(null);
      loadSabores();
      alert('Sabor atualizado!');
    } catch (err) {
      alert('Erro ao atualizar sabor');
    }
  };

  const handleDeletarSabor = async (id) => {
    if (!confirm('Deseja realmente desativar este sabor?')) return;

    try {
      await saboresService.delete(id);
      loadSabores();
      alert('Sabor desativado!');
    } catch (err) {
      alert('Erro ao deletar sabor');
    }
  };

  const handleFecharEvento = async (eventoId) => {
    if (!confirm('Deseja fechar este evento? Ninguém mais poderá fazer pedidos.')) return;

    try {
      await eventosService.update(eventoId, { status: 'FECHADO' });
      loadEventos();
      alert('Evento fechado!');
    } catch (err) {
      alert('Erro ao fechar evento');
    }
  };

  const handleReabrirEvento = async (eventoId) => {
    if (!confirm('Deseja reabrir este evento? As pessoas poderão fazer pedidos novamente.')) return;

    try {
      await eventosService.update(eventoId, { status: 'ABERTO' });
      loadEventos();
      alert('Evento reaberto com sucesso!');
    } catch (err) {
      alert(err.response?.data?.detail || 'Erro ao reabrir evento');
    }
  };

  const handleDeletarEvento = async (eventoId) => {
    if (!confirm('Deseja realmente DELETAR este evento? Esta ação não pode ser desfeita!')) return;

    try {
      await eventosService.delete(eventoId);
      loadEventos();
      if (eventoSelecionado === eventoId) {
        setEventoSelecionado(null);
        setPedidos([]);
      }
      alert('Evento deletado!');
    } catch (err) {
      alert(err.response?.data?.detail || 'Erro ao deletar evento');
    }
  };

  const handleDeletarPedido = async (pedidoId) => {
    if (!confirm('Deseja realmente excluir este pedido?')) return;

    try {
      await pedidosService.cancel(pedidoId);
      loadPedidosEvento(eventoSelecionado);
      alert('Pedido excluído!');
    } catch (err) {
      alert('Erro ao excluir pedido');
    }
  };

  const handleConfirmarPagamento = async (pedidoId, eventoId = null) => {
    if (!confirm('Confirmar pagamento deste pedido?')) return;

    try {
      const evtId = eventoId || eventoSelecionado;
      // Usando o serviço de pagamentos que já tem a função marcarComoPago
      // Importante: o serviço espera (eventoId, pedidoId)
      await import('../services/api').then(module => {
        return module.pagamentosService.marcarComoPago(evtId, pedidoId);
      });

      if (activeTab === 'notificacoes') {
        loadPagamentosPendentes();
      } else {
        loadPedidosEvento(evtId);
      }
      alert('Pagamento confirmado!');
    } catch (err) {
      console.error(err);
      alert('Erro ao confirmar pagamento');
    }
  };

  const handleDesmarcarPagamento = async (pedidoId) => {
    if (!confirm('Deseja realmente desmarcar este pagamento? O status voltará para PENDENTE.')) return;

    try {
      await import('../services/api').then(module => {
        return module.pagamentosService.desmarcarComoPago(eventoSelecionado, pedidoId);
      });

      loadPedidosEvento(eventoSelecionado);
      alert('Pagamento desmarcado!');
    } catch (err) {
      console.error(err);
      alert('Erro ao desmarcar pagamento');
    }
  };

  // Handler para abrir modal de edição
  const handleAbrirEdicaoPedido = (pedido) => {
    setPedidoEditando(pedido);
    setItensEditando(pedido.itens.map(item => ({
      sabor_id: item.sabor_id,
      sabor_nome: item.sabor_nome,
      quantidade: item.quantidade
    })));
  };

  // Handler para salvar edição do pedido (admin)
  const handleSalvarEdicaoPedido = async () => {
    if (!pedidoEditando || itensEditando.length === 0) return;

    try {
      await pedidosService.editarAdmin(pedidoEditando.id, {
        evento_id: eventoSelecionado,
        itens: itensEditando.map(item => ({
          sabor_id: item.sabor_id,
          quantidade: item.quantidade
        }))
      });

      setPedidoEditando(null);
      setItensEditando([]);
      loadPedidosEvento(eventoSelecionado);
      alert('Pedido atualizado com sucesso!');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || 'Erro ao salvar pedido');
    }
  };

  // Handler para adicionar item ao pedido sendo editado
  const handleAdicionarItemEdicao = (saborId) => {
    const sabor = sabores.find(s => s.id === saborId);
    if (!sabor) return;

    const existente = itensEditando.find(i => i.sabor_id === saborId);
    if (existente) {
      setItensEditando(itensEditando.map(i =>
        i.sabor_id === saborId ? { ...i, quantidade: i.quantidade + 1 } : i
      ));
    } else {
      setItensEditando([...itensEditando, { sabor_id: saborId, sabor_nome: sabor.nome, quantidade: 1 }]);
    }
  };

  // Handler para remover quantidade de item
  const handleRemoverItemEdicao = (saborId) => {
    setItensEditando(itensEditando
      .map(i => i.sabor_id === saborId ? { ...i, quantidade: i.quantidade - 1 } : i)
      .filter(i => i.quantidade > 0)
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-text-primary">Painel Admin</h1>
        </div>

        {/* Abas */}
        <div className="flex space-x-4 mb-6 border-b border-border-color overflow-x-auto">
          <button
            onClick={() => setActiveTab('notificacoes')}
            className={`pb-4 px-4 font-semibold transition-colors flex items-center gap-2 ${activeTab === 'notificacoes'
              ? 'border-b-2 border-primary text-primary'
              : 'text-text-secondary hover:text-text-primary'
              }`}
          >
            <Bell size={20} />
            Notificações
            {pagamentosPendentes.length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">
                {pagamentosPendentes.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('sabores')}
            className={`pb-4 px-4 font-semibold transition-colors ${activeTab === 'sabores'
              ? 'border-b-2 border-primary text-primary'
              : 'text-text-secondary hover:text-text-primary'
              }`}
          >
            Sabores de Pizza
          </button>
          <button
            onClick={() => setActiveTab('eventos')}
            className={`pb-4 px-4 font-semibold transition-colors ${activeTab === 'eventos'
              ? 'border-b-2 border-primary text-primary'
              : 'text-text-secondary hover:text-text-primary'
              }`}
          >
            Eventos
          </button>
          <button
            onClick={() => setActiveTab('tempo_real')}
            className={`pb-4 px-4 font-semibold transition-colors ${activeTab === 'tempo_real'
              ? 'border-b-2 border-primary text-primary'
              : 'text-text-secondary hover:text-text-primary'
              }`}
          >
            Tempo Real
          </button>
        </div>

        {/* ABA NOTIFICAÇÕES */}
        {
          activeTab === 'notificacoes' && (
            <div className="animate-fadeIn">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
                  <Bell className="text-primary" />
                  Pagamentos Pendentes de Confirmação
                </h2>
                <button
                  onClick={loadPagamentosPendentes}
                  className="text-sm text-primary hover:underline"
                >
                  Atualizar
                </button>
              </div>

              {pagamentosPendentes.length === 0 ? (
                <div className="card text-center py-12">
                  <CheckCircle size={48} className="mx-auto text-green-500 mb-4 opacity-50" />
                  <h3 className="text-xl font-bold text-text-primary mb-2">Tudo em dia!</h3>
                  <p className="text-text-secondary">Não há pagamentos aguardando confirmação no momento.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {pagamentosPendentes.map((pagamento) => (
                    <div key={pagamento.pedido_id} className="card flex flex-col md:flex-row justify-between items-center gap-4 border-l-4 border-primary">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-lg text-text-primary">{pagamento.usuario_nome}</span>
                          <span className="text-sm text-text-secondary">({pagamento.usuario_setor})</span>
                        </div>
                        <p className="text-text-secondary text-sm mb-1">
                          Evento: <span className="text-white">{pagamento.evento_nome}</span>
                        </p>
                        <p className="text-text-secondary text-sm">
                          Valor: <span className="text-primary font-bold">R$ {pagamento.valor_total.toFixed(2)}</span> •
                          <span className="ml-2 text-xs opacity-70">
                            {new Date(pagamento.data_pedido).toLocaleDateString('pt-BR')} às {new Date(pagamento.data_pedido).toLocaleTimeString('pt-BR')}
                          </span>
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm border border-blue-500/20 flex items-center gap-1">
                          <Clock size={14} />
                          Aguardando
                        </div>
                        <button
                          onClick={() => handleConfirmarPagamento(pagamento.pedido_id, pagamento.evento_id)}
                          className="btn-primary flex items-center gap-2 py-2 px-4 shadow-lg hover:scale-105 transition-transform"
                        >
                          <Check size={18} />
                          Confirmar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        }

        {/* ABA SABORES */}
        {
          activeTab === 'sabores' && (
            <div>
              <div className="flex justify-end mb-6">
                <button
                  onClick={() => setMostrarFormSabor(!mostrarFormSabor)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Plus size={20} />
                  <span>Novo Sabor</span>
                </button>
              </div>

              {mostrarFormSabor && (
                <div className="card mb-6 animate-fadeIn">
                  <h2 className="text-2xl font-bold mb-4">Novo Sabor</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <input
                      type="text"
                      className="input"
                      placeholder="Nome do sabor"
                      value={novoSabor.nome}
                      onChange={(e) => setNovoSabor({ ...novoSabor, nome: e.target.value })}
                    />
                    <input
                      type="number"
                      step="0.01"
                      className="input"
                      placeholder="Preço por pedaço"
                      value={novoSabor.preco_pedaco}
                      onChange={(e) => setNovoSabor({ ...novoSabor, preco_pedaco: e.target.value })}
                    />
                    <select
                      className="input"
                      value={novoSabor.tipo}
                      onChange={(e) => setNovoSabor({ ...novoSabor, tipo: e.target.value })}
                    >
                      <option value="SALGADA">Salgada 🧀</option>
                      <option value="DOCE">Doce 🍫</option>
                    </select>
                  </div>
                  <div className="flex space-x-4 mt-4">
                    <button onClick={handleCriarSabor} className="btn-primary">
                      Salvar
                    </button>
                    <button onClick={() => setMostrarFormSabor(false)} className="btn-outline">
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              <div className="card">
                <h2 className="text-2xl font-bold mb-4">Sabores Cadastrados</h2>
                <div className="space-y-4">
                  {sabores.map(sabor => (
                    <div key={sabor.id} className="flex items-center justify-between p-4 border border-border-color rounded-lg">
                      {editando === sabor.id ? (
                        <>
                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <input
                              type="text"
                              className="input"
                              defaultValue={sabor.nome}
                              id={`nome-${sabor.id}`}
                            />
                            <input
                              type="number"
                              step="0.01"
                              className="input"
                              defaultValue={sabor.preco_pedaco}
                              id={`preco-${sabor.id}`}
                            />
                            <select
                              className="input"
                              defaultValue={sabor.tipo || 'SALGADA'}
                              id={`tipo-${sabor.id}`}
                            >
                              <option value="SALGADA">Salgada 🧀</option>
                              <option value="DOCE">Doce 🍫</option>
                            </select>
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <button
                              onClick={() => {
                                const nome = document.getElementById(`nome-${sabor.id}`).value;
                                const preco = document.getElementById(`preco-${sabor.id}`).value;
                                const tipo = document.getElementById(`tipo-${sabor.id}`).value;
                                handleAtualizarSabor(sabor.id, { nome, preco_pedaco: parseFloat(preco), tipo });
                              }}
                              className="p-2 bg-green-500 text-white rounded-lg"
                            >
                              <Save size={20} />
                            </button>
                            <button
                              onClick={() => setEditando(null)}
                              className="p-2 bg-text-secondary text-white rounded-lg"
                            >
                              <X size={20} />
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                              {sabor.nome}
                              <span className={`text-xs px-2 py-1 rounded-full border ${sabor.tipo === 'DOCE'
                                ? 'bg-pink-500/10 text-pink-500 border-pink-500/20'
                                : 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                                }`}>
                                {sabor.tipo === 'DOCE' ? 'Doce 🍫' : 'Salgada 🧀'}
                              </span>
                            </h3>
                            <p className="text-text-secondary">R$ {sabor.preco_pedaco.toFixed(2)}</p>
                            {!sabor.ativo && <span className="text-red-500 text-sm">Inativo</span>}
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setEditando(sabor.id)}
                              className="p-2 bg-text-secondary text-white rounded-lg"
                            >
                              <Edit size={20} />
                            </button>
                            <button
                              onClick={() => handleDeletarSabor(sabor.id)}
                              className="p-2 bg-primary text-white rounded-lg"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        }

        {/* ABA EVENTOS */}
        {
          activeTab === 'eventos' && (
            <div>
              <div className="flex justify-end mb-6">
                <button
                  onClick={() => setMostrarFormEvento(!mostrarFormEvento)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Calendar size={20} />
                  <span>Novo Evento</span>
                </button>
              </div>

              {mostrarFormEvento && (
                <div className="card mb-6 animate-fadeIn">
                  <h2 className="text-2xl font-bold mb-4">Criar Novo Evento</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="label">Nome do Evento</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="Ex: Pizzada de Dezembro"
                        value={novoEvento.nome}
                        onChange={(e) => setNovoEvento({ ...novoEvento, nome: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="label">Data do Evento</label>
                        <input
                          type="date"
                          className="input"
                          value={novoEvento.data_evento}
                          onChange={(e) => setNovoEvento({ ...novoEvento, data_evento: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="label">Data Limite para Pedidos</label>
                        <input
                          type="datetime-local"
                          className="input"
                          value={novoEvento.data_limite}
                          onChange={(e) => setNovoEvento({ ...novoEvento, data_limite: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Tipo de Evento */}
                    <div>
                      <label className="label">Tipo de Evento</label>
                      <select
                        className="input"
                        value={novoEvento.tipo}
                        onChange={(e) => setNovoEvento({ ...novoEvento, tipo: e.target.value })}
                      >
                        <option value="NORMAL">Normal (Todos podem participar)</option>
                        <option value="RELAMPAGO">⚡ Relâmpago (Usuários selecionados)</option>
                      </select>
                    </div>

                    {/* Seletor de Usuários (apenas para RELAMPAGO) */}
                    {novoEvento.tipo === 'RELAMPAGO' && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <span className="text-2xl">⚡</span>
                          <label className="label mb-0">Usuários Permitidos</label>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          Selecione os usuários que poderão participar deste evento relâmpago:
                        </p>
                        <div className="max-h-60 overflow-y-auto space-y-2 bg-white rounded p-3">
                          {usuarios.map(usuario => (
                            <label key={usuario.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                              <input
                                type="checkbox"
                                checked={usuariosSelecionados.includes(usuario.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setUsuariosSelecionados([...usuariosSelecionados, usuario.id]);
                                  } else {
                                    setUsuariosSelecionados(usuariosSelecionados.filter(id => id !== usuario.id));
                                  }
                                }}
                                className="w-4 h-4 text-primary"
                              />
                              <div className="flex-1">
                                <span className="font-medium text-gray-900">{usuario.nome_completo}</span>
                                <span className="text-sm text-gray-500 ml-2">({usuario.setor})</span>
                              </div>
                            </label>
                          ))}
                        </div>
                        {usuariosSelecionados.length > 0 && (
                          <p className="text-sm text-green-600 mt-2">
                            ✓ {usuariosSelecionados.length} usuário(s) selecionado(s)
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-4 mt-4">
                    <button onClick={handleCriarEvento} className="btn-primary">
                      Criar Evento
                    </button>
                    <button onClick={() => setMostrarFormEvento(false)} className="btn-outline">
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-6">
                {eventos.map(evento => (
                  <div key={evento.id} className="card">
                    <div className="flex flex-col sm:flex-row justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-2xl font-bold text-text-primary">
                            {evento.nome || `Pizzada de ${(() => {
                              if (!evento.data_evento) return '';
                              const [y, m, d] = evento.data_evento.split('-');
                              return `${d}/${m}/${y}`;
                            })()}`}
                          </h3>
                          {evento.tipo === 'RELAMPAGO' && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-300">
                              ⚡ Relâmpago
                            </span>
                          )}
                        </div>
                        <p className="text-text-secondary">
                          Data: {(() => {
                            if (!evento.data_evento) return '';
                            const [y, m, d] = evento.data_evento.split('-');
                            return `${d}/${m}/${y}`;
                          })()}
                        </p>
                        <p className="text-text-secondary">
                          Pedidos até: {new Date(evento.data_limite).toLocaleString('pt-BR')}
                        </p>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mt-2 ${evento.status === 'ABERTO' ? 'bg-green-100 text-green-800' :
                          evento.status === 'FECHADO' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                          {evento.status}
                        </span>
                      </div>
                      <div className="flex space-x-2 mt-4 sm:mt-0">
                        <button
                          onClick={() => loadPedidosEvento(evento.id)}
                          className="btn-secondary"
                        >
                          Ver Pedidos
                        </button>
                        {evento.status === 'ABERTO' ? (
                          <button
                            onClick={() => handleFecharEvento(evento.id)}
                            className="btn-outline"
                          >
                            Fechar Evento
                          </button>
                        ) : evento.status === 'FECHADO' && (
                          <button
                            onClick={() => handleReabrirEvento(evento.id)}
                            className="bg-secondary text-text-primary px-4 py-2 rounded-lg hover:bg-secondary-hover"
                          >
                            Reabrir Evento
                          </button>
                        )}
                        <button
                          onClick={() => handleDeletarEvento(evento.id)}
                          className="p-2 bg-primary text-white rounded-lg hover:bg-primary-hover"
                          title="Deletar evento"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>

                    {eventoSelecionado === evento.id && pedidos.length > 0 && (
                      <div className="mt-6 border-t border-border-color pt-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                          <h4 className="text-xl font-bold">Pedidos ({pedidos.length})</h4>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-text-secondary text-sm">Ordenar:</span>
                            <button
                              onClick={() => setOrderSort('nome_asc')}
                              className={`px-3 py-1 text-sm rounded-lg transition-colors ${orderSort === 'nome_asc'
                                ? 'bg-primary text-white'
                                : 'bg-white/5 text-text-secondary hover:bg-white/10 hover:text-text-primary'
                                }`}
                            >
                              Nome A-Z
                            </button>
                            <button
                              onClick={() => setOrderSort('nome_desc')}
                              className={`px-3 py-1 text-sm rounded-lg transition-colors ${orderSort === 'nome_desc'
                                ? 'bg-primary text-white'
                                : 'bg-white/5 text-text-secondary hover:bg-white/10 hover:text-text-primary'
                                }`}
                            >
                              Nome Z-A
                            </button>
                            <button
                              onClick={() => setOrderSort('data_asc')}
                              className={`px-3 py-1 text-sm rounded-lg transition-colors ${orderSort === 'data_asc'
                                ? 'bg-primary text-white'
                                : 'bg-white/5 text-text-secondary hover:bg-white/10 hover:text-text-primary'
                                }`}
                            >
                              Data ↑
                            </button>
                            <button
                              onClick={() => setOrderSort('data_desc')}
                              className={`px-3 py-1 text-sm rounded-lg transition-colors ${orderSort === 'data_desc'
                                ? 'bg-primary text-white'
                                : 'bg-white/5 text-text-secondary hover:bg-white/10 hover:text-text-primary'
                                }`}
                            >
                              Data ↓
                            </button>
                          </div>
                        </div>
                        <div className="space-y-4">
                          {sortedPedidos.map(pedido => (
                            <div key={pedido.id} className="border border-border-color rounded-lg p-4">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-4 mb-2">
                                    <Users size={20} className="text-primary" />
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <p className="font-bold text-text-primary">{pedido.usuario_nome?.toUpperCase()}</p>
                                        {pedido.status === 'PAGO' && (
                                          <span className="flex items-center text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30">
                                            <CheckCircle size={12} className="mr-1" /> Pago
                                          </span>
                                        )}
                                        {pedido.status === 'CONFIRMADO' && (
                                          <span className="flex items-center text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/30">
                                            <Clock size={12} className="mr-1" /> Aguardando Confirmação
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-sm text-text-secondary">{pedido.usuario_setor}</p>
                                    </div>
                                  </div>
                                  <div className="ml-9">
                                    {pedido.itens.map((item, idx) => (
                                      <p key={idx} className="text-sm text-text-secondary">
                                        {item.quantidade}x {item.sabor_nome} - <span className="text-text-primary">R$ {item.subtotal.toFixed(2)}</span>
                                      </p>
                                    ))}
                                    <div className="mt-2 pt-2 border-t border-border-color">
                                      <p className="text-sm text-text-secondary">Frete: R$ {pedido.valor_frete.toFixed(2)}</p>
                                      <p className="font-bold text-text-primary">
                                        Total: R$ {(pedido.valor_total + pedido.valor_frete).toFixed(2)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                  {pedido.status !== 'PAGO' && (
                                    <button
                                      onClick={() => handleConfirmarPagamento(pedido.id)}
                                      className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                      title="Confirmar Pagamento"
                                    >
                                      <Check size={20} />
                                    </button>
                                  )}
                                  {pedido.status === 'PAGO' && (
                                    <button
                                      onClick={() => handleDesmarcarPagamento(pedido.id)}
                                      className="p-2 bg-yellow-500/20 text-yellow-500 border border-yellow-500/50 rounded-lg hover:bg-yellow-500 hover:text-white transition-colors"
                                      title="Desmarcar como Pago (Desfazer)"
                                    >
                                      <RotateCcw size={20} />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleAbrirEdicaoPedido(pedido)}
                                    className="p-2 bg-blue-500/20 text-blue-400 border border-blue-500/50 rounded-lg hover:bg-blue-500 hover:text-white transition-colors"
                                    title="Editar pedido"
                                  >
                                    <Edit size={20} />
                                  </button>
                                  <button
                                    onClick={() => handleDeletarPedido(pedido.id)}
                                    className="p-2 bg-red-500/20 text-red-400 border border-red-500/50 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                                    title="Excluir pedido"
                                  >
                                    <Trash2 size={20} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {eventoSelecionado === evento.id && pedidos.length === 0 && (
                      <div className="mt-6 border-t border-border-color pt-4 text-center text-text-secondary">
                        <AlertCircle size={48} className="mx-auto mb-2 text-gray-400" />
                        <p>Nenhum pedido ainda neste evento</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        }

        {/* ABA TEMPO REAL */}
        {
          activeTab === 'tempo_real' && (
            <div className="animate-fadeIn">
              {!eventoSelecionado ? (
                <div className="text-center py-12">
                  <PieChart size={64} className="mx-auto text-text-secondary mb-4" />
                  <h2 className="text-2xl font-bold text-text-primary mb-2">Selecione um Evento</h2>
                  <p className="text-text-secondary mb-6">Selecione um evento para visualizar o painel em tempo real.</p>
                  <div className="max-w-md mx-auto grid gap-4">
                    {eventos.map(evento => (
                      <button
                        key={evento.id}
                        onClick={() => loadPedidosEvento(evento.id)}
                        className="card hover:border-primary transition-colors text-left p-4 flex justify-between items-center group"
                      >
                        <div>
                          <h3 className="font-bold text-text-primary group-hover:text-primary transition-colors">
                            {evento.nome || `Pizzada de ${(() => {
                              if (!evento.data_evento) return '';
                              const [y, m, d] = evento.data_evento.split('-');
                              return `${d}/${m}/${y}`;
                            })()}`}
                          </h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${evento.status === 'ABERTO' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                            {evento.status}
                          </span>
                        </div>
                        <PieChart className="text-text-secondary group-hover:text-primary transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <button
                      onClick={() => setEventoSelecionado(null)}
                      className="text-text-secondary hover:text-text-primary underline"
                    >
                      ← Escolher outro evento
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={() => loadPedidosEvento(eventoSelecionado)}
                        className="btn-secondary text-sm"
                      >
                        Atualizar Dados
                      </button>
                    </div>
                  </div>
                  <AdminPizzaDashboard pedidos={pedidos} sabores={sabores} eventoId={eventoSelecionado} />
                </div>
              )}
            </div>
          )
        }
      </div >

      {/* Modal de Edição de Pedido */}
      {pedidoEditando && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-card-bg border border-border-color rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-text-primary">
                Editar Pedido de {pedidoEditando.usuario_nome}
              </h2>
              <button
                onClick={() => { setPedidoEditando(null); setItensEditando([]); }}
                className="p-2 text-text-secondary hover:text-text-primary"
              >
                <X size={24} />
              </button>
            </div>

            {/* Itens Atuais */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-text-primary mb-3">Itens do Pedido</h3>
              {itensEditando.length === 0 ? (
                <p className="text-text-secondary">Nenhum item. Adicione sabores abaixo.</p>
              ) : (
                <div className="space-y-2">
                  {itensEditando.map(item => (
                    <div key={item.sabor_id} className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
                      <span className="text-text-primary">{item.sabor_nome}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRemoverItemEdicao(item.sabor_id)}
                          className="w-8 h-8 flex items-center justify-center bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500 hover:text-white"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-bold text-text-primary">{item.quantidade}</span>
                        <button
                          onClick={() => handleAdicionarItemEdicao(item.sabor_id)}
                          className="w-8 h-8 flex items-center justify-center bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500 hover:text-white"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Adicionar Sabores */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-text-primary mb-3">Adicionar Sabor</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                {sabores.filter(s => s.ativo).map(sabor => (
                  <button
                    key={sabor.id}
                    onClick={() => handleAdicionarItemEdicao(sabor.id)}
                    className="p-2 text-sm bg-white/5 hover:bg-primary/20 text-text-secondary hover:text-text-primary rounded-lg transition-colors text-left"
                  >
                    {sabor.nome}
                    <span className="text-xs ml-1 opacity-60">
                      {sabor.tipo === 'DOCE' ? '🍫' : '🧀'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex gap-4">
              <button
                onClick={handleSalvarEdicaoPedido}
                disabled={itensEditando.length === 0}
                className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={20} />
                Salvar Alterações
              </button>
              <button
                onClick={() => { setPedidoEditando(null); setItensEditando([]); }}
                className="btn-outline"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div >
  );
};

export default Admin;