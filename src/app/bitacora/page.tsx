'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircleIcon, 
  LockClosedIcon
} from '@heroicons/react/24/solid';
import { CldImage } from 'next-cloudinary';
import imageLoader from '../../../imageLoader';
import { toast } from 'react-hot-toast';
import Cookies from 'js-cookie';
import WeeklyPathSidebar from '../../components/PageComponent/WeeklyPath/WeeklyPathSidebar';
import VideoContentDisplay from '../../components/PageComponent/WeeklyPath/VideoContentDisplay';
import AudioTextContentDisplay from '../../components/PageComponent/WeeklyPath/AudioTextContentDisplay';
import MoveCrewLoading from '../../components/PageComponent/MoveCrew/MoveCrewLoading';
import MainSideBar from '../../components/MainSidebar/MainSideBar';
import WeeklyPathSkeleton from '../../components/WeeklyPathSkeleton';
import { CoherenceProvider, useCoherence } from '../../contexts/CoherenceContext';
import CoherenceCelebrationModal from '../../components/PageComponent/WeeklyPath/CoherenceCelebrationModal';
import CoherenceInfoModal from '../../components/PageComponent/WeeklyPath/CoherenceInfoModal';
import GorillaLevelDisplay from '../../components/PageComponent/WeeklyPath/GorillaLevelDisplay';
import VideoHeaderGorilla from '../../components/PageComponent/WeeklyPath/VideoHeaderGorilla';
import WeeklyPathLoading from '../../components/PageComponent/MoveCrew/WeeklyPathLoading';
import FooterProfile from '../../components/PageComponent/Profile/FooterProfile';
import WeeklyReportModal from '../../components/WeeklyReportModal';

import Footer from '../../components/Footer';
import Link from 'next/link';

const WeeklyPathFooter = () => (
  <footer className="bg-black text-white mt-12">
    <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row md:items-start md:justify-between gap-8">
      <div className="flex items-center gap-4">
        <Link href="/">
          <img
            alt="MforMove logo blanco"
            src="/images/MFORMOVE_blanco03.png"
            width={180}
            height={60}
            className="h-12 w-auto object-contain"
          />
        </Link>
        <p className="text-sm text-white/70 font-light font-montserrat">
          Move Crew - Camino
        </p>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-white/80 font-light font-montserrat">
        <Link href="/faq" className="hover:text-white transition-colors">Preguntas Frecuentes</Link>
        <a href="/documents/terms-and-conditions.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Términos y Condiciones</a>
        <a href="/privacy" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Políticas de Privacidad</a>
      </div>
    </div>
  </footer>
);

const shapeIcon = (seed: string | number) => {
  const shapes = ['▲', '■', '●', '◆', '▴', '▢'];
  const code = typeof seed === 'number' ? seed : seed.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return shapes[code % shapes.length];
};

const GorillaHoverInfo = ({ children }: { children: React.ReactNode }) => (
  <div className="relative group inline-flex items-center justify-center">
    {children}
    <div
      className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-72 -translate-x-1/2 rounded-xl bg-black/80 px-3 py-2 text-xs text-white opacity-0 shadow-lg backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100"
    >
      Una semana completada = 1 U.C. Completá semanas del Camino y canjeá por programas o merch.
    </div>
  </div>
);

interface DailyContent {
  dayNumber: number;
  dayTitle?: string;
  visualContent?: {
    type: 'video' | 'none';
    videoUrl?: string;
    videoId?: string;
    videoName?: string;
    nombre?: string;
    thumbnailUrl?: string;
    duration?: number;
    title?: string;
    description?: string;
  };
  audioTextContent?: {
    audioUrl?: string;
    audioDuration?: number;
    audioTitle?: string;
    nombre?: string;
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
  videoName?: string;
  audioUrl?: string;
  audioTitle?: string;
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

function WeeklyPathPageContent() {
  const router = useRouter();
  const auth = useAuth();
  const coherence = useCoherence();
  const isAdmin = auth.user?.rol === 'Admin';
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [logbook, setLogbook] = useState<Logbook | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedContentType, setSelectedContentType] = useState<'visual' | 'audioText' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isChangingContent, setIsChangingContent] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Cerrado por defecto (especialmente en mobile)
  const [isDesktop, setIsDesktop] = useState(false);
  const [openTooltip, setOpenTooltip] = useState<'menu' | 'progress' | 'uc' | null>(null);
  const isMobile = !isDesktop;
  const tooltipTexts: Record<'menu' | 'progress' | 'uc', string> = {
    menu: 'Completá semanas del Camino y ganá U.C. para canjear por programas, material o merch.',
    progress: 'Avance del mes en el Camino.',
    uc: 'Una semana completada = 1 U.C. Acumulalas y canjealas por programas, material o lo que vayamos creando.'
  };
  
