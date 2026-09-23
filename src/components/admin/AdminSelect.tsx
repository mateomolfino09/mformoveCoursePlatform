import type { SelectHTMLAttributes } from 'react';
import { adminFormFieldHeightClass, adminFormHintClass, adminFormLabelClass } from './formClasses';
import { cn } from './cn';

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export function AdminSelect({ label, hint, error, className, id, children, ...props }: Props) {
  const selectId = id || props.name;
  return (
    <div className="w-full">
      {label ? (
        <label htmlFor={selectId} className={adminFormLabelClass}>
          {label}
        </label>
      ) : null}
      <select
        id={selectId}
        className={cn(adminFormFieldHeightClass, error ? 'border-[var(--admin-destructive)]' : '', className)}
        {...props}
      >
        {children}
      </select>
      {error ? <p className="mt-1 text-[12px] text-[var(--admin-destructive)]">{error}</p> : null}
      {!error && hint ? <p className={adminFormHintClass}>{hint}</p> : null}
    </div>
  );
}
