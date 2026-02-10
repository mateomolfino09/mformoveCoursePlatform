'use client';

import React from 'react';
import ShimmerBox from './ShimmerBox';

const HeaderSkeleton = () => {
  return (
    <header className="fixed top-0 z-[1000] flex w-full items-center justify-between px-4 py-2 transition-all lg:px-10 lg:py-2 bg-black/80 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        {/* Logo skeleton */}
        <ShimmerBox className="h-8 w-32 md:w-40" />
        {/* Navigation links skeleton */}
        <div className="hidden md:flex items-center gap-6">
          {[...Array(4)].map((_, i) => (
            <ShimmerBox key={i} className="h-4 w-20" />
          ))}
        </div>
      </div>
      <div className="flex items-center gap-4">
        {/* Menu button skeleton */}
        <ShimmerBox className="h-8 w-8 rounded-full" />
        {/* User menu skeleton */}
        <ShimmerBox className="h-8 w-8 rounded-full" />
      </div>
    </header>
  );
};

export default HeaderSkeleton;
