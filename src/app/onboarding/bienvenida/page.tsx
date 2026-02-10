'use client';

import type { CSSProperties, MouseEvent } from 'react';
import { useEffect, useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleIcon, LockClosedIcon, PlayIcon, PauseIcon } from '@heroicons/react/24/solid';
import Player from '@vimeo/player';
import MainSideBar from '../../../components/MainSidebar/MainSideBar';
import ShimmerBox from '../../../components/ShimmerBox';
import CoherenceCelebrationModal from '../../../components/PageComponent/WeeklyPath/CoherenceCelebrationModal';
import { useAuth } from '../../../hooks/useAuth';

export default function BienvenidaPage() {
  const router = useRouter();
  const auth = useAuth();
  const [videoProgress, setVideoProgress] = useState(0);
  const [textScrolled, setTextScrolled] = useState(false);
  const [buttonEnabled, setButtonEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [showCoherenceModal, setShowCoherenceModal] = useState(false);
  const [coherenceData, setCoherenceData] = useState<{
    ucsOtorgadas: number;
    totalUnits: number;
    currentStreak: number;
  } | null>(null);
  const videoRef = useRef<HTMLDivElement>(null);
  const vimeoPlayerRef = useRef<Player | null>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const VIMEO_VIDEO_ID = 1156890575; // ID extraído de la URL de Vimeo
  const [privateToken, setPrivateToken] = useState<string | null>(null);
  const [tokenLoaded, setTokenLoaded] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Scroll para efecto tipo Index: video se achica y redondea
  // Tiempo más corto en mobile (cambio más pequeño): 80px mobile, 120px desktop
  useEffect(() => {
    const handleScroll = () => {
      const maxScrollPx = typeof window !== 'undefined' && window.innerWidth <= 768 ? 80 : 120;
      const progress = Math.min(1, window.scrollY / maxScrollPx);
      setScrollProgress(progress);
    };
    const handleResize = () => setIsMobile(typeof window !== 'undefined' && window.innerWidth <= 768);
    handleResize();
    handleScroll();
    let ticking = false;
    const throttled = () => {
      if (!ticking) {
        requestAnimationFrame(() => { handleScroll(); ticking = false; });
        ticking = true;
      }
    };
    window.addEventListener('scroll', throttled, { passive: true });
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', throttled);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Obtener token privado para videos UNLISTED
  useEffect(() => {
    const fetchPrivateToken = async () => {
      try {
        const res = await fetch('/api/vimeo/getPrivateToken', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoId: VIMEO_VIDEO_ID.toString() }),
        });
        
        if (res.ok) {
          const data = await res.json();
          setPrivateToken(data.privateToken);
        }
      } catch (error) {
        console.error('Error obteniendo token privado:', error);
      } finally {
        setTokenLoaded(true);
      }
    };

    fetchPrivateToken();
  }, []);

  // Inicializar reproductor de Vimeo y verificar progreso (50%)
  useEffect(() => {
    // Esperar a que el componente esté visible y el token esté cargado antes de inicializar
    if (!isVisible || !videoRef.current || !tokenLoaded) return;

    // Pequeño delay para asegurar que el DOM esté completamente renderizado
    const timer = setTimeout(() => {
      if (!videoRef.current) return;

      try {
        const playerOptions: any = {
          autoplay: false,
          controls: false, // Sin controles nativos, usaremos botón personalizado
          responsive: true,
          playsinline: true,
          title: false,
          byline: false,
          portrait: false,
          background: false,
          keyboard: false,
          pip: false,
        };

        // Para videos UNLISTED, usar la URL completa con el hash en lugar del ID
        if (privateToken) {
          // Usar URL completa con hash para videos UNLISTED, sin subtítulos
          // texttrack=false desactiva los subtítulos por defecto
          playerOptions.url = `https://player.vimeo.com/video/${VIMEO_VIDEO_ID}?h=${privateToken}&texttrack=false&title=0&byline=0&portrait=0`;
        } else {
          // Para videos públicos, usar URL con parámetros para desactivar subtítulos
          // texttrack=false desactiva los subtítulos por defecto
          playerOptions.url = `https://player.vimeo.com/video/${VIMEO_VIDEO_ID}?texttrack=false&title=0&byline=0&portrait=0`;
        }
        
        // También intentar desactivar subtítulos usando la opción del SDK (si está disponible)
        // Nota: El SDK de Vimeo no tiene una opción directa en el constructor, 
        // pero lo haremos después con disableTextTrack()

        const player = new Player(videoRef.current, playerOptions);

        vimeoPlayerRef.current = player;

        // Evento para trackear el progreso del video
        const handleTimeUpdate = (data: { percent: number; seconds: number; duration: number }) => {
          const progress = data.percent * 100;
          setVideoProgress(progress);
        };

        // Evento cuando el video termina
        const handleEnded = () => {
          setVideoProgress(100);
        };

        // Evento de error
        const handleError = (error: any) => {
          console.error('Error en reproductor Vimeo:', error);
          setIsVideoLoading(false);
        };

        // Evento cuando el video está listo
        const handleReady = async () => {
          // Reproductor Vimeo listo
          setIsVideoLoading(false);
          
          // Desactivar subtítulos cuando el reproductor esté listo
          try {
            await player.disableTextTrack();
          } catch (error) {
            console.warn('No se pudieron desactivar los subtítulos:', error);
          }
        };

        // Eventos de play/pause para ocultar controles cuando está reproduciendo
        const handlePlay = async () => {
          setIsPlaying(true);
          // Agregar clase para ocultar controles cuando está reproduciendo
          if (videoRef.current?.parentElement) {
            videoRef.current.parentElement.classList.add('playing');
          }
          
          // Asegurarse de que los subtítulos estén desactivados cuando se reproduce
          try {
            await player.disableTextTrack();
          } catch (error) {
            // Ignorar errores silenciosamente
          }
        };

        const handlePause = () => {
          setIsPlaying(false);
          // Remover clase para mostrar controles cuando está pausado
          if (videoRef.current?.parentElement) {
            videoRef.current.parentElement.classList.remove('playing');
          }
        };

        // Función para desactivar subtítulos (reutilizable)
        const disableSubtitles = async () => {
          try {
            await player.disableTextTrack();
          } catch (error) {
            // Ignorar errores silenciosamente
          }
        };

        player.on('timeupdate', handleTimeUpdate);
        player.on('ended', handleEnded);
        player.on('error', handleError);
        const handleLoaded = () => {
          handleReady();
          disableSubtitles();
        };
        player.on('loaded', handleLoaded);
        player.on('play', handlePlay);
        player.on('pause', handlePause);
        
        // También desactivar subtítulos después de un pequeño delay para asegurarse
        setTimeout(disableSubtitles, 500);
        setTimeout(disableSubtitles, 1000);
        setTimeout(disableSubtitles, 2000);

        // Timeout de seguridad: si "loaded" no dispara en 12s, quitar skeleton
        const fallbackTimer = setTimeout(() => setIsVideoLoading(false), 12000);

        return () => {
          clearTimeout(fallbackTimer);
          player.off('timeupdate', handleTimeUpdate);
          player.off('ended', handleEnded);
          player.off('error', handleError);
          player.off('loaded', handleLoaded);
          player.off('play', handlePlay);
          player.off('pause', handlePause);
          player.destroy().catch((err) => console.error('Error al destruir reproductor:', err));
        };
      } catch (error) {
        console.error('Error inicializando reproductor Vimeo:', error);
        setIsVideoLoading(false);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (vimeoPlayerRef.current) {
        vimeoPlayerRef.current.destroy().catch((err) => console.error('Error al destruir reproductor:', err));
      }
    };
  }, [isVisible, privateToken, tokenLoaded]);

  // Verificar scroll del texto
  useEffect(() => {
    // Esperar a que el componente esté visible y el DOM esté listo
    if (!isVisible) {
      return;
    }

    const textContainer = textContainerRef.current;
    if (!textContainer) {
      const retryTimeout = setTimeout(() => {
        const retryContainer = textContainerRef.current;
        if (retryContainer) {
          setupScrollListeners(retryContainer);
        }
      }, 100);
      return () => clearTimeout(retryTimeout);
    }

    setupScrollListeners(textContainer);
  }, [isVisible]);

  const setupScrollListeners = (textContainer: HTMLDivElement) => {
    const checkScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = textContainer;
      
      // Si el contenido no necesita scroll (cabe todo), considerar como leído
      if (scrollHeight <= clientHeight + 1) {
        setTextScrolled(true);
        return;
      }
      
      // Método más simple y directo: verificar si scrollTop + clientHeight está cerca de scrollHeight
      const scrollBottom = scrollTop + clientHeight;
      const distanceFromBottom = scrollHeight - scrollBottom;
      
      // Considerar scrolleado si está a menos de 100px del final (muy permisivo)
      // O si scrollBottom es mayor o igual a scrollHeight (ya llegó al final)
      const isAtBottom = distanceFromBottom <= 100 || scrollBottom >= scrollHeight - 1;
      
      // También calcular porcentaje como respaldo
      const maxScroll = scrollHeight - clientHeight;
      const scrollPercentage = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 100;
      const isAt95Percent = scrollPercentage >= 95;
      
      const shouldEnable = isAtBottom || isAt95Percent;
      
      // Actualizar estado solo si cambió para evitar re-renders innecesarios
      setTextScrolled(prev => {
        if (prev !== shouldEnable) {
          return shouldEnable;
        }
        return prev;
      });
    };

    // Verificar estado inicial después de que el contenido se renderice
    const checkInitial = setTimeout(() => {
      checkScroll();
    }, 300);

    // Agregar listener de scroll
    const handleScroll = () => {
      checkScroll();
    };
    
    textContainer.addEventListener('scroll', handleScroll, { passive: true });
    
    // También verificar cuando cambia el tamaño del contenido
    const resizeObserver = new ResizeObserver(() => {
      setTimeout(checkScroll, 50);
    });
    resizeObserver.observe(textContainer);
    
    // Verificar periódicamente (por si hay problemas con el evento de scroll)
    // Reducido a 200ms para ser más responsivo
    const interval = setInterval(() => {
      checkScroll();
    }, 200);
    
    return () => {
      clearTimeout(checkInitial);
      clearInterval(interval);
      textContainer.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
    };
  };

  // Habilitar botón cuando el usuario haya llegado al final del texto
  useEffect(() => {
    setButtonEnabled(!!textScrolled);
  }, [textScrolled]);

  const handlePlayClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const player = vimeoPlayerRef.current;
    if (!player) return;
    // Llamar play() de forma síncrona para conservar el user gesture (requerido por navegadores)
    player.play()
      .then(() => setIsPlaying(true))
      .catch((err) => console.error('Error al reproducir video:', err));
  };

  const handlePauseClick = async () => {
    if (vimeoPlayerRef.current) {
      try {
        await vimeoPlayerRef.current.pause();
        setIsPlaying(false);
      } catch (error) {
        console.error('Error al pausar video:', error);
      }
    }
  };


  const handleAccept = async () => {
    if (!buttonEnabled || loading) return;

    setLoading(true);
    try {
      const response = await fetch('/api/onboarding/accept-contract', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
                
        setLoading(false);
        
        // Mostrar el modal si:
        // 1. Se otorgó una U.C. (ucOtorgada === true), O
        // 2. Es la primera vez que acepta el contrato (esPrimeraVez === true)
        // Esto asegura que el usuario vea el modal explicativo incluso si ya tiene U.C. de otras fuentes
        const debeMostrarModal = (data.ucOtorgada === true || data.esPrimeraVez === true) && 
                                  data.totalUnits !== undefined && 
                                  data.totalUnits !== null;
        
        if (debeMostrarModal) {
          setCoherenceData({
            ucsOtorgadas: data.ucOtorgada ? 1 : 0, // Mostrar 0 si no se otorgó nueva U.C.
            totalUnits: data.totalUnits,
            currentStreak: 0
          });
          setShowCoherenceModal(true);
          // NO refrescar el usuario aquí para evitar que OnboardingChecker redirija
          // El usuario se refrescará cuando se cierre el modal en handleCloseCoherenceModal
        } else {
          // Si no es primera vez y no se otorgó U.C., mostrar overlay y redirigir
          setIsRedirecting(true);
          await auth.fetchUser();
          router.push('/library');
        }
      } else {
        const error = await response.json();
        alert(error.error || 'Error al aceptar el contrato');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al procesar la solicitud');
      setLoading(false);
    }
  };

  const handleCloseCoherenceModal = async () => {
    setShowCoherenceModal(false);
    
    // Activar loading de redirección
    setIsRedirecting(true);
    
    // Refrescar el usuario desde el servidor antes de redirigir
    // Esto asegura que los datos estén actualizados
    await auth.fetchUser();
    
    // Después de cerrar el modal y refrescar el usuario, redirigir al dashboard
    router.push('/library');
  };


  // Función para generar números pseudoaleatorios consistentes
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  // Generar datos fijos para todas las figuras geométricas (una sola vez)
  const geometricShapes = useMemo(() => {
    // Paleta: teal, sage, stone
    const baseColors = [
      { r: 7, g: 70, b: 71 },      // palette-teal #074647
      { r: 0, g: 27, b: 28 },     // palette-deep-teal #001b1c
      { r: 172, g: 174, b: 137 }, // palette-sage #acae89
      { r: 120, g: 120, b: 103 }, // palette-stone #787867
    ];

    // Círculos - cantidad reducida: 10 figuras
    const circles = Array.from({ length: 10 }, (_, i) => {
      const seed = i * 7.3;
      const size = 12 + seededRandom(seed) * 18; // Más pequeños: 12-30px
      const initialX = seededRandom(seed + 1) * 100;
      const initialY = seededRandom(seed + 2) * 100;
      const duration = 6 + seededRandom(seed + 3) * 8;
      const delay = seededRandom(seed + 4) * 2;
      const moveX = (seededRandom(seed + 5) - 0.5) * 70;
      const moveY = (seededRandom(seed + 6) - 0.5) * 70;
      const baseColor = baseColors[Math.floor(seededRandom(seed + 7) * baseColors.length)];
      
      return {
        type: 'circle',
        size,
        initialX,
        initialY,
        duration,
        delay,
        moveX,
        moveY,
        baseColor,
        color: `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, 0.6)`,
        borderColor: `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, 0.9)`,
      };
    });

    // Triángulos - cantidad reducida: 12 figuras
    const triangles = Array.from({ length: 12 }, (_, i) => {
      const seed = i * 11.7;
      const size = 10 + seededRandom(seed) * 20; // Más pequeños: 10-30px
      const initialX = seededRandom(seed + 1) * 100;
      const initialY = seededRandom(seed + 2) * 100;
      const duration = 7 + seededRandom(seed + 3) * 10;
      const delay = seededRandom(seed + 4) * 2;
      const moveX = (seededRandom(seed + 5) - 0.5) * 75;
      const moveY = (seededRandom(seed + 6) - 0.5) * 75;
      const baseColor = baseColors[Math.floor(seededRandom(seed + 7) * baseColors.length)];
      const rotation = seededRandom(seed + 8) * 360; // Rotación inicial aleatoria
      
      return {
        type: 'triangle',
        size,
        initialX,
        initialY,
        duration,
        delay,
        moveX,
        moveY,
        rotation,
        baseColor,
        color: `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, 0.55)`,
        borderColor: `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, 0.85)`,
      };
    });

    // Hexágonos - cantidad reducida: 8 figuras
    const hexagons = Array.from({ length: 8 }, (_, i) => {
      const seed = i * 13.9;
      const size = 14 + seededRandom(seed) * 22; // Más pequeños: 14-36px
      const initialX = seededRandom(seed + 1) * 100;
      const initialY = seededRandom(seed + 2) * 100;
      const duration = 8 + seededRandom(seed + 3) * 12;
      const delay = seededRandom(seed + 4) * 2;
      const moveX = (seededRandom(seed + 5) - 0.5) * 65;
      const moveY = (seededRandom(seed + 6) - 0.5) * 65;
      const baseColor = baseColors[Math.floor(seededRandom(seed + 7) * baseColors.length)];
      
      return {
        type: 'hexagon',
        size,
        initialX,
        initialY,
        duration,
        delay,
        moveX,
        moveY,
        baseColor,
        color: `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, 0.5)`,
        borderColor: `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, 0.8)`,
      };
    });

    return { circles, triangles, hexagons };
  }, []);

  // Formas orgánicas flotantes - paleta teal/sage/stone
  const organicShapes = useMemo(() => {
    const colors = [
      { r: 7, g: 70, b: 71 },      // palette-teal
      { r: 0, g: 27, b: 28 },      // palette-deep-teal
      { r: 172, g: 174, b: 137 }, // palette-sage
      { r: 120, g: 120, b: 103 }, // palette-stone
    ];
    
    return Array.from({ length: 10 }, (_, i) => { // Optimizado: 10 formas
      const seed = i * 19.3;
      const size = 40 + seededRandom(seed) * 60; // Más pequeñas: 40-100px
      const delay = seededRandom(seed + 1) * 3;
      const initialX = 10 + seededRandom(seed + 2) * 80;
      const initialY = 10 + seededRandom(seed + 3) * 80;
      const baseColor = colors[Math.floor(seededRandom(seed + 4) * colors.length)];
      const opacity = 0.1 + seededRandom(seed + 5) * 0.15;
      const moveX = 50 + seededRandom(seed + 6) * 100;
      const moveY = 30 + seededRandom(seed + 7) * 80;
      const scaleMax = 1.2 + seededRandom(seed + 8) * 0.3;
      const duration = 15 + seededRandom(seed + 9) * 10;
      
      return {
        size,
        delay,
        initialX,
        initialY,
        opacity,
        baseColor,
        moveX,
        moveY,
        scaleMax,
        duration,
      };
    });
  }, []);

  // Líneas de flujo de energía - duplicadas, colores amber/orange/rose
  const flowLines = useMemo(() => {
    return Array.from({ length: 16 }, (_, i) => { // Optimizado: 16 líneas
      const seed = i * 23.7;
      const length = 200 + seededRandom(seed) * 300;
      const angle = (360 / 16) * i; // Ajustar ángulo para 16 líneas
      const duration = 3 + seededRandom(seed + 1) * 2;
      const delay = seededRandom(seed + 2) * 2;
      
      return { length, angle, duration, delay };
    });
  }, []);

  // Partículas de energía - paleta
  const particles = useMemo(() => {
    const colors = ['#074647', '#001b1c', '#acae89', '#787867']; // palette teal, deep-teal, sage, stone
    
    return Array.from({ length: 35 }, (_, i) => { // Optimizado: 35 partículas
      const seed = i * 17.9;
      const size = 1 + seededRandom(seed) * 2; // Más pequeñas: 1-3px
      const color = colors[Math.floor(seededRandom(seed + 1) * colors.length)];
      const left = seededRandom(seed + 2) * 100;
      const top = seededRandom(seed + 3) * 100;
      const glowSize = 2 + seededRandom(seed + 4) * 3; // Glow más pequeño
      const moveY = -100 - seededRandom(seed + 5) * 200;
      const moveX = (seededRandom(seed + 6) - 0.5) * 100;
      const duration = 4 + seededRandom(seed + 7) * 4;
      const delay = seededRandom(seed + 8) * 4;
      
      return {
        size,
        color,
        left,
        top,
        glowSize,
        moveY,
        moveX,
        duration,
        delay,
      };
    });
  }, []);

  // Figuras grandes de fondo - más pequeñas
  const largeShapes = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => {
      const seed = i * 29.1;
      const size = 30 + seededRandom(seed) * 40; // Más pequeñas: 30-70px
      const initialX = seededRandom(seed + 1) * 100;
      const initialY = seededRandom(seed + 2) * 100;
      const duration = 15 + seededRandom(seed + 3) * 10;
      const delay = seededRandom(seed + 4) * 3;
      const moveX = (seededRandom(seed + 5) - 0.5) * 60;
      const moveY = (seededRandom(seed + 6) - 0.5) * 60;
      
      return {
        size,
        initialX,
        initialY,
        duration,
        delay,
        moveX,
        moveY,
      };
    });
  }, []);

  // Estilos del video: mismo criterio que Index (wrapper en px, scale en iframe, sin lógica especial móvil)
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const getVideoStyles = () => {
    if (typeof window === 'undefined') {
      return { wrapperStyles: {} as CSSProperties, iframeStyles: {} as CSSProperties };
    }
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const endWidthPx = viewportWidth * 0.9;
    const endHeightPx = viewportHeight * 0.8;
    // Mobile y Desktop: ambos empiezan ya en el bloque definido (achicado) y se achican un poco al hacer scroll
    let borderRadius: number, scale: number, translateYPercent: number, wrapperWidthPx: number, wrapperHeightPx: number;
    if (isMobile) {
      borderRadius = lerp(24, 32, scrollProgress);
      scale = lerp(3.6, 3.5, scrollProgress);
      translateYPercent = lerp(80, 75, scrollProgress);
      wrapperWidthPx = lerp(viewportWidth * 0.95, endWidthPx, scrollProgress);
      wrapperHeightPx = lerp(viewportHeight * 0.85, endHeightPx, scrollProgress);
    } else {
      // Desktop: empieza ya en el rectángulo del medio (tamaño reducido)
      borderRadius = lerp(24, 32, scrollProgress);
      scale = lerp(1.1, 1, scrollProgress);
      translateYPercent = lerp(-50, -50, scrollProgress); // Centrado desde el inicio
      wrapperWidthPx = lerp(endWidthPx * 1.05, endWidthPx, scrollProgress); // Empieza un poco más grande y se achica
      wrapperHeightPx = lerp(endHeightPx * 1.05, endHeightPx, scrollProgress);
    }
    // En desktop, mover el contenedor un poco más abajo para separarlo del header
    const topOffset = isMobile ? '50%' : '52%';
    const wrapperStyles: CSSProperties = {
      position: 'absolute',
      top: topOffset,
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: `${wrapperWidthPx}px`,
      height: `${wrapperHeightPx}px`,
      borderRadius: `${borderRadius}px`,
      overflow: 'hidden',
      zIndex: 2,
      padding: 0,
      margin: 0,
      boxSizing: 'border-box',
    };
    // Mobile: centrado y scale ~1.75→1.6. Desktop: translateY -200%→-50%, scale 4→1.4
    const iframeStyles: CSSProperties = {
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: '100%',
      height: '100%',
      transform: `translate(-50%, ${translateYPercent}%) scale(${scale})`,
      transformOrigin: 'center center',
      display: 'block',
      border: 'none',
      margin: 0,
      padding: 0,
      boxSizing: 'border-box',
    };
    return { wrapperStyles, iframeStyles };
  };
  const { wrapperStyles, iframeStyles } = getVideoStyles();

  // Animaciones escalonadas
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  const textRevealVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <MainSideBar where="onboarding" forceStandardHeader onMenuClick={() => setSidebarOpen((prev) => !prev)} sidebarOpen={sidebarOpen}>
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
            className="min-h-screen bg-palette-cream text-palette-ink font-montserrat relative"
          >
            {/* Sección scroll: efecto tipo Index - video sticky que se achica al bajar */}
            {/* Altura reducida para tiempo de scroll más corto: 150px en mobile, 250px en desktop */}
            <div className="flex flex-col relative" style={{ minHeight: isMobile ? 'calc(100vh + 150px)' : 'calc(100vh + 250px)' }}>
              <div className="sticky top-0 left-0 h-[100vh] w-full overflow-hidden bg-palette-cream" style={{ marginTop: 0, paddingTop: 0 }}>
                {/* Formas decorativas detrás del video - extendidas desde el contenido */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                  {/* Base con paleta crema */}
                  <div className="absolute inset-0 bg-palette-cream" />
                  {/* Triángulos decorativos detrás del video */}
                  {geometricShapes.triangles.slice(0, 8).map((shape, i) => (
                    <motion.div
                      key={`video-triangle-${i}`}
                      className="absolute"
                      style={{
                        width: `${shape.size * 0.7}px`,
                        height: `${shape.size * 0.7}px`,
                        left: `${shape.initialX}%`,
                        top: `${shape.initialY}%`,
                        backgroundColor: shape.color,
                        clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                        opacity: 0.3,
                        zIndex: 0,
                      }}
                      animate={{
                        x: ['0vw', `${shape.moveX * 0.5}vw`, `${shape.moveX * 0.5}vw`, '0vw'],
                        y: ['0vh', `${shape.moveY * 0.5}vh`, `${shape.moveY * 0.5}vh`, '0vh'],
                        rotate: [shape.rotation, shape.rotation + 360],
                        scale: [1, 1.1, 0.9, 1],
                        opacity: [0.2, 0.4, 0.3, 0.2],
                      }}
                      transition={{
                        duration: shape.duration * 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: shape.delay
                      }}
                    />
                  ))}
                </div>
                {/* Texto arriba del video: tamaños ajustados para mobile */}
                <div
                  className="fixed top-1/3 left-1/2 w-full md:px-32 md:pt-24 -translate-x-1/2 -translate-y-1/2 z-[100] text-white text-start pointer-events-none flex mt-8 md:mt-12 flex-col items-start gap-2 md:gap-5 px-12"
                  style={{
                    opacity: scrollProgress <= 0.4 ? 1 - scrollProgress / 0.4 : 0,
                    transition: 'opacity 0.2s ease-out',
                  }}
                >
         
                  <h1
                    className="text-[3rem] md:!text-[6rem] font-semibold tracking-tight text-left md:tracking-wide leading-[0.95]"
                    style={{ textShadow: '0 2px 12px rgba(0, 0, 0, 0.2), 0 1px 6px rgba(0, 0, 0, 0.3)' }}
                  >
                    Bienvenido. 
                 
                  </h1>
                  <h2 className="text-[3rem] relative bottom-2 left-1 md:left-2 md:bottom-4 md:!text-[4rem] font-semibold tracking-tight text-left md:tracking-wide leading-[0.95]">La Move Crew te espera.</h2> 
                </div>
                <div className={`vimeo-player-container ${isPlaying ? 'playing' : ''}`} style={wrapperStyles}>
                  {/* Skeleton loading dentro del contenedor del video para respetar bordes */}
                  {isVideoLoading && (
                    <div className="absolute inset-0 z-[5] rounded-[inherit] overflow-hidden" aria-hidden>
                      <div className="absolute inset-0 bg-palette-deep-teal/90" />
                      <ShimmerBox className="absolute inset-0 w-full h-full" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <p className="font-montserrat text-sm uppercase tracking-[0.2em] text-palette-cream/80">Cargando video...</p>
                      </div>
                    </div>
                  )}
                  <div
                    ref={videoRef}
                    className="absolute w-full h-full p-0 m-0 z-0"
                    style={iframeStyles}
                  />
                  {/* Capa oscura 50% para mejorar visibilidad del título; opacidad 0 al terminar el scroll */}
                  <div
                    className="absolute inset-0 z-[2] pointer-events-none bg-black/50 transition-opacity duration-300"
                    style={{ opacity: 1 - scrollProgress }}
                    aria-hidden
                  />
                  {/* Botones play/pause dentro del contenedor, z-[50] para quedar encima del overlay y del iframe */}
                  {!isVideoLoading && !isPlaying && (
                    <motion.button
                      type="button"
                      onClick={handlePlayClick}
                      className="absolute bottom-4 left-4 z-[50] flex items-center justify-center bg-palette-cream/90 hover:bg-palette-cream hover:border-palette-teal/40 backdrop-blur-sm transition-colors rounded-full p-3 border border-palette-stone/20 shadow-lg cursor-pointer isolate"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <PlayIcon className="h-5 w-5 text-palette-teal" />
                    </motion.button>
                  )}
                  {!isVideoLoading && isPlaying && (
                    <motion.button
                      type="button"
                      onClick={handlePauseClick}
                      className="absolute bottom-4 left-4 z-[50] flex items-center justify-center bg-palette-cream/90 hover:bg-palette-cream hover:border-palette-teal/40 backdrop-blur-sm transition-colors rounded-full p-3 border border-palette-stone/20 shadow-lg cursor-pointer isolate"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      whileHover={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <PauseIcon className="h-5 w-5 text-palette-teal" />
                    </motion.button>
                  )}
                </div>
              </div>
            </div>

            {/* Contenido debajo del video: fondo decorativo + contrato + botón */}
            <div className="relative min-h-screen bg-palette-cream">
              {/* Background Effects - Movimiento Orgánico */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Base con paleta crema */}
                <div className="absolute inset-0 bg-palette-cream" />
            
            {/* Ondas de movimiento - Capa 1 */}
            <motion.svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 1200 800"
              preserveAspectRatio="xMidYMid slice"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 2 }}
            >
              <defs>
                <linearGradient id="waveGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#074647" stopOpacity="0.12" />
                  <stop offset="50%" stopColor="#acae89" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#787867" stopOpacity="0.12" />
                </linearGradient>
                <linearGradient id="waveGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#acae89" stopOpacity="0.15" />
                  <stop offset="50%" stopColor="#074647" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#001b1c" stopOpacity="0.1" />
                </linearGradient>
              </defs>
              
              {/* Onda principal - movimiento fluido */}
              <motion.path
                d="M0,400 Q300,300 600,400 T1200,400 L1200,800 L0,800 Z"
                fill="url(#waveGradient1)"
                animate={{
                  d: [
                    "M0,400 Q300,300 600,400 T1200,400 L1200,800 L0,800 Z",
                    "M0,450 Q300,350 600,450 T1200,450 L1200,800 L0,800 Z",
                    "M0,400 Q300,300 600,400 T1200,400 L1200,800 L0,800 Z",
                  ]
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              {/* Onda secundaria - contramovimiento */}
              <motion.path
                d="M0,500 Q400,450 800,500 T1200,500 L1200,800 L0,800 Z"
                fill="url(#waveGradient2)"
                animate={{
                  d: [
                    "M0,500 Q400,450 800,500 T1200,500 L1200,800 L0,800 Z",
                    "M0,450 Q400,500 800,450 T1200,450 L1200,800 L0,800 Z",
                    "M0,500 Q400,450 800,500 T1200,500 L1200,800 L0,800 Z",
                  ]
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.svg>

            {/* Espirales de energía - relacionadas con "La Espiral" */}
            {[...Array(3)].map((_, i) => {
              const size = 300 + i * 150;
              const x = 20 + i * 35;
              const y = 15 + i * 25;
              return (
                <motion.div
                  key={`spiral-${i}`}
                  className="absolute"
                  style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    left: `${x}%`,
                    top: `${y}%`,
                  }}
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.1, 1],
                    opacity: [0.08, 0.15, 0.08],
                  }}
                  transition={{
                    duration: 20 + i * 5,
                    repeat: Infinity,
                    ease: "linear",
                    delay: i * 2
                  }}
                >
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    <defs>
                      <linearGradient id={`spiralGradient${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#074647" stopOpacity="0.2" />
                        <stop offset="50%" stopColor="#acae89" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#787867" stopOpacity="0.1" />
                      </linearGradient>
                    </defs>
                    <motion.path
                      d="M100,100 Q150,50 100,0 Q50,50 100,100 Q150,150 200,100 Q150,50 100,100"
                      fill="none"
                      stroke={`url(#spiralGradient${i})`}
                      strokeWidth="2"
                      animate={{
                        pathLength: [0, 1, 0],
                        opacity: [0.1, 0.3, 0.1]
                      }}
                      transition={{
                        duration: 4 + i,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  </svg>
                </motion.div>
              );
            })}

            {/* Formas orgánicas flotantes - sugieren movimiento corporal */}
            {organicShapes.map((shape, i) => (
              <motion.div
                key={`organic-${i}`}
                className="absolute rounded-full"
                style={{
                  width: `${shape.size}px`,
                  height: `${shape.size}px`,
                  left: `${shape.initialX}%`,
                  top: `${shape.initialY}%`,
                  background: `radial-gradient(circle, rgba(${shape.baseColor.r}, ${shape.baseColor.g}, ${shape.baseColor.b}, ${shape.opacity}) 0%, transparent 70%)`,
                  filter: 'blur(40px)',
                  willChange: 'transform, opacity',
                  transform: 'translateZ(0)', // Acelera la renderización con GPU
                }}
                animate={{
                  x: [0, shape.moveX, 0],
                  y: [0, shape.moveY, 0],
                  scale: [1, shape.scaleMax, 1],
                  opacity: [0.1, 0.25, 0.1],
                }}
                transition={{
                  duration: shape.duration,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: shape.delay
                }}
              />
            ))}

            {/* Líneas de flujo de energía - detalles finos Move Crew */}
            {flowLines.map((shape, i) => (
              <motion.div
                key={`flow-${i}`}
                className="absolute origin-center"
                style={{
                  width: `${shape.length}px`,
                  height: '2px',
                  left: '50%',
                  top: '50%',
                  background: `linear-gradient(90deg, transparent, rgba(7, 70, 71, 0.35), transparent)`,
                  transform: `rotate(${shape.angle}deg) translateX(-50%)`,
                  transformOrigin: 'left center',
                }}
                animate={{
                  opacity: [0, 0.6, 0],
                  scaleX: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: shape.duration,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: shape.delay
                }}
              />
            ))}

            {/* Partículas de energía - detalles finos con colores Move Crew */}
            {particles.map((particle, i) => (
              <motion.div
                key={`particle-${i}`}
                className="absolute rounded-full"
                style={{
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  backgroundColor: particle.color,
                  left: `${particle.left}%`,
                  top: `${particle.top}%`,
                  boxShadow: `0 0 ${particle.glowSize}px ${particle.color}`,
                  willChange: 'transform, opacity',
                  transform: 'translateZ(0)', // Acelera la renderización con GPU
                }}
                animate={{
                  y: [0, particle.moveY, 0],
                  x: [0, particle.moveX, 0],
                  opacity: [0, 0.8, 0],
                  scale: [0.5, 1.5, 0.5],
                }}
                transition={{
                  duration: particle.duration,
                  repeat: Infinity,
                  ease: "easeOut",
                  delay: particle.delay
                }}
              />
            ))}

            {/* Grid pattern sutil con paleta */}
            <div 
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(7, 70, 71, 0.4) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(120, 120, 103, 0.3) 1px, transparent 1px)
                `,
                backgroundSize: '60px 60px'
              }}
            />

            {/* Figuras geométricas rebotando - Círculos */}
            {geometricShapes.circles.map((shape, i) => (
              <motion.div
                key={`circle-${i}`}
                className="absolute rounded-full"
                style={{
                  width: `${shape.size}px`,
                  height: `${shape.size}px`,
                  left: `${shape.initialX}%`,
                  top: `${shape.initialY}%`,
                  backgroundColor: shape.color,
                  border: `2px solid ${shape.borderColor}`,
                  boxShadow: `0 0 ${shape.size}px ${shape.color}, 0 0 ${shape.size * 1.5}px ${shape.color}`,
                  zIndex: 1,
                  willChange: 'transform, opacity',
                  transform: 'translateZ(0)', // Acelera la renderización con GPU
                }}
                animate={{
                  x: ['0vw', `${shape.moveX}vw`, `${shape.moveX}vw`, '0vw'],
                  y: ['0vh', `${shape.moveY}vh`, `${shape.moveY}vh`, '0vh'],
                  rotate: [0, 360],
                  scale: [1, 1.3, 0.7, 1],
                  opacity: [0.25, 0.4, 0.3, 0.25],
                }}
                transition={{
                  duration: shape.duration,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: shape.delay
                }}
              />
            ))}

            {/* Figuras geométricas rebotando - Triángulos */}
            {geometricShapes.triangles.map((shape, i) => (
              <motion.div
                key={`triangle-${i}`}
                className="absolute"
                style={{
                  width: `${shape.size}px`,
                  height: `${shape.size}px`,
                  left: `${shape.initialX}%`,
                  top: `${shape.initialY}%`,
                  backgroundColor: shape.color,
                  clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                  border: `none`,
                  boxShadow: `0 0 ${shape.size}px ${shape.color}`,
                  zIndex: 1,
                  willChange: 'transform, opacity',
                  transform: 'translateZ(0)', // Acelera la renderización con GPU
                }}
                animate={{
                  x: ['0vw', `${shape.moveX}vw`, `${shape.moveX}vw`, '0vw'],
                  y: ['0vh', `${shape.moveY}vh`, `${shape.moveY}vh`, '0vh'],
                  rotate: [shape.rotation, shape.rotation + 360],
                  scale: [1, 1.2, 0.8, 1],
                  opacity: [0.2, 0.35, 0.25, 0.2],
                }}
                transition={{
                  duration: shape.duration,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: shape.delay
                }}
              />
            ))}

            {/* Figuras geométricas rebotando - Hexágonos */}
            {geometricShapes.hexagons.map((shape, i) => (
              <motion.div
                key={`hexagon-${i}`}
                className="absolute"
                style={{
                  width: `${shape.size}px`,
                  height: `${shape.size}px`,
                  left: `${shape.initialX}%`,
                  top: `${shape.initialY}%`,
                  backgroundColor: shape.color,
                  clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)',
                  border: `2px solid ${shape.borderColor}`,
                  boxShadow: `0 0 ${shape.size}px ${shape.color}`,
                  zIndex: 1,
                  willChange: 'transform, opacity',
                  transform: 'translateZ(0)', // Acelera la renderización con GPU
                }}
                animate={{
                  x: ['0vw', `${shape.moveX}vw`, `${shape.moveX}vw`, '0vw'],
                  y: ['0vh', `${shape.moveY}vh`, `${shape.moveY}vh`, '0vh'],
                  rotate: [0, 360],
                  scale: [1, 1.25, 0.75, 1],
                  opacity: [0.2, 0.35, 0.25, 0.2],
                }}
                transition={{
                  duration: shape.duration,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: shape.delay
                }}
              />
            ))}

            {/* Figuras geométricas más grandes y lentas para profundidad - paleta */}
            {largeShapes.map((shape, i) => {
              const colors = [
                { r: 7, g: 70, b: 71 },      // palette-teal
                { r: 0, g: 27, b: 28 },     // palette-deep-teal
                { r: 172, g: 174, b: 137 }, // palette-sage
                { r: 120, g: 120, b: 103 }, // palette-stone
              ];
              const baseColor = colors[i % colors.length];
              
              return (
                <motion.div
                  key={`large-geometric-${i}`}
                  className="absolute rounded-full"
                  style={{
                    width: `${shape.size}px`,
                    height: `${shape.size}px`,
                    left: `${shape.initialX}%`,
                    top: `${shape.initialY}%`,
                    background: `radial-gradient(circle, rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, 0.08) 0%, transparent 70%)`,
                    border: `1px solid rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, 0.15)`,
                  }}
                  animate={{
                    x: ['0vw', `${shape.moveX}vw`, `${shape.moveX}vw`, '0vw'],
                    y: ['0vh', `${shape.moveY}vh`, `${shape.moveY}vh`, '0vh'],
                    rotate: [0, 360],
                    scale: [1, 1.3, 0.7, 1],
                    opacity: [0.05, 0.15, 0.1, 0.05],
                  }}
                  transition={{
                    duration: shape.duration,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: shape.delay
                  }}
                />
              );
            })}
              </div>

{/* Contenido principal: contrato + botón */}
              <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 pb-12 pt-8 md:pt-12">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="max-w-3xl md:max-w-4xl w-full space-y-8 md:space-y-10"
                >
                {/* Contrato: diseño fino, conceptos básicos Move Crew */}
              <motion.div
                variants={itemVariants}
                className="relative"
              >
                <div className="absolute -inset-px bg-palette-teal/5 rounded-xl" />
                <div className="relative bg-palette-cream/98 backdrop-blur-sm rounded-xl md:rounded-2xl border border-palette-stone/15 p-6 md:p-10 lg:p-12 shadow-[0_2px_16px_rgba(20,20,17,0.04)]">
                  <div ref={textContainerRef} className="space-y-6 md:space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {/* Introducción */}
                    <motion.div
                      variants={textRevealVariants}
                      className="space-y-4"
                    >
                      <p className="text-xl md:text-2xl leading-relaxed text-palette-ink font-medium font-montserrat tracking-tight">
                        Contrato
                      </p>
                      <p className="text-base md:text-lg leading-relaxed text-palette-stone font-light font-montserrat">
                        Movimiento, fuerza y libertad. Acá tenés lo esencial:
                      </p>
                    </motion.div>

                    {/* Conceptos básicos */}
                    <motion.div
                      variants={textRevealVariants}
                      className="space-y-4 pt-5 border-t border-palette-stone/10"
                    >
                      <p className="text-sm md:text-base font-semibold text-palette-teal uppercase tracking-widest mb-4 font-montserrat">
                        Qué tenés
                      </p>
                      <div className="space-y-4">
                        {[
                          {
                            title: 'Biblioteca',
                            text: 'Clases y programas cuando quieras.'
                          },
                          {
                            title: 'Telegram',
                            text: 'La Crew: soporte, avisos y comunidad.'
                          },
                          {
                            title: 'Contenido nuevo cada semana',
                            text: 'Tu ruta semanal. Una vez que aceptes, entrás y empezás a sumar U.C. para canjear por programas, material o lo que vayamos creando.'
                          }
                        ].map((item, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1 + index * 0.15 }}
                            className="flex gap-4 group"
                          >
                            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-palette-teal/15 border border-palette-teal/30 flex items-center justify-center mt-0.5">
                              <div className="w-2 h-2 rounded-full bg-palette-teal" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-palette-ink text-base md:text-lg font-montserrat">{item.title}</h3>
                              <p className="text-palette-stone text-sm md:text-base leading-relaxed font-montserrat">{item.text}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>

                    {/* Cierre */}
                    <motion.div
                      variants={textRevealVariants}
                      className="pt-5 border-t border-palette-stone/10"
                    >
                      <p className="text-base md:text-lg leading-relaxed text-palette-stone font-light font-montserrat">
                        Simple y sostenible. <span className="font-medium text-palette-ink">Hecho para tu día a día.</span>
                      </p>
                      <p className="text-base md:text-lg text-palette-ink font-medium mt-5 font-montserrat">
                        Cuando estés listo, aceptá abajo.
                      </p>
                      <p className="text-sm text-palette-stone/80 mt-6 font-montserrat">
                        — Mateo.Move
                      </p>
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* Botón de Aceptación */}
              <motion.div
                variants={itemVariants}
                className="flex flex-col items-center space-y-4 pt-2"
              >
                <AnimatePresence mode="wait">
                  {!buttonEnabled && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="text-center space-y-1"
                    >
                      <div className="flex flex-col items-center justify-center gap-1 text-palette-stone text-xs md:text-sm font-montserrat">
                        <LockClosedIcon className="h-3.5 w-3.5 text-palette-teal" />
                        <span>
                          {!textScrolled
                            ? 'Desplazá hasta el final del texto'
                            : '✓ Listo'
                          }
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  onClick={handleAccept}
                  disabled={!buttonEnabled || loading}
                  className={`
                    relative px-10 py-5 rounded-2xl font-semibold text-lg md:text-xl font-montserrat uppercase tracking-[0.2em]
                    transition-all duration-500 overflow-hidden
                    ${buttonEnabled && !loading
                      ? 'bg-palette-ink text-palette-cream border-2 border-palette-ink cursor-pointer shadow-[0_4px_24px_rgba(20,20,17,0.12)] hover:bg-palette-teal hover:border-palette-teal'
                      : 'bg-palette-stone/10 text-palette-stone/60 cursor-not-allowed border-2 border-palette-stone/25'
                    }
                    flex items-center gap-3 min-w-[280px] justify-center
                  `}
                  whileHover={buttonEnabled && !loading ? { 
                    scale: 1.02,
                    boxShadow: "0 8px 32px rgba(7, 70, 71, 0.2)"
                  } : {}}
                  whileTap={buttonEnabled && !loading ? { scale: 0.98 } : {}}
                >
                  {/* Efecto de brillo animado cuando está habilitado */}
                  {buttonEnabled && !loading && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-palette-cream/15 to-transparent"
                      animate={{
                        x: ['-100%', '100%']
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />
                  )}

                  {loading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-6 h-6 border-2 border-palette-cream border-t-transparent rounded-full"
                      />
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <>
                              <span>Empezar en Move Crew</span>
                    </>
                  )}
                </motion.button>
                </motion.div>
              </motion.div>
            </div>
            </div>

            {/* Modal de celebración de primera U.C. */}
                  {/* Renderizar el modal siempre que coherenceData exista, independientemente de showCoherenceModal */}
                  {/* El modal manejará su propia visibilidad con la prop isOpen */}
                  {coherenceData && (
                    <CoherenceCelebrationModal
                      isOpen={showCoherenceModal}
                      onClose={handleCloseCoherenceModal}
                      ucsOtorgadas={coherenceData.ucsOtorgadas}
                      totalUnits={coherenceData.totalUnits}
                      currentStreak={coherenceData.currentStreak}
                      esSemanaAdicional={false}
                      newAchievements={[]}
                      levelUp={false}
                      evolution={false}
                      isFirstTime={true}
                    />
                  )}

                  {/* Overlay de loading durante la redirección */}
                  <AnimatePresence>
                    {isRedirecting && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-[9999] flex items-center justify-center bg-palette-deep-teal/95 backdrop-blur-md"
                      >
                        <div className="flex flex-col items-center gap-6">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-16 h-16 border-4 border-palette-stone/30 border-t-palette-teal rounded-full"
                          />
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-center"
                          >
                            <h3 className="text-2xl font-bold text-palette-cream font-montserrat mb-2">
                              Redirigiendo...
                            </h3>
                            <p className="text-palette-stone font-montserrat text-sm">
                              Preparando tu experiencia en Move Crew
                            </p>
                          </motion.div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Estilos para scrollbar personalizado y reproductor Vimeo */}
                  <style jsx global>{`
                    .custom-scrollbar::-webkit-scrollbar {
                      width: 8px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                      background: rgba(120, 120, 103, 0.1);
                      border-radius: 10px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                      background: rgba(7, 70, 71, 0.25);
                      border-radius: 10px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                      background: rgba(7, 70, 71, 0.4);
                    }
                    
                    /* El SDK de Vimeo pone paddingBottom en el div contenedor (spacechange), eso deja el video "muy arriba". Anulamos todo padding. */
                    .vimeo-player-container > div {
                      padding: 0 !important;
                      padding-bottom: 0 !important;
                      margin: 0 !important;
                      box-sizing: border-box !important;
                    }
                    /* Iframe de Vimeo: cover del contenedor (como Index), sin padding/margin */
                    .vimeo-player-container :global(iframe) {
                      position: absolute !important;
                      top: 0 !important;
                      left: 0 !important;
                      width: 100% !important;
                      height: 100% !important;
                      margin: 0 !important;
                      padding: 0 !important;
                      border: none !important;
                      display: block !important;
                      /* Que los clics pasen al botón de play; el body/UI del iframe queda por encima visualmente pero no captura eventos */
                      pointer-events: none !important;
                    }
                    
                    /* El iframe siempre con pointer-events: none para que nuestro botón play/pause reciba los clics */
                    
                    /* Nuestro botón siempre recibe clics */
                    .vimeo-player-container button {
                      pointer-events: auto !important;
                    }
                    
                    /* Ocultar controles de Vimeo usando CSS (si es posible acceder al iframe) */
                    .vimeo-player-container :global(iframe[src*="vimeo"]) {
                      filter: brightness(1);
                    }
                    
                    /* Intentar ocultar subtítulos de Vimeo usando CSS */
                    .vimeo-player-container :global(iframe) {
                      /* Los subtítulos están dentro del iframe, pero podemos intentar ocultarlos */
                    }
                    
                    /* Ocultar cualquier overlay de subtítulos que pueda aparecer */
                    .vimeo-player-container :global(.vp-caption),
                    .vimeo-player-container :global(.vp-subtitle),
                    .vimeo-player-container :global([class*="caption"]),
                    .vimeo-player-container :global([class*="subtitle"]) {
                      display: none !important;
                      visibility: hidden !important;
                      opacity: 0 !important;
                    }
                  `}</style>
          </motion.div>
        )}
      </AnimatePresence>
    </MainSideBar>
  );
}
