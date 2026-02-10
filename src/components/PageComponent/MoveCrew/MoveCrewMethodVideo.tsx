'use client'
import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { PlayIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/solid';
import { PauseIcon } from '@heroicons/react/24/outline';
import Player from '@vimeo/player';
import MoveCrewQuickAccess from './MoveCrewQuickAccess';

const MoveCrewMethodVideo = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [privateToken, setPrivateToken] = useState<string | null>(null);
  const [tokenLoaded, setTokenLoaded] = useState(false);
  const videoRef = useRef<HTMLDivElement>(null);
  const vimeoPlayerRef = useRef<Player | null>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const videoId = '1160222704';

  // Obtener token privado para videos UNLISTED
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
          setPrivateToken(data.privateToken);
        }
      } catch (error) {
        console.error('Error obteniendo token privado:', error);
      } finally {
        setTokenLoaded(true);
      }
    };
    fetchPrivateToken();
  }, [videoId]);

  const handlePlay = () => {
    setIsPlaying(true);
  };

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

  // Montar reproductor Vimeo sin controles (análogo a onboarding/bienvenida contrato)
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

  return (
    <section className="py-12 md:py-20 bg-gray-50 font-montserrat">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mb-8 md:mb-12 text-center md:text-left"
        >
          <p className="uppercase tracking-[0.3em] text-xs md:text-sm text-gray-500 mb-3">El método</p>
          <h2 className="text-3xl md:text-5xl font-bold text-black mb-4">
            Un sistema de Coherencia para habitar tu cuerpo de nuevo
          </h2>
          <p className="text-base md:text-lg text-gray-600 font-light max-w-3xl mx-auto md:mx-0 leading-relaxed">
            Nacimos para colgarnos, lanzar, caminar kilómetros y explorar el suelo. Nuestra biología se forjó en la tracción, en la rotación y en la capacidad de mover nuestro propio peso. Un cuerpo en movimiento conoce, encarna y vive.
          </p>
        </motion.div>

        {/* Video Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="relative w-full rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl bg-black"
        >
          <div className="relative w-full aspect-video">
            {!isPlaying ? (
              <>
                {/* Thumbnail/Poster */}
                <div className="absolute inset-0">
                  <img
                    src={`https://vumbnail.com/${videoId}.jpg`}
                    alt="Preview de sesión Move Crew"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback si no hay thumbnail disponible
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-black/40 to-orange-500/20" />
                </div>

                {/* Play Button */}
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
                className="absolute inset-0 w-full h-full"
                onMouseMove={handleMouseMove}
                onMouseLeave={() => {
                  if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
                  setShowControls(false);
                }}
              >
                <div ref={videoRef} className="w-full h-full min-h-[200px]" />
                {/* Controles overlay: play/pausa (centro) y mute (esquina) */}
                <div
                  className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
                    showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <button
                    onClick={handlePlayPause}
                    onMouseDown={(e) => e.stopPropagation()}
                    aria-label={isVideoPlaying ? 'Pausar' : 'Reproducir'}
                    className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors"
                  >
                    {isVideoPlaying ? (
                      <PauseIcon className="w-7 h-7 md:w-8 md:h-8" />
                    ) : (
                      <PlayIcon className="w-7 h-7 md:w-8 md:h-8 ml-1" />
                    )}
                  </button>
                </div>
                <div
                  className={`absolute bottom-3 right-3 transition-opacity duration-300 ${
                    showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <button
                    onClick={handleMuteToggle}
                    onMouseDown={(e) => e.stopPropagation()}
                    aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
                    className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors"
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
              <div className="absolute inset-0 flex items-center justify-center bg-black">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-white border-t-transparent" />
              </div>
            )}
          </div>
        </motion.div>

        {/* Texto complementario después del video */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-8 md:mt-12 text-center md:text-left max-w-4xl mx-auto md:mx-0"
        >
          <p className="text-base md:text-lg text-gray-700 font-light leading-relaxed mb-4">
            Nunca estuvo tan de moda entrenar como máquinas aisladas: La mayoría de las rutinas ignoran cómo funciona nuestra estructura, sin considerar que el cuerpo responde, se adapta y esa es la base para una vida plena.
          </p>
          <p className="text-base md:text-lg text-gray-800 font-medium leading-relaxed">
            Por eso creé la Move Crew. Volver al origen para recuperar esa fuerza y movilidad que perdimos por el camino.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default MoveCrewMethodVideo;


