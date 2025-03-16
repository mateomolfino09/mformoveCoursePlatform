import connectDB from '../../../../../config/connectDB';
import Plan from '../../../../../models/planModel';
import dLocalApi from '../../dlocalConfig';
import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';

connectDB();
export async function DELETE(req) {
  try {
    const { planId } = await req.json();
    if (req.method === 'DELETE') {
      const response = await dLocalApi.patch(
        `/subscription/plan/${planId}/deactivate`,
        {
          planId: planId
        }
      );
      console.log(response);

      const p = await Plan.deleteOne({
        id: planId
      });

      return NextResponse.json(
        { message: `Plan deleted`, success: true },
        { status: 200 }
      );
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'error' }, { status: 500 });
  }
}
