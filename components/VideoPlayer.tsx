import React, { useState, useRef, HtmlHTMLAttributes } from 'react'
import ReactPlayer from 'react-player';
import { Container } from '@mui/material';
import PlayerControls from './PlayerControls';
import screenfull from 'screenfull'

interface Props {
  url: string | null
}

function Youtube({ url }: Props) {
  const [state, setState] = useState({
    playing: true,
    muted: true,
    volume: 0.5,
    playbackRate: 1.0,
    fullScreen: false,
    played: 0,
    seeking: false
  })

  const { playing, muted, volume, playbackRate, fullScreen, played, seeking } = state

  const playerRef= useRef<ReactPlayer>(null)
  const playerContainerRef= useRef<any>(null)

  const handlePlayPause = () => {
    setState({...state, playing: !state.playing})
  }
const handleRewind = () => {
  playerRef.current && playerRef.current.seekTo(playerRef.current.getCurrentTime() - 10)
}
const handleFastForward = () => {
  playerRef.current && playerRef.current.seekTo(playerRef.current.getCurrentTime() + 10)
}

const handleMute = () => {
  setState({...state, muted: !state.muted})

}

const handlePlaybackRateChange = (rate: any) => {
  setState({...state, playbackRate: rate})

}



const handleVolumeChange = (e: any, newValue: any) => {
  setState({
    ...state, 
    volume:parseFloat((newValue / 100).toString()),
    muted: newValue === 0 ? true : false})

}

const handleVolumeSeek = (e: any, newValue: any) => {
  setState({
    ...state, 
    volume:parseFloat((newValue / 100).toString()),
    muted: newValue === 0 ? true : false})

}

const toggleFullScreen = () => {
  setState({
    ...state, 
    fullScreen: !fullScreen})
  playerContainerRef.current && screenfull.toggle(playerContainerRef.current)
}

const handleSeekChange = (e: any, newValue: any) => {
  setState({ ...state, played: parseFloat((newValue / 100).toString())})
}

const handleSeekMouseDown = (e: any) => {
  setState({ ...state, seeking: true})
}

const handleSeekMouseUp = (e: any, newValue: any) => {
  setState({ ...state, seeking: false})
  playerRef.current ? playerRef.current.seekTo(newValue/100) : null;
}

const handleProgress = (changeState: any) => {
  if(!state.seeking) setState({...state, ...changeState})

}

  return (
    <div className='h-full w-full'>
        <Container maxWidth='md'>
          <div ref={playerContainerRef} className='w-full min-h-[40rem] relative'>
            <ReactPlayer 
            ref={playerRef}
              url={url?.toString()}
              width='100%'
              height='100%'
              style={{ position: 'absolute', top: '0', left: '0 '}}
              playing={playing}
              muted={muted}
              volume={volume}
              playbackRate={playbackRate}
              onProgress={handleProgress}
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
              />
          </div>
        </Container>

    
    </div>
  )
}

export default Youtube

