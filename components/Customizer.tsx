import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion as m } from 'framer-motion';
import { useSnapshot } from 'valtio';

import state from '../valtio';
import { download } from '../assets';
import { downloadCanvasToImage, reader } from '../config/helper';
import { EditorTabs, FilterTabs, DecalTypes } from '../constants/customizer';
import { fadeAnimation, slideAnimation, slideAnimationTabs } from '../config/motion';
import CustomButton from './CustomButton'

const Customizer = () => {
    const snap = useSnapshot(state)
  return (
    <AnimatePresence>
        {!snap.intro && (
            <>
                <m.div 
                    key={'custom'}
                    className="absolute top-0 left-0 z-10"
                    {...slideAnimation('left')}
                    >
                    <div className='flex items-center min-h-screen'>
                        <div className='editortabs-container tabs'>
                        </div>
                    </div>
                </m.div>
                <m.div
                className='absolute z-10 top-5 right-5' {...fadeAnimation}>
                    <CustomButton title='Volver' handleClick={() => state.intro = true}
                    customStyles="h-10 w-20 mt-0 font-bold text-sm"/>
                </m.div>

                <m.div
                className='filtertabs-container' {...slideAnimationTabs('up')}>
                </m.div>
            </>
        )}
    </AnimatePresence>
  )
}

export default Customizer