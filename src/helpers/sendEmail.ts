import mailchimp from '@mailchimp/mailchimp_transactional';

interface Options {
  to: any;
  subject: string;
  title: string
  content: string
  name: string
  message: string
}

const mailchimpClient = mailchimp(process.env.MAILCHIMP_TRANSACTIONAL_API_KEY ? process.env.MAILCHIMP_TRANSACTIONAL_API_KEY : "");

const CONTACT_MESSAGE_FIELDS: any = {
  title: '',
  name: '',
  content: '',
  message: '',
  subject: 'Asunto:'
};

const generateEmailContent = (data: any) => {
  const stringData = Object.entries(data).reduce(
    (str, [key, val]) =>
      (str += `${CONTACT_MESSAGE_FIELDS[key]}: \n${val} \n \n`),
    ''
  );

  const htmlData = Object.entries(data).reduce((str, [key, val]) => {
    return (str += `<h3 class="form-heading" align="left">${CONTACT_MESSAGE_FIELDS[key]}</h3><p class="form-answer" align="left">${val}</p>`);
  }, '');

  // Paleta tailwind: ink #141411, stone #787867, cream/white #FAF8F4, teal #074647
  const ink = '#141411';
  const stone = '#787867';
  const cream = '#FAF8F4';
  const teal = '#074647';
  const font = "'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif";

  return {
    text: stringData,
    html: `<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@300;400;500&display=swap" rel="stylesheet"/><style type="text/css">body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;font-family:${font};font-weight:300;}table{border-collapse:collapse !important;}body{margin:0;padding:0;width:100%;background:${cream};}.form-heading{color:${ink};font-size:17px;font-weight:500;line-height:22px;margin:0 0 6px;}.form-answer{color:${stone};font-size:15px;line-height:22px;margin:0 0 20px;}</style></head><body style="margin:0;padding:0;background:${cream};font-family:${font};font-weight:300;"><table border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td align="center" style="padding:24px 16px;"><table border="0" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;background:${cream};border-radius:12px;"><tr><td style="padding:24px 20px;font-size:15px;line-height:24px;color:${ink};"><div>${htmlData}</div></td></tr></table></td></tr></table></body></html>`
  };
};

export const sendEmail = async (options: Options) => {
  const email = process.env.EMAIL_FROM;
  const name = process.env.EMAIL_FROM_NAME;
  const mailOptions: any = {
    from_email: email,
    from_name: name,
    to: options.to,
    ...generateEmailContent(options),
    subject: options.subject
  };

  const response = await mailchimpClient.messages.send({
    message: {
      ...mailOptions,
    },
  });

  return response;
};
