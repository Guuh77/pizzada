import React from 'react';

// Helper to generate SVG path for a slice (wedge)
const getSlicePath = (index, totalSlices, radius, center) => {
  const startAngle = (index * 360) / totalSlices;
  const endAngle = ((index + 1) * 360) / totalSlices;

  // Convert degrees to radians, subtracting 90deg to start at 12 o'clock
  const startRad = (startAngle - 90) * (Math.PI / 180);
  const endRad = (endAngle - 90) * (Math.PI / 180);

  const x1 = center + radius * Math.cos(startRad);
  const y1 = center + radius * Math.sin(startRad);
  const x2 = center + radius * Math.cos(endRad);
  const y2 = center + radius * Math.sin(endRad);

  return `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;
};

// Helper to generate SVG path for the crust (outer arc)
const getCrustPath = (index, totalSlices, radius, center, crustWidth) => {
  const startAngle = (index * 360) / totalSlices;
  const endAngle = ((index + 1) * 360) / totalSlices;

  const startRad = (startAngle - 90) * (Math.PI / 180);
  const endRad = (endAngle - 90) * (Math.PI / 180);

  const outerRadius = radius;
  const innerRadius = radius - crustWidth;

  const x1_out = center + outerRadius * Math.cos(startRad);
  const y1_out = center + outerRadius * Math.sin(startRad);
  const x2_out = center + outerRadius * Math.cos(endRad);
  const y2_out = center + outerRadius * Math.sin(endRad);

  const x1_in = center + innerRadius * Math.cos(startRad);
  const y1_in = center + innerRadius * Math.sin(startRad);
  const x2_in = center + innerRadius * Math.cos(endRad);
  const y2_in = center + innerRadius * Math.sin(endRad);

  return `M ${x1_in} ${y1_in} L ${x1_out} ${y1_out} A ${outerRadius} ${outerRadius} 0 0 1 ${x2_out} ${y2_out} L ${x2_in} ${y2_in} A ${innerRadius} ${innerRadius} 0 0 0 ${x1_in} ${y1_in} Z`;
};

const PizzaSlice = ({ index, totalSlices, radius, center, color }) => {
  return (
    <g className="transition-all duration-300 hover:opacity-90 hover:scale-105 origin-center">
      {/* Base Slice (Cheese/Sauce) */}
      <path
        d={getSlicePath(index, totalSlices, radius, center)}
        fill={color}
        stroke="rgba(0,0,0,0.1)"
        strokeWidth="1"
      />

      {/* Crust */}
      <path
        d={getCrustPath(index, totalSlices, radius, center, 6)}
        fill="#D97706" // Golden brown crust
        stroke="rgba(0,0,0,0.1)"
        strokeWidth="0.5"
      />
    </g>
  );
};

export const PizzaSVG = ({ slices, totalSlices = 8, color = "#FACC15", secondaryColor = null }) => {
  const radius = 50;
  const center = 55;
  const size = 110;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-lg">
      {/* Background circle for empty tray */}
      <circle cx={center} cy={center} r={radius} fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 4" />

      {Array.from({ length: totalSlices }).map((_, i) => {
        let sliceColor = null;

        if (secondaryColor) {
          if (i < 4) {
            sliceColor = color;
          } else if (i < 8) {
            sliceColor = secondaryColor;
          }
        } else {
          if (i < slices) {
            sliceColor = color;
          }
        }

        if (!sliceColor) return null;

        return (
          <PizzaSlice
            key={i}
            index={i}
            totalSlices={totalSlices}
            radius={radius}
            center={center}
            color={sliceColor}
          />
        );
      })}
    </svg>
  );
};

const PizzaProgress = ({ total_pedacos = 0, sabor = "Pizza", color = "#FACC15" }) => {
  const pedacos = Math.max(0, Math.min(8, total_pedacos));
  const isComplete = pedacos === 8;

  if (pedacos === 0) {
    return (
      <div className="card flex flex-col items-center justify-center p-4 animate-fadeIn h-full min-h-[200px]">
        <h3 className="text-lg font-bold text-text-primary mb-2 text-center">{sabor}</h3>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center group hover:border-white/20 transition-colors">
            <span className="text-text-secondary text-xs group-hover:text-white transition-colors">Vazio</span>
          </div>
        </div>
        <p className="text-text-secondary mt-2 text-sm">Nenhum pedaço ainda</p>
      </div>
    );
  }

  return (
    <div className="card flex flex-col items-center p-4 animate-fadeIn h-full justify-between">
      <h3 className="text-lg font-bold text-text-primary mb-4 text-center h-14 flex items-center justify-center w-full leading-tight">
        {sabor}
      </h3>

      <div className="flex items-center justify-center py-2 transform hover:scale-105 transition-transform duration-500">
        <PizzaSVG slices={pedacos} color={color} />
      </div>

      <div className="mt-4 text-center w-full">
        <div className="flex justify-center items-baseline space-x-1">
          <span className="text-3xl font-bold text-primary drop-shadow-neon">{pedacos}</span>
          <span className="text-text-secondary">/ 8</span>
        </div>
        {isComplete && (
          <div className="mt-2 inline-block px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-full animate-pulse-slow">
            <span className="text-green-400 text-sm font-bold uppercase tracking-wider">Completa!</span>
          </div>
        )}
      </div>
    </div>
  );
};

export const MeiaPizzaProgress = ({ sabor1 = "Sabor 1", sabor2 = "Sabor 2", color1 = "#FACC15", color2 = "#EF4444" }) => (
  <div className="card flex flex-col items-center p-4 animate-fadeIn h-full justify-between">
    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
      <span className="w-3 h-3 rounded-full shadow-[0_0_5px_rgba(0,0,0,0.5)]" style={{ backgroundColor: color1 }}></span>
      Meio a Meio
      <span className="w-3 h-3 rounded-full shadow-[0_0_5px_rgba(0,0,0,0.5)]" style={{ backgroundColor: color2 }}></span>
    </h3>

    <div className="flex items-center justify-center py-2 transform hover:scale-105 transition-transform duration-500">
      <PizzaSVG slices={8} color={color1} secondaryColor={color2} />
    </div>

    <div className="mt-4 w-full space-y-2">
      <div className="flex items-center justify-between text-sm bg-white/5 p-2 rounded hover:bg-white/10 transition-colors">
        <span className="text-text-secondary truncate max-w-[100px]" title={sabor1}>{sabor1}</span>
        <div className="w-3 h-3 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]" style={{ backgroundColor: color1 }}></div>
      </div>
      <div className="flex items-center justify-between text-sm bg-white/5 p-2 rounded hover:bg-white/10 transition-colors">
        <span className="text-text-secondary truncate max-w-[100px]" title={sabor2}>{sabor2}</span>
        <div className="w-3 h-3 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]" style={{ backgroundColor: color2 }}></div>
      </div>
      <div className="text-center mt-2">
        <span className="text-green-400 text-xs font-bold uppercase tracking-wider">Completa!</span>
      </div>
    </div>
  </div>
);

export default PizzaProgress;