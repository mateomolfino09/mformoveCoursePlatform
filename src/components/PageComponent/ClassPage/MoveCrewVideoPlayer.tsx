'use client';

import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import Player from '@vimeo/player';

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** Thumbnail en alta calidad (640w). Alternativas: .jpg default, _medium.jpg 200w, _small.jpg 100w */
const THUMBNAIL_URL = (id: string) => `https://vumbnail.com/${id}_large.jpg`;

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;

interface MoveCrewVideoPlayerProps {
  videoId: string;
  className?: string;
  /** Si es true, no autoplay y el usuario debe dar play (recomendado para páginas de clase) */
  userStartsPlayback?: boolean;
  /** Se llama cuando cambia el estado de reproducción (útil para transiciones de layout) */
  onPlayingChange?: (playing: boolean) => void;
  /** Cuando true, muestra los controles (p. ej. hover en el área de video desde el padre) */
  showControlsFromParent?: boolean;
  /** Se llama cuando el video termina de reproducirse */
  onEnded?: () => void;
  /** Se llama con el progreso (currentTime, duration) para p. ej. botón "Completar clase" en camino semanal */
  onProgress?: (currentTime: number, duration: number) => void;
  /** Tiempo en segundos para sincronizar con el otro reproductor (web/mobile) */
  syncTime?: number;
  /** Si true, este reproductor es el que está reproduciendo y no debe hacer seek al cambiar syncTime */
  isActiveSource?: boolean;
  /** Se llama en cada timeupdate para mantener el tiempo sincronizado en el padre */
  onTimeUpdate?: (seconds: number) => void;
}

export interface MoveCrewVideoPlayerHandle {
  play: () => void;
  pause: () => void;
  /** Ir a un tiempo en segundos (0 = inicio). Útil para reiniciar al completar y evitar que se cuelgue. */
  seekTo: (seconds: number) => void;
  /** Reinicia el video al inicio (seek 0). */
  resetToStart: () => void;
}

