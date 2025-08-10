'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, EyeIcon, EyeSlashIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import AdmimDashboardLayout from '../../../../components/AdmimDashboardLayout';

export default function AISettingsPage() {
  const [showKeys, setShowKeys] = useState(false);
  const [apiKeys, setApiKeys] = useState({
    openai: 'sk-...',
    gemini: 'AIza...',
    anthropic: 'sk-ant-...',
    instagram: 'IGQWRP...'
  });

  const [status, setStatus] = useState({
    openai: 'connected',
    gemini: 'connected',
    anthropic: 'connected',
    instagram: 'connected'
  });

  const testConnection = async (service: string) => {
    // Simular test de conexión
    setStatus(prev => ({ ...prev, [service]: 'testing' }));
    
    setTimeout(() => {
      setStatus(prev => ({ ...prev, [service]: 'connected' }));
    }, 2000);
  };

  const getStatusIcon = (serviceStatus: string) => {
    switch (serviceStatus) {
      case 'connected':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'testing':
        return <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      case 'error':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <XCircleIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = (serviceStatus: string) => {
    switch (serviceStatus) {
      case 'connected':
        return 'Conectado';
      case 'testing':
        return 'Probando...';
      case 'error':
        return 'Error';
      default:
        return 'No configurado';
    }
  };

  const getStatusColor = (serviceStatus: string) => {
    switch (serviceStatus) {
      case 'connected':
        return 'bg-green-900 text-green-300';
      case 'testing':
        return 'bg-blue-900 text-blue-300';
      case 'error':
        return 'bg-red-900 text-red-300';
      default:
        return 'bg-gray-700 text-gray-300';
    }
  };

  return (
    <AdmimDashboardLayout>
      <div className="w-full">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link 
              href="/admin/ai-management"
              className="p-2 bg-gray-800 rounded-lg shadow-lg border border-gray-700 hover:bg-gray-700 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-300" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-gray-500 to-slate-500 rounded-xl">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Configuración de IA</h1>
                <p className="text-gray-300 mt-1">
                  Gestiona API keys y configuraciones de servicios de IA
                </p>
              </div>
            </div>
          </div>

          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-6">
            <Link href="/admin" className="hover:text-gray-200">Admin</Link>
            <span>/</span>
            <Link href="/admin/ai-management" className="hover:text-gray-200">IA Management</Link>
            <span>/</span>
            <span className="text-white">Configuración</span>
          </nav>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* API Keys Section */}
            <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">API Keys</h2>
                <button
                  onClick={() => setShowKeys(!showKeys)}
                  className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  {showKeys ? (
                    <>
                      <EyeSlashIcon className="w-4 h-4" />
                      Ocultar
                    </>
                  ) : (
                    <>
                      <EyeIcon className="w-4 h-4" />
                      Mostrar
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-4">
                {/* OpenAI */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm font-bold">O</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">OpenAI GPT-4</h3>
                        <p className="text-sm text-gray-600">Para newsletters y análisis de Instagram</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(status.openai)}
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(status.openai)}`}>
                        {getStatusText(status.openai)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type={showKeys ? "text" : "password"}
                      value={apiKeys.openai}
                      onChange={(e) => setApiKeys(prev => ({ ...prev, openai: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                      placeholder="sk-..."
                    />
                    <button
                      onClick={() => testConnection('openai')}
                      className="px-3 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors"
                    >
                      Probar
                    </button>
                  </div>
                </div>

                {/* Gemini */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm font-bold">G</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Google Gemini</h3>
                        <p className="text-sm text-gray-600">Para programas transformacionales</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(status.gemini)}
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(status.gemini)}`}>
                        {getStatusText(status.gemini)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type={showKeys ? "text" : "password"}
                      value={apiKeys.gemini}
                      onChange={(e) => setApiKeys(prev => ({ ...prev, gemini: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                      placeholder="AIza..."
                    />
                    <button
                      onClick={() => testConnection('gemini')}
                      className="px-3 py-2 bg-purple-500 text-white text-sm rounded-md hover:bg-purple-600 transition-colors"
                    >
                      Probar
                    </button>
                  </div>
                </div>

                {/* Anthropic */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm font-bold">A</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Anthropic Claude</h3>
                        <p className="text-sm text-gray-600">Para contenido educativo</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(status.anthropic)}
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(status.anthropic)}`}>
                        {getStatusText(status.anthropic)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type={showKeys ? "text" : "password"}
                      value={apiKeys.anthropic}
                      onChange={(e) => setApiKeys(prev => ({ ...prev, anthropic: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                      placeholder="sk-ant-..."
                    />
                    <button
                      onClick={() => testConnection('anthropic')}
                      className="px-3 py-2 bg-orange-500 text-white text-sm rounded-md hover:bg-orange-600 transition-colors"
                    >
                      Probar
                    </button>
                  </div>
                </div>

                {/* Instagram */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm font-bold">I</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Instagram API</h3>
                        <p className="text-sm text-gray-600">Para análisis de captions</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(status.instagram)}
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(status.instagram)}`}>
                        {getStatusText(status.instagram)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type={showKeys ? "text" : "password"}
                      value={apiKeys.instagram}
                      onChange={(e) => setApiKeys(prev => ({ ...prev, instagram: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                      placeholder="IGQWRP..."
                    />
                    <button
                      onClick={() => testConnection('instagram')}
                      className="px-3 py-2 bg-pink-500 text-white text-sm rounded-md hover:bg-pink-600 transition-colors"
                    >
                      Probar
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Guardar Configuración</h3>
                  <p className="text-sm text-gray-300 mt-1">
                    Las API keys se guardan de forma segura en las variables de entorno
                  </p>
                </div>
                <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200">
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Overview */}
            <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Estado General</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Servicios activos</span>
                  <span className="font-medium text-white">4/4</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Última verificación</span>
                  <span className="text-sm text-white">Hace 5 min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Tokens disponibles</span>
                  <span className="font-medium text-green-400">Suficientes</span>
                </div>
              </div>
            </div>

            {/* Usage Stats */}
            <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Uso de Tokens</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">OpenAI</span>
                    <span className="text-white">847/1000</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '84.7%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">Gemini</span>
                    <span className="text-white">234/500</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '46.8%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">Claude</span>
                    <span className="text-white">156/300</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: '52%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Help */}
            <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-xl border border-blue-700 p-6">
              <h3 className="text-lg font-semibold text-blue-200 mb-3">¿Necesitas ayuda?</h3>
              <p className="text-sm text-blue-300 mb-4">
                Si tienes problemas con las API keys, revisa nuestra documentación o contacta soporte.
              </p>
              <div className="space-y-2">
                <Link 
                  href="#"
                  className="block text-sm text-blue-300 hover:text-blue-200 underline"
                >
                  Documentación de APIs
                </Link>
                <Link 
                  href="#"
                  className="block text-sm text-blue-300 hover:text-blue-200 underline"
                >
                  Guía de configuración
                </Link>
                <Link 
                  href="#"
                  className="block text-sm text-blue-300 hover:text-blue-200 underline"
                >
                  Contactar soporte
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdmimDashboardLayout>
  );
} 