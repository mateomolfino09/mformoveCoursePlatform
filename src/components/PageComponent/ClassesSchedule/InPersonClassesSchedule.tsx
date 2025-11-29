'use client';
import React, { useState, useMemo } from 'react';
import { MapPinIcon, ClockIcon, UserIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { CldImage } from 'next-cloudinary';
import { InPersonClass } from '../../../../typings';
import { motion } from 'framer-motion';

interface Props {
  classes: InPersonClass[];
}

const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const dayAbbreviations: { [key: string]: string } = {
  'Lunes': 'Lun',
  'Martes': 'Mar',
  'Miércoles': 'Mié',
  'Jueves': 'Jue',
  'Viernes': 'Vie',
  'Sábado': 'Sáb',
  'Domingo': 'Dom'
};

const InPersonClassesSchedule: React.FC<Props> = ({ classes }) => {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<InPersonClass | null>(null);

  // Agrupar clases por día de la semana
  const classesByDay = useMemo(() => {
    const grouped: { [key: string]: InPersonClass[] } = {};
    
    daysOfWeek.forEach(day => {
      grouped[day] = [];
    });

    classes.forEach(clase => {
      clase.schedules.forEach(schedule => {
        if (!grouped[schedule.dayOfWeek]) {
          grouped[schedule.dayOfWeek] = [];
        }
        grouped[schedule.dayOfWeek].push(clase);
      });
    });

    // Ordenar clases por hora de inicio dentro de cada día
    Object.keys(grouped).forEach(day => {
      grouped[day].sort((a, b) => {
        const scheduleA = a.schedules.find(s => s.dayOfWeek === day);
        const scheduleB = b.schedules.find(s => s.dayOfWeek === day);
        if (!scheduleA || !scheduleB) return 0;
        return scheduleA.startTime.localeCompare(scheduleB.startTime);
      });
    });

    return grouped;
  }, [classes]);

  // Obtener días que tienen clases
  const daysWithClasses = useMemo(() => {
    return daysOfWeek.filter(day => classesByDay[day] && classesByDay[day].length > 0);
  }, [classesByDay]);

  // Si no hay clases, mostrar mensaje
  if (classes.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-black/5 p-8 text-center shadow-sm">
        <h2 className="text-xl sm:text-2xl font-bold text-black font-montserrat mb-4">
          Clases Presenciales
        </h2>
        <p className="text-gray-600 font-montserrat font-light">
          Próximamente anunciaremos nuestros horarios de clases presenciales. ¡Mantenete atento!
        </p>
      </div>
    );
  }

  // Seleccionar el primer día con clases si no hay selección
  const activeDay = selectedDay || daysWithClasses[0] || null;

  const formatPrice = (amount: number, currency: string, type: string) => {
    const currencySymbol = currency === 'UYU' ? '$' : currency === 'USD' ? 'US$' : currency;
    const typeLabels: { [key: string]: string } = {
      'clase_suelta': 'por clase',
      'mensual': 'por mes',
      'trimestral': 'por trimestre',
      'anual': 'por año'
    };
    return `${currencySymbol}${amount} ${typeLabels[type] || ''}`;
  };

const formatFrequencyPrices = (prices?: InPersonClass['frequencyPrices']) => {
  if (!prices) return null;
  const once = prices.oncePerWeek?.amount || 0;
  const twice = prices.twicePerWeek?.amount || 0;
  const three = prices.threeTimesPerWeek?.amount || 0;
  if (once + twice + three <= 0) return null;
  const currency = prices.oncePerWeek?.currency || 'UYU';
  const currencySymbol = currency === 'UYU' ? '$' : currency === 'USD' ? 'US$' : currency;
  return {
    currencySymbol,
    once,
    twice,
    three
  };
};

  return (
    <div className="bg-white rounded-2xl border border-black/5 p-4 sm:p-6 md:p-8 shadow-sm">

      {/* Filtro por día - Responsive */}
      <div className="mb-6 sm:mb-8 overflow-x-auto">
        <div className="flex space-x-2 pb-2">
          {daysWithClasses.map((day, idx) => (
            <motion.button
              key={day}
              onClick={() => {
                setSelectedDay(day);
                setSelectedClass(null);
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.2, delay: idx * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 sm:px-5 py-2.5 rounded-xl font-montserrat text-sm sm:text-base font-medium transition-all duration-300 whitespace-nowrap ${
                activeDay === day
                  ? 'bg-black text-white shadow-md'
                  : 'bg-gray-50 text-gray-700 border border-black/5 hover:bg-gray-100 hover:border-black/10'
              }`}
            >
              {dayAbbreviations[day]}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Horarios del día seleccionado */}
      {activeDay && classesByDay[activeDay] && (
        <div className="space-y-4">
          {classesByDay[activeDay].map((clase, idx) => {
            const schedule = clase.schedules.find(s => s.dayOfWeek === activeDay);
            if (!schedule) return null;
            const frequencyPrices = formatFrequencyPrices(clase.frequencyPrices);

            return (
              <motion.div
                key={clase._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="bg-gray-50 border border-black/5 rounded-2xl p-4 sm:p-6 hover:bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedClass(selectedClass?.id === clase.id ? null : clase)}
              >
                <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
                  {/* Imagen */}
                  <div className="relative w-full md:w-48 h-40 sm:h-48 rounded-lg overflow-hidden flex-shrink-0">
                    <CldImage
                      src={clase.image_url}
                      alt={clase.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Información */}
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-bold text-black font-montserrat mb-2">
                      {clase.name}
                    </h3>
                    <p className="text-gray-600 font-montserrat mb-4 text-sm font-light leading-relaxed">
                      {clase.description}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                      {/* Horario */}
                      <div className="flex items-center text-gray-700">
                        <ClockIcon className="h-5 w-5 mr-2 text-black" />
                        <span className="font-montserrat text-sm font-light">
                          {schedule.startTime} - {schedule.endTime}
                        </span>
                      </div>

                      {/* Ubicación */}
                      <div className="flex items-center text-gray-700">
                        <MapPinIcon className="h-5 w-5 mr-2 text-black" />
                        <span className="font-montserrat text-sm font-light">
                          {clase.location.name}, {clase.location.city}
                        </span>
                      </div>

                      {/* Instructor */}
                      <div className="flex items-center text-gray-700">
                        <UserIcon className="h-5 w-5 mr-2 text-black" />
                        <span className="font-montserrat text-sm font-light">{clase.instructor}</span>
                      </div>

                      {/* Precio */}
                      {clase.price.amount > 0 && (
                        <div className="flex items-center text-gray-700">
                          <CurrencyDollarIcon className="h-5 w-5 mr-2 text-black" />
                          <span className="font-montserrat text-sm font-light">
                            {formatPrice(clase.price.amount, clase.price.currency, clase.price.type)}
                          </span>
                        </div>
                      )}
                    {frequencyPrices && (
                        <div className="md:col-span-2 bg-white rounded-xl p-3 border border-black/10 text-xs text-gray-700 space-y-2">
                          <p className="text-black font-semibold text-xs uppercase tracking-wide mb-2 font-montserrat">Precios por frecuencia</p>
                          {frequencyPrices.once > 0 && (
                            <div className="flex justify-between">
                              <span>1 vez/semana</span>
                              <span className="font-montserrat font-semibold">
                                {frequencyPrices.currencySymbol}{frequencyPrices.once}
                              </span>
                            </div>
                          )}
                          {frequencyPrices.twice > 0 && (
                            <div className="flex justify-between">
                              <span>2 veces/semana</span>
                              <span className="font-montserrat font-semibold">
                                {frequencyPrices.currencySymbol}{frequencyPrices.twice}
                              </span>
                            </div>
                          )}
                          {frequencyPrices.three > 0 && (
                            <div className="flex justify-between">
                              <span>3 veces/semana</span>
                              <span className="font-montserrat font-semibold">
                                {frequencyPrices.currencySymbol}{frequencyPrices.three}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                      {clase.additionalPrices && clase.additionalPrices.length > 0 && (
                        <div className="md:col-span-2 bg-white rounded-xl p-3 border border-black/10 text-xs text-gray-700 space-y-2 mt-3">
                          <p className="text-black font-semibold text-xs uppercase tracking-wide mb-2 font-montserrat">Precios adicionales</p>
                          {clase.additionalPrices.map((price) => (
                            <div key={price.label} className="flex justify-between">
                              <span>{price.label}</span>
                              <span className="font-montserrat font-semibold">
                                {(price.currency === 'UYU' ? '$' : price.currency === 'USD' ? 'US$' : price.currency)}
                                {price.amount}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Información adicional (mostrar al hacer clic) */}
                    {selectedClass?.id === clase.id && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 pt-4 border-t border-black/10 space-y-3"
                      >
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 font-montserrat font-light">Nivel:</span>
                          <span className="text-black font-montserrat font-medium">{clase.level}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 font-montserrat font-light">Duración:</span>
                          <span className="text-black font-montserrat font-medium">{clase.duration} minutos</span>
                        </div>
                        {clase.capacity && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 font-montserrat font-light">Cupos:</span>
                            <span className="text-black font-montserrat font-medium">
                              {clase.currentEnrollments}/{clase.capacity}
                            </span>
                          </div>
                        )}
                        <div className="mt-2">
                          <p className="text-gray-600 font-montserrat text-sm mb-1 font-light">Dirección:</p>
                          <p className="text-black font-montserrat text-sm font-light">
                            {clase.location.address}, {clase.location.city}, {clase.location.country}
                          </p>
                        </div>
                        {frequencyPrices && (
                          <div className="mt-3 space-y-1 text-sm text-gray-700">
                            <p className="text-xs text-gray-600 font-montserrat font-light mb-2">Resumen de frecuencias:</p>
                            {frequencyPrices.once > 0 && (
                              <div className="flex justify-between">
                                <span>1 vez/semana</span>
                                <span className="font-semibold">
                                  {frequencyPrices.currencySymbol}{frequencyPrices.once}
                                </span>
                              </div>
                            )}
                            {frequencyPrices.twice > 0 && (
                              <div className="flex justify-between">
                                <span>2 veces/semana</span>
                                <span className="font-semibold">
                                  {frequencyPrices.currencySymbol}{frequencyPrices.twice}
                                </span>
                              </div>
                            )}
                            {frequencyPrices.three > 0 && (
                              <div className="flex justify-between">
                                <span>3 veces/semana</span>
                                <span className="font-semibold">
                                  {frequencyPrices.currencySymbol}{frequencyPrices.three}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {activeDay && (!classesByDay[activeDay] || classesByDay[activeDay].length === 0) && (
        <div className="text-center py-8">
          <p className="text-gray-600 font-montserrat font-light">
            No hay clases programadas para este día.
          </p>
        </div>
      )}
    </div>
  );
};

export default InPersonClassesSchedule;

