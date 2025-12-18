'use client';
import { useEffect, useState } from 'react';
import { InPersonClass } from '../../../typings';
import MainSideBar from '../../components/MainSidebar/MainSideBar';
import Footer from '../../components/Footer';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import InPersonClassesSchedule from '../../components/PageComponent/ClassesSchedule/InPersonClassesSchedule';
import ClassSections from '../../components/PageComponent/ClassesSchedule/ClassSections';
import { useAppDispatch } from '../../hooks/useTypeSelector';
import { toggleScroll } from '../../redux/features/headerHomeSlice';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { CldImage } from 'next-cloudinary';
import imageLoader from '../../../imageLoader';

export default function ClassesSchedulePage() {
  const [inPersonClasses, setInPersonClasses] = useState<InPersonClass[]>([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useAppDispatch();

  useEffect(() => {
    async function fetchData() {
      try {
        const inPersonRes = await fetch('/api/inPersonClass/getClasses?active=true', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0',
          },
        });

        const inPersonData = await inPersonRes.json();
        setInPersonClasses(inPersonData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching classes:', err);
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <MainSideBar where={'classes-schedule'}>
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner />
        </div>
      </MainSideBar>
    );
  }

  const hasLiveClasses = inPersonClasses.length > 0;

  return (
    <div
      className="relative bg-to-dark lg:h-full min-w-[90vw] min-h-screen overflow-scroll overflow-x-hidden"
      onScroll={(e: any) => {
        if (e.target.scrollTop === 0) {
          dispatch(toggleScroll(false));
        } else {
          dispatch(toggleScroll(true));
        }
      }}
    >
      <MainSideBar where={'classes-schedule'}>
        {/* Hero Banner con Imagen de Fondo */}
        <section className="relative w-full h-[110vh] sm:h-[90vh] md:h-[95vh] flex items-center justify-center overflow-hidden">
          {/* Imagen de fondo para mobile */}
          <div className="absolute inset-0 md:hidden">
            <CldImage
              src="my_uploads/fondos/move-clases-fondo_1_vfd9vr"
              alt="Banner de clases - Mobile"
              fill
              className="object-cover object-center"
              priority
              quality={80}
              preserveTransformations
              loader={imageLoader}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
          </div>
          
          {/* Imagen de fondo para desktop */}
          <div className="hidden md:block absolute inset-0">
            <CldImage
              src="my_uploads/plaza/DSC03370_l1kh3e"
              alt="Banner de clases - Desktop"
              fill
              className="object-cover object-center"
              priority
              quality={80}
              preserveTransformations
              loader={imageLoader}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
          </div>
          
          {/* Contenido del banner */}
          <div className="absolute inset-0 flex flex-col items-center justify-start sm:justify-center z-20 pb-32 sm:pb-0">
            <div className="px-6 py-8 mt-40 sm:mt-0 max-w-5xl mx-auto text-center">
              <h1 className="text-7xl leading-[4rem] md:text-8xl font-bold text-white font-montserrat mb-8 tracking-tight drop-shadow-2xl">
                Horarios y Clases
              </h1>
              <p className="text-xl md:text-3xl text-white/95 font-light max-w-4xl mx-auto font-montserrat mb-12 leading-relaxed drop-shadow-lg">
                Te invito a <strong className="font-semibold text-white">moverte conmigo</strong>. Tengo clases <strong className="font-semibold text-white">presenciales</strong>, <strong className="font-semibold text-white">comunes</strong> y <strong className="font-semibold text-white">personalizadas</strong>. 
              </p>
              
              {/* Botón WhatsApp */}
              <div className="flex justify-center gap-4">
                <a
                  href="https://wa.me/59899123456?text=Hola!%20Me%20interesa%20conocer%20más%20sobre%20tus%20clases%20presenciales.%20¿Podrías%20enviarme%20toda%20la%20información?"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/20 backdrop-blur-md text-white px-8 md:px-12 py-4 md:py-5 font-semibold text-base md:text-lg hover:bg-white hover:text-black transition-all duration-300 font-montserrat rounded-xl border border-white/30 shadow-2xl inline-flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  Info por WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>

        <main className="relative  md:space-y-12 lg:space-y-16 sm:px-6 md:px-12 lg:px-16 pb-12 -mt-20 md:-mt-24">
          {/* Secciones informativas - Separar por tipo */}
          {inPersonClasses.length > 0 && (
            <>
              {/* Sección para clases comunes */}
              {inPersonClasses.filter(c => c.classType === 'comun').length > 0 && (
                <ClassSections 
                  classType="comun" 
                  classes={inPersonClasses.filter(c => c.classType === 'comun')}
                />
              )}

              {/* Sección para clases personalizadas */}
              {inPersonClasses.filter(c => c.classType === 'personalizado').length > 0 && (
                <ClassSections 
                  classType="personalizado" 
                  classes={inPersonClasses.filter(c => c.classType === 'personalizado')}
                />
              )}
            </>
          )}

          {/* Clases en Vivo - Sección Principal */}
          {hasLiveClasses && (
            <section id="class-schedules" className="mb-12 md:mb-16 lg:mb-20 bg-gray-50 pt-20 pb-12 -mx-4 sm:-mx-6 md:-mx-12 lg:-mx-16 px-4 sm:px-6 md:px-12 lg:px-16">
              <div className="max-w-6xl mx-auto">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                  className="mb-12"
                >
                  <p className="uppercase tracking-[0.3em] text-xs md:text-sm text-gray-500 mb-3">Horarios</p>
                  <h2 className="text-3xl md:text-5xl font-bold text-black mb-6 font-montserrat">
                    Clases Disponibles
                  </h2>
                  <p className="text-base md:text-xl text-gray-600 font-light max-w-3xl leading-relaxed">
                    Encontrá la clase presencial que mejor se adapte a tu horario, nivel y tipo. Comunes o personalizadas, 
                    elegí lo que resuena contigo. Te invito a moverte conmigo en persona.
                  </p>
                </motion.div>

                {/* Clases Presenciales */}
                {inPersonClasses.length > 0 && (
                  <div>
                    <InPersonClassesSchedule classes={inPersonClasses} />
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Mensaje cuando no hay clases */}
          {!hasLiveClasses && (
            <section className="mb-12 md:mb-16">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl p-8 sm:p-12 text-center border border-white/10">
                <UserGroupIcon className="w-12 h-12 sm:w-16 sm:h-16 text-white mx-auto mb-4 opacity-50" />
                <h2 className="text-xl sm:text-2xl font-bold text-white font-montserrat mb-3 sm:mb-4">
                  Próximamente
                </h2>
                <p className="text-gray-400 text-sm sm:text-base font-montserrat max-w-2xl mx-auto">
                  Estamos preparando nuevas clases y horarios. ¡Mantenete atento para más información!
                </p>
              </div>
            </section>
          )}

          <Footer />
        </main>
      </MainSideBar>
    </div>
  );
}
