'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlayIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import MainSideBar from '../../../../../../components/MainSidebar/MainSideBar';
import OnboardingGuard from '../../../../../../components/OnboardingGuard';
import MoveCrewVideoPlayer, { type MoveCrewVideoPlayerHandle } from '../../../../../../components/PageComponent/ClassPage/MoveCrewVideoPlayer';

function extractVimeoId(link: string | null | undefined): string | null {
  if (!link || typeof link !== 'string') return null;
  const trimmed = link.trim();
  const patterns = [/vimeo\.com\/(?:video\/)?(\d+)/, /player\.vimeo\.com\/video\/(\d+)/, /^(\d+)$/];
  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

function isDirectVideoUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false;
  try {
    const path = new URL(url, 'https://example.com').pathname.toLowerCase();
    return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(path);
  } catch {
    return false;
  }
}

type Practice = {
  _id: string;
  name: string;
  description?: string;
  videoUrl?: string;
  videoId?: string;
  videoThumbnail?: string;
  duration?: number;
  level?: number;
  materials?: string[];
  order?: number;
};

type ModuleClass = {
  _id: string;
  name: string;
  order?: number;
};

const MATERIAL_LABELS: Record<string, string> = {
  baston: 'Bastón',
  'banda elastica': 'Banda elástica',
  banco: 'Banco',
  pelota: 'Pelota',
};

/** SVGs de materiales para movimiento (uso en clase): bastón apoyo/equilibrio, banda resistencia, banco step, pelota ejercicio */
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

