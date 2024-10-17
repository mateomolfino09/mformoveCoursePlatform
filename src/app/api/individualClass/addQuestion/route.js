import { NextResponse } from 'next/server';
import connectDB from '../../../../config/connectDB';
import IndividualClass from '../../../../models/individualClassModel';
import Question from '../../../../models/questionModel';
import Users from '../../../../models/userModel';
import { prepareEmail } from '../../helper/prepareEmail';

connectDB();

export async function POST(req) {
    try {
    if (req.method === 'POST') {
      const {
        question, userEmail, classId, link 
        } = await req.json(); 

      //Existe?
      let user = await Users.findOne({ email: userEmail });
      const adminUsers = await Users.find({ rol: 'Admin' });
      let clase = await IndividualClass.findOne({ id: classId });

      console.log(user, userEmail)

      const lastQuestion = await Question.find().sort({ _id: -1 }).limit(1);

      const newQuestion = await new Question({
        id: JSON.stringify(lastQuestion) != '[]' ? lastQuestion[0].id + 1 : 1,
        question: question,
        user: user,
        individualClass: clase,
        class: null
      }).save();

      // const titulo = 'Han creado una nueva pregunta'
      // const action = 'Ver Pregunta'
      // const contenido = 'Responde lo antes posible'
      // const subject = 'Han creado una nueva pregunta'

      // await prepareEmail(titulo, link, action, user, contenido, subject)

      return NextResponse.json({ newQuestion: newQuestion, success: true, message: 'Pregunta enviada correctamente' }, { status: 200 })
    }
  } catch (error) {
    console.log(error.message);
    return NextResponse.json({ error: "Error al enviar", success: false }, { status: 500 })

  }
};

