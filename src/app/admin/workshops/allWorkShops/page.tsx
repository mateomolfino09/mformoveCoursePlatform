import { WorkShopDB } from "../../../../../typings";
import AllWorkShops from "../../../../components/PageComponent/Workshops/AllWorkShops";
import { getWorkShops } from '../../../api/workShop/getWorkShops';

   
export default async function Page() {

    const workshops: WorkShopDB[] = await getWorkShops();

return (
    <AllWorkShops workShops={workshops} />
);
};