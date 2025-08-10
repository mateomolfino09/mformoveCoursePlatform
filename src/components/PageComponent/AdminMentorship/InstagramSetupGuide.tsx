'use client';

import React, { useState } from 'react';
import { 
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const InstagramSetupGuide = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showDetails, setShowDetails] = useState(false);

  const steps = [
    {
      id: 1,
      title: 'Crear App en Meta for Developers',
      description: 'Accede a Meta for Developers y crea una nueva aplicación',
      details: [
        'Ve a https://developers.facebook.com/',
        'Haz clic en "Crear App"',
        'Selecciona "Consumer" como tipo de app',
        'Completa la información básica de tu app'
      ],
      link: 'https://developers.facebook.com/'
    },
    {
      id: 2,
      title: 'Agregar Instagram Basic Display',
      description: 'Añade el producto Instagram Basic Display a tu app',
      details: [
        'En tu app, ve a "Agregar Producto"',
        'Busca "Instagram Basic Display"',
        'Haz clic en "Configurar"',
        'Sigue las instrucciones de configuración'
      ]
    },
    {
      id: 3,
      title: 'Configurar OAuth',
      description: 'Configura la autenticación OAuth para tu app',
      details: [
        'En Instagram Basic Display, ve a "Configuración básica"',
        'Agrega tu URL de redirección: https://tu-dominio.com/api/instagram/auth',
        'Guarda los cambios',
        'Anota tu App ID y App Secret'
      ]
    },
    {
      id: 4,
      title: 'Obtener Access Token',
      description: 'Genera un access token para tu cuenta de Instagram',
      details: [
        'Ve a "Herramientas de desarrollo" > "Instagram Basic Display"',
        'Haz clic en "Generar Token"',
        'Autoriza tu cuenta de Instagram',
        'Copia el Access Token generado'
      ]
    },
    {
      id: 5,
      title: 'Obtener User ID',
      description: 'Obtén tu Instagram User ID',
      details: [
        'Ve a https://graph.instagram.com/me',
        'Agrega tu access token como parámetro: ?access_token=TU_TOKEN',
        'Copia el "id" de la respuesta JSON',
        'Este es tu Instagram User ID'
      ]
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <InformationCircleIcon className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Guía de Configuración de Instagram</h3>
          <p className="text-sm text-gray-600">Sigue estos pasos para conectar tu cuenta de Instagram</p>
        </div>
      </div>

      {/* Pasos */}
      <div className="space-y-4 mb-6">
        {steps.map((step) => (
          <div key={step.id} className="relative">
            <div className={`flex items-start gap-4 p-4 rounded-lg border transition-all duration-200 ${
              currentStep === step.id 
                ? 'border-blue-300 bg-blue-50' 
                : 'border-gray-200 bg-gray-50'
            }`}>
              {/* Número del paso */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === step.id
                  ? 'bg-blue-600 text-white'
                  : currentStep > step.id
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}>
                {currentStep > step.id ? (
                  <CheckCircleIcon className="w-5 h-5" />
                ) : (
                  step.id
                )}
              </div>

              {/* Contenido del paso */}
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-1">{step.title}</h4>
                <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                
                {showDetails && currentStep === step.id && (
                  <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                    <ul className="space-y-2 text-sm text-gray-700">
                      {step.details.map((detail, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-blue-600 font-medium">{index + 1}.</span>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                    
                    {step.link && (
                      <a
                        href={step.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Abrir enlace
                        <ArrowRightIcon className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                )}

                {/* Botones de acción */}
                <div className="flex gap-2 mt-3">
                  {currentStep === step.id && (
                    <button
                      onClick={() => setShowDetails(!showDetails)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      {showDetails ? 'Ocultar detalles' : 'Ver detalles'}
                    </button>
                  )}
                  
                  {currentStep === step.id && step.id < steps.length && (
                    <button
                      onClick={() => setCurrentStep(step.id + 1)}
                      className="text-green-600 hover:text-green-700 text-sm font-medium"
                    >
                      Siguiente paso
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Información adicional */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-900 mb-1">Importante</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Necesitas una cuenta de Instagram Business o Creator</li>
              <li>• Tu cuenta debe estar conectada a una página de Facebook</li>
              <li>• Los tokens tienen una duración limitada (60 días)</li>
              <li>• Guarda tus credenciales de forma segura</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Navegación */}
      <div className="flex justify-between mt-6">
        <button
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Anterior
        </button>
        
        <button
          onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
          disabled={currentStep === steps.length}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default InstagramSetupGuide; 