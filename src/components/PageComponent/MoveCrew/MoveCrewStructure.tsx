'use client'
import { motion } from 'framer-motion';

const MoveCrewStructure = () => {
  const pillars = [
    {
      title: 'Un ritmo que acompaña',
      description:
        'Una práctica con dirección, sin apurarte y sin perderte en “qué toca hacer”.',
      bullets: [
        'Una guía clara para que tengas continuidad sin rigidez.',
        'Espacio para ajustar según tu día, tu energía y tu momento.',
      ]
    },
    {
      title: 'Movimiento como práctica viva',
      description:
        'No se trata de acumular “movimientos”, sino de habitar el movimiento y observar lo que ocurre.',
      bullets: [
        'El foco está en el individuo: tu estructura, tu historia, tu presencia.',
        'Más que adaptarnos, nos deslizamos conservando el equilibrio; nos regeneramos, autoemergemos.',
        'La variabilidad aparece como una forma de escucharnos y volver disponibles.'
      ]
    },
    {
      title: 'Encuentro y expresión',
      description:
        'La práctica se vuelve más profunda cuando se comparte: importa el movimiento, pero más todavía las relaciones vivas.',
      bullets: [
        'Encuentros para refinar y darle intención a lo que entrenás.',
        'Después aparecen las expresiones: baile, lucha, locomociones.',
        'Formas distintas para una misma disponibilidad que crece en colectivo.'
      ]
    },
    {
      title: 'Acompañamiento',
      description:
        'Un sostén real para no practicar solo y para sostener la continuidad.',
      bullets: [
        'Un espacio de intercambio para dudas, ajustes y mirada externa.',
        'Practicamos en red: compartir también es parte del proceso.'
      ]
    }
  ];

  return (
    <section className="py-16 md:py-20 bg-palette-ink text-palette-cream font-montserrat" id="membership-structure">
      <div className="w-[85%] max-w-6xl mx-auto px-4 text-left">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className="mb-10 md:mb-12"
        >
          <p className="font-montserrat uppercase tracking-[0.2em] text-xs md:text-sm text-palette-cream/60 mb-2">Cómo funciona</p>
          <h2 className="text-2xl md:text-4xl font-montserrat font-semibold text-palette-cream tracking-tight mb-4">
            Un ritmo pensado para servir a tu vida
          </h2>
          <p className="font-raleway italic text-palette-cream/80 text-base md:text-lg max-w-3xl leading-relaxed">
            Una práctica viva no se impone: se organiza para sostenerte. Con dirección, con espacio, y con un colectivo que amplifica lo posible.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {pillars.map((pillar, index) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative rounded-2xl md:rounded-3xl border border-palette-sage/20 bg-white/5 backdrop-blur-sm p-8 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-palette-sage/10 rounded-full blur-3xl" />
              
              <div className="relative z-10">
              <h3 className="text-xl md:text-2xl font-montserrat font-semibold text-palette-cream mb-3 tracking-tight">{pillar.title}</h3>
              <p className="text-palette-cream/85 text-sm md:text-base leading-relaxed mb-6 font-light">
                {pillar.description}
              </p>
              <ul className="space-y-4">
                {pillar.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-3 text-palette-cream/75 text-sm md:text-base">
                    <span className="w-2 h-2 rounded-full bg-palette-sage mt-2 flex-shrink-0" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MoveCrewStructure;
