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
import { routes } from '../../../constants/routes';
import { Radio, RadioGroup } from '@headlessui/react';
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import { payments } from '../../../constants/payments';

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
  const [priceAnual, setPriceAnual] = useState<number | null>(0);
  const [currencys, setCurrency] = useState<string>('USD');
  const [frequencyType, setFrequencyType] = useState('');
  const [frequency, setFrequency] = useState('');
  const [selected, setSelected] = useState(payments[1])

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
    let useStripe = selected.name == "stripe" ? true : false
    e.preventDefault();
    if (name.length < 5) {
      toast.error('El Nombre del plan debe tener almenos 5 caracteres');
      return;
    } else if (!frequency && selected.name != "stripe") {
      toast.error('Debe seleccionar una frecuencia de plan');
      return;
    } else if (descriptionLength < 30) {
      toast.error('Debe poner una descripcion de 30 caracteres minimo');
      return;
    } else if (!price) {
      toast.error('Debe poner un precio');
      return;
    } 
    else if (!priceAnual && selected.name == "stripe") {
      toast.error('Debe poner un precio');
      return;
    }
    else {
      handleSubmit(name, description, 'USD', price, selected.name == "stripe" ? priceAnual : 0, selected.name == "stripe" ? "" : frequency, useStripe);
    }
  };

  return (
    <div className='relative flex w-full min-h-screen flex-col bg-transparent md:items-center md:justify-center md:bg-transparent'>
      <div
        className={`h-full w-full relative flex flex-col md:items-center md:justify-center`}
      >
        {/* Header modernizado */}
        <div className='w-full flex pt-8 justify-between items-center mb-8 px-8'>
          <div>
            <h1 className='text-4xl md:text-5xl font-bold text-gray-900 mb-2 font-montserrat'>Crear un Plan de Membresía</h1>
            <p className='text-gray-600 text-lg font-montserrat'>Completa la información para crear tu nuevo plan</p>
          </div>
          <div className='flex items-center space-x-2 bg-white border border-gray-200 px-4 py-2 rounded-xl shadow-sm'>
            <div className='w-3 h-3 bg-[#4F7CCF] rounded-full' />
            <span className='text-gray-700 font-medium font-montserrat'>Paso único</span>
          </div>
        </div>
        <form
          className='relative space-y-6 rounded-2xl bg-white backdrop-blur-sm border border-gray-200 shadow-xl px-8 py-8 md:min-w-[40rem] md:px-12 md:py-10 font-montserrat mb-8'
          autoComplete='nope'
          onSubmit={handleSubmitLocal}
        >
          <div className='space-y-6'>
            <label className='flex flex-col space-y-2 w-full'>
              <p className='text-sm font-medium text-gray-700 font-montserrat'>Nombre del plan *</p>
              <input
                type='text'
                placeholder='Ej: Plan Básico'
                value={name}
                className='w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F7CCF]/20 focus:border-[#4F7CCF] transition-all duration-300 font-montserrat'
                onChange={(e) => setName(e.target.value)}
                required
              />
            </label>
            {selected.name != "stripe" && (
              <div className='space-y-2'>
                <p className='text-sm font-medium text-gray-700 font-montserrat'>Tipo de plan *</p>
                <Select
                  options={planFrequencys}
                  styles={colourStyles}
                  placeholder={frequencyType || 'Selecciona el tipo de plan'}
                  className='w-full sm:w-full'
                  value={frequencyType}
                  onChange={(e) => {
                    setFrequencyType(e.label);
                    setFrequency(e.value);
                  }}
                />
              </div>
            )}

            <div className='flex flex-col space-y-2 w-full'>
              <label className='inline-block w-full'>
                <p className='text-sm font-medium text-gray-700 font-montserrat mb-2'>Descripción *</p>
                <textarea
                  placeholder='Describe las características y beneficios del plan'
                  className='w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F7CCF]/20 focus:border-[#4F7CCF] transition-all duration-300 font-montserrat min-h-[120px]'
                  onChange={(e) => {
                    setDescriptionLength(e.target.value.length);
                    setDescription(e.target.value);
                  }}
                  value={description}
                  required
                />
              </label>
              <div className='flex flex-row justify-between items-center'>
                <p className='font-light text-xs text-gray-600 font-montserrat'>
                  Largo mínimo 30 caracteres{' '}
                </p>
                {descriptionLength <= 30 ? (
                  <RxCrossCircled className='text-xs text-red-600' />
                ) : (
                  <AiOutlineCheckCircle className='text-xs text-green-600' />
                )}
              </div>
            </div>
            <div className="w-full">
            <div className="w-full">
              <RadioGroup value={selected} onChange={setSelected} aria-label="Server size" className="space-y-2">
                {payments.map((plan) => (
                  <Radio
                    key={plan.name}
                    value={plan}
                    className="group font-montserrat relative flex w-full cursor-pointer rounded-lg bg-[#333333] py-4 px-5 text-white shadow-md transition focus:outline-none data-[focus]:outline-1 data-[focus]:outline-white data-[checked]:bg-[#232323]"
                  >
                    <div className="flex w-full items-center justify-between">
                      <div className="text-sm">
                        <p className="font-semibold text-white">{plan.name}</p>
                        <div className="flex gap-2 text-white/50">
                          <div>{plan.metodos}</div>
                          <div aria-hidden="true">&middot;</div>
                          {/* <div>{plan.disk}</div> */}
                        </div>
                      </div>
                      <CheckCircleIcon className="w-6 h-6 fill-white opacity-0 transition group-data-[checked]:opacity-100" />
                    </div>
                  </Radio>
                ))}
              </RadioGroup>
            </div>
          </div>
          {selected.name == "stripe" ? (
            <>
            <p>Selecciona el Precio de los planes</p>
            <div className='flex flex-row space-x-2 justify-center items-start !mt-3'>
              <label className='inline-block w-full'>
                <input
                  type='number'
                  placeholder='Precio mensual'
                  className='w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F7CCF]/20 focus:border-[#4F7CCF] transition-all duration-300 font-montserrat'
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
                  className='w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F7CCF]/20 focus:border-[#4F7CCF] transition-all duration-300 font-montserrat'
                  key={'price'}
                  autoComplete='off'
                  value={'US$'}
                  readOnly
                />
              </label>
            </div>
            <div className='flex flex-row space-x-2 justify-center items-start !mt-3'>
              <label className='inline-block w-full'>
                <input
                  type='number'
                  placeholder='Precio anual'
                  className='w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F7CCF]/20 focus:border-[#4F7CCF] transition-all duration-300 font-montserrat'
                  key={'priceAnual'}
                  autoComplete='off'
                  onChange={(e) => {
                    +e.target.value < 0 ? null : setPriceAnual(+e.target.value);
                  }}
                  min={0}
                  step={1}
                  value={priceAnual ? priceAnual : undefined}
                  onKeyDown={(e) => (e.key === '-' ? e.preventDefault() : null)}
                />
              </label>
              <label className='inline-block w-full'>
                <input
                  type='text'
                  placeholder='Moneda'
                  className='w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F7CCF]/20 focus:border-[#4F7CCF] transition-all duration-300 font-montserrat'
                  key={'priceAnual'}
                  autoComplete='off'
                  value={'US$'}
                  readOnly
                />
              </label>
            </div>
            </>
          ) : (
            <>
                        <p>Selecciona el Precio del plan</p>
            <div className='flex flex-row space-x-2 justify-center items-start !mt-3'>
              <label className='inline-block w-full'>
                <input
                  type='number'
                  placeholder='Precio'
                  className='w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F7CCF]/20 focus:border-[#4F7CCF] transition-all duration-300 font-montserrat'
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
                  className='w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F7CCF]/20 focus:border-[#4F7CCF] transition-all duration-300 font-montserrat'
                  key={'price'}
                  autoComplete='off'
                  value={'US$'}
                  readOnly
                />
              </label>
            </div>
            </>
          )}

          </div>
          <div className='flex justify-end space-x-4 pt-6 border-t border-gray-200'>
            <Link href={'/admin/memberships'}>
              <button
                type='button'
                className='px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300 font-montserrat border border-gray-200'
              >
                Cancelar
              </button>
            </Link>
            <button
              type='submit'
              onClick={(e) => handleSubmitLocal(e)}
              className='px-8 py-3 bg-gradient-to-r from-[#234C8C] via-[#4F7CCF] to-[#4F7CCF] text-white font-semibold rounded-xl hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-lg font-montserrat'
            >
              Crear Plan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePlanStepOne;
