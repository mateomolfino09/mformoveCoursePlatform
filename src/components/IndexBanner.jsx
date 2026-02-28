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
import { useAuth } from '../hooks/useAuth';
import { ArrowRightIcon } from '@heroicons/react/24/outline';


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
    
    {/* Título animado con palabras cambiantes */}
    <div 
      className='fixed top-1/3 left-1/2 w-full px-3 md:px-32 md:pt-24 -translate-x-1/2 -translate-y-1/2 z-[100] text-white text-start pointer-events-none flex mt-12 flex-col items-start gap-5'
      style={{ 
        opacity: textOpacity,
        transition: 'opacity 0.3s ease-out'
      }}
    >
      {/* Texto pequeño arriba */}
      <p className='text-base md:text-lg font-light tracking-wider opacity-80 uppercase'>
        Academia de movimiento
      </p>
      
      {/* Título principal con letra más gruesa y sombra */}
      <h1 className='text-7xl md:text-[7rem] font-semibold tracking-wide' style={{ textShadow: '0 2px 12px rgba(0, 0, 0, 0.2), 0 1px 6px rgba(0, 0, 0, 0.3)' }}>
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
                    // Efecto simple pero impactante para "Sentite": desvanecimiento rápido con movimiento
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
                    // Animación normal para otras palabras
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
      
      {/* Botones */}
      <div className='flex flex-row sm:flex-row gap-4 !pt-32 pointer-events-auto'>
        <Link 
          href={(auth.user?.subscription?.active || auth.user?.isVip || auth.user?.rol === 'Admin') ? routes.navegation.membership.library : routes.navegation.membership.moveCrew}
          className='px-8 py-3 bg-white text-black rounded-full font-medium text-sm md:text-base hover:bg-gray-100 transition-all duration-300 transform hover:scale-105'
        >
          {(auth.user?.subscription?.active || auth.user?.isVip || auth.user?.rol === 'Admin') ? 'Biblioteca' : 'Move Crew'}
        </Link>
        <Link 
          href={auth.user ? routes.user.perfil : routes.user.login}
          className='px-8 py-3 border-2 border-white text-white rounded-full font-medium text-sm md:text-base hover:bg-white hover:text-black transition-all duration-300 transform hover:scale-105 flex items-center gap-2'
        >
          {auth.user ? 'Mi Perfil' : 'Iniciar Sesión'}
          <ArrowRightIcon className='w-5 h-5' />
        </Link>
      </div>
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
