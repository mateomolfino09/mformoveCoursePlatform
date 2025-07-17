import EditProduct from '../../../../../components/PageComponent/Products/EditProduct';
import connectDB from '../../../../../config/connectDB';
import Product from '../../../../../models/productModel';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface Props {
  params: {
    id: string;
  };
}

export default async function Page({ params }: Props) {
  connectDB();
  
  try {
    const product = await Product.findById(params.id);
    
    if (!product) {
      notFound();
    }

    // Convertir el objeto de Mongoose a JSON para evitar problemas de serialización
    const productJson = JSON.parse(JSON.stringify(product));

    return <EditProduct product={productJson} />;
  } catch (error) {
    console.error('Error fetching product:', error);
    notFound();
  }
} 