'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../../../hooks/useAuth';
import Cookies from 'js-cookie';
import AdmimDashboardLayout from '../../../../../../components/AdmimDashboardLayout';
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
  videoDescription?: string;
  audioUrl: string;
  audioTitle?: string;
  text: string;
  publishDate: string;
  isPublished: boolean;
}

interface PageProps {
  params: {
    id: string;
  };
}

export default function EditBitacoraPage({ params }: PageProps) {
  const router = useRouter();
  const auth = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [logbookId, setLogbookId] = useState<string>(params.id);

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [title, setTitle] = useState('Camino del Gorila');
  const [description, setDescription] = useState('');
  const [weeks, setWeeks] = useState<WeekContent[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const prevMonthRef = useRef<number>(month);
  const prevYearRef = useRef<number>(year);

  const getFirstMondayOfMonth = useCallback((year: number, month: number): Date => {
    const firstDay = new Date(year, month - 1, 1);
    const dayOfWeek = firstDay.getDay();
    const daysToMonday = dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 0 : 8 - dayOfWeek;
    const firstMonday = new Date(firstDay);
    firstMonday.setDate(1 + daysToMonday);
    return firstMonday;
  }, []);

  const calculatePublishDates = useCallback((currentWeeks: WeekContent[]) => {
    const newWeeks = [...currentWeeks];
    const firstMonday = getFirstMondayOfMonth(year, month);

    newWeeks.forEach((week, index) => {
      const mondayDate = new Date(firstMonday);
      mondayDate.setDate(firstMonday.getDate() + (index * 7));
      week.publishDate = mondayDate.toISOString().split('T')[0];
    });

    setWeeks(newWeeks);
  }, [year, month, getFirstMondayOfMonth]);

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

    const fetchLogbookData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/bitacora/get/${logbookId}`, {
          credentials: 'include',
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('Bitácora no encontrada');
        }

        const data = await response.json();
        const loadedLogbook = data.logbook;

        setMonth(loadedLogbook.month);
        setYear(loadedLogbook.year);
        setTitle(loadedLogbook.title || 'Camino del Gorila');
        setDescription(loadedLogbook.description || '');

        // Convertir la estructura de la bitácora a la estructura del formulario
        const formattedWeeks: WeekContent[] = loadedLogbook.weeklyContents.map((week: any) => {
          // Si tiene dailyContents, usar el primer día para video/audio (simplificado para el formulario)
          const firstDailyVideo = week.dailyContents?.find((d: any) => d.visualContent?.videoUrl || d.visualContent?.videoId);
          const firstDailyAudio = week.dailyContents?.find((d: any) => d.audioTextContent?.audioUrl || d.audioTextContent?.text);

          // Obtener fecha de publicación: priorizar dailyContents, luego week.publishDate
          let publishDate = '';
          if (firstDailyVideo?.publishDate) {
            publishDate = new Date(firstDailyVideo.publishDate).toISOString().split('T')[0];
          } else if (firstDailyAudio?.publishDate) {
            publishDate = new Date(firstDailyAudio.publishDate).toISOString().split('T')[0];
          } else if (week.publishDate) {
            publishDate = typeof week.publishDate === 'string' 
              ? week.publishDate.split('T')[0]
              : new Date(week.publishDate).toISOString().split('T')[0];
          }

          return {
            weekNumber: week.weekNumber,
            moduleName: week.moduleName || '',
            videoUrl: firstDailyVideo?.visualContent?.videoUrl || week.videoUrl || '',
            videoId: firstDailyVideo?.visualContent?.videoId || week.videoId || '',
            videoName: firstDailyVideo?.visualContent?.nombre || week.videoName || '',
            videoDescription: firstDailyVideo?.visualContent?.description || '',
            audioUrl: firstDailyAudio?.audioTextContent?.audioUrl || week.audioUrl || '',
            audioTitle: firstDailyAudio?.audioTextContent?.nombre || week.audioTitle || '',
            text: firstDailyAudio?.audioTextContent?.text || week.text || '',
            publishDate: publishDate,
            isPublished: firstDailyVideo?.isPublished !== undefined ? firstDailyVideo.isPublished : (firstDailyAudio?.isPublished !== undefined ? firstDailyAudio.isPublished : (week.isPublished || false))
          };
        });
        setWeeks(formattedWeeks);
        setIsInitialLoad(true); // Marcar como carga inicial para evitar recalcular fechas
        prevMonthRef.current = month;
        prevYearRef.current = year;
      } catch (err: any) {
        console.error('Error fetching logbook for edit:', err);
        toast.error(err.message || 'Error al cargar la bitácora para edición');
        router.push('/admin/memberships/bitacora/list');
      } finally {
        setLoading(false);
      }
    };

    fetchLogbookData();
  }, [auth.user, router, logbookId]);

  // Recalcular fechas de publicación solo si el usuario cambia mes o año manualmente
  // No recalcular cuando se cargan los datos iniciales
  useEffect(() => {
    // Si es la carga inicial y ya tenemos semanas, marcar como completada la carga inicial
    if (isInitialLoad && !loading && weeks.length > 0) {
      const timer = setTimeout(() => {
        setIsInitialLoad(false);
        prevMonthRef.current = month;
        prevYearRef.current = year;
      }, 100);
      return () => clearTimeout(timer);
    }
    
    // Solo recalcular si el usuario cambió mes o año manualmente (después de la carga inicial)
    if (!loading && weeks.length > 0 && !isInitialLoad && (prevMonthRef.current !== month || prevYearRef.current !== year)) {
      calculatePublishDates(weeks);
      prevMonthRef.current = month;
      prevYearRef.current = year;
    }
  }, [month, year, loading, calculatePublishDates, weeks.length, isInitialLoad]);

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

      const payload = {
        month,
        year,
        title,
        description,
        weeklyContents: weeks.map(week => ({
            weekNumber: week.weekNumber,
            moduleName: week.moduleName?.trim() || '',
            weekTitle: `Semana ${week.weekNumber}`,
            // Contenido legacy (semanal)
            videoUrl: week.videoUrl,
            videoId: week.videoId || '',
            videoName: week.videoName?.trim() || `Semana ${week.weekNumber}`,
            audioUrl: week.audioUrl,
            audioTitle: week.audioTitle?.trim() || `Semana ${week.weekNumber}`,
            text: week.text,
            // Para contenido diario, crear un día con video y audio
            dailyContents: week.videoUrl || week.audioUrl || week.text ? [{
              dayNumber: 1,
              dayTitle: `Semana ${week.weekNumber}`,
              visualContent: week.videoUrl ? {
                type: 'video',
                nombre: week.videoName?.trim() || '',
                videoUrl: week.videoUrl,
                videoId: week.videoId || '',
                description: week.videoDescription?.trim() || ''
              } : {
                type: 'none',
                nombre: '',
                videoUrl: '',
                videoId: '',
                description: ''
              },
              audioTextContent: (week.audioUrl || week.text) ? {
                nombre: week.audioTitle?.trim() || '',
                audioUrl: week.audioUrl || '',
                text: week.text || ''
              } : {
                nombre: '',
                audioUrl: '',
                text: ''
              },
              publishDate: week.publishDate,
              isPublished: week.isPublished,
              isUnlocked: false
            }] : [],
            publishDate: new Date(week.publishDate).toISOString(),
            isPublished: week.isPublished,
            isUnlocked: false
          }))
      };

      // DEBUG: Log de lo que se envía desde el frontend
      console.log('=== DEBUG FRONTEND - Datos enviados ===');
      console.log('Payload completo:', JSON.stringify(payload, null, 2));
      if (payload.weeklyContents && payload.weeklyContents.length > 0) {
        console.log('Semana 1 moduleName:', payload.weeklyContents[0].moduleName);
        if (payload.weeklyContents[0].dailyContents && payload.weeklyContents[0].dailyContents.length > 0) {
          console.log('Semana 1 video nombre:', payload.weeklyContents[0].dailyContents[0].visualContent?.nombre);
          console.log('Semana 1 audio nombre:', payload.weeklyContents[0].dailyContents[0].audioTextContent?.nombre);
        }
      }

      const response = await fetch(`/api/bitacora/update/${logbookId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar la bitácora');
      }

      toast.success('Bitácora actualizada exitosamente');
      router.push('/admin/memberships/bitacora/list');
    } catch (error: any) {
      console.error('Error actualizando bitácora:', error);
      toast.error(error.message || 'Error al actualizar la bitácora');
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
          href="/admin/memberships/bitacora/list"
          className="inline-flex items-center gap-2 text-black hover:text-gray-900 mb-6 font-montserrat"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Volver a la Lista de Bitácoras
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 md:p-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 font-montserrat">
            Editar Bitácora Mensual
          </h1>
          <p className="text-black mb-8 font-montserrat">
            Modifica el contenido de las 4 semanas del Camino del Gorila
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Información General */}
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2 font-montserrat">
                  Mes
                </label>
                <select
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-montserrat text-black bg-white"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      {new Date(2000, m - 1).toLocaleDateString('es-ES', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2 font-montserrat">
                  Año
                </label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  min={new Date().getFullYear()}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-montserrat text-black bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2 font-montserrat">
                  Título (opcional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Camino del Gorila"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-montserrat text-black bg-white"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-montserrat text-black bg-white"
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
                    <div className="flex items-center gap-2 text-black font-montserrat">
                      <CalendarIcon className="w-5 h-5" />
                      <input
                        type="date"
                        value={week.publishDate}
                        onChange={(e) => updateWeek(index, 'publishDate', e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-montserrat text-black bg-white"
                      />
                    </div>
                    <label className="flex items-center gap-2 text-black font-montserrat">
                      <input
                        type="checkbox"
                        checked={week.isPublished}
                        onChange={(e) => updateWeek(index, 'isPublished', e.target.checked)}
                        className="form-checkbox h-4 w-4 text-orange-600 transition duration-150 ease-in-out"
                      />
                      <span>Publicada</span>
                    </label>
                  </div>

                  {/* Nombre del Módulo */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-black mb-2 font-montserrat">
                      Nombre del Módulo (opcional)
                    </label>
                    <input
                      type="text"
                      value={week.moduleName || ''}
                      onChange={(e) => updateWeek(index, 'moduleName', e.target.value)}
                      placeholder={`Módulo ${week.weekNumber}`}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-montserrat text-black bg-white"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Video Content */}
                    <div>
                      <label className="block text-sm font-medium text-black mb-2 font-montserrat">
                        Nombre del Video (opcional)
                      </label>
                      <input
                        type="text"
                        value={week.videoName || ''}
                        onChange={(e) => updateWeek(index, 'videoName', e.target.value)}
                        placeholder="Nombre del video"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-montserrat mb-3 text-black bg-white"
                      />
                      <label className="block text-sm font-medium text-black mb-2 font-montserrat">
                        Descripción del Video (opcional)
                      </label>
                      <textarea
                        value={week.videoDescription || ''}
                        onChange={(e) => updateWeek(index, 'videoDescription', e.target.value)}
                        placeholder="Descripción del video..."
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-montserrat mb-3 text-black bg-white"
                      />
                      <label className="block text-sm font-medium text-black mb-2 font-montserrat">
                        URL del Video *
                      </label>
                      <input
                        type="url"
                        value={week.videoUrl}
                        onChange={(e) => updateWeek(index, 'videoUrl', e.target.value)}
                        placeholder="https://..."
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-montserrat text-black bg-white"
                      />
                    </div>

                    {/* Audio Content */}
                    <div>
                      <label className="block text-sm font-medium text-black mb-2 font-montserrat">
                        Nombre del Audio (opcional)
                      </label>
                      <input
                        type="text"
                      value={week.audioTitle || ''}
                      onChange={(e) => updateWeek(index, 'audioTitle', e.target.value)}
                        placeholder="Nombre del audio"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-montserrat mb-4 text-black bg-white"
                      />
                      <label className="block text-sm font-medium text-black mb-2 font-montserrat">
                        URL del Audio *
                      </label>
                      <input
                        type="url"
                        value={week.audioUrl}
                        onChange={(e) => updateWeek(index, 'audioUrl', e.target.value)}
                        placeholder="https://..."
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-montserrat text-black bg-white"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-black mb-2 font-montserrat">
                      Texto de la Semana *
                    </label>
                    <textarea
                      value={week.text}
                      onChange={(e) => updateWeek(index, 'text', e.target.value)}
                      rows={6}
                      placeholder="Contenido textual de la semana..."
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-montserrat text-black bg-white"
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <Link
                href="/admin/memberships/bitacora/list"
                className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-black hover:bg-gray-50 transition-colors font-montserrat"
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
                    <span>Actualizando...</span>
                  </>
                ) : (
                  <span>Actualizar Bitácora</span>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AdmimDashboardLayout>
  );
}

