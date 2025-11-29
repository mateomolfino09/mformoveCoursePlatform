'use client'
import { motion } from 'framer-motion';
import { useState } from 'react';
import { PlayIcon } from '@heroicons/react/24/solid';

const MoveCrewMethodVideo = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Reemplazar con el ID real del video de Vimeo o URL de Cloudinary
  const videoId = '1023611525'; // Ejemplo - usar video real

  const handlePlay = () => {
    setIsPlaying(true);
    setIsLoaded(true);
  };

  return (
    <section className="py-12 md:py-20 bg-gray-50 font-montserrat">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mb-8 md:mb-12 text-center"
        >
          <p className="uppercase tracking-[0.3em] text-xs md:text-sm text-gray-500 mb-3">Así funciona</p>
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-black mb-4">
            Así se ve entrar en la Move Crew
          </h2>
          <p className="text-sm md:text-base lg:text-lg text-gray-600 font-light max-w-2xl mx-auto">
            Te muestro una mirada interna a comenzar tu camino en el movimiento conmigo.
          </p>
        </motion.div>

        {/* Video Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="relative w-full rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl bg-black"
        >
          <div className="relative w-full aspect-video">
            {!isPlaying ? (
              <>
                {/* Thumbnail/Poster */}
                <div className="absolute inset-0">
                  <img
                    src={`https://vumbnail.com/${videoId}.jpg`}
                    alt="Preview de sesión Move Crew"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback si no hay thumbnail disponible
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-black/40 to-orange-500/20" />
                </div>

                {/* Play Button */}
                <button
                  onClick={handlePlay}
                  className="absolute inset-0 flex items-center justify-center group"
                  aria-label="Reproducir video"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/20 rounded-full blur-xl group-hover:bg-white/30 transition-all duration-300 scale-150" />
                    <div className="relative bg-white/95 hover:bg-white text-black p-4 md:p-6 rounded-full shadow-2xl transition-all duration-300 group-hover:scale-110">
                      <PlayIcon className="w-8 h-8 md:w-12 md:h-12 ml-1" />
                    </div>
                  </div>
                </button>
              </>
            ) : (
              <iframe
                src={`https://player.vimeo.com/video/${videoId}?autoplay=1&title=0&byline=0&portrait=0`}
                className="w-full h-full"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                title="Video de sesión Move Crew"
                onLoad={() => setIsLoaded(true)}
              />
            )}

            {!isLoaded && isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-black">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-white border-t-transparent" />
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MoveCrewMethodVideo;


