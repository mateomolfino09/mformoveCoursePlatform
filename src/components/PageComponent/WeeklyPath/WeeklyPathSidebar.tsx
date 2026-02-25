'use client'
import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LockClosedIcon,
  CalendarIcon,
  PlayIcon,
  ChevronDownIcon
} from '@heroicons/react/24/solid';
import { useAuth } from '../../../hooks/useAuth';

interface DailyContent {
  dayNumber: number;
  dayTitle?: string;
  visualContent?: {
    type: 'video' | 'none';
    nombre?: string;
    videoName?: string;
    videoUrl?: string;
    videoId?: string;
    title?: string;
  };
  audioTextContent?: {
    nombre?: string;
    audioTitle?: string;
    audioUrl?: string;
    text?: string;
    title?: string;
  };
  publishDate: string;
  isPublished: boolean;
  isUnlocked: boolean;
}

/** Ítem de contenido de la semana (clase de módulo, clase individual, audio) */
interface WeekContentItem {
  contentType?: 'moduleClass' | 'individualClass' | 'audio';
  videoUrl?: string;
  videoName?: string;
  audioUrl?: string;
  audioTitle?: string;
  audioText?: string;
  submoduleName?: string;
  orden?: number;
}

interface WeeklyContent {
  weekNumber: number;
  moduleName?: string;
  weekTitle?: string;
  weekDescription?: string;
  dailyContents?: DailyContent[];
  /** Varios contenidos por semana (clase módulo, clase individual, audio) */
  contents?: WeekContentItem[];
  publishDate: string;
  isPublished: boolean;
  isUnlocked: boolean;
  // Legacy fields para compatibilidad
  videoUrl?: string;
  videoName?: string;
  audioUrl?: string;
  audioTitle?: string;
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
  selectedContentIndex?: number | null;
  onSelect: (weekNumber: number, dayNumber: number | null, contentType: 'visual' | 'audioText' | null, contentIndex?: number) => void;
  completedWeeks: Set<string>;
  completedDays: Set<string>;
  /** Completados por contenido (key: logbookId-weekNumber-content-index) */
  completedVideos?: Set<string>;
  completedAudios?: Set<string>;
  onClose?: () => void;
}

