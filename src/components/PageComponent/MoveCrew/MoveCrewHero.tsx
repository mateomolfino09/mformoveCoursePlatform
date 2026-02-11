'use client'
import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { PlayIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/solid';
import { PauseIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import Player from '@vimeo/player';
import { useAuth } from '../../../hooks/useAuth';

const VIDEO_ID = '1160337707';

const MoveCrewHero = () => {
  const router = useRouter();
  const auth = useAuth();
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
          body: JSON.stringify({ videoId: VIDEO_ID }),
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
  }, []);

  const scrollToPlans = () => {
    const target = document.getElementById('move-crew-plans');
    target?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleButtonClick = () => {
    if (auth.user?.subscription?.active) {
      router.push('/library');
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
      (playerOptions as { url?: string }).url = `https://player.vimeo.com/video/${VIDEO_ID}?h=${privateToken}&title=0&byline=0&portrait=0`;
    } else {
      (playerOptions as { url?: string }).url = `https://player.vimeo.com/video/${VIDEO_ID}?title=0&byline=0&portrait=0`;
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
  }, [isPlaying, tokenLoaded, privateToken]);

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, []);

  const tagline = 'Academia de movimiento. Compromiso. Coherencia. Práctica. Evolución.';

  return (
    <section
      className="relative w-full min-h-[100vh] flex items-center justify-center font-montserrat bg-palette-cream"
    >
      <div className="w-full text-start px-7 absolute top-24 md:top-[1.5rem] md:left-[25rem] md:w-[500px] right-0">
                {/* Tagline: debajo del header en móvil, a la derecha del video en web */}
                <p className="font-montserrat text-start text-palette-ink text-lg md:text-xl leading-relaxed md:text-left mb-6 md:mb-0 order-1 md:order-2 md:max-w-sm lg:max-w-md md:pt-2 md:shrink-0">
          {tagline}
        </p>
      </div>
      <div className="w-[85%] max-w-7xl mx-auto pt-24 mt-20 pb-10 md:py-14 flex flex-col md:flex-row md:items-start md:gap-10 lg:gap-14">

        <div className="w-full min-w-0 order-2 md:order-1 md:flex-1 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="w-full mb-8 rounded-2xl md:rounded-3xl overflow-hidden bg-black shadow-2xl h-[60vh] md:h-auto md:max-h-[65vh] lg:max-h-[70vh]"
        >
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
                      src={thumbnailUrl || `https://vumbnail.com/${VIDEO_ID}.jpg`}
                      alt="Preview de sesión Move Crew"
                      className="w-full h-full object-cover"
                      onLoad={() => setThumbnailLoaded(true)}
                      onError={(e) => {
                        setThumbnailLoaded(true);
                        const el = e.target as HTMLImageElement;
                        if (thumbnailUrl && el.src === thumbnailUrl) {
                          el.src = `https://vumbnail.com/${VIDEO_ID}.jpg`;
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
                {/* Controles siempre visibles, por encima del iframe */}
                <div className="absolute bottom-3 md:bottom-24  left-3 z-[100] flex items-center justify-center pointer-events-auto">
                  <button
                    onClick={handlePlayPause}
                    onMouseDown={(e) => e.stopPropagation()}
                    aria-label={isVideoPlaying ? 'Pausar' : 'Reproducir'}
                    className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-black/80 hover:bg-black flex items-center justify-center text-white transition-colors shadow-xl border-2 border-white/40"
                  >
                    {isVideoPlaying ? (
                      <PauseIcon className="w-7 h-7 md:w-8 md:h-8" />
                    ) : (
                      <PlayIcon className="w-7 h-7 md:w-8 md:h-8 ml-1" />
                    )}
                  </button>
                </div>
                <div className="absolute bottom-3 md:bottom-24 right-3 z-[100] flex items-center justify-center pointer-events-auto">
                  <button
                    onClick={handleMuteToggle}
                    onMouseDown={(e) => e.stopPropagation()}
                    aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
                    className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-black/80 hover:bg-black flex items-center justify-center text-white transition-colors shadow-xl border-2 border-white/40"
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
        </motion.div>
        </div>
      </div>

      {/* Indicador de scroll: icono de mouse centrado abajo */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5">
        <div className="w-6 h-9 rounded-full border-2 border-palette-ink/70 flex justify-center pt-1.5">
          <div className="w-0.5 h-2 rounded-full bg-palette-ink/70 animate-pulse" />
        </div>
        <ChevronDownIcon className="w-5 h-5 text-palette-ink/70 animate-bounce" style={{ animationDuration: '2s' }} />
        <span className="text-[10px] md:text-xs font-montserrat text-palette-stone uppercase tracking-widest">Más información</span>
      </div>
    </section>
  );
};

export default MoveCrewHero;
