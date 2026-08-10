'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentArrowDownIcon,
  LockClosedIcon,
  PlayIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import MainSideBar from '../../MainSidebar/MainSideBar';
import MoveCrewVideoPlayer, {
  type MoveCrewVideoPlayerHandle,
} from '../ClassPage/MoveCrewVideoPlayer';
import CourseDarkSectionBackground from '../Course/CourseDarkSectionBackground';
import { landingEyebrowDark } from '../../../constants/landingSectionDesign';
import { resolveClaseDescripcionCompleta } from '../../../lib/cursoClaseDescripcion';
import ClassMaterialIcon, {
  getClassMaterialLabel,
} from '../../icons/ClassMaterialIcon';
import { toast } from '../../../hooks/useToast';
import { saveRedirectUrl } from '../../../utils/redirectQueue';
import { useAuth } from '../../../hooks/useAuth';
import valtioState from '../../../valtio';
import { MENTORSHIP_LANDING_CTA } from '../../../constants/mentorshipCta';

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

type FreeSequentialCtaPayload = {
  href: string;
  label: string;
  source: 'product' | 'mentorship';
};

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
  materials?: string[];
  previousClassId: string | null;
  nextClassId: string | null;
  nextUnlocked: boolean;
  requiresAuth?: boolean;
  cta?: FreeSequentialCtaPayload | null;
};

type NavClase = {
  _id: string;
  order: number;
  name: string;
  unlocked: boolean;
  status: 'not_started' | 'started' | 'completed';
};

const INTRO_COUNTDOWN_SEC = 7;
const INTRO_MORE_TIME_SEC = 30;
/** Segundos de preview del video antes de forzar login (guest). */
const AUTH_PREVIEW_SEC = 7;

type Props = {
  slug: string;
  classId: string;
};

type LoadState =
  | { kind: 'loading' }
  | { kind: 'blocked'; message: string; cta: FreeSequentialCtaPayload | null }
  | { kind: 'not_found' }
  | {
      kind: 'ready';
      practice: Practice;
      productName: string;
      clases: NavClase[];
      requiresAuth: boolean;
      cta: FreeSequentialCtaPayload;
    };

