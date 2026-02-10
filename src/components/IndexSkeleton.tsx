'use client';

import React from 'react';
import MainSideBar from './MainSidebar/MainSideBar';
import ShimmerBox from './ShimmerBox';

const IndexSkeleton = () => {
  return (
    <div className='h-screen bg-gradient-to-bl lg:h-[100vh] overflow-hidden font-montserrat'>
      <MainSideBar where={"index"}>
        {/* Banner/Video Area Skeleton */}
        <main className='relative pl-4 lg:space-y-24 lg:pl-16'>
          <div className='flex flex-col space-y-2 py-16 md:space-y-4 min-h-[100vh] justify-end lg:items-end mr-12 lg:mr-24 overflow-hidden'>
            <div className='absolute top-0 left-0 h-[100vh] w-full -z-10 overflow-hidden' style={{ backgroundColor: '#1A1A1A' }}>
              <ShimmerBox className="absolute inset-0 w-full h-full" />
            </div>
          </div>
        </main>

        {/* Botón central skeleton */}
        <div className='absolute w-full top-1/2 flex justify-center items-center'>
          <ShimmerBox className="h-14 w-48 md:w-56 rounded-3xl" />
        </div>

        {/* Newsletter Section Skeleton */}
        <div className='w-full pt-12'>
          <div className='bg-gradient-to-bl w-full h-auto flex flex-col justify-start md:justify-center items-center space-x-16 overflow-hidden relative bottom-0 pb-12 md:pb-24 lg:px-24 md:px-20'>
            <div className='text-white flex flex-col items-center justify-center space-y-4 pl-8 pr-12 w-full text-center'>
              <ShimmerBox className="h-10 w-64 mx-auto mb-4" />
              <ShimmerBox className="h-6 w-3/4 mx-auto mb-2" />
              <ShimmerBox className="h-6 w-5/6 mx-auto mb-4" />
              <ShimmerBox className="h-12 w-40 mx-auto rounded-full" />
            </div>
          </div>
        </div>

        {/* Footer Skeleton */}
        <div className='w-full'>
          <div className='flex flex-wrap justify-center gap-4 px-8 py-6'>
            {[...Array(4)].map((_, i) => (
              <ShimmerBox key={i} className="h-4 w-20" />
            ))}
          </div>
        </div>
      </MainSideBar>
    </div>
  );
};

export default IndexSkeleton;
