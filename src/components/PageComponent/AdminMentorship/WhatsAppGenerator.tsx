import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../redux/store';
import { setSelectedVideo } from '../../../redux/features/instagramVideosSlice';

interface WhatsAppGeneratorProps {
  onGenerateSuggestions?: (topic: string) => Promise<any>;
}

const WhatsAppGenerator: React.FC<WhatsAppGeneratorProps> = ({ 
  onGenerateSuggestions 
}) => {
  const dispatch = useDispatch();
  const { videos, selectedVideo } = useSelector((state: RootState) => state.instagramVideos);
  
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingFromVideo, setIsGeneratingFromVideo] = useState(false);
  const [generatedWhatsApp, setGeneratedWhatsApp] = useState<any>(null);
  const [messageType, setMessageType] = useState<'reflection' | 'tip' | 'promotion' | 'story'>('reflection');

  const handleGenerateWhatsApp = async () => {
    if (!topic.trim()) {
      alert('Por favor ingresa un tema para generar el mensaje de WhatsApp');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/instagram/generate-whatsapp-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: topic,
          type: messageType
        }),
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedWhatsApp(data.whatsapp);
      } else {
        console.error('Error generating WhatsApp message:', data.error);
        alert('Error generando mensaje de WhatsApp: ' + data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error generando mensaje de WhatsApp');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateFromSelectedVideo = async () => {
    if (!selectedVideo) {
      alert('Por favor selecciona un video de Instagram primero');
      return;
    }

    setIsGeneratingFromVideo(true);
    try {
      const response = await fetch('/api/instagram/generate-whatsapp-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoId: selectedVideo.id,
          caption: selectedVideo.caption,
          type: messageType
        }),
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedWhatsApp(data.whatsapp);
      } else {
        console.error('Error generating WhatsApp message:', data.error);
        alert('Error generando mensaje de WhatsApp: ' + data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error generando mensaje de WhatsApp');
    } finally {
      setIsGeneratingFromVideo(false);
    }
  };

  const handleVideoSelect = (video: any) => {
    dispatch(setSelectedVideo(video));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Mensaje copiado al portapapeles!');
  };

  const openWhatsApp = (text: string) => {
    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-6 text-white">
        <h3 className="text-2xl font-bold mb-2">📱 Generador de Mensajes WhatsApp</h3>
        <p className="text-green-100">
          Genera mensajes de WhatsApp auténticos en el estilo de Mateo, directos y conversacionales
        </p>
      </div>

      {/* Tipo de mensaje */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-white mb-4">🎯 Tipo de Mensaje</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { value: 'reflection', label: 'Reflexión', icon: '🤔' },
            { value: 'tip', label: 'Consejo', icon: '💡' },
            { value: 'promotion', label: 'Promoción', icon: '🔥' },
            { value: 'story', label: 'Historia', icon: '📖' }
          ].map((type) => (
            <button
              key={type.value}
              onClick={() => setMessageType(type.value as any)}
              className={`p-3 rounded-lg border-2 transition-all ${
                messageType === type.value
                  ? 'border-green-500 bg-green-600 text-white'
                  : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-green-500'
              }`}
            >
              <div className="text-2xl mb-1">{type.icon}</div>
              <div className="text-sm font-medium">{type.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Generación desde concepto */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-white mb-4">💭 Generar desde Concepto</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Concepto o Tema
            </label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ej: La importancia de la respiración en el movimiento, cómo mejorar la flexibilidad, etc."
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:ring-1 focus:ring-green-500"
              rows={3}
            />
          </div>
          <button
            onClick={handleGenerateWhatsApp}
            disabled={isGenerating || !topic.trim()}
            className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? 'Generando...' : 'Generar Mensaje WhatsApp con IA'}
          </button>
        </div>
      </div>

      {/* Videos de Instagram */}
      {videos && videos.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-white mb-4">📹 Videos de Instagram</h4>
          
          {/* Lista de videos */}
          <div className="space-y-3 mb-4">
            {videos.slice(0, 5).map((video: any, index: number) => (
              <div
                key={video.id}
                onClick={() => handleVideoSelect(video)}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedVideo?.id === video.id
                    ? 'border-green-500 bg-green-600 text-white'
                    : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-green-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium">Video {index + 1}</div>
                    <div className="text-sm opacity-75 truncate">
                      {video.caption?.substring(0, 100)}...
                    </div>
                  </div>
                  <div className="text-xs opacity-60">
                    {new Date(video.timestamp).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Video seleccionado */}
          {selectedVideo && (
            <div className="bg-gray-700 rounded-lg p-4 mb-4">
              <h5 className="text-white font-medium mb-2">Video Seleccionado:</h5>
              <p className="text-gray-300 text-sm">{selectedVideo.caption?.substring(0, 150)}...</p>
            </div>
          )}

          <button
            onClick={handleGenerateFromSelectedVideo}
            disabled={isGeneratingFromVideo || !selectedVideo}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            {isGeneratingFromVideo ? 'Generando...' : 'Generar WhatsApp desde Video Seleccionado'}
          </button>
        </div>
      )}

      {/* Resultado del mensaje de WhatsApp */}
      {generatedWhatsApp && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-white mb-4">
            📱 Mensaje de WhatsApp Generado
          </h4>
          
          <div className="bg-gray-700 rounded-lg border border-gray-600 overflow-hidden">
            {/* Header del WhatsApp */}
            <div className="bg-green-600 px-4 py-3 border-b border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium text-white">WhatsApp en tu Estilo Auténtico</h5>
                  <p className="text-sm text-green-100">Tipo: {messageType}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(generatedWhatsApp.fullMessage)}
                    className="px-3 py-1 bg-green-700 text-white text-sm rounded hover:bg-green-800 transition-colors"
                  >
                    Copiar
                  </button>
                  <button
                    onClick={() => openWhatsApp(generatedWhatsApp.fullMessage)}
                    className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
                  >
                    Abrir WhatsApp
                  </button>
                </div>
              </div>
            </div>
              
            {/* Contenido del WhatsApp - Vista previa real */}
            <div className="p-6 bg-gray-900">
              <div className="space-y-4">
                {generatedWhatsApp.messages.map((message: string, index: number) => (
                  <div key={index} className="flex justify-end">
                    <div className="bg-green-500 text-white p-3 rounded-lg max-w-xs lg:max-w-md">
                      <div 
                        className="whatsapp-message"
                        style={{
                          fontFamily: 'system-ui, -apple-system, sans-serif',
                          lineHeight: '1.4',
                          fontSize: '14px',
                          whiteSpace: 'pre-line'
                        }}
                      >
                        {message}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Metadatos */}
            <div className="bg-gray-800 px-4 py-3 border-t border-gray-600">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">IA:</span>
                  <span className="text-white ml-2">{generatedWhatsApp.aiProvider}</span>
                </div>
                <div>
                  <span className="text-gray-400">Costo estimado:</span>
                  <span className="text-white ml-2">${generatedWhatsApp.estimatedCost.toFixed(4)}</span>
                </div>
                <div>
                  <span className="text-gray-400">Mensajes:</span>
                  <span className="text-white ml-2">{generatedWhatsApp.messages.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppGenerator; 