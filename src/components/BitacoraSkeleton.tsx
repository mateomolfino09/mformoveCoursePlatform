'use client';

import React from 'react';
import MainSideBar from './MainSidebar/MainSideBar';
import ShimmerBox from './ShimmerBox';
import FooterProfile from './PageComponent/Profile/FooterProfile';

const BitacoraSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50 font-montserrat">
      <MainSideBar where={'bitacora'} forceStandardHeader>
        <div className="min-h-screen bg-gray-50 font-montserrat relative">
          {/* Layout principal con flex */}
          <div className="flex relative justify-between">
            {/* Sidebar Skeleton */}
            <div className="hidden lg:block w-80 bg-white border-r border-gray-200 p-6">
              <div className="space-y-6">
                {/* Header sidebar */}
                <div className="space-y-4">
                  <ShimmerBox className="h-8 w-32" />
                  <ShimmerBox className="h-6 w-48" />
                </div>
                
                {/* Progress skeleton */}
                <div className="space-y-3">
                  <ShimmerBox className="h-4 w-24" />
                  <ShimmerBox className="h-2 w-full rounded-full" />
                  <ShimmerBox className="h-4 w-32" />
                </div>

                {/* Weeks skeleton */}
                <div className="space-y-3">
                  <ShimmerBox className="h-5 w-20 mb-4" />
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-2 p-3 border border-gray-200 rounded-lg">
                      <ShimmerBox className="h-5 w-24" />
                      <ShimmerBox className="h-3 w-full" />
                      <ShimmerBox className="h-3 w-3/4" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main content skeleton */}
            <div className="flex-1 lg:ml-80">
              {/* Video/Content area */}
              <div className="w-full h-[60vh] bg-gray-100 relative">
                <ShimmerBox className="absolute inset-0 w-full h-full" />
              </div>

              {/* Content info skeleton */}
              <div className="p-6 md:p-8 bg-white">
                <div className="max-w-4xl mx-auto space-y-4">
                  <ShimmerBox className="h-10 w-3/4" />
                  <ShimmerBox className="h-6 w-full" />
                  <ShimmerBox className="h-6 w-5/6" />
                  <ShimmerBox className="h-6 w-4/6" />
                </div>
              </div>

              {/* Navigation skeleton */}
              <div className="p-6 bg-gray-50 flex justify-between items-center">
                <ShimmerBox className="h-10 w-32 rounded-lg" />
                <ShimmerBox className="h-10 w-32 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
        <FooterProfile />
      </MainSideBar>
    </div>
  );
};

export default BitacoraSkeleton;
