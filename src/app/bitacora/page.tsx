'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircleIcon, 
  LockClosedIcon,
  FireIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/solid';
import { CldImage } from 'next-cloudinary';
import imageLoader from '../../../imageLoader';
import { toast } from 'react-hot-toast';
import Cookies from 'js-cookie';
import BitacoraSidebar from '../../components/PageComponent/Bitacora/BitacoraSidebar';
import VideoContentDisplay from '../../components/PageComponent/Bitacora/VideoContentDisplay';
import AudioTextContentDisplay from '../../components/PageComponent/Bitacora/AudioTextContentDisplay';
import MoveCrewLoading from '../../components/PageComponent/MoveCrew/MoveCrewLoading';
import MainSideBar from '../../components/MainSidebar/MainSideBar';
import { CoherenceProvider, useCoherence } from '../../contexts/CoherenceContext';
import CoherenceCelebrationModal from '../../components/PageComponent/Bitacora/CoherenceCelebrationModal';
import CoherenceInfoModal from '../../components/PageComponent/Bitacora/CoherenceInfoModal';
import GorillaLevelDisplay from '../../components/PageComponent/Bitacora/GorillaLevelDisplay';

interface DailyContent {
  dayNumber: number;
  dayTitle?: string;
  visualContent?: {
    type: 'video' | 'none';
    videoUrl?: string;
    videoId?: string;
    thumbnailUrl?: string;
    duration?: number;
    title?: string;
    description?: string;
  };
  audioTextContent?: {
    audioUrl?: string;
    audioDuration?: number;
    text?: string;
    title?: string;
    subtitle?: string;
  };
  publishDate: string;
  isPublished: boolean;
  isUnlocked: boolean;
}

interface WeeklyContent {
  weekNumber: number;
  weekTitle?: string;
  weekDescription?: string;
  dailyContents?: DailyContent[];
  publishDate: string;
  isPublished: boolean;
  isUnlocked: boolean;
  // Legacy fields para compatibilidad
  videoUrl?: string;
  videoId?: string;
  audioUrl?: string;
  text?: string;
  isLocked?: boolean;
}

interface Logbook {
  _id: string;
  month: number;
  year: number;
  title: string;
  description: string;
  weeklyContents: WeeklyContent[];
}

interface CoherenceTracking {
  totalUnits: number;
  currentStreak: number;
  longestStreak: number;
  achievements: Array<{
    name: string;
    description: string;
    icon: string;
    unlockedAt: string;
  }>;
}

