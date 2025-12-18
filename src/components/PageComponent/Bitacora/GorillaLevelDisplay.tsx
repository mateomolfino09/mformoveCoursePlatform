'use client';

import { motion } from 'framer-motion';

// Colores naturales Move Crew
const SALMON = '#F97316';
const SALMON_SOFT = '#FED7AA';
const SALMON_DARK = '#EA580C';
const EARTH_BROWN = '#8B4513';
const NATURAL_GRAY = '#6B7280';

interface GorillaLevelDisplayProps {
  level: number;
  gorillaIcon: string;
  evolutionName: string;
  progressToNextLevel: number;
  monthsCompleted: number;
  size?: 'sm' | 'md' | 'lg';
  showProgressBar?: boolean;
  showLevel?: boolean;
  layout?: 'default' | 'centered';
  showInfoText?: boolean;
}

const GorillaLevelDisplay = ({
  level,
  gorillaIcon,
  evolutionName,
  progressToNextLevel,
  monthsCompleted,
  size = 'md',
  showProgressBar = true,
  showLevel = true,
  layout = 'default',
  showInfoText = true
}: GorillaLevelDisplayProps) => {
  const sizeClasses = {
    sm: {
      icon: 'text-3xl',
      circle: 'w-16 h-16',
      level: 'text-sm',
      name: 'text-xs',
      container: 'p-3'
    },
    md: {
      // Más contraste entre mobile y desktop
      icon: 'text-5xl md:text-6xl',
      circle: 'w-24 h-24 md:w-28 md:h-28',
      level: 'text-base md:text-lg',
      name: 'text-sm md:text-base',
      container: 'p-4 md:p-5'
    },
    lg: {
      icon: 'text-6xl md:text-8xl',
      circle: 'w-28 h-28 md:w-36 md:h-36',
      level: 'text-xl md:text-2xl',
      name: 'text-base md:text-lg',
      container: 'p-5 md:p-6'
    }
  };

  // Normaliza el size para evitar valores inesperados
  const normalizedSize: keyof typeof sizeClasses =
    size === 'lg' ? 'lg' : size === 'md' ? 'md' : 'sm';
  const currentSize = sizeClasses[normalizedSize];
  const centeredCircle = 'w-16 h-16 md:w-20 md:h-20';

  // Calcular el siguiente nivel (próximo múltiplo de 10 o nivel actual + 1)
  const nextLevel = Math.ceil(level / 10) * 10;
  const currentEvolutionLevel = Math.floor((level - 1) / 10) * 10 + 10;
  const badgePosition = layout === 'centered' ? '-top-2 -right-2 translate-x-1' : '-bottom-2 -right-2';

  return (
    <div
      className={`flex flex-col items-center w-full max-w-sm ${currentSize.container}`}
      data-size={normalizedSize}
    >
      {/* Contenedor del gorila y nivel */}
      <div className="relative flex flex-col items-center">
        <div className={`relative flex items-center justify-center flex-shrink-0 ${layout === 'centered' ? centeredCircle : currentSize.circle}`}>
          {/* Círculo SVG envolviendo al icono */}
          <svg viewBox="0 0 120 120" className="absolute inset-0 w-full h-full" role="presentation">
            <circle cx="60" cy="60" r="58" fill="#fff" />
            <circle cx="60" cy="60" r="58" fill="url(#gorillaGradient)" fillOpacity="0.08" />
            <circle cx="60" cy="60" r="55" fill="none" stroke="#F97316" strokeOpacity="0.18" strokeWidth="4" />
            <defs>
              <linearGradient id="gorillaGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="50%" stopColor="#F97316" />
                <stop offset="100%" stopColor="#E11D48" />
              </linearGradient>
            </defs>
          </svg>

          {/* Icono del gorila */}
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className={`${currentSize.icon} relative z-10 flex items-center justify-center text-orange-600 leading-none`}
            style={{ filter: 'drop-shadow(0 2px 6px rgba(249,115,22,0.25))' }}
          >
            {gorillaIcon}
          </motion.div>

          {/* Badge de nivel */}
          {showLevel && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className={`absolute ${badgePosition} bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center min-w-[2rem] h-8 px-2`}
              style={{
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)'
              }}
            >
              <span className="text-white font-bold text-xs md:text-sm">
                {level}
              </span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Nombre de evolución */}
      {showInfoText && (
        <div className="text-center mt-4 mb-2">
          <p className={`${currentSize.name} font-medium font-montserrat`} style={{ color: EARTH_BROWN }}>
            {evolutionName}
          </p>
          <p className={`text-xs font-light font-montserrat`} style={{ color: NATURAL_GRAY }}>
            {monthsCompleted} {monthsCompleted === 1 ? 'mes' : 'meses'} completados
          </p>
        </div>
      )}

      {/* Barra de progreso hacia el siguiente nivel */}
      {showProgressBar && (
        <div className="w-full max-w-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-light font-montserrat" style={{ color: NATURAL_GRAY }}>
              Nivel {level}
            </span>
            <span className="text-xs font-light font-montserrat" style={{ color: NATURAL_GRAY }}>
              Nivel {currentEvolutionLevel}
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressToNextLevel}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, rgba(245, 158, 11, 0.9) 0%, rgba(249, 115, 22, 0.9) 50%, rgba(225, 29, 72, 0.9) 100%)`,
                boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)'
              }}
            />
          </div>
          <p className="text-xs font-light font-montserrat text-center mt-1" style={{ color: NATURAL_GRAY }}>
            {progressToNextLevel}% hacia el siguiente nivel
          </p>
        </div>
      )}
    </div>
  );
};

export default GorillaLevelDisplay;


