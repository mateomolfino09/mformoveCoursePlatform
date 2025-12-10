'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  FireIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  VideoCameraIcon,
  ChartBarIcon,
  BuildingStorefrontIcon
} from '@heroicons/react/24/solid';
import { routes } from '../../../constants/routes';
import { useAuth } from '../../../hooks/useAuth';

interface MoveCrewQuickAccessAdminProps {
  coherenceStreak?: number | null;
  hasBitacoraContent?: boolean;
}

const MoveCrewQuickAccessAdmin = ({ 
  coherenceStreak = null, 
  hasBitacoraContent = false 
}: MoveCrewQuickAccessAdminProps) => {
  const auth = useAuth();
  const isMember = auth.user?.subscription?.active || auth.user?.isVip;

  const userFeatures = [
    {
      name: 'Bitácora',
      description: 'Camino del Gorila',
      href: '/bitacora',
      icon: FireIcon,
      color: 'from-orange-500 to-amber-500',
      available: hasBitacoraContent && isMember,
      badge: coherenceStreak && coherenceStreak > 0 ? coherenceStreak : null
    },
    {
      name: 'Clases',
      description: 'Entrenamientos',
      href: routes.navegation.membresiaHome,
      icon: VideoCameraIcon,
      color: 'from-blue-500 to-indigo-500',
      available: isMember
    },
    {
      name: 'Eventos',
      description: 'Próximos eventos',
      href: routes.navegation.eventos,
      icon: CalendarDaysIcon,
      color: 'from-purple-500 to-pink-500',
      available: true
    },
    {
      name: 'Cursos',
      description: 'Programas completos',
      href: routes.navegation.products,
      icon: BookOpenIcon,
      color: 'from-green-500 to-emerald-500',
      available: true
    }
  ];

  const adminFeatures = [
    {
      name: 'Bitácoras',
      description: 'Gestionar',
      href: '/admin/memberships/bitacora',
      icon: FireIcon,
      color: 'from-[#4F7CCF] to-[#234C8C]',
      available: true
    },
    {
      name: 'Membresías',
      description: 'Administrar',
      href: '/admin/memberships',
      icon: BuildingStorefrontIcon,
      color: 'from-[#4F7CCF] to-[#234C8C]',
      available: true
    },
    {
      name: 'Usuarios',
      description: 'Gestionar',
      href: '/admin/users',
      icon: VideoCameraIcon,
      color: 'from-[#4F7CCF] to-[#234C8C]',
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
        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 shadow-lg"
      >
        <div className="flex items-center gap-2 mb-3">
          <ChartBarIcon className="w-5 h-5 text-white/70" />
          <h3 className="text-sm font-semibold text-white/90 font-montserrat uppercase tracking-wider">
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
                  <div className="relative p-4 rounded-lg bg-gradient-to-br from-white/10 to-white/5 border border-white/10 hover:border-white/20 transition-all cursor-pointer group">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${feature.color} shadow-md group-hover:shadow-lg transition-shadow`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <h4 className="text-sm font-semibold text-white font-montserrat mb-1 group-hover:text-white transition-colors">
                      {feature.name}
                    </h4>
                    <p className="text-xs text-white/70 font-montserrat group-hover:text-white/90 transition-colors">
                      {feature.description}
                    </p>
                    
                    {/* Hover effect */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 rounded-lg transition-opacity`} />
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
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 shadow-lg"
        >
          <div className="flex items-center gap-2 mb-3">
            <ChartBarIcon className="w-5 h-5 text-white/70" />
            <h3 className="text-sm font-semibold text-white/90 font-montserrat uppercase tracking-wider">
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
                    <div className="relative p-4 rounded-lg bg-gray-800/50 border border-white/5 cursor-not-allowed opacity-50">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg bg-gray-700/50`}>
                          <Icon className="w-5 h-5 text-gray-400" />
                        </div>
                        {feature.badge && (
                          <span className="text-xs font-bold text-gray-400 bg-gray-700/50 px-2 py-1 rounded-full">
                            {feature.badge}
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-semibold text-gray-400 font-montserrat mb-1">
                        {feature.name}
                      </h4>
                      <p className="text-xs text-gray-500 font-montserrat">
                        {feature.description}
                      </p>
                    </div>
                  ) : (
                    <Link href={feature.href}>
                      <div className="relative p-4 rounded-lg bg-gradient-to-br from-white/10 to-white/5 border border-white/10 hover:border-white/20 transition-all cursor-pointer group">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`p-2 rounded-lg bg-gradient-to-br ${feature.color} shadow-md group-hover:shadow-lg transition-shadow`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          {feature.badge && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="text-xs font-bold text-white bg-orange-500 px-2 py-1 rounded-full shadow-md"
                            >
                              {feature.badge}
                            </motion.span>
                          )}
                        </div>
                        <h4 className="text-sm font-semibold text-white font-montserrat mb-1 group-hover:text-white transition-colors">
                          {feature.name}
                        </h4>
                        <p className="text-xs text-white/70 font-montserrat group-hover:text-white/90 transition-colors">
                          {feature.description}
                        </p>
                        
                        {/* Hover effect */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 rounded-lg transition-opacity`} />
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

export default MoveCrewQuickAccessAdmin;


