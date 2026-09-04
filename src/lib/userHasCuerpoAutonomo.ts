import Product from '../models/productModel';
import { userHasCourseAccess } from './courseAccess';
import { CUERPO_AUTONOMO_COURSE_SLUG } from '../constants/mentorshipCuerpoAutonomoDiscount';

type UserWithCourses = {
  rol?: string;
  cursosAdquiridos?: Array<{
    productoId?: { toString(): string } | string;
    status?: 'active' | 'expired' | 'revoked';
    expiresAt?: Date | string | null;
  }>;
};

let cachedProductId: string | null | undefined;

/** Resuelve el productId de Cuerpo Autónomo (cache en memoria del proceso). */
export async function resolveCuerpoAutonomoProductId(): Promise<string | null> {
  if (cachedProductId !== undefined) return cachedProductId;

  const product = await Product.findOne({
    'cursoConfig.slug': CUERPO_AUTONOMO_COURSE_SLUG,
  })
    .select('_id')
    .lean();

  cachedProductId = product?._id ? String(product._id) : null;
  return cachedProductId;
}

export async function userHasCuerpoAutonomo(
  user: UserWithCourses | null | undefined,
): Promise<boolean> {
  if (!user) return false;
  const productId = await resolveCuerpoAutonomoProductId();
  if (!productId) return false;
  return userHasCourseAccess(user, productId);
}
