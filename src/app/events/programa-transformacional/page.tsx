'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ClockIcon, 
  UserGroupIcon, 
  AcademicCapIcon, 
  PlayIcon,
  CheckIcon,
  StarIcon,
  ArrowRightIcon,
  CalendarIcon,
  VideoCameraIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function ProgramaTransformacionalPage() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const [isEnrolled, setIsEnrolled] = useState(false);

  // Fecha límite para inscripciones (ejemplo: 7 días desde ahora)
  const deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = deadline.getTime() - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [deadline]);

  const beneficios = [
    "Reconexión profunda con tu cuerpo",
    "Movimiento natural y fluido",
    "Fuerza orgánica y funcional",
    "Flexibilidad real y duradera",
    "Confianza en tus capacidades físicas",
    "Salida del sedentarismo",
    "Comunidad de apoyo continuo",
    "Resultados visibles en 8 semanas"
  ];

  const semanas = [
    {
      numero: 1,
      titulo: "Fundamentos del Movimiento",
      descripcion: "Establecemos las bases para una práctica sostenible"
    },
    {
      numero: 2,
      titulo: "Consciencia Corporal",
      descripcion: "Desarrollamos la conexión mente-cuerpo"
    },
    {
      numero: 3,
      titulo: "Movilidad y Flexibilidad",
      descripcion: "Liberamos tensiones y ampliamos rangos de movimiento"
    },
    {
      numero: 4,
      titulo: "Fuerza Orgánica",
      descripcion: "Construimos fuerza desde el centro"
    },
    {
      numero: 5,
      titulo: "Locomociones Naturales",
      descripcion: "Exploramos movimientos primitivos"
    },
    {
      numero: 6,
      titulo: "Juego y Expresión",
      descripcion: "Recuperamos la alegría del movimiento"
    },
    {
      numero: 7,
      titulo: "Integración y Fluidez",
      descripcion: "Conectamos todos los elementos"
    },
    {
      numero: 8,
      titulo: "Transformación Completa",
      descripcion: "Celebramos tu nueva relación con el movimiento"
    }
  ];

  return (
    <div className="min-h-screen bg-palette-cream font-montserrat text-palette-ink">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-palette-ink text-palette-cream">
        <div className="absolute inset-0 bg-palette-ink/20"></div>
        <div className="relative max-w-6xl mx-auto px-4 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="mb-6 inline-flex items-center rounded-full border border-palette-cream/40 px-4 py-2 font-montserrat text-[11px] font-semibold uppercase tracking-[0.16em] text-palette-cream">
                <StarIcon className="w-4 h-4 mr-2" />
                Programa Transformacional de 8 Semanas
              </div>
              
              <h1 className="mb-5 font-montserrat text-[clamp(2.8rem,6.5vw,5rem)] font-medium leading-[0.98] tracking-tight">
                Reconecta con tu{' '}
                <span className="text-palette-sage">
                  Cuerpo
                </span>
              </h1>
              
              <p className="mb-8 max-w-xl font-montserrat text-lg font-normal leading-relaxed text-palette-cream/85 md:text-xl">
                Un viaje de 8 semanas para transformar tu relación con el movimiento, 
                recuperar tu vitalidad y sentirte más fuerte, ágil y conectado.
              </p>

              {/* Countdown Timer */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8">
                <h3 className="text-lg font-semibold mb-4 text-center">
                  ⏰ Inscripciones cierran en:
                </h3>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div className="bg-white/20 rounded-lg p-3">
                    <div className="text-2xl font-bold">{timeLeft.days}</div>
                    <div className="text-sm">Días</div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3">
                    <div className="text-2xl font-bold">{timeLeft.hours}</div>
                    <div className="text-sm">Horas</div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3">
                    <div className="text-2xl font-bold">{timeLeft.minutes}</div>
                    <div className="text-sm">Min</div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3">
                    <div className="text-2xl font-bold">{timeLeft.seconds}</div>
                    <div className="text-sm">Seg</div>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/events/programa-transformacional/inscripcion"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-full border-2 border-palette-cream bg-palette-cream px-7 py-3 font-montserrat text-[12px] font-semibold uppercase tracking-[0.12em] text-palette-ink transition-colors hover:border-palette-sage hover:bg-palette-sage"
                >
                  <PlayIcon className="mr-2 h-4 w-4" />
                  Inscribirme Ahora
                  <ArrowRightIcon className="w-5 h-5 ml-2" />
                </Link>
                
                <button className="inline-flex items-center justify-center whitespace-nowrap rounded-full border-2 border-palette-cream/55 bg-transparent px-7 py-3 font-montserrat text-[12px] font-semibold uppercase tracking-[0.12em] text-palette-cream transition-colors hover:bg-palette-cream hover:text-palette-ink">
                  <VideoCameraIcon className="mr-2 h-4 w-4" />
                  Ver Video Introductorio
                </button>
              </div>
            </motion.div>

            {/* Image/Visual */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="rounded-lg border border-palette-cream/25 bg-palette-cream/5 p-8">
                <div className="text-center">
                  <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-palette-sage/50 bg-palette-sage/20">
                    <AcademicCapIcon className="h-12 w-12 text-palette-sage" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Programa Completo</h3>
                  <div className="space-y-3 text-left">
                    <div className="flex items-center">
                      <CheckIcon className="mr-3 h-5 w-5 text-palette-sage" />
                      <span>8 semanas de contenido</span>
                    </div>
                    <div className="flex items-center">
                      <CheckIcon className="mr-3 h-5 w-5 text-palette-sage" />
                      <span>Sesiones en vivo semanales</span>
                    </div>
                    <div className="flex items-center">
                      <CheckIcon className="mr-3 h-5 w-5 text-palette-sage" />
                      <span>Comunidad exclusiva</span>
                    </div>
                    <div className="flex items-center">
                      <CheckIcon className="mr-3 h-5 w-5 text-palette-sage" />
                      <span>Certificado de finalización</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="mb-4 font-montserrat text-[clamp(1.9rem,4vw,2.6rem)] font-medium tracking-tight text-palette-ink">
              ¿Qué lograrás en 8 semanas?
            </h2>
            <p className="mx-auto max-w-2xl font-montserrat text-base text-palette-stone md:text-lg">
              Este no es solo un programa de ejercicios. Es una transformación completa 
              de tu relación con el movimiento y tu cuerpo.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {beneficios.map((beneficio, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="rounded-lg border border-palette-stone/20 bg-white/80 p-5"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-palette-sage/40 bg-palette-sage/15">
                  <CheckIcon className="h-5 w-5 text-palette-ink" />
                </div>
                <h3 className="font-semibold text-palette-ink mb-2">{beneficio}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Weekly Structure */}
      <section className="bg-palette-cream px-4 py-14 md:py-16">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="mb-4 font-montserrat text-[clamp(1.9rem,4vw,2.6rem)] font-medium tracking-tight text-palette-ink">
              Estructura del Programa
            </h2>
            <p className="mx-auto max-w-2xl font-montserrat text-base text-palette-stone md:text-lg">
              Cada semana desbloquea nuevo contenido y te acerca más a tu transformación.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {semanas.map((semana, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="rounded-lg border border-palette-stone/20 bg-white/80 p-5"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-palette-ink/15 bg-palette-ink font-montserrat text-sm font-semibold text-palette-cream">
                  {semana.numero}
                </div>
                <h3 className="font-bold text-palette-ink mb-2">{semana.titulo}</h3>
                <p className="text-palette-stone text-sm">{semana.descripcion}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="mb-4 font-montserrat text-[clamp(1.9rem,4vw,2.6rem)] font-medium tracking-tight text-palette-ink">
                Comunidad de Apoyo
              </h2>
              <p className="mb-8 font-montserrat text-[14px] leading-relaxed text-palette-stone">
                No estás solo en este viaje. Únete a una comunidad de personas 
                que, como tú, buscan transformar su relación con el movimiento.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-palette-stone/25 bg-white">
                    <ChatBubbleLeftRightIcon className="h-5 w-5 text-palette-ink" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-palette-ink mb-2">Grupo de WhatsApp</h3>
                    <p className="text-palette-stone">Comparte experiencias, dudas y logros con tus compañeros.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-palette-stone/25 bg-white">
                    <VideoCameraIcon className="h-5 w-5 text-palette-ink" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-palette-ink mb-2">Sesiones en Vivo</h3>
                    <p className="text-palette-stone">Q&A semanales y prácticas grupales en tiempo real.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-palette-stone/25 bg-white">
                    <UserGroupIcon className="h-5 w-5 text-palette-ink" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-palette-ink mb-2">Soporte Personalizado</h3>
                    <p className="text-palette-stone">Resuelve dudas específicas con el equipo de instructores.</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="rounded-lg border border-palette-ink bg-palette-ink p-8 text-palette-cream"
            >
              <h3 className="text-2xl font-bold mb-6">¿Por qué el compromiso de 8 semanas?</h3>
              <p className="mb-6 text-palette-cream/75">
                La transformación real requiere tiempo y constancia. Un programa de 8 semanas nos permite:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckIcon className="mr-3 mt-0.5 h-5 w-5 flex-shrink-0 text-palette-sage" />
                  <span>Establecer hábitos sólidos y duraderos</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon className="mr-3 mt-0.5 h-5 w-5 flex-shrink-0 text-palette-sage" />
                  <span>Ver progresos significativos y medibles</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon className="mr-3 mt-0.5 h-5 w-5 flex-shrink-0 text-palette-sage" />
                  <span>Crear una base sólida para tu práctica futura</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon className="mr-3 mt-0.5 h-5 w-5 flex-shrink-0 text-palette-sage" />
                  <span>Construir una comunidad de apoyo real</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-palette-ink px-4 py-16 text-palette-cream">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="mb-4 font-montserrat text-[clamp(2rem,4.2vw,2.85rem)] font-medium tracking-tight">
              ¿Listo para tu transformación?
            </h2>
            <p className="mb-8 font-montserrat text-[15px] text-palette-cream/75">
              Únete a cientos de personas que ya han transformado su relación con el movimiento.
            </p>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-palette-sage">8</div>
                  <div className="text-palette-cream/70">Semanas</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-palette-sage">24/7</div>
                  <div className="text-palette-cream/70">Soporte</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-palette-sage">100%</div>
                  <div className="text-palette-cream/70">Garantía</div>
                </div>
              </div>
            </div>

            <Link 
              href="/events/programa-transformacional/inscripcion"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-full border-2 border-palette-cream bg-palette-cream px-8 py-3 font-montserrat text-sm font-semibold uppercase tracking-[0.14em] text-palette-ink transition-colors hover:border-palette-sage hover:bg-palette-sage"
            >
              <PlayIcon className="w-8 h-8 mr-3" />
              Inscribirme Ahora
              <ArrowRightIcon className="w-6 h-6 ml-3" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
} 