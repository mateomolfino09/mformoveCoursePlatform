import Products from '../../components/PageComponent/Products/Products';
import { getProductFilters } from '../api/workShop/getFilters';
import { getWorkShops } from '../api/workShop/getWorkShops';
  
  
  export default async function Page() {

    const workshops = await getWorkShops()
    const filters = await getProductFilters();

  
    return (
      <Products products={workshops} filters={filters}/>
    );
  };
  
  