export default function FreeSequentialClassPractice({ slug, classId }: Props) {
  const auth = useAuth();
  const [state, setState] = useState<LoadState>({ kind: 'loading' });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [videoAreaHover, setVideoAreaHover] = useState(false);
  const [introDismissed, setIntroDismissed] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const [countdown, setCountdown] = useState(INTRO_COUNTDOWN_SEC);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [videoPlayingSource, setVideoPlayingSource] = useState<'desktop' | 'mobile' | null>(null);
  /** Guest: el video se vio unos segundos y ya está bloqueado + modal forzado. */
  const [previewLocked, setPreviewLocked] = useState(false);

  const desktopPlayerRef = useRef<MoveCrewVideoPlayerHandle>(null);
  const mobilePlayerRef = useRef<MoveCrewVideoPlayerHandle>(null);
  const desktopVideoRef = useRef<HTMLVideoElement>(null);
  const mobileVideoRef = useRef<HTMLVideoElement>(null);
  const wasRequiresAuth = useRef(false);
  const hydratingAfterAuth = useRef(false);

  const classHref = (id: string) => `/clases-gratis/${slug}/clase/${id}`;
  /** `lista=1` evita el auto-redirect a la primera clase desbloqueada. */
  const productHref = `/clases-gratis/${slug}?lista=1`;

  const fallbackCta: FreeSequentialCtaPayload = {
    href: MENTORSHIP_LANDING_CTA.href,
    label: MENTORSHIP_LANDING_CTA.label,
    source: 'mentorship',
  };

  const applyLoadedContent = useCallback(
    (opts: {
      practice: Practice;
      productName: string;
      clases: NavClase[];
      soft?: boolean;
    }) => {
      const requiresAuth = !!opts.practice.requiresAuth;
      const cta = opts.practice.cta || fallbackCta;
      wasRequiresAuth.current = requiresAuth;
      if (!opts.soft && requiresAuth) setCountdown(3);
      setState({
        kind: 'ready',
        practice: opts.practice,
        productName: opts.productName,
        clases: opts.clases,
        requiresAuth,
        cta,
      });
      if (opts.soft && !requiresAuth) {
        setPreviewLocked(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const fetchClassContent = useCallback(
    async (soft: boolean) => {
      const classRes = await fetch(`/api/free-sequential/classes/${classId}`, {
        credentials: 'include',
        cache: 'no-store',
      });

      if (classRes.status === 403) {
        const body = await classRes.json().catch(() => null);
        setPreviewLocked(false);
        setState({
          kind: 'blocked',
          message:
            body?.error ||
            'Esta clase todavía no está disponible. Revisá tu mail o completá la clase anterior.',
          cta: body?.cta || fallbackCta,
        });
        return;
      }
      if (!classRes.ok) {
        if (!soft) setState({ kind: 'not_found' });
        return;
      }

      const practice = (await classRes.json()) as Practice;
      const contenidoRes = await fetch(`/api/free-sequential/${slug}/contenido`, {
        credentials: 'include',
        cache: 'no-store',
      });

      let productName = '';
      let clases: NavClase[] = [];
      if (contenidoRes.ok) {
        const contenido = await contenidoRes.json();
        productName = contenido?.nombre || '';
        clases = Array.isArray(contenido?.clases)
          ? [...contenido.clases].sort(
              (a: NavClase, b: NavClase) => (a.order ?? 0) - (b.order ?? 0)
            )
          : [];
      }

      applyLoadedContent({ practice, productName, clases, soft });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [classId, slug, applyLoadedContent]
  );

  useEffect(() => {
    let cancelled = false;
    setState({ kind: 'loading' });
    setPreviewLocked(false);
    setIntroDismissed(false);
    setVideoEnded(false);
    setCountdown(INTRO_COUNTDOWN_SEC);
    setVideoCurrentTime(0);
    setVideoPlayingSource(null);

    fetchClassContent(false).catch(() => {
      if (!cancelled) setState({ kind: 'not_found' });
    });

    return () => {
      cancelled = true;
    };
  }, [classId, slug, fetchClassContent]);

  // Tras login/registro: hidratar en el lugar (sin recargar la página ni el spinner).
  useEffect(() => {
    if (!auth.user) {
      auth.fetchUser();
      return;
    }
    if (!wasRequiresAuth.current || hydratingAfterAuth.current) return;

    hydratingAfterAuth.current = true;
    wasRequiresAuth.current = false;
    valtioState.authModalForced = false;
    valtioState.loginForm = false;
    setPreviewLocked(false);

    fetchClassContent(true)
      .catch(() => {})
      .finally(() => {
        hydratingAfterAuth.current = false;
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.user, fetchClassContent]);

  // Gate de auth: deja reproducir el video unos segundos y después pausa + modal forzado.
  useEffect(() => {
    if (state.kind !== 'ready' || !state.requiresAuth) return;
    if (!introDismissed || previewLocked) return;
    if (typeof window !== 'undefined') {
      saveRedirectUrl(window.location.pathname);
    }
    const t = setTimeout(() => {
      desktopPlayerRef.current?.pause();
      mobilePlayerRef.current?.pause();
      desktopVideoRef.current?.pause();
      mobileVideoRef.current?.pause();
      setPreviewLocked(true);
      setVideoPlayingSource(null);
      valtioState.authModalMode = 'login';
      valtioState.authModalForced = true;
      valtioState.loginForm = true;
    }, AUTH_PREVIEW_SEC * 1000);
    return () => clearTimeout(t);
  }, [state, introDismissed, previewLocked]);

  useEffect(() => {
    return () => {
      if (valtioState.authModalForced) {
        valtioState.authModalForced = false;
        valtioState.loginForm = false;
      }
    };
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflowX;
    const prevBody = body.style.overflowX;
    const prevHtmlBg = html.style.backgroundColor;
    const prevBodyBg = body.style.backgroundColor;
    html.style.overflowX = 'clip';
    body.style.overflowX = 'clip';
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
    setPreviewLocked(false);
  }, [classId]);

  const practice = state.kind === 'ready' ? state.practice : null;
  const requiresAuth = state.kind === 'ready' ? state.requiresAuth : false;
  const videoBlocked = requiresAuth && previewLocked;

  useEffect(() => {
    if (introDismissed || !practice) return;
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown((c) => (c <= 0 ? 0 : c - 1)), 1000);
    return () => clearInterval(t);
  }, [introDismissed, practice, countdown]);

  const handlePlayingChangeDesktop = useCallback((playing: boolean) => {
    if (previewLocked) {
      desktopPlayerRef.current?.pause();
      return;
    }
    if (!playing) setSidebarOpen(true);
    if (playing) {
      setSidebarOpen(false);
      setVideoPlayingSource('desktop');
      mobilePlayerRef.current?.pause();
    } else setVideoPlayingSource(null);
  }, [previewLocked]);

  const handlePlayingChangeMobile = useCallback((playing: boolean) => {
    if (previewLocked) {
      mobilePlayerRef.current?.pause();
      return;
    }
    if (!playing) setSidebarOpen(true);
    if (playing) {
      setSidebarOpen(false);
      setVideoPlayingSource('mobile');
      desktopPlayerRef.current?.pause();
    } else setVideoPlayingSource(null);
  }, [previewLocked]);

  const vimeoId = practice?.videoId
    ? String(practice.videoId).trim()
    : extractVimeoId(practice?.videoUrl);
  const directVideoUrl =
    practice?.videoUrl && isDirectVideoUrl(practice.videoUrl) ? practice.videoUrl : null;

  const startVideo = useCallback(() => {
    if (previewLocked) return;
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
  }, [vimeoId, directVideoUrl, previewLocked]);

  useEffect(() => {
    if (previewLocked) return;
    if (countdown !== 0 || introDismissed || !practice) return;
    startVideo();
  }, [countdown, introDismissed, practice, startVideo, previewLocked]);

  const openLoginGate = useCallback(() => {
    if (typeof window !== 'undefined') {
      saveRedirectUrl(window.location.pathname);
    }
    valtioState.authModalMode = 'login';
    valtioState.authModalForced = true;
    valtioState.loginForm = true;
  }, []);

  const handleLockedClick = () => {
    toast.error('¡Esta clase se desbloquea pronto! Atención a tu casilla de correo.');
  };

  if (state.kind === 'loading') {
    return (
      <MainSideBar where="membership" className="bg-palette-ink">
        <div className="flex min-h-screen items-center justify-center bg-palette-ink">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-palette-cream/30 border-t-palette-cream" />
        </div>
      </MainSideBar>
    );
  }

  if (state.kind === 'blocked') {
    return (
      <MainSideBar where="membership" className="bg-palette-ink">
        <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-palette-ink px-6 text-center text-palette-cream">
          <LockClosedIcon className="h-12 w-12 text-palette-cream/50" />
          <p className="max-w-sm text-sm text-palette-cream/85">{state.message}</p>
          <Link
            href={productHref}
            className="inline-flex items-center gap-2 text-palette-sage hover:underline"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Volver a las clases
          </Link>
          {state.cta ? (
            <Link
              href={state.cta.href}
              className="mt-2 inline-flex items-center justify-center rounded-full border border-palette-cream/80 bg-palette-cream px-5 py-2.5 font-montserrat text-[11px] font-semibold uppercase tracking-[0.14em] text-palette-ink hover:bg-white"
            >
              {state.cta.label}
            </Link>
          ) : null}
        </div>
      </MainSideBar>
    );
  }

  if (state.kind === 'not_found' || !practice) {
    return (
      <MainSideBar where="membership" className="bg-palette-ink">
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-palette-ink px-6 text-palette-cream">
          <p>No se encontró la clase.</p>
          <Link
            href={productHref}
            className="inline-flex items-center gap-2 text-palette-sage hover:underline"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Volver a las clases
          </Link>
        </div>
      </MainSideBar>
    );
  }

  const { productName, clases, cta: pageCta } = state;
  const hasMaterials = !!(practice.materials?.length);
  const materialsText = practice.materials?.length
    ? practice.materials.map((m) => getClassMaterialLabel(m)).join(', ')
    : null;
  const descripcionCompleta = resolveClaseDescripcionCompleta(practice);
  const pdfUrl = practice.pdfUrl?.trim() || '';

  const previousClass = practice.previousClassId
    ? clases.find((c) => c._id === practice.previousClassId) || {
        _id: practice.previousClassId,
        name: 'Clase anterior',
        unlocked: true,
        order: 0,
        status: 'started' as const,
      }
    : null;
  const nextClass = practice.nextClassId
    ? clases.find((c) => c._id === practice.nextClassId) || {
        _id: practice.nextClassId,
        name: 'Clase siguiente',
        unlocked: practice.nextUnlocked,
        order: 0,
        status: 'not_started' as const,
      }
    : null;

  const classDetails = (
    <>
      {descripcionCompleta && (
        <section>
          <h3 className={`${landingEyebrowDark} mb-2`}>Sobre esta clase</h3>
          <p className="whitespace-pre-line text-[14px] font-normal leading-[1.68] text-palette-cream/85">
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
          <DocumentArrowDownIcon className="h-4 w-4 shrink-0" />
          Descargar PDF
        </a>
      )}
    </>
  );

  const sidebarClassList = (
    <ul className="space-y-0.5 border-t border-white/10">
      {clases.map((c, idx) => {
        const isActive = c._id === classId;
        const rowClass = `group flex w-full items-center gap-3 px-2 py-3 text-left text-[13px] leading-snug transition-colors ${
          isActive
            ? 'font-semibold text-palette-cream'
            : c.unlocked
              ? 'font-normal text-palette-cream/70 hover:text-palette-cream'
              : 'cursor-not-allowed font-normal text-palette-cream/40'
        }`;
        const numberBadge = (
          <span
            aria-hidden
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border font-montserrat text-[11px] font-semibold tabular-nums ${
              isActive
                ? 'border-palette-sage/70 bg-palette-ink text-palette-cream shadow-[0_0_0_3px_rgba(223,224,195,0.1)]'
                : c.unlocked
                  ? 'border-palette-cream/25 text-palette-cream/50 group-hover:border-palette-cream/45 group-hover:text-palette-cream/80'
                  : 'border-palette-cream/15 text-palette-cream/30'
            }`}
          >
            {(idx + 1).toString().padStart(2, '0')}
          </span>
        );

        return (
          <li key={c._id} className="border-b border-white/10">
            {c.unlocked ? (
              <Link
                href={classHref(c._id)}
                onClick={() => setSidebarOpen(false)}
                className={rowClass}
              >
                {numberBadge}
                <span className="min-w-0 flex-1 truncate tracking-tight">{c.name || 'Clase'}</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={handleLockedClick}
                className={rowClass}
                aria-label={`${c.name} — clase bloqueada`}
              >
                {numberBadge}
                <span className="min-w-0 flex-1 truncate tracking-tight">{c.name || 'Clase'}</span>
                <LockClosedIcon className="h-4 w-4 shrink-0 text-palette-cream/35" />
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );

  const navPrevClass =
    'inline-flex w-full items-center justify-center gap-2 rounded-full border border-palette-cream/45 bg-transparent px-4 py-2.5 font-montserrat text-[11px] font-semibold uppercase tracking-[0.14em] text-palette-cream transition-colors hover:border-palette-cream hover:bg-palette-cream/10';
  const navNextClass =
    'inline-flex w-full items-center justify-center gap-2 rounded-full border border-palette-cream/80 bg-palette-cream px-4 py-2.5 font-montserrat text-[11px] font-semibold uppercase tracking-[0.14em] text-palette-ink transition-colors hover:border-white hover:bg-white';
  const navNextDisabledClass =
    'inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full border border-palette-cream/20 bg-transparent px-4 py-2.5 font-montserrat text-[11px] font-semibold uppercase tracking-[0.14em] text-palette-cream/40';

  const nextNav = nextClass ? (
    practice.nextUnlocked ? (
      <Link href={classHref(nextClass._id)} onClick={() => setSidebarOpen(false)} className={navNextClass}>
        <span className="truncate font-medium normal-case tracking-normal">
          Siguiente: {nextClass.name}
        </span>
        <ChevronRightIcon className="h-4 w-4 shrink-0" />
      </Link>
    ) : (
      <button type="button" onClick={handleLockedClick} className={navNextDisabledClass} aria-disabled="true">
        <span className="truncate font-medium normal-case tracking-normal">
          Siguiente: {nextClass.name}
        </span>
        <LockClosedIcon className="h-4 w-4 shrink-0" />
      </button>
    )
  ) : null;

  return (
    <MainSideBar where="membership" sidebarOpen={sidebarOpen} className="bg-palette-ink">
      <div
        className="flex min-h-screen w-full min-w-0 max-w-[100vw] flex-col overflow-x-clip bg-palette-ink font-montserrat text-palette-cream"
        style={{ overflowX: 'clip' }}
      >
        <section className="relative w-full max-w-full shrink-0 overflow-hidden overflow-x-clip bg-palette-ink md:h-screen md:min-h-[100vh]">
          {!introDismissed && !previewLocked && practice && (
            <div
              className="fixed inset-0 z-[60] flex items-center justify-center bg-palette-ink/70 p-4 md:bg-palette-ink/80 md:backdrop-blur-sm"
              role="dialog"
              aria-label="Preparación de la clase"
            >
              <div
                className="relative isolate w-full overflow-hidden rounded-none border-0 border-white/10 bg-palette-ink shadow-[0_24px_60px_-20px_rgba(0,0,0,0.7),0_0_40px_-12px_rgba(172,174,137,0.16)] md:max-w-md md:rounded-3xl md:border"
                onClick={(e) => e.stopPropagation()}
              >
                <CourseDarkSectionBackground />
                <div className="relative z-20 mx-auto flex w-full max-w-md flex-col items-center gap-7 p-6 pt-16 text-center md:gap-8 md:px-9 md:pb-9 md:pt-12">
                  {practice.duration != null && practice.duration > 0 && (
                    <p className={`${landingEyebrowDark} !text-palette-cream/55`}>
                      {Math.round(practice.duration / 60)} min
                    </p>
                  )}

                  {hasMaterials && (
                    <div className="w-full space-y-3">
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
                            <span className="text-xs font-medium tracking-wide text-palette-cream">
                              {getClassMaterialLabel(key)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex w-full flex-col items-center border-y border-white/10 py-3 md:py-4">
                    <span className={`${landingEyebrowDark} !text-palette-cream/55`}>Empieza en</span>
                    <span className="mt-2 font-montserrat text-3xl font-semibold tabular-nums tracking-tight text-palette-cream md:text-4xl">
                      {countdown > 0 ? countdown : '¡Listo!'}
                    </span>
                  </div>

                  <div className="flex w-full flex-col gap-2.5 sm:flex-row sm:justify-center">
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
                    {!requiresAuth ? (
                      <button
                        type="button"
                        onClick={() => setCountdown(INTRO_MORE_TIME_SEC)}
                        className="inline-flex items-center justify-center rounded-full border border-palette-cream/45 bg-transparent px-4 py-1.5 font-montserrat text-[11px] font-semibold uppercase tracking-[0.16em] text-palette-cream transition-all duration-200 hover:border-palette-cream hover:bg-palette-cream/10"
                      >
                        Necesito más tiempo
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          )}

          {videoEnded && !requiresAuth && (
            <div className="fixed inset-0 z-[61] flex items-center justify-center bg-black/50 p-4 md:bg-black/70 md:backdrop-blur-sm">
              <div className="relative w-full rounded-none border-0 bg-palette-ink p-6 text-center md:max-w-md md:rounded-3xl md:border md:border-palette-sage/20 md:p-8 md:shadow-2xl">
                <button
                  type="button"
                  onClick={() => setVideoEnded(false)}
                  className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-palette-sage hover:bg-palette-sage/20"
                  aria-label="Cerrar"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-palette-sage/20 text-palette-sage">
                  <CheckCircleIcon className="h-9 w-9" strokeWidth={2} />
                </div>
                <h2 className="mb-2 font-montserrat text-xl font-semibold text-white">
                  Clase completada
                </h2>
                {nextClass && practice.nextUnlocked ? (
                  <>
                    <p className="mb-4 text-sm text-palette-cream/80">
                      Siguiente: <span className="font-medium">{nextClass.name}</span>
                    </p>
                    <Link
                      href={classHref(nextClass._id)}
                      onClick={() => setVideoEnded(false)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-palette-sage px-4 py-3 font-medium text-palette-ink hover:bg-palette-sage/90"
                    >
                      Siguiente: {nextClass.name}
                      <ChevronRightIcon className="h-5 w-5" />
                    </Link>
                  </>
                ) : (
                  <Link
                    href={productHref}
                    onClick={() => setVideoEnded(false)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-palette-sage px-4 py-3 font-medium text-palette-ink hover:bg-palette-sage/90"
                  >
                    Volver a las clases
                    <ArrowLeftIcon className="h-5 w-5" />
                  </Link>
                )}
              </div>
            </div>
          )}

          <div className="relative aspect-video w-full bg-palette-ink md:hidden">
            {vimeoId ? (
              <MoveCrewVideoPlayer
                ref={mobilePlayerRef}
                videoId={vimeoId}
                className="!h-full !w-full !shadow-none !ring-0"
                userStartsPlayback
                onEnded={() => !requiresAuth && setVideoEnded(true)}
                syncTime={videoCurrentTime}
                isActiveSource={videoPlayingSource === 'mobile'}
                onTimeUpdate={setVideoCurrentTime}
                onPlayingChange={handlePlayingChangeMobile}
              />
            ) : directVideoUrl ? (
              <video
                ref={mobileVideoRef}
                src={directVideoUrl}
                controls={!videoBlocked}
                className="h-full w-full object-contain bg-palette-ink"
                poster={practice.videoThumbnail || undefined}
                playsInline
                onEnded={() => !requiresAuth && setVideoEnded(true)}
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-4 text-palette-sage">
                <PlayIcon className="h-16 w-16 opacity-50" />
                <p>No hay video disponible.</p>
              </div>
            )}
            {requiresAuth && introDismissed ? (
              <div
                className={`absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-black/50 px-6 text-center ${
                  videoBlocked ? 'pointer-events-auto' : 'pointer-events-none'
                }`}
              >
                <p className="max-w-xs font-montserrat text-base font-semibold leading-snug text-white drop-shadow-md sm:text-lg">
                  Debés iniciar sesión para ver la clase
                </p>
                <button
                  type="button"
                  onClick={openLoginGate}
                  className="pointer-events-auto inline-flex items-center justify-center rounded-full border border-white/80 bg-transparent px-5 py-2.5 font-montserrat text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:border-white hover:bg-white/10"
                >
                  Iniciar sesión
                </button>
              </div>
            ) : null}
          </div>

          <div
            className={`absolute bottom-0 right-0 top-0 hidden h-full overflow-hidden bg-palette-ink transition-[left] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] md:block ${
              sidebarOpen ? 'left-96' : 'left-0'
            }`}
            onMouseEnter={() => !videoBlocked && setVideoAreaHover(true)}
            onMouseLeave={() => setVideoAreaHover(false)}
          >
            <div className="absolute inset-0 h-full w-full overflow-hidden bg-palette-ink">
              {vimeoId ? (
                <MoveCrewVideoPlayer
                  ref={desktopPlayerRef}
                  videoId={vimeoId}
                  className="!absolute !inset-0 !aspect-auto !h-full !min-h-full !w-full !min-w-full !shadow-none !ring-0"
                  userStartsPlayback
                  onPlayingChange={handlePlayingChangeDesktop}
                  showControlsFromParent={videoAreaHover && !videoBlocked}
                  onEnded={() => !requiresAuth && setVideoEnded(true)}
                  syncTime={videoCurrentTime}
                  isActiveSource={videoPlayingSource === 'desktop'}
                  onTimeUpdate={setVideoCurrentTime}
                />
              ) : directVideoUrl ? (
                <video
                  ref={desktopVideoRef}
                  src={directVideoUrl}
                  controls={!videoBlocked}
                  className="absolute inset-0 h-full w-full object-cover object-center"
                  poster={practice.videoThumbnail || undefined}
                  playsInline
                  onPlay={() => handlePlayingChangeDesktop(true)}
                  onPause={() => handlePlayingChangeDesktop(false)}
                  onEnded={() => !requiresAuth && setVideoEnded(true)}
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-palette-sage">
                  <PlayIcon className="h-16 w-16 opacity-50" />
                  <p>No hay video disponible.</p>
                </div>
              )}
              {requiresAuth && introDismissed ? (
                <div
                  className={`absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-black/50 px-6 text-center ${
                    videoBlocked ? 'pointer-events-auto' : 'pointer-events-none'
                  }`}
                >
                  <p className="max-w-sm font-montserrat text-lg font-semibold leading-snug text-white drop-shadow-md sm:text-xl">
                    Debés iniciar sesión para ver la clase
                  </p>
                  <button
                    type="button"
                    onClick={openLoginGate}
                    className="pointer-events-auto inline-flex items-center justify-center rounded-full border border-white/80 bg-transparent px-5 py-2.5 font-montserrat text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:border-white hover:bg-white/10"
                  >
                    Iniciar sesión
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className={`fixed left-0 top-1/2 z-30 hidden h-14 w-10 -translate-y-1/2 items-center justify-center rounded-r-xl border border-l-0 border-white/15 bg-palette-ink/95 text-palette-cream shadow-lg transition-all duration-500 hover:w-12 hover:bg-palette-ink md:flex ${
            sidebarOpen ? 'pointer-events-none -translate-x-4 opacity-0' : 'translate-x-0 opacity-100'
          }`}
          aria-label="Abrir menú de clases"
        >
          <ChevronRightIcon className="h-6 w-6 shrink-0" />
        </button>

        <div
          className={`fixed inset-y-0 left-0 z-40 hidden w-96 max-w-[90vw] flex-col overflow-hidden border-r border-white/10 bg-palette-ink pt-20 font-montserrat shadow-xl transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] md:flex ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-5 py-3.5">
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-palette-cream/30 text-palette-cream transition-colors hover:border-palette-cream/60 hover:bg-palette-cream/10"
              aria-label="Cerrar menú"
            >
              <ChevronLeftIcon className="h-5 w-5 shrink-0" strokeWidth={2.5} />
            </button>
            <Link
              href={productHref}
              className={`${landingEyebrowDark} truncate !text-palette-cream/70 transition-colors hover:!text-palette-cream`}
            >
              Todas las clases
            </Link>
          </div>
          <div className="flex flex-1 flex-col gap-7 overflow-y-auto px-5 py-6">
            <section>
              {productName ? <p className={`${landingEyebrowDark} mb-2`}>{productName}</p> : null}
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
              <h2 className={`${landingEyebrowDark} mb-4`}>Clases</h2>
              {sidebarClassList}
            </section>
            {previousClass && (
              <section className="mt-auto border-t border-white/10 pt-5">
                <Link
                  href={classHref(previousClass._id)}
                  onClick={() => setSidebarOpen(false)}
                  className={navPrevClass}
                >
                  <ChevronLeftIcon className="h-4 w-4 shrink-0" />
                  <span className="truncate font-medium normal-case tracking-normal">
                    Anterior: {previousClass.name}
                  </span>
                </Link>
              </section>
            )}
            {nextNav ? (
              <section className={previousClass ? 'pt-2.5' : 'mt-auto border-t border-white/10 pt-5'}>
                {nextNav}
              </section>
            ) : null}
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-2xl flex-col gap-7 px-4 py-8 font-montserrat sm:px-6 md:hidden">
          <Link
            href={productHref}
            className={`${landingEyebrowDark} inline-flex w-fit items-center gap-1.5 !text-palette-cream/70 transition-colors hover:!text-palette-cream`}
          >
            <ArrowLeftIcon className="h-3.5 w-3.5" />
            Todas las clases
          </Link>
          <section>
            {productName ? <p className={`${landingEyebrowDark} mb-2`}>{productName}</p> : null}
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
            <h2 className={`${landingEyebrowDark} mb-4`}>Clases</h2>
            {sidebarClassList}
          </section>
          {previousClass && (
            <Link href={classHref(previousClass._id)} className={navPrevClass}>
              <ChevronLeftIcon className="h-4 w-4 shrink-0" />
              <span className="truncate font-medium normal-case tracking-normal">
                Anterior: {previousClass.name}
              </span>
            </Link>
          )}
          {nextNav}
        </div>

        <div className="relative isolate w-full border-t border-white/10 bg-palette-ink px-4 py-8 sm:px-6 md:px-8 md:py-10">
          <CourseDarkSectionBackground />
          <div className="relative z-20 mx-auto flex max-w-3xl flex-col items-center gap-4 text-center md:flex-row md:items-center md:justify-between md:text-left">
            <div className="min-w-0">
              <p className={`${landingEyebrowDark} mb-2`}>Seguí tu camino</p>
              <p className="font-montserrat text-lg font-semibold tracking-tight text-palette-cream sm:text-xl">
                {pageCta.source === 'mentorship'
                  ? 'Trabajá 1 a 1 con Mateo'
                  : `Conocé ${pageCta.label}`}
              </p>
            </div>
            <Link
              href={pageCta.href}
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-palette-cream/80 bg-palette-cream px-6 py-3 font-montserrat text-[11px] font-semibold uppercase tracking-[0.14em] text-palette-ink transition-colors hover:border-white hover:bg-white"
            >
              {pageCta.label}
              <ChevronRightIcon className="h-4 w-4 shrink-0" />
            </Link>
          </div>
        </div>
      </div>
    </MainSideBar>
  );
}
