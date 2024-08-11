import connectDB from '../../../../config/connectDB';
import FreeProduct from '../../../../models/freeProductModel';

connectDB();

export async function getProductByName(name) {
  try {
    let res = await FreeProduct.findOne({url: name})
    console.log(res, 'product')
    const product = JSON.parse(JSON.stringify(res));
    return product;
  } catch (err) {
    console.log(err);
  }
}
