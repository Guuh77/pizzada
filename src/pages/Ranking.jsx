import React, { useState, useEffect } from 'react';
import { rankingService } from '../services/api';
import Header from '../components/Header';
import Loading from '../components/Loading';
import { Trophy, Medal, Award, TrendingUp, Pizza, Users, ShoppingBag } from 'lucide-react';

const Ranking = () => {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await rankingService.getRanking();
        setRanking(res.data);
      } catch {
        console.error("Erro ao carregar ranking");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Loading message="Carregando ranking..." />;

  const podium = ranking.slice(0, 3);
  const rest = ranking.slice(3);
  const maxPedacos = ranking[0]?.total_pedacos || 1;

  const PodiumCard = ({ item, position }) => {
    const configs = {
      0: { bg: 'from-yellow-500/20 to-yellow-600/5', border: 'border-yellow-500/40', text: 'text-yellow-500', icon: Trophy, emoji: '🥇', height: 'h-44 sm:h-52' },
      1: { bg: 'from-gray-400/20 to-gray-500/5', border: 'border-gray-400/40', text: 'text-gray-400', icon: Medal, emoji: '🥈', height: 'h-36 sm:h-44' },
      2: { bg: 'from-amber-700/20 to-amber-800/5', border: 'border-amber-700/40', text: 'text-amber-600', icon: Award, emoji: '🥉', height: 'h-32 sm:h-40' },
    };
    const config = configs[position];

    return (
      <div className={`flex flex-col items-center group ${position === 0 ? 'order-2' : position === 1 ? 'order-1' : 'order-3'}`}>
        <div className="text-4xl sm:text-5xl mb-3 group-hover:scale-110 transition-transform duration-300">
          {config.emoji}
        </div>
        <div className={`w-full bg-gradient-to-b ${config.bg} border ${config.border} rounded-2xl ${config.height} flex flex-col items-center justify-end pb-4 relative overflow-hidden transition-all duration-300 group-hover:scale-[1.02]`}>
          <h3 className="text-sm sm:text-base font-bold text-text-primary text-center px-2 leading-tight mb-2">{item.nome}</h3>
          <p className={`text-2xl sm:text-3xl font-black ${config.text} tabular-nums`}>{item.total_pedacos}</p>
          <p className="text-[10px] text-text-secondary mb-2">pedaços</p>
          <div className="flex gap-3 text-[10px] text-text-secondary">
            <span className="flex items-center gap-0.5">
              <ShoppingBag size={10} /> {item.total_pedidos}
            </span>
            <span className="flex items-center gap-0.5">
              <Users size={10} /> {item.total_participantes}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-8 py-6 lg:py-10">
        <div className="mb-10 animate-fadeIn">
          <h1 className="text-4xl sm:text-5xl font-black text-text-primary tracking-tight">
            Ranking <span className="text-primary">de Sabores</span>
          </h1>
          <p className="text-text-secondary mt-2">Os sabores mais pedidos de todos os tempos</p>
        </div>

        {ranking.length === 0 ? (
          <div className="card text-center py-16 animate-fadeIn">
            <Pizza size={48} className="text-text-secondary mx-auto mb-4" />
            <h2 className="text-xl font-bold text-text-primary mb-2">Nenhum dado ainda</h2>
            <p className="text-text-secondary">O ranking aparecerá após os primeiros pedidos.</p>
          </div>
        ) : (
          <div className="animate-fadeIn">
            {/* Podium */}
            {podium.length > 0 && (
              <div className="grid grid-cols-3 gap-3 sm:gap-6 items-end mb-10 max-w-lg mx-auto">
                {podium.map((item, index) => (
                  <PodiumCard key={item.sabor_id} item={item} position={index} />
                ))}
              </div>
            )}

            {/* Table */}
            {rest.length > 0 && (
              <div className="card overflow-hidden">
                <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                  <TrendingUp size={20} className="text-primary" />
                  Classificação Geral
                </h2>
                <div className="space-y-2">
                  {rest.map((item, index) => (
                    <div key={item.sabor_id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group">
                      <span className="w-7 text-center text-text-secondary font-bold tabular-nums text-sm">{index + 4}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-text-primary text-sm group-hover:text-primary transition-colors truncate">{item.nome}</p>
                        <div className="w-full bg-white/5 rounded-full h-1 mt-1.5 overflow-hidden">
                          <div
                            className="h-full bg-primary/40 rounded-full transition-all duration-700"
                            style={{ width: `${(item.total_pedacos / maxPedacos) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-text-secondary tabular-nums shrink-0">
                        <span className="flex items-center gap-1" title="Pedaços">
                          <Pizza size={12} className="text-primary" /> <span className="font-bold text-text-primary">{item.total_pedacos}</span>
                        </span>
                        <span className="flex items-center gap-1" title="Pedidos">
                          <ShoppingBag size={12} /> {item.total_pedidos}
                        </span>
                        <span className="flex items-center gap-1" title="Pessoas">
                          <Users size={12} /> {item.total_participantes}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Ranking;
