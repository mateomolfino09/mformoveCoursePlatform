import { NextResponse } from 'next/server';
import connectDB from '../../../../config/connectDB';
import Courses from '../../../../models/courseModel';
import Users from '../../../../models/userModel';

connectDB();

export async function PUT(req) {
    const { courseId, userId } = await req.json();
  try {
    if (req.method === 'PUT') {
      const course = await Courses.findOne({ id: courseId });

      const dbUser = await Users.findOne({ _id: userId.valueOf() });

      course.likes++;

      await course.save();

      const index = dbUser.courses.findIndex((element) => {
        return element.course.valueOf() === course._id.valueOf();
      });

      dbUser.courses[index].like = true;

      await dbUser.save();
      return NextResponse.json({ message: 'Le has dado like a este curso'}, { status: 200 })
    } else {
        return NextResponse.json({ error: 'Algo salio mal'}, { status: 401 })
    }
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: 'Algo salio mal'}, { status: 401 })
}
};

export default likeCourse;
