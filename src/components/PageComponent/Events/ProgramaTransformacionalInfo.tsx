'use client';

import React from 'react';
import { ProductDB } from '../../../../typings';
import { motion } from 'framer-motion';
import { 
  CalendarIcon, 
  ClockIcon, 
  UserGroupIcon, 
  AcademicCapIcon,
  CheckIcon,
  PlayIcon,
  VideoCameraIcon,
  ChatBubbleLeftRightIcon,
  StarIcon
} from '@heroicons/react/24/outline';

interface Props {
  evento: ProductDB;
}

const ProgramaTransformacionalInfo: React.FC<Props> = ({ evento }) => {
  const programa = evento.programaTransformacional;

  if (!programa) return null;

  const semanas = programa.semanas || [];
  const sesionesEnVivo = programa.sesionesEnVivo || [];
  const comunidad = programa.comunidad || {};

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
            <StarIcon className="w-4 h-4 mr-2" />
            Programa Transformacional de {programa.duracionSemanas} Semanas
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Estructura del Programa
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Cada semana desbloquea nuevo contenido y te acerca más a tu transformación personal.
          </p>
        </motion.div>

        {/* Program Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid md:grid-cols-4 gap-6 mb-16"
        >
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <CalendarIcon className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{programa.duracionSemanas}</div>
            <div className="text-gray-600">Semanas</div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <VideoCameraIcon className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{sesionesEnVivo.length}</div>
            <div className="text-gray-600">Sesiones en Vivo</div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <UserGroupIcon className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {programa.cupoDisponible ? programa.cupoDisponible : 'Limitado'}
            </div>
            <div className="text-gray-600">Cupos Disponibles</div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <AcademicCapIcon className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-900">Certificado</div>
            <div className="text-gray-600">Incluido</div>
          </div>
        </motion.div>

        {/* Weekly Structure */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-16"
        >
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Contenido Semanal
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {semanas.map((semana, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 text-white font-bold text-xl">
                  {semana.numero}
                </div>
                <h4 className="font-bold text-gray-900 mb-2">{semana.titulo}</h4>
                <p className="text-gray-600 text-sm mb-4">{semana.descripcion}</p>
                
                {semana.contenido && semana.contenido.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-gray-500">Contenido:</div>
                    {semana.contenido.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex items-center text-xs text-gray-600">
                        <CheckIcon className="w-3 h-3 text-green-500 mr-2" />
                        {item.titulo}
                      </div>
                    ))}
                    {semana.contenido.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{semana.contenido.length - 3} más
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Live Sessions */}
        {sesionesEnVivo.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mb-16"
          >
            <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Sesiones en Vivo
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sesionesEnVivo.map((sesion, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center mr-3">
                      <VideoCameraIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Sesión {index + 1}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(sesion.fecha).toLocaleDateString('es-ES', { 
                          weekday: 'long', 
                          day: 'numeric', 
                          month: 'long' 
                        })}
                      </div>
                    </div>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">{sesion.titulo}</h4>
                  <p className="text-gray-600 text-sm mb-3">{sesion.descripcion}</p>
                  <div className="flex items-center text-xs text-gray-500">
                    <ClockIcon className="w-4 h-4 mr-1" />
                    {sesion.duracion || 60} minutos
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Community */}
        {comunidad && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-8 text-white"
          >
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-3xl font-bold mb-6">Comunidad de Apoyo</h3>
                <p className="text-blue-100 mb-6 text-lg">
                  {comunidad.descripcion || 'Únete a una comunidad de personas que, como tú, buscan transformar su relación con el movimiento.'}
                </p>
                
                <div className="space-y-4">
                  {comunidad.grupoWhatsapp && (
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center mr-3">
                        <ChatBubbleLeftRightIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold">Grupo de WhatsApp</div>
                        <div className="text-blue-200 text-sm">Comparte experiencias y logros</div>
                      </div>
                    </div>
                  )}
                  
                  {comunidad.grupoTelegram && (
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center mr-3">
                        <ChatBubbleLeftRightIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold">Grupo de Telegram</div>
                        <div className="text-blue-200 text-sm">Recursos y material adicional</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <h4 className="text-xl font-bold mb-4">¿Por qué 8 semanas?</h4>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <CheckIcon className="w-5 h-5 text-green-400 mr-3 mt-0.5" />
                    <span>Establecer hábitos sólidos y duraderos</span>
                  </div>
                  <div className="flex items-start">
                    <CheckIcon className="w-5 h-5 text-green-400 mr-3 mt-0.5" />
                    <span>Ver progresos significativos y medibles</span>
                  </div>
                  <div className="flex items-start">
                    <CheckIcon className="w-5 h-5 text-green-400 mr-3 mt-0.5" />
                    <span>Crear una base sólida para tu práctica futura</span>
                  </div>
                  <div className="flex items-start">
                    <CheckIcon className="w-5 h-5 text-green-400 mr-3 mt-0.5" />
                    <span>Construir una comunidad de apoyo real</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default ProgramaTransformacionalInfo; 