const MoveCrewVideoPlayer = forwardRef<MoveCrewVideoPlayerHandle, MoveCrewVideoPlayerProps>(function MoveCrewVideoPlayer({
  videoId,
  className = '',
  userStartsPlayback = true,
  onPlayingChange,
  showControlsFromParent = false,
  onEnded,
  onProgress,
  syncTime = 0,
  isActiveSource = false,
  onTimeUpdate,
}, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const playerRef = useRef<Player | null>(null);
  const [privateToken, setPrivateToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [hiddenByInactivity, setHiddenByInactivity] = useState(false);
  const [showThumbnail, setShowThumbnail] = useState(true);
  const [loading, setLoading] = useState(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [progressHoverTime, setProgressHoverTime] = useState<number | null>(null);
  const [bufferedEnd, setBufferedEnd] = useState(0);
  const progressRef = useRef<HTMLDivElement>(null);
  const volumeSliderRef = useRef<HTMLDivElement>(null);
  const seekTargetRef = useRef<number | null>(null);
  const seekWasPlayingRef = useRef(false);
  const playingRef = useRef(playing);
  playingRef.current = playing;
  const onPlayingChangeRef = useRef(onPlayingChange);
  const onEndedRef = useRef(onEnded);
  const onTimeUpdateRef = useRef(onTimeUpdate);
  const onProgressRef = useRef(onProgress);
  onPlayingChangeRef.current = onPlayingChange;
  onEndedRef.current = onEnded;
  onTimeUpdateRef.current = onTimeUpdate;
  onProgressRef.current = onProgress;

  const INACTIVITY_MS = 3000;
  const hideControlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scheduleHideControlsRef = useRef<() => void>(() => {});

  const scheduleHideControls = useCallback(() => {
    setHiddenByInactivity(false);
    if (hideControlsTimeoutRef.current) clearTimeout(hideControlsTimeoutRef.current);
    // eslint-disable-next-line no-console
    console.log('[MoveCrewVideoPlayer] Timer 3s: iniciado/reiniciado');
    hideControlsTimeoutRef.current = setTimeout(() => {
      // eslint-disable-next-line no-console
      console.log('[MoveCrewVideoPlayer] Timer 3s: ejecutando ocultar controles');
      setShowControls(false);
      setHiddenByInactivity(true);
      wrapRef.current?.style.setProperty('cursor', 'none');
      hideControlsTimeoutRef.current = null;
    }, INACTIVITY_MS);
  }, []);

  scheduleHideControlsRef.current = scheduleHideControls;

  const cancelHideControls = useCallback(() => {
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
      hideControlsTimeoutRef.current = null;
      // eslint-disable-next-line no-console
      console.log('[MoveCrewVideoPlayer] Timer 3s: cancelado');
    }
  }, []);

  useEffect(() => () => cancelHideControls(), [cancelHideControls]);

  // Token para videos unlisted
  useEffect(() => {
    if (!videoId) return;
    let cancelled = false;
    fetch('/api/vimeo/getPrivateToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoId }),
    })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (!cancelled && data?.privateToken) setPrivateToken(data.privateToken); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setReady(true); });
    return () => { cancelled = true; };
  }, [videoId]);

  // Crear iframe a mano (sin controles Vimeo) y conectar SDK
  useEffect(() => {
    if (!containerRef.current || !ready) return;

    const params = new URLSearchParams({
      controls: '0',
      title: '0',
      byline: '0',
      portrait: '0',
      badge: '0',
      dnt: '1',
      transparent: '0',
      preload: 'auto',
    });
    if (privateToken) params.set('h', privateToken);
    const src = `https://player.vimeo.com/video/${videoId}?${params.toString()}`;

    const iframe = document.createElement('iframe');
    iframe.src = src;
    iframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture');
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('playsinline', '');
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.position = 'absolute';
    iframe.style.top = '0';
    iframe.style.left = '0';
    iframe.style.border = 'none';
    containerRef.current.appendChild(iframe);
    iframeRef.current = iframe;

    const player = new Player(iframe);
    playerRef.current = player;

    const updateBuffered = () => {
      player.getBuffered().then((ranges: { start: number; end: number }[]) => {
        if (!ranges?.length) return;
        player.getCurrentTime().then((t) => {
          let end = 0;
          for (const r of ranges) {
            if (r.start <= t && r.end > t) end = Math.max(end, r.end);
          }
          if (end === 0 && ranges[0].start <= 0) end = ranges[0].end;
          setBufferedEnd(end);
        }).catch(() => {});
      }).catch(() => {});
    };

    player.on('loaded', () => {
      player.getDuration().then((d) => setDuration(d)).catch(() => {});
      player.setVolume(1).then(() => { setVolume(1); setMuted(false); }).catch(() => {});
      player.setPlaybackRate(1).then(() => setPlaybackRate(1)).catch(() => {});
      updateBuffered();
    });
    player.on('progress', updateBuffered);
    player.on('timeupdate', (e) => {
      setCurrentTime(e.seconds);
      onTimeUpdateRef.current?.(e.seconds);
      if (seekTargetRef.current != null && Math.abs(e.seconds - seekTargetRef.current) < 0.5) {
        const wasPlaying = seekWasPlayingRef.current;
        seekTargetRef.current = null;
        seekWasPlayingRef.current = false;
        setLoading(false);
        if (wasPlaying) player.play().catch(() => {});
      }
    });
    player.on('play', () => {
      setPlaying(true);
      setLoading(false);
      setShowThumbnail(false);
      onPlayingChangeRef.current?.(true);
      scheduleHideControlsRef.current?.();
    });
    player.on('pause', () => {
      if (seekTargetRef.current != null) return;
      setPlaying(false);
      onPlayingChangeRef.current?.(false);
    });
    player.on('ended', () => {
      setPlaying(false);
      onPlayingChangeRef.current?.(false);
      onEndedRef.current?.();
    });
    player.on('error', (e) => console.error('Vimeo error:', e));

    return () => {
      player.destroy().catch(() => {});
      playerRef.current = null;
      if (iframeRef.current?.parentNode) iframeRef.current.parentNode.removeChild(iframeRef.current);
      iframeRef.current = null;
    };
  }, [videoId, privateToken, ready, userStartsPlayback]);

  // Notificar progreso al padre (p. ej. camino semanal para botón "Completar clase")
  useEffect(() => {
    if (duration > 0) {
      onProgressRef.current?.(currentTime, duration);
    }
  }, [currentTime, duration]);

  // Sincronizar tiempo cuando syncTime cambia (ej. el otro reproductor web/mobile actualizó) y este no es el activo
  useEffect(() => {
    const p = playerRef.current;
    if (!p || !ready || isActiveSource) return;
    if (!Number.isFinite(syncTime) || syncTime < 0) return;
    p.getCurrentTime().then((t) => {
      if (Math.abs(t - syncTime) > 1.5) p.setCurrentTime(syncTime).catch(() => {});
    }).catch(() => {});
  }, [ready, isActiveSource, syncTime]);

  const togglePlay = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    if (playing) {
      p.pause();
    } else {
      setLoading(true);
      p.play().catch(() => setLoading(false));
    }
  }, [playing]);

  const seekToSeconds = useCallback((seconds: number) => {
    const p = playerRef.current;
    if (!p) return;
    const t = Math.max(0, Number.isFinite(seconds) ? seconds : 0);
    seekWasPlayingRef.current = playingRef.current;
    p.pause();
    setPlaying(false);
    setCurrentTime(t);
    seekTargetRef.current = t;
    setLoading(true);
    p.setCurrentTime(t).catch(() => {
      seekTargetRef.current = null;
      seekWasPlayingRef.current = false;
      setLoading(false);
    });
  }, []);

  useImperativeHandle(ref, () => ({
    play: () => {
      const p = playerRef.current;
      if (p && !playing) {
        setLoading(true);
        p.play().catch(() => setLoading(false));
      }
    },
    pause: () => {
      playerRef.current?.pause();
    },
    seekTo: seekToSeconds,
    resetToStart: () => seekToSeconds(0),
  }), [playing, seekToSeconds]);

  const toggleMute = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    const nextMuted = !muted;
    setMuted(nextMuted);
    const v = nextMuted ? 0 : (volume > 0 ? volume : 1);
    setVolume(v);
    p.setVolume(v).catch(() => {});
  }, [muted, volume]);

  const setVolumeFromSlider = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const bar = volumeSliderRef.current;
    const p = playerRef.current;
    if (!bar || !p) return;
    const rect = bar.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const pct = Math.max(0, Math.min(1, x));
    setVolume(pct);
    setMuted(pct === 0);
    p.setVolume(pct).catch(() => {});
  }, []);

  const setSpeed = useCallback((rate: number) => {
    const p = playerRef.current;
    if (!p) return;
    setPlaybackRate(rate);
    setShowSpeedMenu(false);
    p.setPlaybackRate(rate).catch(() => {});
  }, []);

  const seek = useCallback((e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const p = playerRef.current;
    const bar = progressRef.current;
    if (!p || !bar || duration <= 0) return;
    const rect = bar.getBoundingClientRect();
    const clientX = 'touches' in e
      ? (e.changedTouches?.[0] ?? e.touches?.[0])?.clientX
      : (e as React.MouseEvent<HTMLDivElement>).clientX;
    if (clientX == null) return;
    const x = (clientX - rect.left) / rect.width;
    const t = Math.max(0, Math.min(1, x)) * duration;
    seekWasPlayingRef.current = playingRef.current;
    p.pause();
    setPlaying(false);
    setCurrentTime(t);
    seekTargetRef.current = t;
    setLoading(true);
    p.setCurrentTime(t);
  }, [duration]);

  const progressBarMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const bar = progressRef.current;
    if (!bar || duration <= 0) return;
    const rect = bar.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const pct = Math.max(0, Math.min(1, x));
    setProgressHoverTime(pct * duration);
  }, [duration]);

  const progressBarMouseLeave = useCallback(() => {
    setProgressHoverTime(null);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const wrap = containerRef.current?.closest('.movecrew-player-wrap');
    if (!wrap) return;
    if (!document.fullscreenElement) {
      wrap.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, []);

  if (!videoId) return null;

  const wrapRef = useRef<HTMLDivElement>(null);
  const lastMouseRef = useRef({ x: 0, y: 0, over: false });

  const handleShowControls = useCallback(() => {
    // eslint-disable-next-line no-console
    console.log('[MoveCrewVideoPlayer] Controles mostrados, timer reiniciado');
    wrapRef.current?.style.setProperty('cursor', 'pointer');
    setHiddenByInactivity(false);
    setShowControls(true);
    cancelHideControls();
    scheduleHideControls();
    wrapRef.current?.focus({ preventScroll: true });
  }, [cancelHideControls, scheduleHideControls]);

  const updateMousePosition = useCallback((e: { clientX: number; clientY: number }) => {
    lastMouseRef.current = { x: e.clientX, y: e.clientY, over: true };
  }, []);

  // Teclado: Space = play/pause; Flecha izquierda = -10s; Flecha derecha = +10s
  useEffect(() => {
    const wrap = wrapRef.current;
    const onKeyDown = (e: KeyboardEvent) => {
      const active = document.activeElement as HTMLElement | null;
      if (active && ['INPUT', 'TEXTAREA', 'SELECT'].includes(active.tagName)) return;
      if (!wrap) return;
      const activeInside = active && wrap.contains(active);
      const rect = wrap.getBoundingClientRect();
      const { x, y, over } = lastMouseRef.current;
      const mouseOver = over && x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
      if (!activeInside && !mouseOver) return;

      if (e.key === ' ' && !e.repeat) {
        e.preventDefault();
        togglePlay();
        scheduleHideControls();
        return;
      }
      if (e.key === 'ArrowLeft' && !e.repeat) {
        e.preventDefault();
        playerRef.current?.getCurrentTime().then((t) => {
          seekToSeconds(Math.max(0, t - 10));
          scheduleHideControlsRef.current?.();
        }).catch(() => {});
        return;
      }
      if (e.key === 'ArrowRight' && !e.repeat) {
        e.preventDefault();
        playerRef.current?.getCurrentTime().then((t) => {
          const d = duration > 0 ? duration : 9999;
          seekToSeconds(Math.min(d, t + 10));
          scheduleHideControlsRef.current?.();
        }).catch(() => {});
        return;
      }
    };
    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [togglePlay, scheduleHideControls, seekToSeconds, duration]);

  return (
    <div
      ref={wrapRef}
      tabIndex={0}
      role="application"
      aria-label="Reproductor de video"
      className={`movecrew-player-wrap relative w-full aspect-video overflow-hidden bg-palette-ink ring-1 ring-palette-stone/10 shadow-xl outline-none ${!playing || ((showControls || showControlsFromParent) && !hiddenByInactivity) ? 'cursor-pointer' : 'cursor-none'} ${className}`}
      onMouseEnter={(e) => { updateMousePosition(e); handleShowControls(); }}
      onMouseMove={(e) => {
        updateMousePosition(e);
        if (hiddenByInactivity || !showControls) handleShowControls();
        else scheduleHideControls();
      }}
      onMouseLeave={() => { lastMouseRef.current.over = false; }}
      onTouchStart={handleShowControls}
      onTouchMove={() => { if (showControls) scheduleHideControls(); }}
      onKeyDown={(e) => {
        if (e.key === ' ') {
          e.preventDefault();
          togglePlay();
          scheduleHideControls();
        }
      }}
    >
      {/* Contenedor donde se inyecta el iframe de Vimeo (creado a mano, sin controles) */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />

      {/* Overlay transparente sobre el iframe para recibir hover y click: el iframe de Vimeo no propaga eventos al documento. No ocultar al salir del overlay (ej. al ir a la barra) para que el timer de 3 s pueda esconder los controles. */}
      <div
        className="absolute inset-0 z-[8]"
        aria-hidden
        onMouseEnter={(e) => { updateMousePosition(e); handleShowControls(); }}
        onMouseMove={(e) => {
          updateMousePosition(e);
          if (hiddenByInactivity || !showControls) handleShowControls();
          else scheduleHideControls();
        }}
        onClick={(e) => {
          e.stopPropagation();
          wrapRef.current?.focus();
          togglePlay();
          scheduleHideControls();
        }}
        onTouchStart={handleShowControls}
        onTouchMove={() => { if (showControls) scheduleHideControls(); }}
      />

      {/* Thumbnail del video hasta que se da play — evita pantalla negra */}
      {showThumbnail && (
        <div className="absolute inset-0 z-[5] bg-palette-ink">
          <img
            src={THUMBNAIL_URL(videoId)}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Loading: mismo estilo centrado; pointer-events-none para no capturar clics/focus y no abrir sidebar */}
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-palette-ink/50 pointer-events-none" aria-hidden>
          <div className="h-14 w-14 rounded-full border-2 border-palette-cream/30 border-t-palette-cream animate-spin" />
        </div>
      )}

      {/* Overlay para dar play la primera vez (cuando userStartsPlayback) - círculo más pequeño en móvil */}
      {userStartsPlayback && !playing && !loading && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); togglePlay(); scheduleHideControls(); }}
          className="absolute inset-0 z-10 flex items-center justify-center bg-palette-ink/30 transition-colors hover:bg-palette-ink/40 active:bg-palette-ink/40 focus:outline-none focus:ring-2 focus:ring-palette-sage focus:ring-offset-2 focus:ring-offset-palette-ink"
          aria-label="Reproducir"
        >
          <span className="flex h-14 w-14 md:h-20 md:w-20 items-center justify-center rounded-full bg-palette-cream text-palette-ink shadow-xl transition-transform hover:scale-105 active:scale-95">
            <svg className="h-7 w-7 md:h-10 md:w-10 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path d="M8 6v12l8-6-8-6z" />
            </svg>
          </span>
        </button>
      )}

      {/* Barra de controles: 3 s sin actividad y se oculta. Zona de gradiente captura eventos sin resetear el timer; solo progreso y botones resetean. */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-20 flex flex-col justify-end bg-gradient-to-t from-palette-ink/95 to-transparent pt-12 md:pt-20 pb-2 md:pb-3 px-3 md:px-4 transition-opacity duration-200 ease-out pointer-events-none ${(showControls || !playing || showControlsFromParent) && !hiddenByInactivity ? 'opacity-100' : 'opacity-0'}`}
      >
        {/* Capa que cubre toda la barra: captura eventos en la zona de gradiente para que no lleguen al overlay y no reseteen el timer */}
        <div
          className="absolute inset-0"
          style={{ pointerEvents: (showControls || !playing || showControlsFromParent) && !hiddenByInactivity ? 'auto' : 'none' }}
          aria-hidden
        />
        <div
          className="relative z-10 flex flex-col gap-0 w-full"
          style={{ pointerEvents: (showControls || !playing || showControlsFromParent) && !hiddenByInactivity ? 'auto' : 'none' }}
          onMouseMove={scheduleHideControls}
          onMouseEnter={scheduleHideControls}
        >
        {/* Barra de progreso - click y touch para seek; tooltip con tiempo al hover */}
        <div
          ref={progressRef}
          role="progressbar"
          aria-valuenow={duration ? (currentTime / duration) * 100 : 0}
          aria-valuemin={0}
          aria-valuemax={100}
          tabIndex={0}
          onClick={seek}
          onTouchEnd={(e) => { e.preventDefault(); seek(e); }}
          onMouseMove={progressBarMouseMove}
          onMouseLeave={progressBarMouseLeave}
          className="group mb-2 md:mb-3 h-1.5 md:h-2 w-full cursor-pointer rounded-full bg-palette-stone/30 transition-colors hover:bg-palette-stone/50 focus:outline-none focus:ring-2 focus:ring-palette-sage relative"
        >
          {progressHoverTime != null && duration > 0 && (
            <div
              className="absolute bottom-full left-0 z-30 mb-1 -translate-x-1/2 px-2 py-1 rounded bg-palette-ink/95 text-palette-cream font-montserrat text-xs tabular-nums whitespace-nowrap pointer-events-none"
              style={{
                left: `${(progressHoverTime / duration) * 100}%`,
              }}
            >
              {formatTime(progressHoverTime)}
            </div>
          )}
          {/* Barra de video cargado (buffer) */}
          {duration > 0 && bufferedEnd > 0 && (
            <div
              className="absolute inset-0 h-full rounded-full bg-palette-stone/50 transition-all pointer-events-none"
              style={{ width: `${Math.min(100, (bufferedEnd / duration) * 100)}%` }}
              aria-hidden
            />
          )}
          <div
            className="h-full rounded-full bg-palette-sage transition-all relative min-w-0 z-[1]"
            style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
          >
            {duration > 0 && (
              <span
                className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 md:w-3.5 md:h-3.5 rounded-full bg-palette-sage shadow-sm pointer-events-none"
                aria-hidden
              />
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 md:gap-3 text-palette-cream/90">
          <div className="flex items-center gap-2 md:gap-3">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); togglePlay(); }}
              className="flex min-h-[44px] min-w-[44px] md:h-12 md:w-12 items-center justify-center rounded-full text-palette-cream transition-colors hover:bg-palette-stone/30 hover:text-palette-cream focus:outline-none focus:ring-2 focus:ring-palette-sage touch-manipulation"
              aria-label={playing ? 'Pausar' : 'Reproducir'}
            >
              {playing ? (
                <svg className="h-5 w-5 md:h-6 md:w-6 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="h-5 w-5 md:h-6 md:w-6 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 6v12l8-6-8-6z" />
                </svg>
              )}
            </button>
            <div className="relative">
<button
              type="button"
              onClick={() => setShowSpeedMenu((s) => !s)}
                className="min-h-[44px] min-w-[44px] md:min-w-[3rem] rounded-full bg-palette-stone/20 px-2 md:px-3 py-1.5 md:py-2 font-montserrat text-xs md:text-sm font-medium text-palette-cream transition-colors hover:bg-palette-stone/30 focus:outline-none focus:ring-2 focus:ring-palette-sage touch-manipulation flex items-center justify-center"
                aria-label="Velocidad de reproducción"
              >
                {playbackRate}x
              </button>
              {showSpeedMenu && (
                <>
                  <div className="fixed inset-0 z-30" aria-hidden onClick={() => setShowSpeedMenu(false)} />
                  <div className="absolute bottom-full left-0 z-40 mb-1 flex flex-col rounded-xl border border-palette-stone/20 bg-palette-ink/98 py-1 shadow-xl">
                    {SPEED_OPTIONS.map((rate) => (
                      <button
                        key={rate}
                        type="button"
                        onClick={() => setSpeed(rate)}
                        className={`px-3 py-2 text-left font-montserrat text-sm transition-colors hover:bg-palette-stone/20 ${playbackRate === rate ? 'bg-palette-sage/20 text-palette-cream' : 'text-palette-cream/90'}`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <span className="min-w-[4rem] md:min-w-[5rem] font-montserrat text-xs md:text-sm tabular-nums text-palette-cream/80">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
          <div className="group/vol flex items-center gap-1 md:gap-2">
            {/* Botón mute/unmute: al tocar pone mute (vol 0, icono mute) o restaura volumen (icono audio) */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); toggleMute(); }}
              className="flex min-h-[44px] min-w-[44px] md:h-12 md:w-12 shrink-0 items-center justify-center rounded-full text-palette-cream transition-colors hover:bg-palette-stone/30 focus:outline-none focus:ring-2 focus:ring-palette-sage touch-manipulation"
              aria-label={muted ? 'Activar sonido' : 'Silenciar'}
            >
              {muted ? (
                <svg className="h-4 w-4 md:h-6 md:w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                </svg>
              ) : (
                <svg className="h-4 w-4 md:h-6 md:w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                </svg>
              )}
            </button>
            <div
              ref={volumeSliderRef}
              role="slider"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={muted ? 0 : Math.round(volume * 100)}
              tabIndex={0}
              onClick={setVolumeFromSlider}
              className="relative w-0 overflow-hidden opacity-0 transition-[width,opacity] duration-200 group-hover/vol:w-14 md:group-hover/vol:w-20 group-hover/vol:opacity-100 h-1.5 md:h-2 cursor-pointer rounded-full bg-palette-stone/30 hover:bg-palette-stone/50 focus:outline-none focus:ring-2 focus:ring-palette-sage focus:opacity-100 focus:w-14 md:focus:w-20 shrink-0 min-w-0"
            >
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-palette-sage transition-all min-w-0"
                style={{ width: muted ? '0%' : `${volume * 100}%` }}
              />
              {!muted && volume > 0 && (
                <span
                  className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-palette-sage shadow-sm pointer-events-none"
                  style={{ left: `calc(${volume * 100}% - 5px)` }}
                  aria-hidden
                />
              )}
            </div>
            <button
              type="button"
              onClick={toggleFullscreen}
              className="flex min-h-[44px] min-w-[44px] md:h-12 md:w-12 shrink-0 items-center justify-center rounded-full text-palette-cream transition-colors hover:bg-palette-stone/30 focus:outline-none focus:ring-2 focus:ring-palette-sage touch-manipulation"
              aria-label="Pantalla completa"
            >
              <svg className="h-5 w-5 md:h-6 md:w-6 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
              </svg>
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
});

export default MoveCrewVideoPlayer;
