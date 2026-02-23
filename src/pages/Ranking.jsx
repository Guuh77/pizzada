import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Loading from '../components/Loading';
import { rankingService } from '../services/api';
import { Trophy, Medal, TrendingUp, Users, Pizza } from 'lucide-react';

const Ranking = () => {
    const [ranking, setRanking] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRanking();
    }, []);

    const loadRanking = async () => {
        try {
            const res = await rankingService.getRanking();
            setRanking(res.data);
        } catch (err) {
            console.error('Erro ao carregar ranking:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loading />;

    const top3 = ranking.slice(0, 3);
    const rest = ranking.slice(3);
    const maxPedacos = ranking.length > 0 ? ranking[0].total_pedacos : 1;

    const podiumOrder = [top3[1], top3[0], top3[2]]; // 2nd, 1st, 3rd

    const getMedalColor = (pos) => {
        if (pos === 1) return 'from-yellow-400 to-amber-500';
        if (pos === 2) return 'from-gray-300 to-gray-400';
        if (pos === 3) return 'from-amber-600 to-amber-700';
        return 'from-gray-600 to-gray-700';
    };

    const getMedalEmoji = (pos) => {
        if (pos === 1) return '🥇';
        if (pos === 2) return '🥈';
        if (pos === 3) return '🥉';
        return `#${pos}`;
    };

    const getPodiumHeight = (pos) => {
        if (pos === 1) return 'h-36';
        if (pos === 2) return 'h-24';
        if (pos === 3) return 'h-16';
        return 'h-12';
    };

    return (
        <div className="min-h-screen">
            <Header />
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="mb-8 text-center animate-fadeIn">
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500 mb-2 flex items-center justify-center gap-3">
                        <Trophy className="text-yellow-400" size={40} />
                        Ranking de Sabores
                    </h1>
                    <p className="text-text-secondary">Os sabores mais pedidos de todos os tempos</p>
                </div>

                {ranking.length === 0 ? (
                    <div className="card text-center py-16 animate-fadeIn">
                        <Pizza size={64} className="mx-auto text-text-secondary mb-4 opacity-50" />
                        <h3 className="text-xl font-bold text-text-primary mb-2">Sem dados ainda</h3>
                        <p className="text-text-secondary">Nenhum pedido foi feito ainda. Seja o primeiro!</p>
                    </div>
                ) : (
                    <>
                        {/* Podium */}
                        {top3.length >= 3 && (
                            <div className="card mb-8 animate-fadeIn">
                                <div className="flex items-end justify-center gap-4 pt-8 pb-4">
                                    {podiumOrder.map((item, idx) => {
                                        if (!item) return null;
                                        const heights = ['h-24', 'h-36', 'h-16'];
                                        const sizes = ['text-3xl', 'text-5xl', 'text-2xl'];
                                        const paddings = ['pt-6', 'pt-4', 'pt-8'];

                                        return (
                                            <div key={item.sabor_id} className={`flex flex-col items-center ${paddings[idx]}`}>
                                                <span className={`${sizes[idx]} mb-2`}>{getMedalEmoji(item.posicao)}</span>
                                                <p className="text-sm font-bold text-text-primary text-center mb-1 max-w-[100px] truncate">
                                                    {item.nome}
                                                </p>
                                                <p className="text-xs text-text-secondary mb-3">{item.total_pedacos} pedaços</p>
                                                <div className={`w-24 sm:w-32 ${heights[idx]} rounded-t-xl bg-gradient-to-t ${getMedalColor(item.posicao)} flex items-start justify-center pt-3`}>
                                                    <span className="text-2xl font-bold text-white drop-shadow-lg">{item.posicao}°</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Full ranking table */}
                        <div className="card animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                            <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
                                <TrendingUp className="text-primary" size={24} />
                                Classificação Geral
                            </h2>

                            <div className="space-y-3">
                                {ranking.map((item) => (
                                    <div
                                        key={item.sabor_id}
                                        className={`flex items-center gap-4 p-4 rounded-xl transition-all hover:bg-white/5 ${item.posicao <= 3 ? 'bg-white/5 border border-white/10' : ''
                                            }`}
                                    >
                                        <div className="w-10 text-center">
                                            {item.posicao <= 3 ? (
                                                <span className="text-2xl">{getMedalEmoji(item.posicao)}</span>
                                            ) : (
                                                <span className="text-lg font-bold text-text-secondary">#{item.posicao}</span>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-bold text-text-primary truncate">{item.nome}</span>
                                                <span className="text-sm font-bold text-primary ml-2 whitespace-nowrap">
                                                    {item.total_pedacos} pedaços
                                                </span>
                                            </div>
                                            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-1000 ${item.posicao === 1
                                                            ? 'bg-gradient-to-r from-yellow-400 to-amber-500'
                                                            : item.posicao <= 3
                                                                ? 'bg-gradient-to-r from-primary to-primary-hover'
                                                                : 'bg-primary/60'
                                                        }`}
                                                    style={{ width: `${Math.max((item.total_pedacos / maxPedacos) * 100, 3)}%` }}
                                                />
                                            </div>
                                            <div className="flex gap-4 mt-1">
                                                <span className="text-xs text-text-secondary flex items-center gap-1">
                                                    <Pizza size={12} /> {item.total_pedidos} pedidos
                                                </span>
                                                <span className="text-xs text-text-secondary flex items-center gap-1">
                                                    <Users size={12} /> {item.total_participantes} pessoas
                                                </span>
                                                {item.tipo === 'DOCE' && (
                                                    <span className="text-xs bg-pink-500/20 text-pink-400 px-2 py-0.5 rounded-full">🍫 Doce</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Ranking;
