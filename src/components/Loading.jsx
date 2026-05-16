import React, { useState, useEffect } from 'react';
import PremiumParticles from './PremiumParticles';

const frases = [
  'Preparando o forno...',
  'Escolhendo os melhores ingredientes...',
  'Amassando a massa...',
  'Adicionando o molho secreto...',
  'Gratinando o queijo...',
  'Quase pronto...',
  'Cortando os pedaços...',
];

const Loading = ({ message }) => {
  const [fraseIndex, setFraseIndex] = useState(0);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    setIsPremium(document.documentElement.getAttribute('data-theme') === 'premium');
    
    const fraseInterval = setInterval(() => {
      setFraseIndex(prev => (prev + 1) % frases.length);
    }, 2000);
    return () => clearInterval(fraseInterval);
  }, []);

  if (isPremium) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050505] overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <PremiumParticles />
        </div>
        
        {/* Giant background text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.02]">
          <span className="text-[20vw] font-black tracking-tighter text-[#D4A017] whitespace-nowrap">
            PREMIUM
          </span>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-8 px-6 max-w-md w-full">
          {/* Glowing Premium Crown Spinner */}
          <div className="relative">
            <div className="w-28 h-28 rounded-full border-4 border-[#D4A017]/20 flex items-center justify-center shadow-[0_0_40px_rgba(212,160,23,0.3)] backdrop-blur-md bg-black/40">
              <span className="text-6xl animate-pulse" style={{ animationDuration: '2s' }}>👑</span>
            </div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#D4A017] border-l-[#F2C037] animate-spin" style={{ animationDuration: '1.5s' }}></div>
          </div>

          {/* Message */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black premium-name drop-shadow-lg">
              {message || 'Carregando...'}
            </h2>
            <p className="text-[#D4D4D8] text-sm h-5 transition-all duration-500 animate-pulse tracking-widest uppercase font-medium">
              {frases[fraseIndex]}
            </p>
          </div>

          {/* Golden progress bar */}
          <div className="w-full max-w-xs h-1 bg-[#27251F] rounded-full overflow-hidden shadow-[0_0_10px_rgba(212,160,23,0.2)]">
            <div className="h-full w-1/3 bg-gradient-to-r from-[#B8860B] via-[#FFD700] to-[#D4A017] rounded-full animate-indeterminate" />
          </div>

          <style>{`
            @keyframes indeterminate {
              0% { transform: translateX(-100%); }
              50% { transform: translateX(250%); }
              100% { transform: translateX(-100%); }
            }
            .animate-indeterminate {
              animation: indeterminate 2s ease-in-out infinite;
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background overflow-hidden">
      {/* Giant background text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.03]">
        <span className="text-[20vw] font-black tracking-tighter text-text-primary whitespace-nowrap">
          PIZZADA
        </span>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-6 max-w-md w-full">
        {/* Pizza emoji spinner */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-4 border-border-color flex items-center justify-center">
            <span className="text-5xl animate-spin" style={{ animationDuration: '3s' }}>🍕</span>
          </div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" style={{ animationDuration: '1.5s' }}></div>
        </div>

        {/* Message */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-text-primary">
            {message || 'Carregando...'}
          </h2>
          <p className="text-text-secondary text-sm h-5 transition-all duration-500 animate-pulse">
            {frases[fraseIndex]}
          </p>
        </div>

        {/* Indeterminate progress bar */}
        <div className="w-full max-w-xs h-1.5 bg-border-color rounded-full overflow-hidden">
          <div className="h-full w-1/3 bg-gradient-to-r from-primary to-secondary rounded-full animate-indeterminate" />
        </div>

        <style>{`
          @keyframes indeterminate {
            0% { transform: translateX(-100%); }
            50% { transform: translateX(250%); }
            100% { transform: translateX(-100%); }
          }
          .animate-indeterminate {
            animation: indeterminate 1.8s ease-in-out infinite;
          }
        `}</style>
      </div>
    </div>
  );
};

export default Loading;