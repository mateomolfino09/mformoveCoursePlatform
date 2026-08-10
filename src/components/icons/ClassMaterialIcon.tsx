import type { ReactNode, SVGProps } from 'react';

/** Keys de materiales usados en curso / biblioteca / bitácora. */
export const CLASS_MATERIAL_KEYS = [
  'baston',
  'banda elastica',
  'banco',
  'pelota',
  'bloque',
  'libreta',
  'lapicera',
] as const;

export type ClassMaterialKey = (typeof CLASS_MATERIAL_KEYS)[number];

export const CLASS_MATERIAL_LABELS: Record<ClassMaterialKey, string> = {
  baston: 'Bastón',
  'banda elastica': 'Banda elástica',
  banco: 'Banco',
  pelota: 'Pelota',
  bloque: 'Bloque',
  libreta: 'Libreta',
  lapicera: 'Lapicera',
};

export function getClassMaterialLabel(key: string): string {
  return CLASS_MATERIAL_LABELS[key as ClassMaterialKey] ?? key;
}

type IconSvgProps = SVGProps<SVGSVGElement>;

const iconBase = {
  viewBox: '0 0 48 48',
  fill: 'none',
  xmlns: 'http://www.w3.org/2000/svg',
  'aria-hidden': true as const,
  className: 'h-full w-full',
};

const stroke = {
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

/** Bastón de movilidad / apoyo — diagonal con extremos redondeados. */
function BastonIcon(props: IconSvgProps) {
  return (
    <svg {...iconBase} {...props}>
      <path d="M14.5 41.5 33.5 6.5" {...stroke} />
      <path d="M12.2 39.2a2.8 2.8 0 1 0 4.6 3.1 2.8 2.8 0 0 0-4.6-3.1Z" {...stroke} />
      <path d="M31.2 4.2a2.8 2.8 0 1 0 4.6 3.1 2.8 2.8 0 0 0-4.6-3.1Z" {...stroke} />
      <path d="M20 30.5h8.5" {...stroke} strokeWidth={1.75} />
    </svg>
  );
}

/** Banda elástica de resistencia — loop + asas. */
function BandaElasticaIcon(props: IconSvgProps) {
  return (
    <svg {...iconBase} {...props}>
      <path
        d="M14 18c0-4.5 4.5-8 10-8s10 3.5 10 8-4.5 8-10 8-10-3.5-10-8Z"
        {...stroke}
      />
      <path d="M10 16.5V31.5" {...stroke} />
      <path d="M38 16.5V31.5" {...stroke} />
      <path d="M7 31.5h6" {...stroke} />
      <path d="M35 31.5h6" {...stroke} />
      <path d="M14 18h20" {...stroke} strokeWidth={1.75} />
    </svg>
  );
}

/** Banco / step de entrenamiento. */
function BancoIcon(props: IconSvgProps) {
  return (
    <svg {...iconBase} {...props}>
      <rect x="6" y="16" width="36" height="10" rx="2.5" {...stroke} />
      <path d="M12 26v10" {...stroke} />
      <path d="M36 26v10" {...stroke} />
      <path d="M8.5 36h8" {...stroke} />
      <path d="M31.5 36h8" {...stroke} />
      <path d="M10 16V12.5h28V16" {...stroke} strokeWidth={1.75} />
    </svg>
  );
}

/** Pelota de ejercicio / medicine ball outline. */
function PelotaIcon(props: IconSvgProps) {
  return (
    <svg {...iconBase} {...props}>
      <circle cx="24" cy="24" r="16.5" {...stroke} />
      <path d="M24 7.5c-5.2 4.2-8.2 10.2-8.2 16.5S18.8 36.3 24 40.5c5.2-4.2 8.2-10.2 8.2-16.5S29.2 11.7 24 7.5Z" {...stroke} strokeWidth={1.75} />
      <path d="M8.5 24h31" {...stroke} strokeWidth={1.75} />
      <path d="M12.5 15.5c3.2 1.4 7.4 2.2 11.5 2.2s8.3-.8 11.5-2.2" {...stroke} strokeWidth={1.75} />
      <path d="M12.5 32.5c3.2-1.4 7.4-2.2 11.5-2.2s8.3.8 11.5 2.2" {...stroke} strokeWidth={1.75} />
    </svg>
  );
}

/** Bloque / foam block. */
function BloqueIcon(props: IconSvgProps) {
  return (
    <svg {...iconBase} {...props}>
      <path d="M10 18 24 11l14 7v16L24 41 10 34V18Z" {...stroke} />
      <path d="M24 11v30" {...stroke} strokeWidth={1.75} />
      <path d="M10 18h28" {...stroke} strokeWidth={1.75} />
    </svg>
  );
}

/** Libreta / notebook. */
function LibretaIcon(props: IconSvgProps) {
  return (
    <svg {...iconBase} {...props}>
      <rect x="12" y="8" width="24" height="32" rx="2.5" {...stroke} />
      <path d="M16 8v32" {...stroke} />
      <path d="M20.5 16h11" {...stroke} strokeWidth={1.75} />
      <path d="M20.5 23h11" {...stroke} strokeWidth={1.75} />
      <path d="M20.5 30h8" {...stroke} strokeWidth={1.75} />
    </svg>
  );
}

/** Lapicera / pen. */
function LapiceraIcon(props: IconSvgProps) {
  return (
    <svg {...iconBase} {...props}>
      <path d="M29.5 8.5 39.5 18.5 18 40l-10.5 2.5L10 32Z" {...stroke} />
      <path d="M26.5 11.5 36.5 21.5" {...stroke} strokeWidth={1.75} />
      <path d="M12.5 34.5 15.5 37.5" {...stroke} strokeWidth={1.75} />
    </svg>
  );
}

const ICONS: Record<ClassMaterialKey, (props: IconSvgProps) => ReactNode> = {
  baston: BastonIcon,
  'banda elastica': BandaElasticaIcon,
  banco: BancoIcon,
  pelota: PelotaIcon,
  bloque: BloqueIcon,
  libreta: LibretaIcon,
  lapicera: LapiceraIcon,
};

type ClassMaterialIconProps = {
  material: string;
  className?: string;
};

/** Ícono outline deportivo para materiales de clase. */
export default function ClassMaterialIcon({ material, className }: ClassMaterialIconProps) {
  const Icon = ICONS[material as ClassMaterialKey];
  if (!Icon) return null;
  return <Icon className={className ? `h-full w-full ${className}` : 'h-full w-full'} />;
}
