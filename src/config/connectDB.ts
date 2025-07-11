import mongoose from 'mongoose';

/**
 * Conecta a la base de datos MongoDB
 * @returns Promise<void>
 * @throws Error si MONGODB_URI no está definida o si hay un error de conexión
 */
const connectDB = async (): Promise<void> => {
  try {
    // Verificar si ya hay una conexión activa
    if (mongoose.connections[0].readyState) {
      console.log('MongoDB ya está conectado');
      return;
    }
    
    // Verificar que la variable de entorno esté definida
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }
    
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('MongoDB conectado exitosamente');
  } catch (error) {
    console.error('Error conectando a MongoDB:', error);
    throw error;
  }
};

export default connectDB; 