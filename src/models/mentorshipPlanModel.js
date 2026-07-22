const mongoose = require('mongoose');

const mentorshipPlanPagoSchema = new mongoose.Schema({
  proveedor: { type: String, enum: ['stripe', 'dlocalgo', 'mercadopago'], required: true },
  etiqueta: { type: String, default: '' },
  descripcion: { type: String, default: '' },
  monto: { type: Number, default: 0 },
  moneda: { type: String, default: 'USD' },
  paymentLink: { type: String, default: '' },
  activo: { type: Boolean, default: true },
  stripePriceId: { type: String },
  stripeProductId: { type: String },
  dlocalOrderId: { type: String },
  dlocalPaymentId: { type: String },
  merchantCheckoutToken: { type: String },
  mercadoPagoPreferenceId: { type: String },
  mercadoPagoExternalReference: { type: String },
  originBase: { type: String },
}, { _id: false });

const PriceSchema = new mongoose.Schema({
  interval: { type: String, enum: ['mensual', 'anual', 'trimestral'], required: true },
  price: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  stripePriceId: { type: String, required: true },
  opcionesPago: [mentorshipPlanPagoSchema],
}, { _id: false });

const mentorshipPlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  features: [{ type: String }],
  level: { type: String, enum: ['explorer', 'practitioner', 'student'], required: true },
  prices: [PriceSchema],
  active: { type: Boolean, default: true },
  /** Métodos de pago habilitados: stripe | dlocalgo | mercadopago */
  proveedoresHabilitados: {
    type: [{ type: String, enum: ['stripe', 'dlocalgo', 'mercadopago'] }],
    default: undefined,
  },
  // Campos legacy para compatibilidad/migración
  price: { type: Number },
  currency: { type: String },
  interval: { type: String },
  stripePriceId: { type: String },
  dlocalPriceId: { type: String },
}, { timestamps: true });

module.exports = mongoose.models.MentorshipPlan || mongoose.model('MentorshipPlan', mentorshipPlanSchema); 