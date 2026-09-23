import type { TextareaHTMLAttributes } from 'react';
import { adminFormFieldClass, adminFormHintClass, adminFormLabelClass } from './formClasses';
import { cn } from './cn';

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export function AdminTextarea({ label, hint, error, className, id, ...props }: Props) {
  const inputId = id || props.name;
  return (
    <div className="w-full">
      {label ? (
        <label htmlFor={inputId} className={adminFormLabelClass}>
          {label}
        </label>
      ) : null}
      <textarea
        id={inputId}
        className={cn(
          adminFormFieldClass,
          'min-h-[5.5rem] py-2',
          error ? 'border-[var(--admin-destructive)]' : '',
          className
        )}
        {...props}
      />
      {error ? <p className="mt-1 text-[12px] text-[var(--admin-destructive)]">{error}</p> : null}
      {!error && hint ? <p className={adminFormHintClass}>{hint}</p> : null}
    </div>
  );
}
