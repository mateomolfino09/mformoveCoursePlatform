import connectDB from '../../../../../config/connectDB';
import User from '../../../../../models/userModel';
import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';

connectDB();
export async function PUT(req,res) {
  try {
    const { userId, token, productId } = await req.json();
    const user = await User.findOne({
      _id: userId
    });

    
    if(!user){
        return NextResponse.json(
            { error: `No se encontro el user` },
            { status: 401 }
          );
    }
    user.memberShip.token = token;
    user.memberShip.productId = productId;

    await user.save();

    return NextResponse.json(
        { message: `El usuario se actualizo correctamente` },
        { status: 200 }
      );
   
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { error: `Algo salio mal ${err}` },
      { status: 401 }
    );
  }
}
