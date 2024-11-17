import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import VimeoPlayer from '../ClassPage/VimeoPlayer'
import VimeoPlayerPlan from './VimeoPlayerPlan';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

const SelectYourPlanIntro = () => {
    const [hasWindow, setHasWindow] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
          setHasWindow(true);
            }
    
        
      }, []);

  return (
    <div className= "inline-block min-h-[50vh] md:h-screen text-left rounded-lg overflow-hidden align-bottom transition-all transform shadow-2xl py-4 sm:pt-8 sm:align-middle w-full bg-[#141414] sm:pb-8">
            <div className='w-full h-full flex flex-col space-y-12 md:space-x-18 justify-center items-center'> 
            {hasWindow && (
                <>
                <div className='w-full h-full lg:w-2/3'>
                    {/* <VideoPlayer
                    url={clase.link}
                    clase={clase}
                    img={clase.image_url}
                    courseUser={courseUser}
                    setPlayerRef={(val: any) => setPlayerRef(val)}
                    play={play}
                    /> */}
                    <VimeoPlayerPlan
                    videoId={"1030196447"}
                  />
                </div>
                </>
            )}

          <div className='w-full md:pt-6 flex justify-center flex-col items-center hover:scale-105 transition-all duration-500 cursor-pointer pt-8'>
                <ChevronDownIcon className='w-12 h-12'/>
              </div>
            </div>

    </div>
  )
}

export default SelectYourPlanIntro