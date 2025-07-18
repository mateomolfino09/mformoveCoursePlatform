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
  const eventosRaw = await Product.find({
    tipo: 'evento',
    activo: true
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