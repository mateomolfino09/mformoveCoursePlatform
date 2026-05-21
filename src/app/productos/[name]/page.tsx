import Index from '../../../components/PageComponent/FreeProducts/Mobility-Articular/Index';
import connectDB from '../../../config/connectDB';
import endpoints from '../../../services/api';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getProductByName } from "../../api/product/getProductByName";
import { FreeProduct, ProductDB } from '../../../../typings';
import IndividaulProduct from '../../../components/PageComponent/Products/IndividaulProduct';
import getVimeoVideo from '../../api/individualClass/getVimeoVideo';


export default async function Page({ params }: { params: { name: string }}) {
    connectDB();
    const { name } = params;
    const product: ProductDB = await getProductByName(name);

  return <IndividaulProduct product={product} />;
}