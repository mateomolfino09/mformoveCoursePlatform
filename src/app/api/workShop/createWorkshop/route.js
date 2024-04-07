import connectDB from '../../../../config/connectDB';
import { courseTypeConst } from '../../../../constants/courseType';
import Classes from '../../../../models/classModel';
import Courses from '../../../../models/courseModel';
import Exam from '../../../../models/examModel';
import IndividualClass from '../../../../models/individualClassModel';
import Users from '../../../../models/userModel';
import WorkShop from '../../../../models/workshopModel';
import getVimeoShowCase from '../getVimeoShowCase';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

connectDB();

export async function POST(req) {
  try {
    if (req.method === 'POST') {
      const {
        name,
        description,
        workShopVimeoId,
        currency,
        price,
        amount,
        userEmail,
        portraitUrl,
        diplomaUrl
      } = await req.json();

      let user = await Users.findOne({ email: userEmail });

      console.log(user);

      //Es Admin?
      if (user.rol !== 'Admin' || user?.admin?.coursesAvailable <= 0) {
        return NextResponse.json(
          { error: 'Este usuario no tiene permisos para crear un workshop' },
          { status: 422 }
        );
      }
      //user?.admin?.active = true;

      const vimeoShowCase = await getVimeoShowCase(workShopVimeoId);

      //const initial = await fetch(youtubeURL);
      //const data = await initial.json();

      var classesArray = [];
      vimeoShowCase?.data?.forEach(async (video, index) => {
        //const lastClass = await IndividualClass.find().sort({ _id: -1 }).limit(1);

        //Por cada video creo una clase
        const newClass = {
          id: index, // JSON.stringify(lastClass) != '[]' ? lastClass[0].id + 1 : 1,
          name: video?.name,
          image_url: video?.uri,
          description,
          totalTime: video.duration.toString(),
          module: 1,
          atachedFiles : [],
          link: video.link,
          class_code: index
        };

        classesArray.push(newClass);
      });

      // UNA VEZ Q TENGO LOS VIDEOS EN UN ARREGLO,M SE LOS MANDO COMO PARAMETRO PARA EL GUARDADO
      

      const newWorkShop = async () => {
        const lastWorkShop = await WorkShop.find().sort({ id: -1 }).limit(1); // Assuming unique IDs

        const id =
          JSON.stringify(lastWorkShop) !== '[]' ? lastWorkShop[0].id + 1 : 1;

        const newWorkshop = await new WorkShop({
          id,
          name: name,
          playlist_code: 1,
          image_url: portraitUrl,
          diploma_url: diplomaUrl,
          description: description,
          created_by: user,
          price,
          vimeoShowCaseId: parseInt(workShopVimeoId, 10),
          currency: currency,
          classes:classesArray,
          classesQuantity: classesArray.length,
          // modules: {
          //   quantity: moduleNumbers.length,
          //   breakPoints: moduleNumbers,
          //   titles: breakpointTitles
          // }
        }).save();

        return NextResponse.json({ message: ' Workshop creado con éxito'}, { status: 200 })
      };
      await newWorkShop();
      //Traigo clases de YT

      return NextResponse.json(
        { message: 'Workshop creado con éxito' },
        { status: 200 }
      );
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: error }, { status: 401 });
  }
}
