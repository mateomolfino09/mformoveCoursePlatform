'use client';

import React from 'react';
import MainSideBar from './MainSidebar/MainSideBar';
import ShimmerBox from './ShimmerBox';
import FooterProfile from './PageComponent/Profile/FooterProfile';

const ProfileSkeleton = () => {
  return (
    <div className='w-full min-h-screen bg-palette-cream font-montserrat'>
      <MainSideBar where={"index"}>
        <div className='w-full min-h-screen bg-palette-cream'>
          <main className='w-[85%] max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-20'>
            {/* Header skeleton */}
            <div className='mb-12'>
              <ShimmerBox className="h-12 w-48 mb-3" />
              <ShimmerBox className="h-6 w-64" />
            </div>

            {/* Cards skeleton */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-12'>
              {/* User info card */}
              <div className='bg-palette-cream border border-palette-stone/25 rounded-2xl md:rounded-3xl p-6 shadow-[0_4px_24px_rgba(20,20,17,0.06)]'>
                <div className='flex items-center gap-4 mb-6'>
                  <ShimmerBox className="h-16 w-16 rounded-full" />
                  <div className='flex-1'>
                    <ShimmerBox className="h-6 w-32 mb-2" />
                    <ShimmerBox className="h-4 w-48" />
                  </div>
                </div>
                <div className='space-y-3'>
                  <ShimmerBox className="h-4 w-full" />
                  <ShimmerBox className="h-4 w-3/4" />
                  <ShimmerBox className="h-4 w-5/6" />
                </div>
              </div>

              {/* Subscription card */}
              <div className='bg-white border border-gray-200 rounded-2xl p-6 shadow-sm'>
                <ShimmerBox className="h-6 w-40 mb-4" />
                <div className='space-y-4'>
                  <ShimmerBox className="h-10 w-full rounded-lg" />
                  <ShimmerBox className="h-4 w-full" />
                  <ShimmerBox className="h-4 w-2/3" />
                  <ShimmerBox className="h-12 w-full rounded-lg mt-4" />
                </div>
              </div>
            </div>

            {/* Additional sections skeleton */}
            <div className='space-y-6'>
              <div className='bg-palette-cream border border-palette-stone/25 rounded-2xl md:rounded-3xl p-6 shadow-[0_4px_24px_rgba(20,20,17,0.06)]'>
                <ShimmerBox className="h-6 w-32 mb-4" />
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className='space-y-2'>
                      <ShimmerBox className="h-4 w-20" />
                      <ShimmerBox className="h-8 w-full rounded" />
                    </div>
                  ))}
                </div>
              </div>

              <div className='bg-palette-cream border border-palette-stone/25 rounded-2xl md:rounded-3xl p-6 shadow-[0_4px_24px_rgba(20,20,17,0.06)]'>
                <ShimmerBox className="h-6 w-40 mb-4" />
                <div className='space-y-3'>
                  <ShimmerBox className="h-10 w-full rounded-lg" />
                  <ShimmerBox className="h-10 w-full rounded-lg" />
                  <ShimmerBox className="h-10 w-full rounded-lg" />
                </div>
              </div>
            </div>
          </main>
        </div>
        <FooterProfile />
      </MainSideBar>
    </div>
  );
};

export default ProfileSkeleton;
