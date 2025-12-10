import mongoose from 'mongoose';

const promocionSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true
    },
    descripcion: {
      type: String,
      trim: true
    },
    porcentajeDescuento: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    frecuenciasAplicables: {
      type: [String],
      required: true,
      enum: ['mensual', 'trimestral', 'ambas'],
      validate: {
        validator: function(v) {
          return v.length > 0;
        },
        message: 'Debe seleccionar al menos una frecuencia'
      }
    },
    fechaInicio: {
      type: Date,
      default: Date.now
    },
    fechaFin: {
      type: Date,
      required: true
    },
    activa: {
      type: Boolean,
      default: true
    },
    codigoPromocional: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      uppercase: true
    },
    stripeCouponId: {
      type: String,
      trim: true
    },
    stripePromotionCodeId: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

// Índice para búsquedas rápidas de promociones activas
promocionSchema.index({ activa: 1, fechaFin: 1 });
promocionSchema.index({ codigoPromocional: 1 });

let Dataset = mongoose.models.Promocion || mongoose.model('Promocion', promocionSchema);
export default Dataset;

