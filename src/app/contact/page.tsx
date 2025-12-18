'use client';

import { motion } from 'framer-motion';
import { CldImage } from 'next-cloudinary';
import imageLoader from '../../../imageLoader';
import { useSearchParams, useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import MainSideBar from '../../components/MainSidebar/MainSideBar';
import Footer from '../../components/Footer';
import { toast } from 'react-hot-toast';

const ContactPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: searchParams.get('email') || '',
    reason: searchParams.get('reason') || '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Prellenar email y razón desde query params
    const email = searchParams.get('email');
    const reason = searchParams.get('reason');
    if (email) {
      setFormData(prev => ({ ...prev, email: decodeURIComponent(email) }));
    }
    if (reason) {
      setFormData(prev => ({ ...prev, reason: decodeURIComponent(reason) }));
    }
  }, [searchParams]);

  const getReasonLabel = (reason: string) => {
    switch (reason) {
      case 'cancellation':
        return 'Cancelación de membresía';
      case 'payment':
        return 'Problema con el pago';
      default:
        return 'Consulta general';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al enviar el formulario');
      }

      setSubmitted(true);
      toast.success('¡Mensaje enviado exitosamente!');
      
      // Redirigir a Move Crew después de 2 segundos
      setTimeout(() => {
        router.push('/move-crew');
      }, 2000);
    } catch (error: any) {
      toast.error(error.message || 'Error al enviar el mensaje');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <MainSideBar where={''}>
      <section className="relative w-full min-h-[100vh] flex items-center justify-center overflow-hidden py-20 md:py-32">
        {/* Imágenes de fondo - mismo estilo que MoveCrewHero */}
        <div className="absolute inset-0">
          <CldImage
            src="my_uploads/fondos/DSC01526_hcas98"
            alt="Move Crew Contact"
            fill
            priority
            className="hidden md:block object-cover opacity-60"
            style={{ objectPosition: 'center top' }}
            preserveTransformations
            loader={imageLoader}
          />
          <CldImage
            src="my_uploads/fondos/fondo3_jwv9x4"
            alt="Move Crew Contact"
            fill
            priority
            className="md:hidden object-cover opacity-60"
            style={{ objectPosition: 'center top' }}
            preserveTransformations
            loader={imageLoader}
          />
        </div>

        {/* Contenido principal */}
        <div className="relative z-10 max-w-2xl mx-auto px-6 w-full">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-white/95 backdrop-blur-sm rounded-2xl border border-black/10 p-6 md:p-12 shadow-2xl"
          >
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="mb-6">
                  <svg className="w-16 h-16 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-black font-montserrat mb-4">
                  ¡Gracias por tu mensaje!
                </h2>
                <p className="text-lg text-gray-700 font-montserrat">
                  Te responderemos a la brevedad. Tu feedback es muy valioso para nosotros.
                </p>
              </motion.div>
            ) : (
              <>
                <motion.h1
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7 }}
                  className="text-3xl md:text-4xl font-bold text-center tracking-tight leading-tight font-montserrat text-black mb-2"
                >
                  Compartí tu experiencia
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.1 }}
                  className="text-sm md:text-base mb-8 text-center font-montserrat font-light text-gray-600 leading-relaxed"
                >
                  Tu opinión nos ayuda a mejorar y a poder ayudar a más personas en su proceso de bienestar.
                </motion.p>

                <form onSubmit={handleSubmit} className="space-y-6 font-montserrat">
                  {/* Nombre */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 bg-white text-black font-montserrat transition-all"
                      placeholder="Tu nombre"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 bg-white text-black font-montserrat transition-all"
                      placeholder="tu@email.com"
                    />
                  </div>

                  {/* Razón */}
                  <div>
                    <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                      Motivo
                    </label>
                    <select
                      id="reason"
                      name="reason"
                      value={formData.reason}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 bg-white text-black font-montserrat transition-all"
                    >
                      <option value="">Seleccionar motivo</option>
                      <option value="cancellation">Cancelación de membresía</option>
                      <option value="payment">Problema con el pago</option>
                      <option value="general">Consulta general</option>
                      <option value="feedback">Feedback sobre el servicio</option>
                      <option value="other">Otro</option>
                    </select>
                    {formData.reason && (
                      <p className="mt-2 text-xs text-gray-500 font-montserrat">
                        {getReasonLabel(formData.reason)}
                      </p>
                    )}
                  </div>

                  {/* Mensaje */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Mensaje
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 bg-white text-black font-montserrat transition-all resize-none"
                      placeholder="Contanos qué pasó, qué podríamos mejorar, o cualquier cosa que quieras compartir..."
                    />
                  </div>

                  {/* Botón de envío */}
                  <motion.button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-rose-500/20 backdrop-blur-md text-black px-8 py-4 font-semibold text-base md:text-lg hover:from-amber-400/30 hover:via-orange-400/30 hover:to-rose-400/30 transition-all duration-300 font-montserrat rounded-2xl border border-amber-300/40 shadow-lg shadow-amber-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                  >
                    {loading ? 'Enviando...' : 'Enviar mensaje'}
                  </motion.button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      </section>
      <Footer />
    </MainSideBar>
  );
};

export default ContactPage;


