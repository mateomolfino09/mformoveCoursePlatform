import connectDB from '../../../../config/connectDB';
import Class from '../../../../models/classModel';

connectDB();
export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const id = req.query.id;

      const clase = await Class.findOne({ _id: id });
      return res.status(200).send(clase);
    }
  } catch (error) {
    return res.status(404).json({ error });
  }
}
