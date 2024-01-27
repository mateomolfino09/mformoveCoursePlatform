import { NextResponse } from 'next/server';
import connectDB from '../../../../../config/connectDB';
import Plan from '../../../../../models/planModel';
import dLocalApi from '../../dlocalTest';
import { ObjectId } from 'mongodb';

connectDB();
export async function PUT(req) {
    try {
    const {
        planId,
        subscriptionId
        } = await req.json();
    if (req.method === 'PUT') {

    const response = await dLocalApi.patch(`/subscription/plan/${planId}/subscription/${subscriptionId}/deactivate`, {
        planId,
        subscriptionId
        });  
        
    console.log(response)

    const p = await Plan.deleteOne({
    id: planId
    });

    return NextResponse.json({ message: `Plan deleted`, success: true }, { status: 200 })
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json({error: 'error' }, { status: 500 })
  }
}
