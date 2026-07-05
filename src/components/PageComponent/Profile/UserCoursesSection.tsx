'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { routes } from '../../../constants/routes';
import { AcademicCapIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

type UserCourse = {
  productoId: string;
  nombre: string;
  descripcion: string;
  slug: string;
  ruta: string | null;
  rutaContenido?: string | null;
  imagen: string | null;
  fechaCompra: string;
  metodoPago?: string;
  monto?: number;
  moneda?: string;
};

function courseContenidoHref(course: UserCourse): string | null {
  if (course.rutaContenido?.trim()) return course.rutaContenido.trim();
  const slug = course.slug?.trim();
  if (!slug) return null;
  return routes.navegation.membership.cursoContenido(slug);
}

const paymentLabel: Record<string, string> = {
  stripe: 'Stripe',
  dlocalgo: 'dLocal GO',
  transferencia: 'Transferencia',
  gratis: 'Acceso gratuito',
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

export default function UserCoursesSection() {
  const [courses, setCourses] = useState<UserCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/user/cursos', {
          credentials: 'include',
          cache: 'no-store',
        });

        if (!response.ok) {
          setCourses([]);
          return;
        }

        const data = await response.json();
        setCourses(Array.isArray(data.cursos) ? data.cursos : []);
      } catch {
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="bg-palette-cream border border-palette-stone/25 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-[0_4px_24px_rgba(20,20,17,0.06)] transition-shadow duration-300 hover:border-palette-stone/40"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-palette-sage/15 border border-palette-stone/30 rounded-xl">
          <AcademicCapIcon className="w-6 h-6 text-palette-sage" />
        </div>
        <h2 className="text-xl md:text-2xl font-montserrat font-semibold text-palette-ink tracking-tight">
          Mis cursos
        </h2>
      </div>

      {loading ? (
        <p className="text-base text-palette-stone font-light">Cargando tus cursos...</p>
      ) : courses.length === 0 ? (
        <div className="space-y-4">
          <p className="text-base text-palette-stone font-light leading-relaxed">
            Todavía no tenés cursos adquiridos. Cuando completes una compra, vas a ver el acceso acá.
          </p>
          <Link
            href={routes.navegation.moveCrew}
            className="inline-flex items-center gap-2 px-6 py-3 font-montserrat font-semibold text-sm uppercase tracking-[0.2em] rounded-full bg-palette-ink text-palette-cream border-2 border-palette-ink transition-all duration-200 hover:bg-palette-sage hover:border-palette-sage hover:text-palette-ink"
          >
            Ver programas
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => {
            const contenidoHref = courseContenidoHref(course);
            return (
            <div
              key={`${course.productoId}-${course.fechaCompra}`}
              className="rounded-2xl border border-palette-stone/20 bg-white/60 p-5 md:p-6"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <p className="font-montserrat text-xs uppercase tracking-[0.2em] text-palette-stone">
                    Curso adquirido
                  </p>
                  <h3 className="text-lg md:text-xl font-montserrat font-semibold text-palette-ink">
                    {course.nombre}
                  </h3>
                  {course.descripcion ? (
                    <p className="text-sm md:text-base text-palette-stone font-light leading-relaxed">
                      {course.descripcion}
                    </p>
                  ) : null}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-palette-stone">
                    <span>Comprado el {formatDate(course.fechaCompra)}</span>
                    {course.metodoPago ? (
                      <span>{paymentLabel[course.metodoPago] || course.metodoPago}</span>
                    ) : null}
                  </div>
                </div>

                {contenidoHref ? (
                  <Link
                    href={contenidoHref}
                    className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-palette-ink bg-palette-ink px-5 py-3 font-montserrat text-sm font-semibold uppercase tracking-[0.16em] text-palette-cream transition-all duration-200 hover:bg-palette-sage hover:border-palette-sage hover:text-palette-ink"
                  >
                    Ir al curso
                    <ArrowRightIcon className="w-4 h-4" />
                  </Link>
                ) : null}
              </div>
            </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
