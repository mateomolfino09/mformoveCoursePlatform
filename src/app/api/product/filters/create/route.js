import connectDB from '../../../../../config/connectDB';
import ProductFilters from '../../../../../models/productFiltersModel';
import Users from '../../../../../models/userModel';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

connectDB();

export async function POST(req) {
    try {
    if (req.method === 'POST') {
      const {
        name,
        description,
        values,
        userEmail,
        type,
        question

      } = await req.json();

      let user = await Users.findOne({ email: userEmail }); 
      const users = await Users.find({});

      //Es Admin?

      if (user.rol !== 'Admin' || user?.admin.coursesAvailable <= 0) {
        return NextResponse.json({error: 'Este usuario no tiene permisos para crear un filtro'}, { status: 422 })

      }
      user.admin.active = true;

      //Busco ultimo curso

      const lastFilter = await ProductFilters.find().sort({ _id: -1 }).limit(1);

      console.log(lastFilter)

      if(type === 'multiple') {
        let valuesToAdd = [];
        values.forEach((val, i) => {
          valuesToAdd.push({
            value: val.value,
            id: i + 1,
            description: val.description,
            label: val.label
          })
        });
    
        const newFilter = await new ProductFilters({
          id: JSON.stringify(lastFilter) != '[]' ? lastFilter[0].id + 1 : 1,
          name,
          description,
          values: valuesToAdd,
          type
        }).save();
      }
      else {
        const newFilter = await new ProductFilters({
          id: JSON.stringify(lastFilter) != '[]' ? lastFilter[0].id + 1 : 1,
          name,
          description,
          type,
          question
        }).save();
      }



      return NextResponse.json({ message: 'Filtro para producto creado con éxito'}, { status: 200 })
    }
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: error }, { status: 401 })
  }
};

