'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, PlayIcon } from '@heroicons/react/24/solid';
import MainSideBar from '../../MainSidebar/MainSideBar';
import Footer from '../../Footer';
import { routes } from '../../../constants/routes';
import { cursoClasePath } from '../../../lib/cursoPaths';

type CourseClassItem = {
  _id: string;
  name: string;
  description?: string;
  duration?: number;
  level?: number;
  materials?: string[];
  order?: number;
};

type ModuloContenido = {
  timelineIndex: number;
  titulo: string;
  bundleTipo: 'vimeo_playlist' | 'videos';
  vimeoPlaylistId?: string;
  clases: CourseClassItem[];
};

type ContenidoPayload = {
  productId: string;
  slug: string;
  nombre: string;
  contenidoDisponible: boolean;
  fechaLanzamiento: string | null;
  invitacionGrupoWhatsapp: string | null;
  modulos: ModuloContenido[];
};

type Props = {
  slug: string;
};

export default function CourseContentHub({ slug }: Props) {
  const [data, setData] = useState<ContenidoPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/curso/${slug}/contenido`, { credentials: 'include', cache: 'no-store' })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'No se pudo cargar el contenido');
        return json as ContenidoPayload;
      })
      .then((payload) => {
        if (!cancelled) setData(payload);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Error');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const landingPath = routes.navegation.membership.curso(slug);

  return (
    <MainSideBar where="membership">
      <div className="min-h-screen bg-palette-cream font-montserrat text-palette-ink">
        <motion.div className="mx-auto w-[90%] max-w-4xl px-4 py-10 md:py-14">
          <Link
            href={routes.navegation.user.perfil}
            className="inline-flex items-center gap-2 text-sm text-palette-stone hover:text-palette-ink mb-6"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Mis cursos
          </Link>

          {loading ? (
            <p className="text-palette-stone">Cargando contenido...</p>
          ) : error ? (
            <div className="rounded-2xl border border-palette-stone/25 bg-white p-6 space-y-4">
              <p className="text-palette-ink">{error}</p>
              <Link
                href={landingPath}
                className="inline-flex rounded-full border-2 border-palette-ink px-5 py-2 text-sm font-semibold uppercase tracking-wide"
              >
                Ver página del curso
              </Link>
            </div>
          ) : data ? (
            <>
              <p className="text-xs uppercase tracking-[0.2em] text-palette-sage mb-2">
                Contenido del curso
              </p>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
                {data.nombre}
              </h1>

              {data.invitacionGrupoWhatsapp ? (
                <a
                  href={data.invitacionGrupoWhatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex mb-8 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                >
                  Unirme al grupo de WhatsApp
                </a>
              ) : null}

              <div className="space-y-6">
                {data.modulos.map((modulo) => (
                  <section
                    key={modulo.timelineIndex}
                    className="rounded-2xl border border-palette-stone/20 bg-white/80 p-5 md:p-6 shadow-sm"
                  >
                    <h2 className="text-lg md:text-xl font-semibold mb-1">
                      {modulo.titulo || `Módulo ${modulo.timelineIndex + 1}`}
                    </h2>
                    {modulo.bundleTipo === 'vimeo_playlist' && modulo.vimeoPlaylistId ? (
                      <p className="text-sm text-palette-stone mb-4">
                        Playlist Vimeo: {modulo.vimeoPlaylistId}
                      </p>
                    ) : null}

                    {modulo.clases.length === 0 ? (
                      <p className="text-sm text-palette-stone">
                        Todavía no hay clases en este módulo.
                      </p>
                    ) : (
                      <ul className="space-y-2">
                        {modulo.clases.map((clase) => (
                          <li key={clase._id}>
                            <Link
                              href={cursoClasePath(slug, clase._id, modulo.timelineIndex)}
                              className="flex items-center justify-between gap-3 rounded-xl border border-palette-stone/15 px-4 py-3 hover:border-palette-sage hover:bg-palette-sage/5 transition-colors"
                            >
                              <div>
                                <p className="font-medium">{clase.name}</p>
                                {clase.description ? (
                                  <p className="text-sm text-palette-stone line-clamp-1">
                                    {clase.description}
                                  </p>
                                ) : null}
                                <p className="text-xs text-palette-stone mt-1">
                                  Nivel {clase.level ?? 1}
                                  {clase.duration
                                    ? ` · ${Math.max(1, Math.round(clase.duration / 60))} min`
                                    : ''}
                                  {clase.materials?.length
                                    ? ` · ${clase.materials.join(', ')}`
                                    : ''}
                                </p>
                              </div>
                              <PlayIcon className="w-6 h-6 shrink-0 text-palette-sage" />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                ))}
              </div>
            </>
          ) : null}
        </motion.div>
      </div>
      <Footer />
    </MainSideBar>
  );
}
