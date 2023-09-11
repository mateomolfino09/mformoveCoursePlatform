import { ArrowUpTrayIcon, DocumentIcon, QuestionMarkCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone';
import {toast as t} from 'react-toastify'
import toast, { Toaster } from 'react-hot-toast';
import { AiOutlineCheckCircle, AiOutlineMinusCircle } from 'react-icons/ai';
import { MdOutlineClose } from 'react-icons/md';
import { RxCrossCircled } from 'react-icons/rx';
import AdminGuideModal from './AdminGuideModal';

interface Props {
    setDataStepOne: any
    step1ToStep2: any
    step1ToStep0: any
    descriptionReg: any, 
    descriptionLengthReg: any,
    priceReg: any, 
    modulesReg: any,
    cantidadClasesReg: any, 
    moduleNumbersReg: any, 
    classesNumbersReg: any, 
    breakpointTitlesReg: any, 
    currencysReg: any,
    showBreakpointsReg: any
}

const CreateCourseStepOne = ({setDataStepOne, step1ToStep2, step1ToStep0, descriptionReg, 
    descriptionLengthReg,
    priceReg, 
    modulesReg,
    cantidadClasesReg, 
    moduleNumbersReg, 
    classesNumbersReg, 
    breakpointTitlesReg, 
    showBreakpointsReg,
    currencysReg }: Props) => {
    const [description, setDescription] = useState(descriptionReg);
    const [descriptionLength, setDescriptionLength] = useState<number>(
        descriptionLengthReg
      );
    const [visibleModuleHelper, setVisibilityModuleHelper] = useState(false)
    const [price, setPrice] = useState<number | null>(priceReg);
    const [start, setStart] = useState<boolean>(true);
    const [cantidadClases, setCantidadClases] = useState<number | null>(cantidadClasesReg);
    const [modules, setModules] = useState<number | null>(modulesReg);
    const [moduleNumbers, setModuleNumbers] = useState<number[]>([...moduleNumbersReg]);
    const [classesNumbers, setClassesNumbers] = useState<number[]>([...classesNumbersReg]);
    const [breakpointTitles, setBreakpointTitles] = useState<string[]>([...breakpointTitlesReg]);
    const [showBreakpoints, setShowBreakpoints] = useState<boolean>(showBreakpointsReg);
    const [currencys, setCurrency] = useState<string>('$');

    const handleSubmit = (e: any) => {
        e.preventDefault()
        if (description.length < 30) {
            t.error('La descripción del curso debe tener almenos 30 caracteres');
            return;
          } else if (price == null) {
            t.error('Debe indicar el precio del curso');
            return;
          } else if (cantidadClases == null) {
            t.error('Debe indicar la cantidad de clases');
            return;
          } else if (modules == null) {
            t.error('Debe indicar la cantidad de módulos');
            return;
          } else if (modules == null) {
            t.error('Debe indicar la cantidad de módulos');
            return;
          } else if (moduleNumbers.length != modules) {
            t.error('Debe indicar los breakpoints de los módulos');
            return;
          } else if (breakpointTitles.length != modules) {
            t.error('Debe indicar los títulos de los módulos');
            return;
          }
      
        setDataStepOne(description, descriptionLength, price, modules, cantidadClases, moduleNumbers, classesNumbers, breakpointTitles, currencys)
        step1ToStep2()
    }

    const handleBack = () => {
        setDataStepOne(description, descriptionLength, price, modules, cantidadClases, moduleNumbers, classesNumbers, breakpointTitles, currencys)
        step1ToStep0()
    }

    const handleVisibleModuleHelper = () => {
        setVisibilityModuleHelper(!visibleModuleHelper)
    }

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
        {start && (
            <AdminGuideModal title='Selección de Módulos' 
            textArr={['Elige la cantidad de clases y la cantidad de módulos que tendrá el curso.',
            'Cada bola representa donde comienza el módulo, por defecto siempre habrá uno que empiece en la clase 1.',
            'Para des seleccionar un comienzo de módulo deberás darle un click, luego podrás reubicar ese comienzo.']}
            visible={visibleModuleHelper}
            handleVisiblity={handleVisibleModuleHelper}/>
            
        )}
            <div
            className={`h-full w-full relative flex flex-col md:items-center md:justify-center`}
            >
            {/* Logo position */}
            <div className='w-full flex pt-12 justify-between items-center'>
                <h1 className='text-4xl font-light '>
                    Agregar un Curso
                </h1>
                <p>Paso 2</p>
            </div>
            <form
                className='relative mt-16 space-y-4 rounded px-8 md:min-w-[40rem] md:px-14'
                autoComplete='nope'
                onSubmit={handleSubmit}
            >
                <div className='space-y-8'>
                <p>Elige la cantidad de clases y módulos que quieres asociar</p>

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
                                <div className='absolute right-16 top-28 text-start h-full'>
                                    <QuestionMarkCircleIcon className='w-6 ' onClick={handleVisibleModuleHelper}/>
                                </div>

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
                                            value={breakpointTitles[moduleNumbers.indexOf(number)]}
                                        />
                                        </label>
                                    </div>
                                    ))}
                                </>
                                )}
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
                <button
                onClick={(e) => handleSubmit(e)}
                className='w-full bg-black/10 border border-white rounded-md transition duration-500 hover:bg-black py-3 font-semibold'
                >
                Siguiente{' '}
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
                </div>
            </form>
            </div>
  </div>
  )
}

export default CreateCourseStepOne