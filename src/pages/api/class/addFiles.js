import { verify } from 'jsonwebtoken';
import connectDB from '../../../config/connectDB';
import Course from '../../../models/courseModel';
import Class from '../../../models/classModel';
import User from '../../../models/userModel';

connectDB();

const addFiles = async (req, res) => {
  const { dataFiles, userId, claseId } = req.body;
  try { 
      if (req.method === 'PUT') {
          const user = await User.findOne({ _id: userId });
          const clase = await Class.findOne({ id: claseId });
          
          if(user.rol != 'Admin') return res.status(422).json({ error: 'Usted no puede agregar archivos' });
          if(clase?.atachedFiles?.length >= 5) return res.status(422).json({ error: 'No puedes agregar mas recursos' });
          
          const lastId = clase?.atachedFiles?.length ? clase?.atachedFiles?.length : 0;
          console.log(clase.atachedFiles)
          !clase.atachedFiles ? clase.atachedFiles = [] : null;

          dataFiles.forEach((file, index) => {
             clase.atachedFiles.push({
                id: lastId + index,
                name: file.original_filename,
                public_id: file.public_id,
                document_url: file.secure_url
             })
          });
          
          await clase.save()
          
          console.log(clase.atachedFiles) 
          return res.status(200).send({ clase });


    } else {
      return res.status(401).json({ error: 'Algo salio mal' });
    }
  } catch (err) {
    console.log(err);
    return res.status(401).json({ error: 'Algo salio mal' });
  }
};

export default addFiles;
