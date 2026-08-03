import { useAppDispatch } from '../hooks/useTypeSelector';
import imageLoader from '../../imageLoader';
import state from '../valtio';
import { Video } from 'cloudinary-react';
import { AnimatePresence, motion as m, useAnimation } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSnapshot } from 'valtio';
import Footer from './Footer';
import { CldImage } from 'next-cloudinary';
import Vimeo from '@u-wave/react-vimeo';
import ShimmerBox from './ShimmerBox';
import { routes } from '../constants/routes';
import { MENTORSHIP_APPLY_CTA } from '../constants/mentorshipCta';
import { useAuth } from '../hooks/useAuth';
import { ArrowRightIcon, ChevronDownIcon } from '@heroicons/react/24/outline';


function Banner({ onVideoLoaded }) {
  const dispatch = useAppDispatch();
  const animation = useAnimation();
  const snap = useSnapshot(state);
  const [hasWindow, setHasWindow] = useState(false);
  const router = useRouter();
  const auth = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileToken, setMobileToken] = useState(null);
  const [desktopToken, setDesktopToken] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0); // 0 a 1 continuo según píxeles (0–140px)
  const [currentScrollY, setCurrentScrollY] = useState(0); // Píxeles scrolleados actuales
  const [currentWord, setCurrentWord] = useState(0); // Índice de la palabra actual (0: Movete, 1: Respira, 2: Sentite)
  const [previousWord, setPreviousWord] = useState(0); // Palabra anterior para detectar salida
  const [latestCurso, setLatestCurso] = useState(null);
  const [cursoLoading, setCursoLoading] = useState(true);

  const mobileVideoId = '1023611525';
  const desktopVideoId = '1023607510';

  // Obtener tokens privados para videos UNLISTED
  useEffect(() => {
    const fetchTokens = async () => {
      try {
        // Token para móvil
        const mobileRes = await fetch('/api/vimeo/getPrivateToken', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoId: mobileVideoId }),
        });
        if (mobileRes.ok) {
          const mobileData = await mobileRes.json();
          setMobileToken(mobileData.privateToken);
        }

        // Token para desktop
        const desktopRes = await fetch('/api/vimeo/getPrivateToken', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoId: desktopVideoId }),
        });
        if (desktopRes.ok) {
          const desktopData = await desktopRes.json();
          setDesktopToken(desktopData.privateToken);
        }
      } catch (error) {
        console.error('Error obteniendo tokens privados:', error);
      }
    };

    fetchTokens();
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/product/index-latest-curso', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : { curso: null }))
      .then((data) => {
        if (!cancelled) setLatestCurso(data?.curso ?? null);
      })
      .catch(() => {
        if (!cancelled) setLatestCurso(null);
      })
      .finally(() => {
        if (!cancelled) setCursoLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const hasMemberAccess =
    auth.user?.subscription?.active || auth.user?.isVip || auth.user?.rol === 'Admin';

  const primaryCta = (() => {
    if (!cursoLoading && !latestCurso) {
      return { href: MENTORSHIP_APPLY_CTA.href, label: MENTORSHIP_APPLY_CTA.label };
    }
    if (latestCurso?.slug) {
      return {
        href: routes.navegation.membership.curso(latestCurso.slug),
        label: 'Cuerpo autónomo',
      };
    }
    return { href: routes.navegation.membership.moveCrew, label: 'Cuerpo autónomo' };
  })();

  useEffect(() => {
    // Asegúrate de que la biblioteca de Vimeo se cargue solo en el lado del cliente
    const script = document.createElement('script');
    script.src = 'https://player.vimeo.com/api/player.js';
    script.async = true;
    document.body.appendChild(script);

    const handleResize = () => setIsMobile(window.innerWidth <= 768); // Ajusta el ancho según tus necesidades
    handleResize();
    window.addEventListener('resize', handleResize);

    if (typeof window !== 'undefined') {
      setHasWindow(true);
    }

    // Progreso continuo 0→1 según píxeles (0–140px): efecto fluido sin saltos entre etapas
    const maxScrollPx = 140;
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 0);
      setCurrentScrollY(scrollY);
      const progress = Math.min(1, scrollY / maxScrollPx);
      setScrollProgress(progress);
    };

    // Verificar el estado inicial
    handleScroll();
    
    // Throttle simple para el scroll
    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', throttledHandleScroll, { passive: true });

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', throttledHandleScroll);
    };
  }, []);

  useEffect(() => {
    if (!snap.volumeModal) {
      animation.start({
        color: '#d1cfcf6e',
        transition: {
          type: 'just',
          damping: 5,
          stiffness: 40,
          restDelta: 0.001,
          duration: 1
        }
      });
    }
  }, [snap.volumeModal]);

  // Cambiar la palabra cada 3 segundos
  useEffect(() => {
    const words = ['Movete', 'Respira', 'Sentite'];
    const interval = setInterval(() => {
      setCurrentWord((prev) => {
        setPreviousWord(prev); // Guardar la palabra anterior antes de cambiar
        return (prev + 1) % words.length;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);


  const handleLoad = () => {
    setIsLoading(false); // Cambia el estado cuando el iframe termina de cargar
    onVideoLoaded?.(); // Notificar al Index para quitar el skeleton
  };

  // Construir URLs con tokens privados si están disponibles
  const getMobileIframeUrl = () => {
    let url = `https://player.vimeo.com/video/${mobileVideoId}?autoplay=1&loop=1&background=1&muted=1&preload=auto`;
    if (mobileToken) {
      url += `&h=${mobileToken}`;
    }
    return url;
  };

  const getDesktopIframeUrl = () => {
    let url = `https://player.vimeo.com/video/${desktopVideoId}?autoplay=1&loop=1&background=1&muted=1&preload=auto`;
    if (desktopToken) {
      url += `&h=${desktopToken}`;
    }
    return url;
  };

  // Interpolación continua: wrapper en PX para que el espacio en pantalla se achique de verdad (sin scale en wrapper)
  const lerp = (a, b, t) => a + (b - a) * t;
  const getVideoStyles = () => {
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;

    let borderRadius, scale, wrapperWidthPx, wrapperHeightPx;

    const endWidthPx = viewportWidth * 0.90;
    const endHeightPx = viewportHeight * 0.80;

    if (isMobile) {
      borderRadius = lerp(0, 32, scrollProgress);
      scale = lerp(2.3, 1.6, scrollProgress);
      wrapperWidthPx = lerp(viewportWidth, endWidthPx, scrollProgress);
      wrapperHeightPx = lerp(viewportHeight, endHeightPx, scrollProgress);
    } else {
      borderRadius = lerp(0, 32, scrollProgress);
      scale = lerp(1.6, 1.4, scrollProgress);
      wrapperWidthPx = lerp(viewportWidth, endWidthPx, scrollProgress);
      wrapperHeightPx = lerp(viewportHeight, endHeightPx, scrollProgress);
    }

    // Wrapper con tamaño en PX que achica de verdad; solo translate (no scale) para que el layout = lo que se ve
    const wrapperStyles = {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: `${wrapperWidthPx}px`,
      height: `${wrapperHeightPx}px`,
      borderRadius: `${borderRadius}px`,
      overflow: 'hidden',
      zIndex: 2,
    };

    // Scale en el iframe para el zoom; el wrapper recorta → borderRadius se ve bien
    const iframeStyles = {
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: '100%',
      height: '100%',
      transform: `translate(-50%, -50%) scale(${scale})`,
      transformOrigin: 'center center',
      display: 'block',
      border: 'none',
    };
    return { wrapperStyles, iframeStyles };
  };

  const { wrapperStyles, iframeStyles } = getVideoStyles();
  
  // Texto desaparece al llegar al 50% de progreso (0→0.5 = opacidad 1→0)
  const textOpacity = scrollProgress <= 0.5 ? 1 - scrollProgress / 0.5 : 0;

  const words = ['Movete', 'Respira', 'Sentite'];

  return (
    <>
    
    {/* Título a ~1/4 de pantalla (más presencia) */}
    <div 
      className='fixed top-[22%] left-1/2 z-[100] flex w-full max-w-[100vw] -translate-x-1/2 flex-col items-stretch gap-2.5 px-4 pointer-events-none text-start text-white md:top-[28%] md:items-start md:gap-4 md:px-32'
      style={{ 
        opacity: textOpacity,
        transition: 'opacity 0.3s ease-out'
      }}
    >
      <p className='text-sm font-light uppercase tracking-[0.2em] text-white/90 md:text-lg md:tracking-wider'>
        Academia de movimiento
      </p>
      
      <h1
        className='text-[3.1rem] font-bold leading-[1.02] tracking-wide sm:text-6xl md:text-[7rem] md:font-semibold'
        style={{ textShadow: '0 2px 20px rgba(0, 0, 0, 0.45), 0 1px 8px rgba(0, 0, 0, 0.35)' }}
      >
        <span className='inline-block'>
          <AnimatePresence mode="wait" initial={false}>
            {words.map((word, index) => {
              if (index !== currentWord) return null;
              
              return (
                <m.span
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={index === 2 ? 
                    { 
                      opacity: [1, 0.5, 0],
                      y: -40,
                      x: 30,
                      scale: 0.8,
                      transition: { 
                        duration: 0.4,
                        ease: "easeIn"
                      }
                    } : 
                    { 
                      opacity: 0, 
                      y: -20,
                      transition: { duration: 0.5 }
                    }
                  }
                  transition={{ duration: 0.5 }}
                  className='inline-block lg:text-gray-500xl'
                >
                  {word}
                </m.span>
              );
            })}
          </AnimatePresence>
        </span>
        <span className='ml-2'>mejor</span>
      </h1>
    </div>

    {/* Botones debajo del título */}
    <div
      className='pointer-events-none fixed left-1/2 top-[42%] z-[100] w-full max-w-[100vw] -translate-x-1/2 px-4 md:top-[52%] md:px-32'
      style={{
        opacity: textOpacity,
        transition: 'opacity 0.3s ease-out',
      }}
    >
      <div className='pointer-events-auto flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:items-center md:gap-4'>
        <Link 
          href={primaryCta.href}
          className='inline-flex w-full items-center justify-center rounded-full bg-white px-5 py-3.5 text-center text-sm font-semibold text-black shadow-[0_8px_24px_-8px_rgba(0,0,0,0.45)] transition-all duration-300 hover:bg-gray-100 active:scale-[0.98] sm:w-auto sm:px-8 md:py-3 md:text-base md:font-medium'
        >
          {cursoLoading ? (
            <span className='flex items-center gap-1' aria-label='Cargando'>
              {[0, 1, 2].map((i) => (
                <m.span
                  key={i}
                  className='h-1.5 w-1.5 rounded-full bg-black'
                  animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
                  transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut', delay: i * 0.15 }}
                />
              ))}
            </span>
          ) : (
            primaryCta.label
          )}
        </Link>
        <Link 
          href={auth.user ? routes.user.perfil : routes.user.login}
          className='inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-white bg-black/20 px-5 py-3.5 text-center text-sm font-semibold text-white backdrop-blur-[2px] transition-all duration-300 hover:bg-white/20 hover:border-white active:scale-[0.98] sm:w-auto sm:px-8 md:py-3 md:text-base md:font-medium'
        >
          {auth.user ? 'Mi Perfil' : 'Iniciar Sesión'}
          <ArrowRightIcon className='h-4 w-4 shrink-0 md:h-5 md:w-5' />
        </Link>
      </div>
    </div>

    {/* Señal de scroll — solo mobile */}
    <div
      className='pointer-events-none fixed inset-x-0 bottom-5 z-[100] flex flex-col items-center gap-1 md:hidden'
      style={{
        opacity: textOpacity > 0.15 ? textOpacity : 0,
        transition: 'opacity 0.3s ease-out',
      }}
      aria-hidden
    >
      <span className='font-montserrat text-[10px] font-medium uppercase tracking-[0.28em] text-white/75'>
        Deslizá
      </span>
      <m.div
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <ChevronDownIcon className='h-5 w-5 text-white/80' strokeWidth={2} />
      </m.div>
    </div>
    
    <div className='flex flex-col relative' style={{ minHeight: 'calc(100vh + 400px)' }}>
      {/* Contenedor sticky que mantiene el video visible durante el scroll */}
      <div className='sticky top-0 left-0 h-[100vh] w-full overflow-hidden' style={{ marginTop: 0, paddingTop: 0 }}>
        {/* Div de fondo que se muestra cuando hay scroll con opacidad progresiva */}
        {scrollProgress > 0 && (
          <div 
            className='absolute inset-0'
            style={{ 
              backgroundColor: '#FAF8F5',
              opacity: 1,
              zIndex: 1
            }}
          />
        )}
        
        {isLoading && (
          <div className="absolute inset-0" style={{ backgroundColor: '#1A1A1A', zIndex: 0 }}>
            <ShimmerBox className="absolute inset-0 w-full h-full" />
          </div>
        )}

        {isMobile ? (
          <div className="absolute" style={wrapperStyles}>
            <iframe
              src={getMobileIframeUrl()}
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              title="videointroMFM"
              style={iframeStyles}
              onLoad={handleLoad}
            />
          </div>
        ) : (
          <div className="absolute" style={wrapperStyles}>
            <iframe
              src={getDesktopIframeUrl()}
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              title="videointroMFM"
              style={iframeStyles}
              onLoad={handleLoad}
            />
          </div>
        )}
        {/* <Vimeo
          video={"1023607510"}
          muted
          autoplay
          loading="eager"  // Simulación de preload
          loop
          controls={false}
          className='object-cover h-full w-full overflow-hidden'

        /> */}
        {/* <Video
          cloudName={process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}
          publicId='Untitled_phr1ga'
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          controls={false}
          className='object-cover h-full w-full overflow-hidden'
        /> */}
        {/* <CldImage layout='fill'
          alt="" src={"my_uploads/image00014_tqwhm5"} className="object-contain h-full object-top w-full md:object-cover md:object-bottom opacity-80" /> */}
        {/* <Image
          src={'/images/bgIndex2.jpg'}
          className='object-cover h-full w-full md:hidden opacity-40'
          fill
          loader={imageLoader}
        /> */}
      </div>
    </div>

    </>
  );
}

export default Banner;
