import mongoose from 'mongoose';

let isConnected = false; // Variable de estado para la conexión

const connectDB = async () => {
  if (isConnected) {
    console.log('Ya existe una conexión activa a MongoDB.');
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    isConnected = db.connections[0].readyState;
    console.log('Conectado a MongoDB.');
  } catch (error) {
    console.error('Error conectando a MongoDB:', error);
    throw error;
  }
};

export default connectDB;
