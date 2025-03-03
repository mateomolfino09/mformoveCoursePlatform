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

}

export default function AccountForm({ submitFunction, title, buttonTitle, showEmail, showPassword, showForget, showLogIn }: Props) {
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

  return (
    <form className="w-full max-w-lg mb-12 font-montserrat" action={submitFunction}>
      <Fieldset className="space-y-6 rounded-xl md:bg-white/10 sm:p-10">
        <Legend className="text-3xl font-semibold text-white">{title}</Legend>
        <Field className={`${!showEmail && 'hidden'}`}>
          <Label className="text-sm/6 font-normal text-white">Correo electrónico</Label>
          <Input
            id='email'
            type='email'
            name='email'
            placeholder='Correo electrónico'
            className={clsx(
              'mt-3 block w-full rounded-lg border-none bg-white/5 py-1.5 px-3 text-sm/6 text-white',
              'focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25'
            )}
          />
        </Field>
        <Field className={`${!showPassword && 'hidden'}`}>
          <Label className="text-sm/6 font-normal text-white">Contraseña</Label>
          <Input
            type='password'
            name='password'
            id='password'
            placeholder='Password'
            className={clsx(
              'mt-3 block w-full rounded-lg border-none bg-white/5 py-1.5 px-3 text-sm/6 text-white',
              'focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25'
            )}
          />
        </Field>
        <Button className="inline-flex items-center gap-2 rounded-md bg-white/5 py-1.5 px-3 text-sm font-semibold text-white shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-white/10 data-[open]:bg-gray-700 data-[focus]:outline-1 data-[focus]:outline-white" type='submit'>
          {buttonTitle}
        </Button>
        <p className={`capslock ${!capsLock && 'hidden'}`}>
                Bloq Mayús Activado
        </p>
        <div className='links-container md:items-center flex flex-col md:flex-row md:justify-between mt-4 text-sm text-gray-500 justify-around space-y-1 items-start'>
          <Link href={routes.user.login} className={`${!showLogIn && 'hidden'}`}>
                <span className={`links text-center`}>
                  Ingresar al sitio
                </span>
              </Link>
              <Link href={routes.user.forget} className={`${!showForget && 'hidden'}`}>
                <span className={`links text-center`}>
                  Olvidé la contraseña
                </span>
              </Link>
              <Link href={routes.user.register}>
            <span className='links text-center mt-2 md:mt-0'>Crear cuenta</span>
        </Link>
            </div>
            
      </Fieldset>
    </form>
  )
}