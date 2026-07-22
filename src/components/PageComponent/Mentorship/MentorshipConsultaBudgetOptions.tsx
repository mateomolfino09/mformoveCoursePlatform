'use client';

import { Dialog, Transition } from '@headlessui/react';
import { InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Fragment, useState } from 'react';
import type { MentorshipBudgetOption } from '../../../lib/mentorshipPricing';
import MentorshipPlanIncludesList from './MentorshipPlanIncludesList';

type Props = {
  options: MentorshipBudgetOption[];
  name: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  showError?: boolean;
};

const ANUAL_LINES = [
  { d: 'M -8 -5 L 55 48', color: '#c4b5fd', delay: '0s', duration: '3.1s', width: 1.15 },
  { d: 'M 8 -10 L 78 62', color: '#f9a8d4', delay: '0.55s', duration: '4.2s', width: 0.95 },
  { d: 'M -5 12 L 92 78', color: '#a78bfa', delay: '1.15s', duration: '3.6s', width: 1.3 },
  { d: 'M 22 -8 L 108 70', color: '#fb7185', delay: '1.85s', duration: '4.8s', width: 0.85 },
  { d: 'M -10 28 L 70 98', color: '#e879f9', delay: '2.4s', duration: '3.9s', width: 1.1 },
  { d: 'M 35 -12 L 115 55', color: '#ddd6fe', delay: '0.9s', duration: '5.1s', width: 0.9 },
  { d: 'M -12 45 L 58 110', color: '#f5d0fe', delay: '3.05s', duration: '4.4s', width: 0.75 },
  { d: 'M 48 -6 L 120 72', color: '#e9d5ff', delay: '1.5s', duration: '3.4s', width: 1 },
  { d: 'M 0 5 L 100 95', color: '#fda4af', delay: '2.75s', duration: '4.6s', width: 0.8 },
] as const;

function AnualAuraBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]" aria-hidden>
      <div className="mentorship-anual-aura-wash absolute inset-0" />
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {ANUAL_LINES.map((line) => (
          <path
            key={`${line.d}-${line.delay}`}
            className="mentorship-anual-draw-line"
            d={line.d}
            fill="none"
            stroke={line.color}
            strokeWidth={line.width}
            strokeLinecap="round"
            pathLength={1}
            style={{ animationDelay: line.delay, animationDuration: line.duration }}
          />
        ))}
      </svg>
    </div>
  );
}

