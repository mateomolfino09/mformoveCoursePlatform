import connectDB from '../config/connectDB';
import Product from '../models/productModel';
import { resolveActivePrecioPreventa } from './cursoPricing';
import { normalizeCursoLandingConfig } from '../types/cursoLanding';

export type ConfirmPreventaCupoResult = {
  ok: boolean;
  alreadyRedeemed?: boolean;
  cuposUsados?: number;
  cuposLimite?: number;
  reason?: string;
};

function redemptionKey(sessionId?: string | null): string | null {
  const id = sessionId?.trim();
  if (!id) return null;
  return id;
}

/** Incrementa cuposUsados del tier de preventa tras un pago confirmado (idempotente por sessionId). */
export async function incrementCursoPreventaCupo(
  productId: string,
  preventaTierIndex?: number,
  sessionId?: string | null
): Promise<ConfirmPreventaCupoResult> {
  await connectDB();
  const product = await Product.findById(productId);
  if (!product || product.tipo !== 'curso') {
    return { ok: false, reason: 'product_not_found' };
  }
  if (!product.cursoConfig?.preciosPreventa?.length) {
    return { ok: false, reason: 'no_preventa_tiers' };
  }

  const sessionKey = redemptionKey(sessionId);
  if (sessionKey) {
    const redeemed: string[] = product.cursoConfig.preventaRedencionesSessionIds || [];
    if (redeemed.includes(sessionKey)) {
      const tier =
        typeof preventaTierIndex === 'number' && preventaTierIndex >= 0
          ? product.cursoConfig.preciosPreventa[preventaTierIndex]
          : null;
      return {
        ok: true,
        alreadyRedeemed: true,
        cuposUsados: Number(tier?.cuposUsados) || 0,
        cuposLimite: Number(tier?.cuposLimite) || 0,
      };
    }
  }

  const cursoConfig = normalizeCursoLandingConfig(
    product.cursoConfig,
    product.nombre || 'Curso'
  );

  let tierIndex = preventaTierIndex;
  if (tierIndex == null || Number.isNaN(tierIndex)) {
    const active = resolveActivePrecioPreventa(cursoConfig.preciosPreventa);
    if (!active) return { ok: false, reason: 'no_active_tier' };
    tierIndex = cursoConfig.preciosPreventa.findIndex(
      (p) =>
        p.etiqueta === active.etiqueta &&
        p.monto === active.monto &&
        String(p.fechaFin) === String(active.fechaFin)
    );
  }

  if (tierIndex == null || tierIndex < 0) {
    return { ok: false, reason: 'tier_not_found' };
  }

  const tier = product.cursoConfig.preciosPreventa[tierIndex];
  if (!tier) return { ok: false, reason: 'tier_not_found' };

  const limite = Number(tier.cuposLimite) || 0;
  const usados = Number(tier.cuposUsados) || 0;
  if (limite > 0 && usados >= limite) {
    return { ok: false, reason: 'sold_out', cuposUsados: usados, cuposLimite: limite };
  }

  tier.cuposUsados = usados + 1;
  if (sessionKey) {
    if (!product.cursoConfig.preventaRedencionesSessionIds) {
      product.cursoConfig.preventaRedencionesSessionIds = [];
    }
    product.cursoConfig.preventaRedencionesSessionIds.push(sessionKey);
  }
  product.markModified('cursoConfig');
  await product.save();

  return {
    ok: true,
    cuposUsados: tier.cuposUsados,
    cuposLimite: limite,
  };
}
