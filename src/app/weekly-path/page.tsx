'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircleIcon, 
  LockClosedIcon
} from '@heroicons/react/24/solid';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
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
import NextContentModal from '../../components/PageComponent/WeeklyPath/NextContentModal';
import WeeklyPathLoading from '../../components/PageComponent/MoveCrew/WeeklyPathLoading';
import FooterProfile from '../../components/PageComponent/Profile/FooterProfile';
import WeeklyReportModal from '../../components/WeeklyReportModal';

import Footer from '../../components/Footer';
import Link from 'next/link';

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

/** Ítem de contenido de la semana (clase de módulo, clase individual, audio) */
interface WeekContentItem {
  contentType?: 'moduleClass' | 'individualClass' | 'audio';
  videoUrl?: string;
  videoId?: string;
  videoName?: string;
  audioUrl?: string;
  audioTitle?: string;
  audioText?: string;
  submoduleName?: string;
  orden?: number;
}

interface WeeklyContent {
  weekNumber: number;
  weekTitle?: string;
  weekDescription?: string;
  dailyContents?: DailyContent[];
  /** Varios contenidos por semana */
  contents?: WeekContentItem[];
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
  const [selectedContentIndex, setSelectedContentIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isChangingContent, setIsChangingContent] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Cerrado por defecto (especialmente en mobile)
  const [isDesktop, setIsDesktop] = useState(false);
  const [openTooltip, setOpenTooltip] = useState<'menu' | 'progress' | 'uc' | null>(null);
  const isMobile = !isDesktop;
  const tooltipTexts: Record<'menu' | 'progress' | 'uc', string> = {
    menu: 'Completá semanas del Camino y ganá U.C. para canjear por programas, material o merch.',
    progress: 'Avance del mes en el Camino (las clases completadas representan el 25 % del camino).',
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
  const [showNextContentModal, setShowNextContentModal] = useState(false);
  const [nextContentModalPayload, setNextContentModalPayload] = useState<{
    nextContentIndex: number;
    nextContentType: 'visual' | 'audioText';
    nextTitle?: string;
  } | null>(null);
  const skipNextSelectionEffectRef = useRef(false);

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
        <div className="relative z-[121] max-w-sm w-full rounded-2xl bg-palette-ink text-palette-cream p-5 shadow-xl border border-palette-stone/20 text-center font-montserrat text-sm leading-relaxed">
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

      fetchBitacora();
      coherence.fetchCoherenceTracking();
    };