export default function MentorshipConsultaBudgetOptions({
  options,
  name,
  value,
  onChange,
  error,
  showError,
}: Props) {
  const [includesOpen, setIncludesOpen] = useState(false);

  return (
    <div>
      <div className="space-y-4">
        {options.map((opt) => {
          const isAnual = opt.interval === 'anual';
          const isSelected = value === opt.value;
          const inviteAnual = isAnual && !isSelected;

          return (
            <div
              key={opt.value}
              className={`relative overflow-hidden rounded-2xl border transition-all duration-200 ${
                isAnual
                  ? inviteAnual
                    ? 'mentorship-anual-aura border-violet-300/55 shadow-[0_10px_28px_-12px_rgba(139,92,246,0.35)]'
                    : 'mentorship-anual-aura mentorship-anual-aura--selected border-fuchsia-300/60 shadow-[0_10px_26px_-12px_rgba(217,70,239,0.28)]'
                  : isSelected
                    ? 'border-palette-ink/35 bg-palette-cream/70 shadow-[0_6px_22px_rgba(20,20,17,0.08)]'
                    : 'border-palette-stone/18 bg-white/85 shadow-[0_6px_22px_rgba(20,20,17,0.05)] hover:border-palette-stone/32 hover:bg-palette-cream/65'
              }`}
            >
              {isAnual ? <AnualAuraBackground /> : null}

              <div className="relative z-10 flex items-stretch gap-1 p-4">
                <label className="flex min-w-0 flex-1 cursor-pointer items-start gap-3">
                  <input
                    type="radio"
                    name={name}
                    value={opt.value}
                    checked={isSelected}
                    onChange={() => onChange(opt.value)}
                    className="mt-1 h-5 w-5 shrink-0 border border-palette-stone/30 bg-white text-palette-ink transition-all duration-200 focus:ring-2 focus:ring-violet-300/40"
                  />
                  <div className="min-w-0 flex-1 pr-1">
                    <div className="mb-1.5 font-montserrat text-base font-medium text-palette-ink">
                      {opt.label}
                    </div>
                    {opt.discountPercent > 0 ? (
                      <div className="mt-1">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                            isAnual
                              ? 'bg-gradient-to-r from-violet-700 via-fuchsia-600 to-rose-500 text-white shadow-sm'
                              : 'border border-palette-stone/20 bg-palette-cream/90 font-medium text-palette-ink'
                          }`}
                        >
                          Ahorra {opt.discountPercent}% pagando anual
                        </span>
                      </div>
                    ) : null}
                    <div className="mt-2 font-montserrat text-xs font-light text-palette-stone">
                      {opt.description}
                    </div>
                  </div>
                </label>

                {isAnual ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIncludesOpen(true);
                    }}
                    className={`group relative mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-white/85 transition-all duration-200 ${
                      inviteAnual
                        ? 'mentorship-anual-info-nudge border-fuchsia-300/70 text-fuchsia-700 shadow-[0_4px_14px_-6px_rgba(192,38,211,0.4)] hover:bg-white'
                        : 'border-violet-200/80 text-violet-700/80 hover:border-violet-400/70 hover:text-violet-800'
                    }`}
                    aria-label="Ver qué incluye el plan anual"
                    title="Qué incluye el plan anual"
                  >
                    <InformationCircleIcon className="h-5 w-5" />
                    {inviteAnual ? (
                      <span className="pointer-events-none absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-gradient-to-br from-violet-500 to-rose-400 ring-2 ring-white" />
                    ) : null}
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {showError && error ? (
        <p className="mt-2 flex items-center font-montserrat text-sm text-red-600">
          <svg className="mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      ) : null}

      <Transition appear show={includesOpen} as={Fragment}>
        <Dialog as="div" className="relative z-[80]" onClose={() => setIncludesOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-palette-ink/45 backdrop-blur-[2px]" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 sm:items-center sm:p-6">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-200"
                enterFrom="opacity-0 translate-y-3 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-3 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="w-full max-w-lg overflow-hidden rounded-2xl border border-palette-stone/15 bg-palette-cream shadow-[0_24px_60px_-20px_rgba(20,20,17,0.45)]">
                  <div className="flex items-start justify-between gap-4 border-b border-palette-stone/12 bg-white/70 px-5 py-4 sm:px-6">
                    <div>
                      <Dialog.Title className="font-montserrat text-lg font-semibold text-palette-ink">
                        Qué incluye el plan anual
                      </Dialog.Title>
                      <p className="mt-1 font-montserrat text-sm text-palette-stone">
                        Todo el acompañamiento del ciclo + beneficios exclusivos.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIncludesOpen(false)}
                      className="rounded-full p-1.5 text-palette-stone transition-colors hover:bg-palette-ink/5 hover:text-palette-ink"
                      aria-label="Cerrar"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="max-h-[min(70vh,32rem)] overflow-y-auto px-5 py-5 sm:px-6">
                    <MentorshipPlanIncludesList interval="anual" />
                  </div>
                  <div className="border-t border-palette-stone/12 bg-white/50 px-5 py-4 sm:px-6">
                    <button
                      type="button"
                      onClick={() => setIncludesOpen(false)}
                      className="w-full rounded-full bg-palette-ink px-5 py-2.5 font-montserrat text-[11px] font-semibold uppercase tracking-[0.18em] text-palette-cream transition-colors hover:bg-palette-ink/90"
                    >
                      Entendido
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
