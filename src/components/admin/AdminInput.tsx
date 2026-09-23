import type { InputHTMLAttributes } from 'react';
import { adminFormFieldHeightClass, adminFormHintClass, adminFormLabelClass } from './formClasses';
import { cn } from './cn';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export function AdminInput({ label, hint, error, className, id, ...props }: Props) {
  const inputId = id || props.name;
  return (
    <div className="w-full">
      {label ? (
        <label htmlFor={inputId} className={adminFormLabelClass}>
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        className={cn(adminFormFieldHeightClass, error ? 'border-[var(--admin-destructive)]' : '', className)}
        {...props}
      />
      {error ? <p className="mt-1 text-[12px] text-[var(--admin-destructive)]">{error}</p> : null}
      {!error && hint ? <p className={adminFormHintClass}>{hint}</p> : null}
    </div>
  );
}
