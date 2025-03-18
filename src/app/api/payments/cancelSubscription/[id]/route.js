import { NextResponse } from 'next/server';
import connectDB from '../../../../../config/connectDB';
import Plan from '../../../../../models/planModel';
import User from '../../../../../models/userModel';

import dLocalApi from '../../dlocalTest';
import { ObjectId } from 'mongodb';

connectDB();
export async function PUT(req) {
    try {
    const {
        planId,
        subscriptionId,
        id
        } = await req.json();
    if (req.method === 'PUT') {

    const user = await User.findOne({ _id: id })

    console.log(user)

    const response = await dLocalApi.patch(`/subscription/plan/${planId}/subscription/${subscriptionId}/deactivate`, {
        planId,
        subscriptionId
        });  

    console.log(response)
        
    user.subscription ? user.subscription.active = false : null;
    await user.save()

    return NextResponse.json({ message: `Se ha desactivado la subscripcion del usuario`, success: true, user }, { status: 200 })
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json({error: 'error' }, { status: 500 })
  }
}
