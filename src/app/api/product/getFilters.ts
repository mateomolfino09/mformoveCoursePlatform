
import connectDB from '../../../config/connectDB';
import ProductFilters from '../../../models/productFiltersModel';

connectDB();

export async function getProductFilters() {
  try {
    const res = await ProductFilters.find({})
      .lean()
      .exec();
    const productFilters = JSON.parse(JSON.stringify(res));
    return productFilters;
  } catch (err) {
    console.error('Error getting product filters:', err);
    return []; // Retornar array vacío en caso de error
  }
}
