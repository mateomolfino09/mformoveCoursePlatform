'use server';
import { revalidateTag } from 'next/cache';

export default async function action() {
  revalidateTag('plans');  // Invalidar la cache relacionada con 'plans'
  revalidateTag('classes');  // Invalidar la cache relacionada con 'classes'
  revalidateTag('products');  // Invalidar la cache relacionada con 'classes'
  revalidateTag('classFilters');
  revalidateTag('faqs');
}
