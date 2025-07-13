import React from 'react';
import { motion } from 'framer-motion';

const bioVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut' } },
};

const MentorshipBio = () => {
  return (
    <section className="py-16 bg-black font-montserrat">
      <motion.div
        className="max-w-3xl mx-auto px-4 md:px-6 flex flex-col items-center text-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={bioVariants}
      >
        {/* Foto con glow y animación */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          viewport={{ once: true }}
          className="relative mb-8 group cursor-pointer"
        >
          <div className="absolute -inset-2 rounded-full bg-[#234C8C] blur-2xl opacity-40 z-0 group-hover:opacity-60 group-hover:blur-3xl transition-all duration-300" />
          {/* Borde gradiente blanco a dorado */}
          <div className="w-36 h-36 md:w-40 md:h-40 rounded-full p-0.5 bg-gradient-to-br from-white to-[#7a7036] relative z-10 shadow-xl group-hover:scale-105 group-hover:rotate-1 transition-all duration-300">
            <div className="w-full h-full rounded-full overflow-hidden bg-black">
              <img src="https://res.cloudinary.com/dbeem2avp/image/upload/v1751917144/my_uploads/plaza/IMG_0333_mheawa.jpg" alt="Mateo Molfino" className="w-full h-full object-cover" style={{ objectPosition: 'center 10%' }} />
            </div>
          </div>
        </motion.div>
        {/* Tarjeta glassmorphism para el texto */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl px-4 py-8 md:px-10 md:py-10 max-w-2xl mx-auto shadow-lg border border-[#234C8C]/20">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 tracking-wide" style={{ color: 'white', letterSpacing: '0.04em' }}>
            Mateo Molfino
          </h2>
          {/* Separador decorativo */}
          <div className="w-12 h-1 mx-auto mb-4 rounded-full bg-[#234C8C]/70 group-hover:w-16 transition-all duration-300" />
          <p className="text-lg italic mb-4" style={{ color: 'white' }}>
            “Moverse es el arte de reconocerse.”
          </p>
          <p className="text-base text-white/80 max-w-xl mx-auto">
            Soy especialista en movimiento consciente, biomecánica y entrenamiento funcional. Mi misión es acompañarte a descubrir tu potencial, moverte mejor y disfrutar el proceso de transformación. Cada mentoría es única, adaptada a tu historia y objetivos. ¿Listo para dar el siguiente paso?
          </p>
        </div>
      </motion.div>
    </section>
  );
};

export default MentorshipBio; 