import EditProduct from '../../../../../components/PageComponent/Products/EditProduct';
import connectDB from '../../../../../config/connectDB';
import Product from '../../../../../models/productModel';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: { id: string } }) {
  return (
    <EditProduct productId={params.id} />
  );
} 