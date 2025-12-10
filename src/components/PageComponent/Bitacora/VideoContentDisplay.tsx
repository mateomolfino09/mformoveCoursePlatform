'use client'
import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircleIcon, LockClosedIcon } from '@heroicons/react/24/solid';
import Player from '@vimeo/player';
import { toast } from 'react-hot-toast';

interface Props {
  videoUrl?: string;
  videoId?: string;
  thumbnailUrl?: string;
  title?: string;
  description?: string;
  duration?: number;
  onComplete?: () => void;
  isCompleted?: boolean;
  logbookId?: string;
  weekNumber?: number;
  dayNumber?: number;
}

const VideoContentDisplay = ({
  videoUrl,
  videoId,
  thumbnailUrl,
  title,
  description,
  duration,
  onComplete,
  isCompleted = false,
  logbookId,
  weekNumber,
  dayNumber
}: Props) => {
  const [videoProgress, setVideoProgress] = useState(0);
  const [canComplete, setCanComplete] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const playerRef = useRef<Player | null>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const videoElementRef = useRef<HTMLVideoElement>(null);

  // Extraer videoId de la URL si no está presente
  const extractVimeoId = (url?: string): string | null => {
    if (!url) return null;
    const vimeoMatch = url.match(/(?:vimeo\.com\/)(\d+)/);
    return vimeoMatch?.[1] || null;
  };

  // Determinar videoId final (del prop o extraído de la URL)
  const finalVideoId = videoId || extractVimeoId(videoUrl) || null;
  const isVimeo = Boolean(finalVideoId) || (videoUrl && videoUrl.includes('vimeo.com'));
  const vimeoId = finalVideoId;

  // Inicializar Vimeo Player y tracking de progreso
  useEffect(() => {
    const computedVideoId = videoId || extractVimeoId(videoUrl) || null;
    
    if (!computedVideoId || !playerContainerRef.current) return;

    const numericVideoId = Number(computedVideoId);
    if (!numericVideoId || isNaN(numericVideoId)) return;

    let player: Player | null = null;
    let totalDuration = 0;
    let progressInterval: ReturnType<typeof setInterval> | null = null;
    let isMounted = true;
    let isDestroyed = false;

    // Limpiar reproductor anterior si existe
    if (playerRef.current) {
      try {
        isDestroyed = true;
        const oldPlayer = playerRef.current;
        playerRef.current = null;
        oldPlayer.destroy().catch(() => {});
      } catch (e) {
        // Ignorar errores
      }
    }

    // Pequeño delay para asegurar que el DOM esté listo y que el cleanup anterior termine
    const initTimeout = setTimeout(() => {
      if (!isMounted || !playerContainerRef.current || isDestroyed) return;

      try {
        // Crear nuevo reproductor
        player = new Player(playerContainerRef.current, {
          id: numericVideoId,
          autoplay: false,
          loop: false,
          muted: false,
          playsinline: true,
          responsive: true,
        });

        if (!isMounted || isDestroyed) {
          player.destroy().catch(() => {});
          return;
        }

        playerRef.current = player;
        isDestroyed = false;

        // Función helper para verificar si el player es válido
        const isValidPlayer = () => {
          return isMounted && !isDestroyed && player && playerRef.current === player;
        };

        // Esperar a que el reproductor esté listo
        player.ready()
          .then(() => {
            if (!isValidPlayer()) return;
            
            // Obtener duración del video
            return player!.getDuration();
          })
          .then((duration) => {
            if (isValidPlayer() && duration) {
              totalDuration = duration;
            }
          })
          .catch((error) => {
            // Solo loguear si el componente aún está montado y no fue destruido intencionalmente
            if (isMounted && !isDestroyed) {
              console.warn('Error obteniendo duración del video:', error);
            }
          });

        // Trackear progreso
        const updateProgress = async () => {
          if (!isValidPlayer() || isCompleted) {
            if (isMounted && isCompleted) {
              setCanComplete(false);
            }
            return;
          }
          
          try {
            const currentTime = await player!.getCurrentTime();
            if (totalDuration > 0 && isValidPlayer()) {
              const progress = (currentTime / totalDuration) * 100;
              setVideoProgress(progress);
              setCanComplete(progress >= 95);
            }
          } catch (error) {
            // Silenciar errores de tracking (el reproductor puede estar siendo destruido)
            if (isValidPlayer()) {
              setCanComplete(false);
            }
          }
        };

        // Eventos del reproductor - usar funciones nombradas para poder removerlas
        const handleReady = () => {
          if (isValidPlayer()) {
            // Iniciar tracking de progreso
            if (progressInterval) {
              clearInterval(progressInterval);
            }
            progressInterval = setInterval(() => {
              if (isValidPlayer()) {
                updateProgress();
              }
            }, 1000);
          }
        };

        const handleTimeUpdate = () => {
          if (isValidPlayer()) {
            updateProgress();
          }
        };

        const handleProgress = () => {
          if (isValidPlayer()) {
            updateProgress();
          }
        };

        const handlePlay = () => {
          if (isValidPlayer()) {
            updateProgress();
          }
        };

        // Registrar eventos
        player.on('ready', handleReady);
        player.on('timeupdate', handleTimeUpdate);
        player.on('progress', handleProgress);
        player.on('play', handlePlay);

      } catch (error) {
        console.error('Error creando reproductor Vimeo:', error);
        if (playerRef.current === player) {
          playerRef.current = null;
        }
      }
    }, 150);

    return () => {
      isMounted = false;
      isDestroyed = true;
      
      clearTimeout(initTimeout);
      
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
      
      if (player && playerRef.current === player) {
        try {
          // Remover eventos antes de destruir
          player.off('ready');
          player.off('timeupdate');
          player.off('progress');
          player.off('play');
        } catch (e) {
          // Ignorar errores al remover eventos
        }
        
        // Destruir el reproductor con un pequeño delay para evitar errores
        setTimeout(() => {
          if (player) {
            player.destroy().catch(() => {});
          }
        }, 50);
      }
      
      playerRef.current = null;
      player = null;
    };
  }, [videoId, videoUrl, isCompleted]);

  // Para videos HTML5 nativos
  useEffect(() => {
    if (finalVideoId || !videoUrl) return;

    const videoElement = videoElementRef.current;
    if (!videoElement) return;

    const updateProgress = () => {
      if (isCompleted) {
        setCanComplete(false);
        return;
      }
      if (videoElement.duration > 0) {
        const progress = (videoElement.currentTime / videoElement.duration) * 100;
        setVideoProgress(progress);
        setCanComplete(progress >= 95);
      }
    };

    videoElement.addEventListener('timeupdate', updateProgress);
    videoElement.addEventListener('progress', updateProgress);
    videoElement.addEventListener('play', updateProgress);

    return () => {
      videoElement.removeEventListener('timeupdate', updateProgress);
      videoElement.removeEventListener('progress', updateProgress);
      videoElement.removeEventListener('play', updateProgress);
    };
  }, [videoUrl, finalVideoId, isCompleted]);

  const handleCompleteClick = async () => {
    if (!canComplete || isCompleting || isCompleted || !onComplete) return;

    setIsCompleting(true);
    try {
      await onComplete();
      toast.success('¡Clase completada! 🎉');
    } catch (error: any) {
      toast.error(error.message || 'Error al completar la clase');
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className='w-full space-y-6'
    >
      {title && (
        <h2 className='text-2xl md:text-3xl font-bold text-gray-900 font-montserrat tracking-tight'>
          {title}
        </h2>
      )}

      <div className='relative w-full rounded-2xl md:rounded-3xl overflow-hidden bg-black border border-gray-800/50 shadow-[0_15px_45px_rgba(0,0,0,0.6)]'>
        {isVimeo && vimeoId ? (
          <div 
            ref={playerContainerRef}
            className="relative w-full aspect-video bg-black"
          />
        ) : videoUrl ? (
          <div className='relative aspect-video'>
            <video
              ref={videoElementRef}
              src={videoUrl}
              controls
              className='w-full h-full'
              preload='metadata'
            />
          </div>
        ) : (
          <div className='aspect-video flex items-center justify-center bg-gray-900'>
            <p className='text-gray-400 font-montserrat'>No hay video disponible</p>
          </div>
        )}
      </div>

      {title && (
        <h3 className='text-gray-800 text-xl md:text-xl font-montserrat font-normal leading-relaxed'>
          {title}
        </h3>
      )}

      {description && (
        <p className='text-gray-400 text-sm md:text-base font-montserrat font-light leading-relaxed'>
          {description}
        </p>
      )}

      {onComplete && (
        <div className='flex justify-center'>
          <button
            onClick={handleCompleteClick}
            disabled={!canComplete || isCompleting || isCompleted}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-full font-montserrat font-medium transition-all duration-300
              ${isCompleted
                ? 'bg-green-500/20 border border-green-500/40 text-green-700 cursor-default'
                : canComplete
                ? 'bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-rose-500/20 backdrop-blur-md border border-amber-300/40 text-gray-900 hover:border-amber-300/60 hover:shadow-lg hover:shadow-amber-500/20 cursor-pointer'
                : 'bg-gray-200/50 border border-gray-300/40 text-gray-500 cursor-not-allowed opacity-60'
              }
            `}
          >
            {isCompleted ? (
              <>
                <CheckCircleIcon className='w-5 h-5' />
                <span>Clase Completada</span>
              </>
            ) : !canComplete ? (
              <>
                <LockClosedIcon className='w-5 h-5' />
                <span>Completar clase ({Math.round(videoProgress)}% / 95%)</span>
              </>
            ) : (
              <>
                {isCompleting ? (
                  <>
                    <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900' />
                    <span>Completando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className='w-5 h-5' />
                    <span>Completar clase</span>
                  </>
                )}
              </>
            )}
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default VideoContentDisplay;
