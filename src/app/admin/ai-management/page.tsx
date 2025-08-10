'use client';

import React from 'react';
import Link from 'next/link';
import { 
  SparklesIcon, 
  PhotoIcon, 
  MicrophoneIcon, 
  EnvelopeIcon,
  ChartBarIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import AdmimDashboardLayout from '../../../components/AdmimDashboardLayout';

export default function AIManagementPage() {
  const features = [
    {
      title: '📱 Análisis de Instagram',
      description: 'Conecta tu Instagram y analiza automáticamente tu estilo de comunicación',
      href: '/admin/ai-management/instagram',
      icon: PhotoIcon,
      color: 'from-purple-500 to-pink-500',
      status: 'active'
    },
    {
      title: '🎨 Voz de Marca',
      description: 'Configura y personaliza tu voz de marca para emails automáticos',
      href: '/admin/ai-management/voice-brand',
      icon: MicrophoneIcon,
      color: 'from-blue-500 to-cyan-500',
      status: 'active'
    },
    {
      title: '✉️ Generador de Emails',
      description: 'Genera emails automáticamente usando IA con tu voz personalizada',
      href: '/admin/ai-management/email-generator',
      icon: EnvelopeIcon,
      color: 'from-green-500 to-emerald-500',
      status: 'active'
    },
    {
      title: '📊 Analytics de IA',
      description: 'Métricas y análisis del rendimiento de tus emails generados',
      href: '/admin/ai-management/analytics',
      icon: ChartBarIcon,
      color: 'from-orange-500 to-red-500',
      status: 'coming-soon'
    },
    {
      title: '⚙️ Configuración',
      description: 'Gestiona API keys y configuraciones de servicios de IA',
      href: '/admin/ai-management/settings',
      icon: CogIcon,
      color: 'from-gray-500 to-slate-500',
      status: 'active'
    }
  ];

  return (
    <AdmimDashboardLayout>
      <div className="w-full">
        {/* Header */}
        <div className="mb-8 mt-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
              <SparklesIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Gestión de IA</h1>
              <p className="text-gray-300 mt-1">
                Automatiza y personaliza tu comunicación con inteligencia artificial
              </p>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-green-900 rounded-lg">
                  <PhotoIcon className="w-5 h-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-300">Instagram</p>
                  <p className="text-lg font-semibold text-white">Conectado</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-blue-900 rounded-lg">
                  <MicrophoneIcon className="w-5 h-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-300">Voz de Marca</p>
                  <p className="text-lg font-semibold text-white">Configurada</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-purple-900 rounded-lg">
                  <EnvelopeIcon className="w-5 h-5 text-purple-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-300">Emails Generados</p>
                  <p className="text-lg font-semibold text-white">24</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-orange-900 rounded-lg">
                  <SparklesIcon className="w-5 h-5 text-orange-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-300">Tokens Usados</p>
                  <p className="text-lg font-semibold text-white">1,247</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Link 
              key={index} 
              href={feature.status === 'coming-soon' ? '#' : feature.href}
              className={`group block ${
                feature.status === 'coming-soon' ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-105'
              } transition-all duration-200`}
            >
              <div className={`bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-6 h-full ${
                feature.status === 'coming-soon' ? 'opacity-60' : 'hover:shadow-xl hover:border-gray-600'
              }`}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 bg-gradient-to-r ${feature.color} rounded-lg`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  {feature.status === 'coming-soon' && (
                    <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full">
                      Próximamente
                    </span>
                  )}
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {feature.description}
                </p>
                
                {feature.status === 'active' && (
                  <div className="mt-4 flex items-center text-sm text-gray-400">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Disponible
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-12 bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link 
              href="/admin/ai-management/instagram"
              className="flex items-center p-4 bg-gradient-to-r from-purple-900 to-pink-900 rounded-lg border border-purple-700 hover:from-purple-800 hover:to-pink-800 transition-all duration-200"
            >
              <PhotoIcon className="w-5 h-5 text-purple-300 mr-3" />
              <span className="font-medium text-purple-200">Analizar Instagram</span>
            </Link>
            
            <Link 
              href="/admin/ai-management/email-generator"
              className="flex items-center p-4 bg-gradient-to-r from-green-900 to-emerald-900 rounded-lg border border-green-700 hover:from-green-800 hover:to-emerald-800 transition-all duration-200"
            >
              <EnvelopeIcon className="w-5 h-5 text-green-300 mr-3" />
              <span className="font-medium text-green-200">Generar Email</span>
            </Link>
            
            <Link 
              href="/admin/ai-management/voice-brand"
              className="flex items-center p-4 bg-gradient-to-r from-blue-900 to-cyan-900 rounded-lg border border-blue-700 hover:from-blue-800 hover:to-cyan-800 transition-all duration-200"
            >
              <MicrophoneIcon className="w-5 h-5 text-blue-300 mr-3" />
              <span className="font-medium text-blue-200">Configurar Voz</span>
            </Link>
          </div>
        </div>
      </div>
    </AdmimDashboardLayout>

  );
} 