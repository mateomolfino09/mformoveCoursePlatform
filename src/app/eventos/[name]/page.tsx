import connectDB from '../../../config/connectDB';
import Product from '../../../models/productModel';
import { notFound } from 'next/navigation';
import EventDetailPage from '../../../components/PageComponent/Events/EventDetailPage';

// Conectar a la base de datos una sola vez
let isConnected = false;

async function ensureConnection() {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
}

interface Props {
  params: {
    name: string;
  };
}

export default async function EventPage({ params }: Props) {
  // Asegurar conexión a la base de datos
  await ensureConnection();

  // Convertir el nombre de la URL de vuelta al formato original
  const eventName = params.name.replace(/-/g, ' ');

  // Buscar el evento por nombre
  const eventoRaw = await Product.findOne({ 
    nombre: { $regex: new RegExp(eventName, 'i') },
    tipo: 'evento',
    activo: true
  });

  if (!eventoRaw) {
    notFound();
  }

  // Serializar los datos para eliminar referencias circulares de MongoDB
  const evento = JSON.parse(JSON.stringify(eventoRaw));

  return <EventDetailPage evento={evento} />;
} 