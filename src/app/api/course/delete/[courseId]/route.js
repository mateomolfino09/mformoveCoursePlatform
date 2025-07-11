import { NextResponse } from 'next/server';
import Bills from '../../../../../models/billModel';
import User from '../../../../../models/userModel';
import Exam from '../../../../../models/examModel';
import Course from '../../../../../models/courseModel';

import { ObjectId } from 'mongodb';

export async function DELETE(req) {
    try {
    const {
        courseId
        } = await req.json();
    if (req.method === 'DELETE') {

      const exams = await Exam.deleteMany({
        courseId: ObjectId(courseId)
      });

      const users = await User.find({ 'courses.course': courseId })
      .exec();

      users.forEach(async (user) => {
        let courseIndex = user.courses.map(x => x.course).indexOf(courseId)
        user.courses.splice(courseIndex, 1)

        await user.save()
      })

      const course = await Course.deleteOne({
        _id: ObjectId(courseId)
      });

      return NextResponse.json({ message: `Course deleted`, success: true }, { status: 200 })
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json({error: 'error' }, { status: 500 })
  }
}
