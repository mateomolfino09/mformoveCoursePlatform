import React from 'react';

interface InfoModalFieldProps {
  label: string;
  value: string | React.ReactNode;
  className?: string;
  showBorder?: boolean;
}

const InfoModalField: React.FC<InfoModalFieldProps> = ({
  label,
  value,
  className = '',
  showBorder = true,
}) => {
  return (
    <div className={showBorder ? `mb-3 ${className}` : className}>
      {label ? (
        <p className="text-[11px] font-medium text-[var(--admin-muted)]">{label}</p>
      ) : null}
      <div className={label ? 'mt-0.5 text-[13px] leading-relaxed text-[var(--admin-fg)]' : 'text-[13px] leading-relaxed text-[var(--admin-fg)]'}>
        {value}
      </div>
    </div>
  );
};

export default InfoModalField;
