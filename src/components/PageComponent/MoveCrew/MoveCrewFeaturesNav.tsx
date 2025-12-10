'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  FireIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  VideoCameraIcon,
} from '@heroicons/react/24/solid';
import { routes } from '../../../constants/routes';

interface MoveCrewFeaturesNavProps {
  coherenceStreak?: number | null;
  hasBitacoraContent?: boolean;
}

const MoveCrewFeaturesNav = ({ 
  coherenceStreak = null, 
  hasBitacoraContent = false 
}: MoveCrewFeaturesNavProps) => {
  const features = [
    {
      name: 'Bitácora',
      href: '/bitacora',
      icon: FireIcon,
      available: true,
      badge: coherenceStreak && coherenceStreak > 0 ? coherenceStreak : null
    },
    {
      name: 'Clases',
      href: routes.navegation.membresiaHome,
      icon: VideoCameraIcon,
      available: true
    },
    {
      name: 'Eventos',
      href: routes.navegation.eventos,
      icon: CalendarDaysIcon,
      available: true
    },
    {
      name: 'Cursos',
      href: routes.navegation.products,
      icon: BookOpenIcon,
      available: true
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex items-center justify-center gap-4 md:gap-6 flex-wrap"
    >
      {features.map((feature, index) => {
        const Icon = feature.icon;
        const isDisabled = !feature.available;
        
        return (
          <motion.div
            key={feature.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ scale: isDisabled ? 1 : 1.05, y: -2 }}
          >
            {isDisabled ? (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800/50 border border-white/5 cursor-not-allowed opacity-50">
                <Icon className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-light text-gray-400 font-montserrat">
                  {feature.name}
                </span>
              </div>
            ) : (
              <Link href={feature.href}>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-rose-500/20 backdrop-blur-md border border-amber-300/40 hover:from-amber-400/30 hover:via-orange-400/30 hover:to-rose-400/30 transition-all cursor-pointer group shadow-md hover:shadow-lg">
                  <Icon className="w-4 h-4 text-white" />
                  <span className="text-sm font-light text-white font-montserrat">
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
              </Link>
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default MoveCrewFeaturesNav;

