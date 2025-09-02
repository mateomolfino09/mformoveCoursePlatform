'use client';

import React, { useState } from 'react';
import { ProductDB } from '../../../../typings';
import EventCard from './EventCard';
import { CalendarDaysIcon, MapPinIcon, FunnelIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { CldImage } from 'next-cloudinary';
import { SparklesIcon, UserGroupIcon, ChartBarIcon } from '@heroicons/react/24/solid';
import Footer from '../../Footer';
import MainSideBar from '../../MainSidebar/MainSideBar';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { MiniLoadingSpinner } from '../Products/MiniSpinner';

interface Props {
  eventos: ProductDB[] | ProductDB;
}

const EventsList: React.FC<Props> = ({ eventos }) => {
  // Sin filtros, mostramos todos los eventos
  
  // Asegurar que eventos sea un array válido
  let eventosFiltrados: ProductDB[] = [];
  if (Array.isArray(eventos)) {
    eventosFiltrados = eventos;
  } else if (eventos && typeof eventos === 'object') {
    // Si es un objeto único, lo convertimos en array
    eventosFiltrados = [eventos as ProductDB];
  }

  // Función para revalidar eventos
  const revalidarEventos = async () => {
    try {
      await fetch('/api/product/getProducts?tipo=evento', {
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache' }
      });
      // Recargar la página para mostrar los nuevos eventos
      window.location.reload();
    } catch (error) {
      console.log('Error revalidando eventos:', error);
    }
  };

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

  return (
    <div className="min-h-screen bg-white font-montserrat">
      <MainSideBar where={'events'}>
      {/* Header Hero */}
      <div className="relative bg-gradient-to-r from-gray-900 to-black text-white overflow-hidden">
        {/* Imagen de fondo con opacidad */}
        <div className="absolute inset-0">
          {/* Imagen para PC (pantallas grandes) */}
          <div className="hidden md:block absolute inset-0">
            <CldImage
              src="my_uploads/heltjmqtdfe5tfjqlxbo"
              alt="Eventos background desktop"
              fill
              className="object-cover"
              priority
            />
          </div>
          
          {/* Imagen para móvil (pantallas pequeñas) */}
          <div className="block md:hidden absolute inset-0">
            <CldImage
              src="my_uploads/kmd22ujy6fawdhrcumid"
              alt="Eventos background mobile"
              fill
              className="object-cover"
              priority
            />
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/70 to-black/70"></div>
        </div>
        
        {/* Contenido del hero */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-56">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 font-montserrat">
              Eventos
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto font-montserrat font-light">
              Descubre experiencias únicas diseñadas para transformar tu movimiento y conectarte con una comunidad hermosa
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 text-gray-300">
              <div className="flex items-center space-x-2">
                <CalendarDaysIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="font-montserrat text-sm sm:text-base">{Array.isArray(eventos) ? eventos.length : 1} eventos disponibles</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPinIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="font-montserrat text-sm sm:text-base">Online y presenciales</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Bloque filosófico */}
      <div className="w-full bg-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <blockquote className="text-2xl lg:text-3xl font-light text-gray-700 leading-relaxed font-montserrat italic mb-6">
            "El verdadero crecimiento no vive en la comodidad de lo conocido, 
            sino en descubrir lo que es posible."
          </blockquote>
          <div className="h-px bg-gradient-to-r from-transparent via-[#234C8C] to-transparent w-24 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 font-montserrat max-w-2xl mx-auto">
            Cada evento es una oportunidad para conectar con tu potencial. 
            Te acompañamos en este viaje con transparencia, dedicación y respeto por tu proceso personal.
          </p>
        </div>
      </div>
      </div>
      {/* Filtros Premium */}
      <div className="w-full bg-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Lista de eventos premium */}
        {Array.isArray(eventosFiltrados) && eventosFiltrados.length > 0 ? (
          <div className="space-y-8">
            {/* Header de resultados */}
            <div className="flex items-center justify-between flex-col md:flex-row">
              <div className="flex items-center space-x-4">
                <h3 className="text-3xl font-bold text-gray-900 font-montserrat">
                  Experiencias únicas
                </h3>
      
              </div>
              <p className="text-gray-600 font-montserrat font-light">
                {eventosFiltrados.length} {eventosFiltrados.length === 1 ? 'evento' : 'eventos'}
              </p>
            </div>
              
              {/* Ordenamiento */}
              <div className="hidden md:flex items-center space-x-4">
                <span className="text-sm text-gray-600 font-montserrat">Ordenar por:</span>
                <select className="px-3 py-2 text-black bg-white border border-gray-300 rounded-lg text-sm font-montserrat focus:ring-2 focus:ring-[#234C8C] focus:border-transparent">
                  <option>Fecha más próxima</option>
                  <option>Precio menor</option>
                  <option>Más popular</option>
                </select>
              </div>
            
            {/* Grid de eventos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
              {eventosFiltrados.map((evento, index) => (
                <EventCard key={evento._id || evento.id || index} evento={evento} />
              ))}
            </div>
            
            {/* CTA para más eventos */}
            {eventosFiltrados.length >= 6 && (
              <div className="text-center pt-8">
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-gray-100 to-gray-50 px-6 py-3 rounded-full border border-gray-200">
                  <span className="text-gray-700 font-montserrat">¿No encuentras lo que buscas?</span>
                  <a href="/mentorship/consulta" className="text-[#234C8C] font-semibold font-montserrat hover:text-[#1a3d73] transition-colors">
                    Consulta personalizada →
                  </a>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Estado vacío premium */
          <div className="text-center py-20">
            <div className="max-w-lg mx-auto">
              {/* Icono grande con gradiente */}
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <CalendarDaysIcon className="h-12 w-12 text-gray-400" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4 font-montserrat">
                Próximamente eventos exclusivos
              </h3>
              
              <p className="text-gray-600 font-montserrat font-light mb-8">
                Estamos preparando experiencias únicas que transformarán tu manera de ver el fitness. Sé el primero en enterarte.
              </p>
              
              {/* CTA */}
              <div className="flex justify-center">
                <a 
                  href="/mentorship"
                  className="px-6 py-3 bg-gradient-to-r from-[#234C8C] to-[#1a3d73] text-white rounded-xl font-semibold font-montserrat hover:shadow-lg transition-all duration-300"
                >
                  Explorar mentoría
                </a>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Tira Promocional Premium de Mentoría */}
      <div className="bg-black relative overflow-hidden">
        {/* Patrón de fondo sutil */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        {/* Contenido principal */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Contenido - 7 columnas */}
            <div className="lg:col-span-7 space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#234C8C] to-[#1a3d73] px-4 py-2 rounded-full">
                <span className="text-white text-sm font-medium font-montserrat">Entrena Conmigo</span>
              </div>
              
              {/* Título principal */}
              <div className="space-y-4">
                <h2 className="text-4xl lg:text-5xl font-bold text-white font-montserrat leading-tight">
                  ¿Listo para el 
                  <span className="bg-gradient-to-r from-[#234C8C] to-[#5FA8E9] bg-clip-text text-transparent"> siguiente nivel</span>?
                </h2>
                <p className="text-xl text-gray-300 font-montserrat font-light max-w-2xl">
                  Transforma tu movimiento con el programa de mentoría personalizado. 
                </p>
              </div>

              {/* Estadísticas */}
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start space-x-2 mb-2">
                    <UserGroupIcon className="h-6 w-6 text-[#5FA8E9]" />
                    <span className="text-2xl font-bold text-white font-montserrat">10+</span>
                  </div>
                  <p className="text-gray-400 text-sm font-montserrat">Movimiento transformado</p>
                </div>
                <div className="text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start space-x-2 mb-2">
                    <ChartBarIcon className="h-6 w-6 text-[#5FA8E9]" />
                    <span className="text-2xl font-bold text-white font-montserrat">95%</span>
                  </div>
                  <p className="text-gray-400 text-sm font-montserrat">Satisfacción garantizada</p>
                </div>
                <div className="text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start space-x-2 mb-2">
                    <SparklesIcon className="h-6 w-6 text-[#5FA8E9]" />
                    <span className="text-2xl font-bold text-white font-montserrat">1-1</span>
                  </div>
                  <p className="text-gray-400 text-sm font-montserrat">Estoy contigo</p>
                </div>
              </div>

              {/* Beneficios únicos */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white font-montserrat">Lo que hace a este programa tentador:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    'Evaluación personal',
                    'Plan adaptado a tus objetivos',
                    'Seguimiento 1:1',
                    'Comunidad de movers',
                    'Recursos solo para ti',
                    'Garantía de resultados'
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-gradient-to-r from-[#fff] to-[#fff] rounded-full"></div>
                      <span className="text-gray-200 font-montserrat text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href="/mentorship"
                  className="group inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-[#234C8C] to-[#1a3d73] text-white px-8 py-4 rounded-xl font-semibold hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:-translate-y-1 font-montserrat"
                >
                  <span>Explorar Mentoría</span>
                  <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </a>
                <a 
                  href="/mentorship/consulta"
                  className="inline-flex items-center justify-center space-x-2 border border-gray-600 text-gray-300 px-8 py-4 rounded-xl font-semibold hover:border-[#234C8C] hover:text-[#234C8C] transition-colors duration-300 font-montserrat"
                >
                  <span>Consulta Gratuita</span>
                </a>
              </div>
            </div>
            
            {/* Imagen - 5 columnas */}
            <div className="lg:col-span-5">
              <div className="relative">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#234C8C]/20 to-transparent rounded-3xl blur-3xl"></div>
                
                {/* Imagen principal */}
                <div className="relative h-80 lg:h-96 rounded-3xl overflow-hidden">
                  <CldImage
                    src="my_uploads/xx2fmtbhze48ocb9rahg"
                    alt="Mentoría personalizada premium"
                    fill
                    className="object-cover"
                  />
                  {/* Overlay con gradiente */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                  
                  {/* Badge floating */}
                  <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full">
                    <span className="text-black font-semibold text-sm font-montserrat">Programa</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
      {/* Footer Component */}
      <Footer />
      </MainSideBar>
    </div>
  );
};

export default EventsList; 