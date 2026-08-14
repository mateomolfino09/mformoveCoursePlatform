import mailchimp from '@mailchimp/mailchimp_marketing';
import { generateMd5 } from '../app/api/helper/generateMd5';

/**
 * Suscribe un lead de clases_gratuitas_secuenciales a la audiencia de rutinas.
 * Una sola audiencia para todos los funnels de Instagram/ManyChat — el tag
 * `instagram_lead` es lo que dispara la automatización del lado de Mailchimp.
 */
export async function subscribeFreeSequentialLead(opts: { email: string; name?: string }) {
  const audienceId = process.env.MAILCHIMP_RUTINAS_AUDIENCE_ID;
  if (!audienceId) return null;

  mailchimp.setConfig({
    apiKey: process.env.MAILCHIMP_API_KEY,
    server: process.env.MAILCHIMP_API_SERVER,
  });

  return mailchimp.lists.setListMember(audienceId, generateMd5(opts.email), {
    email_address: opts.email,
    merge_fields: { FNAME: opts.name || '' },
    status_if_new: 'subscribed',
    status: 'subscribed',
    tags: ['instagram_lead'],
  });
}
