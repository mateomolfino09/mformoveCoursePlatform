'use client'
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import MoveCrewVideoPlayer, { type MoveCrewVideoPlayerHandle } from '../ClassPage/MoveCrewVideoPlayer';

const MATERIAL_LABELS: Record<string, string> = {
  baston: 'Bastón',
  'banda elastica': 'Banda elástica',
  banco: 'Banco',
  pelota: 'Pelota',
};

const MaterialIcons: Record<string, React.ReactNode> = {
  baston: (
    <svg viewBox="0 0 48 48" fill="none" className="w-full h-full" aria-hidden>
      <path d="M14 44V18l4-4 12 12 4-4v22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 14l2-2 8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  'banda elastica': (
    <svg viewBox="0 0 48 24" fill="none" className="w-full h-full" aria-hidden>
      <path d="M6 12h36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 3" />
      <ellipse cx="10" cy="12" rx="6" ry="4" stroke="currentColor" strokeWidth="2" fill="none" />
      <ellipse cx="38" cy="12" rx="6" ry="4" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  ),
  banco: (
    <svg viewBox="0 0 48 32" fill="none" className="w-full h-full" aria-hidden>
      <rect x="4" y="12" width="40" height="8" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M10 20v4h6v-4M32 20v4h6v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  pelota: (
    <svg viewBox="0 0 48 48" fill="none" className="w-full h-full" aria-hidden>
      <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M24 4c-6 4-10 12-10 20s4 16 10 20c6-4 10-12 10-20s-4-16-10-20z" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M4 24h40" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
};

const INTRO_COUNTDOWN_SEC = 7;
const INTRO_MORE_TIME_SEC = 30;

interface Props {
  videoUrl?: string;
  videoId?: string;
  thumbnailUrl?: string;
  title?: string;
  videoName?: string;
  description?: string;
  duration?: number;
  /** Materiales para la clase (baston, banda elastica, banco, pelota) */
  materials?: string[];
  onComplete?: () => void;
  /** Se llama cuando el usuario pone pausa (abrir sidebar, etc.) */
  onPause?: () => void;
  /** Se llama cuando el usuario reproduce el video (cerrar sidebar, etc.) */
  onPlay?: () => void;
  isCompleted?: boolean;
  logbookId?: string;
  weekNumber?: number;
  dayNumber?: number;
  /** Si false, no se muestra el overlay de intro (materiales / countdown). Útil en weekly-path al cambiar de semana. */
  showIntroOverlay?: boolean;
}

const VideoContentDisplay = ({
  videoUrl,
  videoId,
  title,
  videoName,
  description,
  duration,
  materials = [],
  onComplete,
  onPause,
  onPlay,
  isCompleted = false,
  logbookId,
  weekNumber,
  dayNumber,
  showIntroOverlay = true
}: Props) => {
  const [videoProgress, setVideoProgress] = useState(0);
  const [canComplete, setCanComplete] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [introDismissed, setIntroDismissed] = useState(false);
  const [countdown, setCountdown] = useState(INTRO_COUNTDOWN_SEC);
  const videoElementRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<MoveCrewVideoPlayerHandle>(null);

  const extractVimeoId = (url?: string): string | null => {
    if (!url) return null;
    const vimeoMatch = url.match(/(?:vimeo\.com\/)(\d+)/);
    return vimeoMatch?.[1] || null;
  };

  const finalVideoId = videoId || extractVimeoId(videoUrl) || null;
  const isVimeo = Boolean(finalVideoId) || (videoUrl && videoUrl.includes('vimeo.com'));
  const vimeoId = finalVideoId;
  const displayName = videoName || title;
  const hasMaterials = materials?.length > 0;

  useEffect(() => {
    setVideoProgress(0);
    setCanComplete(false);
    setIntroDismissed(false);
    setCountdown(INTRO_COUNTDOWN_SEC);
  }, [vimeoId || videoUrl]);

  useEffect(() => {
    if (introDismissed || countdown <= 0) return;
    const t = setInterval(() => setCountdown((c) => (c <= 0 ? 0 : c - 1)), 1000);
    return () => clearInterval(t);
  }, [introDismissed, countdown]);

  const startVideo = useCallback(() => {
    setIntroDismissed(true);
    const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 768;
    const play = () => {
      if (vimeoId) {
        playerRef.current?.play();
      } else if (videoUrl && videoElementRef.current) {
        videoElementRef.current.play();
      }
    };
    requestAnimationFrame(() => setTimeout(play, 50));
  }, [vimeoId, videoUrl]);

  useEffect(() => {
    if (countdown !== 0 || introDismissed) return;
    startVideo();
  }, [countdown, introDismissed, startVideo]);

  const handleVimeoEnded = () => {
    if (isCompleted || isCompleting || !onComplete) return;
    if (videoProgress >= 95) {
      setIsCompleting(true);
      (async () => {
        try {
          await onComplete();
          toast.success('¡Clase completada! 🎉');
          (playerRef.current as { resetToStart?: () => void } | null)?.resetToStart?.();
        } catch (err: any) {
          toast.error(err?.message || 'Error al completar la clase');
        } finally {
          setIsCompleting(false);
        }
      })();
    }
  };

  useEffect(() => {
    if (finalVideoId || !videoUrl) return;
    const videoElement = videoElementRef.current;
    if (!videoElement) return;
    const updateProgress = () => {
      if (isCompleted) return;
      if (videoElement.duration > 0) {
        const progress = (videoElement.currentTime / videoElement.duration) * 100;
        setVideoProgress(progress);
        setCanComplete(progress >= 95);
      }
    };
    videoElement.addEventListener('timeupdate', updateProgress);
    videoElement.addEventListener('progress', updateProgress);
    videoElement.addEventListener('play', updateProgress);
    return () => {
      videoElement.removeEventListener('timeupdate', updateProgress);
      videoElement.removeEventListener('progress', updateProgress);
      videoElement.removeEventListener('play', updateProgress);
    };
  }, [videoUrl, finalVideoId, isCompleted, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full mt-6 md:mt-8"
    >
      {/* Overlay pre-video: materiales, nombre, "Necesito más tiempo" / "Quiero seguir" (como clase de módulo) */}
      {showIntroOverlay && !introDismissed && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 md:bg-black/70 pointer-events-none"
          role="dialog"
          aria-labelledby="weekly-intro-title"
        >
          <div
            className="w-full min-h-0 md:max-w-sm flex flex-col justify-center rounded-none md:rounded-3xl border-0 md:border md:border-palette-stone/20 bg-palette-ink md:shadow-2xl pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center gap-6 md:gap-5 p-6 md:p-8 max-w-md mx-auto w-full text-center">

              {hasMaterials && (
                <div className="space-y-2 w-full flex flex-col items-center">
                  <p className="text-palette-cream/80 text-xs font-light">Materiales para esta clase</p>
                  <ul className="flex flex-wrap justify-center gap-2">
                    {materials.map((key) => (
                      <li
                        key={key}
                        className="flex items-center gap-2.5 rounded-lg bg-palette-stone/10 border border-palette-stone/20 px-3 py-2"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-palette-stone/20 text-palette-cream">
                          {MaterialIcons[key] ?? null}
                        </span>
                        <span className="font-montserrat text-palette-cream/90 text-xs font-light">
                          {MATERIAL_LABELS[key] ?? key}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-col items-center justify-center py-2 md:py-4 border-y border-palette-stone/20 w-full">
                <span className="text-palette-stone/80 text-xs font-light uppercase tracking-wider">Empieza en</span>
                <span className="font-montserrat text-2xl md:text-3xl font-light tabular-nums text-palette-sage mt-1">
                  {countdown > 0 ? countdown : '¡Listo!'}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-1 w-full justify-center">
                <button
                  type="button"
                  onClick={startVideo}
                  className="flex-1 rounded-xl bg-palette-sage text-palette-ink text-sm font-light py-3 px-4 transition-all duration-200 hover:bg-palette-sage/90 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-palette-sage focus:ring-offset-2 focus:ring-offset-palette-ink"
                >
                  Quiero seguir
                </button>
                <button
                  type="button"
                  onClick={() => setCountdown(INTRO_MORE_TIME_SEC)}
                  className="flex-1 rounded-xl border border-palette-stone/40 bg-palette-stone/10 text-palette-cream text-sm font-light py-3 px-4 transition-all duration-200 hover:bg-palette-stone/20 hover:border-palette-stone/50 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-palette-stone focus:ring-offset-2 focus:ring-offset-palette-ink"
                >
                  Necesito más tiempo
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Video: más ancho (breakout al padding del contenedor), contenedor fino y limpio */}
      <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 rounded-none sm:rounded-xl overflow-hidden bg-palette-ink border-0 border-y border-palette-stone/10">
        <div className="relative w-full aspect-video md:min-h-[55vh] max-h-[82vh]">
        {isVimeo && vimeoId ? (
          <MoveCrewVideoPlayer
            ref={playerRef}
            videoId={vimeoId}
            className="absolute inset-0 w-full h-full !aspect-auto"
            userStartsPlayback={true}
            onEnded={handleVimeoEnded}
            onPlayingChange={(playing) => { if (playing) onPlay?.(); else onPause?.(); }}
            onProgress={(currentTime, dur) => {
              if (isCompleted) return;
              if (dur > 0) {
                const pct = (currentTime / dur) * 100;
                setVideoProgress(pct);
                setCanComplete(pct >= 95);
              }
            }}
          />
        ) : videoUrl ? (
          <div className="relative w-full h-full">
            <video
              ref={videoElementRef}
              src={videoUrl}
              controls
              className="w-full h-full object-contain"
              preload="metadata"
              onPause={() => onPause?.()}
              onPlay={() => onPlay?.()}
              onEnded={async () => {
                if (!isCompleted && !isCompleting && onComplete && canComplete) {
                  setIsCompleting(true);
                  try {
                    await onComplete();
                    toast.success('¡Clase completada! 🎉');
                    const el = videoElementRef.current;
                    if (el) el.currentTime = 0;
                  } catch (error: any) {
                    toast.error(error.message || 'Error al completar la clase');
                  } finally {
                    setIsCompleting(false);
                  }
                }
              }}
            />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-palette-ink">
            <p className="text-palette-stone font-montserrat">No hay video disponible</p>
          </div>
        )}
        </div>
      </div>

      {description && (
        <p className="text-palette-stone/90 text-base md:text-lg font-montserrat mt-6 font-light leading-relaxed max-w-3xl">
          {description}
        </p>
      )}
    </motion.div>
  );
};

export default VideoContentDisplay;
