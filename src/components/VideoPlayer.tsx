import { ClassesDB, CourseUser, User } from '../../typings';
import PlayerControls from './PlayerControls';
import { Container, Grid, Paper, Typography } from '@mui/material';
import axios from 'axios';
import { useRouter, usePathname } from 'next/navigation';
import { parseCookies } from 'nookies';
import React, {
  HtmlHTMLAttributes,
  RefObject,
  useEffect,
  useRef,
  useState
} from 'react';
import ReactPlayer from 'react-player';
import screenfull from 'screenfull';

interface Props {
  url: string | null;
  img: string;
  title: string | null;
  setPlayerRef: any;
  play: boolean;
  isToShow: boolean
}

const format = (seconds: any) => {
  if (isNaN(seconds)) {
    return `00:00`;
  }
  const date = new Date(seconds * 1000);
  const hh = date.getUTCHours();
  const mm = date.getUTCMinutes();
  const ss = date.getUTCSeconds().toString().padStart(2, '0');
  if (hh) {
    return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`;
  }
  return `${mm}:${ss}`;
};

let count = 0;

function Youtube({ url, img, title, setPlayerRef, play, isToShow }: Props) {
  const router = useRouter();
  const [state, setState] = useState({
    playing: true,
    muted: false,
    volume: 0.5,
    playbackRate: 1.0,
    fullScreen: false,
    played: 0,
    seeking: false
  });

  const cookies = parseCookies();

  const [timeDisplayFormat, setTimeDisplayFormat] = React.useState('normal');
  const [bookmarks, setBookmarks] = useState<any>([]);

  const { playing, muted, volume, playbackRate, fullScreen, played, seeking } =
    state;
  const [controlRef, setControlRef] =
    useState<RefObject<HTMLDivElement> | null>(null);
  const playerRef = useRef<ReactPlayer>(null);
  const playerContainerRef = useRef<any>(null);
  const canvasRef = useRef<any>(null);
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    setState({ ...state, playing: !playing });
  }, [play]);

  useEffect(() => {
    setPlayerRef(playerRef);
    // playerRef.current && playerRef.current.seekTo(courseUser?.actualTime != null ? courseUser?.actualTime : 0)
  }, [router]);

  const handlePlayPause = () => {
    setState({ ...state, playing: !state.playing });
  };

  const handleRewind = () => {
    playerRef.current &&
      playerRef.current.seekTo(playerRef.current.getCurrentTime() - 10);
  };
  const handleFastForward = () => {
    playerRef.current &&
      playerRef.current.seekTo(playerRef.current.getCurrentTime() + 10);
  };

  const handleMute = () => {
    setState({ ...state, muted: !state.muted });
  };

  const handlePlaybackRateChange = (rate: any) => {
    setState({ ...state, playbackRate: rate });
  };

  const handleVolumeChange = (e: any, newValue: any) => {
    setState({
      ...state,
      volume: parseFloat((newValue / 100).toString()),
      muted: newValue === 0 ? true : false
    });
  };

  const handleVolumeSeek = (e: any, newValue: any) => {
    setState({
      ...state,
      volume: parseFloat((newValue / 100).toString()),
      muted: newValue === 0 ? true : false
    });
  };

  const toggleFullScreen = () => {
    setState({
      ...state,
      fullScreen: !fullScreen
    });
    if (playerContainerRef.current && screenfull.isEnabled) {
      screenfull.request(playerContainerRef.current);

      screenfull.on('error', event => {
        console.error('Failed to enable fullscreen', event);
      });
    }
  };

  const handleSeekChange = (e: any, newValue: any) => {
    setState({ ...state, played: parseFloat((newValue / 100).toString()) });
  };

  const handleSeekMouseDown = (e: any) => {
    setState({ ...state, seeking: true });
  };

  const handleSeekMouseUp = (e: any, newValue: any) => {
    setState({ ...state, seeking: false });
    playerRef.current ? playerRef.current.seekTo(newValue / 100) : null;
  };

  const handleProgress = (changeState: any) => {
    if (count > 3) {
      controlRef?.current
        ? (controlRef.current.style.visibility = 'hidden')
        : null;
      count = 0;
    }

    if (
      controlRef?.current &&
      controlRef.current.style.visibility == 'visible'
    ) {
      count += 1;
    }

    if (changeState.playedSeconds === 0 && changeState.loadedSeconds === 0) {
      setTimeout(() => {
        // Si después de 10 segundos sigue sin progreso, marcar como atascado
        setIsStuck(true);
      }, 10000);
    } else {
      setIsStuck(false)
    }

    if (!state.seeking) setState({ ...state, ...changeState });
  };
  const handleMouseMove = () => {
    controlRef?.current
      ? (controlRef.current.style.visibility = 'visible')
      : null;
    count = 0;
  };

  const addBookmark = () => {
    const canvas = canvasRef.current;
    canvas.width = 160;
    canvas.height = 90;
    const ctx = canvas.getContext('2d');

    if (playerRef.current != null) {
      canvas.width = 0;
      canvas.height = 0;
      const bookmarksCopy = [...bookmarks];
      bookmarksCopy.push({
        time: playerRef.current.getCurrentTime(),
        display: format(playerRef.current.getCurrentTime()),
        image: img
      });
      setBookmarks(bookmarksCopy);
    }
  };

  function setControlerRef(ref: RefObject<HTMLDivElement>) {
    setControlRef(ref);
  }

  const currentTime = playerRef.current
    ? playerRef.current.getCurrentTime()
    : '00:00';
  const duration = playerRef.current
    ? playerRef.current.getDuration()
    : '00:00';

  const elapsedTime = format(currentTime);
  const totalDuration = format(duration);

  const [videoUrl, setVideoUrl] = useState(url?.toString());

  const [reloadCount, setReloadCount] = useState(0);
  const [isStuck, setIsStuck] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isStuck && reloadCount < 3) {
      setReloadCount((prev) => prev + 1);
      setVideoUrl(''); // Limpiar URL
      timer = setTimeout(() => setVideoUrl(url?.toString()), 500); // Reiniciar video
    }

    return () => clearTimeout(timer);
  }, [isStuck]);

  

  // Detectar si el dispositivo es móvil
  const isMobile = () => window.innerWidth <= 768;

  const handleReady = () => {
    setIsStuck(false);
    setReloadCount(0);
  };

  const handleError = () => {
    console.error('Error al cargar el video');
    setIsStuck(true);
  };


  return (
    <div className='h-full w-full'>
      <Container className='!h-full !px-0'>
        <div
          ref={playerContainerRef}
          onMouseMove={handleMouseMove}
          className={`w-full min-h-[30rem] lg:min-h-[60vh] !pl-0 !pr-0 relative  ${isToShow ? '' : 'lg:border border-3 border-solid border-black'}`}
        >
          <ReactPlayer
            ref={playerRef}
            onReady={handleReady} // Detecta si el reproductor está listo
            onError={handleError} // Maneja errores
            url={videoUrl}
            width='100%'
            height='100%'
            style={{ position: 'absolute', top: '0', left: '0 ' }}
            playing={playing}
            muted={muted}
            volume={volume}
            playbackRate={playbackRate}
            onProgress={handleProgress}
            config={{
              file: {
                attributes: {
                  crossorigin: 'anonymous'
                }
              }
            }}
          />
          <PlayerControls
            onPlayPause={handlePlayPause}
            playing={state.playing}
            onRewind={handleRewind}
            onFastForward={handleFastForward}
            muted={muted}
            onMute={handleMute}
            onVolumeChange={handleVolumeChange}
            onVolumeSeekUp={handleVolumeSeek}
            volume={volume}
            playbackRate={playbackRate}
            onPlaybackRateChange={handlePlaybackRateChange}
            onToggleFullScreen={toggleFullScreen}
            fullScreen={fullScreen}
            played={played}
            onSeek={handleSeekChange}
            onSeekMouseDown={handleSeekMouseDown}
            onSeekMouseUp={handleSeekMouseUp}
            elapsedTime={elapsedTime}
            totalDuration={totalDuration}
            onBookmark={addBookmark}
            setPlayerRef={setControlRef}
            title={title != null ? title : ''}
            isToShow={isToShow}
          />
        </div>
      </Container>
    </div>
  );
}

export default Youtube;
