import mongoose from 'mongoose';
import connectDB from '../../../config/connectDB';
import User from '../../../models/userModel';

connectDB();

/**
 * Convierte un documento MongoDB a un objeto serializable.
 * @param doc Documento MongoDB.
 * @returns Objeto serializable.
 */
function serializeDocument(doc: any) {
  const serializedDoc = { ...doc };
  for (const key in serializedDoc) {
    if (serializedDoc[key] instanceof mongoose.Types.ObjectId) {
      serializedDoc[key] = serializedDoc[key].toString();
    } else if (typeof serializedDoc[key] === 'object' && serializedDoc[key] !== null) {
      serializedDoc[key] = JSON.parse(JSON.stringify(serializedDoc[key]));
    }
  }
  return serializedDoc;
}

/**
 * Obtiene usuarios confirmados con paginación opcional.
 * @param page Número de página (opcional).
 * @param limit Número de usuarios por página (opcional).
 * @returns Objeto con usuarios y metadatos de paginación.
 */
export async function getConfirmedUsers(page: number = 1, limit: number = 10) {
  try {
    const query = { validEmail: 'yes' };
    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    // Serializa cada usuario para garantizar que sea un objeto plano
    const processedUsers = users.map((user) => serializeDocument(user));

    const total = await User.countDocuments(query);

    return {
      users: processedUsers,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  } catch (err) {
    console.error('Error en getConfirmedUsers:', err);
    return {
      users: [],
      total: 0,
      totalPages: 0,
      currentPage: 1,
    };
  }
}
