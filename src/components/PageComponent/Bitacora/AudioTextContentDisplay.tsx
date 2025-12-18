'use client'
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { PauseIcon, CheckCircleIcon, LockClosedIcon } from '@heroicons/react/24/solid';
import { BsVolumeUp } from 'react-icons/bs';
import { toast } from 'react-hot-toast';

interface Props {
  audioUrl?: string;
  audioDuration?: number;
  text?: string;
  title?: string;
  subtitle?: string;
  onComplete?: () => void;
  isCompleted?: boolean;
  logbookId?: string;
  weekNumber?: number;
  dayNumber?: number;
}

const AudioTextContentDisplay = ({
  audioUrl,
  audioDuration,
  text,
  title,
  subtitle,
  onComplete,
  isCompleted = false,
  logbookId,
  weekNumber,
  dayNumber
}: Props) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [canComplete, setCanComplete] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const formatDuration = (seconds?: number) => {
    if (!seconds && seconds !== 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Trackear progreso del audio
  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement || !audioUrl) return;

    const updateProgress = () => {
      if (isCompleted) {
        setCanComplete(false);
        return;
      }
      if (audioElement.duration > 0) {
        const progress = (audioElement.currentTime / audioElement.duration) * 100;
        setAudioProgress(progress);
        setCurrentTime(audioElement.currentTime);
        setCanComplete(progress >= 95);
      }
    };

    const updateDuration = () => {
      if (audioElement.duration) {
        setDuration(audioElement.duration);
      }
    };

    audioElement.addEventListener('timeupdate', updateProgress);
    audioElement.addEventListener('loadedmetadata', updateDuration);
    audioElement.addEventListener('durationchange', updateDuration);
    audioElement.addEventListener('progress', updateProgress);

    return () => {
      audioElement.removeEventListener('timeupdate', updateProgress);
      audioElement.removeEventListener('loadedmetadata', updateDuration);
      audioElement.removeEventListener('durationchange', updateDuration);
      audioElement.removeEventListener('progress', updateProgress);
    };
  }, [audioUrl, isCompleted]);

  // Fallback por si algún navegador limita timeupdate
  useEffect(() => {
    if (!isPlaying) return;
    const tick = setInterval(() => {
      const audioElement = audioRef.current;
      if (!audioElement || audioElement.duration === 0) return;
      const progress = (audioElement.currentTime / audioElement.duration) * 100;
      setAudioProgress(progress);
      setCurrentTime(audioElement.currentTime);
      setCanComplete(progress >= 95);
    }, 500);
    return () => clearInterval(tick);
  }, [isPlaying, isCompleted]);

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const seekTime = (parseFloat(e.target.value) / 100) * duration;
    audioRef.current.currentTime = seekTime;
    setAudioProgress(parseFloat(e.target.value));
  };

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

  if (!audioUrl && !text) {
    return (
      <div className='relative rounded-3xl border border-amber-200/40 bg-gradient-to-br from-white via-gray-50/50 to-amber-50/30 backdrop-blur-sm p-12 text-center shadow-[0_4px_20px_rgba(0,0,0,0.04)]'>
        <div className='absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-200/10 to-orange-200/5 rounded-full blur-3xl' />
        <p className='relative z-10 text-gray-700/90 font-montserrat font-light'>No hay contenido disponible</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className='w-full space-y-6'
    >
      {/* Audio Player Section */}
      {audioUrl && (
        <div className='relative rounded-3xl  backdrop-blur-sm p-6 md:p-8 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.04)]'>
          <div className='absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-200/10 to-orange-200/5 rounded-full blur-3xl' />
          
          <div className='relative z-10 space-y-6'>
            {/* Title */}
            {(title || subtitle) && (
              <div>
                {title && (
                  <h3 className='text-3xl md:text-5xl font-bold text-gray-900 font-montserrat mb-2 tracking-tight'>
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className='text-amber-600 font-montserrat text-sm md:text-base font-light'>
                    {subtitle}
                  </p>
                )}
              </div>
            )}

            {/* Audio Player */}
            <div className='bg-white/60 rounded-xl border border-amber-200/30 p-4 shadow-sm space-y-4'>
              <div className='flex items-center gap-4'>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handlePlayPause}
                  className='flex-shrink-0 h-12 w-12 rounded-full bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-rose-500/20 border border-amber-300/40 flex items-center justify-center hover:border-amber-300/60 transition-all duration-300'
                >
                  {isPlaying ? (
                    <PauseIcon className='h-6 w-6 text-gray-900' />
                  ) : (
                    <BsVolumeUp className='h-6 w-6 text-gray-900' />
                  )}
                </motion.button>
                
                <div className='flex-1 space-y-2'>
                  {/* Línea de tiempo (timeline) */}
                  <div className='relative py-2'>
                    <input
                      type='range'
                      min='0'
                      max='100'
                      step='0.1'
                      value={audioProgress}
                      onChange={handleSeek}
                      className='w-full h-1 bg-gray-300 rounded-full appearance-none cursor-pointer slider-minimal'
                      style={{
                        background: `linear-gradient(to right, #1f2937 0%, #1f2937 ${audioProgress}%, #d1d5db ${audioProgress}%, #d1d5db 100%)`
                      }}
                    />
                  </div>
                  
                  {/* Tiempo actual / Duración total */}
                  <div className='flex items-center justify-between text-xs text-gray-500 font-montserrat font-light'>
                    <span>{formatDuration(currentTime)}</span>
                    <span>{formatDuration(duration || audioDuration)}</span>
                  </div>
                </div>

                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onEnded={() => {
                    setIsPlaying(false);
                    if (audioRef.current) {
                      audioRef.current.currentTime = 0;
                      setCurrentTime(0);
                    }
                  }}
                  onPause={() => setIsPlaying(false)}
                  onPlay={() => setIsPlaying(true)}
                  onLoadedMetadata={() => {
                    if (audioRef.current) {
                      setDuration(audioRef.current.duration);
                    }
                  }}
                  className='hidden'
                  onTimeUpdate={() => {
                    const audioElement = audioRef.current;
                    if (!audioElement || audioElement.duration === 0) return;
                    const progress = (audioElement.currentTime / audioElement.duration) * 100;
                    setAudioProgress(progress);
                    setCurrentTime(audioElement.currentTime);
                    setCanComplete(progress >= 95);
                  }}
                  preload='metadata'
                />
              </div>
            </div>

            {/* Botón Completar Clase */}
            {onComplete && (
              <div className='flex justify-start'>
                <button
                  onClick={handleCompleteClick}
                  disabled={!canComplete || isCompleting || isCompleted}
                  className={`
                    flex items-center w-full gap-2 px-6 py-3 rounded-full font-montserrat font-medium transition-all duration-300
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
                      <span>Completar clase ({Math.round(audioProgress)}% / 95%)</span>
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
          </div>
        </div>
      )}

      {/* Text Content */}
      {text && (
        <div className='relative rounded-3xl p-6 md:p-8 overflow-hidden '>
          <div className='absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-200/10 to-orange-200/5 rounded-full blur-2xl' />
          
          <div className='relative z-10'>
            {!audioUrl && title && (
              <h3 className='text-2xl md:text-3xl font-bold text-gray-900 font-montserrat mb-4 tracking-tight'>
                {title}
              </h3>
            )}
            <div 
              className='prose max-w-none text-gray-700/90 font-montserrat font-light leading-relaxed'
              dangerouslySetInnerHTML={{ __html: text.replace(/\n/g, '<br />') }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AudioTextContentDisplay;

