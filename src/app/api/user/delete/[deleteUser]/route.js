import { NextResponse } from 'next/server';
import Bills from '../../../../../models/billModel';
import User from '../../../../../models/userModel';
import { ObjectId } from 'mongodb';

export async function DELETE(req) {
    try {
    const {
        userId
        } = await req.json();
    if (req.method === 'DELETE') {

      const bills = await Bills.deleteMany({
        user: ObjectId(userId)
      });

      const user = await User.deleteOne({
        _id: ObjectId(userId)
      });
      return NextResponse.json({ message: `User deleted` }, { status: 200 }, { success: true })
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json({error: 'error' }, { status: 500 })
  }
}
