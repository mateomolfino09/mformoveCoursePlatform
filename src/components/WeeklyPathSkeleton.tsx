'use client';

import React from 'react';
import MainSideBar from './MainSidebar/MainSideBar';
import ShimmerBox from './ShimmerBox';
import FooterProfile from './PageComponent/Profile/FooterProfile';

const WeeklyPathSkeleton = () => {
  return (
    <div className="min-h-screen bg-palette-ink font-montserrat">
      <MainSideBar where="weekly-path" forceStandardHeader>
        <div className="min-h-screen bg-palette-ink text-palette-cream font-montserrat flex flex-col">
          <section className="relative w-full flex-1 min-h-0">
            <div className="absolute inset-0 overflow-y-auto overflow-x-hidden">
              <div className="w-full min-h-full flex flex-col">
                {/* Área de contenido principal — mismo contenedor que la página */}
                <div className="min-h-screen">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 lg:pt-20 pb-8">
                    {/* Placeholder video / contenido */}
                    <div className="relative w-full aspect-video min-h-[40vh] max-h-[82vh] rounded-none sm:rounded-xl overflow-hidden bg-palette-stone/20 border border-palette-stone/10">
                      <ShimmerBox className="absolute inset-0 w-full h-full rounded-none sm:rounded-xl" />
                    </div>

                    {/* Título y descripción */}
                    <div className="mt-8 space-y-4">
                      <ShimmerBox className="h-8 w-3/4 max-w-md rounded" />
                      <ShimmerBox className="h-4 w-full rounded" />
                      <ShimmerBox className="h-4 w-5/6 rounded" />
                      <ShimmerBox className="h-4 w-4/6 rounded" />
                    </div>

                    {/* Bloque Coherencia */}
                    <div className="mt-10 pt-10 border-t border-palette-stone/10 space-y-3">
                      <ShimmerBox className="h-5 w-48 rounded" />
                      <ShimmerBox className="h-4 w-full rounded" />
                      <ShimmerBox className="h-4 w-full rounded" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <div className="shrink-0">
            <FooterProfile />
          </div>
        </div>
      </MainSideBar>
    </div>
  );
};

export default WeeklyPathSkeleton;
