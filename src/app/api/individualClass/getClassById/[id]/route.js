import { NextResponse } from 'next/server';
import connectDB from '../../../../../config/connectDB';
import IndividualClass from '../../../../../models/individualClassModel';
import { useSearchParams } from 'next/navigation';

connectDB();
export async function GET(req) {
    try {
    const index = req.url.lastIndexOf('/');
    const subs = req.url.substr(index + 1)
    const claseDB = await IndividualClass.findOne({ id: subs });
    const clase = JSON.parse(JSON.stringify(claseDB));

    // console

    return NextResponse.json({clase: clase, success: true }, { status: 200 })
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: error, success: false }, { status: 404 })

  }
}
