import {
    CreditCardIcon,
    HomeIcon,
    PlusCircleIcon,
    TableCellsIcon,
    UserIcon
  } from '@heroicons/react/24/solid';
  import { AnimatePresence, motion as m, useAnimation } from 'framer-motion';
  import Link from 'next/link';
  import { useRouter, usePathname } from 'next/navigation';
  import React, { Fragment, forwardRef, useEffect, useState } from 'react';
import { useSnapshot } from 'valtio';
import state from '../valtio';
import { Transition } from '@headlessui/react';
import { useAuth } from '../hooks/useAuth';
import { IoCloseOutline } from "react-icons/io5";
import { useAppDispatch } from '../hooks/useTypeSelector';
import { clearData, clearDataFilters, deleteLargo, deleteLevel, deleteOrder, setLargo, setLevel, setOrder, setSeen, toggleNav } from '../redux/features/filterClass';
import { useAppSelector } from '../redux/hooks';
import { IoIosArrowDown } from "react-icons/io";
import { ClassTypes, ValuesFilters } from '../../typings';
interface Props {
    showNav: boolean
}

const FilterNav = ({ showNav }: Props) => {  
      const router = useRouter();
      const pathname = usePathname();
      const animation = useAnimation();
      const [expand, setExpand] = useState(0);

      const [windowWidth, setWindowWidth] = useState(window.innerWidth);
      const animationPhones = useAnimation();
      const animationArrow = useAnimation();
      const auth = useAuth()
      const dispatch = useAppDispatch()
      const filterClassSlice = useAppSelector(
        (state) => state.filterClass.value
        );
      const { filters } = filterClassSlice;
        const path = usePathname()
        const snap = useSnapshot(state);

      useEffect(() => {
          animation.start({
            x: 0,
            transition: {
              damping: 30,
              stiffness: 300,
              restDelta: 0.001,
              duration: 0.5,
              ease: [0.4, 0, 0.2, 1],
            }
          });
          animationPhones.start({
            x: 0,
            transition: {
              damping: 30,
              stiffness: 300,
              restDelta: 0.001,
              duration: 0.5,
              ease: [0.4, 0, 0.2, 1],
            }
          });
      }, []);

      const handleFilterChange = (f: ClassTypes, v: ValuesFilters) => {
        if(f.name.toLowerCase() === "largo") {
          const lengthSelector = filterClassSlice.largo;

          if(!lengthSelector || !lengthSelector.includes(v.value.toString())) {
            dispatch(setLargo(v.value.toString()))
          }
          else {
            const indexToDelete = lengthSelector.findIndex((val) => val === v.value)
            dispatch(deleteLargo(indexToDelete))
          }

        } else if(f.name.toLowerCase() === "nivel") {
          const levelSelector = filterClassSlice.nivel;

          if(!levelSelector || !levelSelector.includes(v.value.toString())) {
            dispatch(setLevel(v.value.toString()))
          }
          else {
            const indexToDelete = levelSelector.findIndex((val) => val === v.value)
            dispatch(deleteLevel(indexToDelete))
          }
        }
        else if(f.name.toLowerCase() === "ordenar") {
          const orderSelector = filterClassSlice.ordenar;

          if(!orderSelector || !orderSelector.includes(v.value.toString())) {
            dispatch(setOrder(v.value.toString()))
          }
          else {
            const indexToDelete = orderSelector.findIndex((val) => val === v.value)
            dispatch(deleteOrder(indexToDelete))
          }
        }
  
      }

      const handleCheckboxChange = (f: ClassTypes, e: any) => {
        dispatch(setSeen(e.target.checked))
      }
      

    //   flex flex-col space-y-2 py-16 md:space-y-4 h-[75vh] lg:h-[90vh] justify-end lg:items-end mr-12 lg:mr-24

      return (
        <div className='fixed flex justify-end w-full h-full bg-palette-ink/40 backdrop-blur-sm z-[300]'>

            <m.div initial={{ x: 700 }}
                animate={+windowWidth  < 768 ? animationPhones : animation} className='md:w-[32rem] lg:w-[36rem] w-full h-screen relative bg-palette-cream shadow-2xl'>
                <div className='absolute right-4 top-4 md:right-6 md:top-6' onClick={() => dispatch(toggleNav(false))}>
                <IoCloseOutline className='text-palette-ink w-8 h-8 md:w-9 md:h-9 cursor-pointer hover:text-palette-stone transition-colors'/>
                </div>
                <div className='mt-20 md:mt-24 flex items-start flex-col w-full px-6 md:px-8 pb-6 overflow-y-auto h-full'>
                  {filters?.filter(x => x.type === 'multiple').map((f, i) => (
                    <React.Fragment key={i}>
                    <div className={`${i === 0 && 'hidden'} w-full flex flex-col justify-center items-start`} >
                      <hr className={`${i == 1 ? 'border-t border-palette-stone/20 w-full my-4' : 'hidden'}`}/>
                      <div className='w-full flex justify-between items-center cursor-pointer group' onClick={() => {
                          expand === i 
                          ? setExpand(0)
                          : setExpand(i) 
                        }}>
                        <p className='text-palette-ink font-light text-xs tracking-[0.15em] uppercase'>{f.name}</p>
                        <div className='flex flex-wrap gap-2 items-center'>
                          {filterClassSlice[Object.keys(filterClassSlice)[Object.keys(filterClassSlice).findIndex(x => x === f.name.toLowerCase())]]?.length > 0 && (
                            <>
                              <div className="border border-palette-sage/40 bg-palette-sage/10 px-2.5 py-1 rounded-full">
                                <p className='text-palette-ink text-xs font-light'>{f.values.filter(x => x.value === filterClassSlice[Object.keys(filterClassSlice)[Object.keys(filterClassSlice).findIndex(x => x === f.name.toLowerCase())]][0]
                              )[0].label}</p> 
                              </div>         
                            </>
                          )}
                          {filterClassSlice[Object.keys(filterClassSlice)[Object.keys(filterClassSlice).findIndex(x => x === f.name.toLowerCase())]]?.length > 1 && (
                            <>
                              <div className='border border-palette-sage/40 bg-palette-sage/10 px-2.5 py-1 rounded-full'>
                               <p className='text-palette-ink text-xs font-light'>+{filterClassSlice[Object.keys(filterClassSlice)[Object.keys(filterClassSlice).findIndex(x => x === f.name.toLowerCase())]].length - 1}</p>
                              </div>         
                            </>
                          )}
                          <m.div
                            animate={{
                              rotate: expand === i ? 180 : 0,
                            }}
                            transition={{
                              duration: 0.3,
                              ease: [0.4, 0, 0.2, 1],
                            }}
                            className='cursor-pointer ml-auto w-7 h-7 border border-palette-stone/30 rounded-full flex justify-center items-center transition-colors hover:border-palette-sage/50 hover:bg-palette-sage/5'
                          >
                          <IoIosArrowDown className='w-4 h-4 text-palette-stone'/>
                          </m.div>
                  
                        </div>
                      </div>
                      <m.div 
                        initial={false}
                        animate={{
                          maxHeight: expand === i ? 500 : 0,
                          opacity: expand === i ? 1 : 0,
                        }}
                        transition={{
                          duration: 0.4,
                          ease: [0.4, 0, 0.2, 1],
                        }}
                        className={`w-full overflow-hidden`}
                      >
                      <div className="w-full flex flex-wrap justify-start items-center gap-2 py-3">
  {filters[i].values.map((val) => {
    const isSelected = filterClassSlice[
      Object.keys(filterClassSlice)[
        Object.keys(filterClassSlice).findIndex((x) => x === f.name.toLowerCase())
      ]
    ]?.includes(val.value);
    return (
    <m.button
      key={val.id}
      onClick={() => handleFilterChange(filters[i], val)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`rounded-full px-3 py-1.5 border transition-all duration-200 text-xs font-light ${
        isSelected
          ? 'border-palette-sage bg-palette-sage text-palette-ink'
          : 'border-palette-stone/30 bg-transparent text-palette-stone hover:border-palette-sage/50 hover:text-palette-ink'
      }`}
    >
      {val.label}
    </m.button>
  )})}
</div>
                      </m.div>  
                      <hr className='border-t border-palette-stone/20 w-full my-4'/>
                    </div>
                    </React.Fragment>
                  ))}
                  {filters?.filter(x => x.type === 'two').map((f, i) => (
                    <React.Fragment key={i}>
                    <div className={`w-full flex flex-col justify-center items-start`}>
                      <hr className={`${i == 1 ? 'border-t border-palette-stone/20 w-full my-4' : 'hidden'}`}/>
                      <div className='w-full flex justify-between items-center'>
                        <p className='text-palette-ink font-light text-xs tracking-[0.15em] uppercase'>{f.name}</p>
                          <label htmlFor={`filter-check-${i}`} className='border border-palette-stone/40 relative w-14 h-7 rounded-full cursor-pointer bg-palette-stone/10'>
                            <input type="checkbox" id={`filter-check-${i}`} className='sr-only peer' onChange={(e) => handleCheckboxChange(f, e)} checked={!!filterClassSlice.seen}/>
                            <span className='w-5 h-5 bg-palette-stone/40 absolute rounded-full left-1 top-1 peer-checked:bg-palette-sage peer-checked:left-[1.75rem] transition-all duration-300 shadow-sm' />
                          </label>
                      </div>
                      <hr className='border-t border-palette-stone/20 w-full my-4'/>
                    </div>
                    </React.Fragment>
                  ))}
                </div>
                <div className='absolute bottom-0 left-0 right-0 flex flex-col items-center gap-3 px-6 md:px-8 py-6 bg-palette-cream border-t border-palette-stone/20'>
                    <button 
                      className='bg-palette-sage text-palette-ink w-full max-w-xs h-11 hover:bg-palette-sage/90 flex justify-center items-center rounded-full cursor-pointer transition-all duration-200 font-light text-sm tracking-wide shadow-sm hover:shadow-md'
                      onClick={() => dispatch(toggleNav(false))}
                    >
                      Ver clases
                    </button>

                    <button className='text-palette-stone hover:text-palette-ink relative font-light text-xs transition-colors duration-200' onClick={() => dispatch(clearDataFilters()) }>
                      <span className='relative after:content-[""] after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-[1px] after:bg-palette-stone/40 hover:after:bg-palette-ink after:transition-colors'>Borrar filtros</span>
                    </button>
                </div>


            </m.div>
        </div>
      );
    }
  
  export default FilterNav;
  