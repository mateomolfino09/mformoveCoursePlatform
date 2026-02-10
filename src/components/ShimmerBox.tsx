'use client';

import React from 'react';

const ShimmerBox = ({ className = '' }: { className?: string }) => {
  return (
    <div className={`relative overflow-hidden rounded ${className}`} style={{ backgroundColor: '#1A1A1A' }}>
      <div 
        className="absolute inset-0 animate-shimmer" 
        style={{ 
          background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%)',
          width: '200%',
          transform: 'translateX(-100%)'
        }} 
      />
    </div>
  );
};

export default ShimmerBox;
