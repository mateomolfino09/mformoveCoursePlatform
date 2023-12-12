import { NextResponse } from "next/server";

export async function POST(req) {

  const { youtubeURL } = await req.json();
  console.log(youtubeURL)

  try {
    if (req.method === 'POST') {
      const initial = await fetch(youtubeURL);
      console.log(youtubeURL)

      const data = await initial.json();
      return NextResponse.json({ data }, { status: 200 })
    } else {
      return NextResponse.json({error: 'Algo salio mal'}, { status: 401 })
    }
  } catch (err) {
    console.log(err);
    return NextResponse.json({error: 'Algo salio mal'}, { status: 401 })
  }
};