const WeeklyPathSidebar = ({
  logbook,
  selectedWeek,
  selectedDay,
  selectedContentType,
  selectedContentIndex = null,
  onSelect,
  completedWeeks,
  completedDays,
  completedVideos = new Set(),
  completedAudios = new Set(),
  onClose
}: Props) => {
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
  const maxWeekNumber = useMemo(
    () => Math.max(...(logbook.weeklyContents?.map(w => w.weekNumber) || [0])),
    [logbook.weeklyContents]
  );

  const isPublishDateToday = (publishDate: string) => {
    const today = new Date();
    const publish = new Date(publishDate);
    publish.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return publish.getTime() === today.getTime();
  };

  const isContentUnlocked = (week: WeeklyContent) => {
    // Los administradores pueden ver todo el contenido
    if (isAdmin) return true;
    
    // Solo liberamos si el cron (o admin) marcó published/unlocked
    if (week.isPublished || week.isUnlocked) return true;
    return week.dailyContents?.some(day => day.isPublished || day.isUnlocked) || false;
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
      const moduleForWeek = modulesWithWeeks.find(module => 
        module.weeks.some(w => w.weekNumber === selectedWeek)
      );
      if (moduleForWeek) {
        setExpandedModules(prev => new Set(prev).add(moduleForWeek.moduleName));
      }
    }
  }, [selectedWeek, modulesWithWeeks]);

  // Porcentaje completado: de la semana seleccionada; si la semana está al 100%, mostrar progreso del mes (25/50/75/100%)
  const progressInfo = React.useMemo(() => {
    let weekTotal = 0;
    let weekCompleted = 0;
    const weeks = logbook.weeklyContents || [];
    if (selectedWeek !== null) {
      const week = weeks.find(w => w.weekNumber === selectedWeek);
      if (week) {
        const contents = week.contents;
        if (Array.isArray(contents) && contents.length > 0) {
          weekTotal = contents.length;
          for (let i = 0; i < contents.length; i++) {
            const key = `${logbook._id}-${week.weekNumber}-content-${i}`;
            if (completedVideos.has(key) || completedAudios.has(key)) weekCompleted++;
          }
        } else {
          if (week.videoUrl) { weekTotal++; if (completedVideos.has(`${logbook._id}-${week.weekNumber}-week-video`)) weekCompleted++; }
          if (week.audioUrl || (week as WeeklyContent).text) { weekTotal++; if (completedAudios.has(`${logbook._id}-${week.weekNumber}-week-audio`)) weekCompleted++; }
        }
      }
      const weekIsComplete = weekTotal > 0 && weekCompleted === weekTotal;
      if (weekIsComplete && weeks.length > 0) {
        let monthCompleted = 0;
        weeks.forEach((w) => {
          const c = w.contents;
          if (Array.isArray(c) && c.length > 0) {
            let allDone = true;
            for (let i = 0; i < c.length; i++) {
              const key = `${logbook._id}-${w.weekNumber}-content-${i}`;
              if (!completedVideos.has(key) && !completedAudios.has(key)) { allDone = false; break; }
            }
            if (allDone) monthCompleted++;
          } else {
            const hasVideo = !!w.videoUrl;
            const hasAudio = !!(w.audioUrl || (w as WeeklyContent).text);
            const doneVideo = !hasVideo || completedVideos.has(`${logbook._id}-${w.weekNumber}-week-video`);
            const doneAudio = !hasAudio || completedAudios.has(`${logbook._id}-${w.weekNumber}-week-audio`);
            if ((hasVideo || hasAudio) && doneVideo && doneAudio) monthCompleted++;
          }
        });
        const monthTotal = weeks.length;
        const percentage = monthTotal > 0 ? Math.round((monthCompleted / monthTotal) * 100) : 0;
        return { total: monthTotal, completed: monthCompleted, percentage, label: 'Mes', isMonthView: true };
      }
      const percentage = weekTotal > 0 ? Math.round((weekCompleted / weekTotal) * 100) : 0;
      return { total: weekTotal, completed: weekCompleted, percentage, label: `Semana ${selectedWeek}`, isMonthView: false };
    }
    let total = 0;
    let completed = 0;
    weeks.forEach((week) => {
      const contents = week.contents;
      if (Array.isArray(contents) && contents.length > 0) {
        total += contents.length;
        contents.forEach((_, i) => {
          const key = `${logbook._id}-${week.weekNumber}-content-${i}`;
          if (completedVideos.has(key) || completedAudios.has(key)) completed++;
        });
      } else {
        if (week.videoUrl) { total++; if (completedVideos.has(`${logbook._id}-${week.weekNumber}-week-video`)) completed++; }
        if (week.audioUrl || (week as WeeklyContent).text) { total++; if (completedAudios.has(`${logbook._id}-${week.weekNumber}-week-audio`)) completed++; }
      }
    });
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percentage, label: 'Camino', isMonthView: false };
  }, [logbook._id, logbook.weeklyContents, selectedWeek, completedVideos, completedAudios]);

  return (
    <div className='h-full flex flex-col min-w-0 overflow-x-hidden'>
      {/* Barra de progreso: porcentaje de la semana (o del camino) completado */}
      <div className='px-4 pt-4 flex-shrink-0'>
        <div className='flex items-center justify-between gap-2 mb-1.5'>
          <span className='text-xs text-palette-stone font-montserrat font-light'>
            {progressInfo.label} · {progressInfo.completed}/{progressInfo.total}
            {progressInfo.isMonthView ? ' semanas' : ''}
          </span>
          <span className='text-xs text-palette-sage font-montserrat font-medium'>
            {progressInfo.percentage}%
          </span>
        </div>
        <div className='h-1.5 w-full rounded-full bg-palette-stone/30 overflow-hidden'>
          <motion.div
            className='h-full rounded-full bg-palette-sage'
            initial={false}
            animate={{ width: `${Math.min(100, progressInfo.percentage)}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </div>
      {/* Título y mes */}
      <div className='px-4 pt-3 pb-2 flex-shrink-0'>
        <h2 className='text-lg font-semibold text-palette-cream font-montserrat tracking-tight'>
          Contenido de la semana
        </h2>
        <p className='text-sm text-palette-stone font-montserrat font-light mt-0.5'>
          {(() => {
            const str = new Date(logbook.year, logbook.month - 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
            return str.charAt(0).toUpperCase() + str.slice(1);
          })()}
        </p>
      </div>

      {/* Navegación por módulos/semanas */}
      <div className='flex-1 overflow-y-auto overflow-x-hidden min-h-0 min-w-0 scrollbar-thin scrollbar-thumb-palette-stone/50 scrollbar-track-transparent py-2'>
        {modulesWithWeeks.map(({ moduleName, weeks }) => {
          const isModuleExpanded = expandedModules.has(moduleName);
          const displayModuleName = moduleName;

          return (
            <div key={moduleName} className='border-b border-palette-stone/20 last:border-b-0'>
              {/* Cabecera de módulo */}
              <button
                onClick={() => toggleModule(moduleName)}
                className='w-full p-3 text-left transition-colors flex items-center justify-between hover:bg-palette-stone/20 rounded-lg mx-1'
              >
                <div className='flex items-center gap-2'>
                  <motion.div
                    animate={{ rotate: isModuleExpanded ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDownIcon className='h-5 w-5 text-palette-stone flex-shrink-0' />
                  </motion.div>
                  <span className='text-sm font-semibold text-palette-cream font-montserrat'>
                    {displayModuleName}
                  </span>
                  <span className='text-xs text-palette-stone font-montserrat font-light'>
                    ({weeks.length})
                  </span>
                </div>
                <motion.div
                  animate={{ rotate: isModuleExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDownIcon className='h-5 w-5 text-palette-stone flex-shrink-0' />
                </motion.div>
              </button>

              <AnimatePresence>
                {isModuleExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    className='bg-palette-stone/5 overflow-hidden'
                  >
                    {weeks.map((week) => {
                      const weekKey = `${logbook._id}-${week.weekNumber}`;
                      const isWeekCompleted = completedWeeks.has(weekKey);
                      const isWeekSelected = selectedWeek === week.weekNumber;
                      const isWeekUnlocked = isContentUnlocked(week);
                      const isLastWeek = week.weekNumber === maxWeekNumber;
                      const isLastWeekReleaseDay = isLastWeek && isWeekUnlocked && isPublishDateToday(week.publishDate);
                      const hasContents = Array.isArray(week.contents) && week.contents.length > 0;
                      const hasVideo = (week.dailyContents?.some(day => day.visualContent?.type === 'video' && day.visualContent.videoUrl)) || 
                                      (week.videoUrl && (!week.dailyContents || week.dailyContents.length === 0) && !hasContents);
                      const hasAudio = (week.dailyContents?.some(day => day.audioTextContent?.audioUrl || day.audioTextContent?.text)) ||
                                      ((week.audioUrl || week.text) && (!week.dailyContents || week.dailyContents.length === 0) && !hasContents);
                      const firstDayWithVideo = week.dailyContents?.find(day => 
                        day.visualContent?.type === 'video' && day.visualContent.videoUrl
                      );
                      const firstDayWithAudio = week.dailyContents?.find(day => 
                        day.audioTextContent?.audioUrl || day.audioTextContent?.text
                      );
                      const videoName = firstDayWithVideo?.visualContent?.videoName 
                        || firstDayWithVideo?.visualContent?.nombre 
                        || (week as any).videoName 
                        || 'Clase';
                      const audioName = firstDayWithAudio?.audioTextContent?.audioTitle 
                        || firstDayWithAudio?.audioTextContent?.nombre 
                        || (week as any).audioTitle 
                        || 'Reproducción de Audio';

                      return (
                        <div key={week.weekNumber} className='pl-6 pr-3 py-2.5 border-b border-palette-stone/10 last:border-b-0'>
                          <div className='mb-2'>
                            <div className='flex items-center gap-2 mb-0.5'>
                              <span className='text-sm font-semibold text-palette-cream font-montserrat tracking-tight'>
                                Semana {week.weekNumber}
                              </span>
                              {isWeekCompleted && (
                                <span className='w-2 h-2 rounded-full bg-palette-sage shrink-0' title="Semana vista" aria-hidden />
                              )}
                              {!isWeekUnlocked && (
                                <LockClosedIcon className='h-3.5 w-3.5 text-palette-stone flex-shrink-0' />
                              )}
                            </div>
                            {week.weekTitle && (
                              <p className='text-xs text-palette-cream/80 font-montserrat font-medium mb-0.5'>
                                {week.weekTitle}
                              </p>
                            )}
                            {isLastWeekReleaseDay && (
                              <p className='text-xs text-palette-sage font-montserrat font-semibold'>
                                Última semana liberada hoy
                              </p>
                            )}
                            <div className='flex items-center gap-1.5 text-xs text-palette-stone'>
                              <CalendarIcon className='h-3 w-3' />
                              <span className='font-light'>{formatPublishDate(week.publishDate)}</span>
                            </div>
                          </div>

                          <div className='flex flex-col gap-1.5'>
                            {hasContents ? (
                              week.contents!.map((c, contentIndex) => {
                                const tipo = (c.contentType || 'moduleClass') as 'moduleClass' | 'individualClass' | 'audio';
                                const isVisual = tipo !== 'audio';
                                const isAudio = tipo === 'audio';
                                const name = (isVisual ? c.videoName : c.audioTitle) || (isAudio ? 'Audio' : 'Clase');
                                const isThisSelected = isWeekSelected && selectedContentIndex === contentIndex && (
                                  (isVisual && selectedContentType === 'visual') || (isAudio && selectedContentType === 'audioText')
                                );
                                const contentKey = `${logbook._id}-${week.weekNumber}-content-${contentIndex}`;
                                const isContentCompleted = isVisual ? completedVideos.has(contentKey) : completedAudios.has(contentKey);
                                return (
                                  <motion.button
                                    key={contentIndex}
                                    onClick={() => {
                                      if (!isWeekUnlocked && !isAdmin) return;
                                      onSelect(week.weekNumber, null, isVisual ? 'visual' : 'audioText', contentIndex);
                                    }}
                                    disabled={!isWeekUnlocked && !isAdmin}
                                    whileHover={isWeekUnlocked || isAdmin ? { scale: 1.01 } : {}}
                                    whileTap={isWeekUnlocked || isAdmin ? { scale: 0.99 } : {}}
                                    className={`w-full p-2 rounded-lg text-left transition-colors text-sm font-montserrat flex items-center justify-between gap-2 ${
                                      !isWeekUnlocked
                                        ? 'opacity-50 cursor-not-allowed text-palette-stone'
                                        : isThisSelected
                                        ? 'bg-palette-sage/25 text-palette-cream font-medium'
                                        : 'text-palette-cream/90 hover:bg-palette-stone/20'
                                    }`}
                                  >
                                    <div className='flex items-center gap-2 min-w-0'>
                                      {isVisual && <PlayIcon className='h-3.5 w-3.5 text-palette-sage shrink-0' />}
                                      <span className='truncate' title={name}>{name}</span>
                                    </div>
                                    {isContentCompleted && (
                                      <span className='w-2 h-2 rounded-full bg-palette-sage shrink-0' title="Completado" aria-hidden />
                                    )}
                                  </motion.button>
                                );
                              })
                            ) : (
                              <>
                                {hasVideo && (
                                  <motion.button
                                    onClick={() => {
                                      if (!isWeekUnlocked && !isAdmin) return;
                                      onSelect(week.weekNumber, null, 'visual');
                                    }}
                                    disabled={!isWeekUnlocked && !isAdmin}
                                    whileHover={isWeekUnlocked || isAdmin ? { scale: 1.01 } : {}}
                                    whileTap={isWeekUnlocked || isAdmin ? { scale: 0.99 } : {}}
                                    className={`w-full p-2 rounded-lg text-left transition-colors text-sm font-montserrat ${
                                      !isWeekUnlocked
                                        ? 'opacity-50 cursor-not-allowed text-palette-stone'
                                        : isWeekSelected && selectedContentType === 'visual'
                                        ? 'bg-palette-sage/25 text-palette-cream font-medium'
                                        : 'text-palette-cream/90 hover:bg-palette-stone/20'
                                    }`}
                                  >
                                    <div className='flex items-center gap-2'>
                                      <PlayIcon className='h-3.5 w-3.5 text-palette-sage shrink-0' />
                                      <span className='truncate'>{videoName}</span>
                                    </div>
                                  </motion.button>
                                )}
                                {hasAudio && (
                                  <motion.button
                                    onClick={() => {
                                      if (!isWeekUnlocked && !isAdmin) return;
                                      onSelect(week.weekNumber, null, 'audioText');
                                    }}
                                    disabled={!isWeekUnlocked && !isAdmin}
                                    whileHover={isWeekUnlocked || isAdmin ? { scale: 1.01 } : {}}
                                    whileTap={isWeekUnlocked || isAdmin ? { scale: 0.99 } : {}}
                                    className={`w-full p-2 rounded-lg text-left transition-colors text-sm font-montserrat ${
                                      !isWeekUnlocked
                                        ? 'opacity-50 cursor-not-allowed text-palette-stone'
                                        : isWeekSelected && selectedContentType === 'audioText'
                                        ? 'bg-palette-sage/25 text-palette-cream font-medium'
                                        : 'text-palette-cream/90 hover:bg-palette-stone/20'
                                    }`}
                                  >
                                    <span className='truncate block'>{audioName}</span>
                                  </motion.button>
                                )}
                              </>
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

export default WeeklyPathSidebar;

