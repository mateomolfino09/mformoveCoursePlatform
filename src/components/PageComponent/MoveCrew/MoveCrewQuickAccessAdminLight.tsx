'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  FireIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  VideoCameraIcon,
  ChartBarIcon,
  BuildingStorefrontIcon,
  UserIcon
} from '@heroicons/react/24/solid';
import { routes } from '../../../constants/routes';
import { useAuth } from '../../../hooks/useAuth';
import { useEffect, useState } from 'react';

const MoveCrewQuickAccessAdminLight = () => {
  const auth = useAuth();
  const [coherenceStreak, setCoherenceStreak] = useState<number | null>(null);
  const [hasBitacoraContent, setHasBitacoraContent] = useState<boolean>(false);
  const isMember = auth.user?.subscription?.active || auth.user?.isVip;

  useEffect(() => {
    if (isMember) {
      fetchCoherenceTracking();
      checkBitacoraContent();
    }
  }, [isMember]);

  const fetchCoherenceTracking = async () => {
    try {
      const response = await fetch('/api/coherence/tracking', {
        credentials: 'include',
        cache: 'no-store'
      });

      if (response.ok) {
        const data = await response.json();
        setCoherenceStreak(data.tracking?.currentStreak || 0);
      }
    } catch (err) {
      console.error('Error obteniendo tracking:', err);
    }
  };

  const checkBitacoraContent = async () => {
    try {
      const response = await fetch('/api/bitacora/current', {
        credentials: 'include',
        cache: 'no-store'
      });

      if (response.ok) {
        const data = await response.json();
        setHasBitacoraContent(data.logbook && data.weeklyContent && data.weeklyContent.isPublished);
      }
    } catch (err) {
      console.error('Error verificando bitácora:', err);
      setHasBitacoraContent(false);
    }
  };

  const adminFeatures = [
    {
      name: 'Bitácoras',
      description: 'Gestionar',
      href: '/admin/memberships/bitacora',
      icon: FireIcon,
      color: 'from-[#4F7CCF] to-[#234C8C]',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      name: 'Membresías',
      description: 'Administrar',
      href: '/admin/memberships',
      icon: BuildingStorefrontIcon,
      color: 'from-[#4F7CCF] to-[#234C8C]',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      name: 'Usuarios',
      description: 'Gestionar',
      href: '/admin/users',
      icon: UserIcon,
      color: 'from-[#4F7CCF] to-[#234C8C]',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    }
  ];

  const userFeatures = [
    {
      name: 'Bitácora',
      description: 'Camino del Gorila',
      href: '/bitacora',
      icon: FireIcon,
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-500/10',
      textColor: 'text-amber-600',
      available: hasBitacoraContent && isMember,
      badge: coherenceStreak && coherenceStreak > 0 ? coherenceStreak : null
    },
    {
      name: 'Clases',
      description: 'Entrenamientos',
      href: routes.navegation.membresiaHome,
      icon: VideoCameraIcon,
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-500/10',
      textColor: 'text-amber-600',
      available: isMember
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
    <div className="mb-8 space-y-6">
      {/* Admin Features */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white border border-gray-200 rounded-xl p-4 shadow-lg"
      >
        <div className="flex items-center gap-2 mb-3">
          <ChartBarIcon className="w-5 h-5 text-[#4F7CCF]" />
          <h3 className="text-sm font-light text-gray-900 font-montserrat uppercase tracking-wider">
            Admin - Acceso Rápido
          </h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {adminFeatures.map((feature, index) => {
            const Icon = feature.icon;
            
            return (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href={feature.href}>
                  <div className="relative p-4 rounded-lg bg-white border border-gray-200 hover:border-[#4F7CCF]/50 transition-all cursor-pointer group hover:shadow-md">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${feature.color} shadow-md group-hover:shadow-lg transition-shadow`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <h4 className="text-sm font-light text-gray-900 font-montserrat mb-1 group-hover:text-[#4F7CCF] transition-colors">
                      {feature.name}
                    </h4>
                    <p className="text-xs text-gray-600 font-montserrat">
                      {feature.description}
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* User Features - Solo si es miembro */}
      {isMember && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white border border-gray-200 rounded-xl p-4 shadow-lg"
        >
          <div className="flex items-center gap-2 mb-3">
            <ChartBarIcon className="w-5 h-5 text-amber-600" />
            <h3 className="text-sm font-light text-gray-900 font-montserrat uppercase tracking-wider">
              Move Crew - Acceso Rápido
            </h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {userFeatures.map((feature, index) => {
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
                    <div className="relative p-4 rounded-lg bg-gray-50 border border-gray-200 cursor-not-allowed opacity-50">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-gray-300">
                          <Icon className="w-5 h-5 text-gray-500" />
                        </div>
                        {feature.badge && (
                          <span className="text-xs font-light text-gray-500 bg-gray-200 px-2 py-1 rounded-full font-montserrat">
                            {feature.badge}
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-light text-gray-400 font-montserrat mb-1">
                        {feature.name}
                      </h4>
                      <p className="text-xs text-gray-500 font-montserrat">
                        {feature.description}
                      </p>
                    </div>
                  ) : (
                    <Link href={feature.href}>
                      <div className="relative p-4 rounded-lg bg-gradient-to-br from-amber-50/50 via-white to-orange-50/30 border border-amber-200/40 hover:border-amber-300/60 transition-all cursor-pointer group hover:shadow-md">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`p-2 rounded-lg bg-gradient-to-br ${feature.color} shadow-md group-hover:shadow-lg transition-shadow`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
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
                        <h4 className="text-sm font-light text-gray-900 font-montserrat mb-1 group-hover:text-amber-700 transition-colors">
                          {feature.name}
                        </h4>
                        <p className="text-xs text-gray-600 font-montserrat">
                          {feature.description}
                        </p>
                      </div>
                    </Link>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MoveCrewQuickAccessAdminLight;

