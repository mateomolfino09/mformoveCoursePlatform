/** Clases compartidas para inputs nativos en el admin (light + dark). */
export const adminFormFieldClass =
  'w-full rounded-[var(--admin-radius)] border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] px-2.5 text-[13px] text-[var(--admin-input-fg)] outline-none ring-0 ring-transparent shadow-none transition-colors duration-[var(--admin-ease)] placeholder:text-[var(--admin-input-placeholder)] focus:border-[var(--admin-fg)] focus:outline-none focus:ring-0 focus:shadow-none';

export const adminFormFieldHeightClass = `${adminFormFieldClass} h-8 min-h-[2rem]`;

export const adminFormLabelClass = 'mb-1.5 block text-[12px] font-medium text-[var(--admin-label)]';

export const adminFormHintClass = 'mt-1 text-[12px] text-[var(--admin-muted)]';
