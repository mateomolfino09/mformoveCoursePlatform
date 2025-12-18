import imageLoader from '../../imageLoader';
import { Plan, User } from '../../typings';
import { MiniLoadingSpinner } from './MiniLoadingSpinner';
import Image from 'next/image';
import { useAuth } from './../hooks/useAuth';
import { motion } from 'framer-motion';
import { CreditCardIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface Props {
  user: User | null;
  handleVisibility: any
  plan: Plan | null;
  loading: boolean
}

function Membership({ user, handleVisibility, plan, loading }: Props) {
  const auth = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className='bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow duration-300'
    >
      <div className='flex items-center gap-3 mb-6'>
        <div className='p-2 bg-gray-100 rounded-lg'>
          <CreditCardIcon className='w-6 h-6 text-gray-700' />
        </div>
        <h2 className='text-xl md:text-2xl font-semibold text-black'>
          Membresía
        </h2>
      </div>

      <div className='space-y-6'>
        {/* Provider Logo */}
        <div className='flex items-center justify-between pb-6 border-b border-gray-100'>
          <div className='space-y-1'>
            <p className='text-sm text-gray-500 font-light uppercase tracking-wide'>
              Método de pago
            </p>
            {loading ? (
              <div className='pt-2'>
                <MiniLoadingSpinner/>
              </div>
            ) : (
              <>
                {plan ? (
                  <div className='flex items-center gap-3 pt-2'>
                    {plan.provider === 'stripe' ? (
                      <Image
                        src='/images/logoStripe.png'
                        alt='Stripe'
                        loader={imageLoader}
                        className='rounded-md h-auto w-12'
                        height={150}
                        width={150}
                      />
                    ) : (
                      <Image
                        src='/images/dlocal.svg'
                        alt='dLocal'
                        loader={imageLoader}
                        className='rounded-md h-auto w-12'
                        height={150}
                        width={150}
                      />
                    )}
                    <span className='text-base text-gray-700 font-light'>
                      {plan.provider === 'stripe' ? 'Stripe' : 'dLocal'}
                    </span>
                  </div>
                ) : (
                  <p className='text-base text-gray-500 font-light pt-2'>
                    No disponible
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Cancel Subscription Button */}
        {auth?.user?.subscription?.active && !auth?.user?.subscription?.isCanceled && (
          <div className='pt-2'>
            <button
              onClick={handleVisibility}
              className='w-full md:w-auto px-6 py-3 bg-white border border-red-200 text-red-600 rounded-lg font-medium hover:bg-red-50 hover:border-red-300 transition-colors'
            >
              Cancelar Suscripción
            </button>
          </div>
        )}

        {auth?.user?.subscription?.isCanceled && (
          <div className='pt-2'>
            <div className='flex items-center gap-2 px-4 py-3 bg-orange-50 border border-orange-200 rounded-lg'>
              <XMarkIcon className='w-5 h-5 text-orange-600' />
              <p className='text-sm text-orange-700 font-medium'>
                Tu suscripción está cancelada y finalizará al término del período actual.
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default Membership;