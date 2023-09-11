import { XCircleIcon } from '@heroicons/react/24/solid'
import React, { useEffect, useState } from 'react'
import { motion as m, useAnimation } from 'framer-motion';
import AddQuestionQuantity from './AddQuestionQuantity';
import AddQuestions from './AddQuestions';
import { useForm } from 'react-hook-form';


interface Props {
    visible: boolean
    handleVisiblity: any
    handleSetQuestions: any
    questionsC: any
}

const AddQuestionModal
 = ({ visible, handleVisiblity, handleSetQuestions, questionsC }: Props) => {
    const animation = useAnimation();
    const [ quantity, setQuantity ] = useState<number>(5)
    const [ questions, setQuestions ] = useState<any>([])
    const [error, setError] = useState<boolean>(false)
    const { register, handleSubmit, formState: { errors,  } } = useForm()

    useEffect(() => {

    }, [quantity])


    useEffect(() => {
        if (visible) {
          animation.start({
            x: '-50%',
            y: '-50%',
            opacity: 100,
            transition: {
              delay: 0,
              ease: 'linear',
              duration: 0.4,
              stiffness: 0
            }
          });
        } else {
          animation.start({
            x: '50%',
            y: '-50%',
            opacity: 0,
            transition: {
              delay: 0,
              ease: 'linear',
              duration: 0.4,
              stiffness: 0
            }
          });
        }
      }, [visible]);

      const onSubmit = (data: any) => {
        handleSetQuestions(data)
        handleVisiblity()
      }

      useEffect(() => {
        if(Object.keys(errors).length === 0) setError(false)
        else setError(true)

      }, [errors])

  return (
    <m.div initial={{ x: '80%', y:'-50%', opacity: 0 }}
    animate={animation} className={`absolute dark:bg-neutral-800  w-full max-h-96 pb-2 z-10 left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%] rounded-md shadow-2xl overflow-x-hidden !scrollbar-thin`}>
    <button
    onClick={handleVisiblity}
    className='modalButton !text-white fixed overflow-y-scroll overflow-x-hidden -right-2 !z-40 h-9 w-9 border-none'
    >
    <XCircleIcon className='h-6 w-6 ' />
    </button>
    <AddQuestionQuantity setQuantity={(q: number) => {
        setQuantity(q)
        setQuestions([])
        }} quantity={quantity}/>
    <div className=' w-full '>
    {quantity && (
        <form onSubmit={handleSubmit(onSubmit)}>
        {[...Array(+quantity)].map((e, i) => {
            return (
                <div className='mb-6'>
                    <div className="relative flex flex-wrap items-stretch mb-5 px-1">
                    <span
                        className="flex items-center whitespace-nowrap rounded-l border border-r-0 border-solid border-neutral-300 px-4 py-[0.45rem] text-center text-xl font-normal text-neutral-700 dark:border-neutral-600 dark:text-neutral-200 dark:placeholder:text-neutral-200"
                        id="inputGroup-sizing-lg"
                        >Pregunta {i + 1}</span>
                    <input
                        type="text"
                        className="relative m-0 block w-[1px] min-w-0 flex-auto rounded-r border border-solid border-neutral-300 bg-transparent bg-clip-padding px-4 py-[0.45rem] text-xl font-normal text-neutral-700 outline-none transition duration-200 ease-in-out focus:z-[3] focus:border-primary focus:text-neutral-700 focus:shadow-[inset_0_0_0_1px_rgb(59,113,202)] focus:outline-none dark:border-neutral-600 dark:text-neutral-200 dark:placeholder:text-neutral-200 dark:focus:border-primary"
                        aria-label="Sizing input"
                        aria-describedby="inputGroup-sizing-lg" 
                        defaultValue={questionsC && questionsC.length > 0 ? questionsC[i][0] : ''}
                        {...register(`pregunta${i + 1}.pregunta`,{
                          required: true,
                          minLength: 1
                        })}/>
                    </div>
                    {[...Array(4)].map((e, ia) => {
                        return (
                            <>
                            <div className="relative mb-4 flex flex-wrap items-stretch px-3">
                            <span
                                className="flex items-center whitespace-nowrap rounded-l border border-r-0 border-solid border-neutral-300 px-3 py-[0.25rem] text-center text-base font-normal leading-[1.6] text-neutral-700 dark:border-neutral-600 dark:text-neutral-200 dark:placeholder:text-neutral-200"
                                id="inputGroup-sizing-default"
                                >Respuesta {ia + 1}</span>
                            <input
                                type="text"
                                className="relative m-0 block w-[1px] min-w-0 flex-auto rounded-r border border-solid border-neutral-300 bg-transparent bg-clip-padding px-3 py-[0.25rem] text-base font-normal leading-[1.6] text-neutral-700 outline-none transition duration-200 ease-in-out focus:z-[3] focus:border-primary focus:text-neutral-700 focus:shadow-[inset_0_0_0_1px_rgb(59,113,202)] focus:outline-none dark:border-neutral-600 dark:text-neutral-200 dark:placeholder:text-neutral-200 dark:focus:border-primary"
                                aria-label="Sizing example input"
                                aria-describedby="inputGroup-sizing-default" 
                                defaultValue={questionsC && questionsC.length > 0 ? questionsC[i][ia+1] : ''}
                                {...register(`pregunta${i+1}.respuesta${ia + 1}`, {
                                  required: true,
                                  minLength: 1
                                })}/>
                                {errors?.root?.type === 'required' && <p>El campo Respuesta {ia} es requerido</p>}

                            </div>
                            </>
                        )
        })}
                    <div className="relative flex flex-wrap items-stretch mt-2">
                    <label
                        className="flex items-center whitespace-nowrap rounded-l border border-r-0 border-solid border-neutral-300 px-3 py-[0.25rem] text-center text-base font-normal leading-[1.6] text-neutral-700 dark:border-neutral-600 dark:text-neutral-200 dark:placeholder:text-neutral-200"
                        htmlFor="inputGroupSelect01"
                        >Respuesta Correcta Pregunta {i+1}</label>
                    <select
                        className="form-select relative m-0 block w-[1px] min-w-0 flex-auto rounded-r border border-solid border-neutral-300 bg-transparent bg-clip-padding px-3 py-[0.25rem] text-base font-normal leading-[1.6] text-neutral-700 outline-none transition duration-200 ease-in-out focus:z-[3] focus:border-primary focus:text-neutral-700 focus:shadow-[inset_0_0_0_1px_rgb(59,113,202)] focus:outline-none dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 dark:placeholder:text-neutral-200 dark:focus:border-primary"
                        id="inputGroupSelect01" {...register(`pregunta${i+1}.respuestacorrecta`)}>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                    </select>
                    </div>
                </div>
            )
        })}
        <div className='w-full flex flex-col justify-center items-start space-y-2'>
          {error && (
            <p className='text-red-500 ml-4 text-sm'> *Debe completar todos los campos*</p>
          )}
          <div className='w-full flex justify-center items-center'>
            <button type='submit' className="bg-white w-28 text-center hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow">
                Submit
            </button>

          </div>

        </div>
                
        </form>
            )}
    </div>
    </m.div>
  )
}

export default AddQuestionModal
