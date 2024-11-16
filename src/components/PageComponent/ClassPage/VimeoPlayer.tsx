import React, { useEffect, useRef } from 'react';
import Player from '@vimeo/player';
import { Container } from '@mui/material';

const VimeoPlayer = ({ videoId }: { videoId: string }) => {
  const playerContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (playerContainerRef?.current) {
      const player = new Player(playerContainerRef?.current, {
        id: Number(videoId), // Convertir string a número
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
    <div className="h-full w-full flex items-center justify-center">
      <Container className="!h-full !px-0">
        <div
          ref={playerContainerRef}
          className="video-container w-full h-full min-h-[20rem] top-16 lg:min-h-[60vh] relative"
        />
      </Container>
    </div>
  );
};

export default VimeoPlayer;
