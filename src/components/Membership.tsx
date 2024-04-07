import imageLoader from '../../imageLoader';
import { User } from '../../typings';
import { LoadingSpinner } from './LoadingSpinner';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-toastify';

interface Props {
  user: User | null;
  handleVisibility: any
}

const monthNames = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Setiembre',
  'Octubre',
  'Noviembre',
  'Diciembre'
];

function Membership({ user, handleVisibility }: Props) {
  const [isBillingLoading, setBillingLoading] = useState(false);
  const router = useRouter();
  const auth = useAuth();

  console


  return (
    <div className='mt-6 grid grid-cols-1 gap-x-4 border px-4 md:grid-cols-4 md:border-x-0 md:border-t md:border-b-0 md:px-0'>
      <div className='space-y-2 py-4'>
        <button
          onClick={() => router.push('/account/billing')}
          //   disabled={isBillingLoading || !subscription}
          className='block min-w-fit px-5 h-10 !bg-black text-center font-light text-white py-2 rounded-full hover:bg-black hover:-translate-y-1 transition-all duration-500
        '
          //   onClick={manageSubscription}
        >
          {isBillingLoading ? <LoadingSpinner /> : 'Facturación'}
        </button>
      </div>

      <div className='col-span-3'>
        <div className='flex flex-col justify-between border-b border-white/10 py-4 md:flex-row'>
          <div>
            <p className='font-medium'>{auth.user?.email}</p>
            <p className='text-[gray]'>Contraseña: ********</p>
            <p className='font-medium mt-2'>
              Usuario creado el{' '}
              {auth.user?.createdAt &&
                new Date(auth.user?.createdAt).getDate().toString()}{' '}
              de{' '}
              {auth.user?.createdAt &&
                monthNames[new Date(auth.user?.createdAt).getMonth()]}{' '}
              del{' '}
              {auth.user?.createdAt &&
                new Date(auth.user?.createdAt).getFullYear().toString()}{' '}
            </p>
          </div>
          <div className='md:text-right'>
              <a href='/resetEmail'><p className='membershipLink '>Cambiar Email</p></a>
    
            <a href='/forget'><p className='membershipLink '>Cambiar Contraseña</p></a>
          </div>

        </div>

        <div className='flex flex-col justify-between pt-4 pb-4 md:flex-row md:pb-0'>
          <div>
            <Image
              src='/images/dlocal.svg'
              alt={'image'}
              loader={imageLoader}
              className='rounded-md h-auto  w-12'
              height={150}
              width={150}
            />
          </div>
          <div className='md:text-right'>
            <Link href={'/account/billing'}>
              <p className='membershipLink'>Detalles de Facturación</p>
            </Link>
              <p className={`membershipLink ${!auth?.user?.subscription?.active ? 'hidden' : ''}`} onClick={handleVisibility}>Cancelar Subscripción</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Membership;
