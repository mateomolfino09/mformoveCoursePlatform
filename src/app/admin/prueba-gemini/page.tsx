'use client';

import { useState } from 'react';

export default function TestAIPage() {
  const [activeTab, setActiveTab] = useState<'generator' | 'voice'>('generator');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Sistema de IA Personalizado</h1>
          <p className="text-gray-600 mt-2">
            Genera emails automáticamente usando la IA más apropiada según el tipo de contenido
          </p>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">IA Utilizada por Tipo:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li><strong>Newsletter:</strong> OpenAI GPT-4 (más creativo)</li>
              <li><strong>Programa Transformacional:</strong> Google Gemini (más barato)</li>
              <li><strong>Sesión en Vivo:</strong> OpenAI GPT-4 (mejor engagement)</li>
              <li><strong>Contenido Educativo:</strong> Claude (más estructurado)</li>
            </ul>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('voice')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'voice'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🎨 Configurar Voz de Marca
              </button>
              <button
                onClick={() => setActiveTab('generator')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'generator'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                ✨ Generar Emails
              </button>
            </nav>
          </div>
        </div>
              </div>
    </div>
  );
} 