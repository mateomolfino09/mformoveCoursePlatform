'use client'
import { ClassTypes } from '../../../../typings';
import { planFrequencys } from '../../../constants/planFrequency';
import { addStepOne } from '../../../redux/features/createClassSlice';
import { useAppSelector } from '../../../redux/hooks';
import { AppDispatch } from '../../../redux/store';
import { ArrowUpTrayIcon, DocumentIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { AiOutlineCheckCircle } from 'react-icons/ai';
import { RxCrossCircled } from 'react-icons/rx';
import { useDispatch } from 'react-redux';
import Select, { StylesConfig } from 'react-select';
import { toast } from 'react-toastify';

interface Props {
  handleSubmit: any;
}

const CreatePlanStepOne = ({ handleSubmit }: Props) => {
  const [image, setImage] = useState<string | ArrayBuffer | null | undefined>(
    null
  );
  const dispatch = useDispatch<AppDispatch>();
  const createClassReducer = useAppSelector(
    (state: any) => state.classesModalReducer.value
  );
  const { name: nameOr, typeId: typeIdOr, files: filesOr } = createClassReducer;
  const [name, setName] = useState(nameOr);
  const [typeId, setTypeId] = useState(typeIdOr);
  const [typeName, setTypeName] = useState('');
  const [files, setFiles] = useState<any>(filesOr ? [...filesOr] : null);
  const [description, setDescription] = useState('');
  const [descriptionLength, setDescriptionLength] = useState<number>(0);
  const [price, setPrice] = useState<number | null>(0);
  const [currencys, setCurrency] = useState<string>('USD');
  const [frequencyType, setFrequencyType] = useState('');
  const [frequency, setFrequency] = useState('');

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
    } else if (!frequency) {
      toast.error('Debe seleccionar una frecuencia de plan');
      return;
    } else if (descriptionLength < 30) {
      toast.error('Debe poner una descripcion de 30 caracteres minimo');
      return;
    } else if (!price) {
      toast.error('Debe poner un precio');
      return;
    } else {
      handleSubmit(name, description, 'USD', price, frequency);
    }
  };

  return (
    <div className='relative flex w-full min-h-screen flex-col bg-transparent md:items-center md:justify-center md:bg-transparent'>
      <div
        className={`h-full w-full relative flex flex-col md:items-center md:justify-center`}
      >
        {/* Logo position */}
        <div className='w-full flex pt-12 justify-between items-center'>
          <h1 className='text-4xl font-light '>Crear un Plan</h1>
          <p>Paso único</p>
        </div>
        <form
          className='relative mt-16 space-y-4 rounded px-8 md:min-w-[40rem] md:px-14'
          autoComplete='nope'
          onSubmit={handleSubmit}
        >
          <div className='space-y-8'>
            <label className='flex flex-col space-y-3 w-full'>
              <p>Elige un nombre para el plan</p>

              <input
                type='nombre'
                placeholder='Nombre'
                value={name}
                className='input'
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <div className='space-y-4'>
              <p>Elige el tipo de plan</p>
              <Select
                options={planFrequencys}
                styles={colourStyles}
                placeholder={frequencyType || 'Nivel de clase'}
                className='w-full sm:w-full'
                value={frequencyType}
                onChange={(e) => {
                  setFrequencyType(e.label);
                  setFrequency(e.value);
                }}
              />
            </div>
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
                  Largo mínimo 30 caracteres{' '}
                </p>
                {descriptionLength <= 30 ? (
                  <RxCrossCircled className='text-xs text-red-600' />
                ) : (
                  <AiOutlineCheckCircle className='text-xs text-green-600' />
                )}
              </div>
            </div>
            <p>Selecciona el Precio del curso</p>
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

export default CreatePlanStepOne;
