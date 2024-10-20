'use server';
import { revalidateTag } from 'next/cache';

export default async function action() {
  revalidateTag('plans');  // Invalidar la cache relacionada con 'plans'
}
