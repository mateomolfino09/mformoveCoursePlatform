'use client';

import React from 'react';
import MainSideBar from './MainSidebar/MainSideBar';
import FilterNavWrapper from './FilterNavWrapper';
import Link from 'next/link';
import { routes } from '../constants/routes';

function SkeletonLine({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded bg-palette-stone/20 animate-pulse ${className}`}
      aria-hidden
    />
  );
}

export default function IndividualClassesSkeleton() {
  return (
    <FilterNavWrapper>
      <div className="relative bg-palette-cream min-h-screen overflow-x-hidden font-montserrat">
        <MainSideBar where="library">
          <main className="relative px-6 md:px-12 lg:px-16 xl:px-24 2xl:px-32 pt-28 md:pt-32 lg:pt-36 pb-20">
            <div className="max-w-7xl mx-auto">
              {/* Breadcrumb skeleton */}
              <div className="flex items-center gap-2 text-sm mb-8">
                <Link
                  href={routes.navegation.membership.library}
                  className="text-palette-stone hover:text-palette-ink"
                >
                  Biblioteca
                </Link>
                <span className="text-palette-stone/50">/</span>
                <SkeletonLine className="h-4 w-32" />
              </div>

              {/* Title skeleton */}
              <SkeletonLine className="h-9 w-64 md:w-80 mb-6 lg:mb-8" />

              {/* Filter pills skeleton */}
              <div className="flex flex-wrap gap-3 mb-10 md:mb-12">
                {[...Array(5)].map((_, i) => (
                  <SkeletonLine key={i} className="h-10 w-20 md:w-24 rounded-full" />
                ))}
                <SkeletonLine className="h-10 w-24 rounded-full ml-2" />
              </div>

              {/* Grid of cards skeleton */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className="flex flex-col rounded-2xl overflow-hidden bg-white/40 ring-1 ring-palette-stone/10"
                  >
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
          </main>
        </MainSideBar>
      </div>
    </FilterNavWrapper>
  );
}
