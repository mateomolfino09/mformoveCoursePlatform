import type { ReactNode } from 'react';
import { cn } from './cn';

type Props = {
  children: ReactNode;
  wide?: boolean;
  className?: string;
};

export function AdminPage({ children, wide = false, className }: Props) {
  return (
    <div className={cn('w-full py-6', wide ? 'max-w-none' : 'max-w-[960px]', className)}>
      {children}
    </div>
  );
}
