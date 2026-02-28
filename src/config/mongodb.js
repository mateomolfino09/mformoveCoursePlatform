// This approach is taken from https://github.com/vercel/next.js/tree/canary/examples/with-mongodb
import { MongoClient } from 'mongodb';

// En Vercel build sin MONGODB_URI no lanzar en load: permite que el build termine
const uri = process.env.MONGODB_URI;
if (!uri && !process.env.VERCEL) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const options = {};
let client;
let clientPromise;

if (!uri) {
  clientPromise = Promise.reject(new Error('MONGODB_URI no configurada. Añádela en Vercel > Environment Variables.'));
} else if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;
