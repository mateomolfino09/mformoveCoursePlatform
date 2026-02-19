'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Player from '@vimeo/player';

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const THUMBNAIL_URL = (id: string) => `https://vumbnail.com/${id}.jpg`;

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;

interface MoveCrewVideoPlayerProps {
  videoId: string;
  className?: string;
  /** Si es true, no autoplay y el usuario debe dar play (recomendado para páginas de clase) */
  userStartsPlayback?: boolean;
}

export default function MoveCrewVideoPlayer({
  videoId,
  className = '',
  userStartsPlayback = true,
}: MoveCrewVideoPlayerProps) {
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
  const [showThumbnail, setShowThumbnail] = useState(true);
  const [loading, setLoading] = useState(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);
  const volumeSliderRef = useRef<HTMLDivElement>(null);
  const hideControlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const INACTIVITY_MS = 3000;

  const scheduleHideControls = useCallback(() => {
    if (hideControlsTimeoutRef.current) clearTimeout(hideControlsTimeoutRef.current);
    hideControlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
      hideControlsTimeoutRef.current = null;
    }, INACTIVITY_MS);
  }, []);

  const cancelHideControls = useCallback(() => {
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
      hideControlsTimeoutRef.current = null;
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

    player.on('loaded', () => {
      player.getDuration().then((d) => setDuration(d)).catch(() => {});
      player.setVolume(1).then(() => { setVolume(1); setMuted(false); }).catch(() => {});
      player.setPlaybackRate(1).then(() => setPlaybackRate(1)).catch(() => {});
    });
    player.on('timeupdate', (e) => setCurrentTime(e.seconds));
    player.on('play', () => {
      setPlaying(true);
      setLoading(false);
      setShowThumbnail(false);
    });
    player.on('pause', () => setPlaying(false));
    player.on('ended', () => setPlaying(false));
    player.on('error', (e) => console.error('Vimeo error:', e));

    return () => {
      player.destroy().catch(() => {});
      playerRef.current = null;
      if (iframeRef.current?.parentNode) iframeRef.current.parentNode.removeChild(iframeRef.current);
      iframeRef.current = null;
    };
  }, [videoId, privateToken, ready, userStartsPlayback]);

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
    p.setCurrentTime(t);
  }, [duration]);

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

  const handleShowControls = useCallback(() => {
    setShowControls(true);
    cancelHideControls();
    scheduleHideControls();
  }, [cancelHideControls, scheduleHideControls]);

  return (
    <div
      className={`movecrew-player-wrap relative w-full aspect-video overflow-hidden bg-palette-ink ring-1 ring-palette-stone/10 shadow-xl ${className}`}
      onMouseEnter={handleShowControls}
      onMouseMove={() => { if (showControls) scheduleHideControls(); }}
      onMouseLeave={() => {
        cancelHideControls();
        setShowControls(false);
      }}
      onTouchStart={handleShowControls}
      onTouchMove={() => { if (showControls) scheduleHideControls(); }}
    >
      {/* Contenedor donde se inyecta el iframe de Vimeo (creado a mano, sin controles) */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />

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

      {/* Loading: spinner en el centro (en lugar del triángulo de play) */}
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-palette-ink/50" aria-hidden>
          <div className="h-14 w-14 rounded-full border-2 border-palette-cream/30 border-t-palette-cream animate-spin" />
        </div>
      )}

      {/* Overlay para dar play la primera vez (cuando userStartsPlayback) - círculo más pequeño en móvil */}
      {userStartsPlayback && !playing && !loading && (
        <button
          type="button"
          onClick={togglePlay}
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

      {/* Barra de controles: se muestra al hover en el video; 3 s sin actividad y se oculta. Más compacta en móvil */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-20 flex flex-col justify-end bg-gradient-to-t from-palette-ink/95 to-transparent pt-12 md:pt-20 pb-2 md:pb-3 px-3 md:px-4 transition-opacity duration-200 pointer-events-none ${showControls || !playing ? 'opacity-100' : 'opacity-0'}`}
        style={{ pointerEvents: showControls || !playing ? 'auto' : 'none' }}
      >
        {/* Barra de progreso - click y touch para seek */}
        <div
          ref={progressRef}
          role="progressbar"
          aria-valuenow={duration ? (currentTime / duration) * 100 : 0}
          aria-valuemin={0}
          aria-valuemax={100}
          tabIndex={0}
          onClick={seek}
          onTouchEnd={(e) => { e.preventDefault(); seek(e); }}
          className="group mb-2 md:mb-3 h-1.5 md:h-2 w-full cursor-pointer rounded-full bg-palette-stone/30 transition-colors hover:bg-palette-stone/50 focus:outline-none focus:ring-2 focus:ring-palette-sage"
        >
          <div
            className="h-full rounded-full bg-palette-sage transition-all"
            style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
          />
        </div>

        <div className="flex items-center justify-between gap-2 md:gap-3 text-palette-cream/90">
          <div className="flex items-center gap-2 md:gap-3">
            <button
              type="button"
              onClick={togglePlay}
              className="flex h-9 w-9 md:h-12 md:w-12 items-center justify-center rounded-full text-palette-cream transition-colors hover:bg-palette-stone/30 hover:text-palette-cream focus:outline-none focus:ring-2 focus:ring-palette-sage"
              aria-label={playing ? 'Pausar' : 'Reproducir'}
            >
              {playing ? (
                <svg className="h-4 w-4 md:h-6 md:w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="h-4 w-4 md:h-6 md:w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 6v12l8-6-8-6z" />
                </svg>
              )}
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSpeedMenu((s) => !s)}
                className="min-w-[2.5rem] md:min-w-[3rem] rounded-full bg-palette-stone/20 px-2 md:px-3 py-1.5 md:py-2 font-montserrat text-xs md:text-sm font-medium text-palette-cream transition-colors hover:bg-palette-stone/30 focus:outline-none focus:ring-2 focus:ring-palette-sage"
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
            {/* Icono a la izquierda; barra se despliega a la derecha al hacer hover */}
            <span className="flex h-9 w-9 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-full text-palette-cream transition-colors group-hover/vol:bg-palette-stone/30" aria-hidden>
              {muted ? (
                <svg className="h-4 w-4 md:h-6 md:w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                </svg>
              ) : (
                <svg className="h-4 w-4 md:h-6 md:w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                </svg>
              )}
            </span>
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
                className="absolute inset-y-0 left-0 rounded-full bg-palette-sage transition-all"
                style={{ width: muted ? '0%' : `${volume * 100}%` }}
              />
            </div>
            <button
              type="button"
              onClick={toggleFullscreen}
              className="flex h-9 w-9 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-full text-palette-cream transition-colors hover:bg-palette-stone/30 focus:outline-none focus:ring-2 focus:ring-palette-sage"
              aria-label="Pantalla completa"
            >
              <svg className="h-4 w-4 md:h-6 md:w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
