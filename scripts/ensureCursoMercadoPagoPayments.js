/**
 * Backfill: habilita Mercado Pago (+ Stripe) en cursos, genera links MP
 * y alinea el copy de la sección de planes con la venta de mentoría.
 *
 * Uso:
 *   npx tsx scripts/ensureCursoMercadoPagoPayments.js
 *   npx tsx scripts/ensureCursoMercadoPagoPayments.js --slug=cuerpo-autonomo
 *   npx tsx scripts/ensureCursoMercadoPagoPayments.js --dry-run
 *
 * Requiere: MONGODB_URI, MERCADO_PAGO_ACCESS_TOKEN (o equivalente),
 * NEXT_PUBLIC_BASE_URL (o NEXTAUTH_URL). Stripe solo si falta link Stripe.
 */

const COPY_URUGUAY_LATAM =
  'Uruguay y Latinoamérica: Pagá en tu moneda local y aprovechá hasta 12 cuotas con Mercado Pago.';
const COPY_RESTO_MUNDO =
  'Resto del Mundo (Stripe): Pago rápido en USD mediante tarjetas internacionales, Apple Pay o Google Pay.';
const COPY_CUOTAS =
  'Hasta 12 cuotas · Uruguay y Latinoamérica con Mercado Pago';
const IMAGEN_PAGOS_URL = '/images/logos/tarjetasmpstripe2.png';
const IMAGEN_PAGOS_ALT = 'Pagos con Mercado Pago y Stripe.';

async function loadEnv() {
  try {
    const dotenv = await import('dotenv');
    const fs = await import('fs');
    const path = await import('path');
    const envLocalPath = path.resolve(process.cwd(), '.env.local');
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envLocalPath)) dotenv.config({ path: envLocalPath });
    else if (fs.existsSync(envPath)) dotenv.config({ path: envPath });
  } catch {
    // env del sistema
  }
}

function parseArgs(argv) {
  const dryRun = argv.includes('--dry-run');
  const slugArg = argv.find((a) => a.startsWith('--slug='));
  const slug = slugArg ? slugArg.slice('--slug='.length).trim() : null;
  return { dryRun, slug };
}

function hasMercadoPagoOption(opcionesPago) {
  return (opcionesPago || []).some(
    (o) =>
      o?.proveedor === 'mercadopago' &&
      o?.activo !== false &&
      Boolean(o?.paymentLink?.trim() || o?.mercadoPagoPreferenceId),
  );
}

function resolveOrigin() {
  const raw =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXTAUTH_URL ||
    'http://localhost:3000';
  return raw.replace(/\/$/, '');
}

