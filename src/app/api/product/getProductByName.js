import connectDB from '../../../config/connectDB';
import Product from '../../../models/productModel';

connectDB();

export async function getProductByName(name) {
  try {
    let res = await Product.findOne({url: name})
    const product = JSON.parse(JSON.stringify(res));
    return product;
  } catch (err) {
    }
}