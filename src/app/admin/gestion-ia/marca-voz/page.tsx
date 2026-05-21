'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import AdmimDashboardLayout from '../../../../components/AdmimDashboardLayout';

export default function VoiceBrandManagementPage() {
  return (
    <AdmimDashboardLayout>
      <div className="w-full">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link 
              href="/admin/gestion-ia"
              className="p-2 bg-gray-800 rounded-lg shadow-lg border border-gray-700 hover:bg-gray-700 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-300" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Voz de Marca</h1>
                <p className="text-gray-300 mt-1">
                  Configura y personaliza tu voz de marca para emails automáticos
                </p>
              </div>
            </div>
          </div>

          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-6">
            <Link href="/admin" className="hover:text-gray-200">Admin</Link>
            <span>/</span>
            <Link href="/admin/gestion-ia" className="hover:text-gray-200">IA Management</Link>
            <span>/</span>
            <span className="text-white">Voz de Marca</span>
          </nav>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Voice Status */}
            <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Voz Actual</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-300">Tono</p>
                  <p className="font-medium text-white">Inspiracional</p>
                </div>
                <div>
                  <p className="text-sm text-gray-300">Estilo</p>
                  <p className="font-medium text-white">Friendly</p>
                </div>
                <div>
                  <p className="text-sm text-gray-300">Vocabulario</p>
                  <p className="font-medium text-white">15 palabras clave</p>
                </div>
                <div>
                  <p className="text-sm text-gray-300">Última actualización</p>
                  <p className="font-medium text-white">Hace 1 día</p>
                </div>
              </div>
            </div>

            {/* Voice Preview */}
            <div className="bg-gradient-to-r from-blue-900 to-cyan-900 rounded-xl border border-blue-700 p-6">
              <h3 className="text-lg font-semibold text-blue-200 mb-4">Vista Previa</h3>
              <div className="bg-gray-700 rounded-lg p-4 border border-blue-600">
                <p className="text-sm text-gray-200 italic">
                  "¡Hola! 👋 Espero que estés teniendo un día increíble. 
                  Te comparto este contenido que creo que te va a encantar..."
                </p>
              </div>
              <p className="text-xs text-blue-300 mt-2">
                Este es un ejemplo de cómo se vería un email con tu voz actual
              </p>
            </div>

            {/* Tips */}
            <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">💡 Consejos</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Usa palabras que reflejen tu personalidad</li>
                <li>• Incluye emojis que uses frecuentemente</li>
                <li>• Define un tono consistente</li>
                <li>• Analiza tu Instagram para mejor precisión</li>
              </ul>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Acciones Rápidas</h3>
              <div className="space-y-3">
                <Link 
                  href="/admin/gestion-ia/instagram"
                  className="block w-full text-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
                >
                  Analizar Instagram
                </Link>
                <Link 
                  href="/admin/gestion-ia/generador-correos"
                  className="block w-full text-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-medium rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200"
                >
                  Probar Generación
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdmimDashboardLayout>
  );
} 