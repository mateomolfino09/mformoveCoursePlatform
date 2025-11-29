'use client'
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { CldImage } from 'next-cloudinary';
import imageLoader from '../../../../imageLoader';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

// Imágenes de resultados - reemplazar con imágenes reales
const resultsImages = [
  {
    src: 'my_uploads/casosDeExito/sofimejora_tkk4ev',
    alt: 'Resultado Move Crew',
    caption: 'Movilidad recuperada'
  },
  {
    src: 'my_uploads/plaza/DSC03366_ctiejt',
    alt: 'Resultado Move Crew',
    caption: 'Fuerza desarrollada'
  },
  {
    src: 'my_uploads/plaza/DSC03370_l1kh3e',
    alt: 'Resultado Move Crew',
    caption: 'Confianza en el movimiento'
  },
  {
    src: 'my_uploads/plaza/IMG_0354_flcgrh',
    alt: 'Resultado Move Crew',
    caption: 'Comunidad activa'
  }
];

const MoveCrewResultsSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState<Set<number>>(new Set());

  // Pre-load all images on mount for instant slider transitions
  useEffect(() => {
    const preloadImages = async () => {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dbeem2avp';
      const loadPromises = resultsImages.map((image, index) => {
        return new Promise<void>((resolve) => {
          const img = new Image();
          // Use Cloudinary URL directly for preload - optimized format
          const cloudinaryUrl = `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto,w_1600/${image.src}`;
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
      setCurrentIndex((prev) => (prev + 1) % resultsImages.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + resultsImages.length) % resultsImages.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % resultsImages.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <section className="py-12 md:py-20 bg-white font-montserrat">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mb-8 md:mb-12 text-center"
        >
          <p className="uppercase tracking-[0.3em] text-xs md:text-sm text-gray-500 mb-3">Resultados de alumnos</p>
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-black mb-4">
            Unite a más personas sintiendose mejor en movimiento
          </h2>
          <p className="text-sm md:text-base lg:text-lg text-gray-600 font-light max-w-2xl mx-auto">
            Cada semana trabajamos en hacernos más fuertes, más moviles y más confiados en el movimiento. Los resultados son la prueba visible de la dedicación y la consciencia que ponemos en nuestro cuerpo.
          </p>
        </motion.div>

        {/* Slider Grid - All images pre-loaded, visibility controlled */}
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {resultsImages.map((image, index) => {
              const isVisible = index === currentIndex || index === (currentIndex + 1) % resultsImages.length;
              return (
                <motion.div
                  key={image.src}
                  animate={{ 
                    opacity: isVisible ? 1 : 0,
                    y: isVisible ? 0 : 20
                  }}
                  transition={{ duration: 0.5 }}
                  className={`relative md:col-span-1 ${
                    isVisible ? 'block z-10' : 'hidden md:block md:absolute md:invisible md:pointer-events-none'
                  }`}
                >
                  <div className="relative w-full h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px] rounded-2xl md:rounded-3xl overflow-hidden group cursor-pointer">
                    <CldImage
                      src={image.src}
                      alt={image.alt}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      preserveTransformations
                      loader={imageLoader}
                      priority={index < 3}
                      loading="eager"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                    <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 right-4 md:right-6">
                      <p className="text-white text-sm md:text-base lg:text-lg font-medium">
                        {image.caption}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Navigation Arrows - Desktop only */}
          <button
            onClick={goToPrevious}
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-gray-900 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
            aria-label="Imagen anterior"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
          <button
            onClick={goToNext}
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-gray-900 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
            aria-label="Siguiente imagen"
          >
            <ChevronRightIcon className="w-6 h-6" />
          </button>

          {/* Mobile Swipe Indicator */}
          <div className="md:hidden flex justify-center gap-2 mt-4">
            {resultsImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentIndex
                    ? 'w-8 h-2 bg-amber-600'
                    : 'w-2 h-2 bg-gray-300'
                }`}
                aria-label={`Ir a imagen ${index + 1}`}
              />
            ))}
          </div>

          {/* Desktop Dots */}
          <div className="hidden md:flex justify-center gap-2 mt-6">
            {resultsImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentIndex || index === (currentIndex + 1) % resultsImages.length
                    ? 'w-8 h-2 bg-amber-600'
                    : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
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

export default MoveCrewResultsSlider;

