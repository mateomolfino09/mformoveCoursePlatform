'use client'
import { motion } from 'framer-motion';

const MoveCrewStructure = () => {
  const pillars = [
    {
      title: 'Camino',
      description:
        'Contenido nuevo todas las semanas para que avances a tu ritmo.',
      bullets: [
        'Contenido nuevo todas las semanas',
        'Progresiones pensadas para principiantes, intermedios y avanzados',
      ]
    },
    {
      title: 'Filosofía',
      description:
        'Busco tu constancia, autoconocimiento y exploración. Las U.C. incentivan tu camino en el movimiento.',
      bullets: [
        'U.C. (Unidades de Coherencia) por completar semanas',
        'Acceso a canjes y programas especiales al sostener tu racha de entrenamiento'
      ]
    },
    {
      title: 'Dedicación semanal',
      description:
        'Quiero que cumplas la semana sin quemarte.',
      bullets: [
        'Planificación pensada para agenda real',
        'Bloques breves y acumulativos',
      ]
    },
    {
      title: 'Soporte y Q&A',
      description:
        'Te respondo por WhatsApp y grabamos un Q&A cada miércoles para cuidar tu tiempo.',
      bullets: [
        'WhatsApp para dudas rápidas y feedback',
        'Q&A semanal grabado (los miércoles)',
        'Enfoque asíncrono para no bloquear tu agenda'
      ]
    }
  ];

  return (
    <section className="py-16 md:py-20 bg-palette-ink text-palette-cream font-montserrat" id="move-crew-structure">
      <div className="w-[85%] max-w-6xl mx-auto px-4">
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
            Programación semanal. Contenido nuevo todas las semanas.
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
