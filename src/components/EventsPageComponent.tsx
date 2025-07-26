'use client';

import React, { useState } from 'react';

interface EventoSimple {
  _id: string;
  nombre?: string;
  descripcion?: string;
  online?: boolean;
  fecha?: string | Date;
}

interface Props {
  eventos: EventoSimple[];
}

const EventsPageComponent: React.FC<Props> = ({ eventos }) => {
  const [filtro, setFiltro] = useState<string>('todos');

  const eventosFiltrados = eventos.filter(evento => {
    if (filtro === 'todos') return true;
    if (filtro === 'online') return evento.online === true;
    if (filtro === 'presencial') return evento.online === false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Eventos</h1>
      
      {/* Filtros simples */}
      <div className="flex justify-center mb-8">
        <div className="flex space-x-4">
          <button
            onClick={() => setFiltro('todos')}
            className={`px-4 py-2 rounded ${filtro === 'todos' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Todos
          </button>
          <button
            onClick={() => setFiltro('online')}
            className={`px-4 py-2 rounded ${filtro === 'online' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Online
          </button>
          <button
            onClick={() => setFiltro('presencial')}
            className={`px-4 py-2 rounded ${filtro === 'presencial' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Presencial
          </button>
        </div>
      </div>

      {/* Lista de eventos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {eventosFiltrados.length > 0 ? (
          eventosFiltrados.map((evento) => (
            <div key={evento._id} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">{evento.nombre || 'Sin nombre'}</h3>
              <p className="text-gray-600 mb-4">{evento.descripcion || 'Sin descripción'}</p>
              <div className="text-sm text-gray-500">
                <p>Modalidad: {evento.online ? 'Online' : 'Presencial'}</p>
                {evento.fecha && (
                  <p>Fecha: {new Date(evento.fecha).toLocaleDateString()}</p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">No hay eventos disponibles</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPageComponent; 