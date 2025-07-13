import { NextResponse } from 'next/server';
import connectDB from '../../../../../config/connectDB';
import Courses from '../../../../../models/courseModel';
import Users from '../../../../../models/userModel';

connectDB();

export async function PUT(req) {
    const { courseId, userId } = await req.json();
  try {
    if (req.method === 'PUT') {
      const dbUser = await Users.findOne({ _id: userId.valueOf() });
      const course = await Courses.findOne({ id: courseId });

      const index = dbUser.courses.findIndex((element) => {
        return element.course.valueOf() === course._id.valueOf();
      });

      dbUser.courses[index].inList = true;

      await dbUser.save();

      return NextResponse.json({ user: dbUser }, { status: 200 })
    } else {
        return NextResponse.json({ error: 'Algo salio mal'}, { status: 401 })
    }
  } catch (err) {
    return NextResponse.json({ error: 'Algo salio mal'}, { status: 401 })
}
};
