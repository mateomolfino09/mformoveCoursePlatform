'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  FireIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  VideoCameraIcon,
  ChartBarIcon
} from '@heroicons/react/24/solid';
import { routes } from '../../../constants/routes';

interface MoveCrewQuickAccessProps {
  coherenceStreak?: number | null;
  hasBitacoraContent?: boolean;
}

const MoveCrewQuickAccess = ({ 
  coherenceStreak = null, 
  hasBitacoraContent = true 
}: MoveCrewQuickAccessProps) => {
  const features = [
    {
      name: 'Bitácora',
      description: 'Camino del Gorila',
      href: routes.navegation.membership.bitacora,
      icon: FireIcon,
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-500/10',
      textColor: 'text-amber-600',
      available: hasBitacoraContent,
      badge: coherenceStreak && coherenceStreak > 0 ? coherenceStreak : null
    },
    {
      name: 'Clases',
      description: 'Entrenamientos',
      href: routes.navegation.membership.home,
      icon: VideoCameraIcon,
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-500/10',
      textColor: 'text-amber-600',
      available: true
    },
    {
      name: 'Eventos',
      description: 'Próximos eventos',
      href: routes.navegation.eventos,
      icon: CalendarDaysIcon,
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-500/10',
      textColor: 'text-amber-600',
      available: true
    },
    {
      name: 'Cursos',
      description: 'Programas completos',
      href: routes.navegation.products,
      icon: BookOpenIcon,
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-500/10',
      textColor: 'text-amber-600',
      available: true
    }
  ];

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative w-full"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isDisabled = !feature.available;
            
            return (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ scale: isDisabled ? 1 : 1.05 }}
                whileTap={{ scale: isDisabled ? 1 : 0.95 }}
              >
                {isDisabled ? (
                  <div className="relative p-3 md:p-4 rounded-full bg-gray-800/50 border border-white/5 cursor-not-allowed opacity-50">
                    <div className="flex items-center justify-center gap-2">
                      <Icon className="w-4 md:w-5 h-4 md:h-5 text-gray-400" />
                      <span className="text-xs md:text-sm font-light text-gray-400 font-montserrat">
                        {feature.name}
                      </span>
                      {feature.badge && (
                        <span className="text-xs font-light text-gray-400 bg-gray-700/50 px-2 py-1 rounded-full font-montserrat">
                          {feature.badge}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <Link href={feature.href}>
                    <div className="relative p-3 md:p-4 rounded-full bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-rose-500/20 backdrop-blur-md border border-amber-300/40 hover:from-amber-400/30 hover:via-orange-400/30 hover:to-rose-400/30 transition-all cursor-pointer group shadow-md hover:shadow-lg">
                      <div className="flex items-center justify-center gap-2">
                        <Icon className="w-4 md:w-5 h-4 md:h-5 text-white" />
                        <span className="text-xs md:text-sm font-light text-white font-montserrat">
                          {feature.name}
                        </span>
                        {feature.badge && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-xs font-light text-white bg-gradient-to-r from-amber-500 to-orange-500 px-2 py-1 rounded-full shadow-md font-montserrat"
                          >
                            {feature.badge}
                          </motion.span>
                        )}
                      </div>
                    </div>
                  </Link>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default MoveCrewQuickAccess;

