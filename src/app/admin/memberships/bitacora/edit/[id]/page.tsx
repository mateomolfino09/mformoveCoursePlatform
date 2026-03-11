'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../../../hooks/useAuth';
import Cookies from 'js-cookie';
import AdmimDashboardLayout from '../../../../../../components/AdmimDashboardLayout';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { ArrowLeftIcon, ArrowPathIcon, Bars3Icon, CalendarIcon, DocumentDuplicateIcon, PencilSquareIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { ClassModule } from '../../../../../../../typings';
import { NO_SUBMODULE_SLUG } from '../../../../../../constants/moduleClassConstants';

export type ContentType = 'moduleClass' | 'individualClass' | 'audio' | 'zoomEvent';

export interface WeekContentItem {
  contentType?: ContentType;
  individualClassId?: string;
  moduleClassId?: string;
  moveCrewEventId?: string;
  /** True si el evento se creó desde este formulario (solo eliminable del camino) */
  moveCrewEventCreatedInPath?: boolean;
  moduleClassSource?: 'existing' | 'new';
  individualClassSource?: 'existing' | 'new';
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
  newModuleClassName?: string;
  newModuleClassMaterials?: string[];
  submoduleMode?: 'existing' | 'new';
  createdInWeeklyPathForm?: boolean;
  createdClassDescription?: string;
  individualClassType?: string;
  individualClassTags?: string;
}

interface WeekContent {
  weekNumber: number;
  moduleName?: string;
  moduleNumber?: number;
  weekTitle: string;
  publishDate: string;
  isPublished: boolean;
   /** Marca si esta semana muestra el Warm Up del camino mensual. */
  hasWarmUp?: boolean;
  contents: WeekContentItem[];
}

interface PageProps {
  params: {
    id: string;
  };
}

function SortableContentCard({
  weekIndex,
  contentIndex,
  reorderContent,
  draggingContent,
  setDraggingContent,
  children,
}: {
  weekIndex: number;
  contentIndex: number;
  reorderContent: (w: number, from: number, to: number) => void;
  draggingContent: { weekIndex: number; contentIndex: number } | null;
  setDraggingContent: (v: { weekIndex: number; contentIndex: number } | null) => void;
  children: React.ReactNode;
}) {
  const isDragging = draggingContent?.weekIndex === weekIndex && draggingContent?.contentIndex === contentIndex;
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ weekIndex, contentIndex }));
    e.dataTransfer.effectAllowed = 'move';
    setDraggingContent({ weekIndex, contentIndex });
  };
  const handleDragEnd = () => {
    setDraggingContent(null);
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData('application/json');
    if (!raw) return;
    try {
      const { weekIndex: fromWeek, contentIndex: fromIndex } = JSON.parse(raw);
      if (fromWeek !== weekIndex) return;
      if (fromIndex === contentIndex) return;
      reorderContent(weekIndex, fromIndex, contentIndex);
    } finally {
      setDraggingContent(null);
    }
  };
  return (
    <div
      className={`flex gap-0 mb-6 ${isDragging ? 'opacity-50' : ''}`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        className="w-8 self-stretch flex items-center justify-center cursor-grab active:cursor-grabbing border border-gray-200 border-r-0 bg-gray-100 rounded-l-lg"
        title="Arrastrar para reordenar"
      >
        <Bars3Icon className="w-5 h-5 text-gray-500" />
      </div>
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  );
}

