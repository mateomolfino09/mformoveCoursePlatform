'use client'
import { motion } from 'framer-motion';

const MoveCrewStructure = () => {
  const pillars = [
    {
      title: 'Plan trimestral',
      description:
        'Tres meses para ordenar tu práctica, integrar nuevas progresiones y darle tiempo al cuerpo para adaptarse sin dolor.',
      bullets: [
        'Ritmo semanal con bloques cortos',
        'Seguimiento general y recordatorios',
        'Desafío activo para mantener motivación'
      ]
    },
    {
      title: 'Plan anual',
      description:
        'Pensado para quienes quieren sostener el hábito todo el año, ahorrar y combinar bloques de movilidad, fuerza y exploración.',
      bullets: [
        'Acceso a todas las planificaciones trimestrales',
        'Mayor profundidad en los contenidos educativos',
        'Espacios extra para revisar avances cada trimestre'
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
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Un ritmo pensado para tu vida real</h2>
          <p className="text-base md:text-xl text-white/70 max-w-3xl font-light">
            Trabajo por ciclos de tres meses porque tu cuerpo necesita tiempo para integrar cambios. Si querés ir más allá, el plan anual te deja sumar cuatro ciclos completos con foco en constancia, no en urgencias.
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
