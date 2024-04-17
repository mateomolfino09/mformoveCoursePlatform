import { NextResponse } from 'next/server';
import Bills from '../../../../../models/billModel';
import User from '../../../../../models/userModel';
import Exam from '../../../../../models/examModel';
import Product from '../../../../../models/productModel';

import { ObjectId } from 'mongodb';

export async function DELETE(req) {
    try {
    const {
        productId
        } = await req.json();
    if (req.method === 'DELETE') {

      const product = await Product.deleteOne({
        _id: ObjectId(productId)
      });

      return NextResponse.json({ message: `Product deleted`, success: true }, { status: 200 })
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json({error: 'error' }, { status: 500 })
  }
}
