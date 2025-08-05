'use client'
import React from 'react';
import { motion } from 'framer-motion';

import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid';

const testimonials = [
  {
    name: 'Ignacio Luz',
    plan: 'Mentoría Estudiante',
    photo: '/images/testimonials/testimonio_nacho.jpg',
    text: 'La mentoría con Mateo es una experiencia transformadora. Gracias a su mirada precisa y su acompañamiento constante, hoy me siento mucho más conectado con mi cuerpo y más cerca de los resultados que deseo.',
    rating: 5,
    achievement: 'Transformación completa'
  },
  {
    name: 'Sofía Velozo',
    plan: 'Mentoría Practicante',
    photo: '/images/testimonials/sofia.jpeg',
    text: 'Nunca había sentido un progreso tan real y sostenido. Mateo te motiva, te corrige y te acompaña en cada paso. Recomiendo la mentoría a cualquiera que busque un cambio profundo.',
    rating: 5,
    achievement: 'Progreso sostenido'
  },
  {
    name: 'Gonzalo Amado',
    plan: 'Mentoría Explorador',
    photo: '/images/testimonials/gonza.jpg',
    text: 'Mateo como profe es excelente. Siempre te pone a prueba, te motiva y celebra tus intentos, sin importar el resultado. Lo recomiendo al 100% si querés sentirte más libre, con confianza en cada movimiento, y rodeado de un ambiente de amistad.',
    rating: 5,
    achievement: 'Libertad de movimiento'
  }
];

const MentorshipTestimonials = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 via-white to-gray-100 font-montserrat relative overflow-hidden">
      {/* Background decorative elements */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="absolute inset-0"
      >
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-[#234C8C]/20 to-blue-300/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-gray-100 to-gray-200 rounded-full blur-3xl opacity-20"></div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="relative">
            {/* Decorative elements */}
            <motion.div 
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              viewport={{ once: true }}
              className="absolute -top-4 left-1/2 transform -translate-x-1/2"
            >
              <div className="w-16 h-1 bg-gradient-to-r from-transparent via-[#234C8C] to-transparent rounded-full"></div>
            </motion.div>
            
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-[#234C8C] via-blue-600 to-blue-700 bg-clip-text text-transparent">
                Voces de
              </span>
              <br />
              <span className="bg-gradient-to-r from-gray-800 via-gray-900 to-black bg-clip-text text-transparent">
                Transformación
              </span>
            </h2>
            
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Descubre cómo nuestros alumnos han transformado su práctica de movimiento
            </p>
          </div>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative group"
            >
              {/* Glow Effect */}
              <motion.div 
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="absolute -inset-1 bg-gradient-to-r from-[#234C8C]/20 via-blue-500/20 to-[#234C8C]/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              ></motion.div>
              
              {/* Main Card */}
              <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50 hover:shadow-3xl transition-all duration-300 group-hover:scale-102 h-full flex flex-col">
                
                {/* Quote Icon */}
                <motion.div 
                  initial={{ scale: 0, rotate: -180 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="absolute -top-4 left-8"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-[#234C8C] to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                    <ChatBubbleLeftRightIcon className="w-6 h-6 text-white" />
                  </div>
                </motion.div>

                {/* Rating Stars */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  viewport={{ once: true }}
                  className="flex justify-center mb-6 mt-4"
                >
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <motion.svg 
                      key={i} 
                      initial={{ opacity: 0, scale: 0, rotate: -180 }}
                      whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                      transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                      viewport={{ once: true }}
                      className="w-6 h-6 drop-shadow-sm"
                      viewBox="0 0 24 24"
                      fill="#fbbf24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </motion.svg>
                  ))}
                </motion.div>

                {/* Testimonial Text */}
                <div className="mb-8 flex-1">
                  <p className="text-gray-700 text-lg leading-relaxed italic text-center">
                    "{testimonial.text}"
                  </p>
                </div>

                {/* Achievement Badge */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                  viewport={{ once: true }}
                  className="mb-6 flex justify-center"
                >
                  <div className="bg-gradient-to-r from-[#234C8C]/10 to-blue-600/10 border border-[#234C8C]/20 rounded-full px-4 py-2">
                    <span className="text-sm font-semibold text-[#234C8C]">
                      {testimonial.achievement}
                    </span>
                  </div>
                </motion.div>

                {/* Profile Section */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.6 }}
                  viewport={{ once: true }}
                  className="flex items-center justify-center space-x-4"
                >
                  {/* Profile Image */}
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full overflow-hidden ring-4 ring-white shadow-lg">
                      <img
                        src={testimonial.photo}
                        alt={testimonial.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Status indicator */}
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  
                  {/* Profile Info */}
                  <div className="text-center">
                    <h4 className="font-bold text-gray-800 text-lg">{testimonial.name}</h4>
                    <p className="text-[#234C8C] font-medium">{testimonial.plan}</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MentorshipTestimonials; 