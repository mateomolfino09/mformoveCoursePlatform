import mongoose from 'mongoose';

const connection = {};

async function db() {
  if (connection.isConnected) {
    return;
  }
  const db = await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  connection.isConnected = db.connections[0].readyState;
}

const connectDB = () => {
  if (mongoose.connections[0].readyState) {
    console.log('Already connected');
    return;
  }

  mongoose.connect(
    process.env.MONGODB_URI,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true
    },
    (err) => {
      if (err) throw err;
      console.log('Connected to mongodb.');
    }
  );
};

export default connectDB;
export { db };
