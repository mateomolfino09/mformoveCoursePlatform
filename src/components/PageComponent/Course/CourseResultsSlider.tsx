'use client'
import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { CldImage } from 'next-cloudinary';
import imageLoader from '../../../../imageLoader';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

// Imágenes de resultados - reemplazar con imágenes reales
const resultsImages = [
  {
    src: 'my_uploads/casosDeExito/sofimejora_tkk4ev',
    alt: 'Resultado Cuerpo autónomo',
    caption: 'Movilidad recuperada'
  },
  {
    src: 'my_uploads/plaza/DSC03366_ctiejt',
    alt: 'Resultado Cuerpo autónomo',
    caption: 'Fuerza desarrollada'
  },
  {
    src: 'my_uploads/plaza/DSC03370_l1kh3e',
    alt: 'Resultado Cuerpo autónomo',
    caption: 'Confianza en el movimiento'
  },
  {
    src: 'my_uploads/casosDeExito/telegram_gm6pti',
    alt: 'Resultado Cuerpo autónomo',
    caption: 'Comunidad activa'
  }
];

const CourseResultsSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState<Set<number>>(new Set());
  const [hasStartedCount, setHasStartedCount] = useState(false);
  const [hasAnimatedCount, setHasAnimatedCount] = useState(false);
  const [statsLoaded, setStatsLoaded] = useState(false);
  const [memberCount, setMemberCount] = useState(0);
  const [classesAvailable, setClassesAvailable] = useState(0);
  const [statsTarget, setStatsTarget] = useState({
    activeMembers: 0,
    classesAvailable: 0
  });
  const sectionRef = useRef<HTMLElement | null>(null);

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
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/move-crew/stats', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0'
          }
        });

        if (!response.ok) {
          throw new Error('Error al obtener estadísticas');
        }

        const data = await response.json();
        setStatsTarget({
          activeMembers: data.activeMembers || 0,
          classesAvailable: data.classesAvailable || 0
        });
      } catch (error) {
        console.error('Error cargando estadísticas de Cuerpo autónomo:', error);
        setStatsTarget({ activeMembers: 0, classesAvailable: 0 });
      } finally {
        setStatsLoaded(true);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % resultsImages.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasStartedCount(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasStartedCount || !statsLoaded || hasAnimatedCount) return;

    const durationMs = 1600;
    const start = performance.now();
    const { activeMembers, classesAvailable: classesTarget } = statsTarget;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setMemberCount(Math.round(activeMembers * eased));
      setClassesAvailable(Math.round(classesTarget * eased));
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        setHasAnimatedCount(true);
      }
    };

    const frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [hasStartedCount, statsLoaded, hasAnimatedCount, statsTarget]);

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
    <section ref={sectionRef} className="relative isolate overflow-hidden py-12 md:py-14 bg-palette-cream font-montserrat">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,rgba(143,157,179,0.2),transparent_50%)]" aria-hidden />
      <div className="relative w-[85%] max-w-6xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mx-auto mb-8 max-w-3xl md:mb-10 text-center"
        >
          <p className="mc-text-depth-light font-montserrat uppercase tracking-[0.2em] text-sm md:text-base text-palette-stone mb-2">
            Resultados de alumnos
          </p>
          <h2 className="mc-text-depth-light-title text-[1.85rem] md:text-5xl lg:text-[2.65rem] font-montserrat font-semibold text-palette-ink tracking-tight mb-4 leading-[1.08]">
            Unite a más personas sintiendose mejor en movimiento
          </h2>
          <p className="mc-text-depth-light font-raleway italic text-palette-stone text-lg md:text-xl max-w-2xl mx-auto md:mx-0 leading-relaxed">
            Cada semana creamos más espacio en el cuerpo para descubrir nuevas posibilidades.
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
                      loader={imageLoader}
                      priority={index < 3}
                      loading="eager"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                    <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 right-4 md:right-6">
                      <p className="text-white text-base md:text-lg lg:text-xl font-semibold">
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
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-palette-cream/95 hover:bg-palette-steel/30 text-palette-steel p-3 rounded-full shadow-lg border border-palette-steel/45 transition-all duration-300 hover:text-palette-ink hover:scale-110"
            aria-label="Imagen anterior"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
          <button
            onClick={goToNext}
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-palette-cream/95 hover:bg-palette-steel/30 text-palette-steel p-3 rounded-full shadow-lg border border-palette-steel/45 transition-all duration-300 hover:text-palette-ink hover:scale-110"
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
                    ? 'w-8 h-2 bg-palette-sage'
                    : 'w-2 h-2 bg-palette-stone/40'
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
                    ? 'w-8 h-2 bg-palette-sage'
                    : 'w-2 h-2 bg-palette-stone/40 hover:bg-palette-stone/60'
                }`}
                aria-label={`Ir a imagen ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="mt-6 md:mt-8 flex flex-col md:flex-row gap-3 md:gap-4 justify-center">
          <div className="bg-palette-sage/20 text-palette-ink rounded-2xl px-5 py-4 text-center border border-palette-sage/35 flex-1">
            <p className="font-montserrat text-sm md:text-base uppercase tracking-[0.18em] text-palette-ink/80 mb-1">
              Compañeros en movimiento
            </p>
            <p className="text-4xl md:text-5xl font-montserrat font-bold tabular-nums text-palette-ink" aria-live="polite">
              {memberCount.toLocaleString('es-ES')}
            </p>
          </div>
          <div className="bg-palette-cloud/80 border border-palette-steel/30 text-palette-ink rounded-2xl px-5 py-4 text-center flex-1">
            <p className="font-montserrat text-sm md:text-base uppercase tracking-[0.18em] text-palette-stone mb-1">
              Clases disponibles
            </p>
            <p className="text-4xl md:text-5xl font-montserrat font-bold tabular-nums" aria-live="polite">
              {classesAvailable.toLocaleString('es-ES')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CourseResultsSlider;

