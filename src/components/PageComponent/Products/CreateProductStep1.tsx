'use client';

import AdmimDashboardLayout from '../../AdmimDashboardLayout';
import { ArrowUpTrayIcon, DocumentIcon } from '@heroicons/react/24/solid';
import { Select } from '@mui/material';
import Link from 'next/link';
import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { AiOutlineCheckCircle } from 'react-icons/ai';
import { RxCrossCircled } from 'react-icons/rx';
import { StylesConfig } from 'react-select';
import { toast } from 'react-toastify';

interface Props {
  handleSubmit: any;
}

const CreateProductStep1 = ({ handleSubmit }: Props) => {
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [descriptionLength, setDescriptionLength] = useState<number>(0);
  const [price, setPrice] = useState<number>(10);
  const [productVimeoId, setProductVimeoId] = useState<string>('');
  const [currency, setCurrency] = useState<string>('$');
  const [paymentLink, setPaymentLink] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [courseType, setCourseType] = useState<string>('');
  const [diplomaUrl, setDiplomaUrl] = useState<string>('');
  const [productType, setProductType] = useState<string>('curso');

  /* --------------------------CAMPOS NUEVOS--------------------------- */
  const [releaseDate, setReleaseDate] = useState<Date | null>(null);
  const [isFree, setIsFree] = useState<boolean>(true);
  const [inPerson, setInPerson] = useState<boolean>(true);
  const [isMasterClass, setIsMasterClass] = useState<boolean>(true);



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

  const handleSubmitLocal = (e: any) => {
    e.preventDefault();
    if (name.length < 5) {
      toast.error('El Nombre del plan debe tener almenos 5 caracteres');
      return;
    } else if (descriptionLength < 30) {
      toast.error('Debe poner una descripcion de 30 caracteres minimo');
      return;
    } else if (!price) {
      toast.error('Debe poner un precio');
      return;
    } else {
      handleSubmit(
        name,
        description,
        productVimeoId,
        productType,
        'USD',
        price,
        portraitImageArray,
        diplomaImageArray,
        releaseDate,
        isFree,
        inPerson
      );
    }
  };

  const [files, setFiles] = useState<any>([] ? [] : null);
  const [portraitImageArray, setPortraitImage] = useState<any>([] ? [] : null);
  const [diplomaImageArray, setDiplomaImage] = useState<any>([] ? [] : null);

  function handleOnChangePortraitPicture(changeEvent: any) {
    const reader = new FileReader();

    reader.onload = function (onLoadEvent) {
      setPortraitImage(onLoadEvent.target?.result);
    };

    reader.readAsDataURL(changeEvent.target.files[0]);
  }

  function handleOnChangeDiplomaPicture(changeEvent: any) {
    const reader = new FileReader();

    reader.onload = function (onLoadEvent) {
      setDiplomaImage(onLoadEvent.target?.result);
    };

    reader.readAsDataURL(changeEvent.target.files[0]);
  }

  const { getRootProps, getInputProps }: any = useDropzone({
    onDrop: (acceptedFiles: any) => {
      setPortraitImage(
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
  const {
    getRootProps: diplomaRootProps,
    getInputProps: diplomaInputprops
  }: any = useDropzone({
    onDrop: (acceptedFiles: any) => {
      setDiplomaImage(
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

  const portraitImageShow = portraitImageArray?.map((file: any) => (
    <img
      src={file.preview}
      key={file.name}
      alt='image'
      className='cursor-pointer object-cover w-full h-full absolute'
    />
  ));

  const diplomaImageShow = diplomaImageArray?.map((file: any) => (
    <img
      src={file.preview}
      key={file.name}
      alt='image'
      className='cursor-pointer object-cover w-full h-full absolute'
    />
  ));



  return (
    <div className='relative flex w-full min-h-screen flex-col bg-transparent md:items-center md:justify-center md:bg-transparent'>
      <div
        className={`h-full w-full relative flex flex-col md:items-center md:justify-center`}
      >
        {/* Logo position */}
        <div className='w-full flex pt-12 justify-between items-center'>
          <h1 className='text-4xl font-light '>Crear un Productos</h1>
          <p>Paso único</p>
        </div>
        <form
          className='relative mt-16 space-y-4 rounded px-8 md:min-w-[40rem] md:px-14'
          autoComplete='nope'
          //  onSubmit={handleSubmi()}
        >
          <div className='space-y-8'>
            <label className='flex flex-col space-y-3 w-full'>
              <p>Elige un nombre para el plan</p>

              <input
                type='name'
                placeholder='Nombre'
                value={name}
                className='input'
                onChange={(e) => setName(e.target.value)}
              />

              <p>Inserta Id de producto</p>
              <input
                type='number'
                placeholder='Numero Producto'
                value={productVimeoId ? productVimeoId : undefined}
                className='input'
                onChange={(e) => setProductVimeoId(e.target.value)}
              />
            </label>

            <select
              className='input'
              onChange={(e) => setProductType(e.target.value)}
            >
              <option id='1' value='curso'>
                Curso
              </option>
              <option id='2' value='workshop'>
                Workshop
              </option>
            </select>

            <div className='flex flex-col justify-center items-start'>
              <label className='inline-block w-full'>
                <textarea
                  placeholder='Descripción'
                  className='input'
                  onChange={(e) => {
                    setDescriptionLength(e.target.value.length);
                    setDescription(e.target.value);
                  }}
                  value={description}
                />
              </label>
              <div className='flex flex-row justify-center items-center space-x-2'>
                <p className='font-light text-xs text-[gray]'>
                  Largo mínimo 20 caracteres{' '}
                </p>
                {descriptionLength <= 20 ? (
                  <RxCrossCircled className='text-xs text-red-600' />
                ) : (
                  <AiOutlineCheckCircle className='text-xs text-green-600' />
                )}
              </div>
            </div>

            <p>Selecciona el Precio del Producto</p>
            <div className='flex flex-row space-x-2 justify-center items-start !mt-3'>
              <label className='inline-block w-full'>
                <input
                  type='number'
                  placeholder='Precio'
                  className='input'
                  key={'price'}
                  autoComplete='off'
                  onChange={(e) => {
                    +e.target.value < 0 ? null : setPrice(+e.target.value);
                  }}
                  min={0}
                  step={1}
                  value={price ? price : undefined}
                  onKeyDown={(e) => (e.key === '-' ? e.preventDefault() : null)}
                />
              </label>
              <label className='inline-block w-full'>
                <input
                  type='text'
                  placeholder='Moneda'
                  className='input'
                  key={'price'}
                  autoComplete='off'
                  value={'US$'}
                  readOnly
                />
              </label>
            </div>
          </div>
          <p>Selecciona la Portada para el Producto</p>
          {portraitImageArray.length > 0 ? (
            <>
              <div
                className='grid place-items-center input h-80 border-dashed border-2 border-white/80 relative'
                {...getRootProps()}
              >
                <label
                  className='w-full'
                  onChange={handleOnChangePortraitPicture}
                >
                  <input name='file' placeholder='File' {...getInputProps()} />
                  <DocumentIcon className='flex justify-center items-center h-12 w-12 my-0 mx-auto text-white/60 mb-8' />
                  {/* {files.map((f: File) => <p className="flex justify-center items-center my-2 mx-auto text-white/80">{f.name}</p> )} */}
                </label>
                {portraitImageShow}
              </div>
            </>
          ) : (
            <div
              className='grid place-items-center input h-80 border-dashed border-2 border-white/80 !mt-3'
              {...getRootProps()}
            >
              <label
                className='w-full'
                onChange={handleOnChangePortraitPicture}
              >
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
          {/* ------------------------------------------------- */}
          <p>Selecciona el Diploma para el Producto</p>
          {diplomaImageArray.length ? (
            <>
              <div
                className='grid place-items-center input h-80 border-dashed border-2 border-white/80 relative'
                {...diplomaRootProps()}
              >
                <label
                  className='w-full'
                  onChange={handleOnChangeDiplomaPicture}
                >
                  <input
                    name='file'
                    placeholder='File'
                    {...diplomaInputprops()}
                  />
                  <DocumentIcon className='flex justify-center items-center h-12 w-12 my-0 mx-auto text-white/60 mb-8' />
                  {/* {files.map((f: File) => <p className="flex justify-center items-center my-2 mx-auto text-white/80">{f.name}</p> )} */}
                </label>
                {diplomaImageShow}
              </div>
            </>
          ) : (
            <div
              className='grid place-items-center input h-80 border-dashed border-2 border-white/80 !mt-3'
              {...diplomaRootProps()}
            >
              <label className='w-full' onChange={handleOnChangeDiplomaPicture}>
                <input
                  name='file'
                  placeholder='File'
                  {...diplomaInputprops()}
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
          {/* --------------------------CAMPOS NUEVOS--------------------------- */}
          Seleccione día de releases
          <input
            type='date'
            id='start'
            name='releaseDate'
            value={releaseDate ? releaseDate.toISOString().split('T')[0] : ''}
            className='input'
            onChange={(e) => setReleaseDate(new Date(e.target.value))}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span>Gratis?</span>
              <input
                className='input'
                type='checkbox'
                checked={isFree}
                onChange={(e) => setIsFree(e.target.checked)}
                style={{ marginLeft: '8px' }}
              />
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginTop: '8px'
              }}
            >
              <span>Presencial?</span>
              <input
                className='input'
                type='checkbox'
                checked={inPerson}
                onChange={(e) => setInPerson(e.target.checked)}
                style={{ marginLeft: '8px' }}
              />
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginTop: '8px'
              }}
            >
              <span>MasterClass?</span>
              <input
                className='input'
                type='checkbox'
                checked={isMasterClass}
                onChange={(e) => setIsMasterClass(e.target.checked)}
                style={{ marginLeft: '8px' }}
              />
            </div>


          </div>
          <button
            onClick={(e) => handleSubmitLocal(e)}
            className='w-full bg-black/10 border border-white rounded-md transition duration-500 hover:bg-black py-3 font-semibold'
          >
            Crear{' '}
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

export default CreateProductStep1;
