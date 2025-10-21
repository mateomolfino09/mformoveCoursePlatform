import React from 'react';
import { motion } from 'framer-motion';

const MentorshipBio = () => {
  return (
    <section className="py-10 bg-black font-montserrat">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Intro personal breve */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row items-start gap-8 md:gap-12">
            {/* Foto */}
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border border-white/20 flex-shrink-0">
              <img 
                src="https://res.cloudinary.com/dbeem2avp/image/upload/v1751917144/my_uploads/plaza/IMG_0333_mheawa.jpg" 
                alt="Mateo Molfino" 
                className="w-full h-full object-cover grayscale-[30%]" 
                style={{ objectPosition: 'center 10%' }} 
              />
            </div>
            
            {/* Texto */}
            <div className="flex-1">
              <h2 className="text-3xl md:text-3xl font-semibold mb-4 text-white">
                El origen de mi metodología
              </h2>
              <p className="text-base md:text-lg text-white/70 font-light leading-relaxed mb-4">
Mi nombre es Mateo, siempre fui apasionado por el movimiento y la ciencia. Estudié ingeniería, soy profesor de yoga y me apasiona el funcionamiento del cuerpo y el mundo. Creo fuertemente que hay una relación entre el movimiento y la vida, asi como entre el cuerpo y el mundo. <br/> <br/>
              
                Mi misión es entender el funcionamiento de tu cuerpo en profundidad y construir estrategias sólidas para enriquecer su movimiento, entendiendolo como expresión única del diálogo con el entorno, desde el día en que naciste hasta el día de hoy.
              </p>
            </div>
          </div>
        </motion.div>

                        {/* Hexagonal Focus SVG */}
                        <div className="mt-6 mb-6 flex justify-center">
              <img 
                src="/images/svg/HexgaonalFocus3.svg" 
                alt=""
                className="w-full h-full opacity-60 invert"
              />
            </div>

        {/* Filosofía y ciencia */}
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Filosofía */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            viewport={{ once: true }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
          >
            <h3 className="text-xl md:text-2xl font-semibold mb-4 text-white">
              Filosofía
            </h3>
            <div className="space-y-4 text-white/70 font-light leading-relaxed text-sm md:text-base">
              <p>
                El movimiento no es solo ejercicio. Es una forma de conocerte, de conocer tus limitaciones y expandirlas. No se trata de ser el mejor en un objetivo puntual, sino de exponerte a tus debilidades constantemente para crecer.
              </p>
              <p>
                Trabajo desde la cocreación. Si algo no funciona, lo ajustamos. Si necesitás más tiempo, te lo doy. Si estás listo para más, avanzamos. La mentoría es tu proceso, no el mío.
              </p>
            </div>
            
   
          </motion.div>

          {/* Ciencia detrás */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            viewport={{ once: true }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
          >
            <h3 className="text-xl md:text-2xl font-semibold mb-4 text-white">
              El método (y su ciencia)
            </h3>
            <div className="space-y-4 text-white/70 font-light leading-relaxed text-sm md:text-base">
              <p>
              Trabajo con la integralidad del cuerpo, desde el tejido conectivo hasta la biomoción. No somos músculos aislados, sino una unidad viva donde tensiones y compresiones convergen y se equilibran.
              </p>
              <p>
                El aprendizaje motor requiere repetición, feedback constante y tiempo para procesar. Por eso la mentoría es trimestral mínimamente: cambiar patrones de movimiento lleva semanas de estudio, observación y práctica.
              </p>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
};

export default MentorshipBio; 