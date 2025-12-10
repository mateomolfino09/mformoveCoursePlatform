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
}

const GorillaLevelDisplay = ({
  level,
  gorillaIcon,
  evolutionName,
  progressToNextLevel,
  monthsCompleted,
  size = 'md',
  showProgressBar = true,
  showLevel = true
}: GorillaLevelDisplayProps) => {
  const sizeClasses = {
    sm: {
      icon: 'text-3xl',
      level: 'text-sm',
      name: 'text-xs',
      container: 'p-3'
    },
    md: {
      icon: 'text-5xl',
      level: 'text-base',
      name: 'text-sm',
      container: 'p-4'
    },
    lg: {
      icon: 'text-7xl',
      level: 'text-xl',
      name: 'text-base',
      container: 'p-6'
    }
  };

  const currentSize = sizeClasses[size];

  // Calcular el siguiente nivel (próximo múltiplo de 10 o nivel actual + 1)
  const nextLevel = Math.ceil(level / 10) * 10;
  const currentEvolutionLevel = Math.floor((level - 1) / 10) * 10 + 10;

  return (
    <div className={`flex flex-col items-center ${currentSize.container}`}>
      {/* Contenedor del gorila con nivel */}
      <div className="relative mb-3">
        {/* Icono del gorila */}
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className={`${currentSize.icon} relative`}
        >
          {gorillaIcon}
        </motion.div>

        {/* Badge de nivel */}
        {showLevel && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="absolute -bottom-2 -right-2 bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center min-w-[2rem] h-8 px-2"
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

      {/* Nombre de evolución */}
      <div className="text-center mb-2">
        <p className={`${currentSize.name} font-medium font-montserrat`} style={{ color: EARTH_BROWN }}>
          {evolutionName}
        </p>
        <p className={`text-xs font-light font-montserrat`} style={{ color: NATURAL_GRAY }}>
          {monthsCompleted} {monthsCompleted === 1 ? 'mes' : 'meses'} completados
        </p>
      </div>

      {/* Barra de progreso hacia el siguiente nivel */}
      {showProgressBar && (
        <div className="w-full max-w-xs">
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

