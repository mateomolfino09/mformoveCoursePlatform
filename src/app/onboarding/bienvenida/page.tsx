'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { CheckCircleIcon, LockClosedIcon, SparklesIcon, PlayIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import Player from '@vimeo/player';
import imageLoader from '../../../../imageLoader';
import CoherenceCelebrationModal from '../../../components/PageComponent/Bitacora/CoherenceCelebrationModal';
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
  const [showCoherenceModal, setShowCoherenceModal] = useState(false);
  const [coherenceData, setCoherenceData] = useState<{
    ucsOtorgadas: number;
    totalUnits: number;
    currentStreak: number;
  } | null>(null);
  const videoRef = useRef<HTMLDivElement>(null);
  const vimeoPlayerRef = useRef<Player | null>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const VIMEO_VIDEO_ID = 1106601666; // ID extraído de la URL de Vimeo
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Efectos de parallax
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Inicializar reproductor de Vimeo y verificar progreso (95%)
  useEffect(() => {
    // Esperar a que el componente esté visible antes de inicializar
    if (!isVisible || !videoRef.current) return;

    // Pequeño delay para asegurar que el DOM esté completamente renderizado
    const timer = setTimeout(() => {
      if (!videoRef.current) return;

      try {
        const player = new Player(videoRef.current, {
          id: VIMEO_VIDEO_ID,
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
        });

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
        };

        // Evento cuando el video está listo
        const handleReady = () => {
          // Reproductor Vimeo listo
        };

        // Eventos de play/pause para ocultar controles cuando está reproduciendo
        const handlePlay = () => {
          setIsPlaying(true);
          // Agregar clase para ocultar controles cuando está reproduciendo
          if (videoRef.current?.parentElement) {
            videoRef.current.parentElement.classList.add('playing');
          }
        };

        const handlePause = () => {
          setIsPlaying(false);
          // Remover clase para mostrar controles cuando está pausado
          if (videoRef.current?.parentElement) {
            videoRef.current.parentElement.classList.remove('playing');
          }
        };

        player.on('timeupdate', handleTimeUpdate);
        player.on('ended', handleEnded);
        player.on('error', handleError);
        player.on('ready', handleReady);
        player.on('play', handlePlay);
        player.on('pause', handlePause);

        return () => {
          player.off('timeupdate', handleTimeUpdate);
          player.off('ended', handleEnded);
          player.off('error', handleError);
          player.off('ready', handleReady);
          player.off('play', handlePlay);
          player.off('pause', handlePause);
          player.destroy().catch((err) => console.error('Error al destruir reproductor:', err));
        };
      } catch (error) {
        console.error('Error inicializando reproductor Vimeo:', error);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (vimeoPlayerRef.current) {
        vimeoPlayerRef.current.destroy().catch((err) => console.error('Error al destruir reproductor:', err));
      }
    };
  }, [isVisible]);

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

  // Habilitar botón cuando ambas condiciones se cumplan
  useEffect(() => {
    if (videoProgress >= 95 && textScrolled) {
      setButtonEnabled(true);
    } else {
      setButtonEnabled(false);
    }
  }, [videoProgress, textScrolled]);

  const handlePlayClick = async () => {
    if (vimeoPlayerRef.current) {
      try {
        await vimeoPlayerRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error('Error al reproducir video:', error);
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
        
        console.log('📋 [ACCEPT CONTRACT] Respuesta del servidor:', data);
        
        setLoading(false);
        
        // Mostrar el modal si:
        // 1. Se otorgó una U.C. (ucOtorgada === true), O
        // 2. Es la primera vez que acepta el contrato (esPrimeraVez === true)
        // Esto asegura que el usuario vea el modal explicativo incluso si ya tiene U.C. de otras fuentes
        const debeMostrarModal = (data.ucOtorgada === true || data.esPrimeraVez === true) && 
                                  data.totalUnits !== undefined && 
                                  data.totalUnits !== null;
        
        if (debeMostrarModal) {
          console.log('✅ [ACCEPT CONTRACT] Mostrando modal de U.C. (primera vez o U.C. otorgada)');
          setCoherenceData({
            ucsOtorgadas: data.ucOtorgada ? 1 : 0, // Mostrar 0 si no se otorgó nueva U.C.
            totalUnits: data.totalUnits,
            currentStreak: 0
          });
          setShowCoherenceModal(true);
          console.log('✅ [ACCEPT CONTRACT] showCoherenceModal establecido a true');
          // NO refrescar el usuario aquí para evitar que OnboardingChecker redirija
          // El usuario se refrescará cuando se cierre el modal en handleCloseCoherenceModal
        } else {
          console.log('⚠️ [ACCEPT CONTRACT] No es primera vez y no se otorgó U.C. Redirigiendo directamente.');
          // Si no es primera vez y no se otorgó U.C., refrescar usuario y redirigir directamente
          await auth.fetchUser();
          setIsVisible(false);
          setTimeout(() => {
            router.push('/home');
          }, 500);
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
    setIsVisible(false);
    setTimeout(() => {
      router.push('/home');
    }, 500);
  };


  // Función para generar números pseudoaleatorios consistentes
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  // Generar datos fijos para todas las figuras geométricas (una sola vez)
  const geometricShapes = useMemo(() => {
    // Colores del botón MoveCrewHero: amber, orange, rose
    const baseColors = [
      { r: 245, g: 158, b: 11 },   // amber-500 #F59E0B
      { r: 251, g: 191, b: 36 },   // amber-400 #FBBF24
      { r: 249, g: 115, b: 22 },   // orange-500 #F97316
      { r: 251, g: 146, b: 60 },   // orange-400 #FB923C
      { r: 244, g: 63, b: 94 },    // rose-500 #F43F5E
      { r: 251, g: 113, b: 133 },  // rose-400 #FB7185
    ];

    // Círculos - cantidad optimizada: 18 figuras
    const circles = Array.from({ length: 18 }, (_, i) => {
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

    // Triángulos - cantidad optimizada: 24 figuras
    const triangles = Array.from({ length: 24 }, (_, i) => {
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

    // Hexágonos - cantidad optimizada: 15 figuras
    const hexagons = Array.from({ length: 15 }, (_, i) => {
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

  // Formas orgánicas flotantes - más pequeñas, colores amber/orange/rose
  const organicShapes = useMemo(() => {
    const colors = [
      { r: 245, g: 158, b: 11 },   // amber-500
      { r: 251, g: 191, b: 36 },   // amber-400
      { r: 249, g: 115, b: 22 },   // orange-500
      { r: 251, g: 146, b: 60 },   // orange-400
      { r: 244, g: 63, b: 94 },    // rose-500
      { r: 251, g: 113, b: 133 },  // rose-400
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

  // Partículas de energía - más pequeñas, colores amber/orange/rose
  const particles = useMemo(() => {
    const colors = ['#F59E0B', '#FBBF24', '#F97316', '#FB923C', '#F43F5E', '#FB7185']; // amber, orange, rose
    
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
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5 } }}
          className="min-h-screen bg-gradient-to-br from-[#f5f8ff] via-[#e4edff] to-[#4b6fa5] text-white font-montserrat relative overflow-hidden"
        >
          {/* Background Effects - Movimiento Orgánico */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Base gradient con colores Move Crew */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#f6f9ff] via-[#e7f0ff] to-[#4d71a8]" />
            
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
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.15" />
                  <stop offset="50%" stopColor="#F97316" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#F43F5E" stopOpacity="0.15" />
                </linearGradient>
                <linearGradient id="waveGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.2" />
                  <stop offset="50%" stopColor="#FB923C" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#FB7185" stopOpacity="0.15" />
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
                        <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.3" />
                        <stop offset="50%" stopColor="#F97316" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#F43F5E" stopOpacity="0.1" />
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
                  background: `linear-gradient(90deg, transparent, rgba(245, 158, 11, 0.4), transparent)`,
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

            {/* Grid pattern sutil con colores amber/orange/rose */}
            <div 
              className="absolute inset-0 opacity-[0.02]"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(245, 158, 11, 0.3) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(249, 115, 22, 0.3) 1px, transparent 1px)
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
                  opacity: [0.5, 0.8, 0.6, 0.5],
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
                  opacity: [0.4, 0.7, 0.5, 0.4],
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
                  opacity: [0.35, 0.65, 0.45, 0.35],
                }}
                transition={{
                  duration: shape.duration,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: shape.delay
                }}
              />
            ))}

            {/* Figuras geométricas más grandes y lentas para profundidad - colores amber/orange/rose */}
            {largeShapes.map((shape, i) => {
              const colors = [
                { r: 245, g: 158, b: 11 },   // amber-500
                { r: 251, g: 191, b: 36 },   // amber-400
                { r: 249, g: 115, b: 22 },   // orange-500
                { r: 251, g: 146, b: 60 },   // orange-400
                { r: 244, g: 63, b: 94 },    // rose-500
                { r: 251, g: 113, b: 133 },  // rose-400
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

          {/* Logo MForMove - Sin acción */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative z-10 w-full flex  justify-center pt-8 md:pt-12"
          >
            <Image
              alt="MForMove logo"
              src="/images/MFORMOVE_v2.negro.png"
              width={180}
              height={180}
              className="object-contain w-16 md:w-24 md:h-24 lg:w-30 lg:h-30 h-16 opacity-100"
              priority
              loader={imageLoader}
            />
          </motion.div>

          {/* Contenido principal */}
          <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 pb-12 pt-3">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="max-w-5xl w-full space-y-8 md:space-y-12"
            >
              {/* Header con animación */}
              <motion.div variants={itemVariants} className="text-center space-y-4">
                <motion.div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 border border-slate-200 text-slate-700 backdrop-blur mb-2 shadow-sm"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                >
                  <SparklesIcon className="h-4 w-4 text-slate-700" />
                  <span className="text-xs uppercase tracking-wider text-slate-700">Primer Círculo</span>
                </motion.div>

                <motion.h1
                  variants={textRevealVariants}
                  className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent leading-10"
                >
                  Bienvenido a la Move Crew
                </motion.h1>

                <motion.p
                  variants={textRevealVariants}
                  className="text-lg md:text-xl text-slate-700 font-light max-w-2xl mx-auto leading-relaxed"
                >
                  Te damos la bienvenida y te explicamos cómo funciona tu nueva plataforma
                </motion.p>
              </motion.div>

              {/* Video Container con efecto glassmorphism */}
              <motion.div
                variants={itemVariants}
                className="relative group"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-white/60 via-slate-100/70 to-sky-100/60 rounded-2xl blur-lg opacity-70 group-hover:opacity-90 transition-opacity duration-500" />
                <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl border border-slate-200 p-2 md:p-4 shadow-xl">
                  <div className={`rounded-xl overflow-hidden bg-white relative w-full vimeo-player-container ${isPlaying ? 'playing' : ''}`} style={{ aspectRatio: '16/9' }}>
                    <div
                      ref={videoRef}
                      className="w-full h-full absolute inset-0"
                    />
                    {/* Botón de play personalizado */}
                    {!isPlaying && (
                      <motion.button
                        onClick={handlePlayClick}
                        className="absolute inset-0 flex items-center justify-center bg-slate-900/10 hover:bg-slate-900/15 transition-colors z-10 group"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="relative">
                          <div className="absolute inset-0 bg-white/20 rounded-full blur-xl group-hover:bg-white/30 transition-colors" />
                          <div className="relative bg-white/90 rounded-full p-6 md:p-8 group-hover:bg-white transition-colors">
                            <PlayIcon className="h-12 w-12 md:h-16 md:w-16 text-black ml-1" />
                          </div>
                        </div>
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Texto del Contrato con animación de revelado */}
              <motion.div
                variants={itemVariants}
                className="relative"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 rounded-2xl blur-xl opacity-50" />
                <div className="relative bg-black/30 backdrop-blur-2xl rounded-2xl border border-white/10 p-6 md:p-10 lg:p-12">
                  <div ref={textContainerRef} className="space-y-6 md:space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {/* Introducción */}
                    <motion.div
                      variants={textRevealVariants}
                      className="space-y-4"
                    >
                      <p className="text-lg md:text-xl leading-relaxed text-white font-light">
                        ¡Bienvenido a Move Crew!
                      </p>
                      <p className="text-lg md:text-xl leading-relaxed text-white font-light">
                        Acá vas a encontrar todo lo que necesitás para desarrollar fuerza real, dominar tu movilidad y moverte con mayor libertad. Te explicamos cómo funciona tu plataforma:
                      </p>
                    </motion.div>

                    {/* Secciones de Move Crew */}
                    <motion.div
                      variants={textRevealVariants}
                      className="space-y-4 pt-4 border-t border-white/10"
                    >
                      <p className="text-lg md:text-xl font-semibold text-white mb-4">
                        ¿Qué tenés disponible?
                      </p>
                      
                      <div className="space-y-4 text-white">
                        {[
                          {
                            number: '1',
                            title: 'Biblioteca de Movimiento',
                            text: 'Clases on demand y programas listos para seguir cuando quieras. Podés acceder desde ya y explorar todo el contenido disponible.'
                          },
                          {
                            number: '2',
                            title: 'Grupo de Telegram',
                            text: 'Unite a la Crew en Telegram para soporte directo, avisos y novedades. Es tu espacio para hacer preguntas y compartir tu proceso.'
                          },
                          {
                            number: '3',
                            title: 'Camino Base (Opcional)',
                            text: '4 videos fundamentales que te preparan para el Camino del Gorila. Podés saltearla, pero si la completás ganás U.C. (Unidades de Coherencia) que podés canjear después.'
                          },
                          {
                            number: '4',
                            title: 'Camino del Gorila',
                            text: 'Tu ruta semanal guiada con contenido nuevo cada semana. Una vez que aceptes esta bienvenida, ya podés acceder y empezar a sumar U.C. semanalmente.'
                          }
                        ].map((item, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1 + index * 0.2 }}
                            className="flex gap-4 group"
                          >
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-amber-500/70 via-orange-500/70 to-rose-500/70 
          backdrop-blur-md border border-amber-300/40 flex items-center justify-center font-bold text-white text-lg group-hover:scale-110 transition-transform">
                              {item.number}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-white mb-1 text-lg">{item.title}</h3>
                              <p className="text-gray-200 leading-relaxed">{item.text}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>

                    {/* Cómo funciona */}
                    <motion.div
                      variants={textRevealVariants}
                      className="space-y-4 pt-4 border-t border-white/10"
                    >
                      <p className="text-lg md:text-xl font-semibold text-white mb-4">
                        ¿Cómo funciona?
                      </p>
                      <p className="text-lg md:text-xl leading-relaxed text-white font-light">
                        <span className="font-semibold text-white">U.C. (Unidades de Coherencia):</span> Cada vez que completás una práctica del Camino del Gorila, ganás U.C. Idealmente, ganás 2 U.C. por semana (1 por video + 1 por audio). Acumulás U.C. para canjearlas por programas especiales, elementos, material o ropa que vamos creando.
                      </p>
                      <p className="text-lg md:text-xl leading-relaxed text-white font-light mt-4">
                        <span className="font-semibold text-white">Camino Base:</span> Es opcional. Si la completás, ganás U.C. desde el inicio. Si la saltás, podés acceder igual al Camino del Gorila, pero te perdés esas U.C. iniciales.
                      </p>
                    </motion.div>

                    {/* Cierre */}
                    <motion.div
                      variants={textRevealVariants}
                      className="pt-4 border-t border-slate-200"
                    >
                      <p className="text-lg md:text-xl leading-relaxed text-white font-light">
                        Simple, claro y sostenible. <span className="font-semibold text-white">Hecho para acompañar tu día a día.</span>
                      </p>
                      <p className="text-lg md:text-xl leading-relaxed text-white font-semibold mt-4">
                        Cuando estés listo, dale al botón de abajo para empezar.
                      </p>
                      <p className="text-base text-gray-200 mt-6">
                        — Mateo.Move
                      </p>
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* Botón de Aceptación con efectos avanzados */}
              <motion.div
                variants={itemVariants}
                className="flex flex-col items-center space-y-4 pt-4"
              >
                <AnimatePresence mode="wait">
                  {!buttonEnabled && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-center space-y-2"
                    >
                      <div className="flex flex-col items-center justify-center gap-2 text-slate-600 text-sm md:text-base">
                        <LockClosedIcon className="h-4 w-4" />
                        <div className="space-y-1">
                          <span>
                            {videoProgress < 95 
                              ? `Video: ${Math.round(videoProgress)}% completado (necesitas 95%)`
                              : '✓ Video completado'
                            }
                          </span>
                          <span className="block">
                            {!textScrolled 
                              ? 'Desplázate hasta el final del texto de bienvenida'
                              : '✓ Texto leído'
                            }
                          </span>
                        </div>
                      </div>
                      {videoProgress < 95 && (
                        <motion.div
                          className="w-64 h-1 bg-slate-200 rounded-full overflow-hidden mx-auto"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <motion.div
                            className="h-full bg-gradient-to-r from-amber-500 to-orange-600"
                            initial={{ width: '0%' }}
                            animate={{ 
                              width: `${videoProgress}%` 
                            }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                          />
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  onClick={handleAccept}
                  disabled={!buttonEnabled || loading}
                  className={`
                    relative px-10 py-5 rounded-2xl font-semibold text-lg md:text-xl
                    transition-all duration-500 overflow-hidden
                    ${buttonEnabled && !loading
                      ? 'bg-gradient-to-r from-amber-700/40 to-orange-700/40 text-white cursor-pointer shadow-lg shadow-amber-500/20 hover:from-amber-800 hover:to-orange-800'
                      : 'bg-white/5 text-white/30 cursor-not-allowed border border-white/10'
                    }
                    flex items-center gap-3 min-w-[280px] justify-center
                  `}
                  whileHover={buttonEnabled && !loading ? { 
                    scale: 1.05,
                    boxShadow: "0 20px 40px rgba(180, 83, 9, 0.3)"
                  } : {}}
                  whileTap={buttonEnabled && !loading ? { scale: 0.98 } : {}}
                >
                  {/* Efecto de brillo animado cuando está habilitado */}
                  {buttonEnabled && !loading && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
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
                        className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                      />
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <>
                              <CheckCircleIcon className="h-6 w-6" />
                              <span>Empezar en Move Crew</span>
                    </>
                  )}
                </motion.button>
              </motion.div>
            </motion.div>
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
                        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md"
                      >
                        <div className="flex flex-col items-center gap-6">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-16 h-16 border-4 border-amber-300/30 border-t-amber-600 rounded-full"
                          />
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-center"
                          >
                            <h3 className="text-2xl font-bold text-white font-montserrat mb-2">
                              Redirigiendo...
                            </h3>
                            <p className="text-gray-300 font-montserrat text-sm">
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
                      background: rgba(255, 255, 255, 0.05);
                      border-radius: 10px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                      background: rgba(255, 255, 255, 0.2);
                      border-radius: 10px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                      background: rgba(255, 255, 255, 0.3);
                    }
                    
                    /* Ocultar todos los controles de Vimeo excepto el botón de play */
                    .vimeo-player-container :global(iframe) {
                      width: 100% !important;
                      height: 100% !important;
                    }
                    
                    /* Cuando el video está reproduciendo, ocultar controles */
                    .vimeo-player-container.playing :global(iframe) {
                      pointer-events: none;
                    }
                    
                    /* Ocultar controles de Vimeo usando CSS (si es posible acceder al iframe) */
                    .vimeo-player-container :global(iframe[src*="vimeo"]) {
                      filter: brightness(1);
                    }
                  `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
