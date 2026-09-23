/**
 * Envía (o reenvía) el email de bienvenida real de un curso a uno o varios usuarios
 * de PRODUCCIÓN, usando el mismo código que dispara fulfillCoursePurchase en una compra
 * real (src/lib/sendCourseWelcomeEmail.ts vía Mailchimp Transactional).
 *
 * Pensado para casos de acceso otorgado a mano (ver scripts/grantCuerpoAutonomoAccessProduction.js)
 * donde se quiere que la bienvenida llegue ya, sin esperar a que el usuario inicie sesión
 * (que es lo que dispara el flujo in-app vía bienvenidaPendiente).
 *
 * Uso:
 *   npx tsx scripts/sendCourseWelcomeEmailProduction.ts cuerpo-autonomo email1@x.com [email2@x.com ...]
 *
 * Requiere en .env: MONGODB_URI_PRODUCTION, MAILCHIMP_TRANSACTIONAL_API_KEY
 */

import 'dotenv/config';

const PRODUCTION_URI = process.env.MONGODB_URI_PRODUCTION;
if (!PRODUCTION_URI) {
  console.error('❌ Falta MONGODB_URI_PRODUCTION en .env');
  process.exit(1);
}
if (PRODUCTION_URI.includes('clustertest')) {
  console.error('❌ MONGODB_URI_PRODUCTION apunta a "clustertest" (dev). Abortando.');
  process.exit(1);
}
// connectDB (src/config/connectDB.ts) lee process.env.MONGODB_URI — lo apuntamos a producción.
process.env.MONGODB_URI = PRODUCTION_URI;

async function main() {
  const [slug, ...emails] = process.argv.slice(2);
  if (!slug || emails.length === 0) {
    console.error('Uso: npx tsx scripts/sendCourseWelcomeEmailProduction.ts <slug-curso> <email> [email2 ...]');
    process.exit(1);
  }

  const connectDB = (await import('../src/config/connectDB')).default;
  const Users = (await import('../src/models/userModel')).default;
  const Product = (await import('../src/models/productModel')).default;
  const { sendCourseWelcomeEmail } = await import('../src/lib/sendCourseWelcomeEmail');

  await connectDB();
  console.log('🔗 Conectado a PRODUCCIÓN');

  const product = await Product.findOne({ 'cursoConfig.slug': slug }).select('_id nombre');
  if (!product) {
    console.error(`❌ No existe en producción el producto de curso "${slug}"`);
    process.exit(1);
  }
  const productId = product._id.toString();
  console.log(`📦 Producto: ${product.nombre} (${productId})`);

  for (const rawEmail of emails) {
    const email = rawEmail.trim().toLowerCase();
    const user = await Users.findOne({ email }).select('email name cursosAdquiridos');
    if (!user) {
      console.error(`⚠️  ${email}: no existe en producción, se omite.`);
      continue;
    }
    const hasAccess = (user.cursosAdquiridos || []).some(
      (entry: any) => entry?.productoId?.toString() === productId
    );
    if (!hasAccess) {
      console.error(`⚠️  ${email}: no tiene acceso otorgado a este curso todavía, se omite.`);
      continue;
    }
    await sendCourseWelcomeEmail({ user: { email: user.email, name: user.name }, productId });
    console.log(`✅ Bienvenida enviada a ${email}`);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
