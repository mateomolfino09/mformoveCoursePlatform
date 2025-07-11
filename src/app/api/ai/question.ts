import type { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";
import { Configuration, OpenAIApi } from 'openai'

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

type Data = {
    name: string
}

export default async function POST (request: NextApiRequest) {
    try {
        const response = await openai.createCompletion({
            prompt: 'Dame un chiste para programador',
            model: 'text-davinci-003',
            temperature: 0.7,
            max_tokens: 60,
        })
        return NextResponse.json({ message: 'hola'})
    } catch (error: any) {
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