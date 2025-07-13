import { verify } from 'jsonwebtoken';
import connectDB from '../../../../../../config/connectDB';
import Course from '../../../../../../models/courseModel';
import User from '../../../../../../models/userModel';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

connectDB();

export async function POST(req) {
  try {
    const { actualTime, email, courseId, classId } = await req.json();
    if (req.method === 'POST' && actualTime != undefined) {
      const userToken= cookies().get('userToken').value;

      const data =  verify(userToken, process.env.NEXTAUTH_SECRET)

      const user = await User.findOne({ _id: data.userId });
      const course = await Course.findOne({ id: courseId });

      const coursecourse = course._id.valueOf();

      const index = user.courses.findIndex(
        (course) => course.course.valueOf() == coursecourse
      );
      user.courses[index].classes[classId - 1].actualTime = actualTime;
      await user.save();
      return NextResponse.json({ user }, { status: 200 })

    } else {
      return NextResponse.json({ error: 'Algo salio mal'}, { status: 401 })

    }
  } catch (err) {
    return NextResponse.json({ error: 'Algo salio mal'}, { status: 401 })
}
};
