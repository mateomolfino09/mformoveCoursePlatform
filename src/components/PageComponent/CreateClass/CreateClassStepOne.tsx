import { ClassTypes } from '../../../../typings';
import { addStepOne } from '../../../redux/features/createClassSlice';
import { useAppSelector } from '../../../redux/hooks';
import { AppDispatch } from '../../../redux/store';
import { ArrowUpTrayIcon, DocumentIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useDispatch } from 'react-redux';
import Select, { StylesConfig } from 'react-select';
import { toast } from 'react-toastify';

interface Props {
  step0ToStep1: any;
  types: ClassTypes[];
}

const CreateClassStepOne = ({ step0ToStep1, types }: Props) => {
  const [image, setImage] = useState<string | ArrayBuffer | null | undefined>(
    null
  );
  const dispatch = useDispatch<AppDispatch>();
  const createClassReducer = useAppSelector(
    (state) => state.classesModalReducer.value
  );
  const { name: nameOr, typeId: typeIdOr, files: filesOr } = createClassReducer;
  const [name, setName] = useState(nameOr);
  const [typeId, setTypeId] = useState(typeIdOr);
  const [typeName, setTypeName] = useState('');
  const [files, setFiles] = useState<any>(filesOr ? [...filesOr] : null);

  const colourStyles: StylesConfig<any> = {
    control: (styles) => ({
      ...styles,
      backgroundColor: '#333',
      height: 55,
      borderRadius: 6,
      padding: 0
    }),
    option: (styles, { data, isDisabled, isFocused, isSelected }) => {
      return { ...styles, color: '#808080' };
    },
    input: (styles) => ({ ...styles, backgroundColor: '', color: '#fff' }),
    placeholder: (styles) => ({ ...styles, color: '#fff' }),
    singleValue: (styles, { data }) => ({ ...styles, color: '#808080' })
  };

  const mapTypes = types[0].values.map((v) => {
    return {
      value: v.value,
      label: v.label
    };
  });

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

  const images = files?.map((file: any) => (
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
    e.preventDefault();
    if (name.length < 5) {
      toast.error('El Nombre de la clase debe tener almenos 5 caracteres');
      return;
    } else if (!typeId) {
      toast.error('Debe poner una tipo de clase');
      return;
    } else if (files.length === 0) {
      toast.error('Debe poner una imágen para la clase');
      return;
    } else {
      dispatch(addStepOne({ name, typeId: typeId, files }));
      step0ToStep1();
    }
  };

  return (
    <div className='relative flex w-full min-h-screen flex-col bg-transparent md:items-center md:justify-center md:bg-transparent'>
      <div
        className={`h-full w-full relative flex flex-col md:items-center md:justify-center`}
      >
        {/* Logo position */}
        <div className='w-full flex pt-12 justify-between items-center'>
          <h1 className='text-4xl font-light '>Agregar una Clase</h1>
          <p>Paso 1</p>
        </div>
        <form
          className='relative mt-16 space-y-4 rounded px-8 md:min-w-[40rem] md:px-14'
          autoComplete='nope'
          onSubmit={handleSubmit}
        >
          <div className='space-y-8'>
            <label className='flex flex-col space-y-3 w-full'>
              <p>Elige un nombre para la clase</p>

              <input
                type='nombre'
                placeholder='Nombre'
                value={name}
                className='input'
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label className='flex flex-col space-y-3 w-full'>
              <p>Elige el tipo de Clase</p>
              <Select
                options={mapTypes}
                styles={colourStyles}
                placeholder={typeName || 'Tipo de Clase'}
                className='w-full sm:w-full'
                value={typeName}
                onChange={(e) => {
                  console.log(e);
                  setTypeName(e.label);
                  setTypeId(e.value);
                }}
              />
            </label>
            <p>Selecciona la Portada para la clase</p>

            {files?.length != 0 ? (
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
                  <input name='file' placeholder='File' {...getInputProps()} />
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
            {files?.length > 0 && (
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
              <button type='button' className='text-white hover:underline ml-2'>
                {' '}
                Volver
              </button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateClassStepOne;
