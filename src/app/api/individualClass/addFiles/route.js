import { verify } from 'jsonwebtoken';
import connectDB from '../../../../config/connectDB';
import IndividualClass from '../../../../models/individualClassModel';
import User from '../../../../models/userModel';
import { NextResponse } from 'next/server';

connectDB();

export async function PUT(req) {
    const {
        dataFiles, userId, claseId
        } = await req.json();  
  const MAX_FILES = 5
  try { 
      if (req.method === 'PUT') {
          const user = await User.findOne({ _id: userId });
          const clase = await IndividualClass.findOne({ id: claseId });
          
          if(user.rol != 'Admin') return NextResponse.json({ error: 'Usted no puede agregar archivos' }, { status: 422 })
          if(clase?.atachedFiles?.length >= MAX_FILES || clase?.atachedFiles?.length + dataFiles.length >= MAX_FILES) 
            return NextResponse.json({ error: `No puedes agregar más de ${MAX_FILES} archivos` }, { status: 422 })

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
          
          console.log(clase.atachedFiles) 
          return NextResponse.json({ clase: clase, success: true }, { status: 200 })


    } else {
        return NextResponse.json({ error: 'Algo salio mal' }, { status: 401 })
    }
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: 'Algo salio mal' }, { status: 401 })
}
};
