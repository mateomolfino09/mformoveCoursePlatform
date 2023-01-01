import { getProviders, getSession, signIn, useSession } from "next-auth/react";
import LoginButton from '../../../components/LoginButton';
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link';
import React, { use, useEffect, useState } from 'react'
import imageLoader from '../../../imageLoader';
import Router, { useRouter } from 'next/router'
import { getToken } from "next-auth/jwt";
import cookie from 'js-cookie'
import axios from "axios";
import { parseCookies } from "nookies";
import { ToastContainer, toast } from 'react-toastify';
import { useDispatch } from "react-redux";
import { LiteralUnion } from "react-hook-form";
import { BuiltInProviderType } from "next-auth/providers";
import { GetServerSideProps } from "next";
import { GetServerSidePropsCallback } from "next-redux-wrapper";
import { wrapper } from "../../../redux/store";
import { loadUser } from "../../../redux/user/userAction";

interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

interface ProfileUser {
  user: User | null;
  loading: boolean;
  error: any;
}

interface Props {
  email: String;
  user: User;
}

const Login = ({ providers, session }: any) => {

    const cookies = parseCookies()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const router = useRouter()
    // const dispatch = useDispatch()

    useEffect(() => {
      if (session) {
        toast.success("Login exitoso!")
        router.push("/")
      }
  
      if (cookies?.user) {
        router.push("/")
      }
    }, [session, router])


    const signinUser = async (e: any) => {
      try {
        e.preventDefault();
  
        const config = {
          headers: {
            'Content-Type': 'application/json',
          },
        }
  
        const { data } = await axios.post('/api/user/login',
        {email, password}, 
        config
        )

        toast.success(data.message)
        cookie.set('token', data?.token)
        cookie.set('user', JSON.stringify(data?.user))

        router.push('/')
      } catch (error: any) {
        toast.error(error.response.data.message)
      }
        
    }

    return (
        <div className="elative flex h-screen w-screen flex-col bg-black md:items-center md:justify-center md:bg-transparent">
            <Head>
                <title>Video Streaming</title>
                <meta name="description" content="Stream Video App" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className='h-full w-full relative flex flex-col md:items-center md:justify-center'>
            <Image 
                src="https://rb.gy/p2hphi"
                layout="fill"
                className="-z-10 !hidden opacity-60 sm:!inline"
                objectFit="cover"
                alt='icon image'
                loader={imageLoader}/>
            <img
            src="https://rb.gy/ulxxee"
            className="absolute left-4 top-4 cursor-pointer object-contain md:left-10 md:top-6"
            width={150}
            height={150}
            />
            <div className="relative mt-24 mb-4 space-y-8 rounded bg-black/75 py-10 px-6 md:mt-0 md:max-w-lg md:px-10 md:mx-6">
                <form className='relative space-y-8 md:mt-0 md:max-w-lg'>
                    <h1 className='text-4xl font-semibold'>Te damos la bienvenida a Video Stream!</h1>
                    <h2 className='text-2xl font-semibold'>Ingresa tu cuenta para acceder al sitio</h2>
                    <div className='space-y-4'>
                        <label className='inline-block w-full'>
                            <input type="email"
                            id="email"
                            name="email"
                            placeholder='Email' 
                            className='input'
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            />
                        </label>
                        <label className='inline-block w-full'>
                            <input 
                            name="password"
                            id="password"
                            type="password" 
                            placeholder='Password'
                            className='input'
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            />
                        </label>
                    </div>

                    <button className='w-full rounded bg-[#e50914] py-3 font-semibold' onClick={(e) => signinUser(e)}>Sign In </button>

                </form>
                <LoginButton provider={providers?.google}/> 
                <div className="flex items-start justify-between flex-row">
                  <div className='text-[gray] text-xl md:text-sm'>
                    
                      Eres nuevo en Video Stream? 
                      <br/>
                      <Link href={'/src/user/signUp'}> 
                          <button type='button' className='text-white hover:underline'>Crea tu cuenta ahora!</button>
                      </Link>
                  </div>

                  <div className='text-[gray] text-xl md:text-sm'>
                  ¿Olvidaste tu contraseña?
                      <br/>
                      <Link href={'/src/user/forget'}> 
                          <button type='button' className='text-white hover:underline'>Recuperar mi cuenta</button>
                      </Link>
                  </div>
                </div>


            </div>
        </div>

    </div>
    )
}

export const getServerSideProps = wrapper.getServerSideProps(
  (store) =>
    async ({ req }) => {
      const session = await getSession({ req })
      const providers = await getProviders()
      const cookies = parseCookies()

      const user: User = cookies?.user ? JSON.parse(cookies.user) : session?.user

      await store.dispatch(loadUser(user?.email, user))

      return {
        props: {
          providers,
          session,
          
        },
      }
    }
)





export default Login