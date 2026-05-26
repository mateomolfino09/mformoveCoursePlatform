import type { Metadata } from 'next';
import connectDB from '../../../config/connectDB';
import { getProductByName } from '../../api/product/getProductByName';
import { ProductDB } from '../../../../typings';
import IndividaulProduct from '../../../components/PageComponent/Products/IndividaulProduct';
import { pageMetadata } from '../../../lib/pageMetadata';

export async function generateMetadata({
  params,
}: {
  params: { name: string };
}): Promise<Metadata> {
  await connectDB();
  const product: ProductDB | null = await getProductByName(params.name);
  if (!product?.name) return pageMetadata('Producto');
  return pageMetadata(product.name);
}

export default async function Page({ params }: { params: { name: string }}) {
    connectDB();
    const { name } = params;
    const product: ProductDB = await getProductByName(name);

  return <IndividaulProduct product={product} />;
}