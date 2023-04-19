import { Fragment, useContext, useEffect, useState } from "react";
import {
  Bars3CenterLeftIcon,
  PencilIcon,
  ChevronDownIcon,
  CreditCardIcon,
  Cog8ToothIcon,
} from "@heroicons/react/24/solid";
import { BellIcon, CheckIcon } from "@heroicons/react/24/outline";
import { Menu, Transition, Popover } from "@headlessui/react";
import Link from "next/link";
import { User } from "../typings";
import { UserContext } from "../hooks/userContext";
import { useRouter } from "next/router";
import { motion as m, AnimatePresence, useAnimation} from 'framer-motion'
import { headContentAnimation, slideAnimationTabs } from "../config/motion";
import state from "../valtio";
import { useSnapshot } from "valtio";


interface Props {
  user: User | null
}
const IndexHeader = ({ user }: Props) => {
const router = useRouter()
const headerAnimation = useAnimation()


const [domLoaded, setDomLoaded] = useState(false);
const snap = useSnapshot(state)

useEffect(() => {
  setDomLoaded(true);
  if(!snap.volumeModal) {
    headerAnimation.start({
      y: 0,
      transition: {
          type: "just",
          damping: 5,
          stiffness: 40,
          restDelta: 0.001,
          duration: 1,
        }
  })}
   [snap.volumeModal]});

return (
    <>
        {domLoaded && (
        <m.div 
        initial= {{
          y: -100,
          opacity: 1,
        }} animate={headerAnimation} className={`bg-transparent fixed w-full h-16 flex justify-between items-center transition-all duration-[400ms] z-50`}>
        <div className="pl-4 md:pl-16">
        <img
              alt='icon image'
              src="/images/logoWhite.png"
              width={120}
              height={120}
              className="cursor-pointer object-contain transition duration-500 hover:scale-105 lg:opacity-50 hover:opacity-100"
            />
        </div>
        <div className="flex items-center pr-4 md:pr-16">
          <Menu as="div" className="relative inline-block text-left">
            <div>
              <Menu.Button className="inline-flex w-full justify-center items-center">
                {user?.name ? (
                    <div className="w-24 bg-black/10 border border-white rounded-md transition duration-500 hover:bg-black hover:scale-105">
                        <button className="p-1 cursor-pointer" onClick={() => router.push('/src/home')}>
                            Entrar
                        </button>
                    </div>
    
                ) : (
                    <div className="w-24 bg-black/10 border border-white rounded-md transition duration-500 hover:bg-black hover:scale-105">
                        <button className="p-1" onClick={() => router.push('/src/user/login')}> 
                            Login
                        </button>
                    </div>
    
                )}
    
              </Menu.Button>
            </div>
          </Menu>
        </div>
      </m.div>
    )}
    </>


)
}

export default IndexHeader