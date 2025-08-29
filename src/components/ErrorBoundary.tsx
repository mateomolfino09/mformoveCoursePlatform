'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Aquí puedes enviar el error a un servicio de monitoreo como Sentry
    // Sentry.captureException(error, { extra: errorInfo });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white font-montserrat">
          <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Fondo con gradiente */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50" />
            
            {/* Patrón de fondo */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23000000%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
            </div>

            {/* Contenido principal */}
            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
              <div className="text-center space-y-8">
                {/* Icono de error */}
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-red-400 to-red-600 rounded-full shadow-2xl mb-8">
                  <CheckCircleIcon className="h-12 w-12 text-white" />
                </div>

                {/* Título */}
                <div className="space-y-4">
                  <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                    Algo salió mal
                  </h1>
                  <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                    Ha ocurrido un error inesperado. Por favor, intenta recargar la página o contacta con soporte.
                  </p>
                </div>

                {/* Información del error (solo en desarrollo) */}
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 max-w-2xl mx-auto">
                    <div className="space-y-4">
                      <h3 className="font-bold text-red-900 mb-3 text-lg">Detalles del error (Desarrollo)</h3>
                      <div className="bg-red-50 rounded-2xl p-4">
                        <p className="text-red-800 text-sm font-mono">
                          {this.state.error.message}
                        </p>
                        {this.state.error.stack && (
                          <details className="mt-2">
                            <summary className="text-red-700 cursor-pointer text-sm">Ver stack trace</summary>
                            <pre className="text-red-600 text-xs mt-2 whitespace-pre-wrap">
                              {this.state.error.stack}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Acciones */}
                <div className="space-y-4">
                  <button
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#234C8C] to-blue-700 text-white font-bold text-lg rounded-2xl hover:from-[#1a3a6b] hover:to-blue-800 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                  >
                    Recargar página
                  </button>
                  
                  <button
                    onClick={() => window.location.href = '/events'}
                    className="inline-flex items-center px-8 py-4 bg-gray-600 text-white font-bold text-lg rounded-2xl hover:bg-gray-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 ml-4"
                  >
                    Volver a eventos
                  </button>
                </div>

                {/* Información de contacto */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 max-w-2xl mx-auto">
                  <div className="space-y-4">
                    <h3 className="font-bold text-gray-900 mb-3 text-lg">💬 ¿Necesitas ayuda?</h3>
                    <p className="text-gray-700">
                      Si el problema persiste, contáctanos en{' '}
                      <a href="mailto:soporte@mateomove.com" className="underline font-semibold text-[#234C8C] hover:text-[#1a3a6b]">
                        soporte@mateomove.com
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
