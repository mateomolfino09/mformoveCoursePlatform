const mongoose = require('mongoose');

const PriceSchema = new mongoose.Schema({
  interval: { type: String, enum: ['trimestral', 'anual'], required: true },
  price: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  stripePriceId: { type: String, required: true }
}, { _id: false });

const mentorshipPlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  features: [{ type: String }],
  level: { type: String, enum: ['explorer', 'practitioner', 'student'], required: true },
  prices: [PriceSchema],
  active: { type: Boolean, default: true },
  // Campos legacy para compatibilidad/migración
  price: { type: Number },
  currency: { type: String },
  interval: { type: String },
  stripePriceId: { type: String },
  dlocalPriceId: { type: String },
}, { timestamps: true });

module.exports = mongoose.models.MentorshipPlan || mongoose.model('MentorshipPlan', mentorshipPlanSchema); 