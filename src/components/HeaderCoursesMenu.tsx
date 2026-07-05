'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import { routes } from '../constants/routes';
import { parseCursoPublicPath } from '../lib/cursoPaths';

type UserCourseNavItem = {
  productoId: string;
  nombre: string;
  slug: string;
  rutaContenido: string | null;
};

function resolveCourseContenidoHref(course: UserCourseNavItem): string | null {
  if (course.rutaContenido?.trim()) return course.rutaContenido.trim();
  const slug = course.slug?.trim();
  if (!slug) return null;
  return routes.navegation.membership.cursoContenido(slug);
}

type HeaderCoursesMenuProps = {
  lightText: boolean;
  isActive?: boolean;
};

export default function HeaderCoursesMenu({
  lightText,
  isActive = false,
}: HeaderCoursesMenuProps) {
  const auth = useAuth();
  const pathname = usePathname();
  const [courses, setCourses] = useState<UserCourseNavItem[]>([]);
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const scheduleClose = () => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => setOpen(false), 180);
  };

  useEffect(() => () => clearCloseTimer(), []);

  const cursoPath = parseCursoPublicPath(pathname);
  const isOnCourseArea =
    cursoPath?.subpath === 'contenido' || cursoPath?.subpath === 'clase';

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 768);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    if (!auth.user) {
      setCourses([]);
      return;
    }

    let cancelled = false;

    fetch('/api/user/cursos', { credentials: 'include', cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return;
        const list = Array.isArray(data?.cursos) ? data.cursos : [];
        setCourses(
          list.filter(
            (c: UserCourseNavItem) =>
              c?.productoId && resolveCourseContenidoHref(c)
          )
        );
      })
      .catch(() => {
        if (!cancelled) setCourses([]);
      });

    return () => {
      cancelled = true;
    };
  }, [auth.user]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [open]);

  if (courses.length === 0) return null;
  if (isMobile) return null;

  const triggerClass = lightText
    ? isActive
      ? 'text-white/80 hover:text-white font-light'
      : 'text-white/80 hover:text-white font-light'
    : isActive
      ? 'text-palette-stone hover:text-palette-ink font-light'
      : 'text-palette-stone hover:text-palette-ink font-light';

  return (
    <div
      ref={menuRef}
      className="relative shrink-0"
      onMouseEnter={() => {
        if (!isMobile) {
          clearCloseTimer();
          setOpen(true);
        }
      }}
      onMouseLeave={() => {
        if (!isMobile) scheduleClose();
      }}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          clearCloseTimer();
          setOpen((v) => !v);
        }}
        className={`font-montserrat text-sm tracking-[0.1em] uppercase transition-all duration-200 whitespace-nowrap inline-flex items-center gap-1.5 ${triggerClass}`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        Mis programas
        <ChevronDownIcon
          className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>

      {open ? (
          <div className="absolute left-0 top-full z-[260] pt-2">
            <div className="min-w-[12rem] w-max max-w-[min(20rem,calc(100vw-2rem))] rounded-xl border border-palette-stone/20 bg-palette-ink py-2 shadow-xl">
              {courses.map((course) => {
                const href = resolveCourseContenidoHref(course);
                if (!href) return null;
                const isActive =
                  cursoPath?.slug === course.slug &&
                  (cursoPath.subpath === 'contenido' || cursoPath.subpath === 'clase');

                return (
                  <Link
                    key={course.productoId}
                    href={href}
                    className={`block px-4 py-2.5 font-montserrat text-sm transition-colors ${
                      isActive
                        ? 'bg-palette-stone/20 font-semibold text-palette-cream'
                        : 'text-palette-cream hover:bg-white/10'
                    }`}
                    onClick={() => setOpen(false)}
                  >
                    {course.nombre}
                  </Link>
                );
              })}
            </div>
          </div>
        ) : null}
    </div>
  );
}
