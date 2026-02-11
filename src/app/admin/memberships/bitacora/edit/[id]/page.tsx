'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../../../hooks/useAuth';
import Cookies from 'js-cookie';
import AdmimDashboardLayout from '../../../../../../components/AdmimDashboardLayout';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { ArrowLeftIcon, CalendarIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { ClassModule } from '../../../../../../../typings';

export interface WeekContentItem {
  videoUrl: string;
  videoId?: string;
  videoName?: string;
  videoThumbnail?: string;
  videoDuration?: number;
  audioUrl?: string;
  audioTitle?: string;
  audioDuration?: number;
  audioText?: string;
  level: number;
  moduleId: string;
  submoduleSlug: string;
  submoduleName: string;
  orden: number;
}

interface WeekContent {
  weekNumber: number;
  moduleName?: string;
  weekTitle: string;
  publishDate: string;
  isPublished: boolean;
  contents: WeekContentItem[];
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

  const [classModules, setClassModules] = useState<ClassModule[]>([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [title, setTitle] = useState('Camino');
  const [description, setDescription] = useState('');
  const [isBaseBitacora, setIsBaseBitacora] = useState(false);
  const [weeks, setWeeks] = useState<WeekContent[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const prevMonthRef = useRef<number>(month);
  const prevYearRef = useRef<number>(year);

  const emptyContentItem = (orden: number): WeekContentItem => ({
    videoUrl: '',
    videoName: '',
    videoThumbnail: '',
    level: 1,
    moduleId: '',
    submoduleSlug: '',
    submoduleName: '',
    orden
  });

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
          throw new Error('Camino no encontrada');
        }

        const data = await response.json();
        const loadedLogbook = data.logbook;

        setMonth(loadedLogbook.month);
        setYear(loadedLogbook.year);
        setTitle(loadedLogbook.title || 'Camino');
        setDescription(loadedLogbook.description || '');
        setIsBaseBitacora(loadedLogbook.isBaseBitacora || false);

        // Convertir a estructura con contents[] (nuevo formato o legacy)
        const formattedWeeks: WeekContent[] = (loadedLogbook.weeklyContents || []).map((week: any) => {
          let publishDate = '';
          if (week.publishDate) {
            publishDate = typeof week.publishDate === 'string' ? week.publishDate.split('T')[0] : new Date(week.publishDate).toISOString().split('T')[0];
          }
          let contents: WeekContentItem[] = [];
          if (week.contents && Array.isArray(week.contents) && week.contents.length > 0) {
            contents = week.contents.map((c: any, idx: number) => ({
              videoUrl: c.videoUrl || '',
              videoId: c.videoId,
              videoName: c.videoName || '',
              videoThumbnail: c.videoThumbnail || '',
              videoDuration: c.videoDuration,
              audioUrl: c.audioUrl || '',
              audioTitle: c.audioTitle || '',
              audioDuration: c.audioDuration,
              audioText: c.audioText || '',
              level: Math.min(10, Math.max(1, Number(c.level) || 1)),
              moduleId: c.moduleId ? String(c.moduleId) : '',
              submoduleSlug: c.submoduleSlug || '',
              submoduleName: c.submoduleName || '',
              orden: idx
            }));
          } else {
            contents = [{
              videoUrl: week.videoUrl || '',
              videoId: week.videoId,
              videoName: week.videoName || '',
              videoThumbnail: week.videoThumbnail || '',
              videoDuration: week.videoDuration,
              audioUrl: week.audioUrl || '',
              audioTitle: week.audioTitle || '',
              audioText: week.text || '',
              level: 1,
              moduleId: '',
              submoduleSlug: '',
              submoduleName: '',
              orden: 0
            }];
          }
          return {
            weekNumber: week.weekNumber,
            moduleName: week.moduleName || '',
            weekTitle: week.weekTitle || `Semana ${week.weekNumber}`,
            publishDate,
            isPublished: week.isPublished || false,
            contents
          };
        });
        setWeeks(formattedWeeks);
        setIsInitialLoad(true); // Marcar como carga inicial para evitar recalcular fechas
        prevMonthRef.current = month;
        prevYearRef.current = year;
      } catch (err: any) {
        console.error('Error fetching logbook for edit:', err);
        toast.error(err.message || 'Error al cargar la camino para edición');
        router.push('/admin/memberships/bitacora/list');
      } finally {
        setLoading(false);
      }
    };

    fetchLogbookData();
  }, [auth.user, router, logbookId]);

  useEffect(() => {
    fetch('/api/class-modules?all=1', { credentials: 'include', cache: 'no-store' })
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setClassModules(Array.isArray(data) ? data : []))
      .catch(() => setClassModules([]));
  }, []);

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

  const updateContent = (weekIndex: number, contentIndex: number, field: keyof WeekContentItem, value: any) => {
    const newWeeks = [...weeks];
    const contents = [...(newWeeks[weekIndex].contents || [])];
    contents[contentIndex] = { ...contents[contentIndex], [field]: value };
    if (field === 'submoduleName' && typeof value === 'string') {
      contents[contentIndex].submoduleSlug = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }
    if (field === 'moduleId') {
      contents[contentIndex].submoduleSlug = '';
      contents[contentIndex].submoduleName = '';
    }
    newWeeks[weekIndex].contents = contents;
    setWeeks(newWeeks);
  };

  const addContent = (weekIndex: number) => {
    const newWeeks = [...weeks];
    const contents = [...(newWeeks[weekIndex].contents || [])];
    contents.push(emptyContentItem(contents.length));
    newWeeks[weekIndex].contents = contents;
    setWeeks(newWeeks);
  };

  const removeContent = (weekIndex: number, contentIndex: number) => {
    const newWeeks = [...weeks];
    let contents = newWeeks[weekIndex].contents.filter((_, i) => i !== contentIndex);
    if (contents.length === 0) contents = [emptyContentItem(0)];
    newWeeks[weekIndex].contents = contents.map((c, i) => ({ ...c, orden: i }));
    setWeeks(newWeeks);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      for (let i = 0; i < weeks.length; i++) {
        const week = weeks[i];
        if (!week.publishDate) {
          toast.error(`Semana ${i + 1}: falta fecha de publicación`);
          setSubmitting(false);
          return;
        }
        const contents = week.contents || [];
        if (contents.length === 0) {
          toast.error(`Semana ${i + 1}: agrega al menos un contenido (video)`);
          setSubmitting(false);
          return;
        }
        for (let j = 0; j < contents.length; j++) {
          const c = contents[j];
          if (!c.videoUrl?.trim()) {
            toast.error(`Semana ${i + 1}, contenido ${j + 1}: URL del video es requerida`);
            setSubmitting(false);
            return;
          }
          if (!c.moduleId) {
            toast.error(`Semana ${i + 1}, contenido ${j + 1}: selecciona un módulo`);
            setSubmitting(false);
            return;
          }
          if (!c.submoduleSlug?.trim() && !c.submoduleName?.trim()) {
            toast.error(`Semana ${i + 1}, contenido ${j + 1}: indica submódulo o crea uno nuevo`);
            setSubmitting(false);
            return;
          }
        }
      }

      const payload = {
        month,
        year,
        title,
        description,
        userEmail: auth.user?.email,
        isBaseBitacora,
        weeklyContents: weeks.map((week) => ({
          weekNumber: week.weekNumber,
          moduleName: week.moduleName?.trim() || '',
          weekTitle: week.weekTitle || `Semana ${week.weekNumber}`,
          publishDate: new Date(week.publishDate).toISOString(),
          isPublished: week.isPublished,
          isUnlocked: false,
          contents: (week.contents || []).map((c, idx) => ({
            videoUrl: c.videoUrl,
            videoId: c.videoId || undefined,
            videoName: c.videoName || undefined,
            videoThumbnail: c.videoThumbnail || undefined,
            videoDuration: c.videoDuration || undefined,
            audioUrl: c.audioUrl || undefined,
            audioTitle: c.audioTitle || undefined,
            audioDuration: c.audioDuration || undefined,
            audioText: c.audioText || undefined,
            level: Math.min(10, Math.max(1, c.level)),
            moduleId: c.moduleId || undefined,
            submoduleSlug: c.submoduleSlug || (c.submoduleName || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
            submoduleName: c.submoduleName || undefined,
            orden: idx
          }))
        }))
      };

      const response = await fetch(`/api/bitacora/update/${logbookId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error al actualizar la camino');
      toast.success('Camino actualizada exitosamente');
      router.push('/admin/memberships/bitacora/list');
    } catch (error: any) {
      console.error('Error actualizando camino:', error);
      toast.error(error.message || 'Error al actualizar la camino');
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
          Volver a la Lista de Caminos
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 md:p-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 font-montserrat">
            Editar Camino Mensual
          </h1>
          <p className="text-black mb-8 font-montserrat">
            Modifica el contenido de las 4 semanas del Camino
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
                  placeholder="Camino"
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

            {/* Semanas con contenidos */}
            <div className="space-y-8">
              {weeks.map((week, weekIndex) => (
                <motion.div
                  key={week.weekNumber}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: weekIndex * 0.05 }}
                  className="border-2 border-gray-200 rounded-xl p-6 bg-gradient-to-br from-orange-50 to-amber-50"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="px-4 py-2 bg-orange-500 text-white rounded-lg font-bold text-lg font-montserrat">
                      Semana {week.weekNumber}
                    </div>
                    <div className="flex items-center gap-2 text-black font-montserrat">
                      <CalendarIcon className="w-5 h-5" />
                      <input
                        type="date"
                        value={week.publishDate}
                        onChange={(e) => updateWeek(weekIndex, 'publishDate', e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-montserrat text-black bg-white"
                      />
                    </div>
                    <label className="flex items-center gap-2 text-black font-montserrat">
                      <input
                        type="checkbox"
                        checked={week.isPublished}
                        onChange={(e) => updateWeek(weekIndex, 'isPublished', e.target.checked)}
                        className="form-checkbox h-4 w-4 text-orange-600"
                      />
                      <span>Publicada</span>
                    </label>
                  </div>

                  {(week.contents || []).map((content, contentIndex) => (
                    <div key={contentIndex} className="mb-6 p-4 bg-white rounded-lg border border-gray-200">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-medium text-gray-700">Contenido {contentIndex + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeContent(weekIndex, contentIndex)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Quitar contenido"
                        >
                          <XMarkIcon className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Video URL *</label>
                          <input
                            type="url"
                            value={content.videoUrl}
                            onChange={(e) => updateContent(weekIndex, contentIndex, 'videoUrl', e.target.value)}
                            placeholder="https://..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm"
                          />
                          <label className="block text-xs font-medium text-gray-600 mb-1 mt-2">Nombre video</label>
                          <input
                            type="text"
                            value={content.videoName || ''}
                            onChange={(e) => updateContent(weekIndex, contentIndex, 'videoName', e.target.value)}
                            placeholder="Opcional"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Nivel (1-10) *</label>
                          <select
                            value={content.level}
                            onChange={(e) => updateContent(weekIndex, contentIndex, 'level', Number(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm"
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                              <option key={n} value={n}>{n}</option>
                            ))}
                          </select>
                          <label className="block text-xs font-medium text-gray-600 mb-1 mt-2">Módulo *</label>
                          <select
                            value={content.moduleId}
                            onChange={(e) => updateContent(weekIndex, contentIndex, 'moduleId', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm"
                          >
                            <option value="">Seleccionar módulo</option>
                            {classModules.map((m) => (
                              <option key={m._id} value={m._id}>{m.name}</option>
                            ))}
                          </select>
                          <label className="block text-xs font-medium text-gray-600 mb-1 mt-2">Submódulo (existente o crear) *</label>
                          <input
                            type="text"
                            value={content.submoduleName || content.submoduleSlug || ''}
                            onChange={(e) => updateContent(weekIndex, contentIndex, 'submoduleName', e.target.value)}
                            placeholder="Ej: Locomotions o nombre nuevo"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm"
                          />
                        </div>
                      </div>
                      <div className="mt-3 grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Audio URL (opcional)</label>
                          <input
                            type="url"
                            value={content.audioUrl || ''}
                            onChange={(e) => updateContent(weekIndex, contentIndex, 'audioUrl', e.target.value)}
                            placeholder="https://..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm"
                          />
                          <label className="block text-xs font-medium text-gray-600 mb-1 mt-1">Título audio</label>
                          <input
                            type="text"
                            value={content.audioTitle || ''}
                            onChange={(e) => updateContent(weekIndex, contentIndex, 'audioTitle', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Texto / reflexión (opcional)</label>
                          <textarea
                            value={content.audioText || ''}
                            onChange={(e) => updateContent(weekIndex, contentIndex, 'audioText', e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => addContent(weekIndex)}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm font-montserrat"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Agregar otro contenido a esta semana
                  </button>
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
                  <span>Actualizar Camino</span>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AdmimDashboardLayout>
  );
}

