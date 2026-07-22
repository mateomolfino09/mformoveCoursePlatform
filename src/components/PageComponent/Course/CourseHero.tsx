'use client'
import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { PlayIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/solid';
import { PauseIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import Player from '@vimeo/player';
import { useAuth } from '../../../hooks/useAuth';
import { useCursoLanding } from './CursoLandingContext';

const CourseHero = () => {
  const router = useRouter();
  const auth = useAuth();
  const { cursoConfig, productName, scrollToPlans } = useCursoLanding();
  const videoId = cursoConfig.hero.videoPresentacionVimeoId;
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [privateToken, setPrivateToken] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [thumbnailLoaded, setThumbnailLoaded] = useState(false);
  const [tokenLoaded, setTokenLoaded] = useState(false);
  const videoRef = useRef<HTMLDivElement>(null);
  const vimeoPlayerRef = useRef<Player | null>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!auth.user) {
      auth.fetchUser();
    }
  }, [auth.user]);

  useEffect(() => {
    const fetchPrivateToken = async () => {
      try {
        const res = await fetch('/api/vimeo/getPrivateToken', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoId }),
        });
        if (res.ok) {
          const data = await res.json();
          setPrivateToken(data.privateToken ?? null);
          if (data.thumbnailUrl) setThumbnailUrl(data.thumbnailUrl);
        }
      } catch (error) {
        console.error('Error obteniendo token privado:', error);
      } finally {
        setTokenLoaded(true);
      }
    };
    fetchPrivateToken();
  }, [videoId]);

  const handleButtonClick = () => {
    if (auth.user?.subscription?.active) {
      router.push(cursoConfig.hero.rutaUsuarioSuscriptor || '/biblioteca');
    } else {
      scrollToPlans();
    }
  };

  const handlePlay = () => setIsPlaying(true);

  const handlePlayPause = async () => {
    const player = vimeoPlayerRef.current;
    if (!player) return;
    try {
      if (isVideoPlaying) {
        await player.pause();
        setIsVideoPlaying(false);
      } else {
        await player.play();
        setIsVideoPlaying(true);
      }
    } catch (err) {
      console.error('Error play/pause:', err);
    }
  };

  const handleMuteToggle = async () => {
    const player = vimeoPlayerRef.current;
    if (!player) return;
    try {
      const newMuted = !isMuted;
      await player.setMuted(newMuted);
      setIsMuted(newMuted);
    } catch (err) {
      console.error('Error mute:', err);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
  };

  useEffect(() => {
    if (!isPlaying || !tokenLoaded || !videoRef.current) return;

    const playerOptions: Record<string, unknown> = {
      autoplay: true,
      controls: false,
      responsive: true,
      playsinline: true,
      title: false,
      byline: false,
      portrait: false,
      background: false,
      keyboard: false,
      pip: false,
    };

    if (privateToken) {
      (playerOptions as { url?: string }).url = `https://player.vimeo.com/video/${videoId}?h=${privateToken}&title=0&byline=0&portrait=0`;
    } else {
      (playerOptions as { url?: string }).url = `https://player.vimeo.com/video/${videoId}?title=0&byline=0&portrait=0`;
    }

    const player = new Player(videoRef.current, playerOptions);
    vimeoPlayerRef.current = player;

    const handleReady = () => setIsLoaded(true);
    const handleError = (err: unknown) => {
      console.error('Error reproductor Vimeo:', err);
      setIsLoaded(true);
    };
    const handlePlayEvent = () => setIsVideoPlaying(true);
    const handlePauseEvent = () => setIsVideoPlaying(false);

    player.on('loaded', handleReady);
    player.on('error', handleError);
    player.on('play', handlePlayEvent);
    player.on('pause', handlePauseEvent);
    player.getMuted().then(setIsMuted).catch(() => {});

    return () => {
      player.off('loaded', handleReady);
      player.off('error', handleError);
      player.off('play', handlePlayEvent);
      player.off('pause', handlePauseEvent);
      vimeoPlayerRef.current = null;
      player.destroy().catch(() => {});
    };
  }, [isPlaying, tokenLoaded, privateToken, videoId]);

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, []);

  const tagline = cursoConfig.hero.tagline;

  return (
    <section
      className="relative w-full min-h-[100vh] flex items-center justify-center font-montserrat bg-palette-cream"
    >
      <div className="text-center flex md:left-[2.3rem] justify-start items-start w-full px-7 absolute top-16 md:top-[3.3rem] right-0">
        <p className="font-raleway text-center text-palette-ink text-lg font-normal leading-tight md:text-left md:text-xl lg:text-[1.15rem] lg:leading-[1.0] mb-1 md:mb-0 md:pt-2 md:shrink-0">
          {tagline}
        </p>
      </div>
      <div className="w-[90%] max-w-6xl mx-auto pt-12 mt-20 pb-10 md:py-6 flex flex-col md:flex-row md:items-start md:gap-10 lg:gap-14 px-3 sm:px-4">

        <div className="w-full min-w-0 order-2 md:order-1 md:flex-1 text-center">
        {/* Contenedor LCP sin opacity:0 — el thumbnail debe ser visible desde el primer paint */}
        <div className="w-full mb-8 rounded-2xl md:rounded-3xl overflow-hidden bg-black shadow-[0_22px_55px_rgba(20,20,17,0.09)] ring-1 ring-palette-stone/20 h-[60vh] md:h-auto md:max-h-[65vh] lg:max-h-[70vh]">
          <div className="relative w-full h-full md:aspect-video md:h-auto">
            {!isPlaying ? (
              <>
                {/* Loading del thumbnail: evita banner vacío hasta que cargue la imagen */}
                {!thumbnailLoaded && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-black">
                    <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-2 border-white/30 border-t-white" />
                  </div>
                )}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute left-1/2 top-0 h-full w-[106.67vh] -translate-x-1/2 md:left-0 md:w-full md:translate-x-0">
                    <img
                      src={thumbnailUrl || `https://vumbnail.com/${videoId}.jpg`}
                      alt={`Preview de sesión ${productName}`}
                      className="w-full h-full object-cover"
                      fetchPriority="high"
                      decoding="async"
                      onLoad={() => setThumbnailLoaded(true)}
                      onError={(e) => {
                        setThumbnailLoaded(true);
                        const el = e.target as HTMLImageElement;
                        if (thumbnailUrl && el.src === thumbnailUrl) {
                          el.src = `https://vumbnail.com/${videoId}.jpg`;
                          el.onerror = () => { el.style.display = 'none'; };
                        } else {
                          el.style.display = 'none';
                        }
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-black/20 to-black/40" />
                  </div>
                </div>
                <button
                  onClick={handlePlay}
                  className="absolute inset-0 flex items-center justify-center group"
                  aria-label="Reproducir video"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/20 rounded-full blur-xl group-hover:bg-white/30 transition-all duration-300 scale-150" />
                    <div className="relative bg-white/95 hover:bg-white text-black p-4 md:p-6 rounded-full shadow-2xl transition-all duration-300 group-hover:scale-110">
                      <PlayIcon className="w-8 h-8 md:w-12 md:h-12 ml-1" />
                    </div>
                  </div>
                </button>
              </>
            ) : (
              <div
                className="absolute inset-0 w-full h-full overflow-hidden"
                onMouseMove={handleMouseMove}
                onMouseLeave={() => {
                  if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
                  setShowControls(false);
                }}
              >
                {/* En móvil: bloque 106.67vh de ancho (16:9 con 60vh) centrado para que el video llene la altura y se recorte */}
                <div className="absolute left-1/2 top-0 z-0 h-full w-[106.67vh] -translate-x-1/2 pointer-events-none md:left-0 md:w-full md:translate-x-0">
                  <div ref={videoRef} className="absolute inset-0 w-full h-full min-h-[300px]" />
                </div>
                {/* Controles siempre visibles, por encima del iframe — en web misma fila y altura para alineación */}
                <div className="absolute bottom-3 md:bottom-6 left-3 right-3 z-[100] flex items-center justify-between md:justify-start md:gap-3 pointer-events-auto">
                  <button
                    onClick={handlePlayPause}
                    onMouseDown={(e) => e.stopPropagation()}
                    aria-label={isVideoPlaying ? 'Pausar' : 'Reproducir'}
                    className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-black/80 hover:bg-black flex items-center justify-center text-white transition-colors shadow-xl border-2 border-white/40 shrink-0"
                  >
                    {isVideoPlaying ? (
                      <PauseIcon className="w-6 h-6 md:w-7 md:h-7" />
                    ) : (
                      <PlayIcon className="w-6 h-6 md:w-7 md:h-7 ml-0.5" />
                    )}
                  </button>
                  <button
                    onClick={handleMuteToggle}
                    onMouseDown={(e) => e.stopPropagation()}
                    aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
                    className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-black/80 hover:bg-black flex items-center justify-center text-white transition-colors shadow-xl border-2 border-white/40 shrink-0"
                  >
                    {isMuted ? (
                      <SpeakerXMarkIcon className="w-5 h-5 md:w-6 md:h-6" />
                    ) : (
                      <SpeakerWaveIcon className="w-5 h-5 md:w-6 md:h-6" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {!isLoaded && isPlaying && (
              <div className="absolute inset-0 z-20 w-full h-full flex items-center justify-center bg-black/90">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-white border-t-transparent" />
              </div>
            )}
          </div>
        </div>
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="mt-2 flex flex-col sm:flex-row gap-3 justify-center"
          >
            <button
              type="button"
              onClick={handleButtonClick}
              className="rounded-full px-6 py-3 bg-palette-ink text-palette-cream border-2 border-palette-ink hover:bg-palette-sage hover:border-palette-sage hover:text-palette-ink transition-all duration-200 font-montserrat font-semibold text-sm uppercase tracking-[0.2em]"
            >
              {cursoConfig.hero.ctaTexto}
            </button>
          </motion.div>
          <p className="mc-text-depth-light mt-4 font-montserrat text-base md:text-lg text-palette-ink/90 font-light leading-relaxed">
            {cursoConfig.hero.ctaSubcopy}
          </p>
        </div>
        </div>
      </div>
    </section>
  );
};

export default CourseHero;