    checkAuth();
    // Ejecutar solo una vez al montar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calcular porcentaje completado del mes: el total de clases representa el 25% del camino completado
  const calculateMonthProgress = (): number => {
    if (!logbook || !logbook.weeklyContents) return 0;

    let completedContentsCount = 0;
    let totalContentsCount = 0;

    logbook.weeklyContents.forEach((week) => {
      const contents = week.contents;
      if (Array.isArray(contents) && contents.length > 0) {
        totalContentsCount += contents.length;
        contents.forEach((_, i) => {
          const key = `${logbook._id}-${week.weekNumber}-content-${i}`;
          if (coherence.completedVideos.has(key) || coherence.completedAudios.has(key)) completedContentsCount++;
        });
        return;
      }
      if (week.dailyContents && week.dailyContents.length > 0) {
        week.dailyContents.forEach((day) => {
          if (day.visualContent && day.visualContent.videoUrl) {
            totalContentsCount++;
            const videoKey = `${logbook._id}-${week.weekNumber}-${day.dayNumber}-video`;
            if (coherence.completedVideos.has(videoKey)) completedContentsCount++;
          }
          if (day.audioTextContent && day.audioTextContent.audioUrl) {
            totalContentsCount++;
            const audioKey = `${logbook._id}-${week.weekNumber}-${day.dayNumber}-audio`;
            if (coherence.completedAudios.has(audioKey)) completedContentsCount++;
          }
        });
        return;
      }
      if (week.videoUrl) {
        totalContentsCount++;
        const videoKey = `${logbook._id}-${week.weekNumber}-week-video`;
        if (coherence.completedVideos.has(videoKey)) completedContentsCount++;
        if ((week as WeeklyContent).audioUrl) {
          totalContentsCount++;
          const audioKey = `${logbook._id}-${week.weekNumber}-week-audio`;
          if (coherence.completedAudios.has(audioKey)) completedContentsCount++;
        }
      }
    });

    if (totalContentsCount === 0) return 0;
    // Las clases completadas representan el 25% del camino
    const percentage = Math.round((completedContentsCount / totalContentsCount) * 25);
    return Math.min(percentage, 25);
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
            
            // Mostrar modal de celebración solo si hay levelUp
            if (data.levelUp) {
              const updatedTracking = data.tracking || coherence.coherenceTracking;
              setCelebrationData({
                ucsOtorgadas: 0,
                totalUnits: updatedTracking?.totalUnits || 0,
                currentStreak: updatedTracking?.currentStreak || 0,
                esSemanaAdicional: false,
                levelUp: true,
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

  const fetchBitacora = async () => {
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
        // Previsualizar por ID es solo para administradores
        if (response.status === 403 && id) {
          router.replace('/library');
          return;
        }
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
        // Respetar el flag isUnlocked que envía la API (no sobrescribir con isPublished)
        const processedWeeks = logbookData.weeklyContents.map((week: WeeklyContent) => {
          const isWeekUnlocked = isAdmin || week.isUnlocked;

          // No usamos dailyContents para gating ni UI
          week.dailyContents = [];
          week.isUnlocked = isWeekUnlocked;
          return week;
        });
        
      logbookData.weeklyContents = processedWeeks;
      setLogbook(logbookData);
      
      // Seleccionar la primera semana desbloqueada (por número de semana asc); luego un useEffect ajustará a la primera no completada cuando coherence cargue
      const unlockedWeeks = processedWeeks
        .filter((week: WeeklyContent) => week.isUnlocked)
        .sort((a: WeeklyContent, b: WeeklyContent) => a.weekNumber - b.weekNumber);
      if (unlockedWeeks.length > 0) {
        const firstUnlocked = unlockedWeeks[0];
        setSelectedWeek(firstUnlocked.weekNumber);
        setSelectedDay(null);
        const weekContents = (firstUnlocked as WeeklyContent).contents;
        if (Array.isArray(weekContents) && weekContents.length > 0) {
          setSelectedContentIndex(0);
          setSelectedContentType(weekContents[0].contentType === 'audio' ? 'audioText' : 'visual');
        } else {
          setSelectedContentIndex(null);
          if (firstUnlocked.videoUrl) setSelectedContentType('visual');
          else if (firstUnlocked.audioUrl || firstUnlocked.text) setSelectedContentType('audioText');
          else setSelectedContentType(null);
        }
      } else {
        const firstWeek = processedWeeks[0];
        setSelectedWeek(firstWeek?.weekNumber ?? null);
        setSelectedDay(null);
        const weekContents = (firstWeek as WeeklyContent)?.contents;
        if (Array.isArray(weekContents) && weekContents.length > 0) {
          setSelectedContentIndex(0);
          setSelectedContentType(weekContents[0].contentType === 'audio' ? 'audioText' : 'visual');
        } else {
          setSelectedContentIndex(null);
          if (firstWeek?.videoUrl) setSelectedContentType('visual');
          else if (firstWeek?.audioUrl || firstWeek?.text) setSelectedContentType('audioText');
          else setSelectedContentType(null);
        }
      }
    }
  };

  // Abrir siempre en el primer contenido no completado (por semana e índice dentro de la semana).
  // No ejecutar mientras el modal "Ir al siguiente" está abierto ni justo después de ir al siguiente (para no sobrescribir la selección).
  useEffect(() => {
    if (showNextContentModal || !logbook?._id || !logbook.weeklyContents?.length) return;
    if (skipNextSelectionEffectRef.current) {
      skipNextSelectionEffectRef.current = false;
      return;
    }
    const unlocked = logbook.weeklyContents
      .filter((w: WeeklyContent) => w.isUnlocked)
      .sort((a: WeeklyContent, b: WeeklyContent) => a.weekNumber - b.weekNumber);
    if (unlocked.length === 0) return;
    const logbookId = logbook._id;
    const { completedVideos, completedAudios } = coherence;

    // Encontrar el primer ítem de contenido (por semana, luego por índice) que no esté completado
    let targetWeek: WeeklyContent | null = null;
    let targetContentIndex: number | null = null;
    let targetContentType: 'visual' | 'audioText' | null = null;

    for (const week of unlocked) {
      const contents = (week as WeeklyContent).contents;
      if (Array.isArray(contents) && contents.length > 0) {
        for (let i = 0; i < contents.length; i++) {
          const key = `${logbookId}-${week.weekNumber}-content-${i}`;
          const item = contents[i];
          const isVisual = item.contentType !== 'audio';
          const isCompleted = isVisual ? completedVideos.has(key) : completedAudios.has(key);
          if (!isCompleted) {
            targetWeek = week;
            targetContentIndex = i;
            targetContentType = isVisual ? 'visual' : 'audioText';
            break;
          }
        }
        if (targetWeek) break;
      } else {
        // Semana legacy (un solo video y/o audio por semana)
        const hasVideo = !!(week as WeeklyContent).videoUrl;
        const hasAudio = !!(week as WeeklyContent).audioUrl || !!(week as WeeklyContent).text;
        const videoKey = `${logbookId}-${week.weekNumber}-week-video`;
        const audioKey = `${logbookId}-${week.weekNumber}-week-audio`;
        const videoDone = !hasVideo || completedVideos.has(videoKey);
        const audioDone = !hasAudio || completedAudios.has(audioKey);
        if (!videoDone || !audioDone) {
          targetWeek = week;
          targetContentIndex = null;
          targetContentType = !videoDone ? 'visual' : 'audioText';
          break;
        }
      }
    }

    // Si todo está completado, usar la última semana desbloqueada y su primer contenido
    if (!targetWeek) {
      targetWeek = unlocked[unlocked.length - 1];
      const contents = (targetWeek as WeeklyContent).contents;
      if (Array.isArray(contents) && contents.length > 0) {
        targetContentIndex = 0;
        targetContentType = contents[0].contentType === 'audio' ? 'audioText' : 'visual';
      } else {
        targetContentIndex = null;
        targetContentType = (targetWeek as WeeklyContent).videoUrl ? 'visual' : ((targetWeek as WeeklyContent).audioUrl || (targetWeek as WeeklyContent).text) ? 'audioText' : null;
      }
    }

    setSelectedWeek(targetWeek.weekNumber);
    setSelectedDay(null);
    setSelectedContentIndex(targetContentIndex);
    setSelectedContentType(targetContentType);
  }, [logbook?._id, logbook?.weeklyContents, coherence, showNextContentModal]);

  const checkIfCompleted = async (logbookId: string, weekNumber: number) => {
    // Verificar si esta semana ya fue completada
    const weekKey = `${logbookId}-${weekNumber}`;
    // Por ahora asumimos que no está completada, esto se puede mejorar consultando la API
  };

  const handleSelect = (weekNumber: number, dayNumber: number | null, contentType: 'visual' | 'audioText' | null, contentIndex?: number) => {
    setIsChangingContent(true);
    setTimeout(() => {
      setSelectedWeek(weekNumber);
      setSelectedDay(dayNumber);
      setSelectedContentType(contentType);
      setSelectedContentIndex(contentIndex ?? null);
      setTimeout(() => setIsChangingContent(false), 300);
    }, 150);
  };

  const handleComplete = async () => {
    if (!logbook || !selectedWeek || isCompleting) return;
    
    const week = logbook.weeklyContents.find(w => w.weekNumber === selectedWeek);
    if (!week) return;
    
    // Permitir completar solo si la semana está desbloqueada (flag del API) o es admin
    if (auth.user?.rol !== 'Admin' && !week.isUnlocked) {
      toast.error('Esta semana aún no está disponible');
      return;
    }

    setIsCompleting(true);

    const requestBody = {
      logbookId: logbook._id,
      weekNumber: selectedWeek,
      dayNumber: selectedDay || null,
      contentType: selectedContentType,
      contentIndex: selectedContentIndex ?? undefined
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

      // Marcar como completado (siempre, tanto si se otorgó U.C. como si no)
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

      // Actualizar tracking si viene en la respuesta
      if (data.tracking) {
        if (data.levelUp) {
          coherence.updateTracking({
            totalUnits: data.tracking.totalUnits,
            currentStreak: data.tracking.currentStreak,
            longestStreak: data.tracking.longestStreak,
            level: data.newLevel,
            levelProgress: data.levelProgress !== undefined && data.levelProgress !== null ? data.levelProgress : 0,
            progressToNextLevel: data.progressToNextLevel !== undefined && data.progressToNextLevel !== null ? data.progressToNextLevel : 0,
            gorillaIcon: data.gorillaIcon,
            evolutionName: data.evolutionName,
            characterEvolution: data.evolution ? (coherence.coherenceTracking?.characterEvolution ?? 0) + 1 : (coherence.coherenceTracking?.characterEvolution ?? 0)
          });
          setLevelUpData({
            newLevel: data.newLevel,
            evolution: data.evolution,
            gorillaIcon: data.gorillaIcon
          });
          setShowLevelUpEffect(true);
          setTimeout(() => {
            setShowLevelUpEffect(false);
            setLevelUpData(null);
          }, 3000);
        } else {
          coherence.updateTracking({
            totalUnits: data.tracking.totalUnits,
            currentStreak: data.tracking.currentStreak,
            longestStreak: data.tracking.longestStreak,
            levelProgress: data.levelProgress !== undefined && data.levelProgress !== null ? data.levelProgress : (coherence.coherenceTracking?.levelProgress ?? 0),
            progressToNextLevel: data.progressToNextLevel !== undefined && data.progressToNextLevel !== null ? data.progressToNextLevel : (coherence.coherenceTracking?.progressToNextLevel ?? 0),
            level: data.newLevel !== undefined && data.newLevel !== null ? data.newLevel : (coherence.coherenceTracking?.level ?? 1)
          });
        }
      }

      // Notificar al header para que actualice el número de U.C. en el icono de perfil
      if (data.tracking && typeof data.tracking.totalUnits === 'number') {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('coherence-tracking-updated', {
            detail: {
              totalUnits: data.tracking.totalUnits,
              level: data.newLevel ?? data.tracking.level,
              levelProgress: data.levelProgress
            }
          }));
        }
      }

      // Siempre: siguiente contenido de la semana o felicitaciones por completar la semana (sin modal "Contenido ya completado")
      const contents = week.contents;
      const currentIndex = selectedContentIndex ?? 0;
      const nextIndex = currentIndex + 1;
      const hasNextInWeek = Array.isArray(contents) && nextIndex < contents.length;

      if (hasNextInWeek) {
        const nextItem = contents![nextIndex];
        const nextContentType = (nextItem.contentType === 'audio' ? 'audioText' : 'visual') as 'visual' | 'audioText';
        const nextTitle = (nextItem as WeekContentItem).videoName || (nextItem as WeekContentItem).audioTitle;
        setNextContentModalPayload({
          nextContentIndex: nextIndex,
          nextContentType,
          nextTitle: nextTitle || undefined
        });
        setShowNextContentModal(true);
      } else {
        // Semana completada: reporte si aplica o celebración (U.C. puede ser 0 si ya estaba todo completado)
        const totalUnits = data.tracking?.totalUnits || coherence.coherenceTracking?.totalUnits || 0;
        const esSemanaAdicional = data.esSemanaAdicional || false;
        const ucsOtorgadas = data.ucsOtorgadas !== undefined && data.ucsOtorgadas !== null ? data.ucsOtorgadas : 1;
        const currentStreak = data.tracking?.currentStreak || coherence.coherenceTracking?.currentStreak || 0;
        if (data.necesitaReporte) {
          setCelebrationData({
            ucsOtorgadas,
            totalUnits,
            currentStreak,
            esSemanaAdicional,
            levelUp: data.levelUp || false,
            newLevel: data.newLevel,
            evolution: data.evolution || false,
            gorillaIcon: data.gorillaIcon
          });
          setShowReportModal(true);
        } else {
          setCelebrationData({
            ucsOtorgadas,
            totalUnits,
            currentStreak,
            esSemanaAdicional,
            levelUp: data.levelUp || false,
            newLevel: data.newLevel,
            evolution: data.evolution || false,
            gorillaIcon: data.gorillaIcon
          });
          setShowCelebrationModal(true);
        }
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
    
    const contents = week.contents;
    const hasContents = Array.isArray(contents) && contents.length > 0;
    const effectiveIndex = hasContents && selectedContentIndex != null && selectedContentIndex >= 0 && selectedContentIndex < contents.length
      ? selectedContentIndex
      : hasContents ? 0 : -1;
    const useContents = hasContents && effectiveIndex >= 0;
    const c = useContents ? contents[effectiveIndex] : null;

    const pickVideoFromContent = (item: WeekContentItem | (WeeklyContent & { videoUrl?: string; videoId?: string; videoName?: string })) => {
      const url = item.videoUrl?.trim();
      if (!url) return null;
      let videoId = item.videoId;
      if (!videoId && url) {
        const vimeoMatch = url.match(/(?:vimeo\.com\/)(\d+)/);
        if (vimeoMatch?.[1]) videoId = vimeoMatch[1];
      }
      return {
        type: 'visual' as const,
        videoUrl: url,
        videoId: videoId ?? undefined,
        title: item.videoName || week.weekTitle || `Semana ${week.weekNumber}`,
        duration: (item as any).videoDuration
      };
    };

    const pickAudioFromContent = (item: WeekContentItem | (WeeklyContent & { audioUrl?: string; audioTitle?: string; text?: string })) => {
      const hasAudio = !!(item.audioUrl?.trim() || (item as any).audioText?.trim());
      if (!hasAudio) return null;
      return {
        type: 'audioText' as const,
        audioUrl: item.audioUrl,
        text: (item as any).audioText ?? (item as any).text,
        title: item.audioTitle || week.weekTitle || `Semana ${week.weekNumber}`
      };
    };

    if (useContents && c) {
      if (c.contentType === 'audio') return pickAudioFromContent(c);
      return pickVideoFromContent(c);
    }

    const pickVideo = () => pickVideoFromContent(week);
    const pickAudio = () => pickAudioFromContent(week);

    if (selectedContentType === 'visual') return pickVideo();
    if (selectedContentType === 'audioText') return pickAudio();
    return pickVideo() || pickAudio() || null;
  };

  if (initialLoading || loading) {
    return <WeeklyPathSkeleton />;
  }

  if (error || !logbook) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-palette-ink font-montserrat text-palette-cream">
        <div className="text-center max-w-md px-6">
          <h1 className="text-2xl font-normal text-palette-cream mb-4 font-montserrat">
            No hay camino disponible
          </h1>
          <p className="text-palette-stone mb-6 font-montserrat font-light">
            {error || 'No hay contenido disponible. Pronto estará disponible.'}
          </p>
          <button
            onClick={() => router.push('/library')}
            className="px-6 py-3 bg-palette-sage/30 border border-palette-stone/40 text-palette-cream rounded-full font-medium hover:bg-palette-sage/50 transition-all duration-300 font-montserrat"
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
      onMenuClick={() => {
        if (isDesktop) {
          setSidebarOpen(prev => !prev);
        } else {
          document.getElementById('weekly-path-mobile-sidebar')?.scrollIntoView({ behavior: 'smooth' });
        }
      }}
      sidebarOpen={sidebarOpen}
      forceLightTheme={selectedContentType === 'audioText'}
    >  
      <div className="flex flex-col min-h-screen bg-palette-ink text-palette-cream font-montserrat overflow-x-clip max-w-[100vw] min-w-0 w-full">
        {/* Overlay para cerrar sidebar (solo desktop; en mobile el sidebar va debajo del video) */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="hidden md:hidden fixed inset-0 bg-black/50 z-[55] transition-opacity duration-300"
            aria-hidden
          />
        )}

        {/* Área principal: en desktop se achica al abrir sidebar (como practice) */}
        <section className="relative w-full max-w-full flex-1 min-h-0 md:min-h-[100vh] bg-palette-ink overflow-hidden shrink-0">
          {/* Contenido principal: transición left como en practice */}
          <div
            className={`absolute top-0 bottom-0 right-0 w-full md:w-auto overflow-y-auto overflow-x-hidden transition-[left] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
              sidebarOpen ? 'md:left-96' : 'md:left-0'
            }`}
            style={{ zIndex: sidebarOpen && !isDesktop ? 50 : 'auto' }}
          >
            <div className="w-full h-full min-h-0 flex flex-col">
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
                    {/* Información del usuario y progreso (nivel va en el header como foto de usuario) */}
                    <div className="flex-1 min-w-0">
                      <h1 className="text-3xl md:text-5xl lg:text-4xl font-bold text-palette-cream font-montserrat tracking-tight mb-2 drop-shadow-lg">
                        El Camino
                      </h1>
                      <p className="text-base hidden md:block md:text-lg text-palette-cream/90 font-montserrat font-light mb-1 drop-shadow-md">
                        {auth.user?.nombre || 'Usuario'}
                      </p>
                      {auth.user?.email && (
                        <p className="hidden md:block text-sm text-palette-cream/75 font-montserrat font-light mb-4 drop-shadow-sm">
                          {auth.user.email}
                        </p>
                      )}
                      {/* Completado y U.C. */}
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-3 px-4 py-2.5 bg-palette-stone/20 backdrop-blur-md border border-palette-stone/40 rounded-full shadow-lg">
                          <span className="text-xl md:text-2xl font-bold text-palette-cream font-montserrat">
                            {monthProgress}%
                          </span>
                          <span className="text-xs md:text-sm text-palette-stone font-montserrat font-light uppercase tracking-wide">
                            Completado
                          </span>
                        </div>
                        {coherence.coherenceTracking && (
                          <div className="flex items-center gap-3 px-4 py-2.5 bg-palette-stone/20 backdrop-blur-md border border-palette-stone/40 rounded-full shadow-lg">
                            <img 
                              src="/images/svg/icosahedron-thick.svg" 
                              alt="Icosaedro" 
                              className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0"
                              style={{ filter: 'brightness(0) invert(1)' }}
                            />
                            <span className="text-xl md:text-2xl font-bold text-palette-cream font-montserrat">
                              {coherence.coherenceTracking?.totalUnits || 0}
                            </span>
                            <span className="text-xs md:text-sm text-palette-stone font-montserrat font-light uppercase tracking-wide">
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
            <div className="relative">
              {selectedContent && selectedWeekData && (
                // Respetar el flag isUnlocked que viene del API (y admin)
                (auth.user?.rol === 'Admin' || selectedWeekData.isUnlocked)
              ) ? (
                <div className="relative w-full md:min-h-screen">
                  {selectedContent.type === 'visual' ? (
                    <div key={`visual-${selectedWeek}-${selectedDay}-${selectedContentIndex ?? 0}`} className="w-full md:min-h-[80vh]">
                      <VideoContentDisplay
                        videoUrl={selectedContent.videoUrl}
                        videoId={selectedContent.videoId}
                        title={selectedContent.title}
                        description={'description' in selectedContent ? selectedContent.description : undefined}
                        duration={'duration' in selectedContent ? selectedContent.duration : undefined}
                        materials={[]}
                        onComplete={handleComplete}
                        onPause={() => setSidebarOpen(true)}
                        onPlay={() => setSidebarOpen(false)}
                        isCompleted={selectedContentIndex != null
                          ? coherence.completedVideos.has(`${logbook?._id}-${selectedWeek}-content-${selectedContentIndex}`)
                          : selectedDay 
                            ? coherence.completedVideos.has(`${logbook?._id}-${selectedWeek}-${selectedDay}-video`) 
                            : coherence.completedVideos.has(`${logbook?._id}-${selectedWeek}-week-video`)}
                        logbookId={logbook?._id}
                        weekNumber={selectedWeek || undefined}
                        dayNumber={selectedDay || undefined}
                      />
                    </div>
                  ) : (
                    <div key={`audioText-${selectedWeek}-${selectedDay}-${selectedContentIndex ?? 0}`} className="w-full min-h-[80vh]">
                      <AudioTextContentDisplay
                        audioUrl={'audioUrl' in selectedContent ? selectedContent.audioUrl : undefined}
                        audioDuration={'audioDuration' in selectedContent ? selectedContent.audioDuration : undefined}
                        text={'text' in selectedContent ? selectedContent.text : undefined}
                        title={selectedContent.title}
                        subtitle={'subtitle' in selectedContent ? selectedContent.subtitle : undefined}
                        onComplete={handleComplete}
                        isCompleted={selectedContentIndex != null
                          ? coherence.completedAudios.has(`${logbook?._id}-${selectedWeek}-content-${selectedContentIndex}`)
                          : selectedDay 
                            ? coherence.completedAudios.has(`${logbook?._id}-${selectedWeek}-${selectedDay}-audio`) 
                            : coherence.completedAudios.has(`${logbook?._id}-${selectedWeek}-week-audio`)}
                        logbookId={logbook?._id}
                        weekNumber={selectedWeek || undefined}
                        dayNumber={selectedDay || undefined}
                      />
                    </div>
                  )}
                </div>
              ) : selectedWeekData && !selectedWeekData.isUnlocked && auth.user?.rol !== 'Admin' ? (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="relative rounded-2xl border border-palette-stone/20 bg-palette-ink/80 backdrop-blur-sm overflow-hidden"
                >
                  <div className="relative z-10 px-8 py-12 sm:px-12 sm:py-14 text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-palette-cream/10 border border-palette-cream/20 mb-6">
                      <LockClosedIcon className="w-7 h-7 text-palette-cream/80" />
                    </div>
                    <p className="text-palette-cream font-montserrat font-light text-xl sm:text-2xl tracking-tight mb-2">
                      {selectedDay ? `Día ${selectedDay}` : `Semana ${selectedWeek}`}
                    </p>
                    <p className="text-palette-cream/80 font-montserrat font-extralight text-sm sm:text-base mb-6 max-w-md mx-auto">
                      Se desbloquea el{' '}
                      <span className="font-light text-palette-cream/90">
                        {new Date(
                          selectedDay && selectedWeekData.dailyContents?.length
                            ? selectedWeekData.dailyContents.find(d => d.dayNumber === selectedDay)?.publishDate || selectedWeekData.publishDate
                            : selectedWeekData.publishDate
                        ).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </p>
                    <p className="text-palette-cream/70 font-montserrat font-light text-xs sm:text-sm mb-8 max-w-sm mx-auto">
                      Mientras tanto podés explorar clases y programas en la Biblioteca.
                    </p>
                    <Link
                      href="/library"
                      className="inline-flex items-center gap-2 font-montserrat font-normal text-sm tracking-[0.12em] uppercase text-palette-cream border border-palette-cream/30 hover:border-palette-cream/50 hover:bg-palette-cream/10 rounded-full px-6 py-3 transition-colors duration-200"
                    >
                      Ir a ver caminos
                      <ChevronRightIcon className="w-4 h-4" strokeWidth={2} />
                    </Link>
                  </div>
                </motion.div>
              ) : (
                <div className="relative rounded-3xl border border-palette-stone/20 bg-palette-ink p-10 text-left sm:text-center shadow-xl">
                  <p className="relative z-10 text-base sm:text-lg text-palette-cream font-montserrat font-light">Selecciona un contenido para comenzar</p>
                </div>
              )}

              {/* Sección Semanas: en mobile va justo debajo del video, como sección natural (en desktop está en el sidebar) */}
              {logbook && (
                <section
                  id="weekly-path-mobile-sidebar"
                  className="md:hidden w-full mt-0 md:mt-8 pt-8 border-t border-palette-stone/20"
                >
                  <h2 className="font-montserrat text-lg font-semibold text-palette-cream mb-4">Semanas</h2>
                  <WeeklyPathSidebar
                    logbook={logbook}
                    selectedWeek={selectedWeek}
                    selectedDay={selectedDay}
                    selectedContentType={selectedContentType}
                    selectedContentIndex={selectedContentIndex}
                    onSelect={(week, day, type, contentIndex) => {
                      handleSelect(week, day, type, contentIndex);
                    }}
                    completedWeeks={coherence.completedWeeks}
                    completedDays={coherence.completedDays}
                    completedVideos={coherence.completedVideos}
                    completedAudios={coherence.completedAudios}
                    onClose={() => {}}
                  />
                </section>
              )}

              {/* Información sobre Coherencia - texto fino, sin contenedores con borde */}
              <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="mt-10 pt-10 border-t border-palette-stone/10"
                >
                    <h3 className="text-lg md:text-xl font-semibold text-palette-cream font-montserrat tracking-tight mb-3">
                      ¿Qué es la Coherencia?
                    </h3>
                    <p className="text-palette-cream/90 text-base font-light leading-relaxed font-montserrat mb-3">
                      Una semana completada del Camino = 1 Unidad de Coherencia (U.C.). Mantené la constancia y acumulá U.C. para canjear por programas, material o lo que vayamos creando.
                    </p>
                    <p className="text-palette-cream/90 text-base font-light leading-relaxed font-montserrat">
                      Se premia la constancia: ahí están los resultados en el movimiento.
                    </p>
                </motion.div>
              </div>
            </div>
            <div className="pb-4 md:pb-6" >
              <FooterProfile />
            </div>
            </div>
          </div>
        </div>

          {/* PC: flecha para abrir sidebar (como practice) */}
          <button 
            type="button"
            onClick={() => setSidebarOpen(true)}
            className={`hidden md:flex fixed left-0 top-1/2 -translate-y-1/2 z-30 h-14 w-10 items-center justify-center rounded-r-xl bg-palette-ink/95 text-palette-cream shadow-lg border border-l-0 border-palette-stone/30 hover:bg-palette-ink hover:w-12 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] focus:outline-none focus:ring-2 focus:ring-palette-sage focus:ring-offset-2 focus:ring-offset-transparent ${
              sidebarOpen ? 'opacity-0 pointer-events-none -translate-x-4' : 'opacity-100 translate-x-0'
            }`}
            aria-label="Abrir menú del camino"
          >
            <ChevronRightIcon className="w-6 h-6 shrink-0" aria-hidden />
          </button>

          {/* Sidebar: solo desktop (en mobile el menú va debajo del video) */}
          <div
            className={`hidden md:flex fixed inset-y-0 left-0 z-40 w-96 flex-col bg-palette-ink border-r border-palette-stone/20 shadow-xl overflow-hidden pt-20 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] min-w-0 ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-palette-stone/20 shrink-0">
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-palette-stone/30 text-palette-cream hover:bg-palette-stone/50 transition-colors focus:outline-none focus:ring-2 focus:ring-palette-sage focus:ring-offset-2 focus:ring-offset-palette-ink border border-palette-stone/40"
                aria-label="Cerrar menú"
              >
                <ChevronLeftIcon className="w-6 h-6 shrink-0" strokeWidth={2.5} />
              </button>
              <Link
                href="/library"
                className="text-sm text-palette-sage hover:underline truncate"
              >
                Volver a Biblioteca
              </Link>
            </div>
            <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 min-w-0">
              <WeeklyPathSidebar
                logbook={logbook}
                selectedWeek={selectedWeek}
                selectedDay={selectedDay}
                selectedContentType={selectedContentType}
                selectedContentIndex={selectedContentIndex}
                onSelect={(week, day, type, contentIndex) => {
                  handleSelect(week, day, type, contentIndex);
                  if (typeof window !== 'undefined' && window.innerWidth < 1024) setSidebarOpen(false);
                }}
                completedWeeks={coherence.completedWeeks}
                completedDays={coherence.completedDays}
                completedVideos={coherence.completedVideos}
                completedAudios={coherence.completedAudios}
                onClose={() => setSidebarOpen(false)}
              />
            </div>
          </div>
        </section>
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
          levelUp={celebrationData.levelUp}
          newLevel={celebrationData.newLevel}
          evolution={celebrationData.evolution}
          gorillaIcon={celebrationData.gorillaIcon}
        />
      )}

      {/* Modal: ir al siguiente contenido de la semana */}
      <NextContentModal
        isOpen={showNextContentModal}
        onClose={() => {
          setShowNextContentModal(false);
          setNextContentModalPayload(null);
        }}
        onNext={() => {
          if (selectedWeek !== null && nextContentModalPayload) {
            skipNextSelectionEffectRef.current = true;
            handleSelect(selectedWeek, null, nextContentModalPayload.nextContentType, nextContentModalPayload.nextContentIndex);
          }
          setShowNextContentModal(false);
          setNextContentModalPayload(null);
        }}
        nextTitle={nextContentModalPayload?.nextTitle}
      />

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
              {/* Línea superior — marca Move Crew */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-palette-sage/60" />
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-palette-sage/30" />
              {/* Mensaje centrado, tipografía refinada */}
              <p
                className="text-[10px] md:text-xs font-montserrat uppercase tracking-[0.35em] text-palette-sage/90 mb-2"
              >
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
