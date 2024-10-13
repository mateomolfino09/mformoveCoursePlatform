import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const db = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Nueva conexión creada con MongoDB.');
    return db;
  } catch (error) {
    console.error('Error conectando a MongoDB:', error);
    throw error;
  }
};

export default connectDB;
