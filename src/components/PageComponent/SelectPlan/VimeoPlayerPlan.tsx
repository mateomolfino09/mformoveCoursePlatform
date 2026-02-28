import React, { useEffect, useRef, useState } from 'react';
import Player from '@vimeo/player';
import { Container } from '@mui/material';
import { PauseIcon } from '@heroicons/react/24/outline';
import { PlayIcon } from '@heroicons/react/24/solid';
import { LoadingSpinner } from '../../LoadingSpinner';
import { BiFullscreen } from 'react-icons/bi';
import screenfull from 'screenfull';

const VimeoPlayerPlan = ({ videoId }: { videoId: string }) => {
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent); // Detectar dispositivos móviles
  const [isPlaying, setIsPlaying] = useState(isMobile ? false : true); // Estado para manejar play/pausa
  const [isButtonVisible, setIsButtonVisible] = useState(true); // Estado para visibilidad del botón
  const [loading, setLoading] = useState(true); // Estado para visibilidad del botón
  const [isFullScreen, setIsFullScreen] = useState(false); // Estado para manejar play/pausa
  const isSafariMobile =
  /^((?!chrome|android).)*safari/i.test(navigator.userAgent) &&
  /iPhone|iPad|iPod/i.test(navigator.userAgent)

  // Ocultar el botón después de 3 segundos
  useEffect(() => {
    if (isButtonVisible) {
      const timeout = setTimeout(() => setIsButtonVisible(false), 3000);
      return () => clearTimeout(timeout);
    }
  }, [isButtonVisible]);

  const [privateToken, setPrivateToken] = useState<string | null>(null);
  const [tokenLoaded, setTokenLoaded] = useState(false);

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
        setTokenLoaded(true);
      }
    };

    if (videoId) {
      fetchPrivateToken();
    }
  }, [videoId]);

  useEffect(() => {
      if (playerContainerRef?.current && tokenLoaded) {
        const playerOptions: any = {
          autoplay: true,
          loop: true,
          muted: isMobile, // Muteado solo en dispositivos móviles
          controls: false,
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

        player.on('loaded', () => {
          setLoading(false); // El video ha terminado de cargar
        });

      // Eventos
        player.on('ended', () => {
          // El video ha terminado, puedes agregar lógica aquí si es necesario
        });
        player.on('error', (error) => console.error('Error:', error));

        // Manejar eventos de estado del reproductor
        player.on('play', () => {
          setIsPlaying(true);
          player.setMuted(false)
        })
        player.on('pause', () => setIsPlaying(false));

        return () => {
          player.destroy().catch(() => {});
        };
    }
  }, [videoId, playerContainerRef, privateToken, tokenLoaded, isMobile]);

  const handleMouseMove = () => {
    setIsButtonVisible(true); // Mostrar botón al mover el mouse
  };


  const handlePlayPause = async () => {
    if (playerContainerRef?.current) {
      // Obtener la instancia del player existente desde el contenedor
      // El Player de Vimeo se puede obtener del iframe dentro del contenedor
      const iframe = playerContainerRef.current.querySelector('iframe');
      if (!iframe) return;

      // Crear una nueva instancia del player usando el iframe existente
      const player = new Player(iframe);

      try {
        if (isPlaying) {
          await player.pause();
          setIsPlaying(false);
        } else {
          await player.play();
          await player.setMuted(false);
          setIsPlaying(true);
        }
      } catch (error) {
        console.error('Error controlando reproducción:', error);
      }
    }
  };

  const handleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
    if (playerContainerRef.current && screenfull.isEnabled) {
      screenfull
      .toggle(playerContainerRef.current)
      .then(() => {
        setIsFullScreen(!isFullScreen);
      })
      .catch((err) => {
        console.error("Failed to enable fullscreen", err);
      });
    }
  };

  // useEffect(() => {
  //   const onFullscreenChange = () => {
  //     setIsFullScreen(screenfull.isFullscreen); // Actualizar el estado de pantalla completa
  //   };

  //   // Añadir listener para el cambio de pantalla completa
  //   screenfull.on('change', onFullscreenChange);

  //   // Limpiar listener cuando el componente se desmonte
  //   return () => {
  //     screenfull.off('change', onFullscreenChange);
  //   };
  // }, []);

  return (
    <div className={`px-0 md:p-0 h-full w-full flex items-center rounded-md overflow-hidden max-w-[900px] justify-center shadow-2xl `}  onMouseMove={handleMouseMove}>
      <Container className="!h-full !px-0 relative">
        <div
          ref={playerContainerRef}
          className="video-container w-full relative"
        />
        <button
            onClick={handlePlayPause}
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2  text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg z-[100] hover:bg-black/50 transition ${
                isButtonVisible ? 'opacity-100' : 'opacity-0'
            }`}
        >
            {isPlaying ? <PauseIcon className='h-8 w-8'/> : <PlayIcon className='h-8 w-8'/>}
        </button>

                {/* Botón de pantalla completa */}
                {/* <button
          onClick={handleFullScreen}
          className={`absolute -right-0 -bottom-0 transform  text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:bg-black/50 transition`}
        >
        <BiFullscreen className='md:h-8 md:w-8 h-5 w-5'/>
        </button>
         */}
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
