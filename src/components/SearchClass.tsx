import React, { useEffect } from 'react'
import { motion as m, useAnimation } from 'framer-motion'
import { IndividualClass } from '../../typings'
import SearchClassThumbnail from './SearchClassThumbnail'
import { useAppSelector } from '../redux/hooks'

interface Props {
    active: boolean
    searchClasses: IndividualClass[] | null
}

const SearchClass = ({ active, searchClasses }: Props) => {
    const animation = useAnimation()
    const filters = useAppSelector(
        (state) => state.filterClass.value
        );

    useEffect(() => {
        if(active) {
            animation.start({
                height: '100%',
                display: 'table',
                transition: {
                  delay: 0.05,
                  ease: 'linear',
                  duration: 0.25,
                  stiffness: 0
                }
              });
        }
        else {
            animation.start({
              height: '0%',
              display: 'none',
              transition: {
                delay: 0.05,
                ease: 'linear',
                duration: 0.25,
                stiffness: 0
              }
            });
        }
    }, [active])

    return (
        <m.div initial={{ height: '0%', display: 'none' }}
        animate={animation} className='lg:absolute lg:top-[2.5rem] lg:w-[24rem] w-full box-border pr-[1.5rem] px-2 flex md:w-[24rem] lg:mr-24 md:mr-12 md:ml-10 md:!px-2 pt-1 mt-4 lg:mt-0 h-full md:bg-[#232222f3] lg:hidden z-10'>
            <p className='text-xs mt-4 pb-2 pt-2 font-light'>{searchClasses ? searchClasses.length : 0} resultados</p>
            {searchClasses && searchClasses.length > 0 && searchClasses.slice(0,4)?.map(c => (
                <>
                <SearchClassThumbnail searchClass={c} active={active}/>
                
                </>

            ))}
            {searchClasses && searchClasses.length >= 5 && (
                <>
                 <a className='text-xs mt-6 pb-2 pt-2 font-light underline cursor-pointer' href={`/home/${filters.searchInput}`}>Ver todos</a>
                </>
            )}

        </m.div>
    )
}

export default SearchClass