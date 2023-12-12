import { ArrowUpTrayIcon, DocumentIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone';
import AddQuestionModal from './AddQuestionModal';
import { courseTypeConst } from '../constants/courseType';
import { toast } from 'react-toastify';
import { useAppSelector } from '../redux/hooks';
import { AppDispatch } from '../redux/store';
import { useDispatch } from 'react-redux';
import { addStepThree } from '../redux/features/createCoursesSlice';

interface Props {
  step2ToStep1: any
  createCourse: any

}

const CreateCourseStepTwo = ({step2ToStep1, createCourse }: Props) => {
    const [image, setImage] = useState<string | ArrayBuffer | null | undefined>(
        null
      );
      const dispatch = useDispatch<AppDispatch>()
      const createCourseSlice = useAppSelector(
        (state) => state.createCourseReducer.value
        );
        const { courseType: courseTypeReg} = createCourseSlice
    const [courseType, setCourseType] = useState<string | null>(
      courseTypeReg 
      );
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [diploma, setDiploma] = useState<any>([]);
    const [questions, setQuestions] = useState<any>(null);

    const createCourseReducer = useAppSelector(
      (state) => state.createCourseReducer.value
    );
    
  console.log(createCourseReducer)
    useEffect(() => {
      dispatch(addStepThree({ questions, diploma, courseType }))
    }, [questions, diploma, courseType])


    function handleOnChange(changeEvent: any) {
        const all: any = document.getElementsByName('lang');
        for (let index = 0; index < all.length; index++) {
          if(index != changeEvent.target.value) all[index].checked = false
          all[changeEvent.target.value].checked = true
          
        }

        setCourseType(courseTypeConst[changeEvent.target.value])
    }

    const handleSetQuestions = (quest: any) => {
      const arr = Array(Object.keys(quest).length).fill(0).map(row => new Array(5).fill(''))
      for (let index = 0; index < Object.keys(quest).length; index++) {
        const element: any =  Object.values(quest)[index];
        arr[index][0] = element.pregunta
        arr[index][1] = element.respuesta1
        arr[index][2] = element.respuesta2
        arr[index][3] = element.respuesta3
        arr[index][4] = element.respuesta4
        arr[index][5] = element.respuestacorrecta
        
      }
      console.log(arr)
      setQuestions(arr)
    }

    const handleModal = () => {
      setOpenModal(!openModal)
    }


    const handleBack = () => {
      dispatch(addStepThree({ questions, diploma, courseType }))
      step2ToStep1()
  }

    const handleSubmit = (e: any) => {
      e.preventDefault()

      console.log(courseType)
      
      if(courseType === courseTypeConst[0]) {
        dispatch(addStepThree({ questions: null, diploma: null, courseType }))
      }
      else if(courseType === courseTypeConst[1]) {
        diploma.length === 0 
        ? toast.error('Debe elegir un diploma para el curso')
        : dispatch(addStepThree({ questions: null, diploma, courseType }))


      }
      else if(courseType === courseTypeConst[2]) {
        console.log(questions)
        diploma.length === 0 
        ? toast.error('Debe elegir un diploma para el curso')
        : questions ? dispatch(addStepThree({ questions, diploma, courseType }))
        : toast.error('Debe seleccionar las preguntas para el curso') 
      }
      else {
        toast.error('Hubo un error al guardar los datos.')
      }

      createCourse(e)
    }


  const { getRootProps, getInputProps }: any = useDropzone({
      onDrop: (acceptedFiles: any) => {
        setDiploma(
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

    const images = diploma.map((file: any) => (
      <img
        src={file.preview}
        key={file.name}
        alt='image'
        className='cursor-pointer object-cover w-full h-full absolute'
      />
    ));


      function handleOnChangeFile(changeEvent: any) {
          const reader = new FileReader();

          reader.onload = function (onLoadEvent) {
          setImage(onLoadEvent.target?.result);
          };

          reader.readAsDataURL(changeEvent.target.files[0]);
      }


  return (
    <div className='relative flex w-full min-h-screen flex-col bg-transparent md:items-center md:justify-start md:bg-transparent'>
    <div
      className={`h-full w-full relative flex flex-col md:items-center md:justify-center`}
    >
      {/* Logo position */}
      <div className='w-full flex pt-12 justify-between items-center'>
        <h1 className='text-4xl font-light '>
            Agregar un Curso
        </h1>
        <p>Paso 3</p>
      </div>
      <form
        className='relative mt-16 space-y-4 rounded px-8 md:min-w-[40rem] md:px-14'
        autoComplete='nope'
        onSubmit={handleSubmit}
      >
        <div className='space-y-8'>
          <label className='flex flex-col space-y-3 w-full'>
          <h3 className="mb-5 text-lg font-medium text-gray-900 dark:text-white">Define el tipo de curso que quieres crear</h3>
          <ul className="grid w-full gap-6 md:grid-cols-3">
              <li>
                  <input type="checkbox" id="react-option" value={0} className="hidden peer" onClick={handleOnChange} name={'lang'} />
                  <label htmlFor="react-option" className="inline-flex items-center justify-between w-full p-5 text-gray-500 bg-white border-2 border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 peer-checked:border-blue-600 hover:text-gray-600 dark:peer-checked:text-gray-300 peer-checked:text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:bg-gray-900 dark:hover:bg-gray-800 md:h-48 lg:h-36">                           
                      <div className="block">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="mb-2 text-gray-400 w-7 h-7">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
                    </svg>

                          <div className="w-full text-lg font-semibold">Home Course</div>
                          <div className="w-full text-sm">Curso sin prueba final y diploma.</div>
                      </div>
                  </label>
              </li>
              <li>
                  <input type="checkbox" id="flowbite-option" value={1} className="hidden peer " onClick={handleOnChange} name={'lang'}/>
                  <label htmlFor="flowbite-option" className="inline-flex items-center justify-between w-full p-5 text-gray-500 bg-white border-2 border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 peer-checked:border-blue-600 hover:text-gray-600 dark:peer-checked:text-gray-300 peer-checked:text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:bg-gray-900 dark:hover:bg-gray-800 md:h-48 lg:h-36">
                      <div className="block">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="mb-2 text-gray-400 w-7 h-7">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                          </svg>
  
                          <div className="w-full text-lg font-semibold">Academic</div>
                          <div className="w-full text-sm">Curso sin prueba final con diploma.</div>
                      </div>
                  </label>
              </li>
              <li>
                  <input type="checkbox" id="angular-option" value={2} className="hidden peer" onClick={handleOnChange} name={'lang'}/>
                  <label htmlFor="angular-option" className="inline-flex items-center justify-between w-full p-5 text-gray-500 bg-white border-2 border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 peer-checked:border-blue-600 hover:text-gray-600 dark:peer-checked:text-gray-300 peer-checked:text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:bg-gray-900 dark:hover:bg-gray-800 md:h-48 lg:h-36">
                      <div className="block">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="mb-2 text-gray-400 w-7 h-7">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                      </svg>


                          <div className="w-full text-lg font-semibold">Academic Tested</div>
                          <div className="w-full text-sm">Curso con prueba final y diploma.</div>
                      </div>
                  </label>
              </li>
          </ul>
          </label>
  
        </div>
        <div>
          {courseType === '' && (
            <>
              <p>Debe seleccionar un tipo de curso para continuar</p>
            </>
          )}
          {courseType === 'AC' && (
            <>
                    {diploma.length != 0 ? (
                        <>
                    
                          <div
                            className='grid place-items-center !bg-gray-800 h-80 border-dashed border-2 border-white/80 relative'
                            {...getRootProps()}
                          >
                            <label className='w-full' onChange={handleOnChangeFile}>
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
                className='grid place-items-center bg-gray-800 h-80 border-dashed border-2 border-white/80 !mt-3'
                {...getRootProps()}
            >
                            

                <label className='w-full' onChange={handleOnChangeFile}>
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
            {diploma.length > 0 && (
            <div className='w-full my-0 relative -bottom-2'>
                <p
                className={`${
                  diploma[0]?.size / 1000000 > 10
                    ? 'text-red-500'
                    : 'text-white/60'
                }`}
                >
                El tamaño del archivo es {diploma[0]?.size / 1000000}MB
                </p>
            </div>
            )}
            </>
          )}
          {courseType === 'ATC' && (
            <>
                        {diploma.length != 0 ? (
                        <>
                    
                          <div
                            className='grid place-items-center input h-80 border-dashed border-2 border-white/80 relative'
                            {...getRootProps()}
                          >
                            <label className='w-full' onChange={handleOnChangeFile}>
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
                className='grid place-items-center bg-gray-800 h-80 border-dashed border-2 border-white/80 !mt-3'
                {...getRootProps()}
            >
                            

                <label className='w-full' onChange={handleOnChangeFile}>
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
            {diploma.length > 0 && (
            <div className='w-full my-0 relative -bottom-2'>
                <p
                className={`${
                  diploma[0]?.size / 1000000 > 10
                    ? 'text-red-500'
                    : 'text-white/60'
                }`}
                >
                El tamaño del archivo es {diploma[0]?.size / 1000000}MB
                </p>
            </div>
            )}
            {!questions || Object.keys(questions).length === 0 ? (
              <button
                type='button'
                onClick={handleModal}
                className='w-full bg-black/10 border border-white rounded-md transition duration-500 hover:bg-black py-3 font-semibold mt-6'
              >
                Agregar Preguntas
              </button>  

            ) : (
              <button
              type='button'
              onClick={handleModal}
              className='w-full bg-black/10 border border-white rounded-md transition duration-500 hover:bg-black py-3 font-semibold mt-6'
            >
              Editar Preguntas
            </button>  
            )}
            </>
          )}

        </div>
        <button
          onClick={(e: any) => handleSubmit(e)}
          className='w-full bg-black/10 border border-white rounded-md transition duration-500 hover:bg-black py-3 font-semibold'
        >
          Crear Curso{' '}
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
      {openModal && (
        <AddQuestionModal handleVisiblity={handleModal} visible={openModal} handleSetQuestions={handleSetQuestions} questionsC={questions}/>
      )}
    </div>
  </div>
  )
}

export default CreateCourseStepTwo