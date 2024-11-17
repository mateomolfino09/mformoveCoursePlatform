import React, { Fragment, useEffect, useRef, useState } from 'react'
import { useAppDispatch } from '../../../hooks/useTypeSelector';
import { useRouter } from 'next/navigation';
import { changeInput, setClassType, toggleNav, toggleSearch, toggleSearchGo } from '../../../redux/features/filterClass';
import { useAppSelector } from '../../../redux/hooks';
import { motion as m, useAnimation } from 'framer-motion';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { RxCross2 } from 'react-icons/rx';
import { VscTools } from 'react-icons/vsc';
import { ClassTypes, IndividualClass, ValuesFilters } from '../../../../typings';
import endpoints from '../../../services/api';
import { toast } from 'react-toastify';
import SearchClass from './../../SearchClass';
import { Transition } from '@headlessui/react';

interface Props {
  filtersDB: ClassTypes[];
  classType: string
}

const ClassesFiltersCategory = ({ filtersDB, classType }: Props) => {
    const dispatch = useAppDispatch();
  const router = useRouter();
  const filters = useAppSelector(
    (state) => state.filterClass.value
    );
const animationInput = useAnimation();
const animationIcon = useAnimation();
const inputRef = useRef<any>(null);
const [searchClasses, setSearchClasses] = useState<null | IndividualClass[]>(null)

  const handleChange = ( value: string ) => {
    dispatch(setClassType(value));
  };

  useEffect(() => {
    if (filters.search) {
        animationInput.start({
            width: window.innerWidth < 768 ? window.innerWidth < 500 ? '60%' : '70%' : '16rem',
            transition: {
              delay: 0.05,
              ease: 'linear',
              duration: 0.25,
              stiffness: 0
            }
          });
      animationIcon.start({
        x: -40,
        transition: {
          delay: 0.05,
          ease: 'linear',
          duration: 0.25,
          stiffness: 0
        }
      });
      if (inputRef && inputRef.current) inputRef.current.focus();

    } else {
        animationInput.start({
            width: '3rem',
            transition: {
              delay: 0.05,
              ease: 'linear',
              duration: 0.25,
              stiffness: 0
            }
          });
      animationIcon.start({
        x: 0,
        transition: {
          ease: 'linear',
          duration: 0,
          stiffness: 0
        }
      });
    }
  }, [filters.search]);

  const handleSearchActivation = () => {
    console.log(filters.search)
    dispatch(toggleSearch(!filters.search))
  };



  const handleCross = () => {
    dispatch(toggleSearchGo(false))
    dispatch(toggleSearch(false))
    dispatch(changeInput(''))
    setSearchClasses(null)
  };

  const handleBlur = () => {
    if (filters.searchToggle == false) {
        dispatch(toggleSearch(false))
        dispatch(changeInput(''))
        setSearchClasses(null)

    }
  };

  const handleSearch = async (e: any) => {
    dispatch(changeInput(e.target.value))
    dispatch(toggleSearchGo(true))

    const text = e.target.value

    if(text.length > 2) {
      try {
        const data = await fetch(endpoints.individualClass.search(text), {
          method: 'GET',
        }).then((r) => r.json());
  
        setSearchClasses([...data.individualClass])
      } catch (error) {
        console.log(error)
        toast.error(
          'Hubo un error, vuelva a intentarlo más tarde'
        )
      }

    }

    // router.query.search = e.target.value
    // router.push(router)
  };


  return (
    <div className='flex w-full justify-between lg:items-start flex-col lg:flex-row'>
        <div className='flex justify-start md:justify-start space-x-3 md:space-x-8 lg:space-x-6 md:ml-10 lg:ml-12 ml-2 overflow-scroll scrollbar-hide'>
            {filtersDB[0]?.values.map((f: ValuesFilters) => (
              <>

                  <span key={f.id} onClick={() => router.push(`/classes-category/${f.value.toLowerCase()}`)} className={`${classType === f.value ? "bg-white rounded-full text-black " : ""} cursor-pointer p-3 md:mr-0 mr-1 font-thin text-sm md:text-base h-7 text-center flex justify-center items-center hover:bg-white hover:rounded-full hover:text-black`}>
                  <p className=''>{f.label}</p>
                  </span>
              </>
            ))}
        </div>
        <div className='flex flex-col justify-end items-baseline overflow-visible'>
          <div className='flex lg:mr-24 w-full md:mr-12 md:ml-10 ml-2 mt-4 lg:mt-0' > 
          <m.div
            initial={{ width: '3rem' }}
            animate={animationInput}
            className={`rounded-full h-8  items-center flex justify-end relative ${
              filters.search ? 'border-white border bg-black/80' : 'w-12'
            } overflow-hidden`}
          >
            <input
              ref={inputRef}
              value={filters.searchInput}
              onChange={(e) => handleSearch(e)}
              onBlur={handleBlur}
              type='text'
              className={`w-full ml-8 appearance-none focus:bg-black/80 ${
                filters.search ? 'input block bg-black/80 px-1' : 'hidden'
              }`}
            />
            <m.div
              initial={{ x: 0 }}
              animate={animationIcon}
              className={` h-6 w-6 sm:inline cursor-pointer -right-1 absolute ${
                filters.search ? '' : ''
              }`}
            >
              <MagnifyingGlassIcon
                className={` h-6 w-6 sm:inline cursor-pointer absolute right-1 ${
                  filters.search ? '' : ''
                }`}
                onClick={handleSearchActivation}
              />
            </m.div>
            {filters.searchToggle && (
              <div onClick={handleCross} className='h-6 w-6'>
                <RxCross2
                  className={`h-6 w-6  cursor-pointer absolute right-1 ${
                    filters.search ? 'sm:inline' : 'hidden'
                  }`}
                />
              </div>
            )}
          </m.div>
              <div onClick={() => dispatch(toggleNav(true))} className='bg-[#a38951] group ml-8 hover:bg-light-cream flex justify-center space-x-2 items-center py-1 px-5 rounded-full cursor-pointer'>
                  <p className='text-white group-hover:text-black'>Filter</p>
                  <VscTools className='text-white group-hover:text-black'/>

              </div>
          </div>
              <SearchClass active={filters.searchToggle && searchClasses?.length != null && searchClasses?.length > 0} searchClasses={searchClasses}/>
        </div>
        {/* {filters.searchToggle && searchClasses?.length != null && searchClasses?.length > 0 && (
            <SearchClass/>
          )} */}
    </div>
  )
}

export default ClassesFiltersCategory