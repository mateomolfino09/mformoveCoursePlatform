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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
                <StarIcon className="w-4 h-4 mr-2" />
                Programa Transformacional de 8 Semanas
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
                Reconecta con tu{' '}
                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  Cuerpo
                </span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-blue-100 mb-8 leading-relaxed">
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
                  className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold text-lg rounded-xl hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 shadow-xl"
                >
                  <PlayIcon className="w-6 h-6 mr-2" />
                  Inscribirme Ahora
                  <ArrowRightIcon className="w-5 h-5 ml-2" />
                </Link>
                
                <button className="inline-flex items-center justify-center px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/30">
                  <VideoCameraIcon className="w-5 h-5 mr-2" />
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
              <div className="bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-3xl p-8 backdrop-blur-sm border border-white/20">
                <div className="text-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                    <AcademicCapIcon className="w-16 h-16 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Programa Completo</h3>
                  <div className="space-y-3 text-left">
                    <div className="flex items-center">
                      <CheckIcon className="w-5 h-5 text-green-400 mr-3" />
                      <span>8 semanas de contenido</span>
                    </div>
                    <div className="flex items-center">
                      <CheckIcon className="w-5 h-5 text-green-400 mr-3" />
                      <span>Sesiones en vivo semanales</span>
                    </div>
                    <div className="flex items-center">
                      <CheckIcon className="w-5 h-5 text-green-400 mr-3" />
                      <span>Comunidad exclusiva</span>
                    </div>
                    <div className="flex items-center">
                      <CheckIcon className="w-5 h-5 text-green-400 mr-3" />
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
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              ¿Qué lograrás en 8 semanas?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
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
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <CheckIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{beneficio}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Weekly Structure */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Estructura del Programa
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
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
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 text-white font-bold text-xl">
                  {semana.numero}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{semana.titulo}</h3>
                <p className="text-gray-600 text-sm">{semana.descripcion}</p>
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
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Comunidad de Apoyo
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                No estás solo en este viaje. Únete a una comunidad de personas 
                que, como tú, buscan transformar su relación con el movimiento.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <ChatBubbleLeftRightIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Grupo de WhatsApp</h3>
                    <p className="text-gray-600">Comparte experiencias, dudas y logros con tus compañeros.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <VideoCameraIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Sesiones en Vivo</h3>
                    <p className="text-gray-600">Q&A semanales y prácticas grupales en tiempo real.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <UserGroupIcon className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Soporte Personalizado</h3>
                    <p className="text-gray-600">Resuelve dudas específicas con el equipo de instructores.</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-8 text-white"
            >
              <h3 className="text-2xl font-bold mb-6">¿Por qué el compromiso de 8 semanas?</h3>
              <p className="text-blue-100 mb-6">
                La transformación real requiere tiempo y constancia. Un programa de 8 semanas nos permite:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckIcon className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Establecer hábitos sólidos y duraderos</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Ver progresos significativos y medibles</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Crear una base sólida para tu práctica futura</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Construir una comunidad de apoyo real</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-900 to-black text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              ¿Listo para tu transformación?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Únete a cientos de personas que ya han transformado su relación con el movimiento.
            </p>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-yellow-400">8</div>
                  <div className="text-gray-300">Semanas</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-yellow-400">24/7</div>
                  <div className="text-gray-300">Soporte</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-yellow-400">100%</div>
                  <div className="text-gray-300">Garantía</div>
                </div>
              </div>
            </div>

            <Link 
              href="/events/programa-transformacional/inscripcion"
              className="inline-flex items-center justify-center px-12 py-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold text-xl rounded-2xl hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 shadow-2xl"
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