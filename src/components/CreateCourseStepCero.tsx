import { ArrowUpTrayIcon, DocumentIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import React, { useState } from 'react'
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';

interface Props {
    setDataStepCero: any
    step0ToStep1: any
    nameOr: any
    playlistIdOr: any
    filesOr: any[]
}

const CreateCourseStepCero = ({setDataStepCero, step0ToStep1, nameOr, playlistIdOr, filesOr}: Props) => {
    const [name, setName] = useState(nameOr);
    const [playlistId, setPlaylistId] = useState(playlistIdOr);
    const [files, setFiles] = useState<any>([...filesOr]);
    const [image, setImage] = useState<string | ArrayBuffer | null | undefined>(
        null
      );

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


        function handleOnChange(changeEvent: any) {
            const reader = new FileReader();

            reader.onload = function (onLoadEvent) {
            setImage(onLoadEvent.target?.result);
            };

            reader.readAsDataURL(changeEvent.target.files[0]);
        }

    const handleSubmit = (e: any) => {
      e.preventDefault()
      if (name.length < 5) {
        toast.error('El Nombre del curso debe tener almenos 5 caracteres');
        return;
      } 
      else if (playlistId.length <= 5) {
        toast.error('Debe poner una Playlist Id para el curso');
        return;
      } else if (files.length === 0) {
        toast.error('Debe poner una imágen para el curso');
        return;
      }
      else {
        setDataStepCero(name, playlistId, files)
        step0ToStep1()
      }
    }

  return (
    <div className='relative flex w-full min-h-screen flex-col bg-transparent md:items-center md:justify-center md:bg-transparent'>
    <div
      className={`h-full w-full relative flex flex-col md:items-center md:justify-center`}
    >
      {/* Logo position */}
      <div className='w-full flex pt-12 justify-between items-center'>
        <h1 className='text-4xl font-light '>
            Agregar un Curso
        </h1>
        <p>Paso 1</p>
      </div>
      <form
        className='relative mt-16 space-y-4 rounded px-8 md:min-w-[40rem] md:px-14'
        autoComplete='nope'
        onSubmit={handleSubmit}
      >
        <div className='space-y-8'>
          <label className='flex flex-col space-y-3 w-full'>
          <p>Elige un nombre para el curso</p>

            <input
              type='nombre'
              placeholder='Nombre'
              value={name}
              className='input'
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className='flex flex-col space-y-3 w-full'>
            <p>Introduce el Id de la Playlist que vas a utilizar</p>
            <input
              type='playlistId'
              placeholder='Playlist Id'
              className='input'
              value={playlistId}
              onChange={(e) => setPlaylistId(e.target.value)}
            />
          </label>
          <p>Selecciona la Portada para el curso</p>

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
                className='grid place-items-center input h-80 border-dashed border-2 border-white/80 !mt-3'
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



        </div>
        <button
          onClick={(e) => handleSubmit(e)}
          className='w-full bg-black/10 border border-white rounded-md transition duration-500 hover:bg-black py-3 font-semibold'
        >
          Siguiente{' '}
        </button>
        <div className='text-[gray]'>
          Volver al Inicio
          <Link href={'/home'}>
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
  )
}

export default CreateCourseStepCero