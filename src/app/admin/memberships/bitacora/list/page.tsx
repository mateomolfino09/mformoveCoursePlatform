'use client';

import AdmimDashboardLayout from '../../../../../components/AdmimDashboardLayout';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../../../hooks/useAuth';
import Cookies from 'js-cookie';
import Head from 'next/head';
import { ArrowLeftIcon, CalendarIcon, CheckCircleIcon, ClockIcon, ChevronDownIcon, VideoCameraIcon, MusicalNoteIcon, DocumentTextIcon, EyeIcon, XMarkIcon, PencilIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import ReactPlayer from 'react-player';

interface WeeklyContent {
  weekNumber: number;
  videoUrl: string;
  videoId?: string;
  audioUrl: string;
  text: string;
  publishDate: string;
  isPublished: boolean;
}

interface Logbook {
  _id: string;
  month: number;
  year: number;
  title: string;
  description: string;
  weeklyContents: WeeklyContent[];
  createdAt: string;
  updatedAt: string;
}

const BitacoraListPage = () => {
  const router = useRouter();
  const auth = useAuth();
  const [loading, setLoading] = useState(true);
  const [logbooks, setLogbooks] = useState<Logbook[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [expandedLogbookId, setExpandedLogbookId] = useState<string | null>(null);
  const [previewingVideo, setPreviewingVideo] = useState<{ logbookId: string; weekIndex: number; url: string } | null>(null);
  const [previewingAudio, setPreviewingAudio] = useState<{ logbookId: string; weekIndex: number; url: string } | null>(null);

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

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
    
    fetchLogbooks();
  }, [auth.user, router]);

  const fetchLogbooks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/bitacora/list', {
        credentials: 'include',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0',
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener las caminos');
      }

      const data = await response.json();
      if (data.success) {
        setLogbooks(data.logbooks || []);
      } else {
        setError(data.error || 'Error al cargar las caminos');
      }
    } catch (err: any) {
      console.error('Error fetching logbooks:', err);
      setError(err.message || 'Error al cargar las caminos');
    } finally {
      setLoading(false);
    }
  };

  const getPublishedWeeksCount = (weeklyContents: WeeklyContent[]) => {
    return weeklyContents.filter(content => content.isPublished).length;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getNextPublishDate = (weeklyContents: WeeklyContent[]) => {
    const now = new Date();
    const unpublished = weeklyContents
      .filter(content => !content.isPublished)
      .sort((a, b) => new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime());
    
    if (unpublished.length > 0) {
      return formatDate(unpublished[0].publishDate);
    }
    return null;
  };

  if (loading) {
    return (
      <AdmimDashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </AdmimDashboardLayout>
    );
  }

  return (
    <AdmimDashboardLayout>
      <Head>
        <title>Admin - Lista de Caminos</title>
        <meta name='description' content='Lista de Caminos Semanales' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <div 
        className='w-full' 
        style={{ 
          minHeight: 'calc(100vh - 4rem)', 
          overflowY: 'auto',
          overflowX: 'hidden',
          position: 'relative'
        }}
      >
        <div className='max-w-7xl mx-auto p-8 pb-16'>
          <Link
            href="/admin/memberships/bitacora"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-montserrat"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Volver al Dashboard
          </Link>
          
          <div className='mb-12 mt-8'>
            <h1 className='text-4xl md:text-5xl font-bold text-gray-900 font-montserrat mb-4'>
              Lista de Caminos
            </h1>
            <p className='text-gray-600 text-lg font-montserrat'>
              Gestiona y visualiza todas las caminos mensuales creadas
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-montserrat">{error}</p>
            </div>
          )}

          {logbooks.length === 0 && !loading && (
            <div className="bg-white rounded-xl shadow-lg p-12 border border-gray-200 text-center">
              <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2 font-montserrat">
                No hay caminos creadas
              </h3>
              <p className="text-gray-600 mb-6 font-montserrat">
                Comienza creando tu primera camino mensual
              </p>
              <Link
                href="/admin/memberships/bitacora/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#234C8C] to-[#4F7CCF] text-white rounded-lg font-semibold hover:from-[#1A3A6B] hover:to-[#234C8C] transition-all shadow-lg hover:shadow-xl font-montserrat"
              >
                Crear Primera Camino
              </Link>
            </div>
          )}

          {logbooks.length > 0 && (
            <div className='space-y-6'>
            {logbooks.map((logbook, index) => {
              const publishedCount = getPublishedWeeksCount(logbook.weeklyContents);
              const nextPublishDate = getNextPublishDate(logbook.weeklyContents);
              const isExpanded = expandedLogbookId === logbook._id;
              
              return (
                <motion.div
                  key={logbook._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className='group relative bg-white backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl hover:border-[#4F7CCF]/50 transition-all duration-300 overflow-hidden'
                >
                  <div className='absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#234C8C] via-[#4F7CCF] to-[#A6C8F5] opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
                  
                  <div className='p-6'>
                    <div className='flex items-start justify-between mb-4'>
                      <div className='flex-1'>
                        <h3 className='text-xl font-bold text-gray-900 font-montserrat mb-1'>
                          {logbook.title || 'Camino'}
                        </h3>
                        <p className='text-lg text-gray-600 font-montserrat'>
                          {monthNames[logbook.month - 1]} {logbook.year}
                        </p>
                      </div>
                      <div className='flex items-center gap-3'>
                        <div className='px-3 py-1 bg-[#4F7CCF] text-white rounded-lg text-sm font-bold font-montserrat'>
                          {logbook.weeklyContents.length} semanas
                        </div>
                        <Link
                          href={`/admin/memberships/bitacora/edit/${logbook._id}`}
                          className='px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-lg transition-all shadow-md hover:shadow-lg font-montserrat flex items-center gap-2'
                        >
                          <PencilIcon className='w-5 h-5' />
                          Editar
                        </Link>
                        <button
                          onClick={() => setExpandedLogbookId(isExpanded ? null : logbook._id)}
                          className='px-4 py-2 text-sm font-semibold text-[#4F7CCF] hover:bg-[#4F7CCF]/10 rounded-lg transition-colors font-montserrat flex items-center gap-2'
                        >
                          <EyeIcon className='w-5 h-5' />
                          {isExpanded ? 'Ocultar' : 'Ver contenido'}
                          <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {logbook.description && (
                      <p className='text-gray-600 text-sm mb-4 font-montserrat'>
                        {logbook.description}
                      </p>
                    )}

                    <div className='space-y-3 mb-4'>
                      <div className='flex items-center gap-2 text-sm text-gray-600 font-montserrat'>
                        <CheckCircleIcon className='w-5 h-5 text-green-500' />
                        <span>{publishedCount} de {logbook.weeklyContents.length} semanas publicadas</span>
                      </div>

                      {nextPublishDate && (
                        <div className='flex items-center gap-2 text-sm text-gray-600 font-montserrat'>
                          <ClockIcon className='w-5 h-5 text-orange-500' />
                          <span>Próxima publicación: {nextPublishDate}</span>
                        </div>
                      )}

                      <div className='flex items-center gap-2 text-sm text-gray-500 font-montserrat'>
                        <CalendarIcon className='w-4 h-4' />
                        <span>Creada: {formatDate(logbook.createdAt)}</span>
                      </div>
                    </div>

                    <div className='flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200'>
                      {logbook.weeklyContents.map((week, weekIndex) => (
                        <div
                          key={weekIndex}
                          className={`px-2 py-1 rounded text-xs font-semibold font-montserrat ${
                            week.isPublished
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                          title={week.isPublished ? `Publicada el ${formatDate(week.publishDate)}` : `Se publicará el ${formatDate(week.publishDate)}`}
                        >
                          Sem {week.weekNumber}
                        </div>
                      ))}
                    </div>

                    {/* Contenido expandible */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className='overflow-hidden'
                        >
                          <div className='mt-6 pt-6 border-t border-gray-200'>
                            <h4 className='text-lg font-semibold text-gray-900 mb-4 font-montserrat'>
                              Contenido de las Semanas
                            </h4>
                            <div className='space-y-4'>
                              {logbook.weeklyContents.map((week, weekIndex) => (
                                <motion.div
                                  key={weekIndex}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: weekIndex * 0.1 }}
                                  className='bg-gray-50 rounded-lg p-4 border border-gray-200'
                                >
                                  <div className='flex items-center justify-between mb-3'>
                                    <div className='flex items-center gap-3'>
                                      <div className={`px-3 py-1 rounded-lg text-sm font-bold font-montserrat ${
                                        week.isPublished
                                          ? 'bg-green-500 text-white'
                                          : 'bg-gray-300 text-gray-700'
                                      }`}>
                                        Semana {week.weekNumber}
                                      </div>
                                      <div className='flex items-center gap-2 text-sm text-gray-600 font-montserrat'>
                                        <CalendarIcon className='w-4 h-4' />
                                        <span>{formatDate(week.publishDate)}</span>
                                      </div>
                                    </div>
                                    {week.isPublished && (
                                      <span className='px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded font-montserrat'>
                                        Publicada
                                      </span>
                                    )}
                                  </div>

                                  <div className='grid md:grid-cols-2 gap-4'>
                                    <div className='bg-white rounded-lg p-3 border border-gray-200'>
                                      <div className='flex items-center justify-between mb-2'>
                                        <div className='flex items-center gap-2'>
                                          <VideoCameraIcon className='w-5 h-5 text-[#4F7CCF]' />
                                          <span className='text-sm font-semibold text-gray-900 font-montserrat'>Video</span>
                                        </div>
                                        {week.videoUrl && (
                                          <button
                                            onClick={() => {
                                              if (previewingVideo?.logbookId === logbook._id && previewingVideo?.weekIndex === weekIndex) {
                                                setPreviewingVideo(null);
                                              } else {
                                                setPreviewingVideo({ logbookId: logbook._id, weekIndex, url: week.videoUrl });
                                                setPreviewingAudio(null);
                                              }
                                            }}
                                            className='text-xs px-2 py-1 bg-[#4F7CCF] text-white rounded hover:bg-[#234C8C] transition-colors font-montserrat'
                                          >
                                            {previewingVideo?.logbookId === logbook._id && previewingVideo?.weekIndex === weekIndex ? 'Ocultar' : 'Previsualizar'}
                                          </button>
                                        )}
                                      </div>
                                      <a
                                        href={week.videoUrl}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='text-xs text-[#4F7CCF] hover:underline break-all font-montserrat block mb-2'
                                      >
                                        {week.videoUrl || 'No especificado'}
                                      </a>
                                      {week.videoId && (
                                        <span className='text-xs text-gray-500 font-montserrat block mt-1'>
                                          ID: {week.videoId}
                                        </span>
                                      )}
                                      
                                      {previewingVideo?.logbookId === logbook._id && previewingVideo?.weekIndex === weekIndex && week.videoUrl && (
                                        <div className='mt-3 rounded-lg overflow-hidden border border-gray-300'>
                                          <div className='relative aspect-video bg-black'>
                                            <ReactPlayer
                                              url={week.videoUrl}
                                              width="100%"
                                              height="100%"
                                              controls
                                              config={{
                                                file: {
                                                  attributes: {
                                                    crossorigin: 'anonymous',
                                                    playsInline: true
                                                  }
                                                }
                                              }}
                                            />
                                          </div>
                                        </div>
                                      )}
                                    </div>

                                    <div className='bg-white rounded-lg p-3 border border-gray-200'>
                                      <div className='flex items-center justify-between mb-2'>
                                        <div className='flex items-center gap-2'>
                                          <MusicalNoteIcon className='w-5 h-5 text-[#4F7CCF]' />
                                          <span className='text-sm font-semibold text-gray-900 font-montserrat'>Audio</span>
                                        </div>
                                        {week.audioUrl && (
                                          <button
                                            onClick={() => {
                                              if (previewingAudio?.logbookId === logbook._id && previewingAudio?.weekIndex === weekIndex) {
                                                setPreviewingAudio(null);
                                              } else {
                                                setPreviewingAudio({ logbookId: logbook._id, weekIndex, url: week.audioUrl });
                                                setPreviewingVideo(null);
                                              }
                                            }}
                                            className='text-xs px-2 py-1 bg-[#4F7CCF] text-white rounded hover:bg-[#234C8C] transition-colors font-montserrat'
                                          >
                                            {previewingAudio?.logbookId === logbook._id && previewingAudio?.weekIndex === weekIndex ? 'Ocultar' : 'Previsualizar'}
                                          </button>
                                        )}
                                      </div>
                                      <a
                                        href={week.audioUrl}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='text-xs text-[#4F7CCF] hover:underline break-all font-montserrat block mb-2'
                                      >
                                        {week.audioUrl || 'No especificado'}
                                      </a>
                                      
                                      {previewingAudio?.logbookId === logbook._id && previewingAudio?.weekIndex === weekIndex && week.audioUrl && (
                                        <motion.div
                                          initial={{ opacity: 0, height: 0 }}
                                          animate={{ opacity: 1, height: 'auto' }}
                                          exit={{ opacity: 0, height: 0 }}
                                          className='mt-3 rounded-lg border border-gray-300 bg-white p-4'
                                        >
                                          <audio
                                            controls
                                            className='w-full h-12'
                                            style={{ width: '100%', outline: 'none' }}
                                            preload='metadata'
                                            controlsList='nodownload'
                                          >
                                            <source src={week.audioUrl} />
                                            Tu navegador no soporta el elemento de audio.
                                          </audio>
                                        </motion.div>
                                      )}
                                    </div>
                                  </div>

                                  <div className='mt-4 bg-white rounded-lg p-3 border border-gray-200'>
                                    <div className='flex items-center gap-2 mb-2'>
                                      <DocumentTextIcon className='w-5 h-5 text-[#4F7CCF]' />
                                      <span className='text-sm font-semibold text-gray-900 font-montserrat'>Texto</span>
                                    </div>
                                    <div className='text-sm text-gray-700 font-montserrat max-h-32 overflow-y-auto whitespace-pre-wrap'>
                                      {week.text || 'No hay texto especificado'}
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
            </div>
          )}
        </div>
      </div>
    </AdmimDashboardLayout>
  );
};

export default BitacoraListPage;