function BitacoraPageContent() {
  const router = useRouter();
  const auth = useAuth();
  const coherence = useCoherence();
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [logbook, setLogbook] = useState<Logbook | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedContentType, setSelectedContentType] = useState<'visual' | 'audioText' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Cerrado por defecto (especialmente en mobile)
  const [isDesktop, setIsDesktop] = useState(false);
  
  // Estados para los modales de celebración e información
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [celebrationData, setCelebrationData] = useState<{
    ucsOtorgadas: number;
    totalUnits: number;
    currentStreak: number;
    esSemanaAdicional?: boolean;
    newAchievements?: Array<{ name: string; description: string; icon: string }>;
    levelUp?: boolean;
    newLevel?: number;
    evolution?: boolean;
    gorillaIcon?: string;
  } | null>(null);
  const [infoModalData, setInfoModalData] = useState<{
    message: string;
    tip?: string;
    reason?: string;
    weekNumber?: number;
    contentType?: string;
  } | null>(null);

  useEffect(() => {
    const checkScreenSize = () => {
      const isDesktopSize = window.innerWidth >= 1024;
      setIsDesktop(isDesktopSize);
      // En desktop, abrir el sidebar automáticamente
      if (isDesktopSize) {
        setSidebarOpen(true);
      } else {
        // En mobile, mantener cerrado
        setSidebarOpen(false);
      }
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);


  useEffect(() => {
    const checkAuth = async () => {
      const userToken = Cookies.get('userToken');
      
      if (!userToken) {
        router.push('/login');
        return;
      }

      if (!auth.user) {
        await auth.fetchUser();
      }

      // Verificar membresía (excepto para administradores)
      if (auth.user && auth.user.rol !== 'Admin' && !auth.user.subscription?.active && !auth.user.isVip) {
        router.push('/move-crew');
        return;
      }

      fetchBitacora();
      coherence.fetchCoherenceTracking();
    };

    checkAuth();
  }, [auth, router]);

  // Calcular porcentaje completado del mes
  // Cada contenido (video o audio) representa 6.25% (dos contenidos por semana = 12.5%).
  const calculateMonthProgress = (): number => {
    if (!logbook || !logbook.weeklyContents) return 0;

    let completedContentsCount = 0;

    logbook.weeklyContents.forEach((week) => {
      if (week.dailyContents && week.dailyContents.length > 0) {
        week.dailyContents.forEach((day) => {
          // Video diario
          if (day.visualContent && day.visualContent.videoUrl) {
            const videoKey = `${logbook._id}-${week.weekNumber}-${day.dayNumber}-video`;
            if (coherence.completedVideos.has(videoKey)) {
              completedContentsCount++;
            }
          }

          // Audio diario
          if (day.audioTextContent && day.audioTextContent.audioUrl) {
            const audioKey = `${logbook._id}-${week.weekNumber}-${day.dayNumber}-audio`;
            if (coherence.completedAudios.has(audioKey)) {
              completedContentsCount++;
            }
          }
        });
      } else if (week.videoUrl) {
        // Estructura legacy: video semanal
        const videoKey = `${logbook._id}-${week.weekNumber}-week-video`;
        if (coherence.completedVideos.has(videoKey)) {
          completedContentsCount++;
        }
        // Estructura legacy: audio semanal (si existe)
        if ((week).audioUrl) {
          const audioKey = `${logbook._id}-${week.weekNumber}-week-audio`;
          if (coherence.completedAudios.has(audioKey)) {
            completedContentsCount++;
          }
        }
      }
    });

    // Cada contenido aporta 6.25%
    return Math.min(completedContentsCount * 6.25, 100);
  };

  const monthProgress = calculateMonthProgress();
  
  // Actualizar el progreso en el contexto
  useEffect(() => {
    coherence.updateMonthProgress(monthProgress);
  }, [monthProgress, coherence]);

  // Detectar cuando el mes se completa al 100% y subir de nivel
  const [monthCompletionChecked, setMonthCompletionChecked] = useState(false);
  
  useEffect(() => {
    const checkMonthCompletion = async () => {
      // Solo verificar una vez cuando el mes llega al 100%
      if (monthProgress >= 100 && logbook && !monthCompletionChecked) {
        const month = logbook.month;
        const year = logbook.year;
        
        // Marcar como verificado inmediatamente para evitar múltiples llamadas
        setMonthCompletionChecked(true);
        
        try {
          const response = await fetch('/api/bitacora/complete-month', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              logbookId: logbook._id,
              month,
              year
            })
          });

          if (response.ok) {
            const data = await response.json();
            
            if (data.levelUp) {
              console.log('[BitacoraPage] Mes completado - Subida de nivel', {
                newLevel: data.newLevel,
                evolution: data.evolution,
                gorillaIcon: data.gorillaIcon
              });
              
              // Actualizar tracking con el nuevo nivel
              if (data.tracking) {
                coherence.updateTracking(data.tracking);
              }
              
              // Mostrar modal de celebración con información de nivel
              setCelebrationData({
                ucsOtorgadas: 0,
                totalUnits: data.tracking?.totalUnits || 0,
                currentStreak: data.tracking?.currentStreak || 0,
                esSemanaAdicional: false,
                newAchievements: data.newAchievements || [],
                levelUp: true,
                newLevel: data.newLevel,
                evolution: data.evolution,
                gorillaIcon: data.gorillaIcon
              });
              setShowCelebrationModal(true);
            }
          }
        } catch (error) {
          console.error('[BitacoraPage] Error completando mes', error);
          // Si hay error, permitir intentar de nuevo
          setMonthCompletionChecked(false);
        }
      }
      
      // Resetear la verificación si el progreso baja (nuevo mes)
      if (monthProgress < 100) {
        setMonthCompletionChecked(false);
      }
    };

    checkMonthCompletion();
  }, [monthProgress, logbook, coherence, monthCompletionChecked]);

  const fetchBitacora = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/bitacora/month', {
        credentials: 'include',
        cache: 'no-store'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al obtener la bitácora');
      }

      const data = await response.json();
      setLogbook(data.logbook);
      
      // Procesar semanas y días para determinar qué está desbloqueado
      if (data.logbook && data.logbook.weeklyContents) {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        
        // Actualizar estados de desbloqueo basado en fechas
        const processedWeeks = data.logbook.weeklyContents.map((week: WeeklyContent) => {
          // Normalizar fecha de publicación de la semana
          const weekPublishDate = new Date(week.publishDate);
          weekPublishDate.setHours(0, 0, 0, 0);
          // Desbloquear solo si la fecha es menor o igual a hoy (no futura)
          const isWeekUnlocked = weekPublishDate.getTime() <= now.getTime();
          
          if (week.dailyContents && week.dailyContents.length > 0) {
            week.dailyContents = week.dailyContents.map((day: DailyContent) => {
              // Normalizar fecha de publicación del día
              const dayPublishDate = new Date(day.publishDate);
              dayPublishDate.setHours(0, 0, 0, 0);
              // Desbloquear solo si la fecha es menor o igual a hoy Y la semana está desbloqueada
              day.isUnlocked = dayPublishDate.getTime() <= now.getTime() && isWeekUnlocked;
              return day;
            });
          }
          
          week.isUnlocked = isWeekUnlocked;
          return week;
        });
        
        data.logbook.weeklyContents = processedWeeks;
        setLogbook(data.logbook);
        
        // Seleccionar automáticamente la semana ANTERIOR más cercana a hoy (última semana desbloqueada)
        const unlockedWeeks = processedWeeks.filter((week: WeeklyContent) => week.isUnlocked);
        
        if (unlockedWeeks.length > 0) {
          // Ordenar por fecha de publicación descendente y tomar la más reciente
          const sortedUnlockedWeeks = unlockedWeeks.sort((a: WeeklyContent, b: WeeklyContent) => {
            const dateA = new Date(a.publishDate).getTime();
            const dateB = new Date(b.publishDate).getTime();
            return dateB - dateA; // Descendente: más reciente primero
          });
          
          const mostRecentUnlockedWeek = sortedUnlockedWeeks[0];
          setSelectedWeek(mostRecentUnlockedWeek.weekNumber);
          
          // Si tiene contenido diario, seleccionar el último día desbloqueado
          if (mostRecentUnlockedWeek.dailyContents && mostRecentUnlockedWeek.dailyContents.length > 0) {
            const unlockedDays = mostRecentUnlockedWeek.dailyContents.filter((day: DailyContent) => day.isUnlocked);
            if (unlockedDays.length > 0) {
              // Ordenar por fecha descendente y tomar el más reciente
              const sortedDays = unlockedDays.sort((a: DailyContent, b: DailyContent) => {
                const dateA = new Date(a.publishDate).getTime();
                const dateB = new Date(b.publishDate).getTime();
                return dateB - dateA; // Descendente: más reciente primero
              });
              
              const mostRecentDay = sortedDays[0];
              setSelectedDay(mostRecentDay.dayNumber);
              
              // Priorizar visual si existe, sino audioText
              if (mostRecentDay.visualContent?.type === 'video' || mostRecentDay.visualContent?.videoUrl) {
                setSelectedContentType('visual');
              } else if (mostRecentDay.audioTextContent) {
                setSelectedContentType('audioText');
              }
            }
          } else {
            // Estructura legacy: usar video si existe
            setSelectedDay(null);
            if (mostRecentUnlockedWeek.videoUrl) {
              setSelectedContentType('visual');
            } else if (mostRecentUnlockedWeek.audioUrl || mostRecentUnlockedWeek.text) {
              setSelectedContentType('audioText');
            }
          }
        } else {
          // Si no hay semanas desbloqueadas, mostrar la primera
          setSelectedWeek(processedWeeks[0]?.weekNumber || null);
        }
      }
      
      setInitialLoading(false);
    } catch (err: any) {
      console.error('Error obteniendo bitácora:', err);
      setError(err.message || 'Error al cargar la bitácora');
    } finally {
      setLoading(false);
    }
  };


  const checkIfCompleted = async (logbookId: string, weekNumber: number) => {
    // Verificar si esta semana ya fue completada
    const weekKey = `${logbookId}-${weekNumber}`;
    // Por ahora asumimos que no está completada, esto se puede mejorar consultando la API
  };

  const handleSelect = (weekNumber: number, dayNumber: number | null, contentType: 'visual' | 'audioText' | null) => {
    setSelectedWeek(weekNumber);
    setSelectedDay(dayNumber);
    setSelectedContentType(contentType);
  };

  const handleComplete = async () => {
    if (!logbook || !selectedWeek || isCompleting) return;
    
    const week = logbook.weeklyContents.find(w => w.weekNumber === selectedWeek);
    if (!week) return;
    
    // Permitir completar incluso si está bloqueado para administradores
    // Para usuarios normales, verificar desbloqueo
    if (auth.user?.rol !== 'Admin') {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const weekPublishDate = new Date(week.publishDate);
      weekPublishDate.setHours(0, 0, 0, 0);
      const isWeekUnlocked = weekPublishDate.getTime() <= now.getTime();
      
      if (!isWeekUnlocked) {
        toast.error('Esta semana aún no está disponible');
        return;
      }
      
      // Si hay contenido diario, verificar el día
      if (selectedDay && week.dailyContents) {
        const day = week.dailyContents.find(d => d.dayNumber === selectedDay);
        if (day) {
          const dayPublishDate = new Date(day.publishDate);
          dayPublishDate.setHours(0, 0, 0, 0);
          const isDayUnlocked = dayPublishDate.getTime() <= now.getTime();
          if (!isDayUnlocked) {
            toast.error('Este día aún no está disponible');
            return;
          }
        }
      }
    }

    setIsCompleting(true);

    const requestBody = {
      logbookId: logbook._id,
      weekNumber: selectedWeek,
      dayNumber: selectedDay || null,
      contentType: selectedContentType // Enviar el tipo de contenido (visual o audioText)
    };

    console.log('[BitacoraPage] handleComplete: Enviando petición');
    console.log('  - logbookId:', logbook._id);
    console.log('  - weekNumber:', selectedWeek);
    console.log('  - dayNumber:', selectedDay);
    console.log('  - contentType:', selectedContentType);

    try {
      const response = await fetch('/api/bitacora/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al completar');
      }

      const data = await response.json();
      
      console.log('[BitacoraPage] handleComplete: Respuesta recibida');
      console.log('  - success:', data.success);
      console.log('  - totalUnits:', data.tracking?.totalUnits);
      console.log('  - esSemanaAdicional:', data.esSemanaAdicional);
      console.log('  - ucsOtorgadas:', data.ucsOtorgadas);
      console.log('  - weekNumber:', data.weekNumber);
      console.log('  - contentType:', data.contentType);
      console.log('  - message:', data.message);
      
      // Si no se pudo agregar U.C. (pero la clase se completó)
      if (data.success === false) {
        // La clase se completó pero no se otorgó U.C.
        const totalUnits = data.tracking?.totalUnits || coherence.coherenceTracking?.totalUnits || 0;
        
        // Mostrar modal informativo con el motivo
        setInfoModalData({
          message: data.message || 'No se pudo agregar la Unidad de Coherencia',
          tip: data.tip || undefined,
          reason: data.reason || undefined,
          weekNumber: data.weekNumber || selectedWeek || undefined,
          contentType: data.contentType || selectedContentType || undefined
        });
        setShowInfoModal(true);
        
        // Actualizar tracking aunque no se haya otorgado U.C.
        if (data.tracking) {
          coherence.updateTracking({
            totalUnits: data.tracking.totalUnits,
            currentStreak: data.tracking.currentStreak,
            longestStreak: data.tracking.longestStreak
          });
        }
        
        // Actualizar arrays de completados
        if (data.completedDays && data.completedDays.length > 0) {
          data.completedDays.forEach((key: string) => {
            coherence.markDayCompleted(key);
          });
        }
        if (data.completedWeeks && data.completedWeeks.length > 0) {
          data.completedWeeks.forEach((key: string) => {
            coherence.markWeekCompleted(key);
          });
        }
        if (data.completedVideos && data.completedVideos.length > 0) {
          data.completedVideos.forEach((key: string) => {
            coherence.markVideoCompleted(key, 1);
          });
        }
        if (data.completedAudios && data.completedAudios.length > 0) {
          data.completedAudios.forEach((key: string) => {
            coherence.markAudioCompleted(key);
          });
        }
        
        return; // Salir temprano ya que no se otorgó U.C.
      }
      
      // Marcar como completado usando el contexto con los datos del servidor
      if (data.completedDays && data.completedDays.length > 0) {
        console.log('[BitacoraPage] handleComplete: Marcando días completados', data.completedDays);
        data.completedDays.forEach((key: string) => {
          coherence.markDayCompleted(key);
        });
      }
      
      if (data.completedWeeks && data.completedWeeks.length > 0) {
        console.log('[BitacoraPage] handleComplete: Marcando semanas completadas', data.completedWeeks);
        data.completedWeeks.forEach((key: string) => {
          coherence.markWeekCompleted(key);
        });
      }
      
      if (data.completedVideos && data.completedVideos.length > 0) {
        console.log('[BitacoraPage] handleComplete: Marcando videos completados', data.completedVideos);
        data.completedVideos.forEach((key: string) => {
          coherence.markVideoCompleted(key, 1);
        });
      }
      
      if (data.completedAudios && data.completedAudios.length > 0) {
        console.log('[BitacoraPage] handleComplete: Marcando audios completados', data.completedAudios);
        data.completedAudios.forEach((key: string) => {
          coherence.markAudioCompleted(key);
        });
      }
      
      // Actualizar tracking en el contexto directamente desde la respuesta (sin reload)
      if (data.tracking) {
        console.log('[BitacoraPage] handleComplete: Actualizando tracking', {
          totalUnitsAntes: coherence.coherenceTracking?.totalUnits,
          totalUnitsNuevo: data.tracking.totalUnits
        });
        
        coherence.updateTracking({
          totalUnits: data.tracking.totalUnits,
          currentStreak: data.tracking.currentStreak,
          longestStreak: data.tracking.longestStreak
        });
        
        console.log('[BitacoraPage] handleComplete: Tracking actualizado', {
          totalUnitsDespues: coherence.coherenceTracking?.totalUnits
        });
        
        // Actualizar achievements si hay nuevos
        if (data.newAchievements && data.newAchievements.length > 0) {
          const currentAchievements = coherence.coherenceTracking?.achievements || [];
          coherence.updateTracking({
            achievements: [...currentAchievements, ...data.newAchievements.map((a: any) => ({
              name: a.name,
              description: a.description,
              icon: a.icon,
              unlockedAt: new Date().toISOString()
            }))]
          });
        }
      }

      // Mostrar modal de celebración con U.C. otorgada
      const totalUnits = data.tracking?.totalUnits || coherence.coherenceTracking?.totalUnits || 0;
      const esSemanaAdicional = data.esSemanaAdicional || false;
      const ucsOtorgadas = data.ucsOtorgadas || 1;
      const currentStreak = data.tracking?.currentStreak || coherence.coherenceTracking?.currentStreak || 0;
      
      // Configurar datos del modal de celebración
      setCelebrationData({
        ucsOtorgadas,
        totalUnits,
        currentStreak,
        esSemanaAdicional,
        newAchievements: data.newAchievements || []
      });
      setShowCelebrationModal(true);

    } catch (err: any) {
      console.error('Error completando:', err);
      toast.error(err.message || 'Error al completar la bitácora');
    } finally {
      setIsCompleting(false);
    }
  };

  // Obtener el contenido seleccionado actual
  const getSelectedContent = (): {
    type: 'visual';
    videoUrl?: string;
    videoId?: string;
    thumbnailUrl?: string;
    title?: string;
    dayTitle?: string;
    description?: string;
    duration?: number;
  } | {
    type: 'audioText';
    audioUrl?: string;
    audioDuration?: number;
    text?: string;
    title?: string;
    dayTitle?: string;
    subtitle?: string;
  } | null => {
    if (!logbook || selectedWeek === null) return null;
    
    const week = logbook.weeklyContents.find(w => w.weekNumber === selectedWeek);
    if (!week) return null;
    
    // Si hay contenido diario
    if (week.dailyContents && week.dailyContents.length > 0 && selectedDay !== null) {
      const day = week.dailyContents.find(d => d.dayNumber === selectedDay);
      if (!day) return null;
      
      if (selectedContentType === 'visual' && day.visualContent) {
        // Extraer videoId de la URL si no está presente
        let videoId = day.visualContent.videoId;
        if (!videoId && day.visualContent.videoUrl) {
          const vimeoMatch = day.visualContent.videoUrl.match(/(?:vimeo\.com\/)(\d+)/);
          if (vimeoMatch && vimeoMatch[1]) {
            videoId = vimeoMatch[1];
          }
        }
        
        return {
          type: 'visual' as const,
          videoUrl: day.visualContent.videoUrl,
          videoId: videoId,
          thumbnailUrl: day.visualContent.thumbnailUrl,
          title: day.visualContent.title || day.dayTitle,
          dayTitle: day.dayTitle,
          description: day.visualContent.description,
          duration: day.visualContent.duration
        };
      } else if (selectedContentType === 'audioText' && day.audioTextContent) {
        return {
          type: 'audioText' as const,
          audioUrl: day.audioTextContent.audioUrl,
          audioDuration: day.audioTextContent.audioDuration,
          text: day.audioTextContent.text,
          title: day.audioTextContent.title || day.dayTitle,
          dayTitle: day.dayTitle,
          subtitle: day.audioTextContent.subtitle
        };
      }
    } else {
      // Estructura legacy
      if (selectedContentType === 'visual' && week.videoUrl) {
        // Extraer videoId de la URL si no está presente
        let videoId = week.videoId;
        if (!videoId && week.videoUrl) {
          const vimeoMatch = week.videoUrl.match(/(?:vimeo\.com\/)(\d+)/);
          if (vimeoMatch && vimeoMatch[1]) {
            videoId = vimeoMatch[1];
          }
        }
        
        return {
          type: 'visual' as const,
          videoUrl: week.videoUrl,
          videoId: videoId,
          title: `Semana ${week.weekNumber} - Video`
        };
      } else if (selectedContentType === 'audioText') {
        return {
          type: 'audioText' as const,
          audioUrl: week.audioUrl,
          text: week.text,
          title: `Semana ${week.weekNumber}`
        };
      }
    }
    
    return null;
  };

  if (initialLoading || loading) {
    return (
      <>
        <MoveCrewLoading show={initialLoading || loading} />
        <div className="min-h-screen bg-gray-50" />
      </>
    );
  }

  if (error || !logbook) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 font-montserrat">
        <div className="text-center max-w-md px-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4 font-montserrat">
            No hay bitácora disponible
          </h1>
          <p className="text-gray-700/90 mb-6 font-montserrat font-light">
            {error || 'No hay contenido disponible. Pronto estará disponible.'}
          </p>
          <button
            onClick={() => router.push('/home')}
            className="px-6 py-3 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-rose-500/20 backdrop-blur-md border border-amber-300/40 text-gray-900 rounded-full font-medium hover:border-amber-300/60 hover:shadow-lg transition-all duration-300 font-montserrat"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const selectedContent = getSelectedContent();
  const selectedWeekData = logbook?.weeklyContents.find(w => w.weekNumber === selectedWeek) || null;

  return (
    <>
    <MainSideBar where={'bitacora'}>  
      <MoveCrewLoading show={initialLoading} />
      <div className="min-h-screen bg-gray-50 font-montserrat relative">
        {/* Layout principal con flex */}
        <div className="flex relative justify-between">
          {/* Overlay para cerrar sidebar en mobile */}
          {sidebarOpen && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                setSidebarOpen(false);
              }}
              className="lg:hidden fixed inset-0 bg-black/50 z-[55] transition-opacity duration-300"
            />
          )}

          {/* Botón para toggle del sidebar - solo visible en mobile, a la derecha */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSidebarOpen(!sidebarOpen);
            }}
            className={`
              lg:hidden fixed top-6 md:top-20 right-4 z-[70]
              p-2 bg-white/80 backdrop-blur-sm border border-gray-300/50 rounded-lg shadow-md hover:bg-white/90 hover:shadow-lg transition-all duration-200
              ${sidebarOpen ? 'opacity-40 hover:opacity-100' : 'opacity-60 hover:opacity-100'}
            `}
            type="button"
          >
            {sidebarOpen ? (
              <XMarkIcon className="w-4 h-4 text-gray-700" />
            ) : (
              <Bars3Icon className="w-4 h-4 text-gray-700" />
            )}
          </button>

          {/* Sidebar */}
          <motion.aside
            initial={false}
            animate={{
              x: isDesktop ? 0 : (sidebarOpen ? 0 : '-100%'),
            }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            onClick={(e) => e.stopPropagation()}
            className={`
              fixed lg:relative
              left-0 top-0 
              h-screen 
              bg-gradient-to-br from-white via-gray-50/50 to-amber-50/30 
              border-r border-amber-200/40 
              shadow-xl lg:shadow-none
              z-[58] lg:z-auto
              flex-shrink-0
              overflow-hidden
            `}
            style={{
              width: isDesktop 
                ? '380px'  // En desktop siempre 380px, no se cierra
                : '380px'
            }}
          >

            {/* Contenido del sidebar - oculto cuando está cerrado en desktop */}
            <div className={`
              w-[420px] h-full
              ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
              transition-opacity duration-150
              overflow-hidden
            `}>
              <BitacoraSidebar
                logbook={logbook}
                selectedWeek={selectedWeek}
                selectedDay={selectedDay}
                selectedContentType={selectedContentType}
                onSelect={(week, day, type) => {
                  handleSelect(week, day, type);
                  // Cerrar sidebar en mobile al seleccionar
                  if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                    setSidebarOpen(false);
                  }
                }}
                completedWeeks={coherence.completedWeeks}
                completedDays={coherence.completedDays}
                onClose={() => setSidebarOpen(false)}
              />
            </div>
          </motion.aside>

          {/* Contenido principal (banner + main content) */}
          <div className={`
            flex-1 
            min-w-0
            transition-all duration-300
            ${sidebarOpen ? 'lg:ml-0' : 'lg:ml-0'}
            ${sidebarOpen ? 'lg:pointer-events-auto pointer-events-none' : 'pointer-events-auto'}
          `}
          style={{
            zIndex: sidebarOpen && !isDesktop ? 50 : 'auto'
          }}
          >
            {/* Header Banner con imagen de fondo - solo para audio y texto */}
            {selectedContentType === 'audioText' && (
              <div className="relative w-full h-[35vh] min-h-[300px] max-h-[450px] overflow-hidden bg-black">
                {/* Imagen de fondo */}
                <CldImage
                  src="my_uploads/msbtxfaeeizafeo9axkq"
                  alt="El Camino del Gorila"
                  fill
                  className="object-cover opacity-40"
                  priority
                  sizes="100vw"
                  loader={imageLoader}
                />
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
                
                {/* Contenido del banner */}
                <div className="relative h-full flex items-center justify-between px-4 sm:px-6 lg:px-8">
                  <div className="flex items-center gap-6 flex-1 max-w-7xl mx-auto w-full">
                    {/* Icono de gorila con círculo de progreso */}
                    <div className="relative flex-shrink-0">
                      <svg className="w-20 h-20 md:w-24 md:h-24 transform -rotate-90" viewBox="0 0 100 100">
                        {/* Círculo de fondo */}
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="rgba(251, 191, 36, 0.2)"
                          strokeWidth="8"
                        />
                        {/* Círculo de progreso con gradiente Move Crew */}
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="url(#progressGradient)"
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 45}`}
                          strokeDashoffset={`${2 * Math.PI * 45 * (1 - monthProgress / 100)}`}
                          className="transition-all duration-500 ease-out"
                        />
                        {/* Definición del gradiente */}
                        <defs>
                          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.9" />
                            <stop offset="50%" stopColor="#F97316" stopOpacity="0.9" />
                            <stop offset="100%" stopColor="#E11D48" stopOpacity="0.9" />
                          </linearGradient>
                        </defs>
                      </svg>
                      {/* Componente de gorila con nivel y progreso */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        {coherence.coherenceTracking && (
                          <GorillaLevelDisplay
                            level={coherence.coherenceTracking.level || 1}
                            gorillaIcon={coherence.coherenceTracking.gorillaIcon || '🦍'}
                            evolutionName={coherence.coherenceTracking.evolutionName || 'Gorila Bebé'}
                            progressToNextLevel={coherence.coherenceTracking.progressToNextLevel || 0}
                            monthsCompleted={coherence.coherenceTracking.monthsCompleted || 0}
                            size="sm"
                            showProgressBar={false}
                            showLevel={true}
                          />
                        )}
                        {!coherence.coherenceTracking && (
                          <svg
                            viewBox="0 0 262.309 262.309"
                            className="w-12 h-12 md:w-14 md:h-14 text-amber-400"
                            fill="currentColor"
                          >
                            <path d="M259.483,96.3c0.312-6.277-0.907-6.465-4.359-11.17c0.596-6.163-2.919-7.843-4.802-8.157
                              c-1.881-0.307-3.495-6.423-1.613-7.519c1.885-1.094,8.465-5.424-1.6-14.871c-3.289-3.144-6.916-9.1-6.916-14.9
                              c0-5.802-1.727-7.061-5.183-8.472c-3.448-1.405-20.7-10.191-29.48-1.094c-8.79,9.088-21.15,27.987-23.173,28.869
                              c-8.258,3.579-22.32,3.652-30.738,8.778c-8.417,5.119-15.739,25.987-30.377,29.271c-14.636,3.299-26.35-12.805-47.575-2.917
                              c-21.227,9.881-43.188,49.767-43.919,63.31c-0.728,13.541-3.293,18.66-10.608,21.958c-7.326,3.299-10.981,6.583-13.911,19.031
                              c-2.925,12.442-8.044,23.011-3.29,30.375c4.755,7.365,6.219,7.365,11.342,7.365c5.123,0,31.469,0,31.469,0
                              c4.246,0,6.287-4.975,4.089-8.434c-2.196-3.448-12.707-6.431-5.646-13.794c7.058-7.374,23.608-19.26,27.445-25.254
                              c3.883-6.066,4.708-5.176,8.159,1.257c3.452,6.428,12.232,21.947,13.644,40.459c0.158,3.926-1.094,5.766,5.49,5.766
                              c6.587,0,31.368,0,31.368,0s6.431-6.078,2.668-10.471c-3.768-4.394-8.785-6.432-8.626-14.9c0.153-8.473-3.14-15.056,2.353-15.216
                              c5.491-0.149,14.271-1.726,17.094-4.078c2.819-2.353,5.017-2.98,5.805,4.868c0.786,7.84,3.138,16.149-0.629,18.656
                              c-3.764,2.515-9.406,7.715-6.275,14.435c3.141,6.706,3.768,6.706,8.785,6.706c5.022,0,20.864,0,20.864,0s2.823,1.6,6.27-7.651
                              c3.451-9.251,11.761-35.755,10.195-53.008c-0.47-6.278,3.764-3.608,4.081-0.782c0.312,2.823,1.412,16.462,1.412,16.462
                              s0.315,8.473,4.232,13.959c3.923,5.486,9.41,14.118,4.551,17.407c-4.867,3.292-5.645,5.02-5.645,7.839
                              c0,2.827-0.94,5.774,4.858,5.774c5.804,0,34.976,0,34.976,0s3.296-0.432,6.586-6.706c3.297-6.27,6.12-8.158,3.452-27.125
                              c-2.664-18.988-2.352-33.88-11.603-49.256c-2.512-4.076-2.824-24.301-2.824-28.543c0-4.238,4.547-3.448,7.052-2.981
                              c2.512,0.475,6.122,0.163,12.708-6.898C258.225,107.592,266.853,100.848,259.483,96.3z"/>
                          </svg>
                        )}
                      </div>
                    </div>

                    {/* Información del usuario y progreso */}
                    <div className="flex-1 min-w-0">
                      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white font-montserrat tracking-tight mb-2 drop-shadow-lg">
                        El Camino del Gorila
                      </h1>
                      <p className="text-base md:text-lg text-white/90 font-montserrat font-light mb-4 drop-shadow-md">
                        {auth.user?.nombre || auth.user?.email || 'Usuario'}
                      </p>
                      {/* Completado y U.C. */}
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-rose-500/20 backdrop-blur-md border border-amber-300/40 rounded-full shadow-lg">
                          <span className="text-xl md:text-2xl font-bold text-white font-montserrat">
                            {monthProgress}%
                          </span>
                          <span className="text-xs md:text-sm text-gray-200 font-montserrat font-light uppercase tracking-wide">
                            Completado
                          </span>
                        </div>
                        {coherence.coherenceTracking && (
                          <div className="flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-rose-500/20 backdrop-blur-md border border-amber-300/40 rounded-full shadow-lg">
                            <FireIcon className="w-5 h-5 md:w-6 md:h-6 text-amber-400 flex-shrink-0" />
                            <span className="text-xl md:text-2xl font-bold text-white font-montserrat">
                              {coherence.coherenceTracking?.totalUnits || 0}
                            </span>
                            <span className="text-xs md:text-sm text-gray-200 font-montserrat font-light uppercase tracking-wide">
                              U.C.
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Main Content */}
            <div className="min-h-screen">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 lg:pt-20 pb-8">
            {/* Contenido Principal */}
            {/* Banner mobile compacto para video */}
            {selectedContent?.type === 'visual' && (
              <div className="md:hidden mb-4 bg-gradient-to-br from-white via-gray-50/50 to-amber-50/30 border border-amber-200/40 rounded-xl p-3 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
                <div className="flex items-center justify-between gap-3">
                  {/* Icono de gorila con círculo de progreso */}
                  <div className="relative flex-shrink-0">
                    <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 100 100">
                      {/* Círculo de fondo */}
                      <circle
                        cx="50"
                        cy="50"
                        r="32"
                        fill="none"
                        stroke="rgba(251, 191, 36, 0.2)"
                        strokeWidth="5"
                      />
                      {/* Círculo de progreso con gradiente Move Crew */}
                      <circle
                        cx="50"
                        cy="50"
                        r="32"
                        fill="none"
                        stroke="url(#mobileProgressGradient)"
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 32}`}
                          strokeDashoffset={`${2 * Math.PI * 32 * (1 - monthProgress / 100)}`}
                        className="transition-all duration-500 ease-out"
                      />
                      {/* Definición del gradiente */}
                      <defs>
                        <linearGradient id="mobileProgressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.9" />
                          <stop offset="50%" stopColor="#F97316" stopOpacity="0.9" />
                          <stop offset="100%" stopColor="#E11D48" stopOpacity="0.9" />
                        </linearGradient>
                      </defs>
                    </svg>
                    {/* Icono de gorila en el centro - en negro */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg
                        viewBox="0 0 262.309 262.309"
                        className="w-6 h-6 text-black"
                        fill="currentColor"
                      >
                        <path d="M259.483,96.3c0.312-6.277-0.907-6.465-4.359-11.17c0.596-6.163-2.919-7.843-4.802-8.157
                          c-1.881-0.307-3.495-6.423-1.613-7.519c1.885-1.094,8.465-5.424-1.6-14.871c-3.289-3.144-6.916-9.1-6.916-14.9
                          c0-5.802-1.727-7.061-5.183-8.472c-3.448-1.405-20.7-10.191-29.48-1.094c-8.79,9.088-21.15,27.987-23.173,28.869
                          c-8.258,3.579-22.32,3.652-30.738,8.778c-8.417,5.119-15.739,25.987-30.377,29.271c-14.636,3.299-26.35-12.805-47.575-2.917
                          c-21.227,9.881-43.188,49.767-43.919,63.31c-0.728,13.541-3.293,18.66-10.608,21.958c-7.326,3.299-10.981,6.583-13.911,19.031
                          c-2.925,12.442-8.044,23.011-3.29,30.375c4.755,7.365,6.219,7.365,11.342,7.365c5.123,0,31.469,0,31.469,0
                          c4.246,0,6.287-4.975,4.089-8.434c-2.196-3.448-12.707-6.431-5.646-13.794c7.058-7.374,23.608-19.26,27.445-25.254
                          c3.883-6.066,4.708-5.176,8.159,1.257c3.452,6.428,12.232,21.947,13.644,40.459c0.158,3.926-1.094,5.766,5.49,5.766
                          c6.587,0,31.368,0,31.368,0s6.431-6.078,2.668-10.471c-3.768-4.394-8.785-6.432-8.626-14.9c0.153-8.473-3.14-15.056,2.353-15.216
                          c5.491-0.149,14.271-1.726,17.094-4.078c2.819-2.353,5.017-2.98,5.805,4.868c0.786,7.84,3.138,16.149-0.629,18.656
                          c-3.764,2.515-9.406,7.715-6.275,14.435c3.141,6.706,3.768,6.706,8.785,6.706c5.022,0,20.864,0,20.864,0s2.823,1.6,6.27-7.651
                          c3.451-9.251,11.761-35.755,10.195-53.008c-0.47-6.278,3.764-3.608,4.081-0.782c0.312,2.823,1.412,16.462,1.412,16.462
                          s0.315,8.473,4.232,13.959c3.923,5.486,9.41,14.118,4.551,17.407c-4.867,3.292-5.645,5.02-5.645,7.839
                          c0,2.827-0.94,5.774,4.858,5.774c5.804,0,34.976,0,34.976,0s3.296-0.432,6.586-6.706c3.297-6.27,6.12-8.158,3.452-27.125
                          c-2.664-18.988-2.352-33.88-11.603-49.256c-2.512-4.076-2.824-24.301-2.824-28.543c0-4.238,4.547-3.448,7.052-2.981
                          c2.512,0.475,6.122,0.163,12.708-6.898C258.225,107.592,266.853,100.848,259.483,96.3z"/>
                      </svg>
                    </div>
                  </div>

                  {/* Información de progreso y U.C. */}
                  <div className="flex-1 flex items-center gap-2">
                    {/* Porcentaje completado */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-rose-500/20 backdrop-blur-md border border-amber-300/40 rounded-full shadow-sm">
                      <span className="text-base font-bold text-gray-900 font-montserrat">
                        {monthProgress}%
                      </span>
                      <span className="text-[10px] text-gray-700 font-montserrat font-light uppercase tracking-wide">
                        Completado
                      </span>
                    </div>
                    
                    {/* U.C. */}
                    {coherence.coherenceTracking && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-rose-500/20 backdrop-blur-md border border-amber-300/40 rounded-full shadow-sm">
                        <FireIcon className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                        <span className="text-base font-bold text-gray-900 font-montserrat">
                          {coherence.coherenceTracking?.totalUnits || 0}
                        </span>
                        <span className="text-[10px] text-gray-700 font-montserrat font-light uppercase tracking-wide">
                          U.C.
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            <div className="relative">
              {/* Banner de U.C. para web - solo para video, alineado a la derecha arriba */}
              {selectedContent?.type === 'visual' && (
                <div className="hidden md:flex absolute top-0 right-4 z-10 rounded-xl shadow-lg">
                  <div className="flex items-center gap-3">
                    {/* Icono de gorila con círculo de progreso */}
                    <div className="relative flex-shrink-0">
                      <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 100 100">
                        {/* Círculo de fondo */}
                        <circle
                          cx="50"
                          cy="50"
                          r="32"
                          fill="none"
                          stroke="rgba(251, 191, 36, 0.2)"
                          strokeWidth="5"
                        />
                        {/* Círculo de progreso con gradiente Move Crew */}
                        <circle
                          cx="50"
                          cy="50"
                          r="32"
                          fill="none"
                          stroke="url(#webProgressGradient)"
                          strokeWidth="5"
                          strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 32}`}
                          strokeDashoffset={`${2 * Math.PI * 32 * (1 - monthProgress / 100)}`}
                          className="transition-all duration-500 ease-out"
                        />
                        {/* Definición del gradiente */}
                        <defs>
                          <linearGradient id="webProgressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.9" />
                            <stop offset="50%" stopColor="#F97316" stopOpacity="0.9" />
                            <stop offset="100%" stopColor="#E11D48" stopOpacity="0.9" />
                          </linearGradient>
                        </defs>
                      </svg>
                      {/* Icono de gorila en el centro - en negro */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg
                          viewBox="0 0 262.309 262.309"
                          className="w-6 h-6 text-black"
                          fill="currentColor"
                        >
                          <path d="M259.483,96.3c0.312-6.277-0.907-6.465-4.359-11.17c0.596-6.163-2.919-7.843-4.802-8.157
                            c-1.881-0.307-3.495-6.423-1.613-7.519c1.885-1.094,8.465-5.424-1.6-14.871c-3.289-3.144-6.916-9.1-6.916-14.9
                            c0-5.802-1.727-7.061-5.183-8.472c-3.448-1.405-20.7-10.191-29.48-1.094c-8.79,9.088-21.15,27.987-23.173,28.869
                            c-8.258,3.579-22.32,3.652-30.738,8.778c-8.417,5.119-15.739,25.987-30.377,29.271c-14.636,3.299-26.35-12.805-47.575-2.917
                            c-21.227,9.881-43.188,49.767-43.919,63.31c-0.728,13.541-3.293,18.66-10.608,21.958c-7.326,3.299-10.981,6.583-13.911,19.031
                            c-2.925,12.442-8.044,23.011-3.29,30.375c4.755,7.365,6.219,7.365,11.342,7.365c5.123,0,31.469,0,31.469,0
                            c4.246,0,6.287-4.975,4.089-8.434c-2.196-3.448-12.707-6.431-5.646-13.794c7.058-7.374,23.608-19.26,27.445-25.254
                            c3.883-6.066,4.708-5.176,8.159,1.257c3.452,6.428,12.232,21.947,13.644,40.459c0.158,3.926-1.094,5.766,5.49,5.766
                            c6.587,0,31.368,0,31.368,0s6.431-6.078,2.668-10.471c-3.768-4.394-8.785-6.432-8.626-14.9c0.153-8.473-3.14-15.056,2.353-15.216
                            c5.491-0.149,14.271-1.726,17.094-4.078c2.819-2.353,5.017-2.98,5.805,4.868c0.786,7.84,3.138,16.149-0.629,18.656
                            c-3.764,2.515-9.406,7.715-6.275,14.435c3.141,6.706,3.768,6.706,8.785,6.706c5.022,0,20.864,0,20.864,0s2.823,1.6,6.27-7.651
                            c3.451-9.251,11.761-35.755,10.195-53.008c-0.47-6.278,3.764-3.608,4.081-0.782c0.312,2.823,1.412,16.462,1.412,16.462
                            s0.315,8.473,4.232,13.959c3.923,5.486,9.41,14.118,4.551,17.407c-4.867,3.292-5.645,5.02-5.645,7.839
                            c0,2.827-0.94,5.774,4.858,5.774c5.804,0,34.976,0,34.976,0s3.296-0.432,6.586-6.706c3.297-6.27,6.12-8.158,3.452-27.125
                            c-2.664-18.988-2.352-33.88-11.603-49.256c-2.512-4.076-2.824-24.301-2.824-28.543c0-4.238,4.547-3.448,7.052-2.981
                            c2.512,0.475,6.122,0.163,12.708-6.898C258.225,107.592,266.853,100.848,259.483,96.3z"/>
                        </svg>
                      </div>
                    </div>

                    {/* Información de progreso y U.C. */}
                    <div className="flex items-center gap-2">
                      {/* Porcentaje completado */}
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-rose-500/20 backdrop-blur-md border border-amber-300/40 rounded-full shadow-sm">
                        <span className="text-base font-bold text-gray-900 font-montserrat">
                          {monthProgress}%
                        </span>
                        <span className="text-[10px] text-gray-700 font-montserrat font-light uppercase tracking-wide">
                          Completado
                        </span>
                      </div>
                      
                      {/* U.C. */}
                      {coherence.coherenceTracking && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-rose-500/20 backdrop-blur-md border border-amber-300/40 rounded-full shadow-sm">
                          <FireIcon className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                          <span className="text-base font-bold text-gray-900 font-montserrat">
                            {coherence.coherenceTracking?.totalUnits || 0}
                          </span>
                          <span className="text-[10px] text-gray-700 font-montserrat font-light uppercase tracking-wide">
                            U.C.
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {selectedContent && selectedWeekData && (
                // Verificar desbloqueo: para contenido diario verificar día, para legacy verificar semana
                (() => {
                  if (auth.user?.rol === 'Admin') return true;
                  
                  const now = new Date();
                  now.setHours(0, 0, 0, 0);
                  
                  // Verificar que la semana esté desbloqueada
                  const weekPublishDate = new Date(selectedWeekData.publishDate);
                  weekPublishDate.setHours(0, 0, 0, 0);
                  const isWeekUnlocked = weekPublishDate.getTime() <= now.getTime();
                  
                  if (!isWeekUnlocked) return false;
                  
                  // Si hay contenido diario, verificar el día específico
                  if (selectedDay && selectedWeekData.dailyContents) {
                    const day = selectedWeekData.dailyContents.find(d => d.dayNumber === selectedDay);
                    if (day) {
                      const dayPublishDate = new Date(day.publishDate);
                      dayPublishDate.setHours(0, 0, 0, 0);
                      return dayPublishDate.getTime() <= now.getTime();
                    }
                  }
                  
                  // Para contenido legacy, solo verificar la semana
                  return isWeekUnlocked;
                })()
              ) ? (
                <AnimatePresence mode="wait">
                  {selectedContent.type === 'visual' ? (
                    <VideoContentDisplay
                      key={`visual-${selectedWeek}-${selectedDay}`}
                      videoUrl={selectedContent.videoUrl}
                      videoId={selectedContent.videoId}
                      thumbnailUrl={'thumbnailUrl' in selectedContent ? selectedContent.thumbnailUrl : undefined}
                      title={selectedContent.title}
                      description={'description' in selectedContent ? selectedContent.description : undefined}
                      duration={'duration' in selectedContent ? selectedContent.duration : undefined}
                      onComplete={handleComplete}
                      isCompleted={selectedDay 
                        ? coherence.completedVideos.has(`${logbook?._id}-${selectedWeek}-${selectedDay}-video`) 
                        : coherence.completedVideos.has(`${logbook?._id}-${selectedWeek}-week-video`)}
                      logbookId={logbook?._id}
                      weekNumber={selectedWeek || undefined}
                      dayNumber={selectedDay || undefined}
                    />
                  ) : (
                    <AudioTextContentDisplay
                      key={`audioText-${selectedWeek}-${selectedDay}`}
                      audioUrl={'audioUrl' in selectedContent ? selectedContent.audioUrl : undefined}
                      audioDuration={'audioDuration' in selectedContent ? selectedContent.audioDuration : undefined}
                      text={'text' in selectedContent ? selectedContent.text : undefined}
                      title={selectedContent.title}
                      subtitle={'subtitle' in selectedContent ? selectedContent.subtitle : undefined}
                      onComplete={handleComplete}
                      isCompleted={selectedDay 
                        ? coherence.completedAudios.has(`${logbook?._id}-${selectedWeek}-${selectedDay}-audio`) 
                        : coherence.completedAudios.has(`${logbook?._id}-${selectedWeek}-week-audio`)}
                      logbookId={logbook?._id}
                      weekNumber={selectedWeek || undefined}
                      dayNumber={selectedDay || undefined}
                    />
                  )}
                </AnimatePresence>
              ) : selectedWeekData && !selectedWeekData.isUnlocked && auth.user?.rol !== 'Admin' ? (
                <div className="relative rounded-3xl border border-amber-200/40 bg-gradient-to-br from-white via-gray-50/50 to-amber-50/30 backdrop-blur-sm p-12 text-center shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-200/10 to-orange-200/5 rounded-full blur-3xl" />
                  <div className="relative z-10">
                    <LockClosedIcon className="w-16 h-16 text-amber-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 font-montserrat mb-2 tracking-tight">
                      {selectedDay ? `Día ${selectedDay}` : `Semana ${selectedWeek}`} Bloqueada
                    </h2>
                    <p className="text-gray-700/90 mb-4 font-montserrat font-light">
                      Este contenido se desbloqueará el{' '}
                      {new Date(
                        selectedDay && selectedWeekData.dailyContents
                          ? selectedWeekData.dailyContents.find(d => d.dayNumber === selectedDay)?.publishDate || selectedWeekData.publishDate
                          : selectedWeekData.publishDate
                      ).toLocaleDateString('es-ES', { 
                        weekday: 'long',
                        day: 'numeric', 
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                    <p className="text-sm text-gray-600 font-montserrat font-light">
                      Vuelve cuando llegue la fecha de publicación para acceder al contenido.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="relative rounded-3xl border border-amber-200/40 bg-gradient-to-br from-white via-gray-50/50 to-amber-50/30 backdrop-blur-sm p-12 text-center shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-200/10 to-orange-200/5 rounded-full blur-3xl" />
                  <p className="relative z-10 text-gray-700/90 font-montserrat font-light">Selecciona un contenido para comenzar</p>
                </div>
              )}

              {/* Logros - Estética natural y minimalista */}
              {coherence.coherenceTracking && coherence.coherenceTracking.achievements.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mt-8 relative rounded-3xl border overflow-hidden shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, #FFFDFD 0%, #FEFCF8 50%, #F5F1E8 100%)`,
                      borderColor: '#F9731630',
                      borderWidth: '1px'
                    }}
                  >
                    {/* Efecto de fondo sutil */}
                    <div 
                      className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-30"
                      style={{
                        background: `radial-gradient(circle, #FED7AA 0%, transparent 70%)`
                      }}
                    />
                    <div className="relative z-10 p-6">
                      <h3 
                        className="text-lg font-light text-center mb-6 font-montserrat tracking-wide uppercase"
                        style={{ color: '#8B4513' }}
                      >
                        Tus Logros
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {coherence.coherenceTracking.achievements.map((achievement: any, index: number) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1, type: 'spring', stiffness: 200 }}
                            className="flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all duration-300 hover:scale-105"
                            style={{
                              background: `linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(254, 252, 248, 0.6) 100%)`,
                              borderColor: '#F9731620',
                              borderWidth: '1px'
                            }}
                          >
                            <motion.div
                              animate={{
                                scale: [1, 1.1, 1],
                                rotate: [0, 5, -5, 0]
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                repeatDelay: 3,
                                delay: index * 0.2
                              }}
                              className="text-4xl"
                            >
                              {achievement.icon}
                            </motion.div>
                            <div className="text-center">
                              <p 
                                className="font-medium text-sm mb-1 font-montserrat"
                                style={{ color: '#8B4513' }}
                              >
                                {achievement.name}
                              </p>
                              <p 
                                className="text-xs font-light leading-relaxed font-montserrat"
                                style={{ color: '#6B7280' }}
                              >
                                {achievement.description}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

              {/* Información sobre Coherencia */}
              <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="mt-8 relative rounded-3xl border border-amber-200/40 bg-gradient-to-br from-white via-gray-50/50 to-amber-50/30 backdrop-blur-sm p-6 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.04)]"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-200/10 to-orange-200/5 rounded-full blur-3xl" />
                  <div className="relative z-10">
                    <h3 className="text-lg font-bold text-gray-900 mb-3 font-montserrat tracking-tight">
                      ¿Qué es la Coherencia?
                    </h3>
                    <p className="text-sm text-gray-700/90 leading-relaxed mb-4 font-montserrat font-light">
                      La coherencia es la constancia en tu práctica. Cada semana que completes el Camino del Gorila, 
                      cultivas una Unidad de Coherencia (U.C.) y mantienes tu racha activa.
                    </p>
                    <p className="text-sm text-gray-700/90 leading-relaxed mb-4 font-montserrat font-light">
                      Premia la constancia, porque ahí están los resultados en el movimiento.
                    </p>
                    <div className="mt-4 p-4 bg-amber-50/50 border border-amber-200/40 rounded-lg">
                      <p className="text-xs text-gray-700/80 leading-relaxed font-montserrat font-medium mb-2">
                        💡 Sistema de Constancia:
                      </p>
                      <ul className="text-xs text-gray-600/80 leading-relaxed font-montserrat font-light space-y-1 list-disc list-inside">
                        <li><strong>Constancia ideal:</strong> Completa 2 U.C. por semana (1 video + 1 audio) para obtener el máximo de puntos.</li>
                        <li><strong>Si te atrasas:</strong> Si completas más de 2 U.C. en una semana calendario, cada semana adicional solo otorga 1 U.C. en total (no 2).</li>
                        <li><strong>Ejemplo:</strong> Si completas 3 semanas en una semana calendario, obtienes 4 U.C. (2 de la primera semana + 1 de cada semana adicional) en lugar de 6.</li>
                      </ul>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
      </MainSideBar>

      {/* Modal de celebración cuando se obtiene U.C. */}
      {celebrationData && (
        <CoherenceCelebrationModal
          isOpen={showCelebrationModal}
          onClose={() => {
            setShowCelebrationModal(false);
            setCelebrationData(null);
          }}
          ucsOtorgadas={celebrationData.ucsOtorgadas}
          totalUnits={celebrationData.totalUnits}
          currentStreak={celebrationData.currentStreak}
          esSemanaAdicional={celebrationData.esSemanaAdicional}
          newAchievements={celebrationData.newAchievements}
          levelUp={celebrationData.levelUp}
          newLevel={celebrationData.newLevel}
          evolution={celebrationData.evolution}
          gorillaIcon={celebrationData.gorillaIcon}
        />
      )}

      {/* Modal informativo cuando NO se obtiene U.C. */}
      {infoModalData && (
        <CoherenceInfoModal
          isOpen={showInfoModal}
          onClose={() => {
            setShowInfoModal(false);
            setInfoModalData(null);
          }}
          message={infoModalData.message}
          tip={infoModalData.tip}
          reason={infoModalData.reason}
          weekNumber={infoModalData.weekNumber}
          contentType={infoModalData.contentType}
        />
      )}
    </>
  );
}

export default function BitacoraPage() {
  return (
    <CoherenceProvider>
      <BitacoraPageContent />
    </CoherenceProvider>
  );
}
