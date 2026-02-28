import { motion } from 'framer-motion';
import { useMemo, useEffect } from 'react';

type Props = {
  level: number;
  gorillaIcon: string;
  evolutionName?: string;
  progressToNextLevel?: number;
  monthsCompleted?: number;
  levelProgress?: number; // Progreso de nivel (0-8)
};

/**
 * Versión compacta pensada para el header de video en camino.
 * Mantiene el ícono con badge de nivel en un contenedor pequeño.
 */
const VideoHeaderGorilla = ({
  level,
  gorillaIcon,
  levelProgress,
}: Props) => {
  const progressPercent = levelProgress !== undefined && levelProgress !== null ? (levelProgress / 8) * 100 : 0;
  
  // Generar ID único para el gradiente
  const progressGradientId = useMemo(() => `videoLevelProgressGradient-${Math.random().toString(36).substr(2, 9)}`, []);
  
  // Calcular el círculo completo de progreso (360 grados)
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  // strokeDasharray: [longitud visible, longitud invisible]
  // strokeDashoffset: cuanto desplazar el inicio
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference * (1 - progressPercent / 100);
  
  return (
    <div className="relative w-12 h-12 md:w-14 md:h-14">
      {/* Círculo SVG de fondo */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full z-0 transform -rotate-90" style={{ pointerEvents: 'none' }}>
        {/* Círculo de fondo */}
        <circle cx="50" cy="50" r="48" fill="rgba(255, 255, 255, 0.1)" />
        {/* Círculo de fondo (referencia) */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="rgba(249, 115, 22, 0.2)"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 rounded-full bg-palette-stone/20 border border-palette-stone/30 shadow-lg backdrop-blur-sm z-10" />
      <div
        className="flex items-center justify-center w-full h-full text-2xl md:text-3xl leading-none text-palette-sage drop-shadow relative z-20"
      >
        {gorillaIcon}
      </div>
      {/* SVG del círculo de progreso - por encima del gorila */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full z-30 transform -rotate-90" style={{ pointerEvents: 'none' }}>
        {/* Círculo de progreso de nivel */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={`url(#${progressGradientId})`}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-500 ease-out"
          style={{ 
            opacity: 1
          }}
          data-debug={`progress: ${progressPercent}%, dashoffset: ${strokeDashoffset}, dasharray: ${strokeDasharray}`}
        />
        <defs>
          <linearGradient id={progressGradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#F97316" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#E11D48" stopOpacity="0.9" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute -top-1 -right-1 rounded-full bg-palette-sage border border-palette-stone/40 shadow-md px-1.5 py-[2px] min-w-[1.5rem] h-6 flex items-center justify-center z-40">
        <span className="text-palette-ink text-[10px] md:text-xs font-bold leading-none">
          {level}
        </span>
      </div>
    </div>
  );
};

export default VideoHeaderGorilla;
