import connectDB from '../../config/connectDB';
import Product from '../../models/productModel';
import EventsList from '../../components/PageComponent/Eventos/EventsList';

let isConnected = false;
async function ensureConnection() {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
}

export default async function EventsPage() {
  await ensureConnection();

  // Obtener eventos de forma simple
  const now = new Date();
  const eventosRaw = await Product.find({
    tipo: 'evento',
    activo: true,
    // No mostrar finalizados: solo con fecha futura (o sin fecha definida)
    $or: [
      { fecha: { $gte: now } },
      { fecha: { $exists: false } }
    ]
  }).sort({ fecha: 1 }).lean();

  // Asegurar que es un array válido y serializar
  let eventos = [];
  if (Array.isArray(eventosRaw)) {
    eventos = JSON.parse(JSON.stringify(eventosRaw));
  } else if (eventosRaw) {
    // Si viene un solo objeto, lo convertimos en array
    eventos = [JSON.parse(JSON.stringify(eventosRaw))];
  }

  return <EventsList eventos={eventos} />;
}

// Configuración para evitar caché en esta página
export const dynamic = 'force-dynamic';
export const revalidate = 0; 