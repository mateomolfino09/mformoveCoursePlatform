'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LockClosedIcon, PlayIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';
import MainSideBar from '../../MainSidebar/MainSideBar';
import { toast } from '../../../hooks/useToast';
import { useAuth } from '../../../hooks/useAuth';

type FreeSequentialClase = {
  _id: string;
  order: number;
  name: string;
  description?: string;
  videoThumbnail?: string;
  duration?: number;
  unlocked: boolean;
  status: 'not_started' | 'started' | 'completed';
};

type ContenidoResponse = {
  productId: string;
  slug: string;
  nombre: string;
  descripcion: string;
  clases: FreeSequentialClase[];
};

type Props = {
  slug: string;
  /** Si true, redirige a la primera clase desbloqueada en cuanto carga el contenido. */
  autoEnterFirstClass?: boolean;
};

export default function FreeSequentialProductList({
  slug,
  autoEnterFirstClass = true,
}: Props) {
  const router = useRouter();
  const auth = useAuth();
  const [data, setData] = useState<ContenidoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/free-sequential/${slug}/contenido`, {
      credentials: 'include',
      cache: 'no-store',
    })
      .then(async (res) => {
        if (!res.ok) {
          if (!cancelled) setNotFound(true);
          return null;
        }
        return res.json();
      })
      .then((json) => {
        if (cancelled || !json) return;

        if (autoEnterFirstClass) {
          const clases = [...(json.clases || [])].sort(
            (a: FreeSequentialClase, b: FreeSequentialClase) => a.order - b.order
          );
          // Reanudar en la última clase ya visitada; si no hay progreso, ir a la 1ª.
          const started = clases.filter((c) => c.status !== 'not_started');
          const resume =
            started.length > 0 ? started[started.length - 1] : clases[0];
          if (resume?._id) {
            router.replace(`/clases-gratis/${slug}/clase/${resume._id}`);
            return;
          }
        }

        setData(json);
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug, router, autoEnterFirstClass, auth.user]);

  const handleLockedClick = () => {
    toast.error('¡Esta clase se desbloquea pronto! Atención a tu casilla de correo.');
  };

  if (loading || (autoEnterFirstClass && data === null && !notFound)) {
    return (
      <MainSideBar where="membership" className="bg-palette-ink">
        <div className="flex min-h-screen items-center justify-center bg-palette-ink">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-palette-cream/30 border-t-palette-cream" />
        </div>
      </MainSideBar>
    );
  }

  if (notFound || !data) {
    return (
      <MainSideBar where="membership" className="bg-palette-ink">
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-palette-ink px-6 text-palette-cream">
          <p>No se encontró este contenido.</p>
        </div>
      </MainSideBar>
    );
  }

  const clases = [...data.clases].sort((a, b) => a.order - b.order);

  return (
    <MainSideBar where="membership" className="bg-palette-ink">
      <div className="min-h-screen bg-palette-ink px-4 py-10 font-montserrat text-palette-cream sm:px-6 md:py-16">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-montserrat text-2xl font-bold tracking-tight sm:text-3xl">
            {data.nombre}
          </h1>
          {data.descripcion && (
            <p className="mt-3 text-sm leading-relaxed text-palette-cream/80">
              {data.descripcion}
            </p>
          )}

          <ul className="mt-8 space-y-3">
            {clases.map((clase) => {
              const durationLabel =
                clase.duration && clase.duration > 0
                  ? `${Math.round(clase.duration / 60)} min`
                  : null;

              const content = (
                <div
                  className={`flex items-center gap-4 rounded-xl border p-4 transition-colors ${
                    clase.unlocked
                      ? 'border-palette-cream/20 bg-palette-ink hover:border-palette-cream/40'
                      : 'border-palette-cream/10 bg-palette-ink/60 opacity-60'
                  }`}
                >
                  <span
                    aria-hidden
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-palette-cream/25 font-montserrat text-sm font-semibold tabular-nums text-palette-cream/80"
                  >
                    {clase.order}
                  </span>
                  {clase.videoThumbnail && (
                    <img
                      src={clase.videoThumbnail}
                      alt=""
                      className="hidden h-14 w-24 shrink-0 rounded-lg object-cover sm:block"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-palette-cream">
                      {clase.name}
                    </p>
                    {durationLabel && (
                      <p className="mt-1 text-xs text-palette-cream/55">{durationLabel}</p>
                    )}
                  </div>
                  {clase.unlocked ? (
                    <PlayIcon className="h-5 w-5 shrink-0 text-palette-cream/70" />
                  ) : (
                    <LockClosedIcon className="h-5 w-5 shrink-0 text-palette-cream/40" />
                  )}
                </div>
              );

              if (!clase.unlocked) {
                return (
                  <li key={clase._id}>
                    <button
                      type="button"
                      onClick={handleLockedClick}
                      className="w-full text-left"
                      aria-label={`${clase.name} — clase bloqueada`}
                    >
                      {content}
                    </button>
                  </li>
                );
              }

              return (
                <li key={clase._id}>
                  <Link href={`/clases-gratis/${slug}/clase/${clase._id}`}>{content}</Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </MainSideBar>
  );
}
