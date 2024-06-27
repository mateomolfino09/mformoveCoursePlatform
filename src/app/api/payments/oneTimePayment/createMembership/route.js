
import { NextResponse } from 'next/server';
import User from '../../../../../models/userModel'
import Product from '../../../../../models/productModel'

import connectDB from '../../../../../config/connectDB';

connectDB();

export async function PUT(req) {
    const {
        idUser, 
        paymentToken,
        productId
        } = await req.json();  
  try { 
      if (req.method === 'PUT') {
        const user = await User.findOne({ _id: idUser });
        let product = await Product.findOne({_id: user?.memberShip?.productId});
        //Me trae por defecto cuando Id es undefined

        if(!user) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
        }

        if(!product || !user.memberShip?.token) {
            return NextResponse.json({ error: 'No existe token' }, { status: 401 })
        }

  
        product.users.push(user._id.toString())
        
        user.memberShip.token = "";
        user.memberShip.productId = "";//limpio datos para no guardarlos ne objeto 

        await user.save()
        await product.save()

        return NextResponse.json({ success: true, user: user, message: "Subscriptor creado con éxito" }, { status: 200 })


    } else {
        return NextResponse.json({ error: 'Algo salio mal' }, { status: 401 })
    }
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: 'Algo salio mal' }, { status: 401 })
}
};
