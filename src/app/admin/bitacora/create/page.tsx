'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../hooks/useAuth';
import Cookies from 'js-cookie';
import AdmimDashboardLayout from '../../../../components/AdmimDashboardLayout';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { ArrowLeftIcon, CalendarIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface WeekContent {
  weekNumber: number;
  moduleName?: string;
  videoUrl: string;
  videoId?: string;
  videoName?: string;
  videoThumbnail?: string;
  videoDuration?: number;
  videoDescription?: string;
  audioUrl: string;
  audioTitle?: string;
  audioDuration?: number;
  text: string;
  publishDate: string;
  isPublished: boolean;
}

export default function CreateBitacoraPage() {
  const router = useRouter();
  const auth = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [title, setTitle] = useState('Camino');
  const [description, setDescription] = useState('');
  
  const [weeks, setWeeks] = useState<WeekContent[]>(Array.from({ length: 4 }).map((_, idx) => ({
    weekNumber: idx + 1,
    moduleName: '',
    videoUrl: '',
    videoName: '',
    videoDescription: '',
    audioUrl: '',
    audioTitle: '',
    text: '',
    publishDate: '',
    isPublished: false
  })));

  const getFirstMondayOfMonth = (year: number, month: number): Date => {
    const firstDay = new Date(year, month - 1, 1);
    const dayOfWeek = firstDay.getDay();
    const daysToMonday = dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 0 : 8 - dayOfWeek;
    const firstMonday = new Date(firstDay);
    firstMonday.setDate(1 + daysToMonday);
    return firstMonday;
  };

  const calculatePublishDates = () => {
    const newWeeks = [...weeks];
    const firstMonday = getFirstMondayOfMonth(year, month);
    
    newWeeks.forEach((week, index) => {
      const mondayDate = new Date(firstMonday);
      mondayDate.setDate(firstMonday.getDate() + (index * 7));
      week.publishDate = mondayDate.toISOString().split('T')[0];
    });
    
    setWeeks(newWeeks);
  };

  useEffect(() => {
    const cookies: any = Cookies.get('userToken');
    
    if (!cookies) {
      router.push('/login');
      return;
    }
    
    if (!auth.user) {
      auth.fetchUser();
      return;
    }
    
    if (auth.user.rol !== 'Admin') {
      router.push('/login');
      return;
    }
    
    setLoading(false);
    
    // Calcular fechas de publicación automáticamente (cada lunes del mes)
    calculatePublishDates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.user, router, month, year]);


  const updateWeek = (index: number, field: keyof WeekContent, value: any) => {
    const newWeeks = [...weeks];
    newWeeks[index] = { ...newWeeks[index], [field]: value };
    setWeeks(newWeeks);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validar que todos los campos estén completos
      for (let i = 0; i < weeks.length; i++) {
        const week = weeks[i];
        if (!week.videoUrl || !week.audioUrl || !week.text || !week.publishDate) {
          toast.error(`Por favor completa todos los campos de la semana ${i + 1}`);
          setSubmitting(false);
          return;
        }
      }

      const response = await fetch('/api/bitacora/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          month,
          year,
          title,
          description,
          weeklyContents: weeks.map(week => ({
            weekNumber: week.weekNumber,
            moduleName: week.moduleName?.trim() || undefined,
            weekTitle: `Semana ${week.weekNumber}`,
            videoUrl: week.videoUrl,
            videoId: week.videoId || null,
            videoName: week.videoName?.trim() || `Semana ${week.weekNumber}`,
            videoThumbnail: week.videoThumbnail || '',
            videoDuration: week.videoDuration || undefined,
            audioUrl: week.audioUrl,
            audioTitle: week.audioTitle?.trim() || `Semana ${week.weekNumber}`,
            audioDuration: week.audioDuration || undefined,
            text: week.text,
            publishDate: new Date(week.publishDate).toISOString(),
            isPublished: week.isPublished,
            isUnlocked: false
          }))
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear la camino');
      }

      toast.success('Camino creada exitosamente');
      router.push('/admin/memberships/bitacora');
    } catch (error: any) {
      console.error('Error creando camino:', error);
      toast.error(error.message || 'Error al crear la camino');
    } finally {
      setSubmitting(false);
    }
  };

    if (loading) {
    return (
      <AdmimDashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
        </div>
      </AdmimDashboardLayout>
    );
  }

  return (
    <AdmimDashboardLayout>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/admin/memberships/bitacora"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-montserrat"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Volver al Dashboard
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 md:p-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 font-montserrat">
            Crear Camino Mensual
          </h1>
          <p className="text-gray-600 mb-8 font-montserrat">
            Configura 4 semanas de contenido para el Camino
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Información General */}
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-montserrat">
                  Mes
                </label>
                <select
                  value={month}
                  onChange={(e) => {
                    setMonth(Number(e.target.value));
                    calculatePublishDates();
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-montserrat"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      {new Date(2000, m - 1).toLocaleDateString('es-ES', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-montserrat">
                  Año
                </label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => {
                    setYear(Number(e.target.value));
                    calculatePublishDates();
                  }}
                  min={new Date().getFullYear()}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-montserrat"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-montserrat">
                  Título (opcional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Camino"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-montserrat"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-montserrat">
                Descripción (opcional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Descripción del mes..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-montserrat"
              />
            </div>

            {/* Semanas */}
            <div className="space-y-8">
              {weeks.map((week, index) => (
                <motion.div
                  key={week.weekNumber}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border-2 border-gray-200 rounded-xl p-6 bg-gradient-to-br from-orange-50 to-amber-50"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="px-4 py-2 bg-orange-500 text-white rounded-lg font-bold text-lg font-montserrat">
                      Semana {week.weekNumber}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 font-montserrat">
                      <CalendarIcon className="w-5 h-5" />
                      <input
                        type="date"
                        value={week.publishDate}
                        onChange={(e) => updateWeek(index, 'publishDate', e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-montserrat"
                      />
                    </div>
                  </div>

                  {/* Módulo */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-montserrat">
                      Módulo (opcional)
                    </label>
                    <input
                      type="text"
                      value={week.moduleName || ''}
                      onChange={(e) => updateWeek(index, 'moduleName', e.target.value)}
                      placeholder="Nombre del módulo o déjalo vacío para agrupar automáticamente"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-montserrat"
                    />
                    <p className="text-xs text-gray-500 mt-1 font-montserrat">
                      Las semanas con el mismo nombre de módulo se agruparán juntas
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-montserrat">
                        Nombre del Video
                      </label>
                      <input
                        type="text"
                        value={week.videoName || ''}
                        onChange={(e) => updateWeek(index, 'videoName', e.target.value)}
                        placeholder="Ej: Video Intro, Video Práctica..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-montserrat mb-3"
                      />
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-montserrat">
                        Descripción del Video
                      </label>
                      <textarea
                        value={week.videoDescription || ''}
                        onChange={(e) => updateWeek(index, 'videoDescription', e.target.value)}
                        placeholder="Descripción del video..."
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-montserrat mb-3"
                      />
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-montserrat">
                        URL del Video *
                      </label>
                      <input
                        type="url"
                        value={week.videoUrl}
                        onChange={(e) => updateWeek(index, 'videoUrl', e.target.value)}
                        placeholder="https://..."
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-montserrat"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-montserrat">
                        Nombre del Audio
                      </label>
                      <input
                        type="text"
                        value={week.audioTitle || ''}
                        onChange={(e) => updateWeek(index, 'audioTitle', e.target.value)}
                        placeholder="Ej: Audio Reflexión, Audio Guía..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-montserrat mb-3"
                      />
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-montserrat">
                        URL del Audio *
                      </label>
                      <input
                        type="url"
                        value={week.audioUrl}
                        onChange={(e) => updateWeek(index, 'audioUrl', e.target.value)}
                        placeholder="https://..."
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-montserrat"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-montserrat">
                      Texto de la Semana *
                    </label>
                    <textarea
                      value={week.text}
                      onChange={(e) => updateWeek(index, 'text', e.target.value)}
                      rows={6}
                      placeholder="Contenido textual de la semana..."
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-montserrat"
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <Link
                href="/admin/memberships/bitacora"
                className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors font-montserrat"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-montserrat flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    <span>Creando...</span>
                  </>
                ) : (
                  <span>Crear Camino</span>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AdmimDashboardLayout>
  );
}

