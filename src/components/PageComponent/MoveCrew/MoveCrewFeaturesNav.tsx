'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  FireIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  VideoCameraIcon,
  LockClosedIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/solid';
import { routes } from '../../../constants/routes';
import { useAuth } from '../../../hooks/useAuth';

interface MoveCrewFeaturesNavProps {
  coherenceStreak?: number | null;
  hasWeeklyPathContent?: boolean;
  isMember?: boolean;
  isVip?: boolean;
  hasActiveSubscription?: boolean;
  onlyGorila?: boolean;
}

const TELEGRAM_LINK = 'https://t.me/+_9hJulwT690yNWFh';

const MoveCrewFeaturesNav = ({ 
  coherenceStreak = null, 
  hasWeeklyPathContent = false,
  isMember = false,
  isVip = false,
  hasActiveSubscription = false,
  onlyGorila = false
}: MoveCrewFeaturesNavProps) => {
  const router = useRouter();
  const auth = useAuth();
  const canAccess = isVip || hasActiveSubscription || isMember;
  
  // Verificar estado de onboarding
  const contratoAceptado = auth.user?.subscription?.onboarding?.contratoAceptado || false;
  
  // Después del Contrato (Bienvenida) se desbloquean: Telegram, Biblioteca y Camino Base
  // El Camino solo requiere contrato aceptado (Camino Base es opcional)
  const canAccessCaminoGorila = canAccess && contratoAceptado;
  const canAccessTelegram = canAccess && contratoAceptado;
  const canAccessBiblioteca = canAccess && contratoAceptado;

  const handleCaminoGorilaClick = (e: React.MouseEvent) => {
    if (!canAccessCaminoGorila) {
      e.preventDefault();
      if (!contratoAceptado) {
        router.push('/onboarding/bienvenida');
      }
    }
  };

  const features = [
    {
      name: 'Ir a Camino',
      href: routes.navegation.membership.weeklyPath,
      icon: FireIcon,
      available: canAccessCaminoGorila,
      locked: !canAccessCaminoGorila,
      desc: 'Tu ruta semanal guiada y camino de progreso.',
      badge: coherenceStreak && coherenceStreak > 0 ? coherenceStreak : null,
      onClick: handleCaminoGorilaClick
    },
    ...(!onlyGorila ? [
      {
        name: 'Biblioteca de Clases',
        href: routes.navegation.membership.library,
        icon: VideoCameraIcon,
        available: canAccessBiblioteca, // Requiere contrato aceptado
        locked: !canAccessBiblioteca,
        desc: 'Clases on demand y programas listos para seguir cuando quieras.'
      },
      {
        name: 'Unite a la Crew',
        href: TELEGRAM_LINK,
        icon: ChatBubbleLeftRightIcon,
        available: canAccessTelegram, // Requiere contrato aceptado
        locked: !canAccessTelegram,
        desc: 'Grupo de Telegram para soporte, avisos y novedades.',
        external: true
      },
      {
        name: 'Comunidad',
        href: routes.navegation.eventos,
        icon: CalendarDaysIcon,
        available: canAccess,
        locked: false,
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
        const isLocked = feature.locked;
        
        const content = (
          <div
            className={`relative flex items-center justify-center gap-2 px-4 py-2 rounded-full min-w-[190px] h-12 transition-all cursor-pointer shadow-md hover:shadow-lg ${
              isDisabled || isLocked
                ? 'bg-gray-800/50 border border-white/10 opacity-60 cursor-not-allowed'
                : canAccess
                ? 'bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-rose-500/20 backdrop-blur-md border border-amber-300/40 hover:from-amber-400/30 hover:via-orange-400/30 hover:to-rose-400/30'
                : 'bg-gray-800/50 border border-white/5 opacity-80 hover:opacity-100'
            }`}
          >
            {isLocked && (
              <LockClosedIcon className="w-4 h-4 text-white/60" />
            )}
            <span className={`text-sm font-semibold font-montserrat drop-shadow ${isDisabled || isLocked ? 'text-gray-400' : canAccess ? 'text-white' : 'text-gray-200'}`}>
              {feature.name}
            </span>
            {feature.badge && !isLocked && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {feature.badge}
              </span>
            )}
          </div>
        );

        if (feature.external) {
          return (
            <motion.a
              key={feature.name}
              href={feature.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: isDisabled ? 1 : 1.05, y: -2 }}
              className="group"
            >
              {content}
            </motion.a>
          );
        }

        return (
          <motion.div
            key={feature.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ scale: isDisabled || isLocked ? 1 : 1.05, y: -2 }}
          >
            <Link
              href={canAccess ? feature.href : routes.navegation.membership.moveCrew}
              onClick={feature.onClick}
              className="group"
            >
              {content}
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default MoveCrewFeaturesNav;

