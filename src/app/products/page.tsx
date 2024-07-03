import Products from '../../components/PageComponent/Products/Products';
import { getProductFilters } from '../api/product/getFilters';
import { getProducts } from '../api/product/getProducts';
  
  
  export default async function Page() {

    const products = await getProducts()
    const filters = await getProductFilters();

  
    return (
      <Products products={products} filters={filters}/>
    );
  };
  
  