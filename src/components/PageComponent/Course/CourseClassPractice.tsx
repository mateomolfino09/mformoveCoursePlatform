'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentArrowDownIcon,
  PlayIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import MainSideBar from '../../MainSidebar/MainSideBar';
import MoveCrewVideoPlayer, {
  type MoveCrewVideoPlayerHandle,
} from '../ClassPage/MoveCrewVideoPlayer';
import { cursoClasePath } from '../../../lib/cursoPaths';
import { routes } from '../../../constants/routes';
import {
  flattenCursoClasesOrdered,
  type CursoClaseNavItem,
  type CursoModuloNav,
} from '../../../lib/cursoContenidoNavigation';
import { resolveClaseDescripcionCompleta } from '../../../lib/cursoClaseDescripcion';

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
  descripcionGeneral?: string;
  descripcionCorta?: string;
  descripcionCompleta?: string;
  pdfUrl?: string;
  videoUrl?: string;
  videoId?: string;
  videoThumbnail?: string;
  duration?: number;
  level?: number;
  materials?: string[];
  timelineIndex?: number;
};

const MATERIAL_LABELS: Record<string, string> = {
  baston: 'Bastón',
  'banda elastica': 'Banda elástica',
  banco: 'Banco',
  pelota: 'Pelota',
  bloque: 'Bloque',
  libreta: 'Libreta',
  lapicera: 'Lapicera',
};

