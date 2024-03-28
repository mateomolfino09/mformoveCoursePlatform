import connectDB from '../../../../config/connectDB';
import { courseTypeConst } from '../../../../constants/courseType';
import Classes from '../../../../models/classModel';
import Courses from '../../../../models/courseModel';
import Exam from '../../../../models/examModel';
import Users from '../../../../models/userModel';
import WorkShops from '../../../../models/workshopModel';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import getVimeoShowCase from '../getVimeoShowCase';
import IndividualClass from '../../../../models/individualClassModel'
connectDB();

export async function POST(req) {
  try {
    if (req.method === 'POST') {
      const { name, description, currency, amount, frequency_type, userEmail } =
        await req.json();

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



      const vimeoShowCase = await getVimeoShowCase("")

      //const initial = await fetch(youtubeURL);
      //const data = await initial.json();


      var arregloDeClases = [];
      vimeoShowCase?.data?.forEach( async (video) => {


      
        //const lastClass = await IndividualClass.find().sort({ _id: -1 }).limit(1);
      
        //Por cada video creo una clase
        const newClass = {
          id:1,// JSON.stringify(lastClass) != '[]' ? lastClass[0].id + 1 : 1,
          name:video?.name,
          image_url:video?.uri,
          description,
          totalTime: video.duration.toString(),
          module:1,
          //atachedFiles : [],
          link: video.link,
        }

        arregloDeClases.push(newClass);

      });
      
  // UNA VEZ Q TENGO LOS VIDEOS EN UN ARREGLO,M SE LOS MANDO COMO PARAMETRO PARA EL GUARDADO
      newWorkShop();

      const newWorkShop = async (
        name = '',
        playlistId = '',
        imgUrl = '',
        courseType = courseTypeConst[0],
        diplomaUrl = null,
        description = '',
        user,
        price = 10,
        currencys = '$',
        cantidadClases = 0,
        moduleNumbers = [],
        breakpointTitles = []
      ) => {
        const lastWorkShop = await WorkShops.find().sort({ id: -1 }).limit(1); // Assuming unique IDs

        const id =
          JSON.stringify(lastWorkShop) !== '[]' ? lastWorkShop[0].id + 1 : 1;

        const newWorkshop = new WorkShops({
          id,
          name:name,
          playlist_code: playlistId,
          image_url: imgUrl,
          diploma_url: courseType !== courseTypeConst[0] ? diplomaUrl : null,
          description:description,
          created_by: user,
          price,
          currency: currency,
          classesQuantity: cantidadClases,
          modules: {
            quantity: moduleNumbers.length,
            breakPoints: moduleNumbers,
            titles: breakpointTitles
          }
        });

        return await newWorkshop.save();
      };


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
