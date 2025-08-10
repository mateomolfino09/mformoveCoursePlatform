import { NextResponse } from "next/server";
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
    try {
        const response = await openai.chat.completions.create({
            messages: [
                {
                    role: 'user',
                    content: 'Dame un chiste para programador'
                }
            ],
            model: 'gpt-3.5-turbo',
            temperature: 0.7,
            max_tokens: 60,
        });
        
        return NextResponse.json({ 
            message: response.choices[0]?.message?.content || 'No se pudo generar el chiste'
        });
    } catch (error: any) {
        return NextResponse.json({ error: 'Error procesando la solicitud' }, { status: 500 });
    }
}

// export default async function handler(
//     req: NextApiRequest,
//     res: NextApiResponse<any>
// )
// {
//     //     const completion = await openai.createCompletion({
//         model: "text-davinci-003",
//         prompt: 'What is 2 + 2',
//       });
//     const resp = completion.data.choices[0].text
//     //     res.status(200).json({resp})
// }