const MaterialIcons: Record<string, React.ReactNode> = {
  baston: (
    <svg viewBox="0 0 48 48" fill="none" className="w-full h-full" aria-hidden>
      <path d="M14 44V18l4-4 12 12 4-4v22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  'banda elastica': (
    <svg viewBox="0 0 48 24" fill="none" className="w-full h-full" aria-hidden>
      <path d="M6 12h36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 3" />
    </svg>
  ),
  banco: (
    <svg viewBox="0 0 48 32" fill="none" className="w-full h-full" aria-hidden>
      <rect x="4" y="12" width="40" height="8" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  ),
  pelota: (
    <svg viewBox="0 0 48 48" fill="none" className="w-full h-full" aria-hidden>
      <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  ),
  bloque: (
    <svg viewBox="0 0 48 48" fill="none" className="w-full h-full" aria-hidden>
      <rect x="10" y="14" width="28" height="20" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  ),
  libreta: (
    <svg viewBox="0 0 48 48" fill="none" className="w-full h-full" aria-hidden>
      <rect x="12" y="8" width="24" height="32" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M18 16h12M18 24h12M18 32h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  lapicera: (
    <svg viewBox="0 0 48 48" fill="none" className="w-full h-full" aria-hidden>
      <path d="M32 8l8 8-20 20-10 2 2-10z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="none" />
    </svg>
  ),
};

const INTRO_COUNTDOWN_SEC = 7;
const INTRO_MORE_TIME_SEC = 30;

type Props = {
  slug: string;
  classId: string;
};

export default function CourseClassPractice({ slug, classId }: Props) {
  const [practice, setPractice] = useState<Practice | null>(null);
  const [courseName, setCourseName] = useState('');
  const [modulos, setModulos] = useState<CursoModuloNav[]>([]);
  const [allClasses, setAllClasses] = useState<CursoClaseNavItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoAreaHover, setVideoAreaHover] = useState(false);
  const [introDismissed, setIntroDismissed] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const [countdown, setCountdown] = useState(INTRO_COUNTDOWN_SEC);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [videoPlayingSource, setVideoPlayingSource] = useState<'desktop' | 'mobile' | null>(null);

  const desktopPlayerRef = useRef<MoveCrewVideoPlayerHandle>(null);
  const mobilePlayerRef = useRef<MoveCrewVideoPlayerHandle>(null);
  const desktopVideoRef = useRef<HTMLVideoElement>(null);
  const mobileVideoRef = useRef<HTMLVideoElement>(null);

  const classHref = (id: string, timelineIndex: number) =>
    cursoClasePath(slug, id, timelineIndex);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/course-classes/${classId}`, { credentials: 'include', cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('Clase no encontrada'))))
      .then((doc) => {
        if (!cancelled) setPractice(doc);
      })
      .catch(() => {
        if (!cancelled) setPractice(null);
      });
    return () => {
      cancelled = true;
    };
  }, [classId]);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/curso/${slug}/contenido`, { credentials: 'include', cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data?.modulos) return;
        setCourseName(data.nombre || '');
        const mods = data.modulos as CursoModuloNav[];
        setModulos(mods);
        setAllClasses(flattenCursoClasesOrdered(mods));
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

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

  useEffect(() => {
    setIntroDismissed(false);
    setVideoEnded(false);
    setCountdown(INTRO_COUNTDOWN_SEC);
    setVideoCurrentTime(0);
    setVideoPlayingSource(null);
  }, [classId]);

  useEffect(() => {
    if (introDismissed || !practice) return;
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown((c) => (c <= 0 ? 0 : c - 1)), 1000);
    return () => clearInterval(t);
  }, [introDismissed, practice, countdown]);

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

  const vimeoId = practice?.videoId
    ? String(practice.videoId).trim()
    : extractVimeoId(practice?.videoUrl);
  const directVideoUrl =
    practice?.videoUrl && isDirectVideoUrl(practice.videoUrl) ? practice.videoUrl : null;

  const currentIndex = allClasses.findIndex((c) => c._id === classId);
  const nextClass =
    currentIndex >= 0 && currentIndex < allClasses.length - 1
      ? allClasses[currentIndex + 1]
      : null;
  const previousClass = currentIndex > 0 ? allClasses[currentIndex - 1] : null;

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

  useEffect(() => {
    if (countdown !== 0 || introDismissed || !practice) return;
    startVideo();
  }, [countdown, introDismissed, practice, startVideo]);

  const hasMaterials = !!(practice?.materials?.length);
  const materialsText = practice?.materials?.length
    ? practice.materials.map((m) => MATERIAL_LABELS[m] ?? m).join(', ')
    : null;

  const descripcionCompleta = practice
    ? resolveClaseDescripcionCompleta(practice)
    : '';
  const pdfUrl = practice?.pdfUrl?.trim() || '';

  const classDetails = (
    <>
      {descripcionCompleta && (
        <section>
          <h3 className="text-xs font-medium uppercase tracking-wider text-palette-sage mb-1.5">
            Sobre esta clase
          </h3>
          <p className="text-palette-cream/85 text-sm leading-relaxed whitespace-pre-line">
            {descripcionCompleta}
          </p>
        </section>
      )}
      {pdfUrl && (
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-palette-sage/30 bg-palette-sage/10 text-palette-cream text-sm font-medium py-2.5 px-4 hover:bg-palette-sage/20 transition-colors w-fit"
        >
          <DocumentArrowDownIcon className="w-5 h-5 shrink-0" />
          Descargar PDF de la clase
        </a>
      )}
    </>
  );

  const sidebarClassList = (
    <div className="space-y-5">
      {modulos.map((mod) => {
        const clases = [...(mod.clases || [])]
          .filter((c) => c?._id)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        if (clases.length === 0) return null;
        return (
          <section key={mod.timelineIndex}>
            <h2 className="text-xs font-medium text-palette-sage uppercase tracking-wider mb-2 px-1">
              {mod.titulo || `Módulo ${mod.timelineIndex + 1}`}
            </h2>
            <ul className="space-y-1">
              {clases.map((c) => {
                const isActive = c._id === classId;
                return (
                  <li key={c._id}>
                    <Link
                      href={classHref(c._id, mod.timelineIndex)}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                        isActive
                          ? 'bg-palette-sage/25 text-palette-cream font-medium'
                          : 'text-palette-cream/80 hover:bg-palette-sage/10 hover:text-palette-cream'
                      }`}
                    >
                      <span className="truncate">{c.name || 'Clase'}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );

  if (loading) {
    return (
      <MainSideBar where="membership">
        <div className="min-h-screen bg-palette-ink flex items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-palette-cream/30 border-t-palette-cream" />
        </div>
      </MainSideBar>
    );
  }

  if (!practice) {
    return (
      <MainSideBar where="membership">
        <div className="min-h-screen bg-palette-ink text-palette-cream flex flex-col items-center justify-center gap-4 px-6">
          <p>No se encontró la clase o no tenés acceso.</p>
          <Link href={routes.user.perfil} className="text-palette-sage hover:underline inline-flex items-center gap-2">
            <ArrowLeftIcon className="w-4 h-4" />
            Mis cursos
          </Link>
        </div>
      </MainSideBar>
    );
  }

  return (
    <MainSideBar where="membership">
      <div
        className="flex flex-col min-h-screen bg-palette-ink text-palette-cream font-montserrat overflow-x-clip max-w-[100vw] min-w-0 w-full"
        style={{ overflowX: 'clip' }}
      >
        <section className="relative w-full max-w-full md:h-screen md:min-h-[100vh] bg-palette-ink overflow-hidden overflow-x-clip shrink-0">
          {!introDismissed && practice && (
            <div
              className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 md:bg-black/70 md:backdrop-blur-sm"
              role="dialog"
              aria-labelledby="intro-popup-title"
            >
              <div
                className="w-full md:max-w-sm flex flex-col justify-center rounded-none md:rounded-3xl border-0 md:border md:border-palette-sage/20 bg-palette-ink md:shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-col items-center gap-6 p-6 md:px-8 pt-16 max-w-md mx-auto w-full text-center">
                  <header className="space-y-1">
                    <h2 id="intro-popup-title" className="font-montserrat text-lg md:text-xl font-light text-white">
                      {practice.name}
                    </h2>
                    {practice.duration != null && practice.duration > 0 && (
                      <p className="text-palette-sage/90 text-xs font-light">
                        {Math.round(practice.duration / 60)} min
                      </p>
                    )}
                  </header>

                  {hasMaterials && (
                    <div className="space-y-2 w-full">
                      <p className="text-palette-cream/80 text-xs font-light">Materiales para esta clase</p>
                      <ul className="flex flex-wrap justify-center gap-2">
                        {practice.materials!.map((key) => (
                          <li
                            key={key}
                            className="flex items-center gap-2 rounded-lg bg-palette-sage/10 border border-palette-sage/20 px-3 py-2"
                          >
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-palette-sage/15 text-palette-cream">
                              {MaterialIcons[key] ?? null}
                            </span>
                            <span className="text-palette-cream/90 text-xs font-light">
                              {MATERIAL_LABELS[key] ?? key}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex flex-col items-center py-2 md:py-4 border-y border-palette-sage/20 w-full">
                    <span className="text-palette-sage/80 text-xs uppercase tracking-wider">Empieza en</span>
                    <span className="font-montserrat text-2xl md:text-3xl font-light tabular-nums text-palette-sage mt-1">
                      {countdown > 0 ? countdown : '¡Listo!'}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 w-full">
                    <button
                      type="button"
                      onClick={startVideo}
                      className="flex-1 rounded-xl bg-palette-sage text-palette-ink text-sm font-light py-3 px-4 hover:bg-palette-sage/90 transition-all"
                    >
                      Empezar
                    </button>
                    <button
                      type="button"
                      onClick={() => setCountdown(INTRO_MORE_TIME_SEC)}
                      className="flex-1 rounded-xl border border-palette-sage/40 bg-palette-sage/10 text-palette-cream text-sm font-light py-3 px-4 hover:bg-palette-sage/20 transition-all"
                    >
                      Necesito más tiempo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {videoEnded && (
            <div className="fixed inset-0 z-[61] flex items-center justify-center p-4 bg-black/50 md:bg-black/70 md:backdrop-blur-sm">
              <div className="relative w-full md:max-w-md rounded-none md:rounded-3xl border-0 md:border md:border-palette-sage/20 bg-palette-ink md:shadow-2xl p-6 md:p-8 text-center">
                <button
                  type="button"
                  onClick={() => setVideoEnded(false)}
                  className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-palette-sage hover:bg-palette-sage/20"
                  aria-label="Cerrar"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-palette-sage/20 text-palette-sage mb-4">
                  <CheckCircleIcon className="w-9 h-9" strokeWidth={2} />
                </div>
                <h2 className="font-montserrat text-xl font-semibold text-white mb-2">Clase completada</h2>
                {nextClass ? (
                  <>
                    <p className="text-palette-cream/80 text-sm mb-4">
                      Siguiente: <span className="font-medium">{nextClass.name}</span>
                    </p>
                    <Link
                      href={classHref(nextClass._id, nextClass.timelineIndex)}
                      onClick={() => setVideoEnded(false)}
                      className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-palette-sage text-palette-ink font-medium py-3 px-4 hover:bg-palette-sage/90"
                    >
                      Siguiente: {nextClass.name}
                      <ChevronRightIcon className="w-5 h-5" />
                    </Link>
                  </>
                ) : (
                  <Link
                    href={routes.user.perfil}
                    onClick={() => setVideoEnded(false)}
                    className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-palette-sage text-palette-ink font-medium py-3 px-4 hover:bg-palette-sage/90"
                  >
                    Volver a mis cursos
                    <ArrowLeftIcon className="w-5 h-5" />
                  </Link>
                )}
              </div>
            </div>
          )}

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
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-palette-sage gap-4">
                <PlayIcon className="w-16 h-16 opacity-50" />
                <p>No hay video disponible.</p>
              </div>
            )}
          </div>

          <div
            className={`hidden md:block absolute top-0 bottom-0 right-0 h-full overflow-hidden transition-[left] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
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
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-palette-sage gap-4">
                  <PlayIcon className="w-16 h-16 opacity-50" />
                  <p>No hay video disponible.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className={`hidden md:flex fixed left-0 top-1/2 -translate-y-1/2 z-30 h-14 w-10 items-center justify-center rounded-r-xl bg-palette-ink/95 text-palette-cream shadow-lg border border-l-0 border-palette-sage/30 hover:bg-palette-ink hover:w-12 transition-all duration-500 ${
            sidebarOpen ? 'opacity-0 pointer-events-none -translate-x-4' : 'opacity-100 translate-x-0'
          }`}
          aria-label="Abrir menú de clases"
        >
          <ChevronRightIcon className="w-6 h-6 shrink-0" />
        </button>

        <div
          className={`hidden md:flex fixed inset-y-0 left-0 z-40 w-96 max-w-[90vw] flex-col bg-palette-ink border-r border-palette-sage/20 shadow-xl overflow-hidden pt-20 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-palette-sage/20 shrink-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-palette-sage/15 text-palette-cream hover:bg-palette-sage/25 border border-palette-sage/30"
              aria-label="Cerrar menú"
            >
              <ChevronLeftIcon className="w-6 h-6 shrink-0" strokeWidth={2.5} />
            </button>
            <Link href={routes.user.perfil} className="text-sm text-palette-sage hover:underline truncate">
              Mis cursos
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
            <section>
              {courseName ? (
                <p className="text-xs uppercase tracking-wider text-palette-sage mb-1">{courseName}</p>
              ) : null}
              <h1 className="text-xl font-medium text-white mb-2">{practice.name}</h1>
              {practice.duration != null && practice.duration > 0 && (
                <p className="text-palette-sage text-sm mb-2">
                  Duración: {Math.round(practice.duration / 60)} min
                </p>
              )}
              <p className="text-palette-cream/90 text-sm">
                {materialsText ? <>Materiales: {materialsText}</> : <>Sin materiales requeridos</>}
              </p>
            </section>
            {classDetails}
            <section>
              <h2 className="text-sm font-medium text-palette-sage uppercase tracking-wider mb-3">
                Clases del curso
              </h2>
              {sidebarClassList}
            </section>
            {previousClass && (
              <section className="mt-auto pt-4 border-t border-palette-sage/20">
                <Link
                  href={classHref(previousClass._id, previousClass.timelineIndex)}
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center justify-center gap-2 w-full rounded-xl border border-palette-sage/30 bg-palette-sage/10 text-palette-cream font-medium py-3 px-4 hover:bg-palette-sage/20"
                >
                  <ChevronLeftIcon className="w-5 h-5 shrink-0" />
                  <span className="truncate">Anterior: {previousClass.name}</span>
                </Link>
              </section>
            )}
            {nextClass && (
              <section className={previousClass ? 'pt-3' : 'mt-auto pt-4 border-t border-palette-sage/20'}>
                <Link
                  href={classHref(nextClass._id, nextClass.timelineIndex)}
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center justify-center gap-2 w-full rounded-xl bg-palette-sage text-palette-ink font-medium py-3 px-4 hover:bg-palette-sage/90"
                >
                  <span className="truncate">Siguiente: {nextClass.name}</span>
                  <ChevronRightIcon className="w-5 h-5 shrink-0" />
                </Link>
              </section>
            )}
          </div>
        </div>

        <div className="md:hidden w-full max-w-2xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
          <Link
            href={routes.user.perfil}
            className="text-sm text-palette-sage hover:underline inline-flex items-center gap-1 w-fit"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Mis cursos
          </Link>
          <section>
            {courseName ? (
              <p className="text-xs uppercase tracking-wider text-palette-sage mb-1">{courseName}</p>
            ) : null}
            <h1 className="text-xl font-medium text-white mb-2">{practice.name}</h1>
            {practice.duration != null && practice.duration > 0 && (
              <p className="text-palette-sage text-sm mb-2">
                Duración: {Math.round(practice.duration / 60)} min
              </p>
            )}
            <p className="text-palette-cream/90 text-sm">
              {materialsText ? <>Materiales: {materialsText}</> : <>Sin materiales requeridos</>}
            </p>
          </section>
          {classDetails}
          <section>
            <h2 className="text-sm font-medium text-palette-sage uppercase tracking-wider mb-3">
              Clases del curso
            </h2>
            {sidebarClassList}
          </section>
          {previousClass && (
            <Link
              href={classHref(previousClass._id, previousClass.timelineIndex)}
              className="flex items-center justify-center gap-2 w-full rounded-xl border border-palette-sage/30 bg-palette-sage/10 text-palette-cream font-medium py-3 px-4"
            >
              <ChevronLeftIcon className="w-5 h-5 shrink-0" />
              <span className="truncate">Anterior: {previousClass.name}</span>
            </Link>
          )}
          {nextClass && (
            <Link
              href={classHref(nextClass._id, nextClass.timelineIndex)}
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-palette-sage text-palette-ink font-medium py-3 px-4"
            >
              <span className="truncate">Siguiente: {nextClass.name}</span>
              <ChevronRightIcon className="w-5 h-5 shrink-0" />
            </Link>
          )}
        </div>
      </div>
    </MainSideBar>
  );
}
