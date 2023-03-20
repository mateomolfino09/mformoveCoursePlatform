import {getSession, useSession } from "next-auth/react";
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link';
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import axios from "axios";
import { parseCookies } from "nookies";
import { loadUser } from "../../api/user/loadUser";
import { Accept, useDropzone } from 'react-dropzone'
import { toast } from "react-toastify";
import { ArrowUpTrayIcon, DocumentIcon } from "@heroicons/react/24/outline";
import requests from "../../../utils/requests";
import AdmimDashboardLayout from "../../../components/AdmimDashboardLayout";
import { getUserFromBack } from "../../api/user/getUserFromBack";
import { UserContext } from "../../../hooks/userContext";

interface User {
  id: number;
  name: string;
  rol: string
  email: string;
  password: string;
}

interface ProfileUser {
  user: User | null;
  loading: boolean;
  error: any;
}


interface Props {
  user: User;
  session: User
}

interface Props {
  user: User 
}

const CreateCourse = ({ user }: Props) => {

    const [name, setName] = useState('')
    const [playlistId, setPlaylistId] = useState('')
    const [image, setImage] = useState<string | ArrayBuffer | null | undefined>(null)
    const [password, setPassword] = useState('')    
    const cookies = parseCookies()
    const {data: session} = useSession() 
    const router = useRouter()
    const [files, setFiles] = useState<any>([])
    const [userCtx, setUserCtx] = useState<User>(user)

    const providerValue = useMemo(() => ({userCtx, setUserCtx}), [userCtx, setUserCtx])
  
    const { getRootProps, getInputProps }: any = useDropzone({
      onDrop: (acceptedFiles: any) => {
        setFiles(acceptedFiles.map((file: any) => Object.assign(file, {
          preview: URL.createObjectURL(file)
        })))
      },
      multiple: false,
      accept: {'image/*': []}
      });

    const images = files.map((file: any) => 
    (
      <img src={file.preview} key={file.name} alt="image" className="cursor-pointer object-cover w-full h-full absolute"/>
    ))

    useEffect(() => {
      if (user === null || user.rol != 'Admin') {
          router.push("/src/user/login")
      }
    }, [session, router])

    async function handleSubmit(event: any) {
        try {
            event.preventDefault();
            const userEmail = user.email
            const formData = new FormData();
    
            for( const file of files) {
                formData.append('file', file)
            }
    
            formData.append('upload_preset', 'my_uploads')

            if(files[0].size / 1000000 > 10) {
              toast.error('Formato Incorrecto')
              return
            }
    
            //image Url -> secure_url
            const imageData = await fetch(requests.fetchCloudinary, {
                method: 'POST',
                body: formData
            }).then(r => r.json())

            console.log(imageData)

            const imgUrl = imageData.public_id
    
            const config = {
                headers: {
                  'Content-Type': 'application/json',
                },
              }
                
            const { data } = await axios.post('../../api/course/createCourse',
            {name, playlistId, imgUrl, password, userEmail}, 
            config
            )

            toast.success(data.message)

        } catch (error: any) {
            toast.error(error.response.data.error)

        }
    }

    function handleOnChange(changeEvent: any) {
        const reader = new FileReader();

        reader.onload = function(onLoadEvent) {
            setImage(onLoadEvent.target?.result)
        }

        reader.readAsDataURL(changeEvent.target.files[0])
    }

    return (
      <UserContext.Provider value={providerValue}>
      <AdmimDashboardLayout>
      <div className='relative flex w-full flex-col bg-black md:items-center md:justify-center md:bg-transparent'>
            <Head>
                <title>Video Streaming</title>
                <meta name="description" content="Stream Video App" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <div className={`h-full w-full relative flex flex-col md:items-center md:justify-center`}>
            {/* Logo position */}
            <form className='relative mt-24 space-y-4 rounded border-2 border-black/75 bg-black/50 py-12  px-8 md:mt-12 md:max-w-lg md:px-14' onSubmit={handleSubmit}> 
              <h1 className='text-4xl font-semibold'>Agregar un Curso</h1>
              <div className='space-y-8'>
              <label className='inline-block w-full'>
                      <input type="nombre"
                      placeholder='Nombre' 
                      className='input'
                      onChange={e => setName(e.target.value)}
                      />
              </label>
              <label className='inline-block w-full'>
                      <input type="playlistId"
                      placeholder='PlaylistId' 
                      className='input'
                      onChange={e => setPlaylistId(e.target.value)}
                      />
                </label>
                      {files.length != 0 ? (
                        <>
                          <div className="grid place-items-center input h-56 border-dashed border-2 border-white/80 relative" {...getRootProps()}>
                          <label className='w-full' onChange={handleOnChange} >
                              <input name="file"
                                  placeholder='File'
                                  {...getInputProps()} />
                                <DocumentIcon className="flex justify-center items-center h-12 w-12 my-0 mx-auto text-white/60 mb-8"/>
                                {/* {files.map((f: File) => <p className="flex justify-center items-center my-2 mx-auto text-white/80">{f.name}</p> )} */}
                            </label>
                            {images}
                        </div>

                        </>


                      ) : (
                        <div className="grid place-items-center input h-56 border-dashed border-2 border-white/80" {...getRootProps()}>

                        <label className='w-full' onChange={handleOnChange} >
                        <input name="file"
                            placeholder='File'
                            {...getInputProps()} />
                          <ArrowUpTrayIcon className="flex justify-center items-center h-12 w-12 my-0 mx-auto text-white/60"/>
                          <label className='flex justify-center items-center mx-auto text-white/60 mt-8'>
                              <p>Max Size: 10MB</p>
                          </label>
                          <label className='flex justify-center items-center my-0 mx-auto text-white/60'>
                              <p>Format: JPG</p>
                          </label>
                      </label>
                          </div>
                      )}
                  {files.length > 0 && (
                    <div className="w-full my-0 relative bottom-4">
                      <p className={`${files[0]?.size / 1000000 > 10 ? 'text-red-500' : 'text-white/60'}`}>El tamaño del archivo es {files[0]?.size / 1000000}MB</p>
                    </div>
                  )}
                  <label className='inline-block w-full'>
                      <input 
                      type="password" 
                      placeholder='Admin Password'
                      className='input'
                      onChange={e => setPassword(e.target.value)}
                    />
                  </label>
              </div>
            <button onClick={(e) => (e)} className='w-full bg-black/10 border border-white rounded-md transition duration-500 hover:bg-black py-3 font-semibold'>Crear Curso </button>
            <div className='text-[gray]'>
                  Volver al Inicio
                  <Link href={"/src/home"}> 
                  <button type='button' className='text-white hover:underline ml-2'> Volver</button>
                  </Link>
              </div>
            </form>
          </div>

        </div>
    </AdmimDashboardLayout>
    </UserContext.Provider>

      )
}

    export async function getServerSideProps(context: any) {
        const session = await getSession(context)
        const { params, query, req, res } = context
        const cookies = parseCookies(context)
        const userCookie = cookies?.user ? JSON.parse(cookies.user) : session?.user
        const email = userCookie.email   
        const user = await getUserFromBack(email)

        return {
          props: { user }
        }
    }




export default CreateCourse