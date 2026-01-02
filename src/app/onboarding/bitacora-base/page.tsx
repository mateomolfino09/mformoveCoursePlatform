'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleIcon, LockClosedIcon, PlayIcon, ExclamationTriangleIcon, ArrowRightIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';
import MainSideBar from '../../../components/MainSidebar/MainSideBar';
import FooterProfile from '../../../components/PageComponent/Profile/FooterProfile';
import BitacoraBaseLoading from '../../../components/PageComponent/MoveCrew/BitacoraBaseLoading';
import VideoContentDisplay from '../../../components/PageComponent/Bitacora/VideoContentDisplay';
import CoherenceCelebrationModal from '../../../components/PageComponent/Bitacora/CoherenceCelebrationModal';
import VideoHeaderGorilla from '../../../components/PageComponent/Bitacora/VideoHeaderGorilla';
import { useAuth } from '../../../hooks/useAuth';
import { CoherenceProvider, useCoherence } from '../../../contexts/CoherenceContext';

interface VideoData {
  id: string;
  title?: string;
  videoName?: string;
  description: string;
  videoId?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  weekNumber: number;
}

function BitacoraBasePageContent() {
  const router = useRouter();
  const auth = useAuth();
  const coherence = useCoherence();
  const [onboardingStatus, setOnboardingStatus] = useState<any>(null);
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [completingVideo, setCompletingVideo] = useState<string | null>(null);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);
  const [celebrationData, setCelebrationData] = useState<{
    ucsOtorgadas: number;
    totalUnits: number;
    currentStreak: number;
    esSemanaAdicional?: boolean;
    newAchievements?: Array<{ name: string; description: string; icon: string }>;
  } | null>(null);

  useEffect(() => {
    const checkScreenSize = () => {
      const isDesktopSize = window.innerWidth >= 1024;
      setIsDesktop(isDesktopSize);
      if (isDesktopSize) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    fetchOnboardingStatus();
    fetchBitacoraBase();
    coherence.fetchCoherenceTracking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchOnboardingStatus = async () => {
    try {
      const response = await fetch('/api/onboarding/status', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setOnboardingStatus(data);
        
        if (!data.contratoAceptado) {
          router.push('/onboarding/bienvenida');
          return;
        }

        if (data.bitacoraBaseCompletada) {
          router.push('/home');
          return;
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchBitacoraBase = async () => {
    try {
      const response = await fetch('/api/onboarding/bitacora-base', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setVideos(data.videos || []);
        
        // Seleccionar el primer video (siempre está desbloqueado)
        if (data.videos && data.videos.length > 0) {
          setSelectedVideoId(data.videos[0].id);
        }
      } else {
        console.error('Error obteniendo camino base');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  // Asegurar que el primer video esté seleccionado cuando los videos se cargan
  useEffect(() => {
    if (videos.length > 0) {
      // Si no hay video seleccionado, o el video seleccionado no existe en la lista, seleccionar el primero
      if (!selectedVideoId || !videos.find(v => v.id === selectedVideoId)) {
        setSelectedVideoId(videos[0].id);
      }
    }
  }, [videos, selectedVideoId]);

  const isVideoUnlocked = (videoId: string, videosList?: VideoData[]) => {
    if (!onboardingStatus || !videosList) return false;
    
    const videoIndex = videosList.findIndex(v => v.id === videoId);
    if (videoIndex === 0) return true;
    
    const previousVideo = videosList[videoIndex - 1];
    return onboardingStatus.bitacoraProgreso?.[previousVideo.id] === true;
  };

  const isVideoCompleted = (videoId: string) => {
    if (!onboardingStatus) return false;
    return onboardingStatus.bitacoraProgreso?.[videoId] === true;
  };

  const handleVideoComplete = async (videoId: string) => {
    if (completingVideo || isVideoCompleted(videoId)) return;

    setCompletingVideo(videoId);
    try {
      const response = await fetch('/api/onboarding/complete-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ videoId })
      });

      if (response.ok) {
        const data = await response.json();
        await fetchOnboardingStatus();
        
        // Actualizar tracking en el contexto
        if (data.tracking) {
          coherence.updateTracking({
            totalUnits: data.tracking.totalUnits,
            currentStreak: data.tracking.currentStreak,
            longestStreak: data.tracking.longestStreak
          });
        }
        
        // Mostrar modal de celebración si se otorgó U.C.
        if (data.ucsOtorgadas > 0 && data.tracking) {
          setCelebrationData({
            ucsOtorgadas: data.ucsOtorgadas,
            totalUnits: data.tracking.totalUnits,
            currentStreak: data.tracking.currentStreak,
            esSemanaAdicional: data.esSemanaAdicional || false,
            newAchievements: data.newAchievements || []
          });
          setShowCelebrationModal(true);
        }
        
        if (data.bitacoraCompletada) {
          // Si se completó toda la bitácora, actualizar el estado para que el modal redirija después de cerrarse
          await fetchOnboardingStatus();
          // Si no se otorgó U.C., redirigir directamente
          if (data.ucsOtorgadas === 0) {
            setTimeout(() => {
              router.push('/home');
            }, 2000);
          }
          // Si se otorgó U.C., el modal se encargará de la redirección
        } else {
          // Desbloquear el siguiente video
          const currentIndex = videos.findIndex(v => v.id === videoId);
          if (currentIndex < videos.length - 1) {
            setSelectedVideoId(videos[currentIndex + 1].id);
          }
        }
      } else {
        const error = await response.json();
        alert(error.error || 'Error al completar el video');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al procesar la solicitud');
    } finally {
      setCompletingVideo(null);
    }
  };

  const handleSelectVideo = (videoId: string) => {
    if (isVideoUnlocked(videoId, videos)) {
      setSelectedVideoId(videoId);
      if (typeof window !== 'undefined' && window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    }
  };

  if (initialLoading || loading) {
    return (
      <>
        <BitacoraBaseLoading show={initialLoading || loading} />
        <div className="min-h-screen bg-gray-50 font-montserrat" />
      </>
    );
  }

  const progress = onboardingStatus?.videosCompletados || 0;
  const total = videos.length || 4;
  const progressPercentage = total > 0 ? (progress / total) * 100 : 0;
  const selectedVideo = videos.find(v => v.id === selectedVideoId);

  return (
    <>
    <MainSideBar where={'bitacora'} forceStandardHeader onMenuClick={() => setSidebarOpen(prev => !prev)} sidebarOpen={sidebarOpen}>
      <BitacoraBaseLoading show={initialLoading} />
      <div className="min-h-screen bg-gray-50 font-montserrat relative">
        {/* Layout principal con flex */}
        <div className="flex relative justify-between">
          {/* Overlay para cerrar sidebar en mobile */}
          {sidebarOpen && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                setSidebarOpen(false);
              }}
              className="lg:hidden fixed inset-0 bg-black/50 z-[55] transition-opacity duration-300"
            />
          )}

          {/* Sidebar */}
          <motion.aside
            initial={false}
            animate={{
              x: isDesktop ? 0 : (sidebarOpen ? 0 : '-100%'),
            }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            onClick={(e) => e.stopPropagation()}
            className={`
              fixed lg:relative
              left-0 top-0 
              h-screen 
              bg-gradient-to-br from-white via-gray-50/50 to-amber-50/30 
              border-r border-amber-200/40 
              shadow-xl lg:shadow-none
              z-[58] lg:z-auto
              flex-shrink-0
              overflow-hidden
            `}
            style={{
              width: isDesktop 
                ? '420px'
                : '380px'
            }}
          >
            {/* Contenido del sidebar */}
            <div className={`
              w-[380px] md:w-[420px] h-full
              ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
              transition-opacity duration-150
              overflow-hidden
            `}>
              <div className='h-full flex flex-col bg-gradient-to-br from-white via-gray-50/50 to-amber-50/30 backdrop-blur-sm'>
                {/* Header */}
                <div className='p-6 md:pt-20 border-b border-amber-200/40 bg-gradient-to-r from-amber-100/30 via-orange-50/20 to-rose-100/30 flex-shrink-0'>
                  <button
                    onClick={() => router.push('/home')}
                    className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-4 transition-colors group"
                  >
                    <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-montserrat font-medium text-base">Volver a Home</span>
                  </button>
                  <h2 className='text-2xl font-bold text-gray-900 font-montserrat mb-1 tracking-tight'>
                    El Camino Base
                  </h2>
                  <p className='text-base text-gray-600 font-montserrat font-light'>
                    Videos fundamentales para comenzar
                  </p>
                  
                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600 font-montserrat">
                        {progress} de {total} videos
                      </span>
                      <span className="text-sm text-gray-600 font-montserrat">
                        {Math.round(progressPercentage)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercentage}%` }}
                        transition={{ duration: 0.5 }}
                        className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 h-2 rounded-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Videos List */}
                <div className='flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-amber-300/50 scrollbar-track-transparent py-4'>
                  {videos.map((video, index) => {
                    const unlocked = isVideoUnlocked(video.id, videos);
                    const completed = isVideoCompleted(video.id);
                    const isSelected = selectedVideoId === video.id;

                    return (
                      <div key={video.id} className='px-4 py-3 border-b border-amber-200/20 last:border-b-0'>
                        <button
                          onClick={() => handleSelectVideo(video.id)}
                          disabled={!unlocked}
                          className={`w-full p-3 rounded-xl text-left transition-all ${
                            !unlocked
                              ? 'opacity-50 cursor-not-allowed'
                              : isSelected
                              ? 'bg-gradient-to-r from-amber-100/50 via-orange-50/40 to-rose-100/50 border border-amber-300/50 shadow-sm'
                              : 'hover:bg-amber-50/70 border border-transparent'
                          }`}
                        >
                          <div className='flex items-center gap-3'>
                            <div className='flex-shrink-0'>
                              {completed ? (
                                <CheckCircleIcon className='h-5 w-5 text-amber-600' />
                              ) : !unlocked ? (
                                <LockClosedIcon className='h-5 w-5 text-gray-400' />
                              ) : (
                                <PlayIcon className='h-5 w-5 text-amber-700' />
                              )}
                            </div>
                            <div className='flex-1 min-w-0'>
                              <div className='flex items-center gap-2 mb-1'>
                                <span className='text-base font-bold text-gray-900 font-montserrat tracking-tight'>
                                  {video.videoName || `Video ${index + 1}`}
                                </span>
                              </div>
                              <p className='text-sm text-gray-700/90 font-montserrat font-medium truncate'>
                                {video.description || `Video ${index + 1}`}
                              </p>
                            </div>
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Botón para saltear */}
                {!onboardingStatus?.bitacoraBaseCompletada && (
                  <div className='p-4 border-t border-amber-200/40 bg-white/40'>
                    <button
                      onClick={() => setShowSkipModal(true)}
                      className="w-full px-4 py-2.5 bg-gray-200 border border-gray-300 rounded-lg text-gray-800 hover:bg-gray-300 transition-colors font-medium font-montserrat text-sm"
                    >
                      Saltear Camino Base
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.aside>

          {/* Contenido principal */}
          <div className={`
            flex-1 
            min-w-0
            transition-all duration-300
            ${sidebarOpen ? 'lg:ml-0' : 'lg:ml-0'}
            ${sidebarOpen ? 'lg:pointer-events-auto pointer-events-none' : 'pointer-events-auto'}
          `}
          style={{
            zIndex: sidebarOpen && !isDesktop ? 50 : 'auto'
          }}
          >
            {/* Main Content */}
            <div className="min-h-screen">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 lg:pt-20 pb-8">
                {/* Banner mobile compacto para video */}
                {selectedVideo && (
                  <div className="md:hidden mb-4 rounded-xl px-3 relative bottom-1">
                    <div className="flex items-center justify-between gap-3">
                      {/* Icono de gorila con nivel */}
                      {coherence.coherenceTracking && (
                        <div className="relative">
                          <VideoHeaderGorilla
                            level={coherence.coherenceTracking.level || 1}
                            gorillaIcon={coherence.coherenceTracking.gorillaIcon || '🦍'}
                          />
                        </div>
                      )}

                      {/* Información de progreso y U.C. */}
                      <div className="flex-1 flex items-center gap-2">
                        {/* Porcentaje completado */}
                        <div className="relative flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-rose-500/20 backdrop-blur-md border border-amber-300/40 rounded-full shadow-sm">
                          <span className="text-base font-bold text-gray-900 font-montserrat">
                            {Math.round(progressPercentage)}%
                          </span>
                          <span className="text-[10px] text-gray-700 font-montserrat font-light uppercase tracking-wide">
                            Completado
                          </span>
                        </div>
                        
                        {/* U.C. */}
                        {coherence.coherenceTracking && (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-rose-500/20 backdrop-blur-md border border-amber-300/40 rounded-full shadow-sm">
                            <span className="text-amber-600 text-sm flex-shrink-0">▲</span>
                            <span className="text-base font-bold text-gray-900 font-montserrat">
                              {coherence.coherenceTracking?.totalUnits || 0}
                            </span>
                            <span className="text-[10px] text-gray-700 font-montserrat font-light uppercase tracking-wide">
                              U.C.
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="relative">
                  {/* Banner de progreso para web - alineado a la derecha arriba */}
                  {selectedVideo && (
                    <div className="hidden md:flex absolute right-4 z-10 rounded-xl -top-3 md:p-1 md:mb-2">
                      <div className="flex items-center gap-3">
                        {/* Icono de gorila con nivel */}
                        {coherence.coherenceTracking && (
                          <div className="relative">
                            <VideoHeaderGorilla
                              level={coherence.coherenceTracking.level || 1}
                              gorillaIcon={coherence.coherenceTracking.gorillaIcon || '🦍'}
                            />
                          </div>
                        )}

                        {/* Información de progreso y U.C. */}
                        <div className="flex items-center gap-2">
                          {/* Porcentaje completado */}
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-rose-500/20 backdrop-blur-md border border-amber-300/40 rounded-full shadow-sm">
                            <span className="text-base font-bold text-gray-900 font-montserrat">
                              {Math.round(progressPercentage)}%
                            </span>
                            <span className="text-[10px] text-gray-700 font-montserrat font-light uppercase tracking-wide">
                              Completado
                            </span>
                          </div>
                          
                          {/* U.C. */}
                          {coherence.coherenceTracking && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-rose-500/20 backdrop-blur-md border border-amber-300/40 rounded-full shadow-sm">
                              <span className="text-amber-600 text-sm flex-shrink-0">▲</span>
                              <span className="text-base font-bold text-gray-900 font-montserrat">
                                {coherence.coherenceTracking?.totalUnits || 0}
                              </span>
                              <span className="text-[10px] text-gray-700 font-montserrat font-light uppercase tracking-wide">
                                U.C.
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                {selectedVideo && isVideoUnlocked(selectedVideo.id, videos) ? (
                  <AnimatePresence mode="wait">
                    <VideoContentDisplay
                      key={selectedVideo.id}
                      videoUrl={selectedVideo.videoUrl}
                      videoId={selectedVideo.videoId}
                      thumbnailUrl={selectedVideo.thumbnailUrl}
                      title={selectedVideo.title}
                      description={selectedVideo.description}
                      duration={selectedVideo.duration}
                      onComplete={() => handleVideoComplete(selectedVideo.id)}
                      isCompleted={isVideoCompleted(selectedVideo.id)}
                    />
                  </AnimatePresence>
                ) : selectedVideo && !isVideoUnlocked(selectedVideo.id, videos) ? (
                  <div className="relative rounded-3xl border border-gray-200 bg-white p-10 text-left sm:text-center shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
                    <div className="relative z-10">
                      <LockClosedIcon className="w-16 h-16 text-amber-600 sm:mx-auto mb-4" />
                      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 font-montserrat mb-3 tracking-tight">
                        Video bloqueado
                      </h2>
                      <p className="text-base sm:text-lg text-gray-700/90 mb-3 font-montserrat font-light">
                        Completa el video anterior para desbloquear este contenido.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="relative rounded-3xl border border-gray-200 bg-white p-10 text-left sm:text-center shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
                    <p className="relative z-10 text-base sm:text-lg text-gray-800 font-montserrat font-light">Selecciona un video para comenzar</p>
                  </div>
                )}
                </div>

                {/* Completion Message */}
                {onboardingStatus?.bitacoraBaseCompletada && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-8 bg-green-500/20 border-2 border-green-500 rounded-lg p-6 text-center"
                  >
                    <CheckCircleIcon className="h-16 w-16 text-green-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2 text-gray-900 font-montserrat">Camino Base Completado!</h2>
                    <p className="text-gray-700 font-montserrat">
                      Redirigiendo al dashboard principal...
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <FooterProfile />
    </MainSideBar>

    {/* Modal de confirmación para saltear */}
    <AnimatePresence>
      {showSkipModal && (
        <>
          {/* Overlay suave y natural */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[200]"
            style={{
              background: `linear-gradient(135deg, rgba(139, 69, 19, 0.3) 0%, rgba(249, 115, 22, 0.2) 100%)`,
              backdropFilter: 'blur(8px)'
            }}
            onClick={() => setShowSkipModal(false)}
          />

          {/* Modal principal */}
          <div className="fixed inset-0 flex items-center justify-center z-[201] pointer-events-none p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 25,
                duration: 0.6
              }}
              className="pointer-events-auto relative w-full max-w-md mx-auto my-auto max-h-[90vh] overflow-y-auto"
            >
              {/* Contenedor principal minimalista y natural */}
              <div 
                className="relative rounded-3xl shadow-2xl overflow-hidden border"
                style={{
                  background: `linear-gradient(135deg, #FFFDFD 0%, #FEFCF8 50%, #F5F1E8 100%)`,
                  borderColor: `#F9731630`,
                  borderWidth: '1px'
                }}
              >
                {/* Efectos de fondo sutiles y naturales - partículas orgánicas */}
                <div className="absolute inset-0 overflow-hidden opacity-40">
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute rounded-full"
                      style={{
                        width: `${4 + Math.random() * 6}px`,
                        height: `${4 + Math.random() * 6}px`,
                        backgroundColor: i % 2 === 0 
                          ? `#F9731620` 
                          : `#FED7AA30`
                      }}
                      initial={{
                        x: Math.random() * 400,
                        y: Math.random() * 400,
                        scale: 0,
                        rotate: 0
                      }}
                      animate={{
                        scale: [0, 1.2, 0],
                        rotate: [0, 180, 360],
                        x: Math.random() * 400,
                        y: Math.random() * 400,
                      }}
                      transition={{
                        duration: 3 + Math.random() * 2,
                        repeat: Infinity,
                        delay: Math.random() * 3,
                        ease: 'easeInOut'
                      }}
                    />
                  ))}
                </div>

                {/* Contenido */}
                <div className="relative p-4 md:p-8 text-center">
                  {/* Icono de advertencia natural */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 150,
                      damping: 20,
                      delay: 0.2
                    }}
                    className="flex justify-center mb-4 md:mb-6"
                  >
                    <div className="relative">
                      {/* Círculo orgánico con gradiente análogo */}
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut'
                        }}
                        className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center backdrop-blur-sm border"
                        style={{
                          background: `linear-gradient(135deg, rgba(245, 158, 11, 0.3) 0%, rgba(249, 115, 22, 0.3) 50%, rgba(225, 29, 72, 0.3) 100%)`,
                          borderColor: 'rgba(251, 191, 36, 0.4)',
                          borderWidth: '1px',
                          boxShadow: `0 8px 24px rgba(245, 158, 11, 0.2)`
                        }}
                      >
                        <motion.div
                          animate={{
                            rotate: [0, 5, -5, 0]
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: 'easeInOut'
                          }}
                          className="text-3xl md:text-4xl"
                        >
                          ⚠️
                        </motion.div>
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Título minimalista y natural */}
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-2xl md:text-3xl font-light font-montserrat tracking-wide mb-2 md:mb-3"
                    style={{ color: '#8B4513' }}
                  >
                    ¿Saltear el Camino Base?
                  </motion.h2>

                  {/* Mensaje principal */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-sm md:text-base font-montserrat font-light mb-4 md:mb-5 leading-relaxed"
                    style={{ color: '#8B4513' }}
                  >
                    Si saltás el Camino Base, <span className="font-medium" style={{ color: '#EA580C' }}>te perdés las U.C. de estos 4 videos</span>.
                  </motion.p>

                  {/* Mensaje secundario */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-xs md:text-sm font-montserrat font-light mb-6 md:mb-7"
                    style={{ color: '#6B7280' }}
                  >
                    Podés acceder igual al Camino del Gorila y empezar a ganar U.C. desde ahí.
                  </motion.p>

                  {/* Botones */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="flex gap-3 md:gap-4"
                  >
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowSkipModal(false)}
                      className="flex-1 px-4 py-2.5 md:py-3 rounded-full transition-all duration-300 font-light font-montserrat text-sm md:text-base backdrop-blur-sm border"
                      style={{
                        background: `linear-gradient(135deg, #FED7AA20 0%, #FED7AA10 100%)`,
                        borderColor: `#F9731630`,
                        borderWidth: '1px',
                        color: '#8B4513',
                        boxShadow: `0 4px 12px rgba(245, 158, 11, 0.1)`
                      }}
                    >
                      Volver
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setShowSkipModal(false);
                        router.push('/home');
                      }}
                      className="flex-1 px-4 py-2.5 md:py-3 rounded-full transition-all duration-300 font-light font-montserrat text-sm md:text-base backdrop-blur-sm border flex items-center justify-center gap-2"
                      style={{
                        background: `linear-gradient(135deg, rgba(245, 158, 11, 0.3) 0%, rgba(249, 115, 22, 0.3) 50%, rgba(225, 29, 72, 0.3) 100%)`,
                        borderColor: 'rgba(251, 191, 36, 0.4)',
                        borderWidth: '1px',
                        color: '#8B4513',
                        boxShadow: `0 4px 12px rgba(245, 158, 11, 0.15)`
                      }}
                    >
                      Saltear y continuar
                      <ArrowRightIcon className="h-5 w-5" />
                    </motion.button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>

    {/* Modal de celebración cuando se obtiene U.C. */}
    {celebrationData && (
      <CoherenceCelebrationModal
        isOpen={showCelebrationModal}
        onClose={() => {
          setShowCelebrationModal(false);
          setCelebrationData(null);
          // Si se completó toda la bitácora, redirigir después de cerrar el modal
          if (onboardingStatus?.bitacoraBaseCompletada) {
            setTimeout(() => {
              router.push('/home');
            }, 500);
          }
        }}
        ucsOtorgadas={celebrationData.ucsOtorgadas}
        totalUnits={celebrationData.totalUnits}
        currentStreak={celebrationData.currentStreak}
        esSemanaAdicional={celebrationData.esSemanaAdicional}
        newAchievements={celebrationData.newAchievements}
      />
    )}
    </>
  );
}

export default function BitacoraBasePage() {
  return (
    <CoherenceProvider>
      <BitacoraBasePageContent />
    </CoherenceProvider>
  );
}
