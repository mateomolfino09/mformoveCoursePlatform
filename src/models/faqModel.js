import mongoose from 'mongoose';
const faqSchema = new mongoose.Schema(
  {
    question: {  // <-- Asegúrate de que esté escrito como 'question'
      type: String,
      required: true
    },
    answer: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

let Dataset = mongoose.models.Faq || mongoose.model('Faq', faqSchema);
export default Dataset;
