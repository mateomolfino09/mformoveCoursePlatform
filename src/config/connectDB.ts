import mongoose from 'mongoose';

/**
 * Conecta a la base de datos MongoDB
 * @returns Promise<void>
 * @throws Error si MONGODB_URI no está definida o si hay un error de conexión
 */
const connectDB = async (): Promise<void> => {
  try {
    // Verificar si ya hay una conexión activa
    if (mongoose.connections[0]?.readyState === 1) {
      return;
    }

    // En build de Vercel sin MONGODB_URI no lanzar: permite que el build termine
    if (!process.env.MONGODB_URI) {
      if (process.env.VERCEL) {
        console.warn('connectDB: MONGODB_URI no definida (build o runtime). Configúrala en Vercel.');
        return;
      }
      throw new Error('MONGODB_URI environment variable is not defined');
    }

    // Configurar strictQuery para evitar warnings
    mongoose.set('strictQuery', false);

    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
  } catch (error) {
    console.error('Error conectando a MongoDB:', error);
    // En Vercel build no relanzar para no tumbar el build si la DB no está accesible
    if (process.env.VERCEL && process.env.NODE_ENV === 'production') {
      console.warn('connectDB: conexión fallida durante build, continuando.');
      return;
    }
    throw error;
  }
};

export default connectDB; 