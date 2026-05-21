'use client'
import { motion } from 'framer-motion';

const CourseStructure = () => {
  const pillars = [
    {
      title: 'Acceso total desde el día 1',
      description:
        'Las 5 dimensiones del método disponibles para que empieces por donde tu cuerpo lo necesita.',
      bullets: [
        'Regulación, arquitectura corporal, capacidades, expresión y rehabilitación.',
        'Guías para que no te pierdas: qué hacer, cuándo y por qué.',
      ]
    },
    {
      title: 'Acompañamiento (6 meses en vivo)',
      description:
        'Un espacio real para despejar dudas, corregir técnica y profundizar en la práctica.',
      bullets: [
        'Sesiones en vivo para ajustar lo importante: respiración, alineación, ritmo y tensión.',
        'Volvés a mirar tu cuerpo con criterio, no con confusión.',
        'Construís continuidad sin lastimarte.',
      ]
    },
    {
      title: 'Soberanía de práctica',
      description:
        'Aprendés a adaptar cada movimiento a tu nivel actual (progresiones y regresiones).',
      bullets: [
        'Sabés qué hacer si estás rígido, cansado o con molestias.',
        'Sabés cómo progresar sin forzar.',
        'Dejás de depender de un instructor para estar bien en tu cuerpo.',
      ]
    },
    {
      title: 'Propósito final',
      description:
        'Que recuperes independencia física: menos dolor, más fuerza útil y más calma.',
      bullets: [
        'Sostenerte con menos esfuerzo (arquitectura corporal).',
        'Moverte con seguridad (rehabilitación y prevención).',
      ]
    }
  ];

  return (
    <section
      className="relative isolate overflow-hidden py-12 md:py-14 bg-palette-ink text-palette-cream font-montserrat"
      id="membership-structure"
    >
      <div className="pointer-events-none absolute -top-40 right-[-15%] h-[380px] w-[380px] rounded-full bg-palette-steel/25 blur-[100px]" aria-hidden />
      <div className="pointer-events-none absolute bottom-[-30%] left-[-18%] h-[440px] w-[440px] rounded-full bg-palette-sage/12 blur-[110px]" aria-hidden />
      <div className="relative w-[85%] max-w-6xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className="mb-8 md:mb-10 mx-auto max-w-3xl"
        >
          <p className="mc-text-glow-ink font-montserrat uppercase tracking-[0.2em] text-sm md:text-base text-palette-cloud/80 mb-2">
            Cómo funciona
          </p>
          <h2 className="mc-text-glow-ink-title text-[1.85rem] md:text-5xl lg:text-[2.65rem] font-montserrat font-semibold text-palette-cream tracking-tight mb-4 leading-[1.08]">
            Qué estás comprando (en serio)
          </h2>
          <p className="mc-text-glow-ink font-raleway italic text-palette-cloud/95 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Un programa con principio y fin. Y un método que te queda para siempre.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-5 md:gap-6">
          {pillars.map((pillar, index) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative border-t-2 border-palette-sage/45 pt-5 md:pt-6 py-4 md:py-5 text-center"
            >
              <h3 className="mc-text-glow-ink-title text-xl md:text-2xl font-montserrat font-semibold text-palette-cream mb-3 tracking-tight">
                {pillar.title}
              </h3>
              <p className="mc-text-glow-ink text-palette-cloud/95 text-base md:text-lg leading-relaxed mb-5 font-light">
                {pillar.description}
              </p>
              <ul className="space-y-4">
                {pillar.bullets.map((bullet) => (
                  <li
                    key={bullet}
                    className="flex flex-col items-center gap-2 text-palette-cream/90 text-base md:text-lg font-light leading-snug md:leading-relaxed"
                  >
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-palette-sage" />
                    <span className="mc-text-glow-ink max-w-md">{bullet}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CourseStructure;
