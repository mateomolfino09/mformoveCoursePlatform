import { LoadingSpinner } from '../../../components/LoadingSpinner'
import { countries } from '../../../constants/countries'
import { genders } from '../../../constants/genders'
import imageLoader from '../../../imageLoader'
import axios from 'axios'
import { getSession, signIn, useSession } from 'next-auth/react'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { parseCookies } from 'nookies'
import React, { MouseEvent, useEffect, useRef, useState } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import { SubmitHandler, useForm } from 'react-hook-form'
import { ToastContainer, toast } from 'react-toastify'
import { idText } from 'typescript'

interface Inputs {
  email: string
  password: string
}

function SignUp() {
  const { data: session } = useSession()
  const cookies = parseCookies()

  const [loading, setLoading] = useState(false)
  const [state, setState] = useState({
    email: '',
    firstname: '',
    lastname: '',
    password: '',
    conPassword: '',
    gender: '',
    country: ''
  })
  const [registered, setRegistered] = useState(false)
  const [email, setEmail] = useState('')
  const [firstname, setFirstname] = useState('')
  const [lastname, setLastname] = useState('')
  const [password, setPassword] = useState('')
  const [conPassword, setConPassword] = useState('')

  const [captchaToken, setCaptchaToken] = useState<string | null>(null)

  const router = useRouter()
  const recaptchaRef = useRef<any>()

  const key =
    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY != undefined
      ? process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
      : ''

  useEffect(() => {
    if (session) {
      router.push('/src/home')
    }

    if (cookies?.user) {
      router.push('/src/home')
    }
  }, [router])
  //using React Hook Form library
  const {
    formState: { errors }
  } = useForm<Inputs>()

  const onChange = () => {
    if (recaptchaRef.current.getValue()) {
      setCaptchaToken(recaptchaRef.current.getValue())
    } else {
      setCaptchaToken(null)
    }
  }

  const signupUser = async (e: MouseEvent<HTMLButtonElement>) => {
    try {
      e.preventDefault()
      setLoading(true)

      const captcha = captchaToken
      if (!captcha) {
        toast.error('Error de CAPTCHA, vuelva a intentarlo mas tarde')
        setLoading(false)
        setTimeout(() => {
          window.location.reload()
        }, 4000)
        return
      }

      if (password !== conPassword) {
        toast.error('Las contraseñas no coinciden')
        setLoading(false)
        setTimeout(() => {
          window.location.reload()
        }, 4000)
        return
      }

      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      }

      const { data } = await axios.post(
        '/api/user/register',
        { email, password, firstname, lastname, captcha },
        config
      )

      if (data?.message) {
        setRegistered(true)
      }
    } catch (error: any) {
      console.log(error)
      toast.error(error.response.data.error)
    }
    setLoading(false)
  }

  return (
    <div className='relative flex h-screen w-screen flex-col bg-black md:items-center md:justify-center md:bg-transparent'>
      <Head>
        <title>Video Streaming</title>
        <meta name='description' content='Stream Video App' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      {loading && (
        <div
          className={`h-full w-full relative flex flex-col md:items-center md:justify-center`}
        >
          <LoadingSpinner />
        </div>
      )}
      {!registered && !loading && (
        <div
          className={`h-full w-full relative flex flex-col md:items-center md:justify-center ${
            loading && 'hidden'
          }`}
        >
          <Image
            src='https://rb.gy/p2hphi'
            layout='fill'
            className='-z-10 !hidden opacity-60 sm:!inline'
            objectFit='cover'
            alt='icon image'
            loader={imageLoader}
          />
          {/* Logo position */}
          <img
            alt='icon image'
            src='/images/logo.png'
            className='absolute left-4 top-4 cursor-pointer object-contain md:left-10 md:top-6 transition duration-500 hover:scale-105'
            width={150}
            height={150}
          />

          <form
            method='post'
            action='/api/auth/signup/email'
            className='relative mt-24 space-y-8 rounded bg-black/75 py-12 px-8 md:mt-0 md:max-w-lg md:px-14'
          >
            <h1 className='text-4xl font-semibold'>Registrate!</h1>
            <div className='space-x-4 flex'>
              <label className=''>
                <input
                  type='nombre'
                  placeholder='Nombre'
                  className='input'
                  value={firstname}
                  onChange={(e) => setFirstname(e.target.value)}
                />
              </label>
              <label className=''>
                <input
                  type='apellido'
                  placeholder='Apellido'
                  className='input'
                  value={lastname}
                  onChange={(e) => setLastname(e.target.value)}
                />
              </label>
            </div>
            <div className='space-y-8'>
              <label className='inline-block w-full'>
                <input
                  type='email'
                  placeholder='Email'
                  className='input'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && (
                  <p className='p-1 text-[13px] font-light  text-orange-500'>
                    Please enter a valid email.
                  </p>
                )}
              </label>
              <label className='inline-block w-full'>
                <input
                  type='password'
                  placeholder='Password'
                  className='input'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {errors.password && (
                  <p className='p-1 text-[13px] font-light  text-orange-500'>
                    Your password must contain between 4 and 60 characters.
                  </p>
                )}
              </label>
              <label className='inline-block w-full'>
                <input
                  type='password'
                  placeholder='Confirmar Password'
                  className='input'
                  value={conPassword}
                  onChange={(e) => setConPassword(e.target.value)}
                />
              </label>
              <ReCAPTCHA onChange={onChange} ref={recaptchaRef} sitekey={key} />
            </div>
            <button
              onClick={(e) => signupUser(e)}
              className='w-full rounded bg-light-red py-3 font-semibold'
            >
              Registrarme{' '}
            </button>
            <div className='text-[gray]'>
              Ya tienes una cuenta?
              <Link href={'/src/user/login'}>
                <button
                  type='button'
                  className='text-white hover:underline ml-2'
                >
                  Log In
                </button>
              </Link>
            </div>
          </form>
        </div>
      )}
      {registered && !loading && (
        <div className='h-full w-full relative flex flex-col md:items-center md:justify-center'>
          <Image
            src='https://rb.gy/p2hphi'
            layout='fill'
            className='-z-10 !hidden opacity-60 sm:!inline'
            objectFit='cover'
            alt='icon image'
            loader={imageLoader}
          />
          {/* Logo position */}
          <img
            src='/images/logo.png'
            className='absolute left-4 top-4 cursor-pointer object-contain md:left-10 md:top-6 transition duration-500 hover:scale-105'
            width={150}
            height={150}
            alt='icon image'
          />
          <div className='relative mt-24 space-y-8 rounded bg-black/75 py-10 px-6 md:mt-0 md:max-w-lg md:px-14'>
            <h1 className='text-4xl font-semibold'>
              Hemos enviado un correo a tu cuenta.
            </h1>
            <div className='space-y-4'>
              <label className='inline-block w-full'>
                <p>
                  Verifica tu casilla de correos para poder confirmar tu cuenta!
                </p>
              </label>
              <Link href={'/src/user/login'}>
                <button
                  type='button'
                  className='text-white underline cursor-pointer'
                >
                  Volver al Inicio
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export async function getServerSideProps(context: any) {
  const session = await getSession(context)

  return {
    props: {
      session
    }
  }
}

export default SignUp
