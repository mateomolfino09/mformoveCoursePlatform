import { verify } from 'jsonwebtoken';
import connectDB from '../../../config/connectDB';
import Class from '../../../models/classModel';
import User from '../../../models/userModel';

connectDB();

const addFiles = async (req, res) => {
  const { dataFiles, userId, claseId } = req.body;
  const MAX_FILES = 5
  try { 
      if (req.method === 'PUT') {
          const user = await User.findOne({ _id: userId });
          const clase = await Class.findOne({ _id: claseId });
          
          if(user.rol != 'Admin') return res.status(422).json({ error: 'Usted no puede agregar archivos' });
          if(clase?.atachedFiles?.length >= MAX_FILES || clase?.atachedFiles?.length + dataFiles.length >= MAX_FILES) 
            return res.status(422).json({ error: `No puedes agregar más de ${MAX_FILES} archivos`});
          
          const lastId = clase?.atachedFiles?.length ? clase?.atachedFiles?.length : 0;
          !clase.atachedFiles ? clase.atachedFiles = [] : null;

          dataFiles.forEach((file, index) => {
             clase.atachedFiles.push({
                id: lastId + index + 1,
                name: file.original_filename,
                public_id: file.public_id,
                document_url: file.secure_url,
                format: file.format,
             })
          });
          
          await clase.save()
          
          return res.status(200).send({ clase });


    } else {
      return res.status(401).json({ error: 'Algo salio mal' });
    }
  } catch (err) {
    return res.status(401).json({ error: 'Algo salio mal' });
  }
};

export default addFiles;
