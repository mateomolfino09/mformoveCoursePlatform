import { ArrowUpTrayIcon, DocumentIcon, QuestionMarkCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone';
import {toast as t} from 'react-toastify'
import toast, { Toaster } from 'react-hot-toast';
import { AiOutlineCheckCircle, AiOutlineMinusCircle } from 'react-icons/ai';
import { MdOutlineClose } from 'react-icons/md';
import { RxCrossCircled } from 'react-icons/rx';
import AdminGuideModal from './../../AdminGuideModal';
import { useAppSelector } from '../../../redux/hooks';
import { AppDispatch } from '../../../redux/store';
import { useDispatch } from 'react-redux';
import Select, { StylesConfig } from 'react-select';
import { levels } from '../../../constants/classLevels';
import { addStepTwo } from '../../../redux/features/createClassSlice';

interface Props {
    step1ToStep0: any
    handleSubmitClass: any
}

const CreateClassStepTwo = ({ step1ToStep0, handleSubmitClass
     }: Props) => {
    const dispatch = useDispatch<AppDispatch>()
    const createClass = useAppSelector(
    (state) => state.classesModalReducer.value
    );
    const { description: descriptionReg, descriptionLength: descriptionLengthReg, level: levelReg, videoId: videoIdOr } = createClass

    const [description, setDescription] = useState(descriptionReg);
    const [descriptionLength, setDescriptionLength] = useState<number>(
        descriptionLengthReg ? descriptionLengthReg : 0
        )
    const [level, setLevel] = useState(levelReg);
    const [levelName, setLevelName] = useState("");
    const [videoId, setVideoId] = useState(videoIdOr);

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

    const handleSubmit = (e: any) => {
        e.preventDefault()
        if (description.length < 30) {
            t.error('La descripción del curso debe tener almenos 30 caracteres');
            return;
          } else if (level == null) {
            t.error('Debe indicar el precio del curso');
            return;
          } 
        dispatch(addStepTwo({ description, descriptionLength, level, videoId }))
        handleSubmitClass()
    }

    const handleBack = () => {
        dispatch(addStepTwo({ description, descriptionLength, level, videoId }))        
        step1ToStep0()
    }

      useEffect(() => {
        notify('Agregado a la Lista', true, false);
        console.log('hola')
      }, [])

        const notify = (message: String, agregado: boolean, like: boolean) =>
        toast.custom( 
            (t) => (
            <div
                className={`${
                like ? 'notificationWrapperLike' : 'notificationWrapper'
                } ${t.visible ? 'top-0' : '-top-96'}`}
            >
                <div className={'iconWrapper'}>
                {agregado ? <AiOutlineCheckCircle /> : <AiOutlineMinusCircle />}
                </div>
                <div className={`contentWrapper`}>
                <h1>{message}</h1>
                {like ? (
                    <p>Le has dado {message} a este curso</p>
                ) : (
                    <p>Este curso ha sido {message} exitosamente</p>
                )}
                </div>
                <div className={'closeIcon'} onClick={() => toast.dismiss(t.id)}>
                <MdOutlineClose />
                </div>
            </div>
            ),
            { id: 'unique-notification', position: 'top-center' }
        );

  return (
    <div className='relative flex w-full items-start flex-col bg-transparent md:items-center md:justify-center md:bg-transparent'>
            <div
            className={`h-full w-full relative flex flex-col md:items-center md:justify-center`}
            >
            {/* Logo position */}
            <div className='w-full flex pt-12 justify-between items-center'>
                <h1 className='text-4xl font-light '>
                    Agregar una Clase
                </h1>
                <p>Paso 2</p>
            </div>
            <form
                className='relative mt-16 space-y-12 rounded px-8 md:min-w-[40rem] md:px-14'
                autoComplete='nope'
                onSubmit={handleSubmit}
            >
                <div className='space-y-4'>
                <p>Elige el nivel de la clase</p>
                <Select
                options={levels}
                styles={colourStyles}
                placeholder={levelName || 'Nivel de clase'}
                className='w-full sm:w-full'
                value={levelName}
                onChange={(e) => {
                 setLevelName(e.label)
                 setLevel(e.value)
                }}
            />
                </div>

                <label className='flex flex-col space-y-3 w-full'>
                    <p>Introduce el Id del video</p>
                    <input
                    type='text'
                    placeholder='ID Del video'
                    className='input'
                    value={videoId ? videoId : ""}
                    onChange={(e) => setVideoId(e.target.value)}
                    />
                </label>

                <div className='flex flex-col justify-center items-start space-y-4'>
                <p>Escribe una descripción para la clase</p>

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
                <button
                onClick={(e) => handleSubmit(e)}
                className='w-full bg-black/10 border border-white rounded-md transition duration-500 hover:bg-black py-3 font-semibold'
                >
                Crear{' '}
                </button>
                <div className='text-[gray]'>
                Volver al Inicio
                    <button
                    type='button'
                    className='text-white hover:underline ml-2'
                    onClick={handleBack}
                    >
                    {' '}
                    Volver
                    </button>
                </div>
            </form>
            </div>
  </div>
  )
}

export default CreateClassStepTwo