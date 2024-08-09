import Index from '../../../../components/PageComponent/FreeProducts/Mobility-Articular/Index';
import connectDB from '../../../../config/connectDB';
import endpoints from '../../../../services/api';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getProductById } from "../../../api/freeProduct/viewProduct/getProduct";
import { FreeProduct } from '../../../../../typings';


export default async function Page({ params }: { params: { id: string }}) {
    connectDB();
    const { id } = params;
    console.log(id)
    const product: FreeProduct = await getProductById(id);

  return <Index product={product} />;
}