  // Estados para los modales de celebración e información
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showLevelUpEffect, setShowLevelUpEffect] = useState(false);
  const [levelUpData, setLevelUpData] = useState<{
    newLevel?: number;
    evolution?: boolean;
    gorillaIcon?: string;
  } | null>(null);
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

  // Tooltip móvil global centrado
  const renderMobileTooltip = () => {
    if (!isMobile || !openTooltip) return null;
    return (
      <div className="fixed inset-0 z-[120] flex items-center justify-center px-6" onClick={() => setOpenTooltip(null)}>
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-[121] max-w-sm w-full rounded-2xl bg-black/40 text-white p-5 shadow-[0_12px_40px_rgba(0,0,0,0.35)] border border-white/10 text-center font-montserrat text-sm leading-relaxed">
          <p className="text-base font-semibold mb-1">Info</p>
          <p className="text-sm font-light">{tooltipTexts[openTooltip]}</p>
        </div>
      </div>
    );
  };


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

      // Verificar acceso al Camino (solo requiere contrato aceptado)
      // La Camino Base es opcional (se puede saltear pero se pierden U.C.)
      if (auth.user && auth.user.rol !== 'Admin') {
        const contratoAceptado = auth.user.subscription?.onboarding?.contratoAceptado || false;

        if (!contratoAceptado) {
          router.push('/onboarding/bienvenida');
          return;
        }
      }

      fetchWeeklyPath();
      coherence.fetchCoherenceTracking();
    };

    checkAuth();
    // Ejecutar solo una vez al montar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calcular porcentaje completado del mes
  // El porcentaje depende de la cantidad de contenidos completados vs el total disponible
  const calculateMonthProgress = (): number => {
    if (!logbook || !logbook.weeklyContents) return 0;

    let completedContentsCount = 0;
    let totalContentsCount = 0;

    logbook.weeklyContents.forEach((week) => {
      if (week.dailyContents && week.dailyContents.length > 0) {
        week.dailyContents.forEach((day) => {
          // Video diario
          if (day.visualContent && day.visualContent.videoUrl) {
            totalContentsCount++;
            const videoKey = `${logbook._id}-${week.weekNumber}-${day.dayNumber}-video`;
            if (coherence.completedVideos.has(videoKey)) {
              completedContentsCount++;
            }
          }

          // Audio diario
          if (day.audioTextContent && day.audioTextContent.audioUrl) {
            totalContentsCount++;
            const audioKey = `${logbook._id}-${week.weekNumber}-${day.dayNumber}-audio`;
            if (coherence.completedAudios.has(audioKey)) {
              completedContentsCount++;
            }
          }
        });
      } else if (week.videoUrl) {
        // Estructura legacy: video semanal
        totalContentsCount++;
        const videoKey = `${logbook._id}-${week.weekNumber}-week-video`;
        if (coherence.completedVideos.has(videoKey)) {
          completedContentsCount++;
        }
        // Estructura legacy: audio semanal (si existe)
        if ((week).audioUrl) {
          totalContentsCount++;
          const audioKey = `${logbook._id}-${week.weekNumber}-week-audio`;
          if (coherence.completedAudios.has(audioKey)) {
            completedContentsCount++;
          }
        }
      }
    });

    // Calcular porcentaje basado en completados / total
    if (totalContentsCount === 0) return 0;
    const percentage = Math.round((completedContentsCount / totalContentsCount) * 100);
    return Math.min(percentage, 100);
  };

  const monthProgress = calculateMonthProgress();
  
  // Actualizar el progreso en el contexto
  useEffect(() => {
    coherence.updateMonthProgress(monthProgress);
  }, [monthProgress, coherence]);

  // Detectar cuando el mes se completa al 100% y subir de nivel
  const [monthCompletionChecked, setMonthCompletionChecked] = useState(false);
  const monthCompletionKeyRef = useRef<string | null>(null);
  
  useEffect(() => {
    const checkMonthCompletion = async () => {
      // Solo verificar una vez cuando el mes llega al 100% por logbook+mes
      if (monthProgress >= 100 && logbook && !monthCompletionChecked) {
        const key = `${logbook._id}-${logbook.month}-${logbook.year}`;
        if (monthCompletionKeyRef.current === key) {
          return;
        }
        const month = logbook.month;
        const year = logbook.year;
        
        // Marcar como verificado inmediatamente para evitar múltiples llamadas
        setMonthCompletionChecked(true);
        monthCompletionKeyRef.current = key;
        
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
            
            // Actualizar tracking siempre, independientemente de si hay levelUp
            if (data.tracking) {
              coherence.updateTracking(data.tracking);
            }
            
            // Mostrar modal de celebración si hay levelUp o si hay logros nuevos
            if (data.levelUp || (data.newAchievements && data.newAchievements.length > 0)) {
              // Usar los valores del tracking actualizado (ya incluye gorillaIcon calculado)
              const updatedTracking = data.tracking || coherence.coherenceTracking;
              setCelebrationData({
                ucsOtorgadas: 0,
                totalUnits: updatedTracking?.totalUnits || 0,
                currentStreak: updatedTracking?.currentStreak || 0,
                esSemanaAdicional: false,
                newAchievements: data.newAchievements || [],
                levelUp: data.levelUp || false,
                newLevel: updatedTracking?.level || data.newLevel || 1,
                evolution: data.evolution || false,
                gorillaIcon: updatedTracking?.gorillaIcon || data.gorillaIcon || '🦍'
              });
              setShowCelebrationModal(true);
            }
          }
        } catch (error) {
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

  const fetchWeeklyPath = async () => {
    try {
      setLoading(true);
      // Obtener parámetros de la URL
      const searchParams = new URLSearchParams(window.location.search);
      const id = searchParams.get('id');
      const month = searchParams.get('month');
      const year = searchParams.get('year');
      
      // Construir URL con parámetros si existen
      let url = '/api/bitacora/month';
      if (id) {
        url += `?id=${id}`;
      } else if (month && year) {
        url += `?month=${month}&year=${year}`;
      }
      
      const response = await fetch(url, {
        credentials: 'include',
        cache: 'no-store'
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Si es un 404, intentar obtener la camino más reciente sin parámetros
        if (response.status === 404 && (id || month || year)) {
          // Si había parámetros específicos, intentar sin ellos
          const fallbackResponse = await fetch('/api/bitacora/month', {
            credentials: 'include',
            cache: 'no-store'
          });
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            // Procesar el logbook del fallback igual que el normal
            processLogbookData(fallbackData.logbook);
            setInitialLoading(false);
            setLoading(false);
            return;
          }
        }
        throw new Error(errorData.error || 'Error al obtener la camino');
      }

      const data = await response.json();
      
      // Procesar semanas y días para determinar qué está desbloqueado
      processLogbookData(data.logbook);
      
      setInitialLoading(false);
    } catch (err: any) {
      setError(err.message || 'Error al cargar la camino');
    } finally {
      setLoading(false);
    }
  };

  const processLogbookData = (logbookData: Logbook | null) => {
    if (!logbookData) {
      return;
    }
    
    setLogbook(logbookData);
    
    if (logbookData && logbookData.weeklyContents) {
        // Actualizar estados de desbloqueo basado solo en flags semanales (cron) y admin
        const processedWeeks = logbookData.weeklyContents.map((week: WeeklyContent) => {
          const isWeekUnlocked =
            isAdmin ||
            week.isPublished ||
            week.isUnlocked;

          // No usamos dailyContents para gating ni UI
          week.dailyContents = [];
          week.isUnlocked = isWeekUnlocked;
          return week;
        });
        
      logbookData.weeklyContents = processedWeeks;
      setLogbook(logbookData);
      
      // Seleccionar automáticamente la semana desbloqueada más reciente (sin dailyContents)
      const unlockedWeeks = processedWeeks.filter((week: WeeklyContent) => week.isUnlocked);
      if (unlockedWeeks.length > 0) {
        const sortedUnlockedWeeks = unlockedWeeks.sort((a: WeeklyContent, b: WeeklyContent) => {
          const dateA = new Date(a.publishDate).getTime();
          const dateB = new Date(b.publishDate).getTime();
          return dateB - dateA;
        });
        const mostRecentUnlockedWeek = sortedUnlockedWeeks[0];
        setSelectedWeek(mostRecentUnlockedWeek.weekNumber);
        setSelectedDay(null);
        if (mostRecentUnlockedWeek.videoUrl) {
          setSelectedContentType('visual');
        } else if (mostRecentUnlockedWeek.audioUrl || mostRecentUnlockedWeek.text) {
          setSelectedContentType('audioText');
        } else {
          setSelectedContentType(null);
        }
      } else {
        setSelectedWeek(processedWeeks[0]?.weekNumber || null);
        setSelectedDay(null);
        if (processedWeeks[0]?.videoUrl) {
          setSelectedContentType('visual');
        } else if (processedWeeks[0]?.audioUrl || processedWeeks[0]?.text) {
          setSelectedContentType('audioText');
        } else {
          setSelectedContentType(null);
        }
      }
    }
  };


  const checkIfCompleted = async (logbookId: string, weekNumber: number) => {
    // Verificar si esta semana ya fue completada
    const weekKey = `${logbookId}-${weekNumber}`;
    // Por ahora asumimos que no está completada, esto se puede mejorar consultando la API
  };

  const handleSelect = (weekNumber: number, dayNumber: number | null, contentType: 'visual' | 'audioText' | null) => {
    // Activar loading
    setIsChangingContent(true);
    
    // Pequeño delay para mostrar el loading y luego cambiar el contenido
    setTimeout(() => {
      setSelectedWeek(weekNumber);
      setSelectedDay(dayNumber);
      setSelectedContentType(contentType);
      
      // Desactivar loading después de que el contenido haya comenzado a renderizarse
      setTimeout(() => {
        setIsChangingContent(false);
      }, 300);
    }, 150);
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
      
      // Si no se pudo agregar U.C. (pero la clase se completó)
      if (data.success === false) {
        // La clase se completó pero no se otorgó U.C.
        const totalUnits = data.tracking?.totalUnits || coherence.coherenceTracking?.totalUnits || 0;
        
        // Mostrar modal informativo con el motivo
        setInfoModalData({
          message: data.message || 'Una semana completada = 1 U.C. Este contenido ya estaba completado.',
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
            longestStreak: data.tracking.longestStreak,
            levelProgress: data.levelProgress !== undefined && data.levelProgress !== null ? data.levelProgress : (coherence.coherenceTracking?.levelProgress ?? 0),
            progressToNextLevel: data.progressToNextLevel !== undefined && data.progressToNextLevel !== null ? data.progressToNextLevel : (coherence.coherenceTracking?.progressToNextLevel ?? 0),
            level: data.newLevel !== undefined && data.newLevel !== null ? data.newLevel : (coherence.coherenceTracking?.level ?? 1)
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
      
      // Actualizar tracking en el contexto directamente desde la respuesta (sin reload)
      if (data.tracking) {
        // Si hubo level up, actualizar todos los campos juntos incluyendo el nuevo nivel
        if (data.levelUp) {
          coherence.updateTracking({
            totalUnits: data.tracking.totalUnits,
            currentStreak: data.tracking.currentStreak,
            longestStreak: data.tracking.longestStreak,
            level: data.newLevel, // Nuevo nivel después del level up
            levelProgress: data.levelProgress !== undefined && data.levelProgress !== null ? data.levelProgress : 0, // Se reinicia a 0 después del level up
            progressToNextLevel: data.progressToNextLevel !== undefined && data.progressToNextLevel !== null ? data.progressToNextLevel : 0,
            gorillaIcon: data.gorillaIcon,
            evolutionName: data.evolutionName,
            characterEvolution: data.evolution ? (coherence.coherenceTracking?.characterEvolution ?? 0) + 1 : (coherence.coherenceTracking?.characterEvolution ?? 0)
          });
          
          // Mostrar efecto visual de level up
          setLevelUpData({
            newLevel: data.newLevel,
            evolution: data.evolution,
            gorillaIcon: data.gorillaIcon
          });
          setShowLevelUpEffect(true);
          
          // Ocultar el efecto después de 3 segundos
          setTimeout(() => {
            setShowLevelUpEffect(false);
            setLevelUpData(null);
          }, 3000);
        } else {
          // Si no hay level up, actualizar tracking normalmente
          coherence.updateTracking({
            totalUnits: data.tracking.totalUnits,
            currentStreak: data.tracking.currentStreak,
            longestStreak: data.tracking.longestStreak,
            levelProgress: data.levelProgress !== undefined && data.levelProgress !== null ? data.levelProgress : (coherence.coherenceTracking?.levelProgress ?? 0),
            progressToNextLevel: data.progressToNextLevel !== undefined && data.progressToNextLevel !== null ? data.progressToNextLevel : (coherence.coherenceTracking?.progressToNextLevel ?? 0)
          });
        }
        
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
      
      // Verificar si necesita reporte semanal
      if (data.necesitaReporte) {
        setShowReportModal(true);
      } else {
        // Configurar datos del modal de celebración
        setCelebrationData({
          ucsOtorgadas,
          totalUnits,
          currentStreak,
          esSemanaAdicional,
          newAchievements: data.newAchievements || [],
          levelUp: data.levelUp || false,
          newLevel: data.newLevel,
          evolution: data.evolution || false,
          gorillaIcon: data.gorillaIcon
        });
        setShowCelebrationModal(true);
      }

    } catch (err: any) {
      toast.error(err.message || 'Error al completar la camino');
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
    
    const pickVideo = () => {
      if (!week.videoUrl) return null;
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
        videoId,
        title: week.videoName || week.weekTitle || `Semana ${week.weekNumber}`,
        duration: (week as any).videoDuration
      };
    };

    const pickAudio = () => {
      if (!week.audioUrl && !week.text) return null;
      return {
        type: 'audioText' as const,
        audioUrl: week.audioUrl,
        text: week.text,
        title: week.audioTitle || week.weekTitle || `Semana ${week.weekNumber}`
      };
    };

    if (selectedContentType === 'visual') return pickVideo();
    if (selectedContentType === 'audioText') return pickAudio();
    return pickVideo() || pickAudio() || null;
  };

  if (initialLoading || loading) {
    return <WeeklyPathSkeleton />;
  }

  if (error || !logbook) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 font-montserrat">
        <div className="text-center max-w-md px-6">
          <h1 className="text-2xl font-normal text-gray-900 mb-4 font-montserrat">
            No hay camino disponible
          </h1>
          <p className="text-gray-700/90 mb-6 font-montserrat font-light">
            {error || 'No hay contenido disponible. Pronto estará disponible.'}
          </p>
          <button
            onClick={() => router.push('/library')}
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
    <MainSideBar
      where={'weekly-path'}
      forceStandardHeader
      onMenuClick={() => setSidebarOpen(prev => !prev)}
      sidebarOpen={sidebarOpen}
      forceLightTheme={selectedContentType === 'audioText'}
    >  
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
              <WeeklyPathSidebar
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
                  alt="El Camino"
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
                  <div className="flex flex-row-reverse items-center gap-6 flex-1 max-w-7xl mx-auto w-full">
                    {/* Icono de gorila con círculo de progreso */}
                    <div className="relative flex-shrink-0 flex flex-col items-center">
                      <div className="flex flex-col items-center relative">
                        {/* Componente de gorila con nivel y progreso - El SVG del círculo de progreso está dentro del componente */}
                        <div className="flex items-center justify-center" aria-label="gorilla-level">
                          {coherence.coherenceTracking ? (
                            <GorillaHoverInfo>
                              <GorillaLevelDisplay
                                level={coherence.coherenceTracking.level || 1}
                                gorillaIcon={coherence.coherenceTracking.gorillaIcon || '🦍'}
                                evolutionName={coherence.coherenceTracking.evolutionName || 'Gorila Bebé'}
                                progressToNextLevel={coherence.coherenceTracking.progressToNextLevel || 0}
                                monthsCompleted={coherence.coherenceTracking.monthsCompleted || 0}
                                levelProgress={coherence.coherenceTracking.levelProgress !== undefined && coherence.coherenceTracking.levelProgress !== null ? coherence.coherenceTracking.levelProgress : 0}
                                size="sm"
                                showProgressBar={false}
                                showLevel={true}
                                layout="centered"
                                showInfoText={false}
                              />
                            </GorillaHoverInfo>
                          ) : null}
                        </div>

                        {/* Texto fuera del círculo para no afectar su tamaño */}
                        {(() => {
                          const monthsCompleted = coherence.coherenceTracking?.monthsCompleted ?? 0;
                          const evolutionName = monthsCompleted > 0
                            ? (coherence.coherenceTracking?.evolutionName || 'Gorila Bebé')
                            : 'Gorila Bebé';
                          return coherence.coherenceTracking ? (
                            <div className="mt-3 text-center">
                              <p className="text-xs md:text-sm font-montserrat font-medium text-white">
                                {evolutionName}
                              </p>
                              <p className="text-[11px] md:text-xs font-montserrat font-light text-white/80">
                                {monthsCompleted}{' '}
                                {monthsCompleted === 1 ? 'mes' : 'meses'} completados
                              </p>
                            </div>
                          ) : null;
                        })()}
                      </div>
                    </div>

                    {/* Información del usuario y progreso */}
                    <div className="flex-1 min-w-0">
                      <h1 className="text-3xl md:text-5xl lg:text-4xl font-bold text-white font-montserrat tracking-tight mb-2 drop-shadow-lg">
                        El Camino
                      </h1>
                      <p className="text-base hidden md:block md:text-lg text-white/90 font-montserrat font-light mb-1 drop-shadow-md">
                        {auth.user?.nombre || 'Usuario'}
                      </p>
                      {auth.user?.email && (
                        <p className="hidden md:block text-sm text-white/75 font-montserrat font-light mb-4 drop-shadow-sm">
                          {auth.user.email}
                        </p>
                      )}
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
                            <img 
                              src="/images/svg/icosahedron-thick.svg" 
                              alt="Icosaedro" 
                              className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0"
                              style={{ filter: 'brightness(0) invert(1)' }}
                            />
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
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 lg:pt-20 pb-8">
            {/* Contenido Principal */}
            {/* Banner mobile compacto para video */}
            {selectedContent?.type === 'visual' && (
              <div className="md:hidden mb-4 rounded-xl px-3 relative bottom-1">
      <div className="flex items-center justify-between gap-3">
                  {/* Icono de gorila con nivel (versión compacta para video) */}
                  {coherence.coherenceTracking && (
                    <div className="relative"
                      onClick={() => setOpenTooltip(openTooltip === 'menu' ? null : 'menu')}
                    >
                      <VideoHeaderGorilla
                        level={coherence.coherenceTracking.level || 1}
                        gorillaIcon={coherence.coherenceTracking.gorillaIcon || '🦍'}
                        levelProgress={coherence.coherenceTracking.levelProgress !== undefined && coherence.coherenceTracking.levelProgress !== null ? coherence.coherenceTracking.levelProgress : 0}
                      />
 
                    </div>
                  )}

                  {/* Información de progreso y U.C. */}
                  <div className="flex-1 flex items-center gap-2">
                    {/* Porcentaje completado */}
                    <div
                      className="relative flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-rose-500/20 backdrop-blur-md border border-amber-300/40 rounded-full shadow-sm"
                      onClick={() => setOpenTooltip(openTooltip === 'progress' ? null : 'progress')}
                    >
                      <span className="text-base font-bold text-gray-900 font-montserrat">
                        {monthProgress}%
                      </span>
                      <span className="text-[10px] text-gray-700 font-montserrat font-light uppercase tracking-wide">
                        Completado
                      </span>
                      {openTooltip === 'progress' && !isMobile && (
                        <div className="absolute left-1/2 top-full z-20 mt-2 w-64 -translate-x-1/2 rounded-xl bg-black px-4 py-3 text-xs text-white shadow-[0_12px_30px_rgba(0,0,0,0.35)] border border-white/10">
                          {tooltipTexts.progress}
                        </div>
                      )}
                    </div>
                    
                    {/* U.C. */}
                    {coherence.coherenceTracking && (
                      <div
                        className="relative flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-rose-500/20 backdrop-blur-md border border-amber-300/40 rounded-full shadow-sm"
                        onClick={() => setOpenTooltip(openTooltip === 'uc' ? null : 'uc')}
                      >
                        <img 
                          src="/images/svg/icosahedron-thick.svg" 
                          alt="Icosaedro" 
                          className="w-5 h-5 flex-shrink-0"
                          style={{ filter: 'brightness(0)' }}
                        />
                        <span className="text-base font-bold text-gray-900 font-montserrat">
                          {coherence.coherenceTracking?.totalUnits || 0}
                        </span>
                        <span className="text-[10px] text-gray-700 font-montserrat font-light uppercase tracking-wide">
                          U.C.
                        </span>
                        {openTooltip === 'uc' && !isMobile && (
                          <div className="absolute left-1/2 top-full z-20 mt-2 w-64 -translate-x-1/2 rounded-xl bg-black px-4 py-3 text-xs text-white shadow-[0_12px_30px_rgba(0,0,0,0.35)] border border-white/10">
                            {tooltipTexts.uc}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            <div className="relative">
              {/* Banner de U.C. para web - solo para video, alineado a la derecha arriba */}
              {selectedContent?.type === 'visual' && (
                <div className="hidden md:flex absolute  right-4 z-10 rounded-xl -top-3 md:p-1 md:mb-2">
                  <div className="flex items-center gap-3">

                    {/* Icono/nivel compacto */}
                    {coherence.coherenceTracking && (
                      <GorillaHoverInfo>
                        <VideoHeaderGorilla
                          level={coherence.coherenceTracking.level || 1}
                          gorillaIcon={coherence.coherenceTracking.gorillaIcon || '🦍'}
                          levelProgress={coherence.coherenceTracking.levelProgress !== undefined && coherence.coherenceTracking.levelProgress !== null ? coherence.coherenceTracking.levelProgress : 0}
                        />
                      </GorillaHoverInfo>
                    )}


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
                          <img 
                            src="/images/svg/icosahedron-thick.svg" 
                            alt="Icosaedro" 
                            className="w-5 h-5 flex-shrink-0"
                            style={{ filter: 'brightness(0)' }}
                          />
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
                <div className="relative w-full min-h-[70vh]">
                  <AnimatePresence mode="wait">
                    {selectedContent.type === 'visual' ? (
                      <motion.div
                        key={`visual-${selectedWeek}-${selectedDay}`}
                        className="w-full"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                      >
                        <VideoContentDisplay
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
                      </motion.div>
                    ) : (
                      <motion.div
                        key={`audioText-${selectedWeek}-${selectedDay}`}
                        className="w-full"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                      >
                        <AudioTextContentDisplay
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
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : selectedWeekData && !selectedWeekData.isUnlocked && auth.user?.rol !== 'Admin' ? (
                <div className="relative rounded-3xl border border-gray-200 bg-white p-10 text-left sm:text-center shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
                  <div className="relative z-10">
                    <LockClosedIcon className="w-16 h-16 text-amber-600 sm:mx-auto mb-4" />
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 font-montserrat mb-3 tracking-tight">
                      {selectedDay ? `Día ${selectedDay}` : `Semana ${selectedWeek}`} bloqueada
                    </h2>
                    <p className="text-base sm:text-lg text-gray-700/90 mb-3 font-montserrat font-light">
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
                    <p className="text-base text-gray-600 font-montserrat font-light">
                      Vuelve cuando llegue la fecha de publicación para acceder al contenido.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="relative rounded-3xl border border-gray-200 bg-white p-10 text-left sm:text-center shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
                  <p className="relative z-10 text-base sm:text-lg text-gray-800 font-montserrat font-light">Selecciona un contenido para comenzar</p>
                </div>
              )}

              {/* Logros - Estética natural y minimalista */}
              {coherence.coherenceTracking && coherence.coherenceTracking.achievements.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mt-16 relative overflow-hidden sm:p-8"
                  >
                    <div className="relative z-10">
                      <h3 
                        className="text-xl md:text-3xl font-semibold text-left sm:text-center mb-6 font-montserrat text-gray-900 tracking-tight"
                      >
                        Objetivos alcanzados
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {coherence.coherenceTracking.achievements.map((achievement: any, index: number) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1, type: 'spring', stiffness: 200 }}
                            className="flex flex-col items-start sm:items-center gap-3 p-4 rounded-2xl border border-gray-200 bg-white transition-all duration-300 hover:shadow-md"
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
                              className="text-4xl text-amber-600"
                            >
                              {shapeIcon(achievement.name || index)}
                            </motion.div>
                            <div className="text-left sm:text-center">
                              <p 
                                className="font-normal text-lg sm:text-xl mb-1 font-montserrat text-gray-900"
                              >
                                {achievement.name}
                              </p>
                              <p 
                                className="text-base sm:text-lg font-light leading-relaxed font-montserrat text-gray-700"
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
                  className="mt-8 relative rounded-3xl bg-white border border-gray-200 p-6 sm:p-8 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.04)]"
                >
                  <div className="relative z-10">
                    <h3 className="text-xl sm:text-xl font-bold text-gray-900 mb-4 font-montserrat tracking-tight text-left sm:text-center">
                      ¿Qué es la Coherencia?
                    </h3>
                    <p className="text-base sm:text-lg text-gray-800 leading-relaxed mb-3 font-montserrat font-light text-left">
                      Una semana completada del Camino = 1 Unidad de Coherencia (U.C.). Mantené la constancia y acumulá U.C. para canjear por programas, material o lo que vayamos creando.
                    </p>
                    <p className="text-base sm:text-lg text-gray-800 leading-relaxed font-montserrat font-light text-left">
                      Se premia la constancia: ahí están los resultados en el movimiento.
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
      <FooterProfile />
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

      {/* Modal de Reporte Semanal */}
      <WeeklyReportModal
        isOpen={showReportModal}
        onClose={() => {
          setShowReportModal(false);
          // Mostrar modal de celebración después de cerrar el reporte
          if (celebrationData) {
            setShowCelebrationModal(true);
          }
        }}
        onComplete={() => {
          // Mostrar modal de celebración después de completar el reporte
          if (celebrationData) {
            setShowCelebrationModal(true);
          }
        }}
      />

      {renderMobileTooltip()}

      {/* Efecto visual de Level Up — estilo Move Crew: épico y fino */}
      <AnimatePresence>
        {showLevelUpEffect && levelUpData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="fixed inset-0 z-[300] flex items-center justify-center pointer-events-none bg-palette-ink/95 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
              className="absolute inset-0 flex flex-col items-center justify-center w-full px-4"
            >
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-palette-sage/60" />
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-palette-sage/30" />
              <p className="text-[10px] md:text-xs font-montserrat uppercase tracking-[0.35em] text-palette-sage/90 mb-2">
                {levelUpData.evolution ? 'Evolución' : 'Nivel'}
              </p>
              <p className="text-4xl md:text-6xl lg:text-7xl font-semibold font-montserrat tracking-tight text-palette-cream mb-1">
                {levelUpData.newLevel}
              </p>
              <p className="text-lg md:text-xl font-montserrat font-light text-palette-stone/90 tracking-wide">
                {levelUpData.evolution ? 'Tu camino sigue creciendo' : 'Subiste de nivel'}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function WeeklyPathPage() {
  return (
    <CoherenceProvider>
      <WeeklyPathPageContent />
    </CoherenceProvider>
  );
}
