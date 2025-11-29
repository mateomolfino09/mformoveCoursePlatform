'use client'
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

const MoveCrewTestimonials = () => {
  const scrollToPlans = () => {
    const element = document.getElementById('move-crew-plans');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-20 bg-white font-montserrat">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <p className="uppercase tracking-[0.3em] text-xs md:text-sm text-gray-500 mb-3">Resultados reales</p>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-black">
            Lo que dicen quienes entrenan conmigo
          </h2>
          <p className="text-lg md:text-xl text-gray-600 font-light max-w-3xl mx-auto leading-relaxed">
            Alumnos que están transformando su relación con el movimiento
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative bg-gradient-to-br from-gray-50 via-amber-50/20 to-orange-50/10 backdrop-blur-sm rounded-3xl p-6 md:p-8 border border-amber-200/40 hover:from-amber-50/30 hover:via-orange-50/20 hover:to-rose-50/10 transition-all duration-300 flex flex-col overflow-hidden"
            >
              {/* Decoración sutil de fondo */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-200/10 to-orange-200/5 rounded-full blur-2xl" />
              
              <div className="relative z-10">
              <div className="mb-6">
                <svg viewBox="0 0 24 24" className="w-8 h-8 text-black/20">
                  <path 
                    fill="currentColor" 
                    d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"
                  />
                </svg>
              </div>

              <div className="mb-8 flex-1">
                <p className="text-sm md:text-base text-gray-700 font-light leading-relaxed">
                  {testimonial.text}
                </p>
              </div>

              <div className="w-full h-px bg-black/10 mb-6"/>
              <div className="flex items-center space-x-4">
                {/* Profile Image */}
                <div className="w-12 h-12 rounded-full overflow-hidden border border-black/10 flex-shrink-0">
                  <img
                    src={testimonial.photo}
                    alt={testimonial.name}
                    className="w-full h-full object-cover grayscale-[30%]"
                  />
                </div>
                
                {/* Profile Info */}
                <div>
                  <h4 className="font-semibold text-black text-sm md:text-base mb-1">{testimonial.name}</h4>
                  <p className="text-gray-500 text-xs md:text-sm font-light">{testimonial.plan}</p>
                </div>
              </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <button
            onClick={scrollToPlans}
            className="group relative bg-black text-white px-8 py-3.5 rounded-full font-medium text-base md:text-lg tracking-wide hover:bg-gray-900 transition-all duration-300 border border-black/10 hover:border-black/20 shadow-sm hover:shadow-md"
          >
            <span className="relative z-10">Quiero estos resultados</span>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-orange-500/0 group-hover:from-amber-500/10 group-hover:via-amber-500/15 group-hover:to-orange-500/10 transition-all duration-300 opacity-0 group-hover:opacity-100" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default MoveCrewTestimonials;

