'use client'
import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircleIcon, 
  LockClosedIcon,
  CalendarIcon,
  PlayIcon,
  ArrowLeftIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/solid';
import { LockClosedIcon as LockClosedIconOutline } from '@heroicons/react/24/outline';
import { useAuth } from '../../../hooks/useAuth';
import { useRouter } from 'next/navigation';

interface DailyContent {
  dayNumber: number;
  dayTitle?: string;
  visualContent?: {
    type: 'video' | 'none';
    nombre?: string;
    videoUrl?: string;
    videoId?: string;
    title?: string;
  };
  audioTextContent?: {
    nombre?: string;
    audioUrl?: string;
    text?: string;
    title?: string;
  };
  publishDate: string;
  isPublished: boolean;
  isUnlocked: boolean;
}

interface WeeklyContent {
  weekNumber: number;
  moduleName?: string;
  weekTitle?: string;
  weekDescription?: string;
  dailyContents?: DailyContent[];
  publishDate: string;
  isPublished: boolean;
  isUnlocked: boolean;
  // Legacy fields para compatibilidad
  videoUrl?: string;
  audioUrl?: string;
  text?: string;
}

interface Logbook {
  _id: string;
  month: number;
  year: number;
  title: string;
  description: string;
  weeklyContents: WeeklyContent[];
}

interface Props {
  logbook: Logbook;
  selectedWeek: number | null;
  selectedDay: number | null;
  selectedContentType: 'visual' | 'audioText' | null;
  onSelect: (weekNumber: number, dayNumber: number | null, contentType: 'visual' | 'audioText' | null) => void;
  completedWeeks: Set<string>;
  completedDays: Set<string>;
  onClose?: () => void;
}

