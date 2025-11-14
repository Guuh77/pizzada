import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { saboresService, eventosService, pedidosService } from '../services/api';
import { Plus, Edit, Trash2, Save, X, Calendar, Users, AlertCircle } from 'lucide-react';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('sabores');
  const [sabores, setSabores] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [editando, setEditando] = useState(null);
  const [novoSabor, setNovoSabor] = useState({ nome: '', preco_pedaco: '' });
  const [novoEvento, setNovoEvento] = useState({ 
    nome: '',
    data_evento: '', 
    data_limite: '' 
  });
  const [mostrarFormSabor, setMostrarFormSabor] = useState(false);
  const [mostrarFormEvento, setMostrarFormEvento] = useState(false);
  const [eventoSelecionado, setEventoSelecionado] = useState(null);

  useEffect(() => {
    loadSabores();
    loadEventos();
  }, []);

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
      setNovoSabor({ nome: '', preco_pedaco: '' });
      setMostrarFormSabor(false);
      loadSabores();
      alert('Sabor criado com sucesso!');
    } catch (err) {
      alert('Erro ao criar sabor');
    }
  };

  const handleCriarEvento = async () => {
    try {
      await eventosService.create(novoEvento);
      setNovoEvento({ nome: '', data_evento: '', data_limite: '' });
      setMostrarFormEvento(false);
      loadEventos();
      alert('Evento criado com sucesso!');
    } catch (err) {
      alert('Erro ao criar evento');
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
      alert('Erro ao reabrir evento');
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-text-primary">Painel Admin</h1>
        </div>

        {/* Abas */}
        <div className="flex space-x-4 mb-6 border-b border-border-color">
          <button
            onClick={() => setActiveTab('sabores')}
            className={`pb-4 px-4 font-semibold transition-colors ${
              activeTab === 'sabores'
                ? 'border-b-2 border-primary text-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Sabores de Pizza
          </button>
          <button
            onClick={() => setActiveTab('eventos')}
            className={`pb-4 px-4 font-semibold transition-colors ${
              activeTab === 'eventos'
                ? 'border-b-2 border-primary text-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Eventos
          </button>
        </div>

        {/* ABA SABORES */}
        {activeTab === 'sabores' && (
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    className="input"
                    placeholder="Nome do sabor"
                    value={novoSabor.nome}
                    onChange={(e) => setNovoSabor({...novoSabor, nome: e.target.value})}
                  />
                  <input
                    type="number"
                    step="0.01"
                    className="input"
                    placeholder="Preço por pedaço"
                    value={novoSabor.preco_pedaco}
                    onChange={(e) => setNovoSabor({...novoSabor, preco_pedaco: e.target.value})}
                  />
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
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => {
                              const nome = document.getElementById(`nome-${sabor.id}`).value;
                              const preco = document.getElementById(`preco-${sabor.id}`).value;
                              handleAtualizarSabor(sabor.id, { nome, preco_pedaco: parseFloat(preco) });
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
                          <h3 className="text-xl font-bold text-text-primary">{sabor.nome}</h3>
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
        )}

        {/* ABA EVENTOS */}
        {activeTab === 'eventos' && (
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
                      onChange={(e) => setNovoEvento({...novoEvento, nome: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Data do Evento</label>
                      <input
                        type="date"
                        className="input"
                        value={novoEvento.data_evento}
                        onChange={(e) => setNovoEvento({...novoEvento, data_evento: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="label">Data Limite para Pedidos</label>
                      <input
                        type="datetime-local"
                        className="input"
                        value={novoEvento.data_limite}
                        onChange={(e) => setNovoEvento({...novoEvento, data_limite: e.target.value})}
                      />
                    </div>
                  </div>
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
                      <h3 className="text-2xl font-bold text-text-primary">
                        {evento.nome || `Pizzada de ${new Date(evento.data_evento).toLocaleDateString('pt-BR')}`}
                      </h3>
                      <p className="text-text-secondary">
                        Data: {new Date(evento.data_evento).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-text-secondary">
                        Pedidos até: {new Date(evento.data_limite).toLocaleString('pt-BR')}
                      </p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mt-2 ${
                        evento.status === 'ABERTO' ? 'bg-green-100 text-green-800' :
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
                      <h4 className="text-xl font-bold mb-4">Pedidos ({pedidos.length})</h4>
                      <div className="space-y-4">
                        {pedidos.map(pedido => (
                          <div key={pedido.id} className="border border-border-color rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center space-x-4 mb-2">
                                  <Users size={20} className="text-primary" />
                                  <div>
                                    <p className="font-bold text-text-primary">{pedido.usuario_nome}</p>
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
                              <button
                                onClick={() => handleDeletarPedido(pedido.id)}
                                className="p-2 bg-primary text-white rounded-lg hover:bg-primary-hover"
                                title="Excluir pedido"
                              >
                                <Trash2 size={20} />
                              </button>
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
        )}
      </div>
    </div>
  );
};

export default Admin;