async function main() {
  await loadEnv();
  const { dryRun, slug } = parseArgs(process.argv.slice(2));

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI no está definida');
  }

  const paymentProveedoresMod = await import('../src/constants/paymentProveedores');
  const DEFAULT_PAYMENT_PROVEEDORES =
    paymentProveedoresMod.DEFAULT_PAYMENT_PROVEEDORES ||
    paymentProveedoresMod.default?.DEFAULT_PAYMENT_PROVEEDORES;
  if (!Array.isArray(DEFAULT_PAYMENT_PROVEEDORES)) {
    throw new Error('No se pudo cargar DEFAULT_PAYMENT_PROVEEDORES');
  }

  const lanzamientoMod = await import('../src/lib/ensureCursoLanzamientoPaymentLinks');
  const ensureCursoLanzamientoPaymentLinks =
    lanzamientoMod.ensureCursoLanzamientoPaymentLinks ||
    lanzamientoMod.default?.ensureCursoLanzamientoPaymentLinks;
  const preventaMod = await import('../src/lib/ensureCursoPreventaPaymentLinks');
  const ensureCursoPreventaPaymentLinks =
    preventaMod.ensureCursoPreventaPaymentLinks ||
    preventaMod.default?.ensureCursoPreventaPaymentLinks;
  if (typeof ensureCursoLanzamientoPaymentLinks !== 'function') {
    throw new Error('No se pudo cargar ensureCursoLanzamientoPaymentLinks');
  }
  if (typeof ensureCursoPreventaPaymentLinks !== 'function') {
    throw new Error('No se pudo cargar ensureCursoPreventaPaymentLinks');
  }

  const mongoose = (await import('mongoose')).default;
  mongoose.set('strictQuery', false);
  await mongoose.connect(process.env.MONGODB_URI);

  await import('../src/models/productModel.js');
  const Product = mongoose.models.Product;
  if (!Product) {
    throw new Error('No se pudo registrar el modelo Product');
  }

  const query = { tipo: 'curso', cursoConfig: { $exists: true, $ne: null } };
  if (slug) query['cursoConfig.slug'] = slug;

  const products = await Product.find(query);
  console.log(
    `Cursos encontrados: ${products.length}${slug ? ` (slug=${slug})` : ''}${
      dryRun ? ' [dry-run]' : ''
    }`,
  );

  const origin = resolveOrigin();
  const enabled = [...DEFAULT_PAYMENT_PROVEEDORES];
  let updated = 0;

  for (const product of products) {
    const nombre = product.nombre || product.name || product._id.toString();
    const cursoConfigPlain =
      typeof product.cursoConfig?.toObject === 'function'
        ? product.cursoConfig.toObject()
        : JSON.parse(JSON.stringify(product.cursoConfig || {}));
    const planes = cursoConfigPlain.planes || {};
    const beforeProviders = planes.proveedoresHabilitados || [];
    const hadMp = hasMercadoPagoOption(planes.opcionesPago);

    const preparedConfig = {
      ...cursoConfigPlain,
      planes: {
        ...planes,
        proveedoresHabilitados: enabled,
        copyUruguayLatam: COPY_URUGUAY_LATAM,
        copyRestoMundo: planes.copyRestoMundo?.includes('Stripe')
          ? planes.copyRestoMundo
          : COPY_RESTO_MUNDO,
        copyCuotasTarjeta: COPY_CUOTAS,
        imagenPagosUrl: IMAGEN_PAGOS_URL,
        imagenPagosAlt: IMAGEN_PAGOS_ALT,
      },
    };

    if (dryRun) {
      console.log(`- [dry-run] ${nombre}`, {
        slug: preparedConfig.slug,
        beforeProviders,
        afterProviders: enabled,
        hadMpOption: hadMp,
      });
      continue;
    }

    let nextConfig = await ensureCursoLanzamientoPaymentLinks(
      {
        _id: product._id,
        nombre: product.nombre,
        name: product.name,
        descripcion: product.descripcion,
        description: product.description,
        precio: product.precio,
        moneda: product.moneda,
        portada: product.portada,
        cursoConfig: preparedConfig,
      },
      origin,
    );

    nextConfig = await ensureCursoPreventaPaymentLinks(
      {
        _id: product._id,
        nombre: product.nombre,
        name: product.name,
        descripcion: product.descripcion,
        description: product.description,
        portada: product.portada,
        cursoConfig: nextConfig || preparedConfig,
      },
      origin,
    );

    const finalConfig = nextConfig || preparedConfig;
    // Asegurar prune de dLocal residual aunque ensure no haya regenerado links.
    if (finalConfig.planes?.opcionesPago) {
      finalConfig.planes.opcionesPago = finalConfig.planes.opcionesPago.filter((o) =>
        enabled.includes(o.proveedor),
      );
      finalConfig.planes.proveedoresHabilitados = enabled;
    }

    await Product.updateOne(
      { _id: product._id },
      { $set: { cursoConfig: finalConfig } },
    );

    const afterMp = hasMercadoPagoOption(finalConfig?.planes?.opcionesPago);
    console.log(`✓ ${nombre}`, {
      slug: finalConfig?.slug,
      proveedores: finalConfig?.planes?.proveedoresHabilitados,
      proveedoresOpciones: (finalConfig?.planes?.opcionesPago || []).map(
        (o) => o.proveedor,
      ),
      mercadoPagoOk: afterMp,
    });
    updated += 1;
  }

  console.log(
    dryRun
      ? `Dry-run listo (${products.length} cursos).`
      : `Listo. Actualizados: ${updated}/${products.length}`,
  );

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
