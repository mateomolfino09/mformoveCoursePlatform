'use client';

import AdmimDashboardLayout from '../../../../components/AdmimDashboardLayout';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../../hooks/useAuth';
import Cookies from 'js-cookie';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CalendarDaysIcon,
  ArrowLeftIcon,
  ComputerDesktopIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export interface MoveCrewEventItem {
  _id: string;
  title: string;
  description?: string;
  zoomLink: string;
  eventDate: string | null;
  startTime: string;
  durationMinutes: number;
  repeatsWeekly?: boolean;
  weekday?: number | null;
  timezone?: string;
  createdAt?: string;
}

const WEEKDAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export default function EventsMoveCrewPage() {
  const router = useRouter();
  const auth = useAuth();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<MoveCrewEventItem[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<MoveCrewEventItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const token = Cookies.get('userToken');
    if (!token) {
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
    fetchEvents();
  }, [auth.user, router]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/move-crew-events', { credentials: 'include', cache: 'no-store' });
      if (!res.ok) throw new Error('Error al cargar eventos');
      const data = await res.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch (e: any) {
      toast.error(e.message || 'Error al cargar eventos');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/move-crew-events/${deleteTarget._id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al eliminar');
      }
      toast.success('Evento eliminado');
      setEvents((prev) => prev.filter((e) => e._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (e: any) {
      toast.error(e.message || 'Error al eliminar');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (d: string | null) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('es-UY', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <AdmimDashboardLayout>
      <div className="w-full max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/memberships"
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 font-montserrat">Eventos Move Crew</h1>
              <p className="text-sm text-gray-500 font-montserrat">Clases en vivo (Zoom) para el camino semanal</p>
            </div>
          </div>
          <Link
            href="/admin/memberships/events-move-crew/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#4F7CCF] text-white rounded-xl font-medium hover:bg-[#234C8C] transition-colors font-montserrat"
          >
            <PlusIcon className="w-5 h-5" />
            Crear evento
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Cargando eventos...</div>
        ) : events.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-12 text-center">
            <ComputerDesktopIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-montserrat mb-4">No hay eventos creados aún.</p>
            <Link
              href="/admin/memberships/events-move-crew/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#4F7CCF] text-white rounded-xl font-medium hover:bg-[#234C8C] font-montserrat"
            >
              <PlusIcon className="w-5 h-5" />
              Crear primer evento
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {events.map((ev) => (
              <li
                key={ev._id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-gray-200 bg-white hover:border-gray-300 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900 font-montserrat">{ev.title}</span>
                    {ev.repeatsWeekly && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#4F7CCF]/15 text-[#4F7CCF] font-montserrat">
                        Semanal · {WEEKDAY_NAMES[ev.weekday ?? 0]}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 font-montserrat">
                    {ev.repeatsWeekly ? (
                      <span>{ev.startTime} (Uruguay)</span>
                    ) : (
                      <>
                        <span className="flex items-center gap-1">
                          <CalendarDaysIcon className="w-4 h-4" />
                          {formatDate(ev.eventDate)}
                        </span>
                        <span>{ev.startTime} (Uruguay)</span>
                      </>
                    )}
                    <span>{ev.durationMinutes} min</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/admin/memberships/events-move-crew/edit/${ev._id}`}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-700"
                    title="Editar"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(ev)}
                    className="p-2 rounded-lg border border-red-200 hover:bg-red-50 text-red-600"
                    title="Eliminar"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 font-montserrat mb-2">Eliminar evento</h3>
              <p className="text-gray-600 font-montserrat mb-4">
                ¿Eliminar &quot;{deleteTarget.title}&quot;? Esta acción no se puede deshacer.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 font-montserrat"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 font-montserrat"
                >
                  {deleting ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdmimDashboardLayout>
  );
}
