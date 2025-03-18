import { CheckIcon, ChevronDownIcon, XCircleIcon } from '@heroicons/react/24/solid'
import React, { useEffect, useState } from 'react'
import { motion as m, useAnimation } from 'framer-motion';
import AddQuestionQuantity from '../../AddQuestionQuantity';
import AddQuestions from '../../AddQuestions';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import imageLoader from '../../../../imageLoader';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { toast } from 'react-toastify';
import { LoadingSpinner } from '../../LoadingSpinner';
import { Button, Dialog, DialogPanel, DialogTitle, Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
import { byeMessages } from '../../../constants/notifications';


interface Props {
    visible: boolean
    handleVisiblity: any
    close: any
}

const UnsubscribeModal
 = ({ visible, handleVisiblity, close }: Props) => {
    const animation = useAnimation();
    const [ quantity, setQuantity ] = useState<number>(5)
    const [error, setError] = useState<boolean>(false)
    const { register, handleSubmit, formState: { errors,  } } = useForm()
    const [selected, setSelected] = useState('Seleccionar...')

    const router = useRouter();
    const auth = useAuth();
    const [reason, setReason] = useState(-1)
    const [loading, setLoading] = useState(false)

      const handleCancelSub = async () => {
        setLoading(true)
        if(!auth.user) {
            auth.fetchUser()
            return
          }
        if(selected === 'Seleccionar...') {
            toast.error('Selecciona una razón antes de desubscribirte porfavor')
            return
        }
        try {
        let data = await auth.cancelSub(auth?.user?.subscription.planId, auth?.user?.subscription.id, auth?.user?._id, selected)
        auth.fetchUser()
        toast.success(data.message ?? 'Se ha cancelado la subscricpción con éxito')
        handleVisiblity()
        close()
        setLoading(false)

        } catch (error) {
        console.log(error)
        toast.error('Hubo un error al cancelar tu subscricpción, comunicate con soporte')
        setLoading(false)

        }
    }

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
        handleVisiblity()
      }

      useEffect(() => {
        if(Object.keys(errors).length === 0) setError(false)
        else setError(true)

      }, [errors])

  return (
    <div className={` w-full h-full font-montserrat font-light z-[120] bg-black/50 text-white top-0 ${visible ? 'absolute' : 'hidden'}`}>
      {loading ? (
        <LoadingSpinner/>
      ) : (
      <Dialog open={visible} as="div" className="relative z-[130] focus:outline-none " onClose={close}>
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel
              transition
              className="w-full max-w-md rounded-xl p-6 backdrop-blur-2xl duration-300 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0 !bg-rich-black/30"
            >
              <DialogTitle as="h3" className="text-base font-medium text-white">
                Cancelar Subscripción
              </DialogTitle>
              <p className="mt-2 text-sm text-white/50">
              Lamentamos que quieras cancelar tu suscripción. 
              </p>
              <p className="mt-2 text-sm text-white/50"> Nos gustaría mejorar, por eso queremos saber: ¿Cuál es el motivo de tu decisión? Tu feedback nos ayuda mucho.
              </p>
              <Listbox value={selected} onChange={setSelected}>
                <ListboxButton
                  className={
                    'relative block w-full rounded-lg bg-white/5 py-1.5 pr-8 z-[140] pl-2 text-left text-sm text-white focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25 my-3'
                  }
                >
                  {selected}
                  <ChevronDownIcon
                    className="group pointer-events-none absolute top-2.5 right-2.5 w-4 h-4 fill-white/60"
                    aria-hidden="true"
                  />
                </ListboxButton>
                <ListboxOptions
                  anchor="bottom"
                  transition
                  className={
                    'w-[var(--button-width)] rounded-xl border border-white/5 bg-black/70 p-1 [--anchor-gap:var(--spacing-1)] focus:outline-none transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0 z-[140]'}
                >
                  {byeMessages.map((mess) => (
                    <ListboxOption
                      key={mess.message}
                      value={mess.message}
                      className="group flex cursor-default items-center gap-2 rounded-lg py-1.5 px-3 select-none data-[focus]:bg-white/10"
                    >
                      <CheckIcon className="invisible w-4 h-4 fill-white group-data-[selected]:visible" />
                      <div className="text-sm/6 text-white">{mess.message}</div>
                    </ListboxOption>
                  ))}
                </ListboxOptions>
              </Listbox>
              <div className="mt-4">
                <Button
                  className="inline-flex items-center gap-2 rounded-md bg-white/5 py-1.5 px-3 text-sm font-semibold text-white shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-white/10 data-[open]:bg-gray-700 data-[focus]:outline-1 data-[focus]:outline-white"
                  onClick={handleCancelSub}
                >
                  Hecho
                </Button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>

      )}
        {/* <m.div initial={{ x: '80%', y:'-50%', opacity: 0, zIndex: '125'}}
        animate={animation} className={`absolute dark:bg-neutral-800 w-2/3 lg:w-1/2 max-h-96 pb-2 z-10 left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%] rounded-md shadow-2xl overflow-x-hidden !scrollbar-thin px-2`}>
        <button
        onClick={handleVisiblity}
        className='modalButton !text-white fixed overflow-y-scroll overflow-x-hidden -right-2 !z-40 h-9 w-9 border-none'
        >
        <XCircleIcon className='h-6 w-6 ' />
        </button>
        <div className='w-full '>
            <div className='w-full flex justify-center items-center pt-4 pb-4'>
                <h1 className='text-2xl font-light text-white'>¿Quieres terminar tu subscricpción en MforMove Platform?</h1>
            </div>
            <div className='flex justify-center text-center items-center pb-4 px-12 text-lg'>
                Nos gustaría entender que fue lo que te hizo tomar esta decisión para seguir mejorando nuestro servicio. Cuentanos, dejo el servicio por que...
            </div>
            <div className="flex justify-center space-x-3 items-center mb-4">
            <input onChange={(e) => {
                if(e.target.checked) {
                    setReason(0)
                }
                else {
                    setReason(-1)
                }
            }} id="default-checkbox" checked={reason === 0} type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
            <label htmlFor="default-checkbox" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">No puedo pagarlo</label>
            </div>  
            <div className="flex justify-center space-x-3 items-center mb-4">
            <input onChange={(e) => {
                if(e.target.checked) {
                    setReason(1)
                }
                else {
                    setReason(-1)
                }
            }} id="default-checkbox" checked={reason === 1} type="checkbox" value="" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
            <label htmlFor="default-checkbox" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Ya no me interesa</label>
            </div>  
            <div className="flex justify-center space-x-3 items-center mb-4">
            <input onChange={(e) => {
                if(e.target.checked) {
                    setReason(2)
                }
                else {
                    setReason(-1)
                }
            }} checked={reason === 2} id="default-checkbox" type="checkbox" value="" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
            <label htmlFor="default-checkbox" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">No me gustó</label>
            </div>  
            <div className='flex justify-center items-center mt-2 pb-4'>
            <button onClick={() => handleCancelSub()} className='w-72 h-12 bg-white text-black rounded-md text-sm'> Cancelar Subscripción {loading && (
                <><LoadingSpinner /></>
            )} </button>
            </div>
        </div>
        </m.div> */}
    </div>
  )
}

export default UnsubscribeModal
