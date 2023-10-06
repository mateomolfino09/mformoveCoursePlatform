import imageLoader from '../../imageLoader';
import { User } from '../../typings';
import { LoadingSpinner } from './LoadingSpinner';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';

interface Props {
  user: User | null;
}

function Membership({ user }: Props) {
  const [isBillingLoading, setBillingLoading] = useState(false);
  const router = useRouter();

  return (
    <div className='mt-6 grid grid-cols-1 gap-x-4 border px-4 md:grid-cols-4 md:border-x-0 md:border-t md:border-b-0 md:px-0'>
      <div className='space-y-2 py-4'>
        <h4 className=''>Facturación</h4>
        <button
          onClick={() => router.push('/account/billing')}
          //   disabled={isBillingLoading || !subscription}
          className='h-10 w-3/5 whitespace-nowrap bg-gray-300 py-2 text-sm font-medium text-black shadow-md hover:bg-gray-200 md:w-4/5'
          //   onClick={manageSubscription}
        >
          {isBillingLoading ? <LoadingSpinner /> : 'Datos Facturación'}
        </button>
      </div>

      <div className='col-span-3'>
        <div className='flex flex-col justify-between border-b border-white/10 py-4 md:flex-row'>
          <div>
            <p className='font-medium'>{user?.email}</p>
            <p className='text-[gray]'>Contraseña: ********</p>
          </div>
          <div className='md:text-right'>
            <Link href={'/resetEmail'}>
              <p className='membershipLink'>Cambiar Email</p>
            </Link>

            <Link href={'/forget'}>
              <p className='membershipLink'>Cambiar Contraseña</p>
            </Link>
          </div>
        </div>

        <div className='flex flex-col justify-between pt-4 pb-4 md:flex-row md:pb-0'>
          <div>
            <Image
              src='/images/mplogo.png'
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default Membership;
