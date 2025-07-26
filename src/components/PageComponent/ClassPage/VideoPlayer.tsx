import { ClassesDB, IndividualClass, User } from '../../../../typings';
import PlayerControls from '../../PlayerControls';
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
import Vimeo from '@u-wave/react-vimeo';

interface Props {
  url: string | null;
  img: string;
  clase: IndividualClass | null;
  setPlayerRef: any;
  play: boolean;
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

function Youtube({ url, img, clase, setPlayerRef, play }: Props) {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setIsMobile(window.innerWidth <= 768);
  }, []);

  const [state, setState] = useState({
    playing: false,
    muted: false,
    volume: 0.75,
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
    setState((prevState) => ({
      ...prevState,
      playing: play, // Reproduce según el estado de `play`, sin importar si es móvil
      muted: isMobile // Siempre silenciado en móviles
    }));
  }, [play, isMobile]);


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
    if (screenfull.isEnabled && playerContainerRef.current) {
      try {
        screenfull.toggle(playerContainerRef.current, { navigationUI: 'hide' });
      } catch (error) {
        console.error('Fullscreen not supported on this device', error);
      }
    } else {
      console.warn('Screenfull is not enabled');
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

  return (
    <div className='h-full w-full'>
      <Container className='!h-full !px-0'>
        <div
          ref={playerContainerRef}
          onMouseMove={handleMouseMove}
          className={`w-full min-h-[30rem] lg:min-h-[60vh] !pl-0 !pr-0 relative lg:border border-3 border-solid border-black `}
        >
           <ReactPlayer
            ref={playerRef}
            url={clase?.link}
            width='100%'
            height='100%'
            playing={playing} // Solo reproduce si `play` está activo y no es móvil
            muted={muted} // Silencia automáticamente en móviles
            style={{ position: 'absolute', top: '0', left: '0 ' }}
            volume={volume}
            playbackRate={playbackRate}
            onProgress={handleProgress}
            config={{
              file: {
                attributes: {
                  crossorigin: 'anonymous',
                  playsInline: true // Habilita reproducción en línea en móviles
                }
              },
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
            title={clase?.name != null ? clase.name : ''}
            isToShow={false}
          /> 
        </div>
      </Container>
    </div>
  );
}

export default Youtube;
