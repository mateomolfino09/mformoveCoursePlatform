import mongoose from 'mongoose';
const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true
    },
    answer: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ['membresia', 'mentoria', 'pagos', 'tecnico', 'general'],
      default: 'general'
    },
    order: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

// Forzar recreación del modelo para asegurar que los nuevos campos se apliquen
if (mongoose.models.Faq) {
  delete mongoose.models.Faq;
}

let Dataset = mongoose.model('Faq', faqSchema);
export default Dataset;
