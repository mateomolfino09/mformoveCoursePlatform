import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const MembershipPaused = () => {
  return (
    <section className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-[#234C8C] via-black to-black font-montserrat px-4">
      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 md:p-16 flex flex-col items-center shadow-xl border border-[#234C8C]/30 max-w-xl w-full">
        <ExclamationTriangleIcon className="w-16 h-16 text-[#5fa8e9] mb-4" />
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">Membresía Pausada</h1>
        <p className="text-lg text-white/90 mb-2 text-center">
          Actualmente la membresía se encuentra <span className="font-semibold text-[#5fa8e9]">pausada</span> y no está disponible para nuevos registros ni acceso temporalmente.
        </p>
        <p className="text-base text-white/70 text-center">
          Estamos trabajando en mejoras para ofrecerte una experiencia aún más exclusiva y transformadora. Si tienes dudas o quieres recibir novedades, contáctanos.
        </p>
      </div>
    </section>
  );
};

export default MembershipPaused; 