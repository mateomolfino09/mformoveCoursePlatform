import { ProductDB } from "../../../../../typings";
import AllProducts from "../../../../components/PageComponent/Products/AllProducts";
import { getProducts } from '../../../api/product/getProducts';

   
export default async function Page() {

    const products: ProductDB[] = await getProducts();

return (
    <AllProducts products={products} />
);
};