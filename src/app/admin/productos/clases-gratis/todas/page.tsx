import connectDB from '../../../../../config/connectDB';
import Product from '../../../../../models/productModel';
import CourseClass from '../../../../../models/courseClassModel';
import FreeSequentialProductsList from '../../../../../components/PageComponent/Products/FreeSequentialProductsList';

export const dynamic = 'force-dynamic';

export default async function Page() {
  await connectDB();

  const products = await Product.find({ tipo: 'clases_gratuitas_secuenciales' })
    .sort({ createdAt: -1 })
    .lean();

  const productsJson = JSON.parse(JSON.stringify(products)) as Array<{
    _id: string;
    nombre: string;
    descripcion: string;
    createdAt: string;
    secuenciaConfig?: { slug?: string; publicado?: boolean };
  }>;

  const classCounts = await Promise.all(
    productsJson.map((product) => CourseClass.countDocuments({ productId: product._id }))
  );

  const productsWithCounts = productsJson.map((product, index) => ({
    ...product,
    classCount: classCounts[index],
  }));

  return <FreeSequentialProductsList products={productsWithCounts} />;
}
