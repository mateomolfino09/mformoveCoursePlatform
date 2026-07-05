import Product from '../models/productModel';
import { formatTitleCaseWords } from './formatDisplayTitle';
import { buildCursoBienvenidaSuccessUrl } from './cursoPaymentUrls';
import { mapOfferBlocksForEmail } from './formatCursoOfferBlocksForEmail';
import { normalizeCursoLandingConfig } from '../types/cursoLanding';
import {
  resolveCursoProductCoverUrl,
  resolveProductImagePublicId,
} from './resolveMediaImageUrl';
import { resolveCourseWelcomeEmailCommunity } from './courseWelcomeEmailCommunity';
import { EmailService } from '../services/email/emailService';
import { coursePaymentDebug, coursePaymentWarn } from './coursePaymentDebug';

export async function sendCourseWelcomeEmail({
  user,
  productId,
}: {
  user: { email?: string; name?: string };
  productId: string;
}): Promise<void> {
  const email = user.email?.trim();
  if (!email) {
    coursePaymentWarn('welcome_email.skip_no_email', { productId });
    return;
  }

  const product = await Product.findById(productId).lean();
  if (!product || product.tipo !== 'curso') {
    coursePaymentWarn('welcome_email.skip_invalid_product', { productId });
    return;
  }

  const origin = process.env.NEXT_PUBLIC_BASE_URL || 'https://mateomove.com';
  const courseName = formatTitleCaseWords(product.nombre || product.name || 'Curso');
  const welcomeUrl = buildCursoBienvenidaSuccessUrl(origin, productId);
  const cursoConfig = normalizeCursoLandingConfig(product.cursoConfig, courseName);
  const offerBlocks = mapOfferBlocksForEmail(cursoConfig.queIncluye?.offerBlocks);
  const incluyeTitulo =
    cursoConfig.queIncluye?.titulo?.trim() || 'Lo que incluye tu curso';
  const community = await resolveCourseWelcomeEmailCommunity(product);
  const imagePublicId = resolveProductImagePublicId(product);
  const coverImageUrl = resolveCursoProductCoverUrl(product);

  coursePaymentDebug('welcome_email.cover_image', {
    productId,
    imagePublicId: imagePublicId || '(default)',
    coverImageUrl,
  });

  const emailService = EmailService.getInstance();

  try {
    await emailService.sendWelcomeCourse({
      email,
      name: user.name || 'Mover',
      courseName,
      welcomeUrl,
      coverImageUrl,
      offerBlocks,
      incluyeTitulo,
      whatsappInviteUrl: community.whatsappInviteUrl,
      mateoWhatsappUrl: community.mateoWhatsappUrl,
      mateoCtaTexto: cursoConfig.whatsapp?.ctaTexto?.trim() || 'Escribirme por WhatsApp',
      mentoriaUrl: community.mentoriaUrl,
      proximoEncuentro: community.proximoEncuentro,
    });
    coursePaymentDebug('welcome_email.sent', { productId, email });
  } catch (error) {
    coursePaymentWarn('welcome_email.failed', { productId, email, error });
  }
}
