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
import CourseDarkSectionBackground from './CourseDarkSectionBackground';
import { cursoClasePath } from '../../../lib/cursoPaths';
import { MENTORSHIP_LANDING_CTA, MENTORSHIP_START_CTA } from '../../../constants/mentorshipCta';
import {
  CUERPO_AUTONOMO_DISCOUNT_PERCENT_ANUAL,
  CUERPO_AUTONOMO_DISCOUNT_PERCENT_SHORT,
} from '../../../constants/mentorshipCuerpoAutonomoDiscount';
import { routes } from '../../../constants/routes';
import {
  landingEyebrowDark,
} from '../../../constants/landingSectionDesign';
import {
  flattenCursoClasesOrdered,
  type CursoClaseNavItem,
  type CursoModuloNav,
} from '../../../lib/cursoContenidoNavigation';
import { resolveClaseDescripcionCompleta } from '../../../lib/cursoClaseDescripcion';
import ClassMaterialIcon, {
  getClassMaterialLabel,
} from '../../icons/ClassMaterialIcon';

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


const INTRO_COUNTDOWN_SEC = 7;
const INTRO_MORE_TIME_SEC = 30;
const MENTORSHIP_CTA_COUNTDOWN_SEC = 10;
const MENTORSHIP_CA_START_HREF = `${MENTORSHIP_START_CTA.href('trimestral')}&from=cuerpo-autonomo`;

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
  const [mentorshipCtaDismissed, setMentorshipCtaDismissed] = useState(false);
  const [mentorshipCtaCountdown, setMentorshipCtaCountdown] = useState(MENTORSHIP_CTA_COUNTDOWN_SEC);

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
    const prevHtmlBg = html.style.backgroundColor;
    const prevBodyBg = body.style.backgroundColor;
    html.style.overflowX = 'clip';
    body.style.overflowX = 'clip';
    // Mismo ink que sidebar/header para que al achicar el video no se vea otro tono detrás.
    html.style.backgroundColor = '#141411';
    body.style.backgroundColor = '#141411';
    return () => {
      html.style.overflowX = prevHtml;
      body.style.overflowX = prevBody;
      html.style.backgroundColor = prevHtmlBg;
      body.style.backgroundColor = prevBodyBg;
    };
  }, []);

  useEffect(() => {
    setIntroDismissed(false);
    setVideoEnded(false);
    setCountdown(INTRO_COUNTDOWN_SEC);
    setVideoCurrentTime(0);
    setVideoPlayingSource(null);
    setMentorshipCtaDismissed(false);
    setMentorshipCtaCountdown(MENTORSHIP_CTA_COUNTDOWN_SEC);
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
  const isLastClassOfModule =
    currentIndex >= 0 &&
    (currentIndex === allClasses.length - 1 ||
      allClasses[currentIndex + 1]?.timelineIndex !== allClasses[currentIndex]?.timelineIndex);
  const isLastClassOfCourse =
    currentIndex >= 0 && currentIndex === allClasses.length - 1;

  // Cuenta regresiva del banner de módulo: no aplica a la última clase del curso (ese CTA queda fijo).
  useEffect(() => {
    if (!isLastClassOfModule || isLastClassOfCourse || mentorshipCtaDismissed) return;
    if (mentorshipCtaCountdown <= 0) {
      setMentorshipCtaDismissed(true);
      return;
    }
    const t = setTimeout(() => setMentorshipCtaCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [
    isLastClassOfModule,
    isLastClassOfCourse,
    mentorshipCtaDismissed,
    mentorshipCtaCountdown,
  ]);

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
    ? practice.materials.map((m) => getClassMaterialLabel(m)).join(', ')
    : null;

  const descripcionCompleta = practice
    ? resolveClaseDescripcionCompleta(practice)
    : '';
  const pdfUrl = practice?.pdfUrl?.trim() || '';

  const classDetails = (
    <>
      {descripcionCompleta && (
        <section>
          <h3 className={`${landingEyebrowDark} mb-2`}>Sobre esta clase</h3>
          <p className="text-[14px] font-normal leading-[1.68] text-palette-cream/85 whitespace-pre-line">
            {descripcionCompleta}
          </p>
        </section>
      )}
      {pdfUrl && (
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-fit items-center gap-2 rounded-full border border-palette-cream/45 bg-transparent px-4 py-2 font-montserrat text-[11px] font-semibold uppercase tracking-[0.16em] text-palette-cream transition-colors hover:border-palette-cream hover:bg-palette-cream/10"
        >
          <DocumentArrowDownIcon className="w-4 h-4 shrink-0" />
          Descargar PDF
        </a>
      )}
    </>
  );

  const sidebarClassList = (
    <div className="space-y-6">
      {modulos.map((mod) => {
        const clases = [...(mod.clases || [])]
          .filter((c) => c?._id)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        if (clases.length === 0) return null;
        return (
          <section key={mod.timelineIndex}>
            <h2 className={`${landingEyebrowDark} mb-3 px-1`}>
              {mod.titulo || `Módulo ${mod.timelineIndex + 1}`}
            </h2>
            <ul className="space-y-0.5 border-t border-white/10">
              {clases.map((c, idx) => {
                const isActive = c._id === classId;
                return (
                  <li key={c._id} className="border-b border-white/10">
                    <Link
                      href={classHref(c._id, mod.timelineIndex)}
                      onClick={() => setSidebarOpen(false)}
                      className={`group flex items-center gap-3 px-2 py-3 text-[13px] leading-snug transition-colors ${
                        isActive
                          ? 'text-palette-cream font-semibold'
                          : 'text-palette-cream/70 font-normal hover:text-palette-cream'
                      }`}
                    >
                      <span
                        aria-hidden
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border font-montserrat text-[11px] font-semibold tabular-nums ${
                          isActive
                            ? 'border-palette-sage/70 bg-palette-ink text-palette-cream shadow-[0_0_0_3px_rgba(223,224,195,0.1)]'
                            : 'border-palette-cream/25 text-palette-cream/50 group-hover:border-palette-cream/45 group-hover:text-palette-cream/80'
                        }`}
                      >
                        {(idx + 1).toString().padStart(2, '0')}
                      </span>
                      <span className="min-w-0 flex-1 truncate tracking-tight">{c.name || 'Clase'}</span>
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

  const navPrevClass =
    'inline-flex w-full items-center justify-center gap-2 rounded-full border border-palette-cream/45 bg-transparent px-4 py-2.5 font-montserrat text-[11px] font-semibold uppercase tracking-[0.14em] text-palette-cream transition-colors hover:border-palette-cream hover:bg-palette-cream/10';
  const navNextClass =
    'inline-flex w-full items-center justify-center gap-2 rounded-full border border-palette-cream/80 bg-palette-cream px-4 py-2.5 font-montserrat text-[11px] font-semibold uppercase tracking-[0.14em] text-palette-ink transition-colors hover:border-white hover:bg-white';

  if (loading) {
    return (
      <MainSideBar where="membership" className="bg-palette-ink">
        <div className="min-h-screen bg-palette-ink flex items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-palette-cream/30 border-t-palette-cream" />
        </div>
      </MainSideBar>
    );
  }

  if (!practice) {
    return (
      <MainSideBar where="membership" className="bg-palette-ink">
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
    <MainSideBar where="membership" sidebarOpen={sidebarOpen} className="bg-palette-ink">
      <div
        className="flex flex-col min-h-screen bg-palette-ink text-palette-cream font-montserrat overflow-x-clip max-w-[100vw] min-w-0 w-full"
        style={{ overflowX: 'clip' }}
      >
        <section className="relative w-full max-w-full md:h-screen md:min-h-[100vh] bg-palette-ink overflow-hidden overflow-x-clip shrink-0">
          {!introDismissed && practice && (
            <div
              className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-palette-ink/70 md:bg-palette-ink/80 md:backdrop-blur-sm"
              role="dialog"
              aria-label="Preparación de la clase"
            >
              <div
                className="relative isolate w-full overflow-hidden rounded-none border-0 border-white/10 bg-palette-ink shadow-[0_24px_60px_-20px_rgba(0,0,0,0.7),0_0_40px_-12px_rgba(172,174,137,0.16)] md:max-w-md md:rounded-3xl md:border"
                onClick={(e) => e.stopPropagation()}
              >
                <CourseDarkSectionBackground />
                <div className="relative z-20 flex flex-col items-center gap-7 p-6 pt-16 md:gap-8 md:px-9 md:pb-9 md:pt-12 max-w-md mx-auto w-full text-center">
                  {practice.duration != null && practice.duration > 0 && (
                    <p className={`${landingEyebrowDark} !text-palette-cream/55`}>
                      {Math.round(practice.duration / 60)} min
                    </p>
                  )}

                  {hasMaterials && (
                    <div className="space-y-3 w-full">
                      <p className={`${landingEyebrowDark} !text-palette-cream/55`}>
                        Materiales para esta clase
                      </p>
                      <ul className="flex flex-wrap justify-center gap-2.5">
                        {practice.materials!.map((key) => (
                          <li
                            key={key}
                            className="flex items-center gap-2.5 rounded-full border border-palette-sage/40 bg-palette-ink/60 px-3.5 py-2 shadow-[0_0_0_4px_rgba(223,224,195,0.08)] backdrop-blur-[2px]"
                          >
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-palette-sage/50 bg-palette-ink p-1.5 text-palette-cream">
                              <ClassMaterialIcon material={key} />
                            </span>
                            <span className="text-palette-cream text-xs font-medium tracking-wide">
                              {getClassMaterialLabel(key)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex flex-col items-center py-3 md:py-4 border-y border-white/10 w-full">
                    <span className={`${landingEyebrowDark} !text-palette-cream/55`}>Empieza en</span>
                    <span className="font-montserrat mt-2 text-3xl md:text-4xl font-semibold tabular-nums tracking-tight text-palette-cream">
                      {countdown > 0 ? countdown : '¡Listo!'}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2.5 w-full sm:flex-row sm:justify-center">
                    <button
                      type="button"
                      onClick={startVideo}
                      className="group inline-flex items-center justify-center gap-1.5 rounded-full border border-palette-cream/80 bg-palette-cream px-4 py-1.5 font-montserrat text-[11px] font-semibold uppercase tracking-[0.16em] text-palette-ink transition-all duration-200 hover:border-white hover:bg-white sm:min-w-[7rem]"
                    >
                      <span>Empezar</span>
                      <span className="text-palette-ink/70 transition-transform duration-200 group-hover:translate-x-0.5">
                        →
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCountdown(INTRO_MORE_TIME_SEC)}
                      className="inline-flex items-center justify-center rounded-full border border-palette-cream/45 bg-transparent px-4 py-1.5 font-montserrat text-[11px] font-semibold uppercase tracking-[0.16em] text-palette-cream transition-all duration-200 hover:border-palette-cream hover:bg-palette-cream/10"
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
            className={`hidden md:block absolute top-0 bottom-0 right-0 h-full overflow-hidden bg-palette-ink transition-[left] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
              sidebarOpen ? 'left-96' : 'left-0'
            }`}
            onMouseEnter={() => setVideoAreaHover(true)}
            onMouseLeave={() => setVideoAreaHover(false)}
          >
            <div className="absolute inset-0 w-full h-full overflow-hidden bg-palette-ink">
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
          className={`hidden md:flex fixed left-0 top-1/2 -translate-y-1/2 z-30 h-14 w-10 items-center justify-center rounded-r-xl bg-palette-ink/95 text-palette-cream shadow-lg border border-l-0 border-white/15 hover:bg-palette-ink hover:w-12 transition-all duration-500 ${
            sidebarOpen ? 'opacity-0 pointer-events-none -translate-x-4' : 'opacity-100 translate-x-0'
          }`}
          aria-label="Abrir menú de clases"
        >
          <ChevronRightIcon className="w-6 h-6 shrink-0" />
        </button>

        <div
          className={`hidden md:flex fixed inset-y-0 left-0 z-40 w-96 max-w-[90vw] flex-col bg-palette-ink border-r border-white/10 shadow-xl overflow-hidden pt-20 font-montserrat transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-white/10 shrink-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-palette-cream/30 text-palette-cream transition-colors hover:border-palette-cream/60 hover:bg-palette-cream/10"
              aria-label="Cerrar menú"
            >
              <ChevronLeftIcon className="w-5 h-5 shrink-0" strokeWidth={2.5} />
            </button>
            <Link
              href={routes.user.perfil}
              className={`${landingEyebrowDark} !text-palette-cream/70 hover:!text-palette-cream transition-colors truncate`}
            >
              Mis cursos
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-7">
            <section>
              {courseName ? (
                <p className={`${landingEyebrowDark} mb-2`}>{courseName}</p>
              ) : null}
              <h1 className="font-montserrat text-[1.35rem] font-bold leading-[1.15] tracking-tight text-palette-cream">
                {practice.name}
              </h1>
              {practice.duration != null && practice.duration > 0 && (
                <p className="mt-2 text-[13px] text-palette-cream/55">
                  {Math.round(practice.duration / 60)} min
                </p>
              )}
              <p className="mt-2 text-[13px] leading-relaxed text-palette-cream/80">
                {materialsText ? <>Materiales: {materialsText}</> : <>Sin materiales requeridos</>}
              </p>
            </section>
            {classDetails}
            <section>
              <h2 className={`${landingEyebrowDark} mb-4`}>Clases del curso</h2>
              {sidebarClassList}
            </section>
            {previousClass && (
              <section className="mt-auto pt-5 border-t border-white/10">
                <Link
                  href={classHref(previousClass._id, previousClass.timelineIndex)}
                  onClick={() => setSidebarOpen(false)}
                  className={navPrevClass}
                >
                  <ChevronLeftIcon className="w-4 h-4 shrink-0" />
                  <span className="truncate normal-case tracking-normal font-medium">
                    Anterior: {previousClass.name}
                  </span>
                </Link>
              </section>
            )}
            {nextClass && (
              <section className={previousClass ? 'pt-2.5' : 'mt-auto pt-5 border-t border-white/10'}>
                <Link
                  href={classHref(nextClass._id, nextClass.timelineIndex)}
                  onClick={() => setSidebarOpen(false)}
                  className={navNextClass}
                >
                  <span className="truncate normal-case tracking-normal font-medium">
                    Siguiente: {nextClass.name}
                  </span>
                  <ChevronRightIcon className="w-4 h-4 shrink-0" />
                </Link>
              </section>
            )}
          </div>
        </div>

        <div className="md:hidden w-full max-w-2xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-7 font-montserrat">
          <Link
            href={routes.user.perfil}
            className={`${landingEyebrowDark} !text-palette-cream/70 hover:!text-palette-cream inline-flex items-center gap-1.5 w-fit transition-colors`}
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" />
            Mis cursos
          </Link>
          <section>
            {courseName ? (
              <p className={`${landingEyebrowDark} mb-2`}>{courseName}</p>
            ) : null}
            <h1 className="font-montserrat text-[1.45rem] font-bold leading-[1.15] tracking-tight text-palette-cream">
              {practice.name}
            </h1>
            {practice.duration != null && practice.duration > 0 && (
              <p className="mt-2 text-[13px] text-palette-cream/55">
                {Math.round(practice.duration / 60)} min
              </p>
            )}
            <p className="mt-2 text-[13px] leading-relaxed text-palette-cream/80">
              {materialsText ? <>Materiales: {materialsText}</> : <>Sin materiales requeridos</>}
            </p>
          </section>
          {classDetails}
          <section>
            <h2 className={`${landingEyebrowDark} mb-4`}>Clases del curso</h2>
            {sidebarClassList}
          </section>
          {previousClass && (
            <Link
              href={classHref(previousClass._id, previousClass.timelineIndex)}
              className={navPrevClass}
            >
              <ChevronLeftIcon className="w-4 h-4 shrink-0" />
              <span className="truncate normal-case tracking-normal font-medium">
                Anterior: {previousClass.name}
              </span>
            </Link>
          )}
          {nextClass && (
            <Link
              href={classHref(nextClass._id, nextClass.timelineIndex)}
              className={navNextClass}
            >
              <span className="truncate normal-case tracking-normal font-medium">
                Siguiente: {nextClass.name}
              </span>
              <ChevronRightIcon className="w-4 h-4 shrink-0" />
            </Link>
          )}
        </div>

        {isLastClassOfModule && !mentorshipCtaDismissed && (
          <div
            className={`fixed inset-x-0 bottom-0 z-50 ${
              isLastClassOfCourse ? 'px-0 pb-0 sm:px-5 sm:pb-5' : 'px-0 pb-0 sm:px-4 sm:pb-4'
            }`}
          >
            <div
              className={`relative isolate mx-auto overflow-hidden border-t border-white/10 bg-palette-ink shadow-[0_-20px_50px_-12px_rgba(0,0,0,0.65),0_0_40px_-8px_rgba(172,174,137,0.18)] sm:rounded-2xl sm:border sm:border-white/10 ${
                isLastClassOfCourse
                  ? 'flex max-w-4xl flex-col gap-5 px-5 py-6 sm:px-8 sm:py-8 md:flex-row md:items-center md:gap-6'
                  : 'flex max-w-3xl items-center gap-3 px-4 py-3.5 sm:px-5'
              }`}
            >
              <CourseDarkSectionBackground />
              <div className={`relative z-20 min-w-0 flex-1 ${isLastClassOfCourse ? 'text-center md:text-left' : ''}`}>
                <p
                  className={
                    isLastClassOfCourse
                      ? 'font-montserrat text-xl font-semibold leading-tight tracking-tight text-palette-cream sm:text-2xl md:text-3xl'
                      : 'truncate text-sm font-semibold leading-tight text-palette-cream sm:text-base'
                  }
                >
                  {isLastClassOfCourse ? 'Trabaja 1 a 1 con Mateo' : '¿Terminaste este módulo?'}
                </p>
                <p
                  className={
                    isLastClassOfCourse
                      ? 'mt-2 text-sm leading-relaxed text-palette-cream/80 sm:text-base md:text-lg'
                      : 'truncate text-xs text-palette-cream/75 sm:text-sm'
                  }
                >
                  {isLastClassOfCourse
                    ? `Seguí tu proceso con un descuento especial de hasta ${CUERPO_AUTONOMO_DISCOUNT_PERCENT_ANUAL}% por formar parte de ${courseName}`
                    : 'Llevá tu progreso al siguiente nivel con la Mentoría'}
                </p>
              </div>
              <div
                className={`relative z-20 flex shrink-0 items-center gap-2 sm:gap-3 ${
                  isLastClassOfCourse ? 'w-full justify-center md:w-auto md:justify-end' : ''
                }`}
              >
                <Link
                  href={
                    isLastClassOfCourse
                      ? MENTORSHIP_CA_START_HREF
                      : MENTORSHIP_LANDING_CTA.href
                  }
                  className={
                    isLastClassOfCourse
                      ? 'inline-flex items-center gap-2 rounded-full border-2 border-palette-cream/80 bg-palette-cream px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.16em] text-palette-ink transition-colors hover:border-white hover:bg-white sm:px-9 sm:py-4 sm:text-base'
                      : 'inline-flex shrink-0 items-center gap-1.5 rounded-full border border-palette-cream/80 bg-palette-cream px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-palette-ink transition-colors hover:border-white hover:bg-white sm:px-5 sm:text-sm'
                  }
                >
                  {isLastClassOfCourse ? 'Empezar Mentoría' : 'Conocer'}
                  <ChevronRightIcon className={isLastClassOfCourse ? 'h-5 w-5 shrink-0' : 'h-4 w-4 shrink-0'} />
                </Link>
                {!isLastClassOfCourse ? (
                  <span
                    className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full border border-palette-cream/25 text-xs font-semibold tabular-nums text-palette-cream/80 sm:flex"
                    aria-hidden
                  >
                    {mentorshipCtaCountdown}
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={() => setMentorshipCtaDismissed(true)}
                  aria-label="Cerrar"
                  className={
                    isLastClassOfCourse
                      ? 'flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-palette-cream/70 transition-colors hover:bg-palette-cream/10 hover:text-palette-cream'
                      : 'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-palette-cream/70 transition-colors hover:bg-palette-cream/10 hover:text-palette-cream'
                  }
                >
                  <XMarkIcon className={isLastClassOfCourse ? 'h-6 w-6' : 'h-5 w-5'} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainSideBar>
  );
}
