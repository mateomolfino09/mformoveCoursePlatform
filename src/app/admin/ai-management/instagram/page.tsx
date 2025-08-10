'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import AdmimDashboardLayout from '../../../../components/AdmimDashboardLayout';
import InstagramAnalyzer from '../../../../components/PageComponent/AdminMentorship/InstagramAnalyzer';
import CopywritingAssistant from '../../../../components/PageComponent/AdminMentorship/CopywritingAssistant';
import WhatsAppGenerator from '../../../../components/PageComponent/AdminMentorship/WhatsAppGenerator';

export default function InstagramPage() {
  const [activeTab, setActiveTab] = useState<'analyzer' | 'copywriting' | 'whatsapp'>('analyzer');
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState({
    apiConnected: false,
    credentialsConfigured: false
  });
  const [instagramStats, setInstagramStats] = useState({
    totalVideos: 0,
    captionsWithText: 0,
    mostUsedEmojis: 0,
    lastSync: 'Nunca'
  });

  useEffect(() => {
    const loadInstagramStats = async () => {
      try {
        setIsLoading(true);
        
        // Verificar credenciales
        const credentialsResponse = await fetch('/api/instagram/check-credentials');
        const credentialsData = await credentialsResponse.json();
        
        setConnectionStatus({
          apiConnected: credentialsData.hasCredentials,
          credentialsConfigured: credentialsData.hasCredentials
        });

        if (credentialsData.hasCredentials) {
          // Cargar datos básicos de Instagram
          const connectResponse = await fetch('/api/instagram/connect');
          const connectData = await connectResponse.json();
          
          if (connectData.success) {
            setInstagramStats({
              totalVideos: connectData.videos?.length || 0,
              captionsWithText: connectData.videos?.filter((v: any) => v.caption)?.length || 0,
              mostUsedEmojis: connectData.insights?.mostUsedEmojis?.length || 0,
              lastSync: 'Recién'
            });
          }
        }
      } catch (error) {
        console.error('Error loading Instagram stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInstagramStats();
  }, []);

  const handleDataLoaded = (data: any) => {
    // Actualizar estadísticas cuando se cargan los datos
    if (data && data.videos) {
      setInstagramStats(prev => ({
        ...prev,
        totalVideos: data.videos.length,
        captionsWithText: data.videos.filter((v: any) => v.caption)?.length || 0,
        lastSync: 'Recién'
      }));
    }
  };

  return (
    <AdmimDashboardLayout>
      <div className="w-full">
        {/* Loading Global */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
              <div className="flex items-center gap-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                <div>
                  <h3 className="text-white font-semibold">Conectando a Instagram...</h3>
                  <p className="text-gray-300 text-sm">Cargando estadísticas de tu cuenta</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8 mt-8">
          <div className="flex items-center gap-4 mb-6">
            <Link 
              href="/admin/ai-management"
              className="p-2 bg-gray-800 rounded-lg shadow-lg border border-gray-700 hover:bg-gray-700 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-300" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Datos de Instagram</h1>
                <p className="text-gray-300 mt-1">
                  Conecta tu cuenta y carga tus videos para generar emails personalizados
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
            <span className="text-white">Instagram</span>
          </nav>

          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg border border-gray-700">
            <button
              onClick={() => setActiveTab('analyzer')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'analyzer'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              Datos de Instagram
            </button>
            <button
              onClick={() => setActiveTab('copywriting')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'copywriting'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              Generar Emails
            </button>
            <button
              onClick={() => setActiveTab('whatsapp')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'whatsapp'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              Generar WhatsApp
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === 'analyzer' && (
              <InstagramAnalyzer onAnalysisComplete={handleDataLoaded} userId="admin" />
            )}
            
            {activeTab === 'copywriting' && (
              <div className="mt-8">
                <CopywritingAssistant />
              </div>
            )}

            {activeTab === 'whatsapp' && (
              <div className="mt-8">
                <WhatsAppGenerator />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Estado de Conexión</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Instagram API</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    connectionStatus.apiConnected 
                      ? 'bg-green-900 text-green-300' 
                      : 'bg-red-900 text-red-300'
                  }`}>
                    {connectionStatus.apiConnected ? 'Conectado' : 'Desconectado'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Credenciales</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    connectionStatus.credentialsConfigured 
                      ? 'bg-green-900 text-green-300' 
                      : 'bg-red-900 text-red-300'
                  }`}>
                    {connectionStatus.credentialsConfigured ? 'Configuradas' : 'No configuradas'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Última sincronización</span>
                  <span className="text-sm text-white">{instagramStats.lastSync}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Estadísticas</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-300">Videos cargados</p>
                  <p className="text-2xl font-bold text-white">{instagramStats.totalVideos}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-300">Captions disponibles</p>
                  <p className="text-2xl font-bold text-white">{instagramStats.captionsWithText}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-300">Emojis detectados</p>
                  <p className="text-2xl font-bold text-white">{instagramStats.mostUsedEmojis}</p>
                </div>
              </div>
            </div>

            {/* Help Card */}
            <div className="bg-gradient-to-r from-purple-900 to-pink-900 rounded-xl border border-purple-700 p-6">
              <h3 className="text-lg font-semibold text-purple-200 mb-3">¿Necesitas ayuda?</h3>
              <p className="text-sm text-purple-300 mb-4">
                Si tienes problemas para conectar tu cuenta de Instagram, revisa nuestra guía de configuración.
              </p>
              <div className="space-y-2">
                <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
                  Ver Guía
                </button>
                <Link 
                  href="/admin/auto-emails"
                  className="block w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-center"
                >
                  📧 Emails Automáticos
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdmimDashboardLayout>
  );
} 