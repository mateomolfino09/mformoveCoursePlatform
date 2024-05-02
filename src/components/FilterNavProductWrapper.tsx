"use client"
import { useAuth } from '../hooks/useAuth'
import React, { Fragment, useEffect, useState } from 'react';
import { useAppDispatch } from '../hooks/useTypeSelector';
import { toggleNav } from '../redux/features/filterProduct';
import { useAppSelector } from '../redux/hooks';
import FilterProductNav from './FilterProductNav';

interface Props {
  children: any;
}

const FilterNavProductWrapper = ({ children }: Props) => {  
  const auth = useAuth()
  const [isMobile, setIsMobile] = useState(false);
  const dispatch = useAppDispatch();
  const filters = useAppSelector(
    (state) => state.filterProduct.value
    );
  function handleResize() {
    if (innerWidth <= 640) {
      dispatch(toggleNav(false));
      setIsMobile(true);
    } else {
      dispatch(toggleNav(true));
      setIsMobile(false);
    }
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      addEventListener('resize', handleResize);
    }

    return () => {
      removeEventListener('resize', handleResize);
    };
  }, []);
  return (
    <div className='absolute w-full h-full '>
        {filters.filterNav ? (
          <FilterProductNav showNav={filters.filterNav} />
        ) : (
          <>
          </>
        )}
          {children}
    </div>
  )
}

export default FilterNavProductWrapper;

