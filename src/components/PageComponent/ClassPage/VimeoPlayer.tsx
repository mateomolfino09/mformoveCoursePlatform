import React, { useEffect, useRef } from 'react';
import Player from '@vimeo/player';

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
      player.on('play', () => {
        // El video ha comenzado a reproducirse
      });
      player.on('ended', () => {
        // El video ha terminado
      });
      player.on('error', (error) => console.error('Error:', error));
    }
  }, [videoId]);

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
      <div
        ref={playerContainerRef}
        className="w-full h-full absolute inset-0"
        style={{ aspectRatio: '16/9' }}
      />
    </div>
  );
};

export default VimeoPlayer;
