import { NextResponse } from 'next/server';
import Bills from '../../../../../models/billModel';
import User from '../../../../../models/userModel';
import Exam from '../../../../../models/examModel';
import IndividualClass from '../../../../../models/individualClassModel';

import { ObjectId } from 'mongodb';

export async function DELETE(req) {
    try {
    const {
        classId
        } = await req.json();
    if (req.method === 'DELETE') {

      const c = await IndividualClass.deleteOne({
        _id: ObjectId(classId)
      });

      return NextResponse.json({ message: `Class deleted`, success: true }, { status: 200 })
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json({error: 'error' }, { status: 500 })
  }
}
