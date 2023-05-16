import { useAppDispatch } from '../hooks/useTypeSelector';
import imageLoader from '../imageLoader';
import { loadCourse } from '../redux/courseModal/courseModalAction';
import { CoursesDB, Item, Ricks, User } from '../typings';
import {
  Button,
  Container,
  Grid,
  IconButton,
  Popover,
  Slider,
  SliderValueLabelProps,
  Tooltip,
  Typography,
  styled
} from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { Dispatch, SetStateAction } from 'react';
import { TbLockOpenOff } from 'react-icons/tb';

function ValueLabelComponent(props: SliderValueLabelProps) {
  const { children, value } = props;

  return (
    <Tooltip enterTouchDelay={0} placement='top' title={value}>
      {children}
    </Tooltip>
  );
}

const PrettoSlider = styled(Slider)({
  color: '#e50914',
  height: 2,
  '& .MuiSlider-track': {
    border: 'none'
  },
  '& .MuiSlider-thumb': {
    height: 0,
    width: 0,
    backgroundColor: '#e52019',
    border: '0px solid currentColor',
    '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
      boxShadow: 'inherit'
    },
    '&:before': {
      display: 'none'
    }
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
      transform: 'translate(50%, -100%) rotate(-45deg) scale(1)'
    },
    '& > *': {
      transform: 'rotate(-45deg)'
    }
  }
});

interface Props {
  items: Item[] | null;
  course: CoursesDB | null;
  isClass: boolean;
  user: User | null;
  actualClassIndex: number;
  courseIndex: number;
}
function CourseThumbnail({
  items,
  course,
  actualClassIndex,
  isClass,
  user,
  courseIndex
}: Props) {
  const classes = user?.courses[courseIndex].classes;
  const email = user?.email;
  const router = useRouter();

  return (
    <>
      {items?.map((item: Item, index: number) => (
        <div
          className='w-full h-full flex items-center justify-center flex-col'
          key={item.id}
        >
          <div
            className={`w-[90%] max-h-40 rounded-sm md:rounded px-12 flex justify-center items-center space-x-12 py-8 ${
              items.indexOf(item) == actualClassIndex && 'bg-[#333333]'
            }`}
            key={item.id}
          >
            <h3 className='text-[#d2d2d2] flex text-2xl justify-center'>
              {(items?.indexOf(item) + 1).toString()}
            </h3>

            <div className='flex items-center justify-center h-28 min-w-[180px] relative cursor-pointer transition duration-200 ease-out md:h-28 md:min-w-[200px] md:hover:scale-105'>
              {user?.courses[courseIndex].purchased ? (
                <>
                  <Link
                    href={{
                      pathname: `/src/courses/${course?.id}/${index + 1}`
                    }}
                  >
                    <Image
                      src={item.snippet.thumbnails.standard?.url}
                      fill={true}
                      className='rounded-sm object-cover md:rounded '
                      alt={item.snippet.title}
                      loader={imageLoader}
                    />
                  </Link>
                </>
              ) : (
                <>
                  <Image
                    src={item.snippet.thumbnails.standard?.url}
                    fill={true}
                    className='rounded-sm object-cover md:rounded opacity-50'
                    alt={item.snippet.title}
                    loader={imageLoader}
                  />
                  <div className='absolute w-full h-full bg-black/30'>
                    <div className='w-full h-full flex items-center justify-center'>
                      <TbLockOpenOff className='text-white group-hover/item:text-neutral-300 w-8 h-8 lg:w-12 lg:h-12 opacity-70' />
                    </div>
                  </div>
                </>
              )}

              <div
                className={`absolute top-[64px] left-0 right-0 bottom-0 flex-col space-y-48 justify-between z-[1]`}
              />
              
              <Grid
                container
                direction='row'
                justifyContent='space-between'
                alignItems='center'
                className={'w-full relative top-14 md:top-[3.7rem] md:!mt-0'}
              >
                <Grid item xs={12}>
                  <PrettoSlider
                    min={0}
                    max={1}
                    value={
                      classes && course
                        ? classes[index].actualTime == 0
                          ? 0
                          : parseFloat(
                              (
                                classes[index].actualTime /
                                course?.classes[index].totalTime
                              ).toString()
                            )
                        : 0
                    }
                  />
                </Grid>
              </Grid>
            </div>
            {!isClass && (
              <div className='flex flex-col space-y-2 max-h-40 overflow-scroll scrollbar-hide py-2'>
                <h4 className='text-base'>{item.snippet.title}</h4>
                <p className='text-xs text-[#d2d2d2]'>
                  {item.snippet.description}
                </p>
              </div>
            )}
          </div>
        </div>
      ))}
    </>
  );
}

export default CourseThumbnail;
