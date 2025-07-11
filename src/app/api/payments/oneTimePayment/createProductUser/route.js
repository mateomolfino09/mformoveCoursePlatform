
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
        const product = await Product.findOne({ _id: productId })
        .populate({ path: 'users' })
        .exec();

        if(!user) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
        }


        if(product?.users && product?.users.filter(x => x._id === user._id).length > 0) {
            return NextResponse.json({ error: 'El usuario ya tiene este producto', redirect: true }, { status: 401 })
        }

        if(!product || !user.productToken?.token) {
            return NextResponse.json({ error: 'No existe token' }, { status: 401 })
        }


        if(!product.users || product.users.length <= 0) {
            product.users = []
        }

        product.users.push(user._id.toString())
        
        user.productToken.token = "";
        user.productToken.productId = "";//limpio datos para no guardarlos ne objeto 

        await user.save()
        await product.save()

        return NextResponse.json({ success: true, user, product, message: "Producto usuario creado con éxito" }, { status: 200 })


    } else {
        return NextResponse.json({ error: 'Algo salio mal' }, { status: 401 })
    }
  } catch (err) {
    return NextResponse.json({ error: 'Algo salio mal' }, { status: 401 })
}
};
