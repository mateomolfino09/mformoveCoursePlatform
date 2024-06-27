import Bills from '../../../../../models/billModel';
import Exam from '../../../../../models/examModel';
import Product from '../../../../../models/productModel';
import User from '../../../../../models/userModel';
import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';


export async function GET(req, {params}) {
  try {

    if (req.method === 'GET') {

      var {productId} = params;
      const res = await Product.findOne({_id:productId});
      if (!res) {
        return NextResponse.json(
          { message: `Product not found`, success: false },
          { status: 404 }
        );
      }
      const product = JSON.parse(JSON.stringify(res));
      return NextResponse.json({ product ,Message:`Gooood ${product} ` }, {   status: 200 });
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'error' }, { status: 500 });
  }
}
