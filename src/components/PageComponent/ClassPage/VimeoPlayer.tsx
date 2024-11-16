import React, { useEffect, useRef } from 'react';
import Player from '@vimeo/player';
import { Container } from '@mui/material';

const VimeoPlayer = ({ videoId }: { videoId: string }) => {
  const playerContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (playerContainerRef.current) {
      const player = new Player(playerContainerRef.current, {
        id: Number("1030323408"), // Convertir string a número
        autoplay: true,
        loop: true,
        muted: true,
        playsinline: true,
        responsive: true, // Esto permite que el video se ajuste automáticamente
      });

      // Eventos
      player.on('play', () => console.log('Reproduciendo...'));
      player.on('ended', () => console.log('Video terminado'));
      player.on('error', (error) => console.error('Error:', error));
    }
  }, [videoId]);

  return (
    <div className="h-full w-full">
      <Container className="!h-full !px-0">
        {/* El contenedor para el player */}
        <div
          ref={playerContainerRef}
          className="video-container w-full h-full min-h-[30rem] lg:min-h-[60vh] relative border border-3 border-solid border-black"
        />
      </Container>
    </div>
  );
};

export default VimeoPlayer;
