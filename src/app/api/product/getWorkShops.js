import connectDB from '../../../config/connectDB';
import Product from '../../../models/productModel';


connectDB();

export async function getProducts() {
  try {
    const res = await Product.find({}).populate('classes');
    const products = JSON.parse(JSON.stringify(res));
    return products;
  } catch (err) {
    console.log(err);
  }
}
