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
      className='bg-palette-cream border border-palette-stone/25 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-[0_4px_24px_rgba(20,20,17,0.06)] transition-shadow duration-300 hover:border-palette-stone/40'
    >
      <div className='flex items-center gap-3 mb-6'>
        <div className='p-2.5 bg-palette-sage/15 border border-palette-stone/30 rounded-xl'>
          <CreditCardIcon className='w-6 h-6 text-palette-sage' />
        </div>
        <h2 className='text-xl md:text-2xl font-montserrat font-semibold text-palette-ink tracking-tight'>
          Membresía
        </h2>
      </div>

      <div className='space-y-6'>
        {/* Provider Logo */}
        <div className='flex items-center justify-between pb-6 border-b border-palette-stone/20'>
          <div className='space-y-1'>
            <p className='font-montserrat text-xs uppercase tracking-[0.2em] text-palette-stone'>
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
                    <span className='text-base text-palette-ink font-light'>
                      {plan.provider === 'stripe' ? 'Stripe' : 'dLocal'}
                    </span>
                  </div>
                ) : (
                  <p className='text-base text-palette-stone font-light pt-2'>
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
              className='w-full md:w-auto px-6 py-3 font-montserrat font-medium text-sm text-palette-stone border border-palette-stone/40 rounded-full hover:border-palette-stone hover:text-palette-ink transition-colors'
            >
              Cancelar Suscripción
            </button>
          </div>
        )}

        {auth?.user?.subscription?.isCanceled && (
          <div className='pt-2'>
            <div className='flex items-center gap-2 px-4 py-3 bg-palette-sage/15 border border-palette-stone/30 rounded-xl'>
              <XMarkIcon className='w-5 h-5 text-palette-sage flex-shrink-0' />
              <p className='text-sm text-palette-stone font-light'>
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