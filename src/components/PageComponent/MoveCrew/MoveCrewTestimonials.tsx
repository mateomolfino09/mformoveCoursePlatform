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
    <section className="py-16 md:py-20 bg-palette-cream font-montserrat">
      <div className="w-[85%] max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className="mb-10 md:mb-12 text-start md:text-left"
        >
          <p className="font-montserrat uppercase tracking-[0.2em] text-xs md:text-sm text-palette-stone/80 mb-2">Resultados reales</p>
          <h2 className="text-2xl md:text-4xl font-montserrat font-semibold text-palette-ink tracking-tight mb-4">
            Lo que dicen quienes entrenan conmigo
          </h2>
          <p className="font-raleway italic text-palette-stone text-base md:text-lg max-w-2xl mx-auto md:mx-0 leading-relaxed">
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
              className="relative bg-palette-cream rounded-2xl md:rounded-3xl p-6 md:p-8 border border-palette-stone/25 shadow-[0_4px_24px_rgba(20,20,17,0.06)] flex flex-col overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-palette-sage/10 rounded-full blur-2xl" />
              
              <div className="relative z-10">
              <div className="mb-6">
                <svg viewBox="0 0 24 24" className="w-8 h-8 text-palette-stone/30">
                  <path 
                    fill="currentColor" 
                    d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"
                  />
                </svg>
              </div>

              <div className="mb-8 flex-1">
                <p className="text-sm md:text-base text-palette-stone font-light leading-relaxed">
                  {testimonial.text}
                </p>
              </div>

              <div className="w-full h-px bg-palette-stone/20 mb-6"/>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-palette-stone/25 flex-shrink-0">
                  <img
                    src={testimonial.photo}
                    alt={testimonial.name}
                    className="w-full h-full object-cover grayscale-[30%]"
                  />
                </div>
                <div>
                  <h4 className="font-montserrat font-semibold text-palette-ink text-sm md:text-base mb-1">{testimonial.name}</h4>
                  <p className="text-palette-stone text-xs md:text-sm font-light">{testimonial.plan}</p>
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
          className="text-center md:text-left"
        >
          <button
            onClick={scrollToPlans}
            className="font-montserrat font-semibold text-sm uppercase tracking-[0.2em] rounded-full px-6 py-3 bg-palette-ink text-palette-cream border-2 border-palette-ink hover:bg-palette-sage hover:border-palette-sage transition-all duration-200"
          >
            Quiero estos resultados
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default MoveCrewTestimonials;

