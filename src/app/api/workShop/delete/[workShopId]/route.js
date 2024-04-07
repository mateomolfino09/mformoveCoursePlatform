import { NextResponse } from 'next/server';
import Bills from '../../../../../models/billModel';
import User from '../../../../../models/userModel';
import Exam from '../../../../../models/examModel';
import WorkShop from '../../../../../models/workshopModel';

import { ObjectId } from 'mongodb';

export async function DELETE(req) {
    try {
    const {
        workShopId
        } = await req.json();
    if (req.method === 'DELETE') {

    //   const exams = await Exam.deleteMany({
    //     workShopId: ObjectId(workShopId)
    //   });

    //   const users = await User.find({ 'workShops.workShop': workShopId })
    //   .exec();

    //   users.forEach(async (user) => {
    //     let workShopIndex = user.workShops.map(x => x.workShop).indexOf(workShopId)
    //     user.workShops.splice(workShopIndex, 1)

    //     console.log(workShopIndex, user.workShops)

    //     await user.save()
    //   })

      const workShop = await WorkShop.deleteOne({
        _id: ObjectId(workShopId)
      });

      return NextResponse.json({ message: `WorkShop deleted`, success: true }, { status: 200 })
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json({error: 'error' }, { status: 500 })
  }
}
