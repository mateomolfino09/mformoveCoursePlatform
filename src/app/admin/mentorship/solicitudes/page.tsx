"use client";
import React, { useEffect, useState } from "react";
import AdmimDashboardLayout from '../../../../components/AdmimDashboardLayout';
import InfoModal from '../../../../components/InfoModal';
import InfoModalSection from '../../../../components/InfoModalSection';
import InfoModalField from '../../../../components/InfoModalField';
import { toast } from 'react-toastify';

interface Solicitud {
  _id: string;
  nombre: string;
  email: string;
  paisCiudad: string;
  interesadoEn: string[];
  dondeEntrena: string;
  nivelActual: string;
  principalFreno: string;
  porQueElegirme: string;
  whatsapp: string;
  presupuesto: string;
  comentarios?: string;
  estado: string;
  vista: boolean;
  createdAt: string;
}

export default function SolicitudesMentoriaAdmin() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actualizando, setActualizando] = useState<string | null>(null);
  const [detalle, setDetalle] = useState<Solicitud | null>(null);

  // Función para mapear valores de presupuesto a texto legible
  const getPresupuestoText = (presupuesto: string) => {
    switch (presupuesto) {
      case "opcion1":
        return "Mentoría Explorador ($100/mes)";
      case "opcion2":
        return "Mentoría Personalizada ($200 - $300/mes)";
      default:
        return presupuesto;
    }
  };

  // Función para marcar solicitud como vista
  const marcarComoVista = async (id: string) => {
    try {
      const res = await fetch(`/api/mentorship/request/${id}/markAsViewed`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" }
      });
      
      if (res.ok) {
        // Actualizar el estado local
        setSolicitudes((prev) =>
          prev.map((s) => (s._id === id ? { ...s, vista: true } : s))
        );
      }
    } catch (error) {
      console.error('Error al marcar como vista:', error);
    }
  };

  // Función para marcar todas las solicitudes como vistas
  const marcarTodasComoVistas = async () => {
    try {
      const res = await fetch(`/api/mentorship/request/markAllAsViewed`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" }
      });
      
      if (res.ok) {
        // Actualizar el estado local
        setSolicitudes((prev) =>
          prev.map((s) => ({ ...s, vista: true }))
        );
        toast.success("Todas las solicitudes marcadas como vistas");
      }
    } catch (error) {
      console.error('Error al marcar todas como vistas:', error);
      toast.error("Error al marcar como vistas");
    }
  };

  // Función para abrir detalle y marcar como vista
  const abrirDetalle = (solicitud: Solicitud) => {
    setDetalle(solicitud);
    // Marcar como vista si no lo está
    if (!solicitud.vista) {
      marcarComoVista(solicitud._id);
    }
  };

  useEffect(() => {
    fetch("/api/mentorship/request/all", {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setSolicitudes(data.solicitudes || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Error al cargar las solicitudes");
        setLoading(false);
      });
  }, []);

  const cambiarEstado = async (id: string, estado: string) => {
    setActualizando(id);
    setError("");
    try {
      const res = await fetch(`/api/mentorship/request/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado })
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Error al actualizar el estado");
        setActualizando(null);
        return;
      }
      // Siempre actualizar el estado en lugar de eliminar
      setSolicitudes((prev) =>
        prev.map((s) => (s._id === id ? { ...s, estado } : s))
      );
      
      if (estado === "rechazada") {
        toast.success("Solicitud rechazada");
      } else if (estado === "aprobada") {
        toast.success("Solicitud aprobada");
      } else {
        toast.success("Solicitud marcada como pendiente");
      }
    } catch {
      setError("Error de conexión");
    }
    setActualizando(null);
  };

  // Contar solicitudes nuevas
  const solicitudesNuevas = solicitudes.filter(s => !s.vista).length;

  if (loading) return <div className="p-8">Cargando solicitudes...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <AdmimDashboardLayout>
      <div className="p-4 md:p-8 max-w-6xl mx-auto w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Montserrat, sans-serif', color: 'white' }}>
            Solicitudes de Mentoría
          </h1>
          <div className="flex items-center gap-4">
            {solicitudesNuevas > 0 && (
              <>
                <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  {solicitudesNuevas} {solicitudesNuevas === 1 ? 'nueva' : 'nuevas'}
                </div>
                <button
                  onClick={marcarTodasComoVistas}
                  className="bg-[#234C8C] text-white px-4 py-2 rounded-md hover:bg-[#1a3a6b] transition-colors duration-200 text-sm font-medium"
                >
                  Marcar todas como vistas
                </button>
              </>
            )}
          </div>
        </div>
        
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="w-full min-w-[700px] bg-white font-montserrat text-sm md:text-base text-gray-900">
            <thead className="bg-[#234C8C] text-white sticky top-0 z-10">
              <tr>
                <th className="p-3 font-bold w-1/5">Nombre</th>
                <th className="p-3 font-bold w-1/5">Email</th>
                <th className="p-3 font-bold w-1/5">Ubicación</th>
                <th className="p-3 font-bold w-1/10">Estado</th>
                <th className="p-3 font-bold w-1/3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {solicitudes.map((s, idx) => (
                <tr key={s._id} className={`${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} ${!s.vista ? 'border-l-4 border-l-red-500' : ''}`}>
                  <td className="p-3 border-b cursor-pointer underline text-[#234C8C] font-semibold relative" onClick={() => abrirDetalle(s)}>
                    {s.nombre}
                    {!s.vista && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse flex items-center justify-center" style={{ height: '100%' }}>
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      </div>
                    )}
                  </td>
                  <td className="p-3 border-b text-gray-900">{s.email}</td>
                  <td className="p-3 border-b text-gray-900">{s.paisCiudad}</td>
                  <td className="p-3 border-b font-semibold capitalize">
                    <span className={`px-3 py-1.5 rounded-md text-xs font-medium ${s.estado === 'aprobada' ? 'bg-green-100 text-green-700' : s.estado === 'rechazada' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{s.estado}</span>
                  </td>
                  <td className="p-3 border-b">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        className={`px-3 py-1.5 rounded-md disabled:opacity-50 text-xs font-medium transition-colors duration-200 ${
                          s.estado === "aprobada" 
                            ? "bg-green-600 text-white cursor-default" 
                            : "bg-green-500 text-white hover:bg-green-600 shadow-sm"
                        }`}
                        disabled={actualizando === s._id || s.estado === "aprobada"}
                        onClick={() => cambiarEstado(s._id, "aprobada")}
                      >
                        {actualizando === s._id && s.estado === "aprobada" ? "..." : "Aprobar"}
                      </button>
                      <button
                        className={`px-3 py-1.5 rounded-md disabled:opacity-50 text-xs font-medium transition-colors duration-200 ${
                          s.estado === "rechazada" 
                            ? "bg-red-600 text-white cursor-default" 
                            : "bg-red-500 text-white hover:bg-red-600 shadow-sm"
                        }`}
                        disabled={actualizando === s._id || s.estado === "rechazada"}
                        onClick={() => cambiarEstado(s._id, "rechazada")}
                      >
                        {actualizando === s._id && s.estado === "rechazada" ? "..." : "Rechazar"}
                      </button>
                      <button
                        className={`px-3 py-1.5 rounded-md disabled:opacity-50 text-xs font-medium transition-colors duration-200 ${
                          s.estado === "pendiente" 
                            ? "bg-gray-600 text-white cursor-default" 
                            : "bg-gray-500 text-white hover:bg-gray-600 shadow-sm"
                        }`}
                        disabled={actualizando === s._id || s.estado === "pendiente"}
                        onClick={() => cambiarEstado(s._id, "pendiente")}
                      >
                        {actualizando === s._id && s.estado === "pendiente" ? "..." : "Pendiente"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <InfoModal
          isOpen={!!detalle}
          onClose={() => setDetalle(null)}
          title="Detalle de la Solicitud"
          subtitle="Información completa del solicitante"
        >
          {/* Información básica */}
          <InfoModalSection title="Información Personal">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoModalField 
                label="Nombre completo" 
                value={detalle?.nombre || ''} 
                showBorder={false}
              />
              <InfoModalField 
                label="Email" 
                value={detalle?.email || ''} 
                showBorder={false}
              />
            </div>
          </InfoModalSection>

          {/* Información de contacto */}
          <InfoModalSection title="Información de Contacto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoModalField 
                label="WhatsApp" 
                value={detalle?.whatsapp || ''} 
                showBorder={false}
              />
              <InfoModalField 
                label="Ubicación" 
                value={detalle?.paisCiudad || ''} 
                showBorder={false}
              />
            </div>
          </InfoModalSection>

          {/* Intereses */}
          <InfoModalSection title="Intereses">
            <div className="space-y-4">
              <InfoModalField 
                label="¿En qué estás interesad@?" 
                value={detalle?.interesadoEn?.join(', ') || ''} 
              />
            </div>
          </InfoModalSection>

          {/* Entrenamiento actual */}
          <InfoModalSection title="Entrenamiento Actual">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoModalField 
                label="¿Dónde sueles entrenar?" 
                value={detalle?.dondeEntrena || ''} 
              />
              <InfoModalField 
                label="¿En qué punto te encuentras?" 
                value={detalle?.nivelActual || ''} 
              />
            </div>
          </InfoModalSection>

          {/* Motivación y objetivos */}
          <InfoModalSection title="Motivación y Objetivos">
            <div className="space-y-4">
              <InfoModalField 
                label="¿Cuál es tu principal freno para conseguir tus objetivos?" 
                value={detalle?.principalFreno || ''} 
              />
              <InfoModalField 
                label="¿Por qué te gustaría entrenar conmigo?" 
                value={detalle?.porQueElegirme || ''} 
              />
            </div>
          </InfoModalSection>

          {/* Presupuesto */}
          <InfoModalSection title="Presupuesto">
            <div className="space-y-4">
              <InfoModalField 
                label="¿Qué servicios te interesan más?" 
                value={detalle?.presupuesto ? getPresupuestoText(detalle.presupuesto) : ''} 
              />
            </div>
          </InfoModalSection>

          {/* Comentarios adicionales */}
          {detalle?.comentarios && (
            <InfoModalSection title="Comentarios adicionales">
              <InfoModalField 
                label="" 
                value={detalle.comentarios} 
              />
            </InfoModalSection>
          )}

          {/* Estado y fecha */}
          <InfoModalSection title="Estado y Fecha">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-2">Estado actual</p>
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                  detalle?.estado === 'aprobada' ? 'bg-green-100 text-green-700' : 
                  detalle?.estado === 'rechazada' ? 'bg-red-100 text-red-700' : 
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {detalle?.estado}
                </span>
              </div>
              <InfoModalField 
                label="Fecha de solicitud" 
                value={detalle ? new Date(detalle.createdAt).toLocaleString('es-ES') : ''} 
                showBorder={false}
              />
            </div>
          </InfoModalSection>
        </InfoModal>
      </div>
    </AdmimDashboardLayout>
  );
} 