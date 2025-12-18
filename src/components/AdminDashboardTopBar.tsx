import { Notification, User } from '../../typings';
import { Menu, Popover, Transition } from '@headlessui/react';
import { BellIcon, CheckIcon } from '@heroicons/react/24/outline';
import {
  Bars3CenterLeftIcon,
  ChevronDownIcon,
  Cog8ToothIcon,
  CreditCardIcon,
  PencilIcon
} from '@heroicons/react/24/solid';
import axios from 'axios';
import Link from 'next/link';
import { Fragment, useContext, useEffect, useState } from 'react';
import { AiOutlineUser } from 'react-icons/ai';
import { useAuth } from '../hooks/useAuth';
import Cookies from 'js-cookie';
import { useRouter, usePathname } from 'next/navigation';

interface Props {
  showNav: any;
  setShowNav: any;
  dbUser: User | null;
}

const AdminDashboardTopBar = ({ showNav, setShowNav }: Props) => {
  const auth = useAuth()
  const router = useRouter()
  const [notificationList, setNotificationList] = useState<Notification[] | null>(
    null
  );

  useEffect(() => {

    const cookies: any = Cookies.get('userToken')
    
    if (!cookies ) {
      router.push('/login');
    }
    
    if(!auth.user) {
      auth.fetchUser()
    }
    else if(auth.user.rol != 'Admin') router.push('/login');
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
    const notifications = auth.user.notifications
      .filter((x: Notification) => !x.read)
      .slice(-5);
    const userId = auth.user?._id;
    try {
      const { data } = await axios.put(
        '/api/user/notifications/checkAsRead',
        { userId },
        config
      );
      // setListCourse([...listCourse, course])
      auth.setUserBack(data);
      setNotificationList(
        data.notifications.filter((x: Notification) => !x.read).slice(-5).reverse()
      );
    } catch (error) {
      }
  };

  return (
    <div
      className={`bg-white/90 backdrop-blur-md border-b border-gray-200 fixed w-full h-16 flex justify-between items-center transition-all duration-[400ms] z-10 font-montserrat shadow-sm ${
        showNav ? 'pl-56' : ''
      }`}
    >
      <div className='pl-4 md:pl-16'>
        <Bars3CenterLeftIcon
          className='h-8 w-8 text-gray-700 hover:text-gray-900 cursor-pointer transition-colors duration-300'
          onClick={() => setShowNav(!showNav)}
        />
      </div>
      <div className='flex items-center pr-4 md:pr-16'>
        <Popover>
          <Popover.Button className='outline-none mr-5 md:mr-8 cursor-pointer text-gray-700 hover:text-gray-900 transition-colors duration-300'>
            <BellIcon className='h-6 w-6' />
          </Popover.Button>
          <Transition
            as={Fragment}
            enter='transition ease-out duration-200'
            enterFrom='transform scale-95 opacity-0'
            enterTo='transform scale-100 opacity-100'
            leave='transition ease-in duration-150'
            leaveFrom='transform scale-100 opacity-100'
            leaveTo='transform scale-95 opacity-0'
          >
            <Popover.Panel className='absolute -right-16 sm:right-4 z-50 mt-2 bg-white backdrop-blur-md border border-gray-200 shadow-2xl rounded-xl max-w-xs sm:max-w-sm w-screen'>
              <div className='relative p-4'>
                <div className='flex justify-between items-center w-full mb-4'>
                  <p className='text-gray-900 font-medium font-montserrat'>Notificaciones</p>
                  <a
                    className='text-sm text-[#4F7CCF] hover:text-[#234C8C] transition-colors duration-300 font-medium'
                    href='#'
                    onClick={checkReadNotis}
                  >
                    Marcar como leidos
                  </a>
                </div>

                <div className='mt-4 grid gap-3 grid-cols-1 overflow-hidden'>
                  {auth.user?.notifications && notificationList && notificationList.length > 0 ? (
                    <>
                      {notificationList.map((notification: Notification) => (
                        <div className='flex items-start p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all duration-300' key={notification.title}>
                          <div
                            className={`rounded-full shrink-0 ${
                              notification.status === 'green'
                                ? 'bg-green-100 border border-green-300'
                                : notification.status === 'red'
                                ? 'bg-red-100 border border-red-300'
                                : 'bg-yellow-100 border border-yellow-300'
                            } h-8 w-8 flex items-center justify-center`}
                          >
                            <CheckIcon className={`h-4 w-4 ${
                              notification.status === 'green'
                                ? 'text-green-600'
                                : notification.status === 'red'
                                ? 'text-red-600'
                                : 'text-yellow-600'
                            }`} />
                          </div>
                          <div className='ml-3 flex-1 min-w-0'>
                            <p className='font-medium text-gray-900 text-sm font-montserrat'>
                              {notification.title}
                            </p>
                            <p className='text-xs text-gray-600 truncate break-all whitespace-normal mt-1'>
                              {notification.message}
                            </p>
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className='flex p-3 rounded-lg bg-gray-50'>
                      <div className='ml-0'>
                        <p className='font-medium text-gray-600 text-sm font-montserrat'>
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
        <Menu as='div' className='relative inline-block text-left'>
          <div>
            <Menu.Button className='inline-flex w-full justify-center items-center hover:opacity-80 transition-opacity duration-300'>
              <AiOutlineUser className='cursor-pointer text-gray-700 rounded h-6 w-6 md:mr-2 border-2 border-gray-200 shadow-sm bg-gray-50 p-1' />
              <span className='hidden md:block font-medium text-gray-900 font-montserrat'>
                {auth.user?.name}
              </span>
              <ChevronDownIcon className='ml-2 h-4 w-4 text-gray-700' />
            </Menu.Button>
          </div>
          <Transition
            as={Fragment}
            enter='transition ease-out duration-200'
            enterFrom='transform scale-95 opacity-0'
            enterTo='transform scale-100 opacity-100'
            leave='transition ease-in duration-150'
            leaveFrom='transform scale-100 opacity-100'
            leaveTo='transform scale-95 opacity-0'
          >
            <Menu.Items className='absolute right-0 w-56 z-50 mt-2 origin-top-right bg-white backdrop-blur-md border border-gray-200 rounded-xl shadow-2xl'>
              <div className='p-1'>
                <Menu.Item>
                  <Link
                    href='#'
                    className='flex hover:bg-gray-50 hover:text-gray-900 text-gray-700 rounded-lg p-3 text-sm group transition-all duration-300 items-center font-montserrat'
                  >
                    <PencilIcon className='h-4 w-4 mr-3 text-gray-500 group-hover:text-[#4F7CCF] transition-colors duration-300' />
                    Editar
                  </Link>
                </Menu.Item>
                <Menu.Item>
                  <Link
                    href='/admin/billing'
                    className='flex hover:bg-gray-50 hover:text-gray-900 text-gray-700 rounded-lg p-3 text-sm group transition-all duration-300 items-center font-montserrat'
                  >
                    <CreditCardIcon className='h-4 w-4 mr-3 text-gray-500 group-hover:text-[#4F7CCF] transition-colors duration-300' />
                    Facturas
                  </Link>
                </Menu.Item>
                <Menu.Item>
                  <Link
                    href='#'
                    className='flex hover:bg-gray-50 hover:text-gray-900 text-gray-700 rounded-lg p-3 text-sm group transition-all duration-300 items-center font-montserrat'
                  >
                    <Cog8ToothIcon className='h-4 w-4 mr-3 text-gray-500 group-hover:text-[#4F7CCF] transition-colors duration-300' />
                    Configuración
                  </Link>
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </div>
  );
};

export default AdminDashboardTopBar;
