import mongoose from 'mongoose';

const faqSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true
    },
    qestion: {
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
