import React, { ElementType, useState } from 'react'
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
    height: 8,
    '& .MuiSlider-track': {
      border: 'none',
    },
    '& .MuiSlider-thumb': {
      height: 14,
      width: 14,
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
  }
  

export default ({ onPlayPause, playing, onFastForward, onRewind, muted, onMute, onVolumeChange, onVolumeSeekUp, volume, playbackRate, onPlaybackRateChange , onToggleFullScreen, fullScreen, played, onSeek, onSeekMouseDown, onSeekMouseUp}: Props) =>{
    const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const handlePopover = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'playbackrate-popover' : undefined;

return (
    <div className={`absolute top-[60px] lg:top-[75px] left-0 right-0 bottom-0 flex-col space-y-48 justify-between z-[1] ${fullScreen ? 'bg-transparent' : 'bg-black/20'} `}>
    <Grid container direction='row' alignItems='center' justifyContent='space-between' style={{padding:16}} className={`${fullScreen ? '!hidden' : 'hidden'}`}>
      <Grid item>
        <Typography variant='h5' style={{color: '#fff'}}>Video Title</Typography>
      </Grid>
      <Grid>
          <Button variant='contained' color='primary' startIcon={<Bookmark />} >
            BookMark 
          </Button>
      </Grid>
    </Grid>


    <Grid container direction='row' alignItems='center' justifyContent='center' className={fullScreen ? '!mt-96' : ''}>
      <IconButton onClick={onRewind} className='!text-[#777] !text-5xl !transform !scale-90 !hover:text-[#fff] !hover:transform !hover:scale-100' aria-label='required'>
        <FastRewind fontSize='inherit'/>
      </IconButton>

      <IconButton onClick={onPlayPause} className='!text-[#777] !text-5xl !transform !scale-90 hover:text-[#fff] !hover:transform !hover:scale-100' aria-label='required'>
        {playing ? <Pause fontSize='inherit'/> : <PlayArrow fontSize='inherit'/> }
      </IconButton>

      <IconButton onClick={onFastForward} className='!text-[#777] !text-5xl !transform !scale-90 hover:text-[#fff] !hover:transform !hover:scale-100' aria-label='required'>
        <FastForward fontSize='inherit'/>
      </IconButton>
    </Grid>
    <Grid container direction='row' justifyContent='space-between' alignItems='center' style={{padding:16}} className={fullScreen ? !playing ? '!mt-64' : '!mt-[350px]' :  '!mt-28'}>
      <Grid item xs={12}>
      {/* <Slider
        size="small"
        defaultValue={70}
        aria-label="Small"
        valueLabelDisplay="auto"
      /> */}
        <PrettoSlider 
          min={0}
          max={100}
          value={played * 100}
          valueLabelDisplay="auto"
          onChange={onSeek}
          onMouseDown={onSeekMouseDown}
          onChangeCommitted={onSeekMouseUp}/>
      </Grid>
    <Grid item style={{marginTop:0}} className='!w-full flex flex-row justify-between'>
      <Grid container alignItems='center' direction='row'>
        <IconButton onClick={onPlayPause} className='!text-[#999] hover:text-white'>
        {playing ? <Pause fontSize='large'/> : <PlayArrow fontSize='large'/> }
          
        </IconButton>

        <IconButton onClick={onMute} className='!text-[#999] hover:text-white'>
          {muted ? <VolumeOff fontSize='large'/> : <VolumeUp fontSize='large'/>}
        </IconButton>

        <Slider 
          min={0}
          max={100}
          defaultValue={volume / 100}
          className='!w-[20%]'
          onChange={onVolumeChange}
          onChangeCommitted={onVolumeSeekUp}/>

          <Button variant='text' style={{color: '#fff', marginLeft: 16}}>
            <Typography>05:05</Typography>
          </Button>
      </Grid>
      <Grid item className='w-full flex justify-end items-center'>
        <Button variant='text' className='!text-[#999] hover:text-white' onClick={handlePopover}>
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
            <Button onClick={() => onPlaybackRateChange(rate)} variant='text'>
              <Typography color={rate === playbackRate ? 'secondary' : 'primary'}>{rate}</Typography>
            </Button>
            )))}
          </Grid>


        </Popover>

        <IconButton onClick={onToggleFullScreen} className='!text-[#999] hover:text-white'>
          <Fullscreen fontSize='large'/>
        </IconButton>
      </Grid>
    </Grid>

  </Grid>

</div>
)}