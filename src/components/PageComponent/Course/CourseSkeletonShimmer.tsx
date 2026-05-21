'use client';

/**
 * Brillo compartido para skeletons de páginas de curso (landing, checkout, etc.).
 * Usar siempre este componente en loaders de página en lugar de texto plano.
 */
export function CourseSkeletonShimmer({ className = '' }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded bg-palette-stone/12 ${className}`}>
      <div
        className="absolute inset-0 animate-shimmer"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(20, 20, 17, 0.06) 50%, transparent 100%)',
          width: '200%',
          transform: 'translateX(-100%)',
        }}
      />
    </div>
  );
}