const BitacoraSidebar = ({
  logbook,
  selectedWeek,
  selectedDay,
  selectedContentType,
  onSelect,
  completedWeeks,
  completedDays,
  onClose
}: Props) => {
  const router = useRouter();
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  
  const formatPublishDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      weekday: 'short',
      day: 'numeric', 
      month: 'short'
    });
  };

  const auth = useAuth();
  const isAdmin = auth.user?.rol === 'Admin';

  const isContentUnlocked = (publishDate: string) => {
    // Los administradores pueden ver todo el contenido
    if (isAdmin) return true;
    
    const now = new Date();
    const publish = new Date(publishDate);
    publish.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    // Desbloquear solo si la fecha es menor o igual a hoy (no futura)
    return publish.getTime() <= now.getTime();
  };

  const toggleModule = (moduleName: string) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleName)) {
        newSet.delete(moduleName);
      } else {
        newSet.add(moduleName);
      }
      return newSet;
    });
  };

  // Agrupar semanas por módulo
  const modulesWithWeeks = React.useMemo(() => {
    const moduleMap = new Map<string, WeeklyContent[]>();
    const moduleOrder: string[] = [];
    
    logbook.weeklyContents.forEach(week => {
      let moduleName = week.moduleName?.trim();
      
      // Si no tiene nombre de módulo, asignarle uno temporal para agrupar
      // Las semanas sin módulo se agrupan por orden de aparición
      if (!moduleName || moduleName === '') {
        // Buscar si hay semanas anteriores sin módulo asignado
        const previousWeeks = logbook.weeklyContents.filter(w => w.weekNumber < week.weekNumber);
        const hasPreviousEmpty = previousWeeks.some(w => !w.moduleName || w.moduleName.trim() === '');
        
        if (hasPreviousEmpty) {
          // Agrupar con el módulo vacío anterior más cercano
          const closestEmptyWeek = previousWeeks
            .filter(w => !w.moduleName || w.moduleName.trim() === '')
            .sort((a, b) => b.weekNumber - a.weekNumber)[0];
          
          // Usar un identificador temporal basado en la semana más antigua sin módulo
          moduleName = `__empty__${closestEmptyWeek?.weekNumber || week.weekNumber}`;
        } else {
          // Nueva agrupación de semanas sin módulo
          moduleName = `__empty__${week.weekNumber}`;
        }
      }
      
      if (!moduleMap.has(moduleName)) {
        moduleMap.set(moduleName, []);
        moduleOrder.push(moduleName);
      }
      moduleMap.get(moduleName)!.push(week);
    });

    // Convertir a array y asignar nombres finales
    let moduleCounter = 1;
    return moduleOrder.map((moduleKey) => {
      const weeks = moduleMap.get(moduleKey)!;
      const sortedWeeks = weeks.sort((a, b) => a.weekNumber - b.weekNumber);
      
      // Determinar el nombre final del módulo
      let displayName: string;
      if (moduleKey.startsWith('__empty__')) {
        displayName = `Módulo ${moduleCounter}`;
        moduleCounter++;
      } else {
        displayName = moduleKey;
      }
      
      return {
        moduleName: displayName,
        weeks: sortedWeeks,
        moduleIndex: moduleCounter - 1
      };
    });
  }, [logbook.weeklyContents]);

  // Auto-expandir el módulo de la semana seleccionada
  React.useEffect(() => {
    if (selectedWeek !== null) {
      // Buscar en qué módulo está la semana seleccionada
      const moduleForWeek = modulesWithWeeks.find(module => 
        module.weeks.some(w => w.weekNumber === selectedWeek)
      );
      if (moduleForWeek) {
        setExpandedModules(prev => new Set(prev).add(moduleForWeek.moduleName));
      }
    }
  }, [selectedWeek, modulesWithWeeks]);

  return (
    <div className='h-full flex flex-col bg-gradient-to-br from-white via-gray-50/50 to-amber-50/30 backdrop-blur-sm'>
      {/* Header con botón de volver */}
      <div className='p-6 md:pt-20 border-b border-amber-200/40 bg-gradient-to-r from-amber-100/30 via-orange-50/20 to-rose-100/30 flex-shrink-0'>
        <button
          onClick={() => router.push('/home')}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-4 transition-colors group"
        >
          <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-montserrat font-medium text-base">Volver a Home</span>
        </button>
        <h2 className='text-2xl font-bold text-gray-900 font-montserrat mb-1 tracking-tight'>
          Contenido Semanal
        </h2>
        <p className='text-base text-gray-600 font-montserrat font-light'>
          {new Date(logbook.year, logbook.month - 1).toLocaleDateString('es-ES', { 
            month: 'long', 
            year: 'numeric' 
          })}
        </p>
      </div>

      {/* Content Navigation */}
      <div className='flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-amber-300/50 scrollbar-track-transparent py-4'>
        {modulesWithWeeks.map(({ moduleName, weeks, moduleIndex }) => {
          const isModuleExpanded = expandedModules.has(moduleName);
          
          // El nombre del módulo ya viene determinado en modulesWithWeeks
          const displayModuleName = moduleName;

          return (
            <div key={moduleName} className='border-b border-amber-200/30 last:border-b-0'>
              {/* Module Header */}
              <button
                onClick={() => toggleModule(moduleName)}
                className='w-full p-4 text-left transition-all flex items-center justify-between hover:bg-amber-50/40'
              >
                <div className='flex items-center gap-3'>
                  <motion.div
                    animate={{ rotate: isModuleExpanded ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDownIcon className='h-5 w-5 text-gray-600 flex-shrink-0' />
                  </motion.div>
                  <span className='text-base font-semibold text-gray-900 font-montserrat'>
                    {displayModuleName}
                  </span>
                  <span className='text-sm text-gray-500 font-montserrat font-light'>
                    ({weeks.length})
                  </span>
                </div>
                <motion.div
                  animate={{ rotate: isModuleExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDownIcon className='h-5 w-5 text-gray-600 flex-shrink-0' />
                </motion.div>
              </button>

              {/* Weeks dentro del módulo */}
              <AnimatePresence>
                {isModuleExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    className='bg-white/40 overflow-hidden'
                  >
                    {weeks.map((week) => {
                      const weekKey = `${logbook._id}-${week.weekNumber}`;
                      const isWeekCompleted = completedWeeks.has(weekKey);
                      const isWeekSelected = selectedWeek === week.weekNumber;
                      const isWeekUnlocked = isContentUnlocked(week.publishDate);
                      const hasVideo = (week.dailyContents?.some(day => day.visualContent?.type === 'video' && day.visualContent.videoUrl)) || 
                                      (week.videoUrl && (!week.dailyContents || week.dailyContents.length === 0));
                      const hasAudio = (week.dailyContents?.some(day => day.audioTextContent?.audioUrl || day.audioTextContent?.text)) ||
                                      ((week.audioUrl || week.text) && (!week.dailyContents || week.dailyContents.length === 0));
                      
                      // Obtener nombres del video y audio (del primer día con contenido o de la semana legacy)
                      const firstDayWithVideo = week.dailyContents?.find(day => 
                        day.visualContent?.type === 'video' && day.visualContent.videoUrl
                      );
                      const firstDayWithAudio = week.dailyContents?.find(day => 
                        day.audioTextContent?.audioUrl || day.audioTextContent?.text
                      );
                      
                      // Para contenido legacy, no tenemos nombres en el nivel semanal, así que usar "Video" y "Audio + Texto"
                      // Para contenido diario, usar los nombres si existen
                      const videoName = firstDayWithVideo?.visualContent?.nombre || 'Clase';
                      const audioName = firstDayWithAudio?.audioTextContent?.nombre || 'Reproducción de Audio';

                      return (
                        <div key={week.weekNumber} className='pl-8 pr-4 py-3 border-b border-amber-200/20 last:border-b-0'>
                          {/* Week Info */}
                          <div className='mb-3'>
                            <div className='flex items-center gap-2 mb-1'>
                              <span className='text-base font-bold text-gray-900 font-montserrat tracking-tight'>
                                Semana {week.weekNumber}
                              </span>
                              {isWeekCompleted && (
                                <CheckCircleIcon className='h-5 w-5 text-amber-600 flex-shrink-0' />
                              )}
                              {!isWeekUnlocked && (
                                <LockClosedIcon className='h-4 w-4 text-gray-400 flex-shrink-0' />
                              )}
                            </div>
                            {week.weekTitle && (
                              <p className='text-sm text-gray-700/90 font-montserrat mb-1 font-medium'>
                                {week.weekTitle}
                              </p>
                            )}
                            <div className='flex items-center gap-2 text-xs text-gray-600'>
                              <CalendarIcon className='h-3 w-3' />
                              <span className='font-light'>{formatPublishDate(week.publishDate)}</span>
                            </div>
                          </div>

                          {/* Botones de Video y Audio + Texto */}
                          <div className='flex flex-col gap-2'>
                            {/* Botón Video */}
                            {hasVideo && (
                              <button
                                onClick={() => {
                                  if (!isWeekUnlocked && !isAdmin) return;
                                  // Si tiene contenido diario, tomar el primer día con video, sino null
                                  const firstDayWithVideo = week.dailyContents?.find(day => 
                                    day.visualContent?.type === 'video' && day.visualContent.videoUrl
                                  );
                                  onSelect(week.weekNumber, firstDayWithVideo?.dayNumber || null, 'visual');
                                }}
                                disabled={!isWeekUnlocked && !isAdmin}
                                className={`w-full p-2.5 rounded-xl text-left transition-all ${
                                  !isWeekUnlocked
                                    ? 'opacity-50 cursor-not-allowed'
                                    : isWeekSelected && selectedContentType === 'visual'
                                    ? 'bg-gradient-to-r from-amber-100/50 via-orange-50/40 to-rose-100/50 border border-amber-300/50 shadow-sm'
                                    : 'hover:bg-amber-50/70 border border-transparent'
                                }`}
                              >
                                <div className='flex items-center gap-2'>
                                  <PlayIcon className='h-4 w-4 text-amber-700' />
                                  <span className='text-sm text-gray-900 font-montserrat font-medium'>
                                    {videoName}
                                  </span>
                                </div>
                              </button>
                            )}

                            {/* Botón Audio + Texto */}
                            {hasAudio && (
                              <button
                                onClick={() => {
                                  if (!isWeekUnlocked && !isAdmin) return;
                                  // Si tiene contenido diario, tomar el primer día con audio, sino null
                                  const firstDayWithAudio = week.dailyContents?.find(day => 
                                    day.audioTextContent?.audioUrl || day.audioTextContent?.text
                                  );
                                  onSelect(week.weekNumber, firstDayWithAudio?.dayNumber || null, 'audioText');
                                }}
                                disabled={!isWeekUnlocked && !isAdmin}
                                className={`w-full p-2.5 rounded-xl text-left transition-all ${
                                  !isWeekUnlocked
                                    ? 'opacity-50 cursor-not-allowed'
                                    : isWeekSelected && selectedContentType === 'audioText'
                                    ? 'bg-gradient-to-r from-amber-100/50 via-orange-50/40 to-rose-100/50 border border-amber-300/50 shadow-sm'
                                    : 'hover:bg-amber-50/70 border border-transparent'
                                }`}
                              >
                                <div className='flex items-center gap-2'>
                                  <span className='text-sm text-gray-900 font-montserrat font-medium'>
                                    {audioName}
                                  </span>
                                </div>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BitacoraSidebar;

