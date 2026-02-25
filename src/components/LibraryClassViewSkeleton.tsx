'use client';

import React from 'react';
import MainSideBar from './MainSidebar/MainSideBar';
import OnboardingGuard from './OnboardingGuard';

function SkeletonLine({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded bg-palette-stone/20 animate-pulse ${className}`}
      aria-hidden
    />
  );
}

export default function LibraryClassViewSkeleton() {
  return (
    <OnboardingGuard>
      <MainSideBar where="library">
        <div className="relative min-h-screen bg-palette-cream overflow-x-hidden font-montserrat">
          <main className="relative flex flex-col">
            {/* Breadcrumb skeleton - desktop only */}
            <section className="hidden md:block bg-palette-cream pt-16 md:pt-24 lg:pt-28">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-16 xl:px-24 2xl:px-32 py-4 md:py-5">
                <div className="flex items-center gap-2">
                  <SkeletonLine className="h-4 w-16" />
                  <span className="text-palette-stone/50">/</span>
                  <SkeletonLine className="h-4 w-28" />
                  <span className="text-palette-stone/50">/</span>
                  <SkeletonLine className="h-4 w-40" />
                </div>
              </div>
            </section>

            {/* Video area skeleton */}
            <section className="bg-palette-cream pt-14 md:pt-8 pb-8 md:pb-12">
              <div className="relative w-full md:max-w-7xl md:mx-auto md:px-12 lg:px-16 xl:px-24 2xl:px-32">
                <SkeletonLine className="w-full aspect-video rounded-none md:rounded-2xl lg:rounded-3xl" />
              </div>
            </section>

            {/* Content skeleton */}
            <section className="bg-palette-cream pb-12 md:pb-20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-16 xl:px-24 2xl:px-32">
                <div className="max-w-3xl mr-auto text-left space-y-6 md:space-y-8">
                  {/* Title */}
                  <div className="space-y-2">
                    <SkeletonLine className="h-8 w-3/4 md:h-9 md:w-96" />
                    <SkeletonLine className="h-4 w-24" />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <SkeletonLine className="h-4 w-full" />
                    <SkeletonLine className="h-4 w-full" />
                    <SkeletonLine className="h-4 w-5/6" />
                  </div>

                  {/* Tabs */}
                  <div className="border-b border-palette-stone/10">
                    <div className="flex gap-4">
                      <SkeletonLine className="h-10 w-20 rounded" />
                      <SkeletonLine className="h-10 w-24 rounded" />
                    </div>
                  </div>

                  {/* Tab content */}
                  <div className="min-h-[280px] space-y-4">
                    <SkeletonLine className="h-24 w-full rounded-xl" />
                    <SkeletonLine className="h-24 w-full rounded-xl" />
                    <SkeletonLine className="h-24 w-4/5 rounded-xl" />
                  </div>
                </div>
              </div>
            </section>
          </main>
        </div>
      </MainSideBar>
    </OnboardingGuard>
  );
}
