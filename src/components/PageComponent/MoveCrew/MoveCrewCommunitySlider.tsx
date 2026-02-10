'use client'
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { CldImage } from 'next-cloudinary';
import imageLoader from '../../../../imageLoader';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

// Imágenes de ejemplo - reemplazar con imágenes reales de la comunidad
const communityImages = [
  {
    src: 'my_uploads/alumnos/IMG_3278_ey2qow',
    alt: 'Miembro Move Crew en movimiento'
  },
  {
    src: 'my_uploads/alumnos/IMG_3271_ziom6b',
    alt: 'Comunidad Move Crew'
  },
  {
    src: 'my_uploads/alumnos/IMG_3279_nfrtmg',
    alt: 'Sesión Move Crew'
  },
  {
    src: 'my_uploads/plaza/DSC03366_ctiejt',
    alt: 'Entrenamiento Move Crew'
  }
];

const MoveCrewCommunitySlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState<Set<number>>(new Set());

  // Pre-load all images on mount for instant slider transitions
  useEffect(() => {
    const preloadImages = async () => {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dbeem2avp';
      const loadPromises = communityImages.map((image, index) => {
        return new Promise<void>((resolve) => {
          const img = new Image();
          // Use Cloudinary URL directly for preload - optimized format
          const cloudinaryUrl = `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto,w_1920/${image.src}`;
          img.onload = () => {
            setImagesLoaded((prev) => new Set(prev).add(index));
            resolve();
          };
          img.onerror = () => resolve(); // Continue even if one fails
          img.src = cloudinaryUrl;
        });
      });
      await Promise.all(loadPromises);
    };
    
    preloadImages();
  }, []);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % communityImages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + communityImages.length) % communityImages.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % communityImages.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <section className="py-16 md:py-20 bg-palette-cream font-montserrat">
      <div className="w-[85%] max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mb-10 md:mb-12 text-start md:text-left"
        >
          <p className="font-montserrat uppercase tracking-[0.2em] text-xs md:text-sm text-palette-stone/80 mb-2">Comunidad activa</p>
          <h2 className="text-2xl md:text-4xl font-montserrat font-semibold text-palette-ink tracking-tight mb-4">
            Compañeros en movimiento
          </h2>
        </motion.div>

        {/* Slider Container */}
        <div className="relative">
          {/* Pre-load all images - render all but show only current */}
          <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] rounded-2xl md:rounded-3xl overflow-hidden">
            {communityImages.map((image, index) => (
              <motion.div
                key={image.src}
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: index === currentIndex ? 1 : 0,
                  scale: index === currentIndex ? 1 : 1.05
                }}
                transition={{ duration: 0.5 }}
                className={`absolute inset-0 ${
                  index === currentIndex ? 'z-10' : 'z-0 pointer-events-none'
                }`}
              >
                <CldImage
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover"
                  loader={imageLoader}
                  priority={index === 0 || index === 1}
                  loading={index < 2 ? 'eager' : 'lazy'}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              </motion.div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={goToPrevious}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 bg-palette-cream/95 hover:bg-palette-teal/20 text-palette-teal p-2 md:p-3 rounded-full shadow-lg border border-palette-teal/40 transition-all duration-300 hover:scale-110"
            aria-label="Imagen anterior"
          >
            <ChevronLeftIcon className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 bg-palette-cream/95 hover:bg-palette-teal/20 text-palette-teal p-2 md:p-3 rounded-full shadow-lg border border-palette-teal/40 transition-all duration-300 hover:scale-110"
            aria-label="Siguiente imagen"
          >
            <ChevronRightIcon className="w-5 h-5 md:w-6 md:h-6" />
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-4 md:mt-6">
            {communityImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentIndex
                    ? 'w-8 md:w-10 h-2 md:h-2.5 bg-palette-teal'
                    : 'w-2 md:w-2.5 h-2 md:h-2.5 bg-palette-stone/40 hover:bg-palette-stone/60'
                }`}
                aria-label={`Ir a imagen ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MoveCrewCommunitySlider;

