import { Button, Description, Field, Fieldset, Input, Label, Legend, Select, Textarea } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import clsx from 'clsx'
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { routes } from '../../../constants/routes';

interface Props {
  submitFunction: any
  title: string
  buttonTitle: string
  showEmail: boolean
  showPassword: boolean
  showForget: boolean
  showLogIn: boolean
  isLoading?: boolean

}

export default function AccountForm({ submitFunction, title, buttonTitle, showEmail, showPassword, showForget, showLogIn, isLoading = false }: Props) {
    const [capsLock, setCapsLock] = useState<boolean>(false);

    useEffect(() => {
        if (typeof window != 'undefined' && document != undefined) {
          document.addEventListener('keydown', testCapsLock);
          document.addEventListener('keyup', testCapsLock);
        }
      }, []);

    function testCapsLock(event: any) {
        if (event.code === 'CapsLock') {
          let isCapsLockOn = event.getModifierState('CapsLock');
          if (isCapsLockOn) {
            setCapsLock(true);
          } else {
            setCapsLock(false);
          }
        }
      }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await submitFunction(formData);
  };

  return (
    <form className="w-full max-w-lg font-montserrat text-white" onSubmit={handleSubmit}>
      <Fieldset className="space-y-6 rounded-xl p-4 bg-white/5 border border-white/10 shadow-sm sm:p-10">
        <Legend className="text-3xl font-semibold text-white">{title}</Legend>
        <Field className={`${!showEmail && 'hidden'}`}>
          <Label className="text-sm/6 font-medium text-white">Correo electrónico</Label>
          <Input
            id='email'
            type='email'
            name='email'
            placeholder='Correo electrónico'
            className={clsx(
              'mt-3 block w-full rounded-lg border-0 bg-white/5 py-2 px-3 text-sm/6 text-white',
              'focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/30'
            )}
          />
        </Field>
        <Field className={`${!showPassword && 'hidden'}`}>
          <Label className="text-sm/6 font-medium text-white">Contraseña</Label>
          <Input
            type='password'
            name='password'
            id='password'
            placeholder='Password'
            className={clsx(
              'mt-3 block w-full rounded-lg border-0 bg-white/5 py-2 px-3 text-sm/6 text-white',
              'focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/30'
            )}
          />
        </Field>
        <Button
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-white via-[#f7f7f7] to-[#eaeaea] text-black py-3 !mt-12 px-6 w-full text-base font-semibold shadow-lg shadow-black/25 border border-white/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-black/40 hover:scale-[1.01] focus:outline-none data-[focus]:outline-2 data-[focus]:outline-offset-2 data-[focus]:outline-white/50 disabled:opacity-60 disabled:cursor-not-allowed"
          type='submit'
          disabled={isLoading}
        >
          {isLoading && (
            <span className="inline-block h-4 w-4 border-2 border-black/40 border-t-black rounded-full animate-spin" aria-hidden />
          )}
          {isLoading ? 'Procesando...' : buttonTitle}
        </Button>
        <p className={`capslock ${!capsLock && 'hidden'}`}>
                Bloq Mayús Activado
        </p>
        <div className='links-container md:items-center flex flex-row md:flex-row md:justify-between mt-4 text-sm text-white justify-around space-y-0 md:space-y-0 items-start underline underline-offset-4 decoration-white/60'>
          <Link href={routes.user.login} className={`${!showLogIn && 'hidden'}`}>
            <span className=" text-center text-white">
              Ingresar al sitio
            </span>
              </Link>
              <Link href={routes.user.forget} className={`${!showForget && 'hidden'}`}>
            <span className=" text-center text-white">
              Olvidé la contraseña
            </span>
              </Link>
              <Link href={routes.user.register}>
            <span className=' text-center mt-2 md:mt-0 text-white'>Crear cuenta</span>
          </Link>
        </div>
            
      </Fieldset>
    </form>
  )
}