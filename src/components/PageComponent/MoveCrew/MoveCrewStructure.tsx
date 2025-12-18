'use client'
import { motion } from 'framer-motion';

const MoveCrewStructure = () => {
  const pillars = [
    {
      title: 'Camino del Gorila',
      description:
        'Te doy clases de 15-25 minutos y audios cortos para que avances a tu ritmo.',
      bullets: [
        '1 clase y 1 audio de reflexión/meditación nuevo cada semana',
        'Progresiones pensadas para principiantes, intermedios y avanzados',
      ]
    },
    {
      title: 'Filosofía',
      description:
        'Busco tu constancia, autoconocimiento y exploración. Las U.C. premian tu camino en el movimiento.',
      bullets: [
        'U.C. (Unidades de Coherencia) por completar semanas',
        'Acceso a canjes y programas especiales al sostener tu racha de entrenamiento'
      ]
    },
    {
      title: 'Dedicación semanal',
      description:
        'Queremos cumplir la semana sin quemarte.',
      bullets: [
        'Planificación pensada para agenda real',
        'Bloques breves y acumulativos',
      ]
    },
    {
      title: 'Soporte y Q&A',
      description:
        'Te respondo por Telegram y grabamos un Q&A cada miércoles para cuidar tu tiempo.',
      bullets: [
        'Telegram para dudas rápidas y feedback',
        'Q&A semanal grabado (los miércoles)',
        'Enfoque asíncrono para no bloquear tu agenda'
      ]
    }
  ];

  return (
    <section className="py-20 bg-black text-white font-montserrat" id="move-crew-structure">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <p className="uppercase tracking-[0.3em] text-xs md:text-sm text-white/50 mb-3">Cómo funciona</p>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Un ritmo pensado para servir a tu vida</h2>
          <p className="text-base md:text-xl text-white/70 max-w-3xl font-light">
            Te llevo semana a semana con el Camino del Gorila. Te doy el tiempo justo para progresar sin quemarte, y te acompaño con ciclos que sostienen tu constancia y tus canjes de U.C.
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
              className="relative rounded-3xl border border-amber-300/20 bg-gradient-to-br from-white/10 via-amber-500/5 to-orange-500/5 backdrop-blur-sm p-8 overflow-hidden"
            >
              {/* Decoración sutil de fondo */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400/10 to-orange-400/5 rounded-full blur-3xl" />
              
              <div className="relative z-10">
              <h3 className="text-2xl font-semibold mb-3">{pillar.title}</h3>
              <p className="text-white/80 text-sm md:text-base leading-relaxed mb-6 font-light">
                {pillar.description}
              </p>
              <ul className="space-y-4">
                {pillar.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-3 text-white/70 text-sm md:text-base">
                    <span className="w-2 h-2 rounded-full bg-white mt-2"></span>
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
