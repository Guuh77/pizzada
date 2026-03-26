import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { pagamentosService } from '../services/api';
import Header from '../components/Header';
import Loading from '../components/Loading';
import { Pizza, Calendar, DollarSign, AlertCircle, CheckCircle, CreditCard, Check, Send, Loader2 } from 'lucide-react';

const Pagamentos = () => {
    const { user, isAdmin } = useAuth();
    const [historico, setHistorico] = useState([]);
    const [eventoSelecionado, setEventoSelecionado] = useState(null);
    const [relatorio, setRelatorio] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        loadHistorico();
    }, []);

    const loadHistorico = async () => {
        try {
            const response = await pagamentosService.getMeuHistorico();
            setHistorico(response.data);

            const eventoDisponivel = response.data.find(h => h.pagamento_disponivel && h.pedido.status !== 'PAGO');
            if (eventoDisponivel) {
                loadRelatorio(eventoDisponivel.evento.id);
            } else if (response.data.length > 0) {
                if (response.data[0].pagamento_disponivel) {
                    loadRelatorio(response.data[0].evento.id);
                } else {
                    setEventoSelecionado(response.data[0].evento);
                }
            }

            setError('');
        } catch (err) {
            console.error('Erro ao carregar histórico:', err);
            setError('Erro ao carregar histórico de pedidos');
        } finally {
            setLoading(false);
        }
    };

    const loadRelatorio = async (eventoId) => {
        try {
            setLoading(true);
            const response = await pagamentosService.getRelatorio(eventoId);

            setRelatorio(response.data);
            setEventoSelecionado(response.data.evento);
            setError('');
            setSuccessMessage('');
        } catch (err) {
            console.error('Erro ao carregar relatório:', err);
            if (err.response?.status === 403) {
                setError('Pagamento ainda não disponível. O admin ainda não liberou os pagamentos deste evento.');
            } else {
                setError('Erro ao carregar relatório de pagamento');
            }
            setRelatorio(null);
        } finally {
            setLoading(false);
        }
    };

    const [processando, setProcessando] = useState(false);

    const marcarComoPago = async (pedidoId, eventoId) => {
        setProcessando(true);
        try {
            await pagamentosService.marcarComoPago(eventoId, pedidoId);
            setSuccessMessage('Pagamento confirmado com sucesso! ✅');

            await loadHistorico();
            await loadRelatorio(eventoId);

            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Erro ao marcar como pago:', err);
            setError('Erro ao confirmar pagamento');
        } finally {
            setProcessando(false);
        }
    };

    const informarPagamento = async (pedidoId, eventoId) => {
        setProcessando(true);
        try {
            await pagamentosService.informarPagamento(eventoId, pedidoId);
            setSuccessMessage('Pagamento informado! Aguarde a confirmação do admin. 🕒');

            await loadHistorico();
            await loadRelatorio(eventoId);

            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Erro ao informar pagamento:', err);
            setError(err.response?.data?.detail || 'Erro ao informar pagamento');
        } finally {
            setProcessando(false);
        }
    };

    const StatusBadge = ({ status, disponivel }) => {
        if (status === 'PAGO') return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-semibold">
                <Check size={12} /> Pago
            </span>
        );
        if (status === 'CONFIRMADO') return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold">
                <CheckCircle size={12} /> Em Análise
            </span>
        );
        if (disponivel) return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-xs font-semibold animate-pulse-soft">
                <CreditCard size={12} /> Disponível
            </span>
        );
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-card text-text-secondary text-xs font-semibold border border-border-color">
                Bloqueado
            </span>
        );
    };

    const renderHistorico = () => (
        <div className="mb-10 animate-fadeIn">
            <h2 className="text-xl font-bold mb-4 text-text-primary flex items-center gap-2">
                <Calendar className="text-primary" size={20} />
                Histórico de Eventos
            </h2>

            {historico.length === 0 ? (
                <div className="card text-center py-12">
                    <Pizza size={40} className="mx-auto mb-4 text-text-secondary" />
                    <p className="text-text-secondary">Nenhum pedido anterior encontrado.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {historico.map(({ evento, pedido, pagamento_disponivel }) => (
                        <button
                            key={evento.id}
                            onClick={() => pagamento_disponivel && loadRelatorio(evento.id)}
                            className={`card text-left transition-all duration-200 ${pagamento_disponivel
                                ? 'cursor-pointer hover:border-primary/50 hover:shadow-card-hover active:scale-[0.98]'
                                : 'opacity-60 cursor-default'
                            } ${eventoSelecionado?.id === evento.id ? 'border-primary shadow-primary' : ''}`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <h3 className="font-bold text-text-primary text-lg leading-tight">
                                    {evento.nome || 'Pizzada do Lelo'}
                                </h3>
                                <StatusBadge status={pedido.status} disponivel={pagamento_disponivel} />
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-text-secondary">Data</span>
                                    <span className="text-text-primary font-medium">{new Date(evento.data_evento).toLocaleDateString('pt-BR')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-text-secondary">Valor</span>
                                    <span className="text-primary font-bold">R$ {(pedido.valor_total + pedido.valor_frete).toFixed(2)}</span>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );

    const renderRelatorio = () => {
        if (!relatorio) return null;

        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

        const getImageUrl = (path) => {
            if (!path) return '';
            const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
            const imagePath = path.startsWith('/') ? path : `/${path}`;
            return `${baseUrl}${imagePath}`;
        };

        return (
            <div className="animate-fadeIn space-y-8">
                {/* Invoice Header */}
                <div className="card border-t-4 border-primary">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-6 border-b border-border-color">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                                <CreditCard size={28} className="text-primary" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-text-primary">Fatura</h1>
                                <p className="text-sm text-text-secondary">
                                    Evento em {new Date(relatorio.evento.data_evento).toLocaleDateString('pt-BR')}
                                </p>
                            </div>
                        </div>

                        {relatorio.pedido.status === 'PENDENTE' && (
                            <button
                                onClick={() => informarPagamento(relatorio.pedido.id, relatorio.evento.id)}
                                disabled={processando}
                                className="btn-primary flex items-center gap-2 w-full md:w-auto justify-center disabled:opacity-60"
                            >
                                {processando ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                {processando ? 'Enviando...' : 'Informar Pagamento'}
                            </button>
                        )}
                        {relatorio.pedido.status === 'CONFIRMADO' && (
                            <StatusBadge status="CONFIRMADO" />
                        )}
                        {relatorio.pedido.status === 'PAGO' && (
                            <StatusBadge status="PAGO" />
                        )}
                    </div>

                    {/* Order Table */}
                    <div className="overflow-x-auto rounded-xl border border-border-color">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-card border-b border-border-color">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary">Nº</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary hidden sm:table-cell">Usuário</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary">Sabor</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-text-secondary">Qtd</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary">Valor</th>
                                </tr>
                            </thead>
                            <tbody className="text-text-primary">
                                {relatorio.pedido.itens.flatMap((item) => {
                                    const pizzaNums = item.pizza_numeros || [];
                                    const precoUnitario = item.quantidade > 0 ? item.subtotal / item.quantidade : 0;

                                    if (pizzaNums.length === 0) {
                                        return Array.from({ length: item.quantidade }).map((_, idx) => (
                                            <tr key={`${item.id}-${idx}`} className="border-b border-border-color/50 hover:bg-card transition-colors">
                                                <td className="px-4 py-3 text-primary font-bold">-</td>
                                                <td className="px-4 py-3 text-text-secondary hidden sm:table-cell">{user?.nome_completo}</td>
                                                <td className="px-4 py-3 font-medium">{item.sabor_nome}</td>
                                                <td className="px-4 py-3 text-center">1</td>
                                                <td className="px-4 py-3 text-right tabular-nums">
                                                    R$ {precoUnitario.toFixed(2)}
                                                </td>
                                            </tr>
                                        ));
                                    }

                                    return pizzaNums.map((pizzaNum, idx) => (
                                        <tr key={`${item.id}-${idx}`} className="border-b border-border-color/50 hover:bg-card transition-colors">
                                            <td className="px-4 py-3 text-primary font-bold">{pizzaNum}</td>
                                            <td className="px-4 py-3 text-text-secondary hidden sm:table-cell">{user?.nome_completo}</td>
                                            <td className="px-4 py-3 font-medium">{item.sabor_nome}</td>
                                            <td className="px-4 py-3 text-center">1</td>
                                            <td className="px-4 py-3 text-right tabular-nums">
                                                R$ {precoUnitario.toFixed(2)}
                                            </td>
                                        </tr>
                                    ));
                                })}
                            </tbody>
                            <tfoot>
                                <tr className="border-t border-border-color bg-card">
                                    <td colSpan="4" className="px-4 py-3 text-right text-text-secondary text-xs font-medium">Subtotal</td>
                                    <td className="px-4 py-3 text-right font-semibold tabular-nums">R$ {relatorio.pedido.valor_total.toFixed(2)}</td>
                                </tr>
                                <tr className="bg-card">
                                    <td colSpan="4" className="px-4 py-3 text-right text-text-secondary text-xs font-medium">Frete</td>
                                    <td className="px-4 py-3 text-right font-semibold tabular-nums">R$ {relatorio.taxa_entrega.toFixed(2)}</td>
                                </tr>
                                <tr className="bg-primary text-white">
                                    <td colSpan="4" className="px-4 py-4 text-right font-bold text-lg">Total</td>
                                    <td className="px-4 py-4 text-right font-bold text-xl tabular-nums">
                                        R$ {(relatorio.pedido.valor_total + relatorio.taxa_entrega).toFixed(2)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* Payment Section - only show if not paid */}
                {relatorio.pedido.status !== 'PAGO' && (
                <div className="grid md:grid-cols-2 gap-6">
                    {/* QR Code */}
                    <div className="card flex flex-col items-center text-center">
                        <h3 className="text-lg font-bold mb-4 text-text-primary">Pagamento via PIX</h3>
                        <div className="bg-white rounded-xl p-3 mb-4 shadow-md">
                            <img
                                src={getImageUrl(relatorio.qr_code_url)}
                                alt="QR Code PIX"
                                className="w-36 h-36 sm:w-40 sm:h-40 object-contain"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                            <div style={{ display: 'none' }} className="w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center text-gray-500 text-sm font-medium text-center p-4">
                                QR Code indisponível
                            </div>
                        </div>
                        <p className="text-text-secondary text-xs">
                            Escaneie com o app do seu banco
                        </p>
                    </div>

                    {/* Instructions */}
                    <div className="card bg-primary/5 border-primary/20 flex flex-col">
                        <div className="flex items-center gap-3 mb-6">
                            <AlertCircle size={24} className="text-primary" />
                            <h3 className="text-xl font-bold text-text-primary">Importante</h3>
                        </div>
                        <p className="text-text-primary mb-6 leading-relaxed">
                            Após efetuar o PIX, envie o <strong>comprovante bancário</strong> para o responsável via <strong>Teams</strong> para que ele confirme seu pagamento.
                        </p>

                        <div className="mt-auto bg-card rounded-xl p-4 border border-border-color">
                            <p className="text-xs text-text-secondary mb-1">Responsável</p>
                            <p className="text-lg font-bold text-text-primary">{relatorio.nome_responsavel}</p>
                        </div>
                        <div className="bg-card rounded-xl p-4 border border-border-color mt-3">
                            <p className="text-xs text-text-secondary mb-1">E-mail / Teams</p>
                            <p className="text-sm font-semibold text-primary break-words">rsantos14@tjsp.jus.br</p>
                        </div>

                        {/* Rules */}
                        {relatorio.regras && relatorio.regras.length > 0 && (
                            <div className="mt-6 pt-6 border-t border-border-color">
                                <h4 className="text-sm font-bold text-text-primary mb-3">Regras</h4>
                                <ul className="space-y-2">
                                    {relatorio.regras.map((regra, index) => (
                                        <li key={index} className={`text-sm text-text-secondary flex items-start gap-2 ${regra.startsWith('  ') ? 'ml-4' : ''}`}>
                                            {!regra.startsWith('  ') && <span className="text-primary shrink-0 mt-0.5">•</span>}
                                            <span>{regra.trim()}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
                )}

                {/* Footer message */}
                <div className="card text-center">
                    <p className="text-2xl font-bold text-text-primary mb-2">Obrigado pela participação! 🍕</p>
                    <p className="text-text-secondary">Nos vemos na próxima Pizzada do Lelo</p>
                </div>
            </div>
        );
    };

    if (loading) return <Loading message="Carregando informações..." />;

    return (
        <div className="min-h-screen bg-background pb-20">
            <Header />

            <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-8 py-6 lg:py-10">
                <div className="mb-8 animate-fadeIn">
                    <h1 className="text-4xl sm:text-5xl font-black text-text-primary tracking-tight">
                        Pagamentos
                    </h1>
                    <p className="text-text-secondary mt-2">Gerencie seus pagamentos e veja o histórico</p>
                </div>

                {error && (
                    <div className="bg-primary/10 border border-primary/20 rounded-xl text-primary px-4 py-3 mb-6 text-sm font-medium flex items-center gap-3 animate-scaleIn">
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                {successMessage && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 px-4 py-3 mb-6 text-sm font-medium flex items-center gap-3 animate-scaleIn">
                        <CheckCircle size={18} />
                        <span>{successMessage}</span>
                    </div>
                )}

                {renderHistorico()}
                {renderRelatorio()}
            </div>
        </div>
    );
};

export default Pagamentos;
