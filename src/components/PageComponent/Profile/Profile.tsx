'use client'
import Membership from '../../../components/Membership';
import { CourseUser, User } from '../../../../typings';
import cookie from 'js-cookie';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { parseCookies } from 'nookies';
import React, { AnchorHTMLAttributes, useEffect, useRef, useState } from 'react';
import { AiOutlineUser } from 'react-icons/ai';
import { FaHistory } from 'react-icons/fa';
import { useAuth } from '../../../hooks/useAuth';
import Cookies from 'js-cookie';
import './profileStyle.css';
import Footer from '../../Footer';
import FooterProfile from './FooterProfile';
import UnsubscribeModal from './UnsubscribeModal';
import MainSideBar from '../../MainSidebar/MainSideBar';
import { Button, Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import endpoints from '../../../services/api';

function Profile() {
  const router = useRouter();
  const auth = useAuth()
  const aRef = useRef<any>(null)
  const [visible, setVisible] = useState<boolean>(false)
  let [isOpen, setIsOpen] = useState(false)
  let [loading, setLoading] = useState(false)
  let [loadingDates, setLoadingDates] = useState(false)

  let [plan, setPlan] = useState(null)
  let [startDate, setStartDate] = useState(null)
  let [endDate, setEndDate] = useState(null)

  function open() {
    setIsOpen(true)
  }

  function close() {
    setIsOpen(false)
  }


  const handleVisibility = () => {
    setVisible(!visible)
  }

  useEffect(() => {
    const cookies: any = Cookies.get('userToken')
    
    if (!cookies) {
      router.push('/login');
    }
    
    if(!auth.user) {
      auth.fetchUser()
    }
    else if(auth?.user?.subscription?.planId) {
      const fetchData = async () => {
        setLoading(true)
        try {
          const data = await fetch(endpoints.auth.getUserPlan(auth?.user?.subscription?.planId), {
            method: 'GET',
          }).then((r) => r.json());

          setPlan(data?.plan)
        } catch (err: any) {
          throw new Error(err)
        } finally {
          setLoading(false);
        }
      };

      if(auth?.user?.subscription?.provider == "stripe") {

        const fetchSubscriptionPeriod = async () => {
          setLoadingDates(true)
          try {
            const data = await fetch(endpoints.user.getSubscriptionPeriod(auth?.user?.subscription?.id), {
              method: 'GET',
            }).then((r) => r.json());
  
            setStartDate(data?.startDate)
            setEndDate(data?.endDate);
  
            console.log(data)
  
          } catch (err: any) {
            throw new Error(err)
          } finally {
            setLoadingDates(false);
          }


        };
    

        fetchSubscriptionPeriod();

      }

  
      fetchData();
    }


  }, [auth.user]);

  const logoutHandler = async (e: any) => {
    e.preventDefault();
    auth.signOut()

    aRef?.current?.click()
  };

  const cantCourses = auth.user?.courses?.filter(
    (c: CourseUser) => c.purchased
  ).length;

  return (

    <div className='main-container w-full h-screen font-montserrat'>
      <MainSideBar where={"index"}>
      <main className='sub-main-container mt-4 font-light md:mt-0 h-screen'>
        <div className='title-container'>
          <h1 className='title text-black font-light text-start md:text-center'>Mi Cuenta</h1>
        </div>

        <Membership user={auth.user} handleVisibility={open} plan={plan} loading={loading}/>
        <div className='second-container'>
          <h4 className='second-title '>Detalles del Plan</h4>
          <div className='col-span-2 font-light'>
            {auth?.user?.subscription?.active || auth?.user?.isVip ? (
              <>
              {loadingDates || !startDate ? <>Subscripción activa</> : <> Subscripción activa desde el {startDate}
              </>}
              </>
            ) : (
              <>
              Aún no estás subscripto
              </>
            )}

            <p>{loadingDates || !startDate ? "" : "Renovación del plan el " + endDate}</p>
          </div>
          
          {auth?.user?.subscription?.active || auth?.user?.isVip ? (
            <Link href={'/account/myCourses'}>
            <p
              className='paragraph'
            >
            </p>
          </Link>
            ) : (
              <a href='/select-plan' className='paragraph font-medium underline text-start md:text-end'>
              Subscribirme
              </a>
            )}
        </div>
        <div className='second-container'>
          <h4 className='second-title '>Salir</h4>
          <p
            className='paragraph-third'
            onClick={(e) => logoutHandler(e)}
          >
            Salir de todos los dispositivos
          </p>
        </div>
        <a href="/login" ref={aRef} className='hidden'>Salir</a>
      </main>
      <hr className='w-full border-[0.5px] border-solid border-black'/>
      <FooterProfile />
      <UnsubscribeModal handleVisiblity={open} visible={isOpen} close={close}/>

      </MainSideBar>

    </div>

  );
}

export default Profile;
  
  