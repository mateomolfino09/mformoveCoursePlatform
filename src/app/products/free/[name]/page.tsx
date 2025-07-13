import Index from '../../../../components/PageComponent/FreeProducts/Mobility-Articular/Index';
import connectDB from '../../../../config/connectDB';
import endpoints from '../../../../services/api';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getProductByName } from "../../../api/freeProduct/viewProduct/getProduct";
import { FreeProduct } from '../../../../../typings';


export default async function Page({ params }: { params: { name: string }}) {
    connectDB();
    const { name } = params;
    const product: FreeProduct = await getProductByName(name);

  return <Index product={product} />;
}
