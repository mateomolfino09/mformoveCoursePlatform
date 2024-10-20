import connectDB from '../../../../config/connectDB';
import IndividualClass from '../../../../models/individualClassModel';
import Users from '../../../../models/userModel';
import bcrypt from 'bcryptjs';
import Exam from '../../../../models/examModel'
import { courseTypeConst } from '../../../../constants/courseType';
import { NextResponse } from 'next/server';
import getVimeoVideo from '../getVimeoVideo.ts'
import { ObjectId } from 'mongodb';

connectDB();

export async function POST(req) {
    try {
    if (req.method === 'POST') {
      const {
        name,
        image_url,
        totalTime,
        level,
        typeId,
        userEmail,
        description,
        videoId,
        isFree
      } = await req.json();

      console.log(level)

      let user = await Users.findOne({ email: userEmail }); 
      const users = await Users.find({});

      //Es Admin?

      if (user.rol !== 'Admin' || user?.admin?.coursesAvailable <= 0) {
        return NextResponse.json({error: 'Este usuario no tiene permisos para crear un curso'}, { status: 422 })

      }
      user.admin.active = true;

      //Busco video subido a Vimeo

      const vimeoVideo = await getVimeoVideo(videoId)

      const hours = Math.floor(vimeoVideo.duration / 3600);
      const minutes = Math.floor((vimeoVideo.duration % 3600) / 60);
      const seconds = vimeoVideo.duration % 60;

      const lastClass = await IndividualClass.find().sort({ _id: -1 }).limit(1);

      const newClass = await new IndividualClass({
        id: JSON.stringify(lastClass) != '[]' ? lastClass[0].id + 1 : 1,
        name,
        image_url,
        description,
        totalTime: vimeoVideo.duration.toString(),
        seconds,
        minutes,
        hours,
        level,
        type: typeId,
        isFree: isFree,
        image_base_link: vimeoVideo.pictures.base_link,
        html: vimeoVideo.embed.html,
        link: vimeoVideo.link,

      }).save();

      let notNewClass = await IndividualClass.findOne().skip(9).exec();
      if(notNewClass) {
        notNewClass.new = false
        await notNewClass.save()
      }

      return NextResponse.json({ message: 'Clase individual creada con éxito'}, { status: 200 })
    }
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: error }, { status: 401 })
  }
};

