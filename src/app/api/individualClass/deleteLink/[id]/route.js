import { NextResponse } from 'next/server';
import connectDB from '../../../../../config/connectDB';
import IndividualClass from '../../../../../models/individualClassModel';

connectDB();
export async function DELETE(req) {
  try {
    if (req.method === 'DELETE') {
        const {
        claseId
        } = await req.json(); 
        const indexClass = req.url.lastIndexOf('/');
        const id = req.url.substr(indexClass + 1)
    
      const clase = await IndividualClass.findOne({ id: claseId });

      const index = clase?.links.findIndex((file) => file.id === id)

      clase?.links.splice(index, 1)
      await clase.save()
      return NextResponse.json({ clase: clase, success: false }, { status: 200 })
    }
  } catch (error) {
    return NextResponse.json({ error: error, success: false }, { status: 404 })
  }
}
