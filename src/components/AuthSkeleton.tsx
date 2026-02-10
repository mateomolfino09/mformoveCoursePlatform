'use client';

import React from 'react';
import MainSideBar from './MainSidebar/MainSideBar';
import ShimmerBox from './ShimmerBox';
import Footer from './Footer';

const AuthSkeleton = () => {
  return (
    <div>
      <MainSideBar where={'index'}>
        <section className="relative min-h-screen bg-black text-white font-montserrat overflow-hidden">
          {/* Background skeleton */}
          <div className="absolute inset-0" style={{ backgroundColor: '#1A1A1A' }}>
            <ShimmerBox className="absolute inset-0 w-full h-full" />
          </div>

          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 pt-28 md:py-24 md:pt-32">
            <div className="grid gap-10 justify-items-center">
              {/* Header skeleton */}
              <div className="text-center max-w-2xl space-y-3 w-full">
                <ShimmerBox className="h-6 w-32 mx-auto rounded-full" />
                <ShimmerBox className="h-12 w-3/4 mx-auto mb-2" />
                <ShimmerBox className="h-5 w-2/3 mx-auto" />
              </div>

              {/* Form skeleton */}
              <div className="w-full max-w-md">
                <div className="relative rounded-3xl overflow-hidden backdrop-blur">
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 space-y-6">
                    {/* Input fields skeleton */}
                    <div className="space-y-4">
                      <div>
                        <ShimmerBox className="h-4 w-20 mb-2" />
                        <ShimmerBox className="h-12 w-full rounded-lg" />
                      </div>
                      <div>
                        <ShimmerBox className="h-4 w-24 mb-2" />
                        <ShimmerBox className="h-12 w-full rounded-lg" />
                      </div>
                      <div>
                        <ShimmerBox className="h-4 w-28 mb-2" />
                        <ShimmerBox className="h-12 w-full rounded-lg" />
                      </div>
                    </div>

                    {/* Button skeleton */}
                    <div className="pt-4">
                      <ShimmerBox className="h-12 w-full rounded-xl" />
                    </div>

                    {/* Links skeleton */}
                    <div className="flex justify-center gap-4 pt-2">
                      <ShimmerBox className="h-4 w-24" />
                      <ShimmerBox className="h-4 w-32" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </MainSideBar>
    </div>
  );
};

export default AuthSkeleton;
