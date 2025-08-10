'use client';

import React, { useState } from 'react';
import { 
  SparklesIcon, 
  LightBulbIcon,
  ChartBarIcon,
  HeartIcon,
  FireIcon,
  StarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  VideoCameraIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import { InstagramAnalysis } from '../../../services/instagram';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../redux/store';
import { setSelectedVideo } from '../../../redux/features/instagramVideosSlice';

interface CopywritingAssistantProps {
  analysis?: InstagramAnalysis;
  onGenerateSuggestions?: (topic: string) => Promise<any>;
}

const CopywritingAssistant: React.FC<CopywritingAssistantProps> = ({ 
  analysis, 
  onGenerateSuggestions 
}) => {
  const dispatch = useDispatch();
  const { videos, selectedVideo } = useSelector((state: RootState) => state.instagramVideos);
  
  const [topic, setTopic] = useState('');
  const [generatedEmail, setGeneratedEmail] = useState<any>(null);
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
  const [isGeneratingFromVideo, setIsGeneratingFromVideo] = useState(false);

  const handleGenerateEmail = async () => {
    if (!topic.trim()) return;
    
    setIsGeneratingEmail(true);
    setGeneratedEmail(null);
    
    try {
      // Generación directa de email sin análisis previo
      const emailResponse = await fetch('/api/instagram/generate-direct-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          concept: topic
        })
      });

      if (emailResponse.ok) {
        const emailResult = await emailResponse.json();
        setGeneratedEmail(emailResult.email);
      } else {
        console.error('Error generando email:', emailResponse.statusText);
      }
    } catch (error) {
      console.error('Error in email generation process:', error);
    } finally {
      setIsGeneratingEmail(false);
    }
  };

  const handleGenerateFromSelectedVideo = async () => {
    if (!selectedVideo) return;
    
    setIsGeneratingFromVideo(true);
    setGeneratedEmail(null);
    
    try {
      // Generar email desde el video seleccionado
      const videoEmailResponse = await fetch('/api/instagram/generate-email-from-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoId: selectedVideo.id,
          caption: selectedVideo.caption
        })
      });

      if (videoEmailResponse.ok) {
        const emailResult = await videoEmailResponse.json();
        setGeneratedEmail(emailResult.email);
        // Actualizar el topic con el tema del video para referencia
        setTopic(emailResult.videoSource?.tema || selectedVideo.caption?.substring(0, 50) || 'Video seleccionado');
      } else {
        console.error('Error generando email desde video:', videoEmailResponse.statusText);
      }
    } catch (error) {
      console.error('Error in video email generation:', error);
    } finally {
      setIsGeneratingFromVideo(false);
    }
  };

  const handleVideoSelect = (video: any) => {
    dispatch(setSelectedVideo(video));
    setTopic(video.caption?.substring(0, 100) || 'Video seleccionado');
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
          <SparklesIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Generador de Emails con IA</h3>
          <p className="text-sm text-gray-300">Genera un email auténtico en tu estilo basado en tu análisis de Instagram</p>
        </div>
      </div>

      {/* Lista de Videos de Instagram */}
      {videos.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-white mb-3 flex items-center gap-2">
            <VideoCameraIcon className="w-5 h-5" />
            Videos de Instagram ({videos.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
            {videos.map((video, index) => (
              <div 
                key={video.id || index}
                onClick={() => handleVideoSelect(video)}
                className={`p-3 rounded-lg border cursor-pointer transition-all hover:bg-gray-700 ${
                  selectedVideo?.id === video.id 
                    ? 'bg-blue-900 border-blue-500' 
                    : 'bg-gray-700 border-gray-600'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    {selectedVideo?.id === video.id ? (
                      <CheckCircleIcon className="w-4 h-4 text-blue-400" />
                    ) : (
                      <PlayIcon className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">
                      {video.caption?.substring(0, 80) || 'Sin caption'}...
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(video.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Video Seleccionado */}
      {selectedVideo && (
        <div className="mb-6 p-4 bg-blue-900 border border-blue-700 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircleIcon className="w-5 h-5 text-blue-400" />
            <span className="font-medium text-blue-200">Video Seleccionado</span>
          </div>
          <p className="text-sm text-blue-300 mb-3">
            {selectedVideo.caption?.substring(0, 150)}...
          </p>
          <p className="text-xs text-blue-400">
            {new Date(selectedVideo.timestamp).toLocaleDateString()}
          </p>
        </div>
      )}

      {/* Input para generar emails */}
      <div className="mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Ingresa un tema para generar emails (ej: meditación matutina, bienestar integral...)"
            className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleGenerateEmail}
            disabled={!topic.trim() || isGeneratingEmail}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isGeneratingEmail ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Generando tu email...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Generar Email con IA
              </div>
            )}
          </button>
        </div>
        
        {/* Botón para generar desde video seleccionado */}
        {selectedVideo && (
          <div className="mt-4 text-center">
            <button
              onClick={handleGenerateFromSelectedVideo}
              disabled={isGeneratingFromVideo || isGeneratingEmail}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-md hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isGeneratingFromVideo ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Generando desde video...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Generar Email desde Video Seleccionado
                </div>
              )}
            </button>
            <p className="text-xs text-gray-400 mt-2">Genera un email expandido basado en el video seleccionado</p>
          </div>
        )}
      </div>

      {/* Email Generado */}
      {generatedEmail && (
        <div className="mt-6">
          <h4 className="font-medium text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Email Generado para: "{topic}"
          </h4>
          
          <div className="bg-gray-700 rounded-lg border border-gray-600 overflow-hidden">
            {/* Header del email */}
            <div className="bg-gray-600 px-4 py-3 border-b border-gray-500">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium text-white">Email en tu Estilo Auténtico</h5>
                  <p className="text-sm text-gray-300">Asunto: {generatedEmail.subject}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigator.clipboard.writeText(`${generatedEmail.subject}\n\n${generatedEmail.body}`)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    Copiar
                  </button>
                  <button
                    onClick={() => window.open(`mailto:?subject=${encodeURIComponent(generatedEmail.subject)}&body=${encodeURIComponent(generatedEmail.body)}`)}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                  >
                    Enviar
                  </button>
                </div>
              </div>
            </div>
              
            {/* Contenido del email - Vista previa real */}
            <div className="p-6 bg-white text-gray-800">
              <div 
                className="email-preview"
                dangerouslySetInnerHTML={{ __html: generatedEmail.body }}
                style={{
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  lineHeight: '1.6',
                  fontSize: '14px'
                }}
              />
            </div>
            
            {/* Metadatos del email */}
            <div className="bg-gray-800 px-4 py-3 border-t border-gray-600">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h6 className="text-sm font-medium text-blue-300 mb-2">📧 CTA:</h6>
                  <p className="text-sm text-gray-300">{generatedEmail.cta}</p>
                </div>
                <div>
                  <h6 className="text-sm font-medium text-purple-300 mb-2">🏷️ Hashtags:</h6>
                  <div className="flex flex-wrap gap-1">
                    {Array.isArray(generatedEmail.hashtags) 
                      ? generatedEmail.hashtags.map((hashtag: string, hashtagIndex: number) => (
                          <span key={hashtagIndex} className="text-xs text-purple-100 bg-purple-800 px-2 py-1 rounded">
                            {hashtag}
                          </span>
                        ))
                      : (
                          <span className="text-xs text-purple-100 bg-purple-800 px-2 py-1 rounded">
                            {generatedEmail.hashtags}
                          </span>
                        )
                    }
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <h6 className="text-sm font-medium text-orange-300 mb-2">🧠 Disparadores Psicológicos:</h6>
                  <div className="space-y-1">
                    {generatedEmail.psychologicalTriggers.map((trigger: string, triggerIndex: number) => (
                      <div key={triggerIndex} className="text-xs text-orange-100 bg-orange-800 p-2 rounded">
                        {trigger}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h6 className="text-sm font-medium text-red-300 mb-2">💝 Apelaciones Emocionales:</h6>
                  <div className="space-y-1">
                    {generatedEmail.emotionalAppeals.map((appeal: string, appealIndex: number) => (
                      <div key={appealIndex} className="text-xs text-red-100 bg-red-800 p-2 rounded">
                        {appeal}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CopywritingAssistant; 