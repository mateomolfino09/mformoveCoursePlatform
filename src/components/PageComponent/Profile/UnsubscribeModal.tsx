import { CheckIcon, ChevronDownIcon, XCircleIcon } from '@heroicons/react/24/solid'
import React, { useEffect, useState } from 'react'
import { motion as m, useAnimation, motion } from 'framer-motion';
import AddQuestionQuantity from '../../AddQuestionQuantity';
import AddQuestions from '../../AddQuestions';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
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
    const [feedbackMessage, setFeedbackMessage] = useState('')

    const router = useRouter();
    const auth = useAuth();
    const [reason, setReason] = useState(-1)
    const [loading, setLoading] = useState(false)

      const handleCancelSub = async () => {
        setLoading(true)
        if(!auth.user) {
            auth.fetchUser()
            setLoading(false)
            return
          }
        if(selected === 'Seleccionar...') {
            toast.error('Selecciona una razón antes de desubscribirte por favor')
            setLoading(false)
            return
        }
        try {
        // Cancelar suscripción
        let data = await auth.cancelSub(auth?.user?.subscription.planId, auth?.user?.subscription.id, auth?.user?._id, selected)
        
        // Si hay un mensaje de feedback adicional, enviarlo al endpoint de contacto
        if (feedbackMessage.trim()) {
          try {
            await fetch('/api/contact', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                name: auth.user?.name || auth.user?.email?.split('@')[0] || 'Usuario',
                email: auth.user?.email || '',
                reason: 'cancellation',
                message: `Motivo seleccionado: ${selected}\n\nFeedback adicional:\n${feedbackMessage}`
              }),
            });
          } catch (contactError) {
            // No fallar la cancelación si el email de contacto falla
            console.error('Error enviando feedback:', contactError);
          }
        }
        
        auth.fetchUser()
        toast.success(data.message ?? 'Se ha cancelado la subscripción con éxito')
        handleVisiblity()
        close()
        setLoading(false)

        } catch (error) {
        toast.error('Hubo un error al cancelar tu subscripción, comunicate con soporte')
        setLoading(false)

        }
    }

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
      }, [visible, animation]);

      const onSubmit = (data: any) => {
        handleVisiblity()
      }

      useEffect(() => {
        if(Object.keys(errors).length === 0) setError(false)
        else setError(true)

      }, [errors])

  return (
    <div className={`w-full h-full font-montserrat font-light z-[120] bg-black/70 backdrop-blur-sm text-white top-0 ${visible ? 'fixed inset-0' : 'hidden'}`}>
      {loading ? (
        <div className="fixed inset-0 flex items-center justify-center z-[130]">
        <LoadingSpinner/>
        </div>
      ) : (
      <Dialog open={visible} as="div" className="relative z-[130] focus:outline-none" onClose={close}>
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel
              transition
              className="relative z-10 w-full max-w-2xl rounded-2xl p-6 md:p-12 backdrop-blur-md duration-300 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0 bg-white/95 border border-black/10 shadow-2xl"
            >
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <DialogTitle as="h3" className="text-3xl md:text-4xl font-bold text-center tracking-tight leading-tight font-montserrat text-black mb-2">
                  Cancelar Suscripción
              </DialogTitle>
                <motion.p
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-sm md:text-base mb-8 text-center font-montserrat font-light text-gray-600 leading-relaxed"
                >
                  Entendemos que cada camino es único y respetamos tu decisión. Tu feedback nos ayuda a mejorar y a poder ayudar a más personas en su proceso de bienestar.
                </motion.p>

                <div className="space-y-6 font-montserrat">
                  {/* Selector de motivo */}
                  <div>
                    <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                      ¿Cuál es el motivo de tu decisión?
                    </label>
              <Listbox value={selected} onChange={setSelected}>
                <ListboxButton
                  className={
                          'relative block w-full rounded-lg border border-gray-300 bg-white py-3 pr-10 pl-4 text-left text-sm text-black focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all z-[140]'
                  }
                >
                        <span className={selected === 'Seleccionar...' ? 'text-gray-400' : 'text-black'}>
                  {selected}
                        </span>
                  <ChevronDownIcon
                          className="pointer-events-none absolute top-3.5 right-3 w-5 h-5 text-gray-400"
                    aria-hidden="true"
                  />
                </ListboxButton>
                <ListboxOptions
                  anchor="bottom"
                  transition
                  className={
                          'w-[var(--button-width)] rounded-xl border border-gray-200 bg-white p-1 shadow-lg [--anchor-gap:var(--spacing-1)] focus:outline-none transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0 z-[140]'}
                >
                  {byeMessages.map((mess) => (
                    <ListboxOption
                      key={mess.message}
                      value={mess.message}
                            className="group flex cursor-default items-center gap-2 rounded-lg py-2.5 px-3 select-none data-[focus]:bg-amber-50 data-[focus]:text-black"
                    >
                            <CheckIcon className="invisible w-4 h-4 fill-amber-500 group-data-[selected]:visible" />
                            <div className="text-sm text-gray-700 group-data-[selected]:text-black group-data-[focus]:text-black">{mess.message}</div>
                    </ListboxOption>
                  ))}
                </ListboxOptions>
              </Listbox>
                  </div>

                  {/* Campo de mensaje opcional */}
                  <div>
                    <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
                      ¿Querés compartir algo más? (Opcional)
                    </label>
                    <textarea
                      id="feedback"
                      name="feedback"
                      value={feedbackMessage}
                      onChange={(e) => setFeedbackMessage(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 bg-white text-black font-montserrat transition-all resize-none"
                      placeholder="Contanos qué pasó, qué podríamos mejorar, o cualquier cosa que quieras compartir..."
                    />
                  </div>

                  {/* Botones */}
                  <div className="flex flex-col sm:flex-row gap-4 mt-6">
                    <motion.button
                      type="button"
                      onClick={close}
                      className="flex-1 px-6 py-3 rounded-lg border border-gray-300 bg-white text-gray-700 font-semibold text-sm md:text-base hover:bg-gray-50 transition-all duration-300 font-montserrat"
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Volver
                    </motion.button>
                    <motion.button
                      type="button"
                  onClick={handleCancelSub}
                      disabled={loading || selected === 'Seleccionar...'}
                      className="flex-1 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-rose-500/20 backdrop-blur-md text-black px-6 py-3 font-semibold text-sm md:text-base hover:from-amber-400/30 hover:via-orange-400/30 hover:to-rose-400/30 transition-all duration-300 font-montserrat rounded-lg border border-amber-300/40 shadow-lg shadow-amber-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                >
                      {loading ? 'Cancelando...' : 'Confirmar cancelación'}
                    </motion.button>
                  </div>
              </div>
              </motion.div>
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
