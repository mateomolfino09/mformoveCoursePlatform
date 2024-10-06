import type { NextApiResponse } from "next";
import { NextResponse } from "next/server";
import NewsletterUser from '../../../../models/newsletterUser';

export async function POST(req: Request, res: NextApiResponse) {
  const { email } = await req.json();
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const MailchimpKey = process.env.MAILCHIMP_API_KEY;
    const MailchimpServer = process.env.MAILCHIMP_API_SERVER;
    const MailchimpAudience = process.env.MAILCHIMP_RUTINAS_AUDIENCE_ID;

    console.log(MailchimpKey,MailchimpServer,  MailchimpAudience)
  
    const customUrl = `https://${MailchimpServer}.api.mailchimp.com/3.0/lists/${MailchimpAudience}/members`;
  
    const responseNews = await fetch(customUrl, {
      method: "POST",
      headers: {
        Authorization: `apikey ${MailchimpKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address: email,
        merge_fields: {
            FNAME: "",
            LNAME: "",
          },
        status: "subscribed",
        vip: false,
        tags: ["RUTINA"]
      }),
    });

  
    // const lastSub = await NewsletterUser.find().sort({ _id: -1 }).limit(1);
  
    // const newSub = await new NewsletterUser({
    //   id: JSON.stringify(lastSub) != '[]' ? lastSub[0].id + 1 : 1,
    //   name,
    //   email
    // }).save();

    // console.log(newSub)
  
    const received = await responseNews.json();
    console.log(received)

    return NextResponse.json(received);
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: error }, { status: 401 })
  }


}