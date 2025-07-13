import React, { useEffect, useState } from 'react';
import MentorshipBannerCarousel from './MentorshipBannerCarousel';

const MentorshipPlansLoading = ({ show }: { show: boolean }) => {
  // Transición fade out cuando show pasa a false
  const [visible, setVisible] = useState(show);
  useEffect(() => {
    if (!show) {
      const timeout = setTimeout(() => setVisible(false), 500);
      return () => clearTimeout(timeout);
    } else {
      setVisible(true);
    }
  }, [show]);

  if (!visible) return null;

  return (
    <div className={`fixed inset-0 z-50 transition-opacity duration-500 ${show ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
      <MentorshipBannerCarousel hideText={true} />
      <div className="absolute inset-0 flex flex-col items-center justify-center z-50">
        <div className="px-6 py-8 rounded-xl to-transparent flex flex-col items-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white drop-shadow-2xl mb-6 font-montserrat text-center">
            Mentoría Online
          </h1>
          <p className="text-xl md:text-3xl text-white font-light drop-shadow-xl max-w-2xl mx-auto font-montserrat text-center mb-8">
            Programa personalizado guiado por Mateo Molfino
          </p>
          <div className="loading-spinner" />
        </div>
      </div>
    </div>
  );
};

export default MentorshipPlansLoading; 