import mail from '@sendgrid/mail';

mail.setApiKey(process.env.SENDGRID_API_KEY);

export default async function sendMailGrid(name, email, msg, subject) {
  try {
    console.log(process.env.SENDGRID_API_KEY);

    const message = `
        Nombre : ${name} \r\n
        Email : ${email} \r\n
        Subject : ${subject} \r\n
        Mensaje : ${msg} \r\n
        `;

    const data = {
      to: email,
      cc: 'hello@mateomolfino.com',
      bcc: ['mateomolfino09@gmail.com'],
      from: 'mateomolfino09@gmail.com',
      subject: subject,
      text: message,
      html: message.replace(/\r\n/g, '<br>')
    };

    await mail.send(data);
    return 'Ok';
  } catch (error) {
    console.log(error);
    return error;
  }
}
