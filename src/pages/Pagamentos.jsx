import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { pagamentosService } from '../services/api';
import Header from '../components/Header';
import Loading from '../components/Loading';
import { Pizza, Calendar, DollarSign, AlertCircle, CheckCircle, CreditCard, Check } from 'lucide-react';

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

            // Selecionar automaticamente o primeiro evento com pagamento disponível
            const eventoDisponivel = response.data.find(h => h.pagamento_disponivel && h.pedido.status !== 'PAGO');
            if (eventoDisponivel) {
                loadRelatorio(eventoDisponivel.evento.id);
            } else if (response.data.length > 0) {
                // Se não tem disponível, seleciona o primeiro
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

            // DEBUG: Mostrar os dados recebidos do backend
            console.log('[DEBUG Pagamentos] Relatório recebido do evento:', eventoId);
            console.log('[DEBUG Pagamentos] Dados completos:', response.data);
            if (response.data.pedido?.itens) {
                console.log('[DEBUG Pagamentos] Itens do pedido com pizza_numeros:');
                response.data.pedido.itens.forEach((item, idx) => {
                    console.log(`  Item ${idx + 1}: ${item.sabor_nome} - pizza_numeros:`, item.pizza_numeros);
                });
            }

            setRelatorio(response.data);
            setEventoSelecionado(response.data.evento);
            setError('');
            setSuccessMessage('');
        } catch (err) {
            console.error('Erro ao carregar relatório:', err);
            if (err.response?.status === 403) {
                setError('Pagamento ainda não disponível. Aguarde o evento ser fechado.');
            } else {
                setError('Erro ao carregar relatório de pagamento');
            }
            setRelatorio(null);
        } finally {
            setLoading(false);
        }
    };

    const marcarComoPago = async (pedidoId, eventoId) => {
        try {
            await pagamentosService.marcarComoPago(eventoId, pedidoId);
            setSuccessMessage('Pagamento confirmado com sucesso! ✅');

            // Recarregar histórico e relatório
            await loadHistorico();
            await loadRelatorio(eventoId);

            // Limpar mensagem após 3 segundos
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Erro ao marcar como pago:', err);
            setError('Erro ao confirmar pagamento');
        }
    };

    const informarPagamento = async (pedidoId, eventoId) => {
        try {
            await pagamentosService.informarPagamento(eventoId, pedidoId);
            setSuccessMessage('Pagamento informado! Aguarde a confirmação do admin. 🕒');

            // Recarregar histórico e relatório
            await loadHistorico();
            await loadRelatorio(eventoId);

            // Limpar mensagem após 3 segundos
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Erro ao informar pagamento:', err);
            setError(err.response?.data?.detail || 'Erro ao informar pagamento');
        }
    };

    const renderHistorico = () => (
        <div className="card mb-8 animate-fadeIn">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-text-primary">
                <Calendar className="text-primary" />
                Histórico de Pedidos
            </h2>

            {historico.length === 0 ? (
                <div className="text-center py-10 bg-white/5 rounded-xl">
                    <Pizza size={48} className="mx-auto mb-4 text-gray-500" />
                    <p className="text-text-secondary">Você ainda não fez nenhum pedido</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {historico.map(({ evento, pedido, pagamento_disponivel }) => (
                        <div
                            key={evento.id}
                            onClick={() => pagamento_disponivel && loadRelatorio(evento.id)}
                            className={`
                relative p-5 rounded-xl border-2 transition-all
                ${pagamento_disponivel
                                    ? 'cursor-pointer border-primary/50 bg-primary/10 hover:bg-primary/20 hover:scale-105 hover:shadow-neon-primary'
                                    : 'border-white/10 bg-white/5 opacity-60'
                                }
                ${eventoSelecionado?.id === evento.id ? 'ring-2 ring-primary' : ''}
              `}
                        >
                            {pedido.status === 'PAGO' ? (
                                <div className="absolute top-3 right-3">
                                    <CheckCircle size={20} className="text-green-400" />
                                </div>
                            ) : pedido.status === 'CONFIRMADO' ? (
                                <div className="absolute top-3 right-3">
                                    <CheckCircle size={20} className="text-blue-400" />
                                </div>
                            ) : pagamento_disponivel ? (
                                <div className="absolute top-3 right-3">
                                    <CheckCircle size={20} className="text-green-400" />
                                </div>
                            ) : (
                                <div className="absolute top-3 right-3">
                                    <AlertCircle size={20} className="text-yellow-400" />
                                </div>
                            )}

                            <h3 className="font-bold text-lg mb-2 text-white">
                                {evento.nome || `Pizzada do Lelo`}
                            </h3>

                            <div className="space-y-1 text-sm">
                                <p className="text-text-secondary">
                                    <span className="font-semibold">Data:</span>{' '}
                                    {new Date(evento.data_evento).toLocaleDateString('pt-BR')}
                                </p>
                                <p className="text-text-secondary">
                                    <span className="font-semibold">Valor:</span>{' '}
                                    <span className="text-primary font-bold">
                                        R$ {(pedido.valor_total + pedido.valor_frete).toFixed(2)}
                                    </span>
                                </p>
                                <p className="text-text-secondary">
                                    <span className="font-semibold">Status:</span>{' '}
                                    <span className={
                                        pedido.status === 'PAGO' ? 'text-green-400' :
                                            pedido.status === 'CONFIRMADO' ? 'text-blue-400' :
                                                (pagamento_disponivel ? 'text-yellow-400' : 'text-gray-400')
                                    }>
                                        {pedido.status === 'PAGO' ? '✅ Pago' :
                                            pedido.status === 'CONFIRMADO' ? '🕒 Aguardando Confirmação' :
                                                (pagamento_disponivel ? 'Pagamento Disponível' : 'Aguardando Fechamento')}
                                    </span>
                                </p>
                            </div>
                        </div>
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
            <div className="card animate-fadeIn">
                {/* Header do Relatório */}
                <div className="bg-gradient-to-r from-primary to-secondary p-6 rounded-t-xl -m-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Pizza className="text-white" size={32} />
                            <div>
                                <h1 className="text-3xl font-bold text-white">PIZZADA DO LELO</h1>
                                <p className="text-white/80">
                                    {new Date(relatorio.evento.data_evento).toLocaleDateString('pt-BR', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                        <CreditCard className="text-white" size={40} />
                    </div>
                </div>

                {/* Imagens dos Chefs e Regras */}
                <div className="grid md:grid-cols-[200px_1fr_200px] gap-6 items-start mb-8">
                    {/* Chef Esquerda */}
                    <div className="hidden md:block">
                        <img
                            src={getImageUrl(relatorio.chef_esquerda_url)}
                            alt="Chef"
                            className="w-full rounded-xl shadow-lg"
                            onError={(e) => e.target.style.display = 'none'}
                        />
                    </div>

                    {/* Regras */}
                    <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                        <h2 className="text-xl font-bold mb-4 text-center text-white">
                            ⚠️ REGRAS DA PIZZADA ⚠️
                        </h2>
                        <ul className="space-y-2 text-sm text-text-secondary">
                            {relatorio.regras.map((regra, index) => (
                                <li key={index} className={regra.startsWith('  ') ? 'ml-4' : 'flex items-start gap-2'}>
                                    {!regra.startsWith('  ') && <span className="text-primary mt-1">•</span>}
                                    <span className="flex-1">{regra.trim()}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Chef Direita */}
                    <div className="hidden md:block">
                        <img
                            src={getImageUrl(relatorio.chef_direita_url)}
                            alt="Chef"
                            className="w-full rounded-xl shadow-lg"
                            onError={(e) => e.target.style.display = 'none'}
                        />
                    </div>
                </div>

                {/* Resumo do Pedido */}
                <div className="max-w-2xl mx-auto mb-8">
                    <div className="bg-gradient-to-br from-purple-500/20 to-blue-600/20 border-2 border-purple-500/50 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                <DollarSign className="text-purple-400" />
                                RESUMO DO SEU PEDIDO
                            </h2>

                            {/* Botão de informar pagamento (Visível para todos se pendente) */}
                            {relatorio.pedido.status === 'PENDENTE' && (
                                <button
                                    onClick={() => informarPagamento(relatorio.pedido.id, relatorio.evento.id)}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all transform hover:scale-105 shadow-lg"
                                >
                                    <Check size={20} />
                                    Informar Pagamento
                                </button>
                            )}

                            {/* Badge de Aguardando Confirmação */}
                            {relatorio.pedido.status === 'CONFIRMADO' && (
                                <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 border-2 border-blue-500 text-blue-400 rounded-lg font-bold">
                                    <CheckCircle size={20} />
                                    Aguardando Confirmação
                                </div>
                            )}

                            {/* Badge de pago */}
                            {relatorio.pedido.status === 'PAGO' && (
                                <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border-2 border-green-500 text-green-400 rounded-lg font-bold">
                                    <CheckCircle size={20} />
                                    PAGO
                                </div>
                            )}
                        </div>

                        <div className="bg-black/30 rounded-lg overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-white/10">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-white font-semibold">Pizza Nº</th>
                                        <th className="px-4 py-3 text-left text-white font-semibold">Nome</th>
                                        <th className="px-4 py-3 text-left text-white font-semibold">Sabor</th>
                                        <th className="px-4 py-3 text-center text-white font-semibold">Pedaços</th>
                                        <th className="px-4 py-3 text-right text-white font-semibold">Valor (R$)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {relatorio.pedido.itens.flatMap((item) => {
                                        const pizzaNums = item.pizza_numeros || [];
                                        const precoUnitario = item.quantidade > 0 ? item.subtotal / item.quantidade : 0;

                                        // Se não tem pizza_numeros, fallback para comportamento antigo
                                        if (pizzaNums.length === 0) {
                                            return Array.from({ length: item.quantidade }).map((_, idx) => (
                                                <tr key={`${item.id}-${idx}`} className="border-b border-white/10">
                                                    <td className="px-4 py-3 text-text-primary font-bold text-lg">-</td>
                                                    <td className="px-4 py-3 text-text-primary">{user?.nome_completo}</td>
                                                    <td className="px-4 py-3 text-text-primary">{item.sabor_nome}</td>
                                                    <td className="px-4 py-3 text-center text-text-primary font-bold">1</td>
                                                    <td className="px-4 py-3 text-right text-text-primary font-bold">
                                                        {precoUnitario.toFixed(2).replace('.', ',')}
                                                    </td>
                                                </tr>
                                            ));
                                        }

                                        // Uma linha por pedaço com número da pizza correto
                                        return pizzaNums.map((pizzaNum, idx) => (
                                            <tr key={`${item.id}-${idx}`} className="border-b border-white/10">
                                                <td className="px-4 py-3 text-text-primary font-bold text-lg">{pizzaNum}</td>
                                                <td className="px-4 py-3 text-text-primary">{user?.nome_completo}</td>
                                                <td className="px-4 py-3 text-text-primary">{item.sabor_nome}</td>
                                                <td className="px-4 py-3 text-center text-text-primary font-bold">1</td>
                                                <td className="px-4 py-3 text-right text-text-primary font-bold">
                                                    {precoUnitario.toFixed(2).replace('.', ',')}
                                                </td>
                                            </tr>
                                        ));
                                    })}

                                    {/* Subtotal */}
                                    <tr className="bg-white/5">
                                        <td colSpan="4" className="px-4 py-3 text-right text-white font-semibold">
                                            Subtotal (Pizzas):
                                        </td>
                                        <td className="px-4 py-3 text-right text-white font-bold">
                                            R$ {relatorio.pedido.valor_total.toFixed(2).replace('.', ',')}
                                        </td>
                                    </tr>

                                    {/* Taxa de Entrega */}
                                    <tr className="bg-white/5">
                                        <td colSpan="4" className="px-4 py-3 text-right text-white font-semibold">
                                            Taxa de Entrega:
                                        </td>
                                        <td className="px-4 py-3 text-right text-white font-bold">
                                            R$ {relatorio.taxa_entrega.toFixed(2).replace('.', ',')}
                                        </td>
                                    </tr>

                                    {/* Total Geral */}
                                    <tr className="bg-gradient-to-r from-purple-600/30 to-blue-500/30">
                                        <td colSpan="4" className="px-4 py-4 text-right text-white font-bold text-lg">
                                            TOTAL GERAL:
                                        </td>
                                        <td className="px-4 py-4 text-right text-purple-400 font-bold text-2xl">
                                            R$ {(relatorio.pedido.valor_total + relatorio.taxa_entrega).toFixed(2).replace('.', ',')}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* QR Code e Instruções de Pagamento */}
                <div className="grid md:grid-cols-2 gap-6 items-start">
                    {/* QR Code */}
                    <div className="bg-white/5 rounded-xl p-6 border border-white/10 text-center">
                        <h3 className="text-xl font-bold mb-4 text-white">Pague com PIX</h3>
                        <div className="bg-white p-4 rounded-lg inline-block mb-4">
                            <img
                                src={getImageUrl(relatorio.qr_code_url)}
                                alt="QR Code PIX"
                                className="w-64 h-64 mx-auto"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'block';
                                }}
                            />
                            <div style={{ display: 'none' }} className="text-gray-800 p-4">
                                QR Code não disponível
                            </div>
                        </div>
                        <p className="text-xs text-text-secondary">
                            Escaneie o QR Code acima para efetuar o pagamento via PIX
                        </p>
                    </div>

                    {/* Instruções */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <div className="flex items-start gap-3 mb-4">
                            <AlertCircle className="text-yellow-400 flex-shrink-0 mt-1" size={24} />
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">IMPORTANTE</h3>
                                <p className="text-white font-semibold text-lg leading-relaxed">
                                    O PIX DEVE SER FEITO PELO QR CODE AO LADO E O COMPROVANTE
                                    DEVE SER ENVIADO PARA O MEU TEAMS.
                                </p>
                            </div>
                        </div>

                        <div className="bg-black/30 rounded-lg p-4 mt-4">
                            <p className="text-center text-white font-bold mb-2">Responsável:</p>
                            <p className="text-center text-secondary text-lg font-bold">
                                {relatorio.nome_responsavel}
                            </p>
                            <p className="text-center text-text-secondary text-sm mt-2">
                                (Lelo)
                            </p>
                        </div>

                        <div className="mt-6 text-center">
                            <p className="text-white font-semibold mb-2">
                                Envie o comprovante pelo Teams: rsantos14@tjsp.jus.br
                            </p>
                            <p className="text-text-secondary text-sm">
                                Aguardamos sua confirmação de pagamento!
                            </p>
                        </div>
                    </div>
                </div>

                {/* Mensagem Final */}
                <div className="mt-8 text-center bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl p-6 border border-primary/30">
                    <p className="text-2xl font-bold text-white mb-2">
                        🍕 ESPERO QUE SEJA UM MOMENTO DE INTEGRAÇÃO, 🍕
                    </p>
                    <p className="text-2xl font-bold text-white">
                        ✨ ALEGRIA E CELEBRAÇÃO!!! ✨
                    </p>
                </div>
            </div>
        );
    };

    if (loading) return <Loading message="Carregando informações de pagamento..." />;

    return (
        <div className="min-h-screen pb-12">
            <Header />

            <div className="container mx-auto px-4 py-8">
                <div className="mb-10 text-center">
                    <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-3">
                        Pagamentos
                    </h1>
                    <p className="text-text-secondary text-lg">
                        Visualize seu histórico de pedidos e efetue o pagamento
                    </p>
                </div>

                {error && (
                    <div className="card mb-6 border-red-500/30 bg-red-500/10">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="text-red-400" />
                            <p className="text-red-400">{error}</p>
                        </div>
                    </div>
                )}

                {successMessage && (
                    <div className="card mb-6 border-green-500/30 bg-green-500/10">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="text-green-400" />
                            <p className="text-green-400">{successMessage}</p>
                        </div>
                    </div>
                )}

                {renderHistorico()}
                {renderRelatorio()}
            </div>
        </div>
    );
};

export default Pagamentos;
