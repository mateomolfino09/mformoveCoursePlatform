import mongoose from 'mongoose';

/**
 * Acceso de un usuario a un producto gratuito (clases_gratuitas_secuenciales).
 * Independiente de User.cursosAdquiridos, que es exclusivo del flujo de pago real.
 */
const productAccessSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    grantedAt: { type: Date, default: () => new Date() },
  },
  { timestamps: true }
);

productAccessSchema.index({ userId: 1, productId: 1 }, { unique: true });
productAccessSchema.index({ userId: 1 });

const ProductAccess =
  mongoose.models.ProductAccess || mongoose.model('ProductAccess', productAccessSchema);
export default ProductAccess;
