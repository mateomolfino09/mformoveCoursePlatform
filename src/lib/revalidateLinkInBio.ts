import { revalidatePath } from 'next/cache';

/** Invalida el HTML cacheado de /bio (y aliases) en Vercel/Next. */
export function revalidateLinkInBio() {
  try {
    revalidatePath('/bio');
    revalidatePath('/links');
    revalidatePath('/link-in-bio');
  } catch (error) {
    console.error('[revalidateLinkInBio]', error);
  }
}
