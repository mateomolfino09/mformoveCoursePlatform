import { verify } from 'jsonwebtoken';
import connectDB from '../../../../config/connectDB';
import IndividualClass from '../../../../models/individualClassModel';
import User from '../../../../models/userModel';
import { NextResponse } from 'next/server';

connectDB();

export async function PUT(req) {
  const {
    links, userId, claseId
    } = await req.json(); 
    const MAX_LINKS = 5;
  try { 
      if (req.method === 'PUT') {
          const user = await User.findOne({ _id: userId });
          const clase = await IndividualClass.findOne({ _id: claseId });
          
          if(user.rol != 'Admin') return NextResponse.json({ error: 'Usted no puede agregar links' }, { status: 422 });
          if(clase?.links?.length >= MAX_LINKS || clase?.links?.length + links.length >= MAX_LINKS) 
            return NextResponse.json({ error: `No puedes agregar más de ${MAX_LINKS} links`}, { status: 422 });

         
          const lastId = clase?.links?.length ? clase?.links?.length : 0;
          !clase.links ? clase.links = [] : null;

          links.forEach((link, index) => {
             clase.links.push({
                id: lastId + index + 1,
                link_url: link
             })
          });
          
          await clase.save()
          
          return NextResponse.json({ clase: clase, success: true }, { status: 200 })


    } else {
      return NextResponse.json({ error: 'Algo salio mal' }, { status: 401 })
    }
  } catch (err) {
    return NextResponse.json({ error: 'Algo salio mal' }, { status: 401 })
  }
};