export default function EditBitacoraPage({ params }: PageProps) {
  const router = useRouter();
  const auth = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [logbookId, setLogbookId] = useState<string>(params.id);

  const [classModules, setClassModules] = useState<ClassModule[]>([]);
  const [individualClasses, setIndividualClasses] = useState<{ _id: string; name: string }[]>([]);
  const [classFilters, setClassFilters] = useState<{ id: number; name: string; values?: { id?: number; value: string; label: string }[] }[]>([]);
  const [moduleClassesCache, setModuleClassesCache] = useState<Record<string, { _id: string; name: string; videoUrl?: string; level?: number }[]>>({});
  const [creatingClass, setCreatingClass] = useState<string | null>(null);
  const [newSubmoduleName, setNewSubmoduleName] = useState<Record<string, string>>({});
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [title, setTitle] = useState('Camino');
  const [description, setDescription] = useState('');
  const [isBaseBitacora, setIsBaseBitacora] = useState(false);
  /** Módulos del camino: definidos antes; las semanas solo se asocian por moduleNumber. */
  const [pathModules, setPathModules] = useState<{ number: number; name: string }[]>([{ number: 1, name: '' }]);
  const [weeks, setWeeks] = useState<WeekContent[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const prevMonthRef = useRef<number>(month);
  const prevYearRef = useRef<number>(year);
  /** Edición inline de clase creada en el camino (visibleInLibrary: false) */
  const [editingCreatedClass, setEditingCreatedClass] = useState<{ weekIndex: number; contentIndex: number } | null>(null);
  const [editingClassForm, setEditingClassForm] = useState<{
    name: string;
    description: string;
    videoUrl: string;
    videoId?: string;
    level?: number;
    materials?: string[];
    type?: string;
    tags?: string;
  } | null>(null);
  const [savingInlineClass, setSavingInlineClass] = useState(false);
  const [moveCrewEvents, setMoveCrewEvents] = useState<{ _id: string; title: string; eventDate: string | null; startTime: string; repeatsWeekly?: boolean; weekday?: number }[]>([]);
  const [newEventModalOpen, setNewEventModalOpen] = useState(false);
  const [newEventForm, setNewEventForm] = useState({ title: '', description: '', zoomLink: '', eventDate: '', startTime: '18:00', durationMinutes: 60, repeatsWeekly: false, weekday: 2 });
  const [creatingEvent, setCreatingEvent] = useState(false);
  const [newEventForContent, setNewEventForContent] = useState<{ weekIndex: number; contentIndex: number } | null>(null);
  /** Por contenido zoom: 'existing' = selector, 'new' = crear nuevo (solo uno visible) */
  const [zoomEventSourceMode, setZoomEventSourceMode] = useState<Record<string, 'existing' | 'new'>>({});
  /** Índice de la semana a replicar al resto (null = modal cerrado) */
  const [replicateWeekIndex, setReplicateWeekIndex] = useState<number | null>(null);
  /** Warm Up del mes: contenido global recomendado para hacer primero. Las semanas con hasWarmUp lo muestran. */
  const [warmUpContent, setWarmUpContent] = useState<WeekContentItem | null>(null);
  /** Modal cambiar evento por clase individual (grabación) */
  const [replaceEventModal, setReplaceEventModal] = useState<{ weekIndex: number; contentIndex: number; eventName?: string } | null>(null);
  const [replaceModalSelectedId, setReplaceModalSelectedId] = useState<string>('');
  const [replaceModalMode, setReplaceModalMode] = useState<'select' | 'create'>('select');
  const [replaceModalCreateForm, setReplaceModalCreateForm] = useState({ name: '', description: '', videoUrl: '', type: '' });
  const [replaceModalLoading, setReplaceModalLoading] = useState(false);
  const [replaceModalError, setReplaceModalError] = useState<string | null>(null);

  const emptyContentItem = (orden: number): WeekContentItem => ({
    contentType: 'moduleClass',
    videoUrl: '',
    videoName: '',
    videoThumbnail: '',
    level: 1,
    moduleId: '',
    submoduleSlug: '',
    submoduleName: '',
    orden
  });

  const getFirstTuesdayOfMonth = useCallback((year: number, month: number): Date => {
    const firstDay = new Date(year, month - 1, 1);
    const dayOfWeek = firstDay.getDay();
    const daysToTuesday = dayOfWeek <= 2 ? (2 - dayOfWeek) : (9 - dayOfWeek);
    const firstTuesday = new Date(firstDay);
    firstTuesday.setDate(1 + daysToTuesday);
    return firstTuesday;
  }, []);

  const calculatePublishDates = useCallback((currentWeeks: WeekContent[]) => {
    const newWeeks = [...currentWeeks];
    const firstTuesday = getFirstTuesdayOfMonth(year, month);

    newWeeks.forEach((week, index) => {
      const tuesdayDate = new Date(firstTuesday);
      tuesdayDate.setDate(firstTuesday.getDate() + (index * 7));
      week.publishDate = tuesdayDate.toISOString().split('T')[0];
    });

    setWeeks(newWeeks);
  }, [year, month, getFirstTuesdayOfMonth]);

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
        if (loadedLogbook.modules && Array.isArray(loadedLogbook.modules) && loadedLogbook.modules.length > 0) {
          setPathModules(loadedLogbook.modules.map((m: { moduleNumber: number; name?: string }) => ({
            number: Number(m.moduleNumber),
            name: (m.name && String(m.name).trim()) || ''
          })));
        } else {
          setPathModules([{ number: 1, name: '' }]);
        }

        // Primer martes del mes (para desbloqueo por contenido desde el martes)
        const getFirstTuesday = (y: number, m: number) => {
          const first = new Date(y, m - 1, 1);
          const day = first.getDay();
          const daysToTuesday = day <= 2 ? (2 - day) : (9 - day);
          const tuesday = new Date(first);
          tuesday.setDate(1 + daysToTuesday);
          return tuesday;
        };
        const logbookMonth = loadedLogbook.month ?? new Date().getMonth() + 1;
        const logbookYear = loadedLogbook.year ?? new Date().getFullYear();

        // Convertir a estructura con contents[] (nuevo formato o legacy)
        const formattedWeeks: WeekContent[] = (loadedLogbook.weeklyContents || []).map((week: any) => {
          let publishDate = '';
          if (week.publishDate) {
            const d = typeof week.publishDate === 'string' ? new Date(week.publishDate) : new Date(week.publishDate);
            if (!Number.isNaN(d.getTime())) {
              publishDate = d.toISOString().split('T')[0];
            }
          }
          // Si no hay publishDate válido, crear desde primer martes del mes (desbloqueo por contenido desde martes)
          if (!publishDate) {
            const firstTuesday = getFirstTuesday(logbookYear, logbookMonth);
            const weekNum = Math.max(1, Number(week.weekNumber) || 1);
            const tuesdayForWeek = new Date(firstTuesday);
            tuesdayForWeek.setDate(firstTuesday.getDate() + (weekNum - 1) * 7);
            publishDate = tuesdayForWeek.toISOString().split('T')[0];
          }
          let contents: WeekContentItem[] = [];
          if (week.contents && Array.isArray(week.contents) && week.contents.length > 0) {
            contents = week.contents.map((c: any, idx: number) => ({
              contentType: ['moduleClass', 'individualClass', 'audio', 'zoomEvent'].includes(c.contentType) ? c.contentType : 'moduleClass',
              individualClassId: c.individualClassId ? String(c.individualClassId) : undefined,
              moduleClassId: c.moduleClassId ? String(c.moduleClassId) : undefined,
              moveCrewEventId: c.moveCrewEventId ? String(c.moveCrewEventId) : undefined,
              moveCrewEventCreatedInPath: !!c.moveCrewEventCreatedInPath,
              moduleClassSource: c.moduleClassId ? ('existing' as const) : ('new' as const),
              individualClassSource: c.individualClassId ? ('existing' as const) : ('new' as const),
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
              orden: idx,
              createdInWeeklyPathForm: !!c.createdInWeeklyPathForm,
              createdClassDescription: c.createdClassDescription || undefined,
              individualClassType: c.individualClassType,
              individualClassTags: c.individualClassTags,
              submoduleMode: c.submoduleMode || 'existing',
              newModuleClassName: c.newModuleClassName,
              newModuleClassMaterials: Array.isArray(c.newModuleClassMaterials) ? c.newModuleClassMaterials : undefined
            }));
          } else {
            contents = [{
              contentType: 'moduleClass' as ContentType,
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
            moduleNumber: week.moduleNumber,
            weekTitle: week.weekTitle || `Semana ${week.weekNumber}`,
            publishDate,
            isPublished: week.isPublished || false,
            hasWarmUp: !!week.hasWarmUp,
            contents
          };
        });
        setWeeks(formattedWeeks);
        const warmUp = loadedLogbook.warmUpContent;
        if (warmUp && typeof warmUp === 'object' && (warmUp.contentType || warmUp.videoUrl || warmUp.individualClassId || warmUp.moduleClassId || warmUp.moveCrewEventId || warmUp.audioUrl)) {
          setWarmUpContent({
            contentType: ['moduleClass', 'individualClass', 'audio', 'zoomEvent'].includes((warmUp as any).contentType) ? (warmUp as any).contentType : 'moduleClass',
            individualClassId: (warmUp as any).individualClassId ? String((warmUp as any).individualClassId) : undefined,
            moduleClassId: (warmUp as any).moduleClassId ? String((warmUp as any).moduleClassId) : undefined,
            moveCrewEventId: (warmUp as any).moveCrewEventId ? String((warmUp as any).moveCrewEventId) : undefined,
            moveCrewEventCreatedInPath: !!((warmUp as any).moveCrewEventCreatedInPath),
            moduleClassSource: (warmUp as any).moduleClassId ? ('existing' as const) : ('new' as const),
            individualClassSource: (warmUp as any).individualClassId ? ('existing' as const) : ('new' as const),
            videoUrl: (warmUp as any).videoUrl || '',
            videoId: (warmUp as any).videoId,
            videoName: (warmUp as any).videoName || '',
            videoThumbnail: (warmUp as any).videoThumbnail || '',
            videoDuration: (warmUp as any).videoDuration,
            audioUrl: (warmUp as any).audioUrl || '',
            audioTitle: (warmUp as any).audioTitle || '',
            audioDuration: (warmUp as any).audioDuration,
            audioText: (warmUp as any).audioText || '',
            level: Math.min(10, Math.max(1, Number((warmUp as any).level) || 1)),
            moduleId: (warmUp as any).moduleId ? String((warmUp as any).moduleId) : '',
            submoduleSlug: (warmUp as any).submoduleSlug || '',
            submoduleName: (warmUp as any).submoduleName || '',
            orden: 0,
            createdInWeeklyPathForm: !!((warmUp as any).createdInWeeklyPathForm),
            createdClassDescription: (warmUp as any).createdClassDescription,
            individualClassType: (warmUp as any).individualClassType,
            individualClassTags: (warmUp as any).individualClassTags,
            submoduleMode: ((warmUp as any).submoduleMode || 'existing') as 'existing' | 'new',
            newModuleClassName: (warmUp as any).newModuleClassName,
            newModuleClassMaterials: Array.isArray((warmUp as any).newModuleClassMaterials) ? (warmUp as any).newModuleClassMaterials : undefined
          });
        } else {
          setWarmUpContent(null);
        }
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
  useEffect(() => {
    fetch('/api/individualClass/getClassTypes', { credentials: 'include', cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setClassFilters(Array.isArray(data) ? data : []))
      .catch(() => setClassFilters([]));
  }, []);
  useEffect(() => {
    fetch('/api/individualClass/getClasses?includeUnpublished=1', { credentials: 'include', cache: 'no-store' })
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setIndividualClasses(Array.isArray(data) ? data : []))
      .catch(() => setIndividualClasses([]));
  }, []);
  useEffect(() => {
    fetch('/api/move-crew-events', { credentials: 'include', cache: 'no-store' })
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setMoveCrewEvents(Array.isArray(data) ? data : []))
      .catch(() => setMoveCrewEvents([]));
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

  const reorderContent = (weekIndex: number, fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    const newWeeks = [...weeks];
    const contents = [...(newWeeks[weekIndex].contents || [])];
    const [removed] = contents.splice(fromIndex, 1);
    contents.splice(toIndex, 0, removed);
    newWeeks[weekIndex].contents = contents.map((c, i) => ({ ...c, orden: i }));
    setWeeks(newWeeks);
  };

  const [draggingContent, setDraggingContent] = useState<{ weekIndex: number; contentIndex: number } | null>(null);

  useEffect(() => {
    const keys = new Set<string>();
    weeks.forEach((w) => {
      (w.contents || []).forEach((c) => {
        if ((c.contentType || '') === 'moduleClass' && c.moduleId && (c.submoduleSlug || c.submoduleName)) {
          const slug = (c.submoduleSlug || '').trim() || (c.submoduleName || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || NO_SUBMODULE_SLUG;
          keys.add(`${c.moduleId}|${slug}`);
        }
      });
    });
    if (warmUpContent && (warmUpContent.contentType || '') === 'moduleClass' && warmUpContent.moduleId && (warmUpContent.submoduleSlug || warmUpContent.submoduleName)) {
      const slug = (warmUpContent.submoduleSlug || '').trim() || (warmUpContent.submoduleName || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || NO_SUBMODULE_SLUG;
      keys.add(`${warmUpContent.moduleId}|${slug}`);
    }
    keys.forEach((key) => {
      if (moduleClassesCache[key]) return;
      const [moduleId, submoduleSlug] = key.split('|');
      fetch(`/api/module-classes?moduleId=${encodeURIComponent(moduleId)}&submoduleSlug=${encodeURIComponent(submoduleSlug)}&includeUnpublished=1`, { credentials: 'include', cache: 'no-store' })
        .then((r) => r.ok ? r.json() : [])
        .then((list) => setModuleClassesCache((prev) => ({ ...prev, [key]: Array.isArray(list) ? list : [] })))
        .catch(() => setModuleClassesCache((prev) => ({ ...prev, [key]: [] })));
    });
  }, [weeks, warmUpContent]);

  const addSubmoduleToModule = async (moduleId: string, name: string) => {
    const r = await fetch(`/api/class-modules/${moduleId}/submodules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name: name.trim() })
    });
    if (!r.ok) {
      const d = await r.json().catch(() => ({}));
      throw new Error(d.error || 'Error al crear submódulo');
    }
    const created = await r.json();
    const mod = classModules.find((m) => m._id === moduleId);
    if (mod && created.slug) {
      setClassModules((prev) => prev.map((m) => (m._id === moduleId ? { ...m, submodules: [...(m.submodules || []), { name: created.name || name, slug: created.slug }] } : m)));
    }
    return created;
  };

  const createModuleClassAndUse = async (weekIndex: number, contentIndex: number) => {
    const c = weeks[weekIndex].contents[contentIndex];
    const moduleId = c.moduleId?.trim();
    const submoduleSlug = (c.submoduleSlug || '').trim() || (c.submoduleName || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || NO_SUBMODULE_SLUG;
    const name = (c.newModuleClassName || c.videoName || c.videoUrl || 'Nueva clase').trim();
    if (!moduleId || !name) {
      toast.error('Indica módulo y nombre de la clase');
      return;
    }
    if (!c.videoUrl?.trim()) {
      toast.error('Video URL es requerido para crear la clase');
      return;
    }
    setCreatingClass(`module-${weekIndex}-${contentIndex}`);
    try {
      const description = (c.createdClassDescription ?? c.audioText ?? '').trim();
      const r = await fetch('/api/module-classes/from-weekly-path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          moduleId,
          submoduleSlug: submoduleSlug || NO_SUBMODULE_SLUG,
          name,
          description: description || '',
          videoUrl: c.videoUrl,
          videoId: c.videoId || undefined,
          level: c.level || 1,
          materials: c.newModuleClassMaterials || []
        })
      });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        throw new Error(d.error || 'Error al crear clase');
      }
      const created = await r.json();
      const key = `${moduleId}|${submoduleSlug || NO_SUBMODULE_SLUG}`;
      setModuleClassesCache((prev) => ({ ...prev, [key]: [...(prev[key] || []), { _id: created._id, name: created.name, videoUrl: created.videoUrl, level: created.level }] }));
      setWeeks((prev) => {
        const next = [...prev];
        const contents = [...(next[weekIndex].contents || [])];
        contents[contentIndex] = {
          ...contents[contentIndex],
          moduleClassId: created._id,
          videoName: created.name,
          createdInWeeklyPathForm: true,
          createdClassDescription: description || created.description || ''
        };
        next[weekIndex] = { ...next[weekIndex], contents };
        return next;
      });
      toast.success('Clase creada. Quedará visible en la biblioteca al publicar la última semana.');
    } catch (e: any) {
      toast.error(e.message || 'Error al crear clase');
    } finally {
      setCreatingClass(null);
    }
  };

  const createWarmUpIndividualClassAndUse = async () => {
    if (!warmUpContent) return;
    const name = (warmUpContent.videoName || warmUpContent.videoUrl || '').trim();
    const description = (warmUpContent.audioText || 'Calentamiento del Camino').trim();
    const videoUrl = warmUpContent.videoUrl?.trim();
    if (!name || !videoUrl) {
      toast.error('Nombre y Video URL son requeridos');
      return;
    }
    const typeFilter = (warmUpContent.individualClassType && warmUpContent.individualClassType.trim()) || undefined;
    if (!typeFilter) {
      toast.error('Selecciona el tipo (filtro) de la clase');
      return;
    }
    const tagsStr = (warmUpContent.individualClassTags && warmUpContent.individualClassTags.trim()) || '';
    const tags = tagsStr ? tagsStr.split(',').map((s) => s.trim()).filter(Boolean) : [];
    setCreatingClass('warmup-individual');
    try {
      const r = await fetch('/api/individualClass/createFromWeeklyPath', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name,
          description,
          videoUrl,
          userEmail: auth.user?.email,
          type: typeFilter,
          tags
        })
      });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        throw new Error(d.error || 'Error al crear clase');
      }
      const created = await r.json();
      setIndividualClasses((prev) => [...prev, { _id: created._id, name: created.name }]);
      setWarmUpContent((prev) => prev ? {
        ...prev,
        individualClassId: created._id,
        individualClassSource: 'existing',
        videoName: created.name,
        createdInWeeklyPathForm: true,
        createdClassDescription: description
      } : null);
      toast.success('Clase de calentamiento creada.');
    } catch (e: any) {
      toast.error(e.message || 'Error al crear clase');
    } finally {
      setCreatingClass(null);
    }
  };

  const createIndividualClassAndUse = async (weekIndex: number, contentIndex: number) => {
    const c = weeks[weekIndex].contents[contentIndex];
    const name = (c.videoName || c.videoUrl || '').trim();
    const description = (c.audioText || 'Clase del Camino').trim();
    const videoUrl = c.videoUrl?.trim();
    if (!name || !videoUrl) {
      toast.error('Nombre y Video URL son requeridos');
      return;
    }
    const typeFilter = (c.individualClassType && c.individualClassType.trim()) || undefined;
    if (!typeFilter) {
      toast.error('Selecciona el tipo (filtro) de la clase');
      return;
    }
    const tagsStr = (c.individualClassTags && c.individualClassTags.trim()) || '';
    const tags = tagsStr ? tagsStr.split(',').map((s) => s.trim()).filter(Boolean) : [];
    setCreatingClass(`individual-${weekIndex}-${contentIndex}`);
    try {
      const r = await fetch('/api/individualClass/createFromWeeklyPath', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name,
          description,
          videoUrl,
          userEmail: auth.user?.email,
          type: typeFilter,
          tags
        })
      });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        throw new Error(d.error || 'Error al crear clase');
      }
      const created = await r.json();
      setIndividualClasses((prev) => [...prev, { _id: created._id, name: created.name }]);
      setWeeks((prev) => {
        const next = [...prev];
        const contents = [...(next[weekIndex].contents || [])];
        contents[contentIndex] = {
          ...contents[contentIndex],
          individualClassId: created._id,
          individualClassSource: 'existing' as const,
          createdInWeeklyPathForm: true,
          createdClassDescription: (c.audioText || '').trim()
        };
        next[weekIndex] = { ...next[weekIndex], contents };
        return next;
      });
      toast.success('Clase creada. Quedará visible en la biblioteca al publicar la última semana.');
    } catch (e: any) {
      toast.error(e.message || 'Error al crear clase');
    } finally {
      setCreatingClass(null);
    }
  };

  const deleteCreatedClassAndRemove = async (weekIndex: number, contentIndex: number) => {
    const c = weeks[weekIndex].contents[contentIndex];
    if (!c.createdInWeeklyPathForm) return;
    const moduleClassId = c.moduleClassId;
    const individualClassId = c.individualClassId;
    try {
      if (moduleClassId) {
        const r = await fetch(`/api/module-classes/${moduleClassId}`, { method: 'DELETE', credentials: 'include' });
        if (!r.ok) {
          const d = await r.json().catch(() => ({}));
          throw new Error(d.error || 'Error al eliminar la clase');
        }
      } else if (individualClassId) {
        const r = await fetch(`/api/individualClass/delete/${individualClassId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ classId: individualClassId })
        });
        if (!r.ok) {
          const d = await r.json().catch(() => ({}));
          throw new Error(d.error || 'Error al eliminar la clase');
        }
      }
      removeContent(weekIndex, contentIndex);
      toast.success('Clase eliminada de la base de datos y del contenido.');
    } catch (e: any) {
      toast.error(e.message || 'Error al eliminar');
    }
  };

  const startEditCreatedClass = async (weekIndex: number, contentIndex: number) => {
    const c = weeks[weekIndex].contents[contentIndex];
    const isModule = !!c.moduleClassId;
    const id = isModule ? c.moduleClassId : c.individualClassId;
    if (!id) return;
    try {
      const url = isModule ? `/api/module-classes/${id}` : `/api/individualClass/getByObjectId/${id}`;
      const r = await fetch(url, { credentials: 'include', cache: 'no-store' });
      if (!r.ok) throw new Error('No se pudo cargar la clase');
      const data = await r.json();
      if (isModule) {
        setEditingClassForm({
          name: data.name || '',
          description: data.description || '',
          videoUrl: data.videoUrl || '',
          videoId: data.videoId || '',
          level: data.level != null ? Number(data.level) : 1,
          materials: Array.isArray(data.materials) ? [...data.materials] : []
        });
      } else {
        setEditingClassForm({
          name: data.name || '',
          description: data.description || '',
          videoUrl: data.link ? `https://vimeo.com/${data.link}` : '',
          videoId: data.link || '',
          type: data.type || '',
          tags: Array.isArray(data.tags) ? data.tags.map((t: { title?: string }) => t?.title).filter(Boolean).join(', ') : ''
        });
      }
      setEditingCreatedClass({ weekIndex, contentIndex });
    } catch (err: any) {
      toast.error(err.message || 'Error al cargar la clase');
    }
  };

  const saveInlineClassEdit = async () => {
    if (!editingCreatedClass || !editingClassForm) return;
    const { weekIndex, contentIndex } = editingCreatedClass;
    const c = weeks[weekIndex].contents[contentIndex];
    const isModule = !!c.moduleClassId;
    const id = isModule ? c.moduleClassId : c.individualClassId;
    if (!id) return;
    setSavingInlineClass(true);
    try {
      if (isModule) {
        const r = await fetch(`/api/module-classes/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            name: editingClassForm.name.trim(),
            description: editingClassForm.description.trim(),
            videoUrl: editingClassForm.videoUrl.trim() || undefined,
            videoId: editingClassForm.videoId?.trim() || undefined,
            level: editingClassForm.level != null ? Math.min(10, Math.max(1, editingClassForm.level)) : undefined,
            materials: editingClassForm.materials || []
          })
        });
        if (!r.ok) {
          const d = await r.json().catch(() => ({}));
          throw new Error(d.error || 'Error al actualizar');
        }
        setWeeks((prev) => {
          const next = [...prev];
          const contents = [...(next[weekIndex].contents || [])];
          contents[contentIndex] = { ...contents[contentIndex], videoName: editingClassForm!.name.trim(), createdClassDescription: editingClassForm!.description.trim() };
          next[weekIndex] = { ...next[weekIndex], contents };
          return next;
        });
      } else {
        const r = await fetch(`/api/individualClass/update/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            name: editingClassForm.name.trim(),
            description: editingClassForm.description.trim(),
            link: editingClassForm.videoId?.trim() || editingClassForm.videoUrl?.trim(),
            videoUrl: editingClassForm.videoUrl?.trim(),
            type: editingClassForm.type?.trim(),
            tags: editingClassForm.tags?.trim() ? editingClassForm.tags.split(',').map((s) => s.trim()).filter(Boolean) : []
          })
        });
        if (!r.ok) {
          const d = await r.json().catch(() => ({}));
          throw new Error(d.error || 'Error al actualizar');
        }
        setWeeks((prev) => {
          const next = [...prev];
          const contents = [...(next[weekIndex].contents || [])];
          contents[contentIndex] = { ...contents[contentIndex], videoName: editingClassForm!.name.trim(), createdClassDescription: editingClassForm!.description.trim() };
          next[weekIndex] = { ...next[weekIndex], contents };
          return next;
        });
      }
      toast.success('Clase actualizada');
      setEditingCreatedClass(null);
      setEditingClassForm(null);
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar');
    } finally {
      setSavingInlineClass(false);
    }
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
          toast.error(`Semana ${i + 1}: agrega al menos un contenido`);
          setSubmitting(false);
          return;
        }
        for (let j = 0; j < contents.length; j++) {
          const c = contents[j];
          const tipo = (c.contentType || 'moduleClass') as ContentType;
          if (tipo === 'moduleClass') {
            if (c.moduleClassId) { /* ok */ } else {
              if (!c.videoUrl?.trim()) {
                toast.error(`Semana ${i + 1}, contenido ${j + 1}: selecciona una clase existente o crea una nueva (con video)`);
                setSubmitting(false);
                return;
              }
              if (!c.moduleId) {
                toast.error(`Semana ${i + 1}, contenido ${j + 1}: selecciona un módulo`);
                setSubmitting(false);
                return;
              }
              const sub = (c.submoduleSlug || '').trim() || (c.submoduleName || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
              if (!sub) {
                toast.error(`Semana ${i + 1}, contenido ${j + 1}: indica submódulo o crea uno`);
                setSubmitting(false);
                return;
              }
            }
          } else if (tipo === 'individualClass') {
            if (!c.individualClassId?.trim()) {
              toast.error(`Semana ${i + 1}, contenido ${j + 1}: selecciona una clase individual`);
              setSubmitting(false);
              return;
            }
          } else if (tipo === 'zoomEvent') {
            if (!c.moveCrewEventId?.trim()) {
              toast.error(`Semana ${i + 1}, contenido ${j + 1}: selecciona un evento existente o creá uno nuevo`);
              setSubmitting(false);
              return;
            }
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
        modules: pathModules.map((m) => ({ moduleNumber: m.number, name: (m.name || '').trim() })),
        warmUpContent: warmUpContent && (warmUpContent.contentType || warmUpContent.videoUrl || warmUpContent.individualClassId || warmUpContent.moduleClassId || warmUpContent.moveCrewEventId || warmUpContent.audioUrl)
          ? {
              contentType: (warmUpContent.contentType || 'moduleClass') as ContentType,
              individualClassId: warmUpContent.individualClassId || undefined,
              moduleClassId: warmUpContent.moduleClassId || undefined,
              moveCrewEventId: warmUpContent.moveCrewEventId || undefined,
              moveCrewEventCreatedInPath: warmUpContent.moveCrewEventCreatedInPath || undefined,
              videoUrl: warmUpContent.videoUrl || '',
              videoId: warmUpContent.videoId || undefined,
              videoName: warmUpContent.videoName || undefined,
              videoThumbnail: warmUpContent.videoThumbnail || undefined,
              videoDuration: warmUpContent.videoDuration || undefined,
              audioUrl: warmUpContent.audioUrl || undefined,
              audioTitle: warmUpContent.audioTitle || undefined,
              audioDuration: warmUpContent.audioDuration || undefined,
              audioText: warmUpContent.audioText || undefined,
              level: Math.min(10, Math.max(1, warmUpContent.level ?? 1)),
              moduleId: warmUpContent.moduleId || undefined,
              submoduleSlug: warmUpContent.submoduleSlug || (warmUpContent.submoduleName || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
              submoduleName: warmUpContent.submoduleName || undefined,
              orden: 0
            }
          : null,
        weeklyContents: weeks.map((week) => ({
          weekNumber: week.weekNumber,
          moduleNumber: week.moduleNumber != null ? Number(week.moduleNumber) : undefined,
          weekTitle: week.weekTitle || `Semana ${week.weekNumber}`,
          publishDate: new Date(week.publishDate).toISOString(),
          isPublished: week.isPublished,
          isUnlocked: false,
          hasWarmUp: week.hasWarmUp === true,
          contents: (week.contents || []).map((c, idx) => ({
            contentType: (c.contentType || 'moduleClass') as ContentType,
            individualClassId: c.individualClassId || undefined,
            moduleClassId: c.moduleClassId || undefined,
            moveCrewEventId: c.moveCrewEventId || undefined,
            moveCrewEventCreatedInPath: c.moveCrewEventCreatedInPath || undefined,
            videoUrl: c.videoUrl || '',
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

            <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 font-montserrat">Módulos del camino</h2>
              <p className="text-sm text-gray-600 mb-4 font-montserrat">Definí la cantidad de módulos y sus nombres. Luego asociá cada semana a un módulo por número.</p>
              <div className="flex flex-wrap items-end gap-4">
                <div className="w-40">
                  <label className="block text-xs font-medium text-gray-600 mb-1 font-montserrat">Cantidad de módulos</label>
                  <select
                    value={pathModules.length}
                    onChange={(e) => {
                      const n = Number(e.target.value);
                      setPathModules((prev) => Array.from({ length: n }, (_, i) => prev[i] ?? { number: i + 1, name: '' }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg font-montserrat bg-white text-gray-900 text-sm"
                  >
                    {[1, 2, 3, 4].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
                {pathModules.map((m, idx) => (
                  <div key={m.number} className="flex-1 min-w-[180px]">
                    <label className="block text-xs font-medium text-gray-600 mb-1 font-montserrat">Nombre módulo {m.number}</label>
                    <input
                      type="text"
                      value={m.name}
                      onChange={(e) => setPathModules((prev) => prev.map((x, i) => i === idx ? { ...x, name: e.target.value } : x))}
                      placeholder={`Ej: Módulo ${m.number}`}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg font-montserrat bg-white text-gray-900 text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Warm Up del mes: contenido global recomendado para hacer primero. Las semanas con "Tiene Warm Up" lo muestran. */}
            <div className="border border-amber-200 rounded-xl p-6 bg-amber-50/50">
              <h2 className="text-lg font-semibold text-gray-900 mb-1 font-montserrat">Warm Up del mes</h2>
              <p className="text-sm text-gray-600 mb-4 font-montserrat">Contenido único recomendado para hacer primero al empezar el camino. En cada semana podés marcar si tiene Warm Up o no.</p>
              {warmUpContent === null ? (
                <button
                  type="button"
                  onClick={() => setWarmUpContent(emptyContentItem(0))}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 font-montserrat"
                >
                  <PlusIcon className="w-5 h-5" />
                  Agregar Warm Up del mes
                </button>
              ) : (
                <div className="p-4 bg-white rounded-lg border border-amber-200">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-gray-700 font-montserrat">Contenido Warm Up</span>
                    <div className="flex items-center gap-3">
                      <label className="text-xs font-medium text-black font-montserrat">Tipo:</label>
                      <select
                        value={warmUpContent.contentType || 'moduleClass'}
                        onChange={(e) => setWarmUpContent((prev) => prev ? { ...prev, contentType: e.target.value as ContentType } : null)}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-gray-900 text-sm"
                      >
                        <option value="moduleClass">Clase de módulo</option>
                        <option value="individualClass">Clase individual</option>
                        <option value="audio">Audio</option>
                        <option value="zoomEvent">Clase en vivo (Zoom)</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => setWarmUpContent(null)}
                        className="text-red-600 hover:text-red-800 p-1 font-montserrat text-sm"
                        title="Quitar Warm Up"
                      >
                        <XMarkIcon className="w-5 h-5 inline" /> Quitar Warm Up
                      </button>
                    </div>
                  </div>
                  {(warmUpContent.contentType || 'moduleClass') === 'moduleClass' && (
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1 font-montserrat">Módulo *</label>
                        <select value={warmUpContent.moduleId} onChange={(e) => setWarmUpContent((prev) => prev ? { ...prev, moduleId: e.target.value } : null)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm">
                          <option value="">Seleccionar módulo</option>
                          {classModules.map((m) => (<option key={m._id} value={m._id}>{m.name}</option>))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1 font-montserrat">Submódulo *</label>
                        <select
                          value={warmUpContent.submoduleSlug || (warmUpContent.submoduleName ? warmUpContent.submoduleName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : '')}
                          onChange={(e) => {
                            const slug = e.target.value;
                            const mod = classModules.find((m) => m._id === warmUpContent.moduleId);
                            const sub = mod?.submodules?.find((s) => (s.slug || '') === slug);
                            setWarmUpContent((prev) => prev ? { ...prev, submoduleSlug: slug, submoduleName: sub?.name || slug } : null);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm"
                        >
                          <option value="">Seleccionar</option>
                          {warmUpContent.moduleId && (() => {
                            const mod = classModules.find((m) => m._id === warmUpContent.moduleId);
                            const subs = mod?.submodules || [];
                            return (<><option value={NO_SUBMODULE_SLUG}>Clases del módulo</option>{subs.map((s) => (<option key={s.slug || s.name} value={s.slug || (s.name || '').toLowerCase().replace(/\s+/g, '-')}>{s.name}</option>))}</>);
                          })()}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1 font-montserrat">Clase *</label>
                        <select
                          value={warmUpContent.moduleClassId || ''}
                          onChange={(e) => {
                            const id = e.target.value;
                            const slug = (warmUpContent.submoduleSlug || warmUpContent.submoduleName || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || NO_SUBMODULE_SLUG;
                            const list = moduleClassesCache[`${warmUpContent.moduleId}|${slug}`] || [];
                            const cls = list.find((x) => x._id === id);
                            setWarmUpContent((prev) => prev ? { ...prev, moduleClassId: id, videoUrl: cls?.videoUrl || prev.videoUrl || '', videoName: cls?.name ?? prev.videoName, level: cls?.level ?? prev.level } : null);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm"
                        >
                          <option value="">Seleccionar clase</option>
                          {warmUpContent.moduleId && (moduleClassesCache[`${warmUpContent.moduleId}|${(warmUpContent.submoduleSlug || warmUpContent.submoduleName || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || NO_SUBMODULE_SLUG}`] || []).map((cls) => (<option key={cls._id} value={cls._id}>{cls.name}</option>))}
                        </select>
                      </div>
                    </div>
                  )}
                  {(warmUpContent.contentType || '') === 'individualClass' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-medium text-black font-montserrat">Origen:</span>
                        <label className="flex items-center gap-1">
                          <input type="radio" name="warmUp-individualSource" checked={(warmUpContent.individualClassSource || 'existing') === 'existing'} onChange={() => setWarmUpContent((prev) => prev ? { ...prev, individualClassSource: 'existing' } : null)} className="text-orange-600" />
                          <span className="text-sm text-black font-montserrat">Usar clase existente</span>
                        </label>
                        <label className="flex items-center gap-1">
                          <input type="radio" name="warmUp-individualSource" checked={(warmUpContent.individualClassSource || 'existing') === 'new'} onChange={() => setWarmUpContent((prev) => prev ? { ...prev, individualClassSource: 'new' } : null)} className="text-orange-600" />
                          <span className="text-sm text-black font-montserrat">Crear clase nueva</span>
                        </label>
                      </div>
                      {(warmUpContent.individualClassSource || 'existing') === 'existing' && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1 font-montserrat">Clase individual *</label>
                          <select
                            value={warmUpContent.individualClassId || ''}
                            onChange={(e) => {
                              const id = e.target.value;
                              const ic = individualClasses.find((x) => x._id === id);
                              setWarmUpContent((prev) => prev ? { ...prev, individualClassId: id || undefined, videoName: ic?.name ?? prev.videoName } : null);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm"
                          >
                            <option value="">Seleccionar clase individual</option>
                            {individualClasses.map((ic) => (<option key={ic._id} value={ic._id}>{ic.name}</option>))}
                          </select>
                        </div>
                      )}
                      {(warmUpContent.individualClassSource || 'existing') === 'new' && (
                        <div className="grid md:grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
                          <div><label className="block text-xs font-medium text-gray-600 mb-1 font-montserrat">Nombre clase *</label><input type="text" value={warmUpContent.videoName || ''} onChange={(e) => setWarmUpContent((prev) => prev ? { ...prev, videoName: e.target.value } : null)} placeholder="Nombre de la clase" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm" /></div>
                          <div><label className="block text-xs font-medium text-gray-600 mb-1 font-montserrat">Video URL (Vimeo) *</label><input type="url" value={warmUpContent.videoUrl || ''} onChange={(e) => setWarmUpContent((prev) => prev ? { ...prev, videoUrl: e.target.value } : null)} placeholder="https://vimeo.com/..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm" /></div>
                          <div className="md:col-span-2"><label className="block text-xs font-medium text-gray-600 mb-1 font-montserrat">Descripción *</label><textarea value={warmUpContent.audioText || ''} onChange={(e) => setWarmUpContent((prev) => prev ? { ...prev, audioText: e.target.value } : null)} placeholder="Descripción de la clase" rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm" /></div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1 font-montserrat">Tipo (filtro) *</label>
                            <select value={warmUpContent.individualClassType ?? ''} onChange={(e) => setWarmUpContent((prev) => prev ? { ...prev, individualClassType: e.target.value } : null)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm">
                              <option value="">Seleccionar tipo</option>
                              {(classFilters[0]?.values ?? []).map((v: { value: string; label: string }) => (<option key={v.value} value={v.value}>{v.label}</option>))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1 font-montserrat">Tags (separados por comas)</label>
                            <input type="text" value={warmUpContent.individualClassTags ?? ''} onChange={(e) => setWarmUpContent((prev) => prev ? { ...prev, individualClassTags: e.target.value } : null)} placeholder="Ej: principiante, fuerza, movilidad" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm" />
                          </div>
                          <div><button type="button" disabled={creatingClass === 'warmup-individual' || !(warmUpContent.videoName || warmUpContent.videoUrl)?.trim() || !warmUpContent.videoUrl?.trim() || !(warmUpContent.individualClassType ?? '').trim()} onClick={createWarmUpIndividualClassAndUse} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed font-montserrat">{creatingClass === 'warmup-individual' ? 'Creando...' : 'Crear clase y usar aquí'}</button>{warmUpContent.individualClassId && <span className="ml-2 text-sm text-green-600">Clase asignada</span>}</div>
                        </div>
                      )}
                    </div>
                  )}
                  {(warmUpContent.contentType || '') === 'audio' && (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1 font-montserrat">URL del audio *</label>
                        <input type="url" value={warmUpContent.audioUrl || ''} onChange={(e) => setWarmUpContent((prev) => prev ? { ...prev, audioUrl: e.target.value } : null)} placeholder="https://res.cloudinary.com/..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1 font-montserrat">Título del audio</label>
                        <input type="text" value={warmUpContent.audioTitle || ''} onChange={(e) => setWarmUpContent((prev) => prev ? { ...prev, audioTitle: e.target.value } : null)} placeholder="Ej: Meditación guiada" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm" />
                      </div>
                    </div>
                  )}
                  {(warmUpContent.contentType || '') === 'zoomEvent' && (
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1 font-montserrat">Evento Move Crew *</label>
                      <select
                        value={warmUpContent.moveCrewEventId || ''}
                        onChange={(e) => setWarmUpContent((prev) => prev ? { ...prev, moveCrewEventId: e.target.value || undefined } : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm"
                      >
                        <option value="">Seleccionar evento en vivo</option>
                        {moveCrewEvents.map((ev) => (<option key={ev._id} value={ev._id}>{ev.title} {ev.eventDate ? `(${ev.eventDate})` : ''}</option>))}
                      </select>
                    </div>
                  )}
                </div>
              )}
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
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <div className="px-4 py-2 bg-orange-500 text-white rounded-lg font-bold text-lg font-montserrat">
                      Semana {week.weekNumber}
                    </div>
                    <div className="flex-1 min-w-[200px]">
                      <label className="block text-xs font-medium text-gray-600 mb-0.5 font-montserrat">Nombre de la semana</label>
                      <input
                        type="text"
                        value={week.weekTitle || ''}
                        onChange={(e) => updateWeek(weekIndex, 'weekTitle', e.target.value)}
                        placeholder={`Semana ${week.weekNumber}`}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-montserrat text-black bg-white text-sm"
                      />
                    </div>
                    <div className="min-w-[200px]">
                      <label className="block text-xs font-medium text-gray-600 mb-0.5 font-montserrat">Módulo</label>
                      <select
                        value={week.moduleNumber ?? ''}
                        onChange={(e) => updateWeek(weekIndex, 'moduleNumber', e.target.value === '' ? undefined : Number(e.target.value))}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-montserrat bg-white text-gray-900 text-sm"
                      >
                        <option value="">—</option>
                        {pathModules.map((m) => (
                          <option key={m.number} value={m.number}>
                            {m.name ? `Módulo ${m.number}: ${m.name}` : `Módulo ${m.number}`}
                          </option>
                        ))}
                      </select>
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
                    <label className="flex items-center gap-2 text-black font-montserrat" title="Mostrar popup de calentamiento antes de clases de esta semana">
                      <input
                        type="checkbox"
                        checked={!!week.hasWarmUp}
                        onChange={(e) => updateWeek(weekIndex, 'hasWarmUp', e.target.checked)}
                        className="form-checkbox h-4 w-4 text-orange-600"
                      />
                      <span>Tiene calentamiento</span>
                    </label>
                    {weeks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setReplicateWeekIndex(weekIndex)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-orange-500 text-orange-600 rounded-lg text-sm font-medium hover:bg-orange-50 font-montserrat"
                        title="Replicar la estructura de esta semana en el resto de las semanas del mes"
                      >
                        <DocumentDuplicateIcon className="w-4 h-4" />
                        Replicar esta semana al resto
                      </button>
                    )}
                  </div>

                  {(week.contents || []).map((content, contentIndex) => {
                    const tipo = (content.contentType || 'moduleClass') as ContentType;
                    if (tipo === 'zoomEvent' && content.moveCrewEventCreatedInPath && content.moveCrewEventId) {
                      return (
                        <SortableContentCard
                          key={contentIndex}
                          weekIndex={weekIndex}
                          contentIndex={contentIndex}
                          reorderContent={reorderContent}
                          draggingContent={draggingContent}
                          setDraggingContent={setDraggingContent}
                        >
                          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-sm font-medium text-black mb-2">
                              {moveCrewEvents.find((e) => e._id === content.moveCrewEventId)?.title || content.videoName || 'Clase en vivo'}
                            </p>
                            <p className="text-xs text-gray-600 mb-3">
                              Evento creado en este camino. Podés reemplazarlo por la grabación (clase individual) o quitarlo del camino.
                            </p>
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                    setReplaceEventModal({ weekIndex, contentIndex, eventName: moveCrewEvents.find((e) => e._id === content.moveCrewEventId)?.title || content.videoName || 'Clase en vivo' });
                                    setReplaceModalSelectedId('');
                                    setReplaceModalMode('select');
                                    setReplaceModalCreateForm({ name: '', description: '', videoUrl: '', type: '' });
                                    setReplaceModalError(null);
                                  }}
                                className="inline-flex items-center gap-1.5 px-3 py-2 text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-lg text-sm font-medium border border-amber-300"
                                title="Reemplazar por la clase individual (grabación). Se mantiene la publicación."
                              >
                                <ArrowPathIcon className="w-4 h-4 shrink-0" />
                                Cambiar por grabación
                              </button>
                              <button
                                type="button"
                                onClick={() => removeContent(weekIndex, contentIndex)}
                                className="inline-flex items-center gap-1.5 px-3 py-2 text-red-700 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium border border-red-200"
                                title="Quitar del camino"
                              >
                                <XMarkIcon className="w-4 h-4 shrink-0" />
                                Quitar del camino
                              </button>
                            </div>
                          </div>
                        </SortableContentCard>
                      );
                    }
                    if (content.createdInWeeklyPathForm && (content.moduleClassId || content.individualClassId)) {
                      const isModule = !!content.moduleClassId;
                      const isEditingThis = editingCreatedClass?.weekIndex === weekIndex && editingCreatedClass?.contentIndex === contentIndex;
                      if (isEditingThis && editingClassForm) {
                        return (
                          <SortableContentCard
                            key={contentIndex}
                            weekIndex={weekIndex}
                            contentIndex={contentIndex}
                            reorderContent={reorderContent}
                            draggingContent={draggingContent}
                            setDraggingContent={setDraggingContent}
                          >
                          <div className="p-4 bg-white rounded-lg border border-gray-300 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                              <span className="text-sm font-medium text-black">Editar clase (creada en este camino)</span>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={saveInlineClassEdit}
                                  disabled={savingInlineClass || !editingClassForm.name?.trim()}
                                  className="px-3 py-1.5 bg-[#4F7CCF] text-white rounded-lg text-sm font-medium hover:bg-[#234C8C] disabled:opacity-50"
                                >
                                  {savingInlineClass ? 'Guardando...' : 'Guardar cambios'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => { setEditingCreatedClass(null); setEditingClassForm(null); }}
                                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Nombre *</label>
                                <input
                                  type="text"
                                  value={editingClassForm.name}
                                  onChange={(e) => setEditingClassForm((f) => f ? { ...f, name: e.target.value } : null)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm"
                                />
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-gray-700 mb-1">Descripción</label>
                                <textarea
                                  value={editingClassForm.description}
                                  onChange={(e) => setEditingClassForm((f) => f ? { ...f, description: e.target.value } : null)}
                                  rows={2}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">URL del video</label>
                                <input
                                  type="url"
                                  value={editingClassForm.videoUrl}
                                  onChange={(e) => setEditingClassForm((f) => f ? { ...f, videoUrl: e.target.value } : null)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">ID de video (Vimeo)</label>
                                <input
                                  type="text"
                                  value={editingClassForm.videoId ?? ''}
                                  onChange={(e) => setEditingClassForm((f) => f ? { ...f, videoId: e.target.value } : null)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm"
                                />
                              </div>
                              {isModule && editingClassForm.level != null && (
                                <>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Nivel (1-10)</label>
                                    <select
                                      value={editingClassForm.level}
                                      onChange={(e) => setEditingClassForm((f) => f ? { ...f, level: Number(e.target.value) } : null)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm"
                                    >
                                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                                        <option key={n} value={n}>{n}</option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="md:col-span-2">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Materiales</label>
                                    <div className="flex flex-wrap gap-3">
                                      {['baston', 'banda elastica', 'banco', 'pelota'].map((mat) => {
                                        const list = editingClassForm.materials || [];
                                        const checked = list.includes(mat);
                                        return (
                                          <label key={mat} className="flex items-center gap-1.5 text-sm text-black">
                                            <input
                                              type="checkbox"
                                              checked={checked}
                                              onChange={() => setEditingClassForm((f) => {
                                                if (!f) return null;
                                                const next = checked ? list.filter((x) => x !== mat) : [...list, mat];
                                                return { ...f, materials: next };
                                              })}
                                              className="rounded border-gray-300 text-orange-600"
                                            />
                                            <span className="capitalize">{mat}</span>
                                          </label>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </>
                              )}
                              {!isModule && (
                                <>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Tipo (filtro)</label>
                                    <select
                                      value={editingClassForm.type ?? ''}
                                      onChange={(e) => setEditingClassForm((f) => f ? { ...f, type: e.target.value } : null)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm"
                                    >
                                      <option value="">Seleccionar tipo</option>
                                      {(classFilters[0]?.values ?? []).map((v: { value: string; label: string }) => (
                                        <option key={v.value} value={v.value}>{v.label}</option>
                                      ))}
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Tags (separados por comas)</label>
                                    <input
                                      type="text"
                                      value={editingClassForm.tags ?? ''}
                                      onChange={(e) => setEditingClassForm((f) => f ? { ...f, tags: e.target.value } : null)}
                                      placeholder="Ej: principiante, fuerza"
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm"
                                    />
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                          </SortableContentCard>
                        );
                      }
                      return (
                        <SortableContentCard
                          key={contentIndex}
                          weekIndex={weekIndex}
                          contentIndex={contentIndex}
                          reorderContent={reorderContent}
                          draggingContent={draggingContent}
                          setDraggingContent={setDraggingContent}
                        >
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-black">Clase creada en este camino (solo visible al publicar última semana)</span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => startEditCreatedClass(weekIndex, contentIndex)}
                                className="inline-flex items-center gap-1 px-2 py-1.5 text-[#4F7CCF] hover:bg-[#4F7CCF]/10 rounded-lg text-sm font-medium"
                                title="Editar clase"
                              >
                                <PencilSquareIcon className="w-4 h-4" />
                                Editar clase
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteCreatedClassAndRemove(weekIndex, contentIndex)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-full"
                                title="Eliminar clase de la base de datos y quitar del contenido"
                              >
                                <XMarkIcon className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                          <div className="text-black">
                            <p className="font-medium">{content.videoName || 'Clase'}</p>
                            {content.createdClassDescription && (
                              <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{content.createdClassDescription}</p>
                            )}
                          </div>
                        </div>
                        </SortableContentCard>
                      );
                    }
                    return (
                    <SortableContentCard
                      key={contentIndex}
                      weekIndex={weekIndex}
                      contentIndex={contentIndex}
                      reorderContent={reorderContent}
                      draggingContent={draggingContent}
                      setDraggingContent={setDraggingContent}
                    >
                    <div className="p-4 bg-white rounded-lg border border-gray-200">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-medium text-gray-700">Contenido {contentIndex + 1}</span>
                        <div className="flex items-center gap-3">
                          <label className="text-xs font-medium text-black">Tipo:</label>
                          <select
                            value={tipo}
                            onChange={(e) => updateContent(weekIndex, contentIndex, 'contentType', e.target.value as ContentType)}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg text-gray-900 text-sm"
                          >
                            <option value="moduleClass">Clase de módulo</option>
<option value="individualClass">Clase individual</option>
                            <option value="audio">Audio</option>
                            <option value="zoomEvent">Clase en vivo (Zoom)</option>
                        </select>
                          {tipo === 'zoomEvent' && (
                            <button
                              type="button"
                                onClick={() => {
                                  setReplaceEventModal({ weekIndex, contentIndex, eventName: content.videoName || 'Clase en vivo' });
                                  setReplaceModalSelectedId('');
                                  setReplaceModalMode('select');
                                  setReplaceModalCreateForm({ name: '', description: '', videoUrl: '', type: '' });
                                  setReplaceModalError(null);
                                }}
                              className="inline-flex items-center gap-1 px-2 py-1.5 text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-lg text-sm font-medium"
                              title="Reemplazar por la clase individual (grabación)"
                            >
                              <ArrowPathIcon className="w-4 h-4" />
                              Cambiar por grabación
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeContent(weekIndex, contentIndex)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Quitar contenido"
                          >
                            <XMarkIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {tipo === 'moduleClass' && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <span className="text-xs font-medium text-black">Origen:</span>
                            <label className="flex items-center gap-1">
                              <input type="radio" name={`moduleSource-${weekIndex}-${contentIndex}`} checked={(content.moduleClassSource || 'existing') === 'existing'} onChange={() => updateContent(weekIndex, contentIndex, 'moduleClassSource', 'existing')} className="text-orange-600" />
                              <span className="text-sm text-black">Usar clase existente</span>
                            </label>
                            <label className="flex items-center gap-1">
                              <input type="radio" name={`moduleSource-${weekIndex}-${contentIndex}`} checked={(content.moduleClassSource || 'existing') === 'new'} onChange={() => updateContent(weekIndex, contentIndex, 'moduleClassSource', 'new')} className="text-orange-600" />
                              <span className="text-sm text-black">Crear clase nueva</span>
                            </label>
                          </div>
                          {(content.moduleClassSource || 'existing') === 'existing' && (
                            <div className="grid md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Módulo *</label>
                                <select value={content.moduleId} onChange={(e) => updateContent(weekIndex, contentIndex, 'moduleId', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm">
                                  <option value="">Seleccionar módulo</option>
                                  {classModules.map((m) => (<option key={m._id} value={m._id}>{m.name}</option>))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Submódulo *</label>
                                <select value={content.submoduleSlug || (content.submoduleName ? content.submoduleName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : '')} onChange={(e) => { const slug = e.target.value; const mod = classModules.find((m) => m._id === content.moduleId); const sub = mod?.submodules?.find((s) => (s.slug || '') === slug); updateContent(weekIndex, contentIndex, 'submoduleSlug', slug); updateContent(weekIndex, contentIndex, 'submoduleName', sub?.name || slug); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm">
                                  <option value="">Seleccionar</option>
                                  {content.moduleId && (() => { const mod = classModules.find((m) => m._id === content.moduleId); const subs = mod?.submodules || []; return (<><option value={NO_SUBMODULE_SLUG}>Clases del módulo</option>{subs.map((s) => (<option key={s.slug || s.name} value={s.slug || (s.name || '').toLowerCase().replace(/\s+/g, '-')}>{s.name}</option>))}</>); })()}
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Clase *</label>
                                <select value={content.moduleClassId || ''} onChange={(e) => { const id = e.target.value; const slug = (content.submoduleSlug || content.submoduleName || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || NO_SUBMODULE_SLUG; const list = moduleClassesCache[`${content.moduleId}|${slug}`] || []; const cls = list.find((x) => x._id === id); setWeeks((prev) => { const next = [...prev]; const contents = [...(next[weekIndex].contents || [])]; contents[contentIndex] = { ...contents[contentIndex], moduleClassId: id, ...(cls ? { videoUrl: cls.videoUrl || '', videoName: cls.name, level: cls.level ?? contents[contentIndex].level } : {}) }; next[weekIndex] = { ...next[weekIndex], contents }; return next; }); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm">
                                  <option value="">Seleccionar clase</option>
                                  {content.moduleId && (moduleClassesCache[`${content.moduleId}|${(content.submoduleSlug || content.submoduleName || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || NO_SUBMODULE_SLUG}`] || []).map((cls) => (<option key={cls._id} value={cls._id}>{cls.name}</option>))}
                                </select>
                              </div>
                            </div>
                          )}
                          {(content.moduleClassSource || 'existing') === 'new' && (
                            <div className="grid md:grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
                              <div><label className="block text-xs font-medium text-black mb-1">Módulo *</label><select value={content.moduleId} onChange={(e) => updateContent(weekIndex, contentIndex, 'moduleId', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm"><option value="">Seleccionar módulo</option>{classModules.map((m) => (<option key={m._id} value={m._id}>{m.name}</option>))}</select></div>
                              <div>
                                <label className="block text-xs font-medium text-black mb-2">Submódulo</label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                  <button type="button" onClick={() => updateContent(weekIndex, contentIndex, 'submoduleMode', 'existing')} className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${(content.submoduleMode || 'existing') === 'existing' ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-black border-gray-300 hover:bg-gray-100'}`}>Seleccionar existente</button>
                                  <button type="button" onClick={() => updateContent(weekIndex, contentIndex, 'submoduleMode', 'new')} className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${content.submoduleMode === 'new' ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-black border-gray-300 hover:bg-gray-100'}`}>Crear submódulo nuevo</button>
                                </div>
                                {(content.submoduleMode || 'existing') === 'existing' && content.moduleId && (<select value={content.submoduleSlug || ''} onChange={(e) => { const v = e.target.value; const mod = classModules.find((m) => m._id === content.moduleId); const sub = mod?.submodules?.find((s) => (s.slug || '') === v); updateContent(weekIndex, contentIndex, 'submoduleSlug', v); updateContent(weekIndex, contentIndex, 'submoduleName', sub?.name || v); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm"><option value={NO_SUBMODULE_SLUG}>Clases del módulo</option>{classModules.find((m) => m._id === content.moduleId)?.submodules?.map((s) => (<option key={s.slug || s.name} value={s.slug || ''}>{s.name}</option>))}</select>)}
                                {content.submoduleMode === 'new' && content.moduleId && (<div className="flex gap-2"><input type="text" placeholder="Nombre nuevo submódulo" value={newSubmoduleName[`${weekIndex}-${contentIndex}`] || ''} onChange={(e) => setNewSubmoduleName((prev) => ({ ...prev, [`${weekIndex}-${contentIndex}`]: e.target.value }))} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm" /><button type="button" onClick={async () => { const name = newSubmoduleName[`${weekIndex}-${contentIndex}`]?.trim(); if (!name || !content.moduleId) return; try { const created = await addSubmoduleToModule(content.moduleId, name); updateContent(weekIndex, contentIndex, 'submoduleSlug', created.slug); updateContent(weekIndex, contentIndex, 'submoduleName', created.name); setNewSubmoduleName((prev) => ({ ...prev, [`${weekIndex}-${contentIndex}`]: '' })); toast.success('Submódulo creado'); } catch (err: any) { toast.error(err.message); } }} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600">Crear</button></div>)}
                              </div>
                              <div><label className="block text-xs font-medium text-black mb-1">Nombre clase *</label><input type="text" value={content.newModuleClassName || content.videoName || ''} onChange={(e) => updateContent(weekIndex, contentIndex, 'newModuleClassName', e.target.value)} placeholder="Ej: Locomotions básico" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm" /></div>
                              <div><label className="block text-xs font-medium text-black mb-1">Video URL *</label><input type="url" value={content.videoUrl} onChange={(e) => updateContent(weekIndex, contentIndex, 'videoUrl', e.target.value)} placeholder="https://vimeo.com/..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm" /></div>
                              <div><label className="block text-xs font-medium text-black mb-1">Video ID (Vimeo, opcional)</label><input type="text" value={content.videoId || ''} onChange={(e) => updateContent(weekIndex, contentIndex, 'videoId', e.target.value)} placeholder="Ej: 123456789" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm" /></div>
                              <div className="md:col-span-2"><label className="block text-xs font-medium text-black mb-1">Descripción</label><textarea value={content.createdClassDescription ?? content.audioText ?? ''} onChange={(e) => updateContent(weekIndex, contentIndex, 'createdClassDescription', e.target.value)} placeholder="Descripción de la clase" rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm" /></div>
                              <div className="md:col-span-2"><label className="block text-xs font-medium text-black mb-1">Materiales</label><div className="flex flex-wrap gap-3">{['baston', 'banda elastica', 'banco', 'pelota'].map((mat) => { const list = content.newModuleClassMaterials || []; const checked = list.includes(mat); return (<label key={mat} className="flex items-center gap-1.5 text-sm text-black"><input type="checkbox" checked={checked} onChange={() => { const next = checked ? list.filter((x) => x !== mat) : [...list, mat]; updateContent(weekIndex, contentIndex, 'newModuleClassMaterials', next); }} className="rounded border-gray-300 text-orange-600" /><span className="capitalize">{mat}</span></label>); })}</div></div>
                              <div><label className="block text-xs font-medium text-black mb-1">Nivel (1-10)</label><select value={content.level} onChange={(e) => updateContent(weekIndex, contentIndex, 'level', Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm">{[1,2,3,4,5,6,7,8,9,10].map((n) => (<option key={n} value={n}>{n}</option>))}</select></div>
                              <div className="md:col-span-2"><button type="button" disabled={creatingClass === `module-${weekIndex}-${contentIndex}` || !content.moduleId || !(content.newModuleClassName || content.videoName || content.videoUrl)?.trim() || !content.videoUrl?.trim()} onClick={() => createModuleClassAndUse(weekIndex, contentIndex)} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed">{creatingClass === `module-${weekIndex}-${contentIndex}` ? 'Creando...' : 'Crear clase y usar aquí'}</button>{content.moduleClassId && <span className="ml-2 text-sm text-green-600">Clase asignada</span>}</div>
                            </div>
                          )}
                        </div>
                      )}

                      {tipo === 'individualClass' && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <span className="text-xs font-medium text-black">Origen:</span>
                            <label className="flex items-center gap-1"><input type="radio" name={`individualSource-${weekIndex}-${contentIndex}`} checked={(content.individualClassSource || 'existing') === 'existing'} onChange={() => updateContent(weekIndex, contentIndex, 'individualClassSource', 'existing')} className="text-orange-600" /><span className="text-sm text-black">Usar clase existente</span></label>
                            <label className="flex items-center gap-1"><input type="radio" name={`individualSource-${weekIndex}-${contentIndex}`} checked={(content.individualClassSource || 'existing') === 'new'} onChange={() => updateContent(weekIndex, contentIndex, 'individualClassSource', 'new')} className="text-orange-600" /><span className="text-sm text-black">Crear clase nueva</span></label>
                          </div>
                          {(content.individualClassSource || 'existing') === 'existing' && (
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Clase individual *</label>
                              <select
                                value={content.individualClassId || ''}
                                onChange={(e) => {
                                  const id = e.target.value;
                                  const ic = individualClasses.find((x) => x._id === id);
                                  setWeeks((prev) => {
                                    const next = [...prev];
                                    const contents = [...(next[weekIndex].contents || [])];
                                    const current = contents[contentIndex] || {};
                                    contents[contentIndex] = { ...current, individualClassId: id || undefined, videoName: ic?.name ?? current.videoName };
                                    next[weekIndex] = { ...next[weekIndex], contents };
                                    return next;
                                  });
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm"
                              >
                                <option value="">Seleccionar clase individual</option>
                                {individualClasses.map((ic) => (<option key={ic._id} value={ic._id}>{ic.name}</option>))}
                              </select>
                            </div>
                          )}
                          {(content.individualClassSource || 'existing') === 'new' && (
                            <div className="grid md:grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
                              <div><label className="block text-xs font-medium text-gray-600 mb-1">Nombre clase *</label><input type="text" value={content.videoName || ''} onChange={(e) => updateContent(weekIndex, contentIndex, 'videoName', e.target.value)} placeholder="Nombre de la clase" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm" /></div>
                              <div><label className="block text-xs font-medium text-gray-600 mb-1">Video URL (Vimeo) *</label><input type="url" value={content.videoUrl} onChange={(e) => updateContent(weekIndex, contentIndex, 'videoUrl', e.target.value)} placeholder="https://vimeo.com/..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm" /></div>
                              <div className="md:col-span-2"><label className="block text-xs font-medium text-gray-600 mb-1">Descripción *</label><textarea value={content.audioText || ''} onChange={(e) => updateContent(weekIndex, contentIndex, 'audioText', e.target.value)} placeholder="Descripción de la clase" rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm" /></div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Tipo (filtro) *</label>
                                <select value={content.individualClassType ?? ''} onChange={(e) => updateContent(weekIndex, contentIndex, 'individualClassType', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm">
                                  <option value="">Seleccionar tipo</option>
                                  {(classFilters[0]?.values ?? []).map((v: { value: string; label: string }) => (
                                    <option key={v.value} value={v.value}>{v.label}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Tags (separados por comas)</label>
                                <input type="text" value={content.individualClassTags ?? ''} onChange={(e) => updateContent(weekIndex, contentIndex, 'individualClassTags', e.target.value)} placeholder="Ej: principiante, fuerza, movilidad" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm" />
                              </div>
                              <div><button type="button" disabled={creatingClass === `individual-${weekIndex}-${contentIndex}` || !(content.videoName || content.videoUrl)?.trim() || !content.videoUrl?.trim() || !(content.individualClassType ?? '').trim()} onClick={() => createIndividualClassAndUse(weekIndex, contentIndex)} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed">{creatingClass === `individual-${weekIndex}-${contentIndex}` ? 'Creando...' : 'Crear clase y usar aquí'}</button>{content.individualClassId && <span className="ml-2 text-sm text-green-600">Clase asignada</span>}</div>
                            </div>
                          )}
                        </div>
                      )}

                      {tipo === 'zoomEvent' && !(content.moveCrewEventCreatedInPath && content.moveCrewEventId) && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-4">
                            <span className="text-xs font-medium text-black">Origen:</span>
                            <label className="flex items-center gap-1">
                              <input
                                type="radio"
                                name={`zoomSource-${weekIndex}-${contentIndex}`}
                                checked={(zoomEventSourceMode[`${weekIndex}-${contentIndex}`] || (content.moveCrewEventId ? 'existing' : 'existing')) === 'existing'}
                                onChange={() => setZoomEventSourceMode((m) => ({ ...m, [`${weekIndex}-${contentIndex}`]: 'existing' }))}
                                className="text-orange-500"
                              />
                              <span className="text-sm text-black">Seleccionar evento existente</span>
                            </label>
                            <label className="flex items-center gap-1">
                              <input
                                type="radio"
                                name={`zoomSource-${weekIndex}-${contentIndex}`}
                                checked={(zoomEventSourceMode[`${weekIndex}-${contentIndex}`] || 'existing') === 'new'}
                                onChange={() => setZoomEventSourceMode((m) => ({ ...m, [`${weekIndex}-${contentIndex}`]: 'new' }))}
                                className="text-orange-500"
                              />
                              <span className="text-sm text-black">Crear nuevo evento</span>
                            </label>
                          </div>
                          {(zoomEventSourceMode[`${weekIndex}-${contentIndex}`] || (content.moveCrewEventId ? 'existing' : 'existing')) === 'existing' && (
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Evento Move Crew *</label>
                              <select
                                value={content.moveCrewEventId || ''}
                                onChange={(e) => updateContent(weekIndex, contentIndex, 'moveCrewEventId', e.target.value || undefined)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm"
                              >
                                <option value="">Seleccionar evento en vivo</option>
                                {moveCrewEvents.map((ev) => (
                                  <option key={ev._id} value={ev._id}>
                                    {ev.title} — {ev.repeatsWeekly ? `Semanal ${ev.weekday != null ? ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'][ev.weekday] : ''}` : ev.eventDate ? new Date(ev.eventDate).toLocaleDateString('es') : ''} {ev.startTime || ''}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                          {(zoomEventSourceMode[`${weekIndex}-${contentIndex}`] || 'existing') === 'new' && (
                            <div>
                              <button
                                type="button"
                                onClick={() => {
                                  setNewEventForContent({ weekIndex, contentIndex });
                                  setNewEventForm({ title: '', description: '', zoomLink: '', eventDate: '', startTime: '18:00', durationMinutes: 60, repeatsWeekly: false, weekday: 2 });
                                  setNewEventModalOpen(true);
                                }}
                                className="px-4 py-2 border border-orange-500 text-orange-600 rounded-lg text-sm font-medium hover:bg-orange-50"
                              >
                                Crear nuevo evento y usar aquí
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                    </div>
                    </SortableContentCard>
                  ); })}

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

      {newEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-lg font-semibold text-gray-900 font-montserrat mb-4">Nuevo evento Move Crew</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Título *</label>
                <input type="text" value={newEventForm.title} onChange={(e) => setNewEventForm((f) => ({ ...f, title: e.target.value }))} placeholder="Ej: Clase en vivo" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Link Zoom *</label>
                <input type="url" value={newEventForm.zoomLink} onChange={(e) => setNewEventForm((f) => ({ ...f, zoomLink: e.target.value }))} placeholder="https://zoom.us/j/..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Descripción</label>
                <textarea value={newEventForm.description} onChange={(e) => setNewEventForm((f) => ({ ...f, description: e.target.value }))} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="editNewEvRepeat" checked={newEventForm.repeatsWeekly} onChange={(e) => setNewEventForm((f) => ({ ...f, repeatsWeekly: e.target.checked }))} className="rounded border-gray-300 text-orange-500" />
                <label htmlFor="editNewEvRepeat" className="text-sm text-gray-700">Se repite todas las semanas</label>
              </div>
              {newEventForm.repeatsWeekly ? (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Día</label>
                  <select value={newEventForm.weekday} onChange={(e) => setNewEventForm((f) => ({ ...f, weekday: Number(e.target.value) }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm">
                    {[{ value: 0, label: 'Domingo' }, { value: 1, label: 'Lunes' }, { value: 2, label: 'Martes' }, { value: 3, label: 'Miércoles' }, { value: 4, label: 'Jueves' }, { value: 5, label: 'Viernes' }, { value: 6, label: 'Sábado' }].map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Fecha (Uruguay) *</label>
                  <input type="date" value={newEventForm.eventDate} onChange={(e) => setNewEventForm((f) => ({ ...f, eventDate: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm" />
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Hora (Uruguay) *</label>
                  <input type="time" value={newEventForm.startTime} onChange={(e) => setNewEventForm((f) => ({ ...f, startTime: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Duración (min)</label>
                  <input type="number" min={1} max={480} value={newEventForm.durationMinutes} onChange={(e) => setNewEventForm((f) => ({ ...f, durationMinutes: Number(e.target.value) || 60 }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button type="button" onClick={() => { setNewEventModalOpen(false); setNewEventForContent(null); }} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm font-montserrat">Cancelar</button>
              <button
                type="button"
                disabled={creatingEvent || !newEventForm.title.trim() || !newEventForm.zoomLink.trim() || (!newEventForm.repeatsWeekly && !newEventForm.eventDate)}
                onClick={async () => {
                  setCreatingEvent(true);
                  try {
                    const res = await fetch('/api/move-crew-events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ title: newEventForm.title.trim(), description: newEventForm.description.trim(), zoomLink: newEventForm.zoomLink.trim(), eventDate: newEventForm.repeatsWeekly ? null : newEventForm.eventDate || null, startTime: newEventForm.startTime.trim(), durationMinutes: newEventForm.durationMinutes, repeatsWeekly: newEventForm.repeatsWeekly, weekday: newEventForm.repeatsWeekly ? newEventForm.weekday : undefined, timezone: 'America/Montevideo' }) });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error || 'Error al crear');
                    const listRes = await fetch('/api/move-crew-events', { credentials: 'include', cache: 'no-store' });
                    const list = await listRes.json();
                    setMoveCrewEvents(Array.isArray(list) ? list : []);
                    if (newEventForContent && data._id) {
                      setWeeks((prev) => {
                        const next = [...prev];
                        const contents = [...(next[newEventForContent!.weekIndex].contents || [])];
                        const c = contents[newEventForContent!.contentIndex];
                        if (c) {
                          contents[newEventForContent!.contentIndex] = { ...c, moveCrewEventId: data._id, moveCrewEventCreatedInPath: true };
                        }
                        next[newEventForContent!.weekIndex] = { ...next[newEventForContent!.weekIndex], contents };
                        return next;
                      });
                    }
                    toast.success('Evento creado y asignado');
                    setNewEventModalOpen(false);
                    setNewEventForContent(null);
                  } catch (err: any) {
                    toast.error(err.message || 'Error al crear evento');
                  } finally {
                    setCreatingEvent(false);
                  }
                }}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-montserrat disabled:opacity-50"
              >
                {creatingEvent ? 'Creando...' : 'Crear y usar aquí'}
              </button>
            </div>
          </div>
        </div>
      )}

      {replaceEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 font-montserrat mb-2">Cambiar evento por grabación</h3>
            <p className="text-sm text-gray-600 font-montserrat mb-4">
              Reemplazá el evento &quot;{replaceEventModal.eventName || 'Clase en vivo'}&quot; por la clase individual (grabación). La posición y la publicación se mantienen.
            </p>
            <div className="flex gap-2 mb-4 border-b border-gray-200">
              <button
                type="button"
                onClick={() => { setReplaceModalMode('select'); setReplaceModalError(null); }}
                className={`px-3 py-2 text-sm font-medium font-montserrat rounded-t-lg ${replaceModalMode === 'select' ? 'bg-amber-100 text-amber-800 border-b-2 border-amber-500 -mb-px' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Seleccionar existente
              </button>
              <button
                type="button"
                onClick={() => { setReplaceModalMode('create'); setReplaceModalError(null); }}
                className={`px-3 py-2 text-sm font-medium font-montserrat rounded-t-lg ${replaceModalMode === 'create' ? 'bg-amber-100 text-amber-800 border-b-2 border-amber-500 -mb-px' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Crear clase nueva
              </button>
            </div>

            {replaceModalMode === 'select' ? (
              <>
                <label className="block text-xs font-medium text-gray-700 font-montserrat mb-2">Clase individual (grabación) *</label>
                <select
                  value={replaceModalSelectedId}
                  onChange={(e) => setReplaceModalSelectedId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm font-montserrat mb-4"
                >
                  <option value="">Seleccionar clase...</option>
                  {individualClasses.map((cls: { _id: string; name?: string }) => (
                    <option key={cls._id} value={cls._id}>{cls.name || cls._id}</option>
                  ))}
                </select>
              </>
            ) : (
              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 font-montserrat mb-1">Nombre de la clase *</label>
                  <input
                    type="text"
                    value={replaceModalCreateForm.name}
                    onChange={(e) => setReplaceModalCreateForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Ej: Clase en vivo - Grabación"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm font-montserrat"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 font-montserrat mb-1">Descripción *</label>
                  <textarea
                    value={replaceModalCreateForm.description}
                    onChange={(e) => setReplaceModalCreateForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Breve descripción de la clase"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm font-montserrat"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 font-montserrat mb-1">URL o ID de Vimeo *</label>
                  <input
                    type="text"
                    value={replaceModalCreateForm.videoUrl}
                    onChange={(e) => setReplaceModalCreateForm((f) => ({ ...f, videoUrl: e.target.value }))}
                    placeholder="https://vimeo.com/123456789 o 123456789"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm font-montserrat"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 font-montserrat mb-1">Tipo (filtro)</label>
                  <select
                    value={replaceModalCreateForm.type}
                    onChange={(e) => setReplaceModalCreateForm((f) => ({ ...f, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm font-montserrat"
                  >
                    <option value="">Seleccionar tipo</option>
                    {(classFilters[0]?.values ?? []).map((v: { value: string; label: string }) => (
                      <option key={v.value} value={v.value}>{v.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {replaceModalError && (
              <p className="text-sm text-red-600 font-montserrat mb-4">{replaceModalError}</p>
            )}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => { setReplaceEventModal(null); setReplaceModalError(null); }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm font-montserrat hover:bg-gray-50"
              >
                Cancelar
              </button>
              {replaceModalMode === 'select' ? (
                <button
                  type="button"
                  disabled={replaceModalLoading || !replaceModalSelectedId}
                  onClick={async () => {
                    if (!replaceModalSelectedId || !replaceEventModal || !logbookId) return;
                    const { weekIndex, contentIndex } = replaceEventModal;
                    const content = weeks[weekIndex]?.contents?.[contentIndex];
                    if (!content || (content.contentType || '') !== 'zoomEvent') return;
                    setReplaceModalLoading(true);
                    setReplaceModalError(null);
                    try {
                      const res = await fetch('/api/bitacora/replace-event-with-recording', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({
                          logbookId,
                          weekIndex,
                          contentIndex,
                          individualClassId: replaceModalSelectedId,
                        }),
                      });
                      const data = await res.json();
                      if (!res.ok) {
                        setReplaceModalError(data.error || 'Error al reemplazar');
                        return;
                      }
                      const ic = individualClasses.find((c: { _id: string; name?: string; link?: string }) => c._id === replaceModalSelectedId);
                      const link = (ic as { link?: string })?.link && String((ic as { link?: string }).link).trim();
                      const toUrl = (s: string) => (s.startsWith('http') ? s : `https://vimeo.com/${s}`);
                      const videoUrl = link ? toUrl(link) : '';
                      const videoId = link && /^\d+$/.test(link) ? link : link?.match(/(?:vimeo\.com\/)(\d+)/)?.[1];
                      const newItem: WeekContentItem = {
                        ...emptyContentItem(content.orden ?? contentIndex),
                        contentType: 'individualClass',
                        individualClassId: replaceModalSelectedId,
                        videoUrl,
                        videoId: videoId || undefined,
                        videoName: (ic as { name?: string })?.name || content.videoName || '',
                      };
                      setWeeks((prev) => {
                        const next = [...prev];
                        const contents = [...(next[weekIndex].contents || [])];
                        contents[contentIndex] = newItem;
                        next[weekIndex] = { ...next[weekIndex], contents };
                        return next;
                      });
                      setReplaceEventModal(null);
                      toast.success('Evento reemplazado por la grabación. Guardá el camino para persistir los cambios.');
                    } catch (e: any) {
                      setReplaceModalError(e.message || 'Error de conexión');
                    } finally {
                      setReplaceModalLoading(false);
                    }
                  }}
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-montserrat hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {replaceModalLoading ? 'Guardando...' : 'Cambiar por grabación'}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={replaceModalLoading || !replaceModalCreateForm.name.trim() || !replaceModalCreateForm.description.trim() || !replaceModalCreateForm.videoUrl.trim()}
                  onClick={async () => {
                    if (!replaceEventModal || !logbookId) return;
                    const { weekIndex, contentIndex } = replaceEventModal;
                    const content = weeks[weekIndex]?.contents?.[contentIndex];
                    if (!content || (content.contentType || '') !== 'zoomEvent') return;
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
                          userEmail: auth.user?.email,
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
                      setIndividualClasses((prev) => [...(Array.isArray(prev) ? prev : []), { _id: newId, name: created.name }]);

                      const res = await fetch('/api/bitacora/replace-event-with-recording', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({
                          logbookId,
                          weekIndex,
                          contentIndex,
                          individualClassId: newId,
                        }),
                      });
                      const data = await res.json();
                      if (!res.ok) {
                        setReplaceModalError(data.error || 'Error al reemplazar en el camino');
                        return;
                      }
                      const newItem: WeekContentItem = {
                        ...emptyContentItem(content.orden ?? contentIndex),
                        contentType: 'individualClass',
                        individualClassId: newId,
                        videoUrl: videoUrl.trim().startsWith('http') ? videoUrl.trim() : `https://vimeo.com/${videoUrl.trim()}`,
                        videoId: /^\d+$/.test(videoUrl.trim()) ? videoUrl.trim() : videoUrl.trim().match(/(?:vimeo\.com\/)(\d+)/)?.[1],
                        videoName: created.name || name.trim(),
                      };
                      setWeeks((prev) => {
                        const next = [...prev];
                        const contents = [...(next[weekIndex].contents || [])];
                        contents[contentIndex] = newItem;
                        next[weekIndex] = { ...next[weekIndex], contents };
                        return next;
                      });
                      setReplaceEventModal(null);
                      toast.success('Clase creada y reemplazando el evento. Guardá el camino para persistir.');
                    } catch (e: any) {
                      setReplaceModalError(e.message || 'Error');
                    } finally {
                      setReplaceModalLoading(false);
                    }
                  }}
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-montserrat hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {replaceModalLoading ? 'Creando...' : 'Crear clase y usar'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {replicateWeekIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 font-montserrat mb-4">Replicar semana al resto del mes</h3>
            <p className="text-gray-700 font-montserrat text-sm leading-relaxed mb-6">
              ¿Estás seguro que querés cambiar toda la estructura de este mes? Lo que haremos será pisar las otras semanas replicando la semana seleccionada (Semana {weeks[replicateWeekIndex]?.weekNumber ?? replicateWeekIndex + 1}).
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setReplicateWeekIndex(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm font-montserrat hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  const sourceIndex = replicateWeekIndex;
                  const sourceContents = weeks[sourceIndex]?.contents || [];
                  setWeeks((prev) =>
                    prev.map((w, i) =>
                      i === sourceIndex
                        ? w
                        : {
                            ...w,
                            contents: sourceContents.map((c, idx) => ({ ...JSON.parse(JSON.stringify(c)), orden: idx }))
                          }
                    )
                  );
                  setReplicateWeekIndex(null);
                  toast.success('Estructura de la semana replicada en el resto del mes.');
                }}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-montserrat hover:bg-orange-600"
              >
                Sí, replicar
              </button>
            </div>
          </div>
        </div>
      )}
    </AdmimDashboardLayout>
  );
}

