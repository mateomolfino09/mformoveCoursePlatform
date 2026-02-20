'use client';

import React from 'react';
import MainSideBar from './MainSidebar/MainSideBar';
import FilterNavWrapper from './FilterNavWrapper';
import Link from 'next/link';
import { routes } from '../constants/routes';

const contentPadding = 'px-6 md:px-12 lg:px-16 xl:px-24 2xl:px-32';
const contentMax = 'max-w-7xl';

function SkeletonLine({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded bg-palette-cream/20 animate-pulse ${className}`}
      aria-hidden
    />
  );
}

export default function ModuleLibrarySkeleton() {
  return (
    <FilterNavWrapper>
      <div className="relative bg-palette-ink min-h-screen overflow-x-hidden font-montserrat">
        <MainSideBar where="library">
          <main className="relative pb-20">
            {/* Hero: misma proporción que la vista (video + gradiente) */}
            <section className="relative min-h-[55vh] md:min-h-[70vh] lg:min-h-[65vh] flex flex-col justify-end overflow-hidden">
              <div className="absolute inset-0 z-0 bg-palette-ink">
                <div className="absolute inset-0 bg-palette-cream/10 animate-pulse" aria-hidden />
                <div
                  className="absolute inset-0 z-10"
                  style={{
                    background: 'linear-gradient(to bottom, rgba(20,20,17,0.2) 0%, rgba(20,20,17,0.4) 30%, rgba(20,20,17,0.7) 55%, rgba(20,20,17,0.9) 75%, rgb(20,20,17) 88%, rgb(20,20,17) 100%)',
                  }}
                  aria-hidden
                />
              </div>
              <div className={`relative z-20 ${contentPadding} pt-32 md:pt-36 lg:pt-40 pb-12 md:pb-14`}>
                <div className={contentMax}>
                  <SkeletonLine className="h-4 w-24 mb-2 bg-palette-cream/25" />
                  <SkeletonLine className="h-10 md:h-12 w-64 md:w-80 mb-4 bg-palette-cream/25" />
                  <SkeletonLine className="h-5 w-48 md:w-56 mb-4 bg-palette-cream/20" />
                  <SkeletonLine className="h-4 w-full max-w-2xl bg-palette-cream/15" />
                </div>
              </div>
            </section>

            {/* Contenido: Sobre esta serie + CTA + Cómo usar + Prácticas */}
            <div className="bg-palette-ink text-palette-cream">
              <div className={`${contentPadding} pt-16 md:pt-24 pb-16 md:pb-24`}>
                <div className={contentMax}>
                  <section className="mb-14 md:mb-16">
                    <SkeletonLine className="h-3 w-32 mb-3" />
                    <SkeletonLine className="h-5 w-full max-w-2xl mb-2" />
                    <SkeletonLine className="h-5 w-full max-w-xl" />
                  </section>
                  <section className="mb-14 md:mb-16">
                    <SkeletonLine className="h-12 w-48 rounded-full" />
                  </section>
                  <section className="mb-14 md:mb-16">
                    <SkeletonLine className="h-3 w-40 mb-4" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5">
                      {[1, 2].map((i) => (
                        <div key={i} className="rounded-xl border border-palette-stone/20 bg-palette-cream/5 p-4 md:p-5">
                          <SkeletonLine className="h-5 w-3/4 mb-2" />
                          <SkeletonLine className="h-4 w-full" />
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>

              <div className={`${contentPadding} pb-14 md:pb-20`}>
                <div className={contentMax}>
                  <nav className="flex items-center gap-2 text-sm mb-8">
                    <Link href={routes.navegation.membership.library} className="text-palette-stone hover:text-palette-cream transition-colors">
                      Biblioteca
                    </Link>
                    <span className="text-palette-stone/50">/</span>
                    <SkeletonLine className="h-4 w-24" />
                  </nav>
                  <SkeletonLine className="h-3 w-28 mb-6" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="flex flex-col rounded-2xl overflow-hidden bg-palette-cream/5 ring-1 ring-palette-stone/20">
                        <SkeletonLine className="w-full aspect-video rounded-none" />
                        <div className="p-3 md:p-4 flex flex-col gap-2">
                          <SkeletonLine className="h-4 w-full" />
                          <SkeletonLine className="h-4 w-3/4" />
                          <SkeletonLine className="h-3 w-20 mt-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </MainSideBar>
      </div>
    </FilterNavWrapper>
  );
}
