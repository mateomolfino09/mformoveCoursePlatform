import React, {Fragment, useEffect, useState} from 'react'
import AdminDashboardSideBar from './AdminDashboardSideBar'
import AdminDashboardTopBar from './AdminDashboardTopBar'
import { Transition } from '@headlessui/react'
import { useAppDispatch } from '../hooks/useTypeSelector'
import { useSelector } from 'react-redux'
import { State } from '../redux/reducers'
import { parseCookies } from 'nookies'
import { User } from '../typings'
import { useSession } from 'next-auth/react'
import { loadUser } from "../redux/user/userAction";
import { useRouter } from 'next/router'
import axios from 'axios'

interface Props {
    children: JSX.Element
}

const AdmimDashboardLayout = ({ children }: Props) => {
  
    const [showNav, setShowNav] = useState(true)
    const [isMobile, setIsMobile] = useState(false)
    const cookies = parseCookies();
    const { data: session } = useSession();
    const router = useRouter();

    const dispatch = useAppDispatch()
    const profile = useSelector((state: State) => state.profile)
    const { loading, error, dbUser } = profile

    const user: User = dbUser
    ? dbUser
    : cookies?.user
    ? JSON.parse(cookies.user)
    : session?.user
    ? session?.user
    : "";

    function handleResize() {
        if(innerWidth<= 640) {
            setShowNav(false)
            setIsMobile(true)
        } else {
            setShowNav(true)
            setIsMobile(false)
        }
    }

    useEffect(() => {
      if(typeof window != undefined) {
        addEventListener("resize", handleResize)
      }

      return () => {
        removeEventListener('resize', handleResize)
      }
    }, [])
    

  return (
    <div className=''>
      <AdminDashboardTopBar showNav={showNav} setShowNav={setShowNav} dbUser={dbUser}/>
      <Transition
        as={Fragment}
        show={showNav}
        enter="transform transition duration-[400ms]"
        enterFrom='-translate-x-full'
        enterTo='translate-x-0'
        leave='transform duration-[400ms] transition ease-in-out'
        leaveFrom='translate-x-0'
        leaveTo='-translate-x-full'
        >
          <AdminDashboardSideBar/>
      </Transition>
      <main className={`bg-gray-700 rounded-sm h-screen pt-16 transition-all duration-[400ms] ${showNav && !isMobile ? 'pl-56' : ''}`}>
        <div className="flex flex-col justify-center items-center px-4 md:px-16 rounded-sm">
          {children}
        </div>
      </main>
    </div>

  )
}

export default AdmimDashboardLayout