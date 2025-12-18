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
  isMember?: boolean;
  isVip?: boolean;
  hasActiveSubscription?: boolean;
  onlyGorila?: boolean;
}

const MoveCrewFeaturesNav = ({ 
  coherenceStreak = null, 
  hasBitacoraContent = false,
  isMember = false,
  isVip = false,
  hasActiveSubscription = false,
  onlyGorila = false
}: MoveCrewFeaturesNavProps) => {
  const canAccess = isVip || hasActiveSubscription || isMember;

  const features = [
    {
      name: 'Ir a Camino del Gorila',
      href: routes.navegation.membership.bitacora,
      icon: FireIcon,
      available: true,
      desc: 'Tu ruta semanal guiada y bitácora de progreso.',
      badge: coherenceStreak && coherenceStreak > 0 ? coherenceStreak : null
    },
    ...(!onlyGorila ? [
      {
        name: 'Biblioteca de Clases',
        href: routes.navegation.membership.home,
        icon: VideoCameraIcon,
        available: true,
        desc: 'Clases on demand y programas listos para seguir cuando quieras.'
      },
      {
        name: 'Comunidad',
        href: routes.navegation.eventos,
        icon: CalendarDaysIcon,
        available: true,
        desc: 'Eventos, Q&A y acompañamiento grupal para sostener tu proceso.'
      }
    ] : [])
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
            <Link
              href={canAccess ? feature.href : routes.navegation.membership.moveCrew}
              className="group"
            >
              <div
                className={`relative flex items-center justify-center px-4 py-2 rounded-full min-w-[190px] h-12 transition-all cursor-pointer shadow-md hover:shadow-lg ${
                  canAccess
                    ? 'bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-rose-500/20 backdrop-blur-md border border-amber-300/40 hover:from-amber-400/30 hover:via-orange-400/30 hover:to-rose-400/30'
                    : 'bg-gray-800/50 border border-white/5 opacity-80 hover:opacity-100'
                }`}
              >
                <span className={`text-sm font-semibold font-montserrat drop-shadow ${canAccess ? 'text-white' : 'text-gray-200'}`}>
                  {feature.name}
                </span>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default MoveCrewFeaturesNav;

