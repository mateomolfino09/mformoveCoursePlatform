'use client'
import React from 'react';
import { motion } from 'framer-motion';

const testimonials = [
  {
    name: 'Ignacio Luz',
    plan: 'Mentoría',
    photo: '/images/testimonials/testimonio_nacho.jpg',
    text: 'La mentoría con Mateo es una experiencia transformadora. Gracias a su mirada precisa y su acompañamiento constante, hoy me siento mucho más conectado con mi cuerpo y más cerca de los resultados que deseo.'
  },
  {
    name: 'Sofía Velozo',
    plan: 'Mentoría',
    photo: '/images/testimonials/sofia.jpeg',
    text: 'Nunca había sentido un progreso tan real y sostenido. Mateo te motiva, te corrige y te acompaña en cada paso. Recomiendo la mentoría a cualquiera que busque un cambio profundo.'
  },
  {
    name: 'Gonzalo Amado',
    plan: 'Mentoría',
    photo: '/images/testimonials/gonza.jpg',
    text: 'Mateo como profe es excelente. Siempre te pone a prueba, te motiva y celebra tus intentos, sin importar el resultado. Lo recomiendo al 100% si querés sentirte más libre, con confianza en cada movimiento, y rodeado de un ambiente de amistad.'
  }
];

const MentorshipTestimonials = () => {
  return (
    <section className="pt-6 pb-10 bg-[#FAF8F3] font-montserrat">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <p className="uppercase tracking-[0.3em] text-xs md:text-sm text-gray-500 mb-3">Testimonios</p>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-black">
            Testimonios de alumnos
          </h2>
          <p className="text-lg md:text-xl text-gray-600 font-light max-w-3xl leading-relaxed">
          Lo que dicen quienes entrenan conmigo
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-white via-[#FAF8F3]/50 to-[#F5F1E8]/30 backdrop-blur-sm rounded-3xl p-6 md:p-8 border border-[#AF50E5]/20 hover:bg-gradient-to-br hover:from-white hover:via-[#FAF8F3] hover:to-[#F5F1E8] transition-all duration-300 flex flex-col shadow-[0_4px_20px_rgba(175,80,229,0.08)] hover:shadow-[0_24px_48px_-12px_rgba(175,80,229,0.2)]"
            >
              {/* Quote mark - minimal */}
              <div className="mb-6">
                <svg viewBox="0 0 24 24" className="w-8 h-8 text-[#AF50E5]/30">
                  <path 
                    fill="currentColor" 
                    d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"
                  />
                </svg>
              </div>

              {/* Testimonial Text */}
              <div className="mb-8 flex-1">
                <p className="text-sm md:text-base text-gray-700 font-light leading-relaxed">
                  {testimonial.text}
                </p>
              </div>

              {/* Separator */}
              <div className="w-full h-px bg-[#AF50E5]/20 mb-6"/>

              {/* Profile Section */}
              <div className="flex items-center space-x-4">
                {/* Profile Image */}
                <div className="w-12 h-12 rounded-full overflow-hidden border border-[#AF50E5]/20 flex-shrink-0">
                  <img
                    src={testimonial.photo}
                    alt={testimonial.name}
                    className="w-full h-full object-cover grayscale-[30%]"
                  />
                </div>
                
                {/* Profile Info */}
                <div>
                  <h4 className="font-semibold text-black text-sm md:text-base">{testimonial.name}</h4>
                  <p className="text-gray-500 text-xs md:text-sm font-light">{testimonial.plan}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MentorshipTestimonials; 