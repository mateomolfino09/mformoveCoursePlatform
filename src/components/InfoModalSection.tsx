import React from 'react';

interface InfoModalSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const InfoModalSection: React.FC<InfoModalSectionProps> = ({
  title,
  children,
  className = '',
}) => {
  return (
    <section className={`border-t border-[var(--admin-border)] pt-4 first:border-t-0 first:pt-0 ${className}`}>
      <h3 className="mb-2 text-[11px] font-medium uppercase tracking-wider text-[var(--admin-muted)]">
        {title}
      </h3>
      {children}
    </section>
  );
};

export default InfoModalSection;
