import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const OrderSuccessOverlay = ({ mode = 'created' }) => {
  const isEdit = mode === 'updated';

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/72 backdrop-blur-sm px-6 animate-orderSuccessBackdrop">
      <div className="relative flex w-full max-w-sm flex-col items-center text-center">
        <div className="absolute top-12 h-6 w-36 rounded-full bg-black/45 blur-md" />
        <div
          className="roger-order-success relative z-10"
          role="img"
          aria-label={isEdit ? 'Roger comemorando pedido atualizado' : 'Roger comemorando pedido concluido'}
        />

        <div className="mt-5 flex items-center gap-2 rounded-full border border-primary/25 bg-card/85 px-4 py-2 text-sm font-semibold text-text-primary shadow-card">
          <CheckCircle2 size={18} className="text-secondary" />
          {isEdit ? 'Pedido atualizado!' : 'Pedido registrado!'}
        </div>
      </div>

      <style>{`
        @keyframes orderSuccessBackdrop {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes rogerOrderSuccess {
          0%, 12% { background-position: 0% 0; }
          16%, 28% { background-position: 20% 0; }
          32%, 44% { background-position: 40% 0; }
          48%, 60% { background-position: 60% 0; }
          64%, 76% { background-position: 80% 0; }
          80%, 100% { background-position: 100% 0; }
        }
        .animate-orderSuccessBackdrop {
          animation: orderSuccessBackdrop 180ms ease-out both;
        }
        .roger-order-success {
          width: clamp(132px, 30vw, 188px);
          aspect-ratio: 362 / 588;
          background-image: url('/roger-order-success-sheet.png?v=keyed-1');
          background-repeat: no-repeat;
          background-size: 600% 100%;
          image-rendering: pixelated;
          image-rendering: crisp-edges;
          animation: rogerOrderSuccess 1s steps(1, end) infinite;
          filter: drop-shadow(0 14px 22px rgba(0, 0, 0, 0.5));
        }
      `}</style>
    </div>
  );
};

export default OrderSuccessOverlay;
