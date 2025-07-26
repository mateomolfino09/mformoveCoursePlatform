'use client'
import React, { useEffect, useState } from 'react'
import MainSideBar from '../../MainSidebar/MainSideBar'
import FooterProfile from '../Profile/FooterProfile';
import { useAppDispatch } from '../../../hooks/useTypeSelector'
import { toggleScroll } from '../../../redux/features/headerHomeSlice'
import { useAuth } from '../../../hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useMentorshipAnalytics } from '../../../hooks/useMentorshipAnalytics'
import MentorshipIntro from './MentorshipIntro'
import MentorshipPhilosophy from './MentorshipPhilosophy'
import MentorshipPlans from './MentorshipPlans'
import MentorshipProcess from './MentorshipProcess'
import MentorshipFAQ from './MentorshipFAQ'
import MentorshipCTA from './MentorshipCTA'
import MentorshipTestimonials from './MentorshipTestimonials';
import MentorshipIsForYou from './MentorshipIsForYou';
import MentorshipIncludes from './MentorshipIncludes';
import MentorshipBio from './MentorshipBio';
import { MentorshipPlan, MentorshipProps } from '../../../types/mentorship'
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { MiniLoadingSpinner } from '../Products/MiniSpinner';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

const Mentorship = ({ plans, origin }: MentorshipProps) => {
  const dispatch = useAppDispatch();
  const auth = useAuth();
  const router = useRouter();
  const { trackScrollDepth } = useMentorshipAnalytics();

  // Estados para el formulario de newsletter
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [newsletterLoading, setNewsletterLoading] = useState<boolean>(false);

  // Función para validar email
  function validateEmail(email: string) {
    const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  }

  // Función para enviar el formulario de newsletter
  const onSubmitNewsletter = async (data: any) => {
    setNewsletterLoading(true);
    let email = data.email;
    
    if (!validateEmail(email)) {
      toast.error("Error. Ingresa un email válido");
      setNewsletterLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
        }),
      });
      
      const result = await response.json();
      
      if (result.status >= 400) {
        if (result.title == "Member Exists") {
          toast.error("Esta cuenta ya pertenece a la lista.");
        } else {
          toast.error("Error al suscribirte. ¡Contactanos directamente via Instagram!");
        }
        setNewsletterLoading(false);
        return;
      }

      setNewsletterLoading(false);
      toast.success("¡Gracias por suscribirte! 👻");
      
    } catch (error) {
      toast.error("Error al suscribirte. ¡Contactanos directamente via Instagram!");
      setNewsletterLoading(false);
    }
  };

  useEffect(() => {
    if (!auth.user) {
      auth.fetchUser();
    }
  }, [auth.user]);

  const handleScroll = (event: any) => {
    let isScrolled = event.target.scrollTop;

    if (isScrolled === 0) {
      dispatch(toggleScroll(false));
    } else {
      dispatch(toggleScroll(true));
    }

    // Track scroll depth for analytics
    const scrollPercentage = Math.round((isScrolled / (event.target.scrollHeight - event.target.clientHeight)) * 100);
    if (scrollPercentage % 25 === 0) { // Track every 25%
      trackScrollDepth(scrollPercentage);
    }
  };

  return (
    <div 
      className='relative lg:h-full min-h-screen overflow-scroll overflow-x-hidden' 
      onScroll={(event: any) => handleScroll(event)}
    >
      <MainSideBar where={'mentorship'}>
        <MentorshipIntro />
        <MentorshipIsForYou />
        <MentorshipIncludes />
        <MentorshipBio />
        <MentorshipPhilosophy />
        <MentorshipProcess />
        <MentorshipPlans plans={plans} origin={origin} />
        <MentorshipTestimonials />
        <MentorshipCTA />
        <MentorshipFAQ />
        
        {/* CTA Section - Newsletter */}
        <div className="bg-gray-800 text-white py-16">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-montserrat">
              Suscribirme a notificaciones
            </h2>
            <p className="text-xl text-gray-300 mb-4 font-montserrat font-light">
              Esta no es cualquier newsletter deportiva...
            </p>
            <p className="text-lg text-gray-300 mb-4 font-montserrat font-bold italic">
              Es salud, movimiento, cambio, pensamiento crítico, desarrollo personal y creativo.
            </p>
            <p className="text-base text-gray-400 mb-8 font-montserrat font-light max-w-2xl mx-auto">
              Si no te interesa, mejor no te suscribas, porque vas a recibir mails con tips para tu práctica de movimiento y salud física junto a reflexiones para pensar, cuestionar y ver el cuerpo (y la vida) de otra manera.
            </p>
            
            <form onSubmit={handleSubmit(onSubmitNewsletter)} className="max-w-md mx-auto">
              <div className="flex items-center border-b border-white/30 pb-2 group">
                <input 
                  placeholder="Correo electrónico" 
                  type="email"  
                  {...register('email')} 
                  className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none font-montserrat text-lg"
                  required
                />
                {newsletterLoading ? (
                  <MiniLoadingSpinner />
                ) : (
                  <button 
                    type="submit" 
                    className="text-white hover:text-[#234C8C] transition-colors group-hover:translate-x-1 transition-transform"
                  >
                    <ArrowRightIcon className="w-6 h-6" />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
        
        <FooterProfile />
      </MainSideBar>
    </div>
  );
};

export default Mentorship; 