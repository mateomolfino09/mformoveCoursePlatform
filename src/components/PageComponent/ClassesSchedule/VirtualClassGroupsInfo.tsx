'use client';
import React from 'react';
import { VirtualClass } from '../../../../typings';
import { ClockIcon, UserIcon, VideoCameraIcon } from '@heroicons/react/24/outline';
import { CldImage } from 'next-cloudinary';

interface Props {
  classes: VirtualClass[];
}

const VirtualClassGroupsInfo: React.FC<Props> = ({ classes }) => {
  const formatSchedules = (schedules: any[]) => {
    const days = schedules.map(s => `${s.dayOfWeek}: ${s.startTime}-${s.endTime}`).join(', ');
    return days.length > 80 ? days.substring(0, 80) + '...' : days;
  };

  const formatVirtualPrices = (prices: VirtualClass['prices']) => {
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

  if (classes.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {classes.map((clase) => {
          const prices = formatVirtualPrices(clase.prices);
          return (
            <div
              key={clase._id}
              className="bg-dark rounded-lg overflow-hidden hover:bg-gray-800 transition-all duration-200 cursor-pointer group border border-gray-700"
            >
              {/* Imagen */}
              <div className="relative w-full h-40 sm:h-48 overflow-hidden">
                <CldImage
                  src={clase.image_url}
                  alt={clase.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                />
                {clase.active ? (
                  <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
                    Activo
                  </div>
                ) : (
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                    Inactivo
                  </div>
                )}
                <div className="absolute top-2 left-2 bg-purple-500 text-white px-2 py-1 rounded text-xs font-bold">
                  Grupo Virtual
                </div>
              </div>

              {/* Información */}
              <div className="p-3 sm:p-4">
                <h4 className="text-base sm:text-lg font-bold text-white font-montserrat mb-2 line-clamp-2">
                  {clase.name}
                </h4>
                <p className="text-gray-400 font-montserrat text-sm mb-4 line-clamp-2">
                  {clase.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-300 text-sm">
                    <UserIcon className="h-4 w-4 mr-2 text-white" />
                    <span className="font-montserrat">{clase.instructor}</span>
                  </div>
                  <div className="flex items-center text-gray-300 text-sm">
                    <VideoCameraIcon className="h-4 w-4 mr-2 text-white" />
                    <span className="font-montserrat">{clase.platform}</span>
                  </div>
                  <div className="flex items-center text-gray-300 text-sm">
                    <ClockIcon className="h-4 w-4 mr-2 text-white" />
                    <span className="font-montserrat text-xs">{formatSchedules(clase.schedules)}</span>
                  </div>
                </div>

                {/* Precios */}
                <div className="space-y-3 mb-3">
                  {prices && (
                    <div className="bg-gray-800 rounded-lg p-3">
                      <p className="text-white text-xs font-semibold mb-2">Precios por frecuencia:</p>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between text-gray-300">
                          <span>1 vez/semana:</span>
                          <span className="font-bold text-white">
                            {prices.currencySymbol}{prices.once}
                          </span>
                        </div>
                        {prices.twice > 0 && (
                          <div className="flex justify-between text-gray-300">
                            <span>2 veces/semana:</span>
                            <span className="font-bold text-white">
                              {prices.currencySymbol}{prices.twice}
                            </span>
                          </div>
                        )}
                        {prices.three > 0 && (
                          <div className="flex justify-between text-gray-300">
                            <span>3 veces/semana:</span>
                            <span className="font-bold text-white">
                              {prices.currencySymbol}{prices.three}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {clase.additionalPrices && clase.additionalPrices.length > 0 && (
                    <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
                      <p className="text-white text-xs font-semibold mb-2">Precios adicionales:</p>
                      <div className="space-y-1 text-xs text-gray-300">
                        {clase.additionalPrices.map((price) => {
                          const currencySymbol = price.currency === 'UYU' ? '$' : price.currency === 'USD' ? 'US$' : price.currency;
                          return (
                            <div key={price.label} className="flex justify-between">
                              <span>{price.label}</span>
                              <span className="font-bold text-white">{currencySymbol}{price.amount}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Nivel */}
                <div className="flex items-center text-gray-300 text-sm">
                  <span className="font-montserrat">Nivel: <strong>{clase.level}</strong></span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VirtualClassGroupsInfo;