export default function ModulePracticePage({
  params,
}: {
  params: { slug: string; classId: string };
}) {
  const { slug, classId } = params;
  const [practice, setPractice] = useState<Practice | null>(null);
  const [moduleClasses, setModuleClasses] = useState<ModuleClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoAreaHover, setVideoAreaHover] = useState(false);
  const [introDismissed, setIntroDismissed] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const [countdown, setCountdown] = useState(INTRO_COUNTDOWN_SEC);
  const [completedClassIds, setCompletedClassIds] = useState<Set<string>>(new Set());
  /** Tiempo actual del video para sincronizar web/mobile al cambiar de pantalla */
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  /** Qué reproductor está reproduciendo; el otro se pausa y recibe syncTime */
  const [videoPlayingSource, setVideoPlayingSource] = useState<'desktop' | 'mobile' | null>(null);
  const desktopPlayerRef = useRef<MoveCrewVideoPlayerHandle>(null);
  const mobilePlayerRef = useRef<MoveCrewVideoPlayerHandle>(null);
  const desktopVideoRef = useRef<HTMLVideoElement>(null);
  const mobileVideoRef = useRef<HTMLVideoElement>(null);

  /** Al pausar se abre el sidebar; al dar play se cierra y se pausa el otro reproductor (web/mobile). */
  const handlePlayingChangeDesktop = useCallback((playing: boolean) => {
    setVideoPlaying(playing);
    if (!playing) setSidebarOpen(true);
    if (playing) {
      setSidebarOpen(false);
      setVideoPlayingSource('desktop');
      mobilePlayerRef.current?.pause();
    } else setVideoPlayingSource(null);
  }, []);
  const handlePlayingChangeMobile = useCallback((playing: boolean) => {
    setVideoPlaying(playing);
    if (!playing) setSidebarOpen(true);
    if (playing) {
      setSidebarOpen(false);
      setVideoPlayingSource('mobile');
      desktopPlayerRef.current?.pause();
    } else setVideoPlayingSource(null);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/module-classes/${classId}`, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data) setPractice(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [classId]);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    fetch(`/api/class-modules/by-slug/${slug}`, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.moduleClasses) {
          setModuleClasses(
            (data.moduleClasses as ModuleClass[]).sort(
              (a, b) => (a.order ?? 0) - (b.order ?? 0)
            )
          );
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [slug]);

  // Evitar barra de scroll horizontal en esta página (clip es más estricto que hidden)
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflowX;
    const prevBody = body.style.overflowX;
    html.style.overflowX = 'clip';
    body.style.overflowX = 'clip';
    return () => {
      html.style.overflowX = prevHtml;
      body.style.overflowX = prevBody;
    };
  }, []);

  const hasMaterials = !!(practice?.materials?.length);

  // Reset intro, fin y tiempo al cambiar de clase
  useEffect(() => {
    setIntroDismissed(false);
    setVideoEnded(false);
    setCountdown(INTRO_COUNTDOWN_SEC);
    setVideoCurrentTime(0);
    setVideoPlayingSource(null);
  }, [classId]);

  // Countdown del popup de inicio (solo cuando el popup está visible)
  useEffect(() => {
    if (introDismissed || !practice) return;
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown((c) => (c <= 0 ? 0 : c - 1)), 1000);
    return () => clearInterval(t);
  }, [introDismissed, practice, countdown]);

  const vimeoId = practice?.videoId
    ? String(practice.videoId).trim()
    : extractVimeoId(practice?.videoUrl);
  const directVideoUrl =
    practice?.videoUrl && isDirectVideoUrl(practice.videoUrl) ? practice.videoUrl : null;

  const currentIndex = moduleClasses.findIndex((c) => c._id === classId);
  const nextClass =
    currentIndex >= 0 && currentIndex < moduleClasses.length - 1
      ? moduleClasses[currentIndex + 1]
      : null;
  const previousClass =
    currentIndex > 0 ? moduleClasses[currentIndex - 1] : null;

  /** Cierra el modal de inicio y pone play (Empezar o al terminar el countdown). */
  const startVideo = useCallback(() => {
    setIntroDismissed(true);
    const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 768;
    const play = () => {
      if (vimeoId) {
        if (isDesktop) desktopPlayerRef.current?.play();
        else mobilePlayerRef.current?.play();
      } else if (directVideoUrl) {
        if (isDesktop) desktopVideoRef.current?.play();
        else mobileVideoRef.current?.play();
      }
    };
    requestAnimationFrame(() => setTimeout(play, 50));
  }, [vimeoId, directVideoUrl]);

  // Al llegar countdown a 0: cerrar modal e iniciar video automáticamente
  useEffect(() => {
    if (countdown !== 0 || introDismissed || !practice) return;
    startVideo();
  }, [countdown, introDismissed, practice, startVideo]);

  // Al mostrar modal de clase completada: guardar como vista/completada y marcar en sidebar
  useEffect(() => {
    if (!videoEnded || !classId) return;
    fetch('/api/module-classes/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ classId }),
    })
      .then(() => setCompletedClassIds((prev) => new Set(prev).add(classId)))
      .catch(() => {});
  }, [videoEnded, classId]);

  // Cargar clases ya vistas para el sidebar (puntito)
  const moduleClassIdsKey = moduleClasses.length ? moduleClasses.map((c) => c._id).join(',') : '';
  useEffect(() => {
    if (!moduleClassIdsKey) return;
    const currentIds = new Set(moduleClassIdsKey.split(','));
    fetch(`/api/module-classes/complete?classIds=${encodeURIComponent(moduleClassIdsKey)}`, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const ids = (data?.completedIds ?? []) as string[];
        const fromApi = new Set<string>(ids);
        setCompletedClassIds((prev) => {
          const next = new Set<string>(fromApi);
          prev.forEach((id) => { if (currentIds.has(id)) next.add(id); });
          return next;
        });
      })
      .catch(() => {});
  }, [moduleClassIdsKey]);

  const materialsText =
    practice?.materials?.length
      ? practice.materials.map((m) => MATERIAL_LABELS[m] ?? m).join(', ')
      : null;

  if (loading) {
    return (
      <OnboardingGuard>
        <MainSideBar where="library">
          <div className="min-h-screen bg-palette-ink flex items-center justify-center">
            <div className="w-10 h-10 border-2 border-palette-cream/30 border-t-palette-cream rounded-full animate-spin" />
          </div>
        </MainSideBar>
      </OnboardingGuard>
    );
  }

  if (!practice) {
    return (
      <OnboardingGuard>
        <MainSideBar where="library">
          <div className="min-h-screen bg-palette-ink text-palette-cream flex flex-col items-center justify-center gap-4 px-6">
            <p>Práctica no encontrada.</p>
            <Link
              href={`/library/module/${slug}`}
              className="text-palette-sage hover:underline inline-flex items-center gap-2"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Volver al módulo
            </Link>
          </div>
        </MainSideBar>
      </OnboardingGuard>
    );
  }

  return (
    <OnboardingGuard>
      <MainSideBar where="library">
        <div className="flex flex-col min-h-screen bg-palette-ink text-palette-cream font-montserrat overflow-x-clip max-w-[100vw] min-w-0 w-full" style={{ overflowX: 'clip' }}>
          {/* Video: mobile = 100% width + altura del video (aspect); web = 100vh, se achica al abrir sidebar */}
          <section className="relative w-full max-w-full md:h-screen md:min-h-[100vh] bg-palette-ink overflow-hidden overflow-x-clip shrink-0">
            {/* Popup inicio: en mobile a pantalla completa, overlay 50%; en desktop card centrada */}
            {!introDismissed && practice && (
              <div
                className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 md:bg-black/70 md:backdrop-blur-sm transition-opacity duration-300"
                role="dialog"
                aria-labelledby="intro-popup-title"
                aria-describedby="intro-popup-desc"
              >
                <div
                  className="practice-popup-card w-full min-h-0 md:max-w-sm flex flex-col justify-center rounded-none md:rounded-3xl border-0 md:border md:border-palette-stone/20 bg-palette-ink md:shadow-2xl transition-all duration-500 ease-out"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex flex-col items-center gap-6 md:gap-5 p-6 md:p-8 max-w-md mx-auto w-full text-center">
                    {/* Título y duración: sin ancho forzado, más espacio debajo */}
                    <header className="space-y-1 text-center flex flex-col items-center">
                      <h2 id="intro-popup-title" className="font-montserrat text-lg md:text-xl font-light text-white tracking-wide leading-tight">
                        {practice.name}
                      </h2>
                      {practice.duration != null && practice.duration > 0 && (
                        <p className="text-palette-stone/90 text-xs font-light">
                          {Math.round(practice.duration / 60)} min
                        </p>
                      )}
                    </header>

                    {/* Materiales (solo si hay): siempre centrados; 1 item = uno centrado, varios = fila centrada */}
                    {hasMaterials && (
                      <div id="intro-popup-desc" className="space-y-2 !mt-8 w-full flex flex-col items-center">
                        <p className="text-palette-cream/80 text-xs font-light">
                          Materiales para esta clase
                        </p>
                        <ul className="flex flex-wrap justify-center gap-2">
                          {practice.materials!.map((key) => (
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

                    {/* Countdown */}
                    <div className="flex flex-col items-center justify-center py-2 md:py-4 border-y border-palette-stone/20 w-full">
                      <span className="text-palette-stone/80 text-xs font-light uppercase tracking-wider">
                        Empieza en
                      </span>
                      <span className="font-montserrat text-2xl md:text-3xl font-light tabular-nums text-palette-sage mt-1 transition-all duration-300">
                        {countdown > 0 ? countdown : '¡Listo!'}
                      </span>
                    </div>

                    {/* Botones */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-1 w-full justify-center">
                      <button
                        type="button"
                        onClick={startVideo}
                        className="flex-1 rounded-xl bg-palette-sage text-palette-ink text-sm font-light py-3 px-4 transition-all duration-200 hover:bg-palette-sage/90 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-palette-sage focus:ring-offset-2 focus:ring-offset-palette-ink"
                      >
                        Empezar
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
              </div>
            )}

            {/* Popup fin: en mobile a pantalla completa, overlay 50%; en desktop card centrada */}
            {videoEnded && (
              <div
                className="fixed inset-0 z-[61] flex items-center justify-center p-4 bg-black/50 md:bg-black/70 md:backdrop-blur-sm transition-opacity duration-300"
                role="dialog"
                aria-labelledby="completed-popup-title"
                onClick={() => setVideoEnded(false)}
              >
                <div
                  className="practice-popup-card relative w-full min-h-full md:min-h-0 md:max-w-md flex flex-col justify-center rounded-none md:rounded-3xl border-0 md:border md:border-palette-stone/20 bg-palette-ink md:shadow-2xl transition-all duration-500 ease-out"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => setVideoEnded(false)}
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-palette-stone hover:bg-palette-stone/20 hover:text-palette-cream transition-colors focus:outline-none focus:ring-2 focus:ring-palette-sage"
                    aria-label="Cerrar y repasar"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                  <div className="p-6 md:p-8 text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-palette-sage/20 text-palette-sage mb-4">
                      <CheckCircleIcon className="w-9 h-9" strokeWidth={2} />
                    </div>
                    <h2 id="completed-popup-title" className="font-montserrat text-xl md:text-2xl font-semibold text-white mb-2">
                      Clase completada
                    </h2>
                    {nextClass ? (
                      <>
                        <p className="text-palette-cream/80 text-sm mb-4">
                          Siguiente: <span className="font-medium text-palette-cream">{nextClass.name}</span>
                        </p>
                        <div className="flex flex-col gap-2">
                          <Link
                            href={`/library/module/${slug}/practice/${nextClass._id}`}
                            onClick={() => setVideoEnded(false)}
                            className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-palette-sage text-palette-ink font-semibold py-3 px-4 transition-all duration-200 hover:bg-palette-sage/90 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-palette-sage focus:ring-offset-2 focus:ring-offset-palette-ink"
                          >
                            Siguiente: {nextClass.name}
                            <ChevronRightIcon className="w-5 h-5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setVideoEnded(false)}
                            className="text-palette-stone/80 text-sm font-light hover:text-palette-cream transition-colors"
                          >
                            Cerrar y repasar esta clase
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-palette-cream/80 text-sm mb-4">
                          Has completado este módulo
                        </p>
                        <div className="flex flex-col gap-2">
                          <Link
                            href={`/library/module/${slug}`}
                            onClick={() => setVideoEnded(false)}
                            className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-palette-sage text-palette-ink font-semibold py-3 px-4 transition-all duration-200 hover:bg-palette-sage/90 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-palette-sage focus:ring-offset-2 focus:ring-offset-palette-ink"
                          >
                            Volver al módulo
                            <ArrowLeftIcon className="w-5 h-5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setVideoEnded(false)}
                            className="text-palette-stone/80 text-sm font-light hover:text-palette-cream transition-colors"
                          >
                            Cerrar y repasar esta clase
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Mobile: contenedor con altura intrínseca (aspect-video) */}
            <div className="block md:hidden w-full aspect-video bg-palette-ink">
              {vimeoId ? (
                <MoveCrewVideoPlayer
                  ref={mobilePlayerRef}
                  videoId={vimeoId}
                  className="w-full h-full !ring-0 !shadow-none"
                  userStartsPlayback
                  onEnded={() => setVideoEnded(true)}
                  syncTime={videoCurrentTime}
                  isActiveSource={videoPlayingSource === 'mobile'}
                  onTimeUpdate={setVideoCurrentTime}
                  onPlayingChange={handlePlayingChangeMobile}
                />
              ) : directVideoUrl ? (
                <video
                  ref={mobileVideoRef}
                  src={directVideoUrl}
                  controls
                  className="w-full h-full object-contain bg-palette-ink"
                  poster={practice.videoThumbnail || undefined}
                  playsInline
                  onEnded={() => setVideoEnded(true)}
                >
                  Tu navegador no soporta la reproducción de video.
                </video>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-palette-stone gap-4">
                  <PlayIcon className="w-16 h-16 opacity-50" />
                  <p>No hay video disponible.</p>
                </div>
              )}
            </div>

            {/* Web: 100vh, video se achica al abrir sidebar; sin scale en el wrapper para que los controles no se recorten */}
            <div
              className={`hidden md:block absolute top-0 bottom-0 right-0 h-full transition-[left] duration-300 ease-out overflow-hidden ${
                sidebarOpen ? 'left-96' : 'left-0'
              }`}
              onMouseEnter={() => setVideoAreaHover(true)}
              onMouseLeave={() => setVideoAreaHover(false)}
            >
              <div className="absolute inset-0 w-full h-full overflow-hidden">
                {vimeoId ? (
                  <MoveCrewVideoPlayer
                    ref={desktopPlayerRef}
                    videoId={vimeoId}
                    className="!aspect-auto absolute inset-0 w-full h-full min-w-full min-h-full !ring-0 !shadow-none"
                    userStartsPlayback
                    onPlayingChange={handlePlayingChangeDesktop}
                    showControlsFromParent={videoAreaHover}
                    onEnded={() => setVideoEnded(true)}
                    syncTime={videoCurrentTime}
                    isActiveSource={videoPlayingSource === 'desktop'}
                    onTimeUpdate={setVideoCurrentTime}
                  />
                  ) : directVideoUrl ? (
                  <video
                    ref={desktopVideoRef}
                    src={directVideoUrl}
                    controls
                    className="absolute inset-0 w-full h-full object-cover object-center"
                    poster={practice.videoThumbnail || undefined}
                    playsInline
                    onPlay={() => handlePlayingChangeDesktop(true)}
                    onPause={() => handlePlayingChangeDesktop(false)}
                    onEnded={() => setVideoEnded(true)}
                  >
                    Tu navegador no soporta la reproducción de video.
                  </video>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-palette-stone gap-4">
                    <PlayIcon className="w-16 h-16 opacity-50" />
                    <p>No hay video disponible.</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* PC: flecha para abrir menú (borde izquierdo, chevron derecha →); visible solo cuando el menú está cerrado */}
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className={`hidden md:flex fixed left-0 top-1/2 -translate-y-1/2 z-30 h-14 w-10 items-center justify-center rounded-r-xl bg-palette-ink/95 text-palette-cream shadow-lg border border-l-0 border-palette-stone/30 hover:bg-palette-ink hover:w-12 transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-palette-sage focus:ring-offset-2 focus:ring-offset-transparent ${
              sidebarOpen ? 'opacity-0 pointer-events-none -translate-x-4' : 'opacity-100 translate-x-0'
            }`}
            aria-label="Abrir menú de la clase"
          >
            <ChevronRightIcon className="w-6 h-6 shrink-0" aria-hidden />
          </button>

          {/* PC: sidebar opaco; contenido debajo del header/logo */}
          <div
            className={`hidden md:flex fixed inset-y-0 left-0 z-40 w-96 max-w-[90vw] flex-col bg-palette-ink border-r border-palette-stone/20 shadow-xl transition-transform duration-300 ease-out overflow-hidden pt-20 ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-palette-stone/20 shrink-0">
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-palette-stone/30 text-palette-cream hover:bg-palette-stone/50 transition-colors focus:outline-none focus:ring-2 focus:ring-palette-sage focus:ring-offset-2 focus:ring-offset-palette-ink border border-palette-stone/40"
                aria-label="Cerrar menú"
              >
                <ChevronLeftIcon className="w-6 h-6 shrink-0" strokeWidth={2.5} />
              </button>
              <Link
                href={`/library/module/${slug}`}
                className="text-sm text-palette-sage hover:underline truncate"
              >
                Volver al módulo
              </Link>
            </div>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
              <section>
                <h1 className="text-xl font-medium text-white mb-2">{practice.name}</h1>
                {practice.duration != null && practice.duration > 0 && (
                  <p className="text-palette-stone text-sm mb-2">
                    Duración: {Math.round(practice.duration / 60)} min
                  </p>
                )}
                <p className="text-palette-cream/90 text-sm">
                  {materialsText ? (
                    <>Materiales requeridos: {materialsText}</>
                  ) : (
                    <>Sin materiales requeridos</>
                  )}
                </p>
              </section>
              <section>
                <h2 className="text-sm font-medium text-palette-stone uppercase tracking-wider mb-3">
                  Clases de este módulo
                </h2>
                <ul className="space-y-1">
                  {moduleClasses.map((c) => {
                    const isActive = c._id === classId;
                    const isCompleted = completedClassIds.has(c._id);
                    return (
                      <li key={c._id}>
                        <Link
                          href={`/library/module/${slug}/practice/${c._id}`}
                          onClick={() => setSidebarOpen(false)}
                          className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                            isActive
                              ? 'bg-palette-sage/25 text-palette-cream font-medium'
                              : 'text-palette-cream/80 hover:bg-palette-stone/20 hover:text-palette-cream'
                          }`}
                        >
                          <span className="truncate">{c.name}</span>
                          {isCompleted && (
                            <span
                              className="shrink-0 w-2 h-2 rounded-full bg-palette-sage"
                              title="Clase vista"
                              aria-hidden
                            />
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
              {previousClass && (
                <section className="mt-auto pt-4 border-t border-palette-stone/20">
                  <Link
                    href={`/library/module/${slug}/practice/${previousClass._id}`}
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center justify-center gap-2 w-full rounded-xl border border-palette-stone/30 bg-palette-stone/10 text-palette-cream font-medium py-3 px-4 hover:bg-palette-stone/20 transition-colors"
                  >
                    <ChevronLeftIcon className="w-5 h-5 shrink-0" />
                    <span>Anterior: {previousClass.name}</span>
                  </Link>
                </section>
              )}
              {nextClass && (
                <section className={previousClass ? 'pt-3' : 'mt-auto pt-4 border-t border-palette-stone/20'}>
                  <Link
                    href={`/library/module/${slug}/practice/${nextClass._id}`}
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center justify-center gap-2 w-full rounded-xl bg-palette-sage text-palette-ink font-medium py-3 px-4 hover:bg-palette-sage/90 transition-colors"
                  >
                    <span>Siguiente: {nextClass.name}</span>
                    <ChevronRightIcon className="w-5 h-5 shrink-0" />
                  </Link>
                </section>
              )}
            </div>
          </div>

          {/* Cerrar sidebar solo con el botón dentro del sidebar para no bloquear los controles del video */}

          {/* Mobile: contenido debajo del video */}
          <div className="md:hidden w-full max-w-2xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
            <Link
              href={`/library/module/${slug}`}
              className="text-sm text-palette-sage hover:underline inline-flex items-center gap-1 w-fit"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Volver al módulo
            </Link>

            {/* Nombre, duración, materiales */}
            <section>
              <h1 className="text-xl font-medium text-white mb-2">
                {practice.name}
              </h1>
              {practice.duration != null && practice.duration > 0 && (
                <p className="text-palette-stone text-sm mb-2">
                  Duración: {Math.round(practice.duration / 60)} min
                </p>
              )}
              <p className="text-palette-cream/90 text-sm">
                {materialsText ? (
                  <>Materiales requeridos: {materialsText}</>
                ) : (
                  <>Sin materiales requeridos</>
                )}
              </p>
            </section>

            {/* Lista de clases del módulo (con puntito si ya vista) */}
            <section>
              <h2 className="text-sm font-medium text-palette-stone uppercase tracking-wider mb-3">
                Clases de este módulo
              </h2>
              <ul className="space-y-1">
                {moduleClasses.map((c) => {
                  const isActive = c._id === classId;
                  const isCompleted = completedClassIds.has(c._id);
                  return (
                    <li key={c._id}>
                      <Link
                        href={`/library/module/${slug}/practice/${c._id}`}
                        className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                          isActive
                            ? 'bg-palette-sage/25 text-palette-cream font-medium'
                            : 'text-palette-cream/80 hover:bg-palette-stone/20 hover:text-palette-cream'
                        }`}
                      >
                        <span className="truncate">{c.name}</span>
                        {isCompleted && (
                          <span
                            className="shrink-0 w-2 h-2 rounded-full bg-palette-sage"
                            title="Clase vista"
                            aria-hidden
                          />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>

            {/* Botones anterior y siguiente (mobile) */}
            {previousClass && (
              <section className="pt-4 border-t border-palette-stone/20">
                <Link
                  href={`/library/module/${slug}/practice/${previousClass._id}`}
                  className="flex items-center justify-center gap-2 w-full rounded-xl border border-palette-stone/30 bg-palette-stone/10 text-palette-cream font-medium py-3 px-4 hover:bg-palette-stone/20 transition-colors"
                >
                  <ChevronLeftIcon className="w-5 h-5 shrink-0" />
                  <span>Anterior: {previousClass.name}</span>
                </Link>
              </section>
            )}
            {nextClass && (
              <section className={previousClass ? 'pt-3' : 'pt-4 border-t border-palette-stone/20'}>
                <Link
                  href={`/library/module/${slug}/practice/${nextClass._id}`}
                  className="flex items-center justify-center gap-2 w-full rounded-xl bg-palette-sage text-palette-ink font-medium py-3 px-4 hover:bg-palette-sage/90 transition-colors"
                >
                  <span>Siguiente: {nextClass.name}</span>
                  <ChevronRightIcon className="w-5 h-5 shrink-0" />
                </Link>
              </section>
            )}
          </div>
        </div>
      </MainSideBar>
    </OnboardingGuard>
  );
}
