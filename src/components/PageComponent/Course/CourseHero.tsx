'use client'
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { PlayIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/solid';
import { PauseIcon } from '@heroicons/react/24/outline';
import Player from '@vimeo/player';
import { useAuth } from '../../../hooks/useAuth';
import { useCursoLanding } from './CursoLandingContext';
import { vimeoThumbnailUrl } from '../../../lib/resolveMediaImageUrl';
import { userHasPurchasedCourseBySlug } from '../../../lib/clientCourseAccess';
import { landingCtaUniformGhost, landingCtaUniformPrimary } from '../../../constants/landingSectionDesign';
import { trackCursoLandingEvent } from '../../../lib/cursoLandingAnalytics';
const CourseHero = () => {
  const router = useRouter();
  const auth = useAuth();
  const { cursoConfig, productName, slug, checkoutStartPath, scrollToSection } = useCursoLanding();
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
  const stageRef = useRef<HTMLDivElement>(null);
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

  const yaEsAlumno = userHasPurchasedCourseBySlug(auth.user, slug);

  const handleButtonClick = () => {
    if (yaEsAlumno) {
      router.push(cursoConfig.hero.rutaUsuarioSuscriptor || '/biblioteca');
      return;
    }
    trackCursoLandingEvent('curso_inscripcion_click', { slug });
    router.push(checkoutStartPath);
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

  const fitPlayerToStage = () => {
    const stage = stageRef.current;
    const playerEl = videoRef.current;
    if (!stage || !playerEl) return;
    const { width, height } = stage.getBoundingClientRect();
    if (width < 2 || height < 2) return;
    let coverW = Math.ceil(Math.max(width, (height * 16) / 9));
    let coverH = Math.ceil((coverW * 9) / 16);
    if (coverH < height) {
      coverH = Math.ceil(height);
      coverW = Math.ceil((coverH * 16) / 9);
    }
    playerEl.style.width = `${coverW}px`;
    playerEl.style.height = `${coverH}px`;
    playerEl.style.padding = '0';
    const iframe = playerEl.querySelector('iframe');
    if (iframe) {
      iframe.style.position = 'absolute';
      iframe.style.top = '0';
      iframe.style.left = '0';
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.maxWidth = 'none';
    }
  };

  useEffect(() => {
    if (!isPlaying || !tokenLoaded || !videoRef.current) return;

    fitPlayerToStage();
    const stage = stageRef.current;
    const observer = stage ? new ResizeObserver(() => fitPlayerToStage()) : null;
    if (stage && observer) observer.observe(stage);

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

    const handleReady = () => {
      fitPlayerToStage();
      setIsLoaded(true);
    };
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
      observer?.disconnect();
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
  const eyebrow = cursoConfig.hero.eyebrow?.trim();
  const ctaLabel = yaEsAlumno
    ? 'Entrar a la escuela'
    : cursoConfig.hero.ctaTexto?.trim() || 'Quiero sumarme';
  const bannerButton = 'w-full sm:w-auto sm:min-w-[18rem]';

  return (
    <section className="relative flex w-full flex-col bg-palette-cream font-montserrat">
      <div className="mx-auto flex w-[90%] max-w-6xl flex-col px-3 pb-12 pt-24 sm:px-4 md:pb-16 md:pt-28">
        <div className="max-w-4xl text-left">
          {eyebrow ? (
            <p className="font-montserrat text-[11px] font-semibold uppercase tracking-[0.22em] text-palette-ink md:text-xs">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-3 max-w-[12em] text-balance text-[2.4rem] font-bold leading-[1.02] tracking-tight text-palette-ink sm:text-[3rem] md:mt-4 md:text-[3.75rem] lg:text-[4.35rem]">
            {tagline}
          </h1>
          {cursoConfig.hero.ctaSubcopy ? (
            <p className="mt-4 max-w-2xl text-[17px] font-normal leading-relaxed text-palette-ink md:mt-5 md:text-[1.15rem] lg:text-[1.25rem]">
              {cursoConfig.hero.ctaSubcopy}
            </p>
          ) : null}
          <div className="mt-6 flex flex-col items-stretch gap-3 sm:mt-7 sm:flex-row sm:items-center">
            <button type="button" onClick={handleButtonClick} className={`${landingCtaUniformPrimary} ${bannerButton}`}>
              <span>{ctaLabel}</span>
              <span className="opacity-80 transition-transform duration-200 group-hover:translate-x-0.5">→</span>
            </button>
            {!yaEsAlumno ? (
              <button
                type="button"
                onClick={() => scrollToSection('como-se-vive')}
                className={`${landingCtaUniformGhost} ${bannerButton}`}
              >
                Conocer cómo funciona
              </button>
            ) : null}
          </div>
        </div>

        <div className="relative mt-8 aspect-video max-h-[38vh] w-full overflow-hidden rounded-2xl bg-black shadow-[0_22px_55px_rgba(20,20,17,0.09)] ring-1 ring-palette-stone/20 md:mt-10 md:max-h-[min(46vh,520px)] md:rounded-3xl">
          <div className="absolute inset-0">
            {!isPlaying ? (
              <>
                {/* Loading del thumbnail: evita banner vacío hasta que cargue la imagen */}
                {!thumbnailLoaded && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-black">
                    <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-2 border-white/30 border-t-white" />
                  </div>
                )}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute inset-0">
                    <img
                      src={thumbnailUrl || vimeoThumbnailUrl(videoId, 1280)}
                      alt={`Preview de sesión ${productName}`}
                      className="h-full w-full object-cover object-[center_top]"
                      fetchPriority="high"
                      decoding="async"
                      onLoad={() => setThumbnailLoaded(true)}
                      onError={(e) => {
                        setThumbnailLoaded(true);
                        const el = e.target as HTMLImageElement;
                        if (thumbnailUrl && el.src === thumbnailUrl) {
                          el.src = vimeoThumbnailUrl(videoId, 1280);
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
                <div ref={stageRef} className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
                  <div ref={videoRef} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
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
      </div>
    </section>
  );
};

export default CourseHero;
