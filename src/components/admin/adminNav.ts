import type { ComponentType, SVGProps } from 'react';
import {
  HomeIcon,
  UsersIcon,
  LockClosedIcon,
  BuildingStorefrontIcon,
  AcademicCapIcon,
  ShoppingBagIcon,
  CalendarDaysIcon,
  QuestionMarkCircleIcon,
  SparklesIcon,
  RectangleStackIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline';

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

export type AdminNavItem = {
  href: string;
  label: string;
  description?: string;
  icon: Icon;
  match: (pathname: string) => boolean;
};

export type AdminNavGroup = {
  id: string;
  label: string;
  items: AdminNavItem[];
};

const starts = (prefix: string) => (pathname: string) =>
  pathname === prefix || pathname.startsWith(`${prefix}/`);

export const adminNav: AdminNavGroup[] = [
  {
    id: 'general',
    label: 'General',
    items: [
      {
        href: '/admin',
        label: 'Inicio',
        description: 'Resumen y accesos',
        icon: HomeIcon,
        match: (p) => p === '/admin',
      },
    ],
  },
  {
    id: 'personas',
    label: 'Personas',
    items: [
      {
        href: '/admin/usuarios',
        label: 'Usuarios',
        description: 'Cuentas, roles y VIP',
        icon: UsersIcon,
        match: (p) =>
          starts('/admin/usuarios')(p) ||
          starts('/admin/users')(p) ||
          starts('/admin/actualizar-usuario')(p) ||
          starts('/admin/updateUser')(p),
      },
      {
        href: '/admin/accesos',
        label: 'Accesos',
        description: 'Otorgar cursos a un email',
        icon: LockClosedIcon,
        match: starts('/admin/accesos'),
      },
    ],
  },
  {
    id: 'contenido',
    label: 'Contenido',
    items: [
      {
        href: '/admin/membresias',
        label: 'Membresías',
        description: 'Planes, clases y caminos',
        icon: BuildingStorefrontIcon,
        match: (p) => starts('/admin/membresias')(p) || starts('/admin/memberships')(p),
      },
      {
        href: '/admin/mentorias',
        label: 'Mentoría',
        description: 'Planes, solicitudes y analytics',
        icon: AcademicCapIcon,
        match: (p) => starts('/admin/mentorias')(p) || starts('/admin/mentorship')(p),
      },
      {
        href: '/admin/productos',
        label: 'Productos',
        description: 'Cursos, eventos y filtros',
        icon: ShoppingBagIcon,
        match: (p) => starts('/admin/productos')(p) || starts('/admin/products')(p),
      },
      {
        href: '/admin/programas-transformacionales',
        label: 'Programas',
        description: 'Cohortes y automatización',
        icon: RectangleStackIcon,
        match: (p) =>
          starts('/admin/programas-transformacionales')(p) ||
          starts('/admin/transformational-programs')(p),
      },
      {
        href: '/admin/clases-presenciales',
        label: 'Horarios',
        description: 'Clases presenciales y virtuales',
        icon: CalendarDaysIcon,
        match: (p) =>
          starts('/admin/clases-presenciales')(p) || starts('/admin/in-person-classes')(p),
      },
      {
        href: '/admin/preguntas-frecuentes',
        label: 'FAQ',
        description: 'Preguntas frecuentes',
        icon: QuestionMarkCircleIcon,
        match: (p) =>
          starts('/admin/preguntas-frecuentes')(p) || starts('/admin/faq')(p),
      },
    ],
  },
  {
    id: 'sistema',
    label: 'Sistema',
    items: [
      {
        href: '/admin/gestion-ia',
        label: 'IA',
        description: 'Voz de marca y emails',
        icon: SparklesIcon,
        match: (p) =>
          starts('/admin/gestion-ia')(p) ||
          starts('/admin/ai-management')(p) ||
          starts('/admin/correos-automaticos')(p) ||
          starts('/admin/auto-emails')(p),
      },
      {
        href: '/admin/facturacion',
        label: 'Facturación',
        description: 'Pagos registrados',
        icon: CreditCardIcon,
        match: starts('/admin/facturacion'),
      },
    ],
  },
];

export function findAdminNavItem(pathname: string): AdminNavItem | null {
  for (const group of adminNav) {
    for (const item of group.items) {
      if (item.match(pathname)) return item;
    }
  }
  return null;
}

export const adminHomeDirectory = adminNav.flatMap((group) =>
  group.items.filter((item) => item.href !== '/admin')
);
