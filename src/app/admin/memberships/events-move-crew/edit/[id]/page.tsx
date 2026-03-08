'use client';

import AdmimDashboardLayout from '../../../../../../components/AdmimDashboardLayout';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../../../../hooks/useAuth';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const WEEKDAY_OPTIONS = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
];

export default function EditEventMoveCrewPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const auth = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [zoomLink, setZoomLink] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('18:00');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [repeatsWeekly, setRepeatsWeekly] = useState(false);
  const [weekday, setWeekday] = useState(2);

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
    if (id) fetchEvent();
  }, [auth.user, router, id]);

  const fetchEvent = async () => {
    if (!id) return;
    try {
      setFetching(true);
      const res = await fetch(`/api/move-crew-events/${id}`, { credentials: 'include', cache: 'no-store' });
      if (!res.ok) throw new Error('Evento no encontrado');
      const ev = await res.json();
      setTitle(ev.title || '');
      setDescription(ev.description || '');
      setZoomLink(ev.zoomLink || '');
      setEventDate(ev.eventDate ? new Date(ev.eventDate).toISOString().slice(0, 10) : '');
      setStartTime(ev.startTime || '18:00');
      setDurationMinutes(ev.durationMinutes ?? 60);
      setRepeatsWeekly(!!ev.repeatsWeekly);
      setWeekday(ev.weekday != null ? Number(ev.weekday) : 2);
    } catch (e: any) {
      toast.error(e.message || 'Error al cargar evento');
      router.push('/admin/memberships/events-move-crew');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !title.trim() || !zoomLink.trim() || !startTime.trim()) {
      toast.error('Completá título, link de Zoom y hora');
      return;
    }
    if (!repeatsWeekly && !eventDate) {
      toast.error('Para eventos únicos indicá la fecha');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/move-crew-events/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          zoomLink: zoomLink.trim(),
          eventDate: repeatsWeekly ? null : eventDate || null,
          startTime: startTime.trim(),
          durationMinutes: Number(durationMinutes) || 60,
          repeatsWeekly,
          weekday: repeatsWeekly ? weekday : null,
          timezone: 'America/Montevideo',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al actualizar');
      toast.success('Evento actualizado');
      router.push('/admin/memberships/events-move-crew');
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <AdmimDashboardLayout>
        <div className="w-full max-w-2xl mx-auto px-4 py-8">
          <p className="text-gray-500 font-montserrat">Cargando evento...</p>
        </div>
      </AdmimDashboardLayout>
    );
  }

  return (
    <AdmimDashboardLayout>
      <div className="w-full max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/admin/memberships/events-move-crew"
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 font-montserrat">Editar evento Move Crew</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 font-montserrat">Título *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Clase en vivo - Martes"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4F7CCF] focus:border-[#4F7CCF] font-montserrat text-gray-900 bg-white placeholder:text-gray-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 font-montserrat">Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Descripción del evento"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4F7CCF] focus:border-[#4F7CCF] font-montserrat text-gray-900 bg-white placeholder:text-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 font-montserrat">Link de Zoom *</label>
            <input
              type="url"
              value={zoomLink}
              onChange={(e) => setZoomLink(e.target.value)}
              placeholder="https://zoom.us/j/..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4F7CCF] focus:border-[#4F7CCF] font-montserrat text-gray-900 bg-white placeholder:text-gray-500"
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="repeatsWeekly"
              checked={repeatsWeekly}
              onChange={(e) => setRepeatsWeekly(e.target.checked)}
              className="rounded border-gray-300 text-[#4F7CCF] focus:ring-[#4F7CCF]"
            />
            <label htmlFor="repeatsWeekly" className="text-sm font-medium text-gray-700 font-montserrat">
              Se repite todas las semanas
            </label>
          </div>

          {repeatsWeekly ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 font-montserrat">Día de la semana *</label>
              <select
                value={weekday}
                onChange={(e) => setWeekday(Number(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4F7CCF] focus:border-[#4F7CCF] font-montserrat text-gray-900 bg-white"
              >
                {WEEKDAY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 font-montserrat">Fecha (Uruguay) *</label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4F7CCF] focus:border-[#4F7CCF] font-montserrat text-gray-900 bg-white"
                required={!repeatsWeekly}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 font-montserrat">Hora (Uruguay) *</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4F7CCF] focus:border-[#4F7CCF] font-montserrat text-gray-900 bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 font-montserrat">Duración (min)</label>
              <input
                type="number"
                min={1}
                max={480}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value) || 60)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4F7CCF] focus:border-[#4F7CCF] font-montserrat text-gray-900 bg-white"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Link
              href="/admin/memberships/events-move-crew"
              className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 font-montserrat"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-[#4F7CCF] text-white hover:bg-[#234C8C] disabled:opacity-50 font-montserrat font-medium"
            >
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </AdmimDashboardLayout>
  );
}
