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
      <div className='relative rounded-3xl border border-palette-stone/20 bg-palette-stone/10 backdrop-blur-sm p-12 text-center shadow-xl'>
        <p className='relative z-10 text-palette-stone font-montserrat font-light'>No hay contenido disponible</p>
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
        <div className='relative rounded-3xl bg-palette-stone/10 border border-palette-stone/20 backdrop-blur-sm p-6 md:p-8 overflow-hidden shadow-xl'>
          <div className='relative z-10 space-y-6'>
            {/* Title */}
            {(title || subtitle) && (
              <div>
                {title && (
                  <h3 className='text-3xl md:text-5xl font-bold text-palette-cream font-montserrat mb-2 tracking-tight'>
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className='text-palette-sage font-montserrat text-sm md:text-base font-light'>
                    {subtitle}
                  </p>
                )}
              </div>
            )}

            {/* Audio Player */}
            <div className='bg-palette-ink rounded-xl border border-palette-stone/20 p-4 shadow-sm space-y-4'>
              <div className='flex items-center gap-4'>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handlePlayPause}
                  className='flex-shrink-0 h-12 w-12 rounded-full bg-palette-sage/30 border border-palette-stone/40 flex items-center justify-center hover:bg-palette-sage/50 transition-all duration-300'
                >
                  {isPlaying ? (
                    <PauseIcon className='h-6 w-6 text-palette-cream' />
                  ) : (
                    <BsVolumeUp className='h-6 w-6 text-palette-cream' />
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
                      className='w-full h-1 bg-palette-stone/30 rounded-full appearance-none cursor-pointer slider-minimal'
                      style={{
                        background: `linear-gradient(to right, var(--palette-sage) 0%, var(--palette-sage) ${audioProgress}%, var(--palette-stone) ${audioProgress}%, var(--palette-stone) 100%)`
                      }}
                    />
                  </div>
                  
                  {/* Tiempo actual / Duración total */}
                  <div className='flex items-center justify-between text-xs text-palette-stone font-montserrat font-light'>
                    <span>{formatDuration(currentTime)}</span>
                    <span>{formatDuration(duration || audioDuration)}</span>
                  </div>
                </div>

                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onEnded={async () => {
                    setIsPlaying(false);
                    if (audioRef.current) {
                      audioRef.current.currentTime = 0;
                      setCurrentTime(0);
                    }
                    // Completar automáticamente cuando el audio termine
                    if (!isCompleted && !isCompleting && onComplete && canComplete) {
                      setIsCompleting(true);
                      try {
                        await onComplete();
                        toast.success('¡Clase completada! 🎉');
                      } catch (error: any) {
                        toast.error(error.message || 'Error al completar la clase');
                      } finally {
                        setIsCompleting(false);
                      }
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
                      ? 'bg-palette-sage/20 border border-palette-sage/40 text-palette-sage cursor-default'
                      : canComplete
                      ? 'bg-palette-sage/30 border border-palette-stone/40 text-palette-cream hover:bg-palette-sage/50 cursor-pointer'
                      : 'bg-palette-stone/20 border border-palette-stone/40 text-palette-stone cursor-not-allowed opacity-60'
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
        <div className='relative rounded-3xl p-6 md:p-8 overflow-hidden bg-palette-stone/5 border border-palette-stone/20'>
          <div className='relative z-10'>
            {!audioUrl && title && (
              <h3 className='text-2xl md:text-3xl font-bold text-palette-cream font-montserrat mb-4 tracking-tight'>
                {title}
              </h3>
            )}
            <div 
              className='prose prose-invert max-w-none text-palette-cream/90 font-montserrat font-light leading-relaxed'
              dangerouslySetInnerHTML={{ __html: text.replace(/\n/g, '<br />') }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AudioTextContentDisplay;

