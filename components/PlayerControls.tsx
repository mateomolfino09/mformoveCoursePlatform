import React, { ElementType, useState, forwardRef, useRef, useEffect } from 'react'
import { Button, Container, Grid, IconButton, Slider, styled, Tooltip, Typography, Popover } from '@mui/material';
import { Bookmark, FastRewind, PlayArrow, Pause, FastForward, VolumeUp, Fullscreen, VolumeOff } from '@mui/icons-material'
import { SliderValueLabelProps } from '@mui/material';



// ElementType<ValueLabelProps>
function ValueLabelComponent(props: SliderValueLabelProps) {
    const { children, value } = props;
  
    return (
      <Tooltip enterTouchDelay={0} placement="top" title={value}>
        {children}
      </Tooltip>
    );
  }

  const PrettoSlider = styled(Slider)({
    color: '#e50914',
    height: 3,
    '& .MuiSlider-track': {
      border: 'none',
    },
    '& .MuiSlider-thumb': {
      height: 10,
      width: 10,
      backgroundColor: '#e52019',
      border: '2px solid currentColor',
      '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
        boxShadow: 'inherit',
      },
      '&:before': {
        display: 'none',
      },
    },
    '& .MuiSlider-valueLabel': {
      lineHeight: 1.2,
      fontSize: 12,
      background: 'unset',
      padding: 0,
      width: 32,
      height: 32,
      borderRadius: '50% 50% 50% 0',
      backgroundColor: 'transparent',
      transformOrigin: 'bottom left',
      transform: 'translate(50%, -100%) rotate(-45deg) scale(0)',
      '&:before': { display: 'none' },
      '&.MuiSlider-valueLabelOpen': {
        transform: 'translate(50%, -100%) rotate(-45deg) scale(1)',
      },
      '& > *': {
        transform: 'rotate(-45deg)',
      },
    },
  });

  interface Props {
    onPlayPause: any
    playing: boolean
    onFastForward: any
    onRewind: any
    muted: boolean,
    onMute: any,
    onVolumeSeekUp: any
    onVolumeChange: any
    volume: number
    playbackRate: number
    onPlaybackRateChange: any
    onToggleFullScreen: any
    fullScreen: boolean
    played: number
    onSeek: any
    onSeekMouseDown: any
    onSeekMouseUp: any
    elapsedTime: any
    totalDuration: any
    onBookmark: any
    setPlayerRef: any
    title: string
  }
  

export default function PlayerControls ({ onPlayPause, playing, onFastForward, onRewind, muted, onMute, onVolumeChange, onVolumeSeekUp, volume, playbackRate, onPlaybackRateChange , onToggleFullScreen, fullScreen, played, onSeek, onSeekMouseDown, onSeekMouseUp, elapsedTime, totalDuration, onBookmark, setPlayerRef, title}: Props) {

    const ref = useRef<HTMLDivElement>(null);
    const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const handlePopover = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    if(ref != null && setPlayerRef != null) setPlayerRef(ref)
}, [ref])   


  const open = Boolean(anchorEl);
  const id = open ? 'playbackrate-popover' : undefined;

return (
    <div ref={ref} className={`absolute top-[60px] lg:top-[75px] left-0 right-0 bottom-0 flex-col space-y-48 justify-between z-[1] ${fullScreen ? 'bg-transparent' : 'bg-black/20'} `}>
    <div className={`${fullScreen ? '!hidden' : 'hidden'} h-20 !pb-0 lg:overflow-hidden flex flex-row items-center justify-between p-4`}> 
      <div className='w-[80%] h-16'>
        <h5 className='text-white !text-lg'>{title}</h5>
      </div>
      <div className='hidden lg:flex'>
      </div>
    </div>


    {/* <Grid container direction='row' alignItems='center' justifyContent='center' className={`${fullScreen ? '!mt-96' : '!mt-0 relative md:!mt-1 top-36 lg:top-32 '}`}>
      <IconButton onClick={onRewind} className='!text-[#e6e5e5] !text-5xl !transform !scale-90 hover:!text-[#fff] !hover:transform !hover:scale-100' aria-label='required'>
        <FastRewind fontSize='inherit'/>
      </IconButton>

      <IconButton onClick={onPlayPause} className='!text-[#e6e5e5] !text-5xl !transform !scale-90 hover:!text-[#fff] !hover:transform !hover:scale-100' aria-label='required'>
        {playing ? <Pause fontSize='inherit'/> : <PlayArrow fontSize='inherit'/> }
      </IconButton>

      <IconButton onClick={onFastForward} className='!text-[#e6e5e5] !text-5xl !transform !scale-90 hover:!text-[#fff] !hover:transform !hover:scale-100' aria-label='required'>
        <FastForward fontSize='inherit'/>
      </IconButton>
    </Grid>
    <Grid container direction='row' justifyContent='space-between' alignItems='center' style={{padding:16}} className={fullScreen ? !playing ? 'md:!mt-64' : 'md:!mt-[450px]' : 'relative md:top-72 md:!mt-0' }>
      <Grid item xs={12}>
        <PrettoSlider 
          min={0}
          max={100}
          value={played * 100}
          slots={{
            valueLabel: (props: any)=>(
              <ValueLabelComponent {...props} value={elapsedTime}/>
              )
          }}
          onChange={onSeek}
          onMouseDown={onSeekMouseDown}
          onChangeCommitted={onSeekMouseUp}/>
      </Grid>
    <Grid item style={{marginTop:0}} className='!w-full flex flex-row justify-between'>
      <Grid container alignItems='center' direction='row'>
        <IconButton onClick={onPlayPause} className='!text-[#e6e5e5] hover:!text-white'>
        {playing ? <Pause fontSize='large'/> : <PlayArrow fontSize='large'/> }
          
        </IconButton>

        <IconButton onClick={onMute} className='!text-[#e6e5e5] hover:!text-white'>
          {muted ? <VolumeOff fontSize='large'/> : <VolumeUp fontSize='large'/>}
        </IconButton>

        <Slider 
          min={0}
          max={100}
          size='small'
          defaultValue={volume / 100}
          color='primary'
          className='!w-[20%] !text-[white]'
          onChange={onVolumeChange}
          onChangeCommitted={onVolumeSeekUp}/>

          <Button variant='text' style={{color: '#fff', marginLeft: 16}}>
            <Typography>{elapsedTime}/{totalDuration}</Typography>
          </Button>
      </Grid>
      <Grid item className='w-full flex justify-end items-center'>
        <Button variant='text' className='!text-[#e6e5e5] hover:!text-white' onClick={handlePopover}>
          <Typography>{playbackRate}X</Typography>
        </Button>

        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'center'
          }}
        >
          <Grid container direction='column-reverse'>
            {[0.5,1,1.5,2].map((rate => (
            <Button key={rate} onClick={() => onPlaybackRateChange(rate)} variant='text'>
              <Typography color={rate === playbackRate ? 'secondary' : 'primary'}>{rate}</Typography>
            </Button>
            )))}
          </Grid>


        </Popover>

        <IconButton onClick={onToggleFullScreen} className='!text-[#e6e5e5] hover:!text-white'>
          <Fullscreen fontSize='large'/>
        </IconButton>
      </Grid>
    </Grid>

  </Grid> */}

</div>
)}