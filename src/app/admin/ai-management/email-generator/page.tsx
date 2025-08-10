'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import CopywritingAssistant from '../../../../components/PageComponent/AdminMentorship/CopywritingAssistant';
import AdmimDashboardLayout from '../../../../components/AdmimDashboardLayout';

export default function EmailGeneratorManagementPage() {
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
              <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Generador de Emails</h1>
                <p className="text-gray-300 mt-1">
                  Genera emails automáticamente usando IA con tu voz personalizada
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
            <span className="text-white">Generador de Emails</span>
          </nav>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <CopywritingAssistant />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Email Templates */}
            <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Templates Disponibles</h3>
              <div className="space-y-3">
                <div className="p-3 bg-gray-700 rounded-lg border border-gray-600">
                  <h4 className="font-medium text-white text-sm">Newsletter Semanal</h4>
                  <p className="text-xs text-gray-300 mt-1">Email informativo con contenido destacado</p>
                </div>
                <div className="p-3 bg-gray-700 rounded-lg border border-gray-600">
                  <h4 className="font-medium text-white text-sm">Programa Transformacional</h4>
                  <p className="text-xs text-gray-300 mt-1">Email semanal para participantes</p>
                </div>
                <div className="p-3 bg-gray-700 rounded-lg border border-gray-600">
                  <h4 className="font-medium text-white text-sm">Recordatorio de Clase</h4>
                  <p className="text-xs text-gray-300 mt-1">Aviso de próxima clase en vivo</p>
                </div>
                <div className="p-3 bg-gray-700 rounded-lg border border-gray-600">
                  <h4 className="font-medium text-white text-sm">Email Personalizado</h4>
                  <p className="text-xs text-gray-300 mt-1">Crea tu propio template</p>
                </div>
              </div>
            </div>

            {/* Recent Generations */}
            <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Generaciones Recientes</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-900 rounded-lg border border-green-700">
                  <div>
                    <p className="text-sm font-medium text-green-200">Newsletter #24</p>
                    <p className="text-xs text-green-300">Hace 2 horas</p>
                  </div>
                  <span className="text-xs bg-green-800 text-green-200 px-2 py-1 rounded-full">
                    Enviado
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-900 rounded-lg border border-blue-700">
                  <div>
                    <p className="text-sm font-medium text-blue-200">Programa Semana 3</p>
                    <p className="text-xs text-blue-300">Hace 1 día</p>
                  </div>
                  <span className="text-xs bg-blue-800 text-blue-200 px-2 py-1 rounded-full">
                    Programado
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg border border-gray-600">
                  <div>
                    <p className="text-sm font-medium text-gray-200">Recordatorio Clase</p>
                    <p className="text-xs text-gray-300">Hace 3 días</p>
                  </div>
                  <span className="text-xs bg-gray-600 text-gray-200 px-2 py-1 rounded-full">
                    Borrador
                  </span>
                </div>
              </div>
            </div>

            {/* AI Stats */}
            <div className="bg-gradient-to-r from-green-900 to-emerald-900 rounded-xl border border-green-700 p-6">
              <h3 className="text-lg font-semibold text-green-200 mb-4">Estadísticas de IA</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-green-300">Emails generados</span>
                  <span className="font-medium text-green-200">24</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-green-300">Tokens usados</span>
                  <span className="font-medium text-green-200">1,247</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-green-300">Tiempo promedio</span>
                  <span className="font-medium text-green-200">3.2s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-green-300">Satisfacción</span>
                  <span className="font-medium text-green-200">94%</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Acciones Rápidas</h3>
              <div className="space-y-3">
                <Link 
                  href="/admin/ai-management/voice-brand"
                  className="block w-full text-center px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200"
                >
                  Configurar Voz
                </Link>
                <Link 
                  href="/admin/ai-management/instagram"
                  className="block w-full text-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
                >
                  Analizar Instagram
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdmimDashboardLayout>
  );
} 