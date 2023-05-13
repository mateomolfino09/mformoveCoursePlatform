import connectDB from '../../../config/connectDB';
import Class from '../../../models/classModel';
import Course from '../../../models/courseModel';
import User from '../../../models/userModel';
import bcrypt from 'bcryptjs';
import { ConnectionPoolClosedEvent } from 'mongodb';

connectDB();

export async function getCourses() {
  try {
    const res = await Course.find({}).populate('classes');
    const courses = JSON.parse(JSON.stringify(res));
    return courses;
  } catch (err) {
    console.log(err);
  }
}
