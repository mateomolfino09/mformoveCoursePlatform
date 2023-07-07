import { UserContext } from '../hooks/userContext';
import { State } from '../redux/reducers';
import { Notification, User } from '../../typings';
import state from '../valtio';
import { Menu, Popover, Transition } from '@headlessui/react';
import {
  BellIcon,
  Cog8ToothIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';
import axios from 'axios';
import { AnimatePresence, motion as m, useAnimation } from 'framer-motion';
import cookie from 'js-cookie';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { parseCookies } from 'nookies';
import React, {
  Fragment,
  RefObject,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react';
import { AiOutlineUser } from 'react-icons/ai';
import { RxCross2 } from 'react-icons/rx';
import { useSnapshot } from 'valtio';
import { useAuth } from '../hooks/useAuth';
import Cookies from 'js-cookie';

const Header = ({
  scrollToList,
  scrollToModa,
  scrollToNuevo,
  scrollToMy,
  dbUser
}: any) => {
  interface ProfileUser {
    user: User | null;
    loading: boolean;
    error: any;
  }

  interface Props {
    email: String;
    user: User;
  }

  const [isScrolled, setIsScrolled] = useState(false);
  const [notificationList, setNotificationList] = useState<
    null | Notification[]
  >(null);
  const snap = useSnapshot(state);
  const animationInput = useAnimation();
  const animationIcon = useAnimation();
  const inputRef = useRef<any>(null);
  const auth = useAuth()
  const router = useRouter()



  useEffect(() => {

    const cookies: any = Cookies.get('userToken')
    
    if (!cookies ) {
      router.push('/src/user/login');
    }
    
    if(!auth.user) {
      auth.fetchUser()
    }
    else if(auth.user.rol != 'Admin') router.push('/src/user/login');
    else {
      setNotificationList(auth.user.notifications.filter((x: Notification) => !x.read).slice(-5).reverse())
    }


  }, [auth.user]);

  const checkReadNotis = async () => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };
    const userId =  auth.user?._id;
    try {
      const { data } = await axios.put(
        '/api/user/notifications/checkAsRead',
        { userId },
        config
      );
      auth.setUserBack(data);
      setNotificationList(
        data.notifications.filter((x: Notification) => !x.read).slice(-5).reverse()
      );
    } catch (error) {
      console.log(error);
    }
  };


  useEffect(() => {
    if (snap.searchBar == true) {
      animationInput.start({
        width: '12rem',
        zIndex: 500,
        transition: {
          delay: 0.05,
          ease: 'linear',
          duration: 0.25,
          stiffness: 0
        }
      });
      animationIcon.start({
        x: -160,
        zIndex: 500,
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
        zIndex: 500,
        transition: {
          delay: 0.05,
          ease: 'linear',
          duration: 0.25,
          stiffness: 0
        }
      });
      animationIcon.start({
        x: 0,
        zIndex: 500,
        transition: {
          ease: 'linear',
          duration: 0,
          stiffness: 0
        }
      });
    }
  }, [snap.searchBar]);

  useEffect(() => {

    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [router]);

  const handleSearch = (e: any) => {
    state.searchInput = e.target.value;
    state.searchToggle = true;
    // router.query.search = e.target.value
    // router.push(router)
  };
  const handleSearchActivation = () => {
    state.searchBar = !state.searchBar;
  };

  const handleCross = () => {
    state.searchToggle = false;
    state.searchBar = false;
    state.searchInput = '';
  };

  const handleBlur = () => {
    if (state.searchToggle == false) {
      state.searchBar = false;
      state.searchInput = '';
    }
  };

  function scrollToHome() {
    if (window) {
      const y = 0;

      window.scrollTo({ top: y, behavior: 'smooth' });
      // return refToModa?.current.scrollIntoView({behavior: 'smooth'})
    }
  }

  return (
    <header className={`${isScrolled && 'bg-[#141414]'}`}>
      <div className='flex items-center space-x-2 md:space-x-10'>
        <Link href={'/'}>
          <img
            alt='icon image'
            src='/images/logoWhite.png'
            width={100}
            height={100}
            className='cursor-pointer object-contain transition duration-500 hover:scale-105 opacity-90 hover:opacity-100'
          />
        </Link>

        <ul className='hidden space-x-4 md:flex'>
          <li className='headerLink' onClick={scrollToHome}>
            Home
          </li>
          {scrollToModa !== null ? (
            <li onClick={scrollToModa} className='headerLink'>
              Cursos
            </li>
          ) : (
            <Link href={'/src/home'}>
              <li className='headerLink'>Cursos</li>
            </Link>
          )}
          {scrollToNuevo !== null ? (
            <li onClick={scrollToNuevo} className='headerLink'>
              Nuevo
            </li>
          ) : (
            <Link href={'/src/home'}>
              <li className='headerLink'>Nuevo</li>
            </Link>
          )}
          {scrollToList !== null ? (
            <li onClick={scrollToList} className='headerLink'>
              Mi Lista
            </li>
          ) : (
            <Link href={'/src/home'}>
              <li className='headerLink'>Mi Lista</li>
            </Link>
          )}
          <Link href={'/src/user/account/myCourses'}>
            <li className='headerLink cursor-pointer'>Mis Cursos</li>
          </Link>
        </ul>
      </div>
      <div className='flex items-center space-x-4 text-sm font-light'>
        <m.div
          initial={{ width: '3rem' }}
          animate={animationInput}
          className={`rounded-md h-8  items-center flex justify-end relative ${
            snap.searchBar ? 'border-white border bg-black/80' : 'w-12'
          } overflow-hidden`}
        >
          <input
            ref={inputRef}
            value={snap.searchInput}
            onChange={(e) => handleSearch(e)}
            onBlur={handleBlur}
            type='text'
            className={`w-full ml-8 appearance-none focus:bg-black/80 ${
              snap.searchBar ? 'input block bg-black/80 px-1' : 'hidden'
            }`}
          />
          <m.div
            initial={{ x: 0 }}
            animate={animationIcon}
            className={`hidden h-6 w-6 sm:inline cursor-pointer -right-1 absolute ${
              snap.searchBar ? '' : ''
            }`}
          >
            <MagnifyingGlassIcon
              className={`hidden h-6 w-6 sm:inline cursor-pointer absolute right-1 ${
                snap.searchBar ? '' : ''
              }`}
              onClick={handleSearchActivation}
            />
          </m.div>
          {snap.searchToggle && (
            <div onClick={handleCross} className='h-6 w-6'>
              <RxCross2
                className={`h-6 w-6  cursor-pointer absolute right-1 ${
                  snap.searchBar ? 'sm:inline' : 'hidden'
                }`}
              />
            </div>
          )}
        </m.div>
        {auth.user?.rol === 'Admin' ? (
          <>
            <Link href={'/src/admin'}>
              <Cog8ToothIcon className='h-6 w-6 inline cursor-pointer' />
            </Link>
          </>
        ) : null}
        <Link href={'/src/user/account/myCourses'}>
          <li className='headerLink cursor-pointer list-none'>Mis Cursos</li>
        </Link>
        <Popover>
          <Popover.Button className='outline-none cursor-pointer text-white'>
            <BellIcon className='h-6 w-6 cursor-pointer' />
          </Popover.Button>
          <Transition
            enter='transition ease-out duration-100'
            enterFrom='transform scale-95'
            enterTo='transform scale-100'
            leave='transition ease-in duration=75'
            leaveFrom='transform scale-100'
            leaveTo='transform scale-95'
          >
            <Popover.Panel className='absolute -right-16 sm:right-4 z-50 mt-2 bg-white shadow-sm rounded max-w-xs sm:max-w-sm w-screen'>
              <div className='relative p-3'>
                <div className='flex justify-between items-center w-full'>
                  <p className='text-gray-700 font-medium'>Notificaciones</p>
                  <a
                    className='text-sm text-black underline'
                    href='#'
                    onClick={checkReadNotis}
                  >
                    Marcar como leidos
                  </a>
                </div>

                <div className='mt-4 grid gap-4 grid-cols-1 overflow-hidden'>
                  { auth.user?.notifications &&
                  notificationList &&
                  notificationList.length > 0 ? (
                    <>
                      {notificationList.map((notification: Notification) => (
                        <React.Fragment key={notification.title}>
                          <div className='flex'>
                            <div
                              className={`rounded-full shrink-0 ${
                                notification.status === 'green'
                                  ? 'bg-green-200'
                                  : notification.status === 'red'
                                  ? 'bg-red-500'
                                  : 'bg-yellow-200'
                              } h-8 w-8 flex items-center justify-center`}
                            >
                              <CheckIcon className={`h-4 w-4 `} />
                            </div>
                            <div className='ml-4'>
                              <p className='font-medium text-gray-700'>
                                {notification.title}
                              </p>
                              <p className='text-sm text-gray-500 truncate break-all whitespace-normal'>
                                {notification.message}
                              </p>

                              {notification.link && notification.link !== '' ? (
                                <a
                                  href={notification.link}
                                  className='text-sm text-gray-500 truncate break-all whitespace-normal underline'
                                >
                                  link
                                </a>
                              ) : null}
                            </div>
                          </div>
                        </React.Fragment>
                      ))}
                    </>
                  ) : (
                    <div className='flex'>
                      <div className='ml-4'>
                        <p className='font-medium text-gray-700'>
                          No hay Notificaciones por el momento
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </Popover>
        {/* <Link href="/account"> */}
        <Link href={'user/account'}>
          <AiOutlineUser className='h-6 w-6 cursor-pointer' />
        </Link>

        {/* </Link> */}
      </div>
    </header>
  );
};

export default Header;
