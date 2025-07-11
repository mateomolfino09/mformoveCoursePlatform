import connectDB from '../../../../config/connectDB';
import { courseTypeConst } from '../../../../constants/courseType';
import Classes from '../../../../models/classModel';
import Courses from '../../../../models/courseModel';
import Exam from '../../../../models/examModel';
import IndividualClass from '../../../../models/individualClassModel';
import Users from '../../../../models/userModel';
import Product from '../../../../models/productModel';
import getVimeoShowCase from '../../product/getVimeoShowCase';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

connectDB();

export async function POST(req) {
  try {
    if (req.method === 'POST') {
      const {
        name,
        description,
        productVimeoId,
        currency,
        price,
        amount,
        userEmail,
        portraitUrl,
        diplomaUrl,
        productType
      } = await req.json();

      let user = await Users.findOne({ email: userEmail });

      //Es Admin?
      if (user.rol !== 'Admin' || user?.admin?.coursesAvailable <= 0) {
        return NextResponse.json(
          { error: 'Este usuario no tiene permisos para crear un producto' },
          { status: 422 }
        );
      }
      //user?.admin?.active = true;

      const vimeoShowCase = await getVimeoShowCase(productVimeoId);

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
          description:"",
          totalTime: video.duration.toString(),
          module: 1,
          atachedFiles : [],
          link: video.link,
          class_code: index
        };

        classesArray.push(newClass);
      });

      // UNA VEZ Q TENGO LOS VIDEOS EN UN ARREGLO,M SE LOS MANDO COMO PARAMETRO PARA EL GUARDADO
      

      const newProduct = async () => {
        const lastProduct = await Product.find().sort({ id: -1 }).limit(1); // Assuming unique IDs

        const id =
          JSON.stringify(lastProduct) !== '[]' ? lastProduct[0].id + 1 : 1;

        const newProduct = await new Product({
          id,
          name: name,
          playlist_code: 1,
          image_url: portraitUrl,
          diploma_url: diplomaUrl,
          description: description,
          created_by: user,
          price,
          vimeoShowCaseId: parseInt(productVimeoId, 10),
          currency: currency,
          classes:classesArray,
          classesQuantity: classesArray.length,
          productType:productType
          // modules: {
          //   quantity: moduleNumbers.length,
          //   breakPoints: moduleNumbers,
          //   titles: breakpointTitles
          // }
        }).save();

        return newProduct;
      };
      const product = await newProduct();

      return NextResponse.json(
        { message: 'Producto creado con éxito' , product: product},
        { status: 200 }
      );
    }
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 401 });
  }
}
