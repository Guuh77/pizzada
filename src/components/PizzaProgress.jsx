import React from 'react';

// Mapeia o número de pedaços para o arquivo de imagem correspondente
const getPizzaImage = (pedacos) => {
  const map = {
    1: '/pizza_1.png',
    2: '/pizza_2.png',
    3: '/pizza_3.png',
    4: '/pizza_4.png',
    5: '/pizza_5.png',
    6: '/pizza_6.png',
    7: '/pizza_7.png',
    8: '/pizza_8.png',
  };
  
  return map[pedacos] || '/pizza_1.png';
};

const PizzaProgress = ({ total_pedacos = 0, sabor = "Pizza" }) => {
  const pedacos = Math.max(0, Math.min(8, total_pedacos));
  const isComplete = pedacos === 8;

  if (pedacos === 0) {
    return (
      <div className="card flex flex-col items-center justify-center p-4 animate-fadeIn h-full">
        <h3 className="text-lg font-bold text-text-primary mb-2 text-center">{sabor}</h3>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-text-secondary">Nenhum pedaço ainda</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card flex flex-col items-center p-4 animate-fadeIn">
      <h3 className="text-lg font-bold text-text-primary mb-2 text-center">{sabor}</h3>
      
      <div className="w-full max-w-[150px] aspect-square flex items-center justify-center">
        <img
          src={getPizzaImage(pedacos)}
          alt={`${sabor} - ${pedacos} de 8 pedaços`}
          className="w-full h-full object-contain"
        />
      </div>
      
      <div className="mt-2 text-center">
        <p className="text-2xl font-bold text-secondary">
          {pedacos} / 8
          <span className="text-sm font-normal text-text-secondary"> pedaços</span>
        </p>
        {isComplete && (
          <span className="text-green-600 font-semibold">Completa!</span>
        )}
      </div>
    </div>
  );
};

// Componente Meio a Meio atualizado
export const MeiaPizzaProgress = ({ sabor1 = "Sabor 1", sabor2 = "Sabor 2" }) => (
   // O "bg-red-50" FOI REMOVIDO DAQUI
   <div className="card flex flex-col items-center p-4 animate-fadeIn">
      <h3 className="text-lg font-bold text-primary mb-2">Meio a Meio</h3>
      
      <div className="w-full max-w-[150px] aspect-square flex items-center justify-center">
        <img
          src="/pizza_meia.png"
          alt={`Meio a Meio - ${sabor1} e ${sabor2}`}
          className="w-full h-full object-contain"
        />
      </div>

      <div className="mt-2 text-center">
        <p className="font-semibold text-text-primary">{sabor1}</p>
        <p className="font-semibold text-text-primary">{sabor2}</p>
        <span className="text-green-600 font-semibold">Completa!</span>
      </div>
    </div>
);

export default PizzaProgress;