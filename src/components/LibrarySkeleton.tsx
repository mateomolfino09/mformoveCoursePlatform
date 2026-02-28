'use client';

import React from 'react';
import MainSideBar from './MainSidebar/MainSideBar';
import FilterNavWrapper from './FilterNavWrapper';
import ShimmerBox from './ShimmerBox';

const LibrarySkeleton = () => {
  return (
    <div className="relative bg-palette-ink lg:h-full min-w-[90vw] min-h-screen overflow-scroll overflow-x-hidden font-montserrat">
      <MainSideBar where={'index'}>
        <FilterNavWrapper>
          {/* Banner Web Skeleton */}
          <section className="hidden md:block relative min-h-[60vh] w-full overflow-hidden bg-palette-ink">
            <div className="absolute inset-0 z-0 bg-palette-ink" />
            <div className="relative z-10 w-full h-[45vh] min-h-[650px] max-h-[750px] flex flex-col justify-center px-8 lg:px-16 xl:px-24 2xl:px-32" style={{ paddingTop: '64px' }}>
              <ShimmerBox className="h-16 w-3/4 mb-6 max-w-5xl" />
              <ShimmerBox className="h-8 w-5/6 mb-4 max-w-4xl" />
              <ShimmerBox className="h-8 w-4/6 mb-4 max-w-3xl" />
              <ShimmerBox className="h-6 w-3/6 mb-8 max-w-2xl" />
            </div>
          </section>

          {/* Banner Mobile Skeleton */}
          <section className="md:hidden relative overflow-hidden w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-palette-ink" style={{ marginTop: 0, marginBottom: '2rem' }}>
            <div className="absolute inset-0 z-0 w-full bg-palette-ink" />
            <div className="relative z-10" style={{ paddingTop: '64px' }}>
              <div className="mx-auto px-6 sm:px-8 py-12 md:py-0">
                <ShimmerBox className="h-12 w-3/4 mx-auto mb-5 mt-4" />
                <ShimmerBox className="h-6 w-full mb-4" />
                <ShimmerBox className="h-6 w-5/6 mb-4" />
                <ShimmerBox className="h-5 w-4/6 mb-5" />
              </div>
            </div>
          </section>

          <main className="relative mt-16 md:mt-0 bg-palette-ink">
            {/* Filters Section Skeleton */}
            <section className="px-3 sm:px-4 md:px-6 lg:px-8 mb-6 md:mb-12 bg-palette-ink -mt-12 pt-12">
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-wrap gap-3 mb-6">
                  {[...Array(6)].map((_, i) => (
                    <ShimmerBox key={i} className="h-10 w-24 rounded-full" />
                  ))}
                </div>
              </div>
            </section>

            {/* Classes Section Skeleton */}
            <section className="px-3 sm:px-4 md:px-6 lg:px-8 mb-6 md:mb-12 bg-palette-ink">
              <div className="max-w-7xl mx-auto">
                {/* Skeleton para múltiples carousels */}
                {[...Array(3)].map((_, carouselIndex) => (
                  <div key={carouselIndex} className="mt-8 md:mt-12">
                    {/* Título del carousel */}
                    <div className="mb-4 md:mb-6 flex items-center gap-3">
                      <ShimmerBox className="h-8 w-48 md:w-64" />
                      <ShimmerBox className="h-6 w-6 rounded-full" />
                    </div>

                    {/* Mobile: Grid Skeleton */}
                    <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 mt-5">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex flex-col">
                          <ShimmerBox className="h-48 w-full rounded-lg mb-3" />
                          <ShimmerBox className="h-5 w-3/4 mb-2" />
                          <ShimmerBox className="h-4 w-1/2" />
                        </div>
                      ))}
                    </div>

                    {/* Desktop: Carousel Skeleton */}
                    <div className="hidden md:block overflow-x-hidden">
                      <div className="flex gap-6 px-2">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="flex-shrink-0 w-[320px] flex flex-col">
                            <ShimmerBox className="h-48 w-full rounded-lg mb-3" />
                            <ShimmerBox className="h-5 w-3/4 mb-2" />
                            <ShimmerBox className="h-4 w-1/2 mb-1" />
                            <ShimmerBox className="h-4 w-2/3" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </main>
        </FilterNavWrapper>
      </MainSideBar>
    </div>
  );
};

export default LibrarySkeleton;
