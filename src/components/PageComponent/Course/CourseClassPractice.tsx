'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeftIcon, PlayIcon } from '@heroicons/react/24/outline';
import MainSideBar from '../../MainSidebar/MainSideBar';
import { cursoClasePath, cursoContenidoPath } from '../../../lib/cursoPaths';
import MoveCrewVideoPlayer, {
  type MoveCrewVideoPlayerHandle,
} from '../ClassPage/MoveCrewVideoPlayer';

const MATERIAL_LABELS: Record<string, string> = {
  baston: 'Bastón',
  'banda elastica': 'Banda elástica',
  banco: 'Banco',
  pelota: 'Pelota',
};

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
  timelineIndex?: number;
};

type Sibling = { _id: string; name: string; order?: number };

type Props = {
  slug: string;
  classId: string;
};

export default function CourseClassPractice({ slug, classId }: Props) {
  const searchParams = useSearchParams();
  const moduloParam = searchParams.get('modulo');
  const timelineIndex = moduloParam != null ? Number(moduloParam) : null;

  const [practice, setPractice] = useState<Practice | null>(null);
  const [siblings, setSiblings] = useState<Sibling[]>([]);
  const [loading, setLoading] = useState(true);
  const [introDismissed, setIntroDismissed] = useState(false);
  const playerRef = useRef<MoveCrewVideoPlayerHandle>(null);

  const hubPath = cursoContenidoPath(slug);
  const practicePath = (id: string) =>
    cursoClasePath(
      slug,
      id,
      timelineIndex != null && !Number.isNaN(timelineIndex) ? timelineIndex : undefined
    );

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/course-classes/${classId}`, { credentials: 'include', cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('Clase no encontrada'))))
      .then((doc) => {
        if (!cancelled) setPractice(doc);
      })
      .catch(() => {
        if (!cancelled) setPractice(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
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
        const mod =
          timelineIndex != null && !Number.isNaN(timelineIndex)
            ? data.modulos.find((m: { timelineIndex: number }) => m.timelineIndex === timelineIndex)
            : data.modulos.find((m: { clases: { _id: string }[] }) =>
                m.clases.some((c: { _id: string }) => c._id === classId)
              );
        const list = (mod?.clases || []) as Sibling[];
        setSiblings([...list].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [slug, classId, timelineIndex]);

  const startVideo = useCallback(() => {
    setIntroDismissed(true);
    requestAnimationFrame(() => playerRef.current?.play());
  }, []);

  const vimeoId = practice?.videoId
    ? String(practice.videoId).trim()
    : extractVimeoId(practice?.videoUrl);

  const currentIndex = siblings.findIndex((c) => c._id === classId);
  const nextClass = currentIndex >= 0 && currentIndex < siblings.length - 1 ? siblings[currentIndex + 1] : null;
  const prevClass = currentIndex > 0 ? siblings[currentIndex - 1] : null;

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
          <Link href={hubPath} className="text-palette-sage hover:underline inline-flex items-center gap-2">
            <ArrowLeftIcon className="w-4 h-4" />
            Volver al contenido
          </Link>
        </div>
      </MainSideBar>
    );
  }

  return (
    <MainSideBar where="membership">
      <div className="min-h-screen bg-palette-ink text-palette-cream font-montserrat">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <Link
            href={hubPath}
            className="inline-flex items-center gap-2 text-sm text-palette-cream/70 hover:text-palette-cream mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Volver al curso
          </Link>

          {!introDismissed ? (
            <div className="rounded-2xl border border-palette-stone/25 bg-palette-ink p-6 md:p-8 space-y-4">
              <h1 className="text-2xl font-semibold">{practice.name}</h1>
              {practice.description ? (
                <p className="text-palette-cream/80 text-sm">{practice.description}</p>
              ) : null}
              {practice.materials?.length ? (
                <div>
                  <p className="text-xs uppercase tracking-wide text-palette-stone mb-2">
                    Materiales
                  </p>
                  <p className="text-sm">
                    {practice.materials.map((m) => MATERIAL_LABELS[m] ?? m).join(' · ')}
                  </p>
                </div>
              ) : null}
              <button
                type="button"
                onClick={startVideo}
                className="rounded-full bg-palette-sage text-palette-ink px-8 py-3 text-sm font-semibold uppercase tracking-wide"
              >
                Empezar clase
              </button>
            </div>
          ) : (
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black mb-6">
              {vimeoId ? (
                <MoveCrewVideoPlayer
                  ref={playerRef}
                  videoId={vimeoId}
                  className="w-full h-full"
                />
              ) : (
                <div className="flex h-full items-center justify-center gap-2 text-palette-stone">
                  <PlayIcon className="h-12 w-12 opacity-50" />
                  <span>Sin video configurado</span>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-3 mt-4">
            {prevClass ? (
              <Link
                href={practicePath(prevClass._id)}
                className="text-sm text-palette-sage hover:underline"
              >
                ← {prevClass.name}
              </Link>
            ) : null}
            {nextClass ? (
              <Link
                href={practicePath(nextClass._id)}
                className="text-sm text-palette-sage hover:underline ml-auto"
              >
                {nextClass.name} →
              </Link>
            ) : null}
          </div>

          {siblings.length > 1 ? (
            <ul className="mt-8 space-y-2 border-t border-palette-stone/20 pt-6">
              <p className="text-xs uppercase tracking-wide text-palette-stone mb-2">
                Clases del módulo
              </p>
              {siblings.map((c) => (
                <li key={c._id}>
                  <Link
                    href={practicePath(c._id)}
                    className={`block rounded-lg px-3 py-2 text-sm ${
                      c._id === classId
                        ? 'bg-palette-sage/20 text-palette-cream'
                        : 'hover:bg-white/5 text-palette-cream/80'
                    }`}
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </MainSideBar>
  );
}
