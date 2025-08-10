'use client';

import React, { useState, useEffect } from 'react';
import { 
  PhotoIcon, 
  SparklesIcon, 
  EyeIcon, 
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';
import InstagramService, { InstagramAnalysis } from '../../../services/instagram';
import { toast } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { setVideos, setLoading, setError } from '../../../redux/features/instagramVideosSlice';

interface InstagramAnalyzerProps {
  onAnalysisComplete: (analysis: InstagramAnalysis) => void;
  userId: string;
}

const InstagramAnalyzer: React.FC<InstagramAnalyzerProps> = ({ onAnalysisComplete, userId }) => {
  const dispatch = useDispatch();
  const { videos, isLoading, error, lastSync } = useSelector((state: RootState) => state.instagramVideos);
  
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connected' | 'error'>('idle');
  const [insights, setInsights] = useState<any>(null);
  const [analysis, setAnalysis] = useState<InstagramAnalysis | null>(null);

  // Verificar conexión automáticamente al cargar
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch('/api/instagram/check-credentials');
        const data = await response.json();
        
        if (data.hasCredentials) {
          setConnectionStatus('connected');
          // Cargar datos automáticamente
          await loadInstagramData();
        } else {
          setConnectionStatus('error');
          dispatch(setError('No se encontraron credenciales de Instagram configuradas'));
        }
      } catch (error) {
        setConnectionStatus('error');
        dispatch(setError('Error verificando credenciales de Instagram'));
      }
    };

    checkConnection();
  }, [dispatch]);

  const loadInstagramData = async () => {
    try {
      dispatch(setLoading(true));
      const response = await fetch('/api/instagram/connect', {
        method: 'GET'
      });
      const data = await response.json();
      
      if (data.success) {
        setInsights(data.insights);
        // Guardar videos en Redux
        dispatch(setVideos(data.videos || []));
        toast.success(`Cargados ${data.videos?.length || 0} videos de Instagram`);
      }
    } catch (error) {
      console.error('Error loading Instagram data:', error);
      dispatch(setError('Error cargando datos de Instagram'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <QuestionMarkCircleIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Conectado a Instagram';
      case 'error':
        return 'Error de conexión';
      default:
        return 'Verificando conexión...';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
          <PhotoIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Datos de Instagram</h3>
          <p className="text-sm text-gray-300">Conecta tu cuenta y carga tus videos automáticamente</p>
        </div>
      </div>

      {/* Campos de conexión */}
      {connectionStatus === 'connected' && (
        <div className="mb-6 p-4 bg-green-900 border border-green-700 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircleIcon className="w-5 h-5 text-green-400" />
            <span className="font-medium text-green-200">Credenciales configuradas</span>
          </div>
          <p className="text-sm text-green-300 mb-3">
            Tus credenciales de Instagram están almacenadas en las variables de entorno. 
            Los datos se cargan automáticamente.
          </p>
          <div className="flex items-center gap-4 text-sm text-green-300">
            <span>Videos cargados: {videos.length}</span>
            <button
              onClick={loadInstagramData}
              className="text-green-400 hover:text-green-300 underline"
            >
              Recargar datos
            </button>
          </div>
        </div>
      )}

      {connectionStatus === 'error' && (
        <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <XCircleIcon className="w-5 h-5 text-red-400" />
            <span className="font-medium text-red-200">Error de conexión</span>
          </div>
          <p className="text-sm text-red-300 mb-3">
            No se pudieron cargar las credenciales de Instagram. Por favor, verifica que tus variables de entorno estén configuradas correctamente.
          </p>
          <button
            onClick={loadInstagramData}
            className="text-sm text-red-400 hover:text-red-300 underline"
          >
            Reintentar conexión
          </button>
        </div>
      )}

      {connectionStatus === 'idle' && (
        <div className="mb-6 p-4 bg-gray-700 border border-gray-600 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <QuestionMarkCircleIcon className="w-5 h-5 text-gray-400" />
            <span className="font-medium text-gray-200">Verificando conexión</span>
          </div>
          <p className="text-sm text-gray-300">
            Verificando credenciales de Instagram...
          </p>
        </div>
      )}

      {/* Mostrar videos cargados */}
      {videos.length > 0 && (
        <div className="mb-6">
          <h4 className="text-md font-semibold text-white mb-3">Videos recientes ({videos.length})</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {videos.slice(0, 5).map((video, index) => (
              <div key={index} className="p-3 bg-gray-700 rounded border border-gray-600">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <EyeIcon className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">
                      {video.caption?.substring(0, 100) || 'Sin caption'}...
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(video.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {videos.length > 5 && (
            <p className="text-xs text-gray-400 mt-2">
              Mostrando 5 de {videos.length} videos
            </p>
          )}
        </div>
      )}

      {/* Información de insights */}
      {insights && (
        <div className="mb-6">
          <h4 className="text-md font-semibold text-white mb-3">Insights</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-700 rounded border border-gray-600">
              <p className="text-xs text-gray-400">Total de videos</p>
              <p className="text-lg font-semibold text-white">{insights.totalVideos || videos.length}</p>
            </div>
            <div className="p-3 bg-gray-700 rounded border border-gray-600">
              <p className="text-xs text-gray-400">Promedio de engagement</p>
              <p className="text-lg font-semibold text-white">{insights.avgEngagement || 'N/A'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstagramAnalyzer; 