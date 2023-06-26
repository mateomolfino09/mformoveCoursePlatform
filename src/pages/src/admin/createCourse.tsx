import AdmimDashboardLayout from '../../../components/AdmimDashboardLayout';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import { UserContext } from '../../../hooks/userContext';
import requests from '../../../utils/requests';
import { getUserFromBack } from '../../api/user/getUserFromBack';
import { ArrowUpTrayIcon, DocumentIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { parseCookies } from 'nookies';
import React, { useEffect, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { AiOutlineCheckCircle } from 'react-icons/ai';
import { RxCrossCircled } from 'react-icons/rx';
import { StylesConfig, components } from 'react-select';
import { toast } from 'react-toastify';
import { useAuth } from '../../../hooks/useAuth';
import Cookies from 'js-cookie';

interface User {
  id: number;
  name: string;
  rol: string;
  email: string;
  password: string;
}

const CreateCourse = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [playlistId, setPlaylistId] = useState('');
  const [image, setImage] = useState<string | ArrayBuffer | null | undefined>(
    null
  );
  const [password, setPassword] = useState('');
  const cookies = parseCookies();
  const router = useRouter();
  const [files, setFiles] = useState<any>([]);
  const [price, setPrice] = useState<number | null>(null);
  const [cantidadClases, setCantidadClases] = useState<number | null>(null);
  const [modules, setModules] = useState<number | null>(null);
  const [moduleNumbers, setModuleNumbers] = useState<number[]>([]);
  const [classesNumbers, setClassesNumbers] = useState<number[]>([]);
  const [breakpointTitles, setBreakpointTitles] = useState<string[]>([]);
  const [showBreakpoints, setShowBreakpoints] = useState<boolean>(false);
  const [currencys, setCurrency] = useState<string>('$');
  const [loading, setLoading] = useState<boolean>(false);
  const [descriptionLength, setDescriptionLength] = useState<number>(
    description.length
  );

  const auth = useAuth()

  useEffect(() => {

    const cookies: any = Cookies.get('userToken')
    
    if (!cookies ) {
      router.push('/src/user/login');
    }
    
    if(!auth.user) {
      auth.fetchUser()
    }
    else if(auth.user.rol != 'Admin') router.push('/src/user/login');


  }, [auth.user]);

  const { getRootProps, getInputProps }: any = useDropzone({
    onDrop: (acceptedFiles: any) => {
      setFiles(
        acceptedFiles.map((file: any) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file)
          })
        )
      );
    },
    multiple: false,
    accept: { 'image/*': [] }
  });

  const images = files.map((file: any) => (
    <img
      src={file.preview}
      key={file.name}
      alt='image'
      className='cursor-pointer object-cover w-full h-full absolute'
    />
  ));

  useEffect(() => {
    if (cantidadClases !== null && modules != null) {
      const classesNums = [];
      for (let index = 0; index < cantidadClases; index++) {
        classesNums.push(index);
      }
      setClassesNumbers(classesNums);
      setShowBreakpoints(true);
    } else {
      setShowBreakpoints(false);
      setClassesNumbers([]);
    }
  }, [cantidadClases, modules]);

  useEffect(() => {}, [moduleNumbers, setModuleNumbers]);

  const handleModuleSelection = (num: number) => {
    if (moduleNumbers.length === modules) {
      if (moduleNumbers.includes(num) && num != 1) {
        let modules = [...moduleNumbers];
        modules.splice(modules.indexOf(num), 1).sort((a, b) => a - b);
        setModuleNumbers(modules);
      }
    } else {
      if (moduleNumbers.includes(num) && num != 1) {
        let modules = [...moduleNumbers];
        modules.splice(modules.indexOf(num), 1).sort((a, b) => a - b);
        setModuleNumbers(modules);
      } else {
        if (num != 1) {
          let modules = [...moduleNumbers, num].sort((a, b) => a - b);
          setModuleNumbers(modules);
        }
      }
    }
  };

  const handleModuleTitle = (title: string, index: number, value: number) => {
    let breakpointsTitles = [...breakpointTitles];
    breakpointsTitles[index] = title;
    setBreakpointTitles(breakpointsTitles);
  };

  async function handleSubmit(event: any) {
    setLoading(true);
    if (name.length < 5) {
      toast.error('El Nombre del curso debe tener almenos 5 caracteres');
      setLoading(false);
      return;
    } else if (playlistId.length <= 5) {
      console.log(playlistId);
      toast.error('Debe poner una Playlist Id para el curso');
      setLoading(false);
      return;
    } else if (files.length == 0) {
      toast.error('Debe poner una imágen para el curso');
      setLoading(false);
      return;
    } else if (description.length < 30) {
      toast.error('La descripción del curso debe tener almenos 30 caracteres');
      setLoading(false);
      return;
    } else if (price == null) {
      toast.error('Debe indicar el precio del curso');
      setLoading(false);
      return;
    } else if (cantidadClases == null) {
      toast.error('Debe indicar la cantidad de clases');
      setLoading(false);
      return;
    } else if (modules == null) {
      toast.error('Debe indicar la cantidad de módulos');
      setLoading(false);
      return;
    } else if (modules == null) {
      toast.error('Debe indicar la cantidad de módulos');
      setLoading(false);
      return;
    } else if (moduleNumbers.length != modules) {
      toast.error('Debe indicar los breakpoints de los módulos');
      setLoading(false);
      return;
    } else if (breakpointTitles.length != modules) {
      toast.error('Debe indicar los títulos de los módulos');
      setLoading(false);
      return;
    }

    try {
      event.preventDefault();
      const userEmail = auth.user.email;
      const formData = new FormData();

      for (const file of files) {
        formData.append('file', file);
      }

      formData.append('upload_preset', 'my_uploads');

      if (files[0].size / 1000000 > 10) {
        toast.error('Formato Incorrecto');
        return;
      }

      //image Url -> secure_url
      const imageData = await fetch(requests.fetchCloudinary, {
        method: 'POST',
        body: formData
      }).then((r) => r.json());

      console.log(imageData);

      const imgUrl = imageData.public_id;

      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      console.log(description);

      const { data } = await axios.post(
        '../../api/course/createCourse',
        {
          name,
          playlistId,
          imgUrl,
          password,
          userEmail,
          description,
          price,
          currencys,
          moduleNumbers,
          breakpointTitles,
          cantidadClases
        },
        config
      );

      toast.success(data.message);
    } catch (error: any) {
      toast.error(error.response.data.error);
    }
    setLoading(false);
  }

  function handleOnChange(changeEvent: any) {
    const reader = new FileReader();

    reader.onload = function (onLoadEvent) {
      setImage(onLoadEvent.target?.result);
    };

    reader.readAsDataURL(changeEvent.target.files[0]);
  }

  return (
      <AdmimDashboardLayout>
      <Head>
        <title>Video Streaming</title>
        <meta name='description' content='Stream Video App' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
        {loading ? (
          <div className='md:h-[100vh] w-full flex flex-col justify-center items-center'>
            <LoadingSpinner />
            <p className='font-light text-xs text-[gray] mt-4'>
              Esto puede demorar unos segundos...
            </p>
          </div>
        ) : (
          <>
            <div className='relative flex w-full flex-col bg-transparent md:items-center md:justify-center md:bg-transparent'>
              <Head>
                <title>Video Streaming</title>
                <meta name='description' content='Stream Video App' />
                <link rel='icon' href='/favicon.ico' />
              </Head>

              <div
                className={`h-full w-full relative flex flex-col md:items-center md:justify-center`}
              >
                {/* Logo position */}
                <form
                  className='relative mt-24 space-y-4 rounded border-2 border-black/75 bg-black/50 py-12 px-8 my-12 md:max-w-lg md:px-14'
                  autoComplete='nope'
                  onSubmit={handleSubmit}
                >
                  <h1 className='text-4xl font-semibold mb-12'>
                    Agregar un Curso
                  </h1>
                  <div className='space-y-8'>
                    <label className='inline-block w-full'>
                      <input
                        type='nombre'
                        placeholder='Nombre'
                        className='input'
                        onChange={(e) => setName(e.target.value)}
                      />
                    </label>
                    <label className='inline-block w-full'>
                      <input
                        type='playlistId'
                        placeholder='PlaylistId'
                        className='input'
                        onChange={(e) => setPlaylistId(e.target.value)}
                      />
                    </label>
                    <div className='flex flex-row space-x-2 justify-center items-start'>
                      <label className='inline-block w-full'>
                        <input
                          type='number'
                          placeholder='Cantidad Clases'
                          className='input'
                          key={'clases'}
                          autoComplete='off'
                          onChange={(e) => {
                            +e.target.value < 0
                              ? null
                              : setCantidadClases(+e.target.value);
                            setModuleNumbers([1]);
                          }}
                          min={0}
                          step={1}
                          value={cantidadClases ? cantidadClases : undefined}
                          onKeyDown={(e) =>
                            e.key === '-' ? e.preventDefault() : null
                          }
                        />
                      </label>
                      <label className='inline-block w-full'>
                        <input
                          type='number'
                          placeholder='Módulos'
                          className='input'
                          key={'module'}
                          autoComplete='off'
                          onChange={(e) => {
                            if (
                              cantidadClases &&
                              +e.target.value > cantidadClases
                            ) {
                              e.preventDefault();
                            } else {
                              +e.target.value < 0
                                ? null
                                : setModules(+e.target.value);
                            }
                          }}
                          min={0}
                          step={1}
                          value={modules ? modules : undefined}
                          onKeyDown={(e) =>
                            e.key === '-' ? e.preventDefault() : null
                          }
                        />
                      </label>
                    </div>
                    <div
                      className={`${
                        !showBreakpoints && 'hidden'
                      } text-sm flex space-x-2 items-center`}
                    >
                      <p className={`${!showBreakpoints && 'hidden'} text-sm`}>
                        Selecciona los breakpoints de los módulos
                      </p>
                      {moduleNumbers.length !== modules ? (
                        <RxCrossCircled className='text-xs text-red-600' />
                      ) : (
                        <AiOutlineCheckCircle className='text-xs text-green-600' />
                      )}
                    </div>
                    <div
                      className={`flex space-y-4 flex-row justify-start !mt-0 items-end w-full h-full flex-wrap ${
                        !showBreakpoints && 'hidden'
                      }`}
                    >
                      {classesNumbers.map((number: number) => (
                        <React.Fragment key={number}>
                          <div
                            onClick={() => handleModuleSelection(number + 1)}
                            className={`max-w-[2rem] mr-4 h-8  rounded-full justify-center items-center flex cursor-pointer hover:bg-white hover:text-black ${
                              moduleNumbers.includes(number + 1)
                                ? 'bg-white text-black'
                                : 'bg-black'
                            }`}
                            style={{ flex: '0 1 21%' }}
                          >
                            <p>{number + 1}</p>
                          </div>
                        </React.Fragment>
                      ))}
                    </div>
                    <div
                      className={`flex space-y-4 flex-col justify-start !mt-4 items-start w-full h-full flex-wrap ${
                        !showBreakpoints ||
                        (moduleNumbers.length !== modules && 'hidden')
                      }`}
                    >
                      {moduleNumbers.length !== modules && !showBreakpoints ? (
                        <></>
                      ) : (
                        <>
                          <hr className='w-full border border-black border-dashed' />
                          {moduleNumbers.map((number: number) => (
                            <div className='flex w-full flex-row justify-center items-center' key={number}>
                              <div
                                onClick={() => handleModuleSelection(number)}
                                className={`min-w-[2rem] mr-4 h-8  rounded-full justify-center items-center flex cursor-pointer hover:bg-white hover:text-black ${
                                  moduleNumbers.includes(number)
                                    ? 'bg-white text-black'
                                    : 'bg-black'
                                }`}
                              >
                                <p>{number}</p>
                              </div>
                              <label className='inline-block w-full'>
                                <input
                                  type='text'
                                  placeholder={`Título módulo ${
                                    moduleNumbers.indexOf(number) + 1
                                  }`}
                                  className='input'
                                  onChange={(e) =>
                                    handleModuleTitle(
                                      e.target.value,
                                      moduleNumbers.indexOf(number),
                                      number
                                    )
                                  }
                                />
                              </label>
                            </div>
                          ))}
                        </>
                      )}
                    </div>

                    {files.length != 0 ? (
                      <>
                        <div
                          className='grid place-items-center input h-80 border-dashed border-2 border-white/80 relative'
                          {...getRootProps()}
                        >
                          <label className='w-full' onChange={handleOnChange}>
                            <input
                              name='file'
                              placeholder='File'
                              {...getInputProps()}
                            />
                            <DocumentIcon className='flex justify-center items-center h-12 w-12 my-0 mx-auto text-white/60 mb-8' />
                            {/* {files.map((f: File) => <p className="flex justify-center items-center my-2 mx-auto text-white/80">{f.name}</p> )} */}
                          </label>
                          {images}
                        </div>
                      </>
                    ) : (
                      <div
                        className='grid place-items-center input h-80 border-dashed border-2 border-white/80'
                        {...getRootProps()}
                      >
                        <label className='w-full' onChange={handleOnChange}>
                          <input
                            name='file'
                            placeholder='File'
                            {...getInputProps()}
                          />
                          <ArrowUpTrayIcon className='flex justify-center items-center h-12 w-12 my-0 mx-auto text-white/60' />
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
                      <div className='w-full my-0 relative bottom-4'>
                        <p
                          className={`${
                            files[0]?.size / 1000000 > 10
                              ? 'text-red-500'
                              : 'text-white/60'
                          }`}
                        >
                          El tamaño del archivo es {files[0]?.size / 1000000}MB
                        </p>
                      </div>
                    )}
                    <div className='flex flex-col justify-center items-start'>
                      <label className='inline-block w-full'>
                        <textarea
                          placeholder='Descripción'
                          className='input'
                          onChange={(e) => {
                            setDescriptionLength(e.target.value.length);
                            setDescription(e.target.value);
                          }}
                        />
                      </label>
                      <div className='flex flex-row justify-center items-center space-x-2'>
                        <p className='font-light text-xs text-[gray]'>
                          Largo mínimo 30 caracteres{' '}
                        </p>
                        {descriptionLength <= 30 ? (
                          <RxCrossCircled className='text-xs text-red-600' />
                        ) : (
                          <AiOutlineCheckCircle className='text-xs text-green-600' />
                        )}
                      </div>
                    </div>
                    <div className='flex flex-row space-x-2 justify-center items-start'>
                      <label className='inline-block w-full'>
                        <input
                          type='number'
                          placeholder='Precio'
                          className='input'
                          key={'price'}
                          autoComplete='off'
                          onChange={(e) => {
                            +e.target.value < 0
                              ? null
                              : setPrice(+e.target.value);
                          }}
                          min={0}
                          step={1}
                          value={price ? price : undefined}
                          onKeyDown={(e) =>
                            e.key === '-' ? e.preventDefault() : null
                          }
                        />
                      </label>
                      <label className='inline-block w-full'>
                        <input
                          type='text'
                          placeholder='Moneda'
                          className='input'
                          key={'price'}
                          autoComplete='off'
                          value={'$'}
                          readOnly
                        />
                      </label>
                    </div>

                    <label className='inline-block w-full'>
                      <input
                        type='password'
                        placeholder='Admin Password'
                        className='input'
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </label>
                  </div>
                  <button
                    onClick={(e) => e}
                    className='w-full bg-black/10 border border-white rounded-md transition duration-500 hover:bg-black py-3 font-semibold'
                  >
                    Crear Curso{' '}
                  </button>
                  <div className='text-[gray]'>
                    Volver al Inicio
                    <Link href={'/src/home'}>
                      <button
                        type='button'
                        className='text-white hover:underline ml-2'
                      >
                        {' '}
                        Volver
                      </button>
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </>
        )}
      </AdmimDashboardLayout>
  );
};


export default CreateCourse;
