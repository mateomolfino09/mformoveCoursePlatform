import connectDB from '../../../../config/connectDB';
import { courseTypeConst } from '../../../../constants/courseType';
import Classes from '../../../../models/classModel';
import Courses from '../../../../models/courseModel';
import Exam from '../../../../models/examModel';
import IndividualClass from '../../../../models/individualClassModel';
import Users from '../../../../models/userModel';
import Product from '../../../../models/productModel';
import getVimeoShowCase from '../getVimeoShowCase';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

connectDB();

export async function PUT(req) {
  try {
    if (req.method === 'PUT') {
      const {
        productId,
        modules,
        updatedClasses
      } = await req.json();




      const editProduct = async () => {
        const findEditProduct = await Product.findOne({id:productId});// Assuming unique IDs

        findEditProduct.modules = modules;
        findEditProduct.classes = updatedClasses
        findEditProduct.save();

        return findEditProduct;
      };
      const product = await editProduct();
      //Traigo clases de YT

      return NextResponse.json(
        { message: 'Product modificado con éxito' , product: product},
        { status: 200 }
      );
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: error }, { status: 401 });
  }
}
