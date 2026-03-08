'use client';

import AdmimDashboardLayout from '../../../../../components/AdmimDashboardLayout';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../../../hooks/useAuth';
import Cookies from 'js-cookie';
import Head from 'next/head';
import { ArrowLeftIcon, ArrowPathIcon, ArrowTopRightOnSquareIcon, CalendarIcon, CheckCircleIcon, ClockIcon, ChevronDownIcon, VideoCameraIcon, MusicalNoteIcon, DocumentTextIcon, EyeIcon, XMarkIcon, PencilIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import ReactPlayer from 'react-player';

/** Ítem de contenido dentro de una semana (clase de módulo, clase individual, audio o evento en vivo) */
interface WeekContentItem {
  contentType?: 'moduleClass' | 'individualClass' | 'audio' | 'zoomEvent';
  moduleClassId?: string;
  individualClassId?: string;
  moveCrewEventId?: string;
  videoUrl?: string;
  videoId?: string;
  videoName?: string;
  audioUrl?: string;
  audioTitle?: string;
  audioText?: string;
  submoduleName?: string;
  orden?: number;
}

/** Clase individual devuelta por getClasses (para previsualizar cuando no hay videoUrl en el ítem) */
interface IndividualClassForPreview {
  _id: string;
  name?: string;
  link?: string;
  html?: string;
}

interface WeeklyContent {
  weekNumber: number;
  weekTitle?: string;
  moduleNumber?: number;
  moduleName?: string;
  publishDate: string;
  isPublished: boolean;
  /** Nuevo modelo: varios contenidos por semana */
  contents?: WeekContentItem[];
  /** Legacy: un video/audio/texto por semana */
  videoUrl?: string;
  videoId?: string;
  audioUrl?: string;
  text?: string;
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
  const [previewingVideo, setPreviewingVideo] = useState<{ logbookId: string; weekIndex: number; contentIndex?: number; url: string } | null>(null);
  const [previewingAudio, setPreviewingAudio] = useState<{ logbookId: string; weekIndex: number; contentIndex?: number; url: string } | null>(null);
  const [loadingIndividualPreview, setLoadingIndividualPreview] = useState<string | null>(null); // 'logbookId-weekIndex-contentIndex'
  const [replaceEventModal, setReplaceEventModal] = useState<{ logbookId: string; weekIndex: number; contentIndex: number; eventName?: string } | null>(null);
  const [replaceModalClasses, setReplaceModalClasses] = useState<{ _id: string; name?: string }[]>([]);
  const [replaceModalSelectedId, setReplaceModalSelectedId] = useState<string>('');
  const [replaceModalMode, setReplaceModalMode] = useState<'select' | 'create'>('select');
  const [replaceModalCreateForm, setReplaceModalCreateForm] = useState({ name: '', description: '', videoUrl: '', type: '' });
  const [replaceModalClassTypes, setReplaceModalClassTypes] = useState<{ value: string; label: string }[]>([]);
  const [replaceModalLoading, setReplaceModalLoading] = useState(false);
  const [replaceModalError, setReplaceModalError] = useState<string | null>(null);

  const fetchIndividualClassVideoUrl = async (individualClassId: string): Promise<string | null> => {
    try {
      const res = await fetch('/api/individualClass/getClasses?includeUnpublished=1', { credentials: 'include', cache: 'no-store' });
      if (!res.ok) return null;
      const classes: IndividualClassForPreview[] = await res.json();
      const cls = Array.isArray(classes) ? classes.find((c) => c._id === individualClassId) : null;
      if (!cls?.link) return null;
      const link = String(cls.link).trim();
      return /^\d+$/.test(link) ? `https://vimeo.com/${link}` : link.includes('vimeo.com') ? link : `https://vimeo.com/${link}`;
    } catch {
      return null;
    }
  };

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
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
                          href={`/weekly-path?id=${logbook._id}`}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='px-4 py-2 text-sm font-semibold text-[#4F7CCF] bg-[#4F7CCF]/10 hover:bg-[#4F7CCF]/20 rounded-lg transition-all font-montserrat flex items-center gap-2'
                        >
                          <ArrowTopRightOnSquareIcon className='w-5 h-5' />
                          Previsualizar
                        </Link>
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
                              Contenido por módulo
                            </h4>
                            <div className='space-y-4'>
                              {logbook.weeklyContents.map((week, weekIndex) => {
                                const contents = Array.isArray(week.contents) ? week.contents : [];
                                const hasContents = contents.length > 0;
                                return (
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
                                          week.isPublished ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'
                                        }`}>
                                          {week.moduleName?.trim() || (week.moduleNumber != null ? `Módulo ${week.moduleNumber}` : `Semana ${week.weekNumber}`)}
                                        </div>
                                        <div className='flex items-center gap-2 text-sm text-gray-600 font-montserrat'>
                                          <CalendarIcon className='w-4 h-4' />
                                          <span>{formatDate(week.publishDate)}</span>
                                        </div>
                                        {hasContents && (
                                          <span className='text-xs text-gray-500 font-montserrat'>
                                            {contents.length} contenido{contents.length !== 1 ? 's' : ''}
                                          </span>
                                        )}
                                      </div>
                                      {week.isPublished && (
                                        <span className='px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded font-montserrat'>
                                          Publicada
                                        </span>
                                      )}
                                    </div>

                                    {hasContents ? (
                                      <ul className='space-y-2'>
                                        {contents.map((c, contentIndex) => {
                                          const tipo = (c.contentType || 'moduleClass') as 'moduleClass' | 'individualClass' | 'audio' | 'zoomEvent';
                                          const label =
                                            tipo === 'moduleClass'
                                              ? 'Clase de módulo'
                                              : tipo === 'individualClass'
                                                ? 'Clase individual'
                                                : tipo === 'zoomEvent'
                                                  ? 'Clase en vivo'
                                                  : 'Audio';
                                          const name = c.videoName || c.audioTitle || (tipo === 'audio' ? 'Audio' : 'Clase');
                                          const hasVideo = !!(c.videoUrl && c.videoUrl.trim());
                                          const hasAudio = !!(c.audioUrl && c.audioUrl.trim());
                                          const isIndividualWithoutVideo = tipo === 'individualClass' && !hasVideo && !!(c as WeekContentItem).individualClassId;
                                          const previewKey = `${logbook._id}-${weekIndex}-${contentIndex}`;
                                          const isLoadingPreview = loadingIndividualPreview === previewKey;
                                          const isPreviewingVideo =
                                            previewingVideo?.logbookId === logbook._id &&
                                            previewingVideo?.weekIndex === weekIndex &&
                                            previewingVideo?.contentIndex === contentIndex;
                                          const isPreviewingAudio =
                                            previewingAudio?.logbookId === logbook._id &&
                                            previewingAudio?.weekIndex === weekIndex &&
                                            previewingAudio?.contentIndex === contentIndex;
                                          const videoUrlToPreview = isPreviewingVideo && previewingVideo?.url ? previewingVideo.url : (hasVideo ? c.videoUrl : undefined);
                                          return (
                                            <li key={contentIndex} className='bg-white rounded-lg p-3 border border-gray-200 flex flex-wrap items-center justify-between gap-2'>
                                              <div className='flex items-center gap-2 min-w-0'>
                                                {tipo === 'audio' ? (
                                                  <MusicalNoteIcon className='w-5 h-5 text-[#4F7CCF] shrink-0' />
                                                ) : (
                                                  <VideoCameraIcon className='w-5 h-5 text-[#4F7CCF] shrink-0' />
                                                )}
                                                <span className='text-xs font-semibold text-gray-500 font-montserrat uppercase'>{label}</span>
                                                <span className='text-sm text-gray-900 font-montserrat truncate' title={name}>{name}</span>
                                                {c.submoduleName && (
                                                  <span className='text-xs text-gray-400 font-montserrat'>· {c.submoduleName}</span>
                                                )}
                                              </div>
                                              <div className='flex items-center gap-2'>
                                                {(hasVideo || isIndividualWithoutVideo) && (
                                                  <>
                                                    {hasVideo && (
                                                      <a href={c.videoUrl} target='_blank' rel='noopener noreferrer' className='text-xs text-[#4F7CCF] hover:underline font-montserrat'>
                                                        Ver video
                                                      </a>
                                                    )}
                                                    <button
                                                      type='button'
                                                      disabled={isLoadingPreview}
                                                      onClick={async () => {
                                                        if (isPreviewingVideo) {
                                                          setPreviewingVideo(null);
                                                          return;
                                                        }
                                                        if (isIndividualWithoutVideo && (c as WeekContentItem).individualClassId) {
                                                          setLoadingIndividualPreview(previewKey);
                                                          setPreviewingAudio(null);
                                                          const url = await fetchIndividualClassVideoUrl((c as WeekContentItem).individualClassId!);
                                                          setLoadingIndividualPreview(null);
                                                          if (url) setPreviewingVideo({ logbookId: logbook._id, weekIndex, contentIndex, url });
                                                          return;
                                                        }
                                                        if (hasVideo) {
                                                          setPreviewingVideo({ logbookId: logbook._id, weekIndex, contentIndex, url: c.videoUrl! });
                                                          setPreviewingAudio(null);
                                                        }
                                                      }}
                                                      className='text-xs px-2 py-1 bg-[#4F7CCF] text-white rounded hover:bg-[#234C8C] disabled:opacity-50 font-montserrat'
                                                    >
                                                      {isLoadingPreview ? '...' : isPreviewingVideo ? 'Ocultar' : 'Previsualizar'}
                                                    </button>
                                                  </>
                                                )}
                                                {hasAudio && tipo === 'audio' && (
                                                  <>
                                                    <a href={c.audioUrl} target='_blank' rel='noopener noreferrer' className='text-xs text-[#4F7CCF] hover:underline font-montserrat'>
                                                      Ver audio
                                                    </a>
                                                    <button
                                                      type='button'
                                                      onClick={() => {
                                                        if (isPreviewingAudio) setPreviewingAudio(null);
                                                        else {
                                                          setPreviewingAudio({ logbookId: logbook._id, weekIndex, contentIndex, url: c.audioUrl! });
                                                          setPreviewingVideo(null);
                                                        }
                                                      }}
                                                      className='text-xs px-2 py-1 bg-[#4F7CCF] text-white rounded hover:bg-[#234C8C] font-montserrat'
                                                    >
                                                      {isPreviewingAudio ? 'Ocultar' : 'Previsualizar'}
                                                    </button>
                                                  </>
                                                )}
                                                {!hasVideo && !hasAudio && !isIndividualWithoutVideo && (
                                                  <span className='text-xs text-gray-400 font-montserrat'>—</span>
                                                )}
                                                {tipo === 'zoomEvent' && (
                                                  <button
                                                    type='button'
                                                    onClick={() => {
                                                      setReplaceEventModal({
                                                        logbookId: logbook._id,
                                                        weekIndex,
                                                        contentIndex,
                                                        eventName: c.videoName || 'Clase en vivo',
                                                      });
                                                      setReplaceModalSelectedId('');
                                                      setReplaceModalMode('select');
                                                      setReplaceModalCreateForm({ name: '', description: '', videoUrl: '', type: '' });
                                                      setReplaceModalError(null);
                                                      fetch('/api/individualClass/getClasses?includeUnpublished=1', { credentials: 'include', cache: 'no-store' })
                                                        .then((r) => r.json())
                                                        .then((list) => {
                                                          const arr = Array.isArray(list) ? list : [];
                                                          setReplaceModalClasses(arr.map((x: any) => ({ _id: x._id, name: x.name || x.title || '' })));
                                                        })
                                                        .catch(() => setReplaceModalClasses([]));
                                                      fetch('/api/individualClass/getClassTypes', { credentials: 'include', cache: 'no-store' })
                                                        .then((r) => r.ok ? r.json() : [])
                                                        .then((data) => {
                                                          const first = Array.isArray(data) ? data[0] : null;
                                                          const values = first?.values ?? [];
                                                          setReplaceModalClassTypes(values.map((v: any) => ({ value: v.value || '', label: v.label || v.value || '' })));
                                                        })
                                                        .catch(() => setReplaceModalClassTypes([]));
                                                    }}
                                                    className='text-xs px-2 py-1 bg-amber-500 text-white rounded hover:bg-amber-600 font-montserrat flex items-center gap-1'
                                                    title='Reemplazar este evento por la clase individual (grabación). Se mantiene la publicación en el camino.'
                                                  >
                                                    <ArrowPathIcon className='w-3.5 h-3.5' />
                                                    Cambiar por grabación
                                                  </button>
                                                )}
                                              </div>
                                              {isPreviewingVideo && videoUrlToPreview && (
                                                <div className='w-full mt-2 rounded-lg overflow-hidden border border-gray-300'>
                                                  <div className='relative aspect-video bg-black'>
                                                    <ReactPlayer url={videoUrlToPreview} width="100%" height="100%" controls />
                                                  </div>
                                                </div>
                                              )}
                                              {isPreviewingAudio && c.audioUrl && (
                                                <div className='w-full mt-2 rounded-lg border border-gray-300 bg-white p-3'>
                                                  <audio controls className='w-full h-10' preload='metadata' src={c.audioUrl}>
                                                    Tu navegador no soporta audio.
                                                  </audio>
                                                </div>
                                              )}
                                            </li>
                                          );
                                        })}
                                      </ul>
                                    ) : (
                                      /* Legacy: un video, un audio y texto por semana */
                                      <div className='grid md:grid-cols-2 gap-4'>
                                        <div className='bg-white rounded-lg p-3 border border-gray-200'>
                                          <div className='flex items-center justify-between mb-2'>
                                            <div className='flex items-center gap-2'>
                                              <VideoCameraIcon className='w-5 h-5 text-[#4F7CCF]' />
                                              <span className='text-sm font-semibold text-gray-900 font-montserrat'>Video</span>
                                            </div>
                                            {week.videoUrl && (
                                              <button
                                                type='button'
                                                onClick={() => {
                                                  if (previewingVideo?.logbookId === logbook._id && previewingVideo?.weekIndex === weekIndex) setPreviewingVideo(null);
                                                  else {
                                                    setPreviewingVideo({ logbookId: logbook._id, weekIndex, url: week.videoUrl! });
                                                    setPreviewingAudio(null);
                                                  }
                                                }}
                                                className='text-xs px-2 py-1 bg-[#4F7CCF] text-white rounded hover:bg-[#234C8C] font-montserrat'
                                              >
                                                {previewingVideo?.logbookId === logbook._id && previewingVideo?.weekIndex === weekIndex ? 'Ocultar' : 'Previsualizar'}
                                              </button>
                                            )}
                                          </div>
                                          <a href={week.videoUrl} target='_blank' rel='noopener noreferrer' className='text-xs text-[#4F7CCF] hover:underline break-all font-montserrat block'>
                                            {week.videoUrl || 'No especificado'}
                                          </a>
                                          {previewingVideo?.logbookId === logbook._id && previewingVideo?.weekIndex === weekIndex && week.videoUrl && (
                                            <div className='mt-3 rounded-lg overflow-hidden border border-gray-300'>
                                              <div className='relative aspect-video bg-black'>
                                                <ReactPlayer url={week.videoUrl} width="100%" height="100%" controls />
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
                                                type='button'
                                                onClick={() => {
                                                  if (previewingAudio?.logbookId === logbook._id && previewingAudio?.weekIndex === weekIndex) setPreviewingAudio(null);
                                                  else {
                                                    setPreviewingAudio({ logbookId: logbook._id, weekIndex, url: week.audioUrl! });
                                                    setPreviewingVideo(null);
                                                  }
                                                }}
                                                className='text-xs px-2 py-1 bg-[#4F7CCF] text-white rounded hover:bg-[#234C8C] font-montserrat'
                                              >
                                                {previewingAudio?.logbookId === logbook._id && previewingAudio?.weekIndex === weekIndex ? 'Ocultar' : 'Previsualizar'}
                                              </button>
                                            )}
                                          </div>
                                          <a href={week.audioUrl} target='_blank' rel='noopener noreferrer' className='text-xs text-[#4F7CCF] hover:underline break-all font-montserrat block'>
                                            {week.audioUrl || 'No especificado'}
                                          </a>
                                          {previewingAudio?.logbookId === logbook._id && previewingAudio?.weekIndex === weekIndex && week.audioUrl && (
                                            <div className='mt-3 rounded-lg border border-gray-300 bg-white p-3'>
                                              <audio controls className='w-full h-12' preload='metadata' src={week.audioUrl}>Tu navegador no soporta audio.</audio>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}

                                    {!hasContents && week.text && (
                                      <div className='mt-4 bg-white rounded-lg p-3 border border-gray-200'>
                                        <div className='flex items-center gap-2 mb-2'>
                                          <DocumentTextIcon className='w-5 h-5 text-[#4F7CCF]' />
                                          <span className='text-sm font-semibold text-gray-900 font-montserrat'>Texto</span>
                                        </div>
                                        <div className='text-sm text-gray-700 font-montserrat max-h-32 overflow-y-auto whitespace-pre-wrap'>
                                          {week.text}
                                        </div>
                                      </div>
                                    )}
                                  </motion.div>
                                );
                              })}
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

          {/* Modal: Cambiar evento por clase individual (grabación) */}
          {replaceEventModal && (
            <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50'>
              <div className='bg-white rounded-2xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto'>
                <h3 className='text-lg font-semibold text-gray-900 font-montserrat mb-2'>
                  Cambiar evento por grabación
                </h3>
                <p className='text-sm text-gray-600 font-montserrat mb-4'>
                  Reemplazá el evento &quot;{replaceEventModal.eventName || 'Clase en vivo'}&quot; por la clase individual (grabación). La posición y la publicación en el camino se mantienen.
                </p>
                <div className='flex gap-2 mb-4 border-b border-gray-200'>
                  <button
                    type='button'
                    onClick={() => { setReplaceModalMode('select'); setReplaceModalError(null); }}
                    className={`px-3 py-2 text-sm font-medium font-montserrat rounded-t-lg ${replaceModalMode === 'select' ? 'bg-amber-100 text-amber-800 border-b-2 border-amber-500 -mb-px' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    Seleccionar existente
                  </button>
                  <button
                    type='button'
                    onClick={() => { setReplaceModalMode('create'); setReplaceModalError(null); }}
                    className={`px-3 py-2 text-sm font-medium font-montserrat rounded-t-lg ${replaceModalMode === 'create' ? 'bg-amber-100 text-amber-800 border-b-2 border-amber-500 -mb-px' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    Crear clase nueva
                  </button>
                </div>

                {replaceModalMode === 'select' ? (
                  <>
                    <label className='block text-xs font-medium text-gray-700 font-montserrat mb-2'>Clase individual (grabación) *</label>
                    <select
                      value={replaceModalSelectedId}
                      onChange={(e) => setReplaceModalSelectedId(e.target.value)}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm font-montserrat mb-4'
                    >
                      <option value=''>Seleccionar clase...</option>
                      {replaceModalClasses.map((cls) => (
                        <option key={cls._id} value={cls._id}>{cls.name || cls._id}</option>
                      ))}
                    </select>
                  </>
                ) : (
                  <div className='space-y-3 mb-4'>
                    <div>
                      <label className='block text-xs font-medium text-gray-700 font-montserrat mb-1'>Nombre de la clase *</label>
                      <input
                        type='text'
                        value={replaceModalCreateForm.name}
                        onChange={(e) => setReplaceModalCreateForm((f) => ({ ...f, name: e.target.value }))}
                        placeholder='Ej: Clase en vivo - Grabación'
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm font-montserrat'
                      />
                    </div>
                    <div>
                      <label className='block text-xs font-medium text-gray-700 font-montserrat mb-1'>Descripción *</label>
                      <textarea
                        value={replaceModalCreateForm.description}
                        onChange={(e) => setReplaceModalCreateForm((f) => ({ ...f, description: e.target.value }))}
                        placeholder='Breve descripción de la clase'
                        rows={2}
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm font-montserrat'
                      />
                    </div>
                    <div>
                      <label className='block text-xs font-medium text-gray-700 font-montserrat mb-1'>URL o ID de Vimeo *</label>
                      <input
                        type='text'
                        value={replaceModalCreateForm.videoUrl}
                        onChange={(e) => setReplaceModalCreateForm((f) => ({ ...f, videoUrl: e.target.value }))}
                        placeholder='https://vimeo.com/123456789 o 123456789'
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm font-montserrat'
                      />
                    </div>
                    <div>
                      <label className='block text-xs font-medium text-gray-700 font-montserrat mb-1'>Tipo (filtro)</label>
                      <select
                        value={replaceModalCreateForm.type}
                        onChange={(e) => setReplaceModalCreateForm((f) => ({ ...f, type: e.target.value }))}
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm font-montserrat'
                      >
                        <option value=''>Seleccionar tipo</option>
                        {replaceModalClassTypes.map((v) => (
                          <option key={v.value} value={v.value}>{v.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {replaceModalError && (
                  <p className='text-sm text-red-600 font-montserrat mb-4'>{replaceModalError}</p>
                )}
                <div className='flex justify-end gap-3'>
                  <button
                    type='button'
                    onClick={() => { setReplaceEventModal(null); setReplaceModalError(null); }}
                    className='px-4 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm font-montserrat hover:bg-gray-50'
                  >
                    Cancelar
                  </button>
                  {replaceModalMode === 'select' ? (
                    <button
                      type='button'
                      disabled={replaceModalLoading || !replaceModalSelectedId}
                      onClick={async () => {
                        if (!replaceModalSelectedId || !replaceEventModal) return;
                        setReplaceModalLoading(true);
                        setReplaceModalError(null);
                        try {
                          const res = await fetch('/api/bitacora/replace-event-with-recording', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify({
                              logbookId: replaceEventModal.logbookId,
                              weekIndex: replaceEventModal.weekIndex,
                              contentIndex: replaceEventModal.contentIndex,
                              individualClassId: replaceModalSelectedId,
                            }),
                          });
                          const data = await res.json();
                          if (!res.ok) {
                            setReplaceModalError(data.error || 'Error al reemplazar');
                            return;
                          }
                          setReplaceEventModal(null);
                          fetchLogbooks();
                        } catch (e: any) {
                          setReplaceModalError(e.message || 'Error de conexión');
                        } finally {
                          setReplaceModalLoading(false);
                        }
                      }}
                      className='px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-montserrat hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      {replaceModalLoading ? 'Guardando...' : 'Cambiar por grabación'}
                    </button>
                  ) : (
                    <button
                      type='button'
                      disabled={replaceModalLoading || !replaceModalCreateForm.name.trim() || !replaceModalCreateForm.description.trim() || !replaceModalCreateForm.videoUrl.trim()}
                      onClick={async () => {
                        if (!replaceEventModal) return;
                        const { name, description, videoUrl, type } = replaceModalCreateForm;
                        if (!name.trim() || !description.trim() || !videoUrl.trim()) return;
                        setReplaceModalLoading(true);
                        setReplaceModalError(null);
                        try {
                          const createRes = await fetch('/api/individualClass/createFromWeeklyPath', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify({
                              name: name.trim(),
                              description: description.trim(),
                              videoUrl: videoUrl.trim(),
                              type: type.trim() || undefined,
                              tags: [],
                            }),
                          });
                          if (!createRes.ok) {
                            const d = await createRes.json().catch(() => ({}));
                            throw new Error(d.error || 'Error al crear la clase');
                          }
                          const created = await createRes.json();
                          const newId = created._id;
                          const res = await fetch('/api/bitacora/replace-event-with-recording', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify({
                              logbookId: replaceEventModal.logbookId,
                              weekIndex: replaceEventModal.weekIndex,
                              contentIndex: replaceEventModal.contentIndex,
                              individualClassId: newId,
                            }),
                          });
                          const data = await res.json();
                          if (!res.ok) {
                            setReplaceModalError(data.error || 'Error al reemplazar en el camino');
                            return;
                          }
                          setReplaceEventModal(null);
                          fetchLogbooks();
                        } catch (e: any) {
                          setReplaceModalError(e.message || 'Error');
                        } finally {
                          setReplaceModalLoading(false);
                        }
                      }}
                      className='px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-montserrat hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      {replaceModalLoading ? 'Creando...' : 'Crear clase y usar'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdmimDashboardLayout>
  );
};

export default BitacoraListPage;

