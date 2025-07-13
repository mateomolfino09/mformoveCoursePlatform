import connectDB from '../../../../config/connectDB';
import Class from '../../../../models/classModel';

connectDB();
export default async function handler(req, res) {
  try {
    if (req.method === 'DELETE') {
      const id = req.query.id;
      const { claseId } = req.body;

      const clase = await Class.findOne({ _id: claseId });

      const index = clase.atachedFiles.findIndex((file) => file.id === id)

clase.atachedFiles.splice(index, 1)
      await clase.save()
      return res.status(200).send(clase);
    }
  } catch (error) {
    return res.status(404).json({ error });
  }
}
