import React, { useEffect, useRef, useState } from 'react';
import Player from '@vimeo/player';
import { Container } from '@mui/material';
import { PauseIcon } from '@heroicons/react/24/outline';
import { PlayIcon } from '@heroicons/react/24/solid';
import { LoadingSpinner } from '../../LoadingSpinner';

const VimeoPlayerPlan = ({ videoId }: { videoId: string }) => {
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent); // Detectar dispositivos móviles
  const [isPlaying, setIsPlaying] = useState(isMobile ? false : true); // Estado para manejar play/pausa
  const [isButtonVisible, setIsButtonVisible] = useState(true); // Estado para visibilidad del botón
  const [loading, setLoading] = useState(true); // Estado para visibilidad del botón

  // Ocultar el botón después de 3 segundos
  useEffect(() => {
    if (isButtonVisible) {
      const timeout = setTimeout(() => setIsButtonVisible(false), 3000);
      return () => clearTimeout(timeout);
    }
  }, [isButtonVisible]);

  useEffect(() => {
      if (playerContainerRef?.current) {
        const player = new Player(playerContainerRef?.current, {
          id: Number(videoId), // Convertir string a número
          autoplay: true,
          loop: true,
          muted: isMobile, // Muteado solo en dispositivos móviles
          controls: false,
          playsinline: true,
          responsive: true, // Esto permite que el video se ajuste automáticamente
        });

        player.on('loaded', () => {
          console.log('Video cargado');
          setLoading(false); // El video ha terminado de cargar
        });

      // Eventos
        player.on('ended', () => console.log('Video terminado'));
        player.on('error', (error) => console.error('Error:', error));

        // Manejar eventos de estado del reproductor
        player.on('play', () => {
          setIsPlaying(true);
          player.setMuted(false)
        })
        player.on('pause', () => setIsPlaying(false));
    }
  }, [videoId, playerContainerRef]);

  const handleMouseMove = () => {
    setIsButtonVisible(true); // Mostrar botón al mover el mouse
  };


  const handlePlayPause = () => {
    if (playerContainerRef?.current) {
      const player = new Player(playerContainerRef?.current);

      console.log(isPlaying)

      if (isPlaying) {
        player.pause();
        setIsPlaying(false)
      } else {
        player.play();
        player.setMuted(false)
        setIsPlaying(true)

      }
    }
  };

  return (
    <div className={`px-0 pb-6 md:p-0 h-full w-full flex items-center justify-center `}  onMouseMove={handleMouseMove}>
      <Container className="!h-full !px-0">
        <div
          ref={playerContainerRef}
          className="video-container w-full lg:min-h-[60vh] relative"
        />
        <button
            onClick={handlePlayPause}
            className={`absolute top-[33%] md:top-[43%] left-[48%] md:left-[38%] transform -translate-x-1/2 -translate-y-1/2  text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:bg-black/50 transition ${
                isButtonVisible ? 'opacity-100' : 'opacity-0'
            }`}
        >
            {isPlaying ? <PauseIcon className='h-8 w-8'/> : <PlayIcon className='h-8 w-8'/>}
        </button>
      </Container>

            {/* Mostrar loader mientras está cargando */}
            {loading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      )}


    </div>
  );
};

export default VimeoPlayerPlan;