import React, { useEffect, useRef, useState } from 'react';
import Player from '@vimeo/player';

const VimeoPlayer = ({ videoId }: { videoId: string }) => {
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const [privateToken, setPrivateToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Obtener token privado para videos UNLISTED
  useEffect(() => {
    const fetchPrivateToken = async () => {
      try {
        const res = await fetch('/api/vimeo/getPrivateToken', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoId }),
        });
        
        if (res.ok) {
          const data = await res.json();
          setPrivateToken(data.privateToken);
        }
      } catch (error) {
        console.error('Error obteniendo token privado:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (videoId) {
      fetchPrivateToken();
    }
  }, [videoId]);

  useEffect(() => {
    if (playerContainerRef?.current && !isLoading) {
      const playerOptions: any = {
        autoplay: true,
        loop: true,
        muted: true,
        playsinline: true,
        responsive: true, // Esto permite que el video se ajuste automáticamente
      };

      // Para videos UNLISTED, usar la URL completa con el hash en lugar del ID
      if (privateToken) {
        // Usar URL completa con hash para videos UNLISTED
        playerOptions.url = `https://player.vimeo.com/video/${videoId}?h=${privateToken}`;
      } else {
        // Para videos públicos, usar solo el ID
        playerOptions.id = Number(videoId);
      }

      const player = new Player(playerContainerRef?.current, playerOptions);

      // Eventos
      player.on('play', () => {
        // El video ha comenzado a reproducirse
      });
      player.on('ended', () => {
        // El video ha terminado
      });
      player.on('error', (error) => console.error('Error:', error));

      return () => {
        player.destroy().catch(() => {});
      };
    }
  }, [videoId, privateToken, isLoading]);

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
