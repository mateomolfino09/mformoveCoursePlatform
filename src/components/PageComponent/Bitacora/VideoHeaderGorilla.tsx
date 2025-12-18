import { motion } from 'framer-motion';

type Props = {
  level: number;
  gorillaIcon: string;
  evolutionName?: string;
  progressToNextLevel?: number;
  monthsCompleted?: number;
};

/**
 * Versión compacta pensada para el header de video en bitácora.
 * Mantiene el ícono con badge de nivel en un contenedor pequeño.
 */
const VideoHeaderGorilla = ({
  level,
  gorillaIcon,
}: Props) => {
  return (
    <div className="relative w-12 h-12 md:w-14 md:h-14">
      <div className="absolute inset-0 rounded-full bg-white/10 border border-white/20 shadow-lg backdrop-blur-sm" />
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="flex items-center justify-center w-full h-full text-2xl md:text-3xl leading-none text-amber-400 drop-shadow"
      >
        {gorillaIcon}
      </motion.div>
      <div className="absolute -top-1 -right-1 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 border border-white/60 shadow-md px-1.5 py-[2px] min-w-[1.5rem] h-6 flex items-center justify-center">
        <span className="text-white text-[10px] md:text-xs font-bold leading-none">
          {level}
        </span>
      </div>
    </div>
  );
};

export default VideoHeaderGorilla;
