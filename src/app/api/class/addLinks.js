import { verify } from 'jsonwebtoken';
import connectDB from '../../../config/connectDB';
import Course from '../../../models/courseModel';
import Class from '../../../models/classModel';
import User from '../../../models/userModel';

connectDB();

const addLinks = async (req, res) => {
  const { links, userId, claseId } = req.body;
  const MAX_LINKS = 5
  try { 
      if (req.method === 'PUT') {
          const user = await User.findOne({ _id: userId });
          const clase = await Class.findOne({ _id: claseId });
          
          if(user.rol != 'Admin') return res.status(422).json({ error: 'Usted no puede agregar links' });
          if(clase?.links?.length >= MAX_LINKS || clase?.links?.length + links.length >= MAX_LINKS) 
            return res.status(422).json({ error: `No puedes agregar más de ${MAX_LINKS} links`});

         
          const lastId = clase?.links?.length ? clase?.links?.length : 0;
          !clase.links ? clase.links = [] : null;

          links.forEach((link, index) => {
             clase.links.push({
                id: lastId + index + 1,
                link_url: link
             })
          });
          
          await clase.save()
          
          return res.status(200).send({ clase });


    } else {
      return res.status(401).json({ error: 'Algo salio mal' });
    }
  } catch (err) {
    console.log(err);
    return res.status(401).json({ error: 'Algo salio mal' });
  }
};

export default addLinks;
