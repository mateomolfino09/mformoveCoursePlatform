import connectDB from '../../../../config/connectDB';
import { getProductByName } from "../../../api/product/getProductByName";
import { FreeProduct, ProductDB } from '../../../../../typings';
import SuccessProductPayment from '../../../../components/PageComponent/Products/SuccessPayment';


export default async function Page({ params }: { params: { name: string }}) {
    connectDB();
    const { name } = params;
    const product: ProductDB = await getProductByName(name);

  return <SuccessProductPayment product={product} />;
}