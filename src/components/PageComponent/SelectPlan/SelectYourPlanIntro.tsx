import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import VimeoPlayer from '../ClassPage/VimeoPlayer'
import VimeoPlayerPlan from './VimeoPlayerPlan';

const SelectYourPlanIntro = () => {
    const [hasWindow, setHasWindow] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
          setHasWindow(true);
            }
    
        
      }, []);

  return (
    <div className= "inline-block text-left bg-[#141414] rounded-lg overflow-hidden align-bottom transition-all transform shadow-2xl py-4 sm:py-8 sm:align-middle w-full">
            <div className='w-full h-full flex flex-row justify-center items-center'> 
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
            </div>

    </div>
  )
}

export default SelectYourPlanIntro