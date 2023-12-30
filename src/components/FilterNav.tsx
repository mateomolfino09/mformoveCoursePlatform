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

      const snap = useSnapshot(state);

      useEffect(() => {
          animation.start({
            x: 0,
            transition: {
              damping: 5,
              stiffness: 40,
              restDelta: 0.001,
              duration: 0.2,
            }
          });
          animationPhones.start({
            x: 0,
            transition: {
              damping: 5,
              stiffness: 40,
              restDelta: 0.001,
              duration: 0.2,
            }
          });
      }, []);

      const handleFilterChange = (f: ClassTypes, v: ValuesFilters) => {
        console.log(f)
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
        <div className='fixed flex justify-end  w-full h-full bg-black md:bg-black/80 z-[300]'>

            <m.div initial={{ x: 700 }}
                animate={+windowWidth  < 768 ? animationPhones : animation} className='md:w-[30rem] lg:w-[35rem] w-full h-screen relative  md:bg-white'>
                <div className='absolute right-0 top-2' onClick={() => dispatch(toggleNav(false))}>
                <IoCloseOutline className='text-white md:text-black w-10 h-10'/>
                </div>
                <div className='mt-28 flex items-center justify-start flex-col w-full'>
                  {auth.user && filters?.filter(x => x.type === 'multiple').map((f, i) => (
                    <>
                    <div key={i} className={`${i === 0 && 'hidden'} w-full px-6 flex flex-col justify-center items-start`} >
                      <hr className={`${i == 1 ? 'border-[0.5px] border-solid border-white/75 md:border-black/75 w-full my-3' : 'hidden'}`}/>
                      <div className='w-full flex justify-between items-center' onClick={() => {
                          expand === i 
                          ? setExpand(0)
                          : setExpand(i) 
                        }}>
                        <p className='text-white md:text-black'>{f.name.toUpperCase()}</p>
                        <div className='flex space-x-4 items-center'>
                          {filterClassSlice[Object.keys(filterClassSlice)[Object.keys(filterClassSlice).findIndex(x => x === f.name.toLowerCase())]]?.length > 0 && (
                            <>
                              <div className='border border-white md:border-black px-1'>
                                <p className='text-white md:text-black text-sm md:text-base'>{f.values.filter(x => x.value === filterClassSlice[Object.keys(filterClassSlice)[Object.keys(filterClassSlice).findIndex(x => x === f.name.toLowerCase())]][0]
                              )[0].label}</p> 
                              </div>         
                            </>
                          )}
                          {filterClassSlice[Object.keys(filterClassSlice)[Object.keys(filterClassSlice).findIndex(x => x === f.name.toLowerCase())]]?.length > 1 && (
                            <>
                              <div className='border border-white md:border-black px-1'>
                               <p className='text-white md:text-black text-sm md:text-base'> + 1</p>
                              </div>         
                            </>
                          )}
                          <m.div
                            className={`${expand === i ? 'rotate-180' : 'rotate-0'} cursor-pointer ml-auto group/item w-8 h-8 border-white border-[0.5px] rounded-full flex justify-center items-center transition hover:border-neutral-300 mr-2`}>
                          <IoIosArrowDown className='w-5 h-5 md:text-black text-white cursor-pointer'/>
                          </m.div>
                  
                        </div>
                      </div>
                      <div className={`${expand === i ? 'max-h-[500px]' : 'max-h-0'} w-full px-2 transition-all duration-500 overflow-hidden`} >
                        <div className='w-full flex flex-wrap justify-start items-center space-x-3 py-2'>
                          {filters[i].values.map(val => (
                            <>
                              <div key={val.id} onClick={() => handleFilterChange(filters[i], val)} className={`rounded-full max-w-[100px] flex justify-center items-center min-h-[15px] px-2 py-1 border mt-2 transition-all duration-200 ${filterClassSlice[Object.keys(filterClassSlice)[Object.keys(filterClassSlice).findIndex(x => x === f.name.toLowerCase())]]?.includes(val.value) ? 'md:border-white md:bg-black bg-white border-black' : 'md:border-black border-white'}`} style={{ flex: '1 0 21%'}}>
                                <p className={`transition-all duration-200 ${filterClassSlice[Object.keys(filterClassSlice)[Object.keys(filterClassSlice).findIndex(x => x === f.name.toLowerCase())]]?.includes(val.value) ? 'md:text-white text-black' : 'md:text-black text-white'}`}>{val.label}</p>
                              </div>
                            </>
                          ))}

                        </div>
                      </div>  
                      <hr className='border-[0.5px] border-solid border-white/75 md:border-black/75 w-full my-3'/>
                    </div>
                    </>
                  ))}
                  {filters?.filter(x => x.type === 'two').map((f, i) => (
                    <>
                    <div key={i} className={`w-full px-6 flex flex-col justify-center items-start`}>
                      <hr className={`${i == 1 ? 'border-[0.5px] border-solid border-white/75 md:border-black/75 w-full my-3' : 'hidden'}`}/>
                      <div className='w-full flex justify-between items-center'>
                        <p className='text-white md:text-black'>{f.name.toUpperCase()}</p>
                          <label htmlFor="check" className='border-black border-[1.2px] relative w-16 h-8 rounded-full'>
                            <input type="checkbox" id='check' className='sr-only peer' onChange={(e) => handleCheckboxChange(f, e)}/>
                            <span className='w-2/5 h-4/5 bg-black/90 absolute rounded-full left-[1.5px] top-1 peer-checked:bg-orange-300 peer-checked:left-[2.15rem] transition-all duration-500'>

                            </span>
                          </label>
                      </div>
                      <hr className='border-[0.5px] border-solid border-white/75 md:border-black/75 w-full my-3'/>
                    </div>
                    </>
                  ))}
                </div>
                <div className='mt-28 flex items-center justify-start flex-col w-full h-full'>
                    <button className='bg-white md:bg-black w-52 h-12 rounded-full'>
                      <p className='text-black md:text-white font-light text-lg hover:scale-105 transition duration-200' onClick={() => dispatch(toggleNav(false))}>VER CLASES</p>
                    </button>

                    <button className=' w-22 h-12 rounded-full mt-2 '>
                      <p className='text-white md:text-black relative font-light text-sm hover:scale-105 transition duration-200 before:content-[""] before:md:bg-black before:h-[1px] before:absolute before:w-full before:bottom-[-3px] before:left-0 before:bg-white' onClick={() => dispatch(clearDataFilters()) }>Borrar</p>
                    </button>
                </div>


            </m.div>
        </div>
      );
    }
  
  export default FilterNav;
  