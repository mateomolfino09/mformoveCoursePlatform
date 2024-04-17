import mongoose from 'mongoose';
import validator from 'validator';


const valuesSchema = new mongoose.Schema({
  id: {
    type: Number,
  },
  value: {
    type: String,
  },
  label: {
    type: String,
  },
    description: {
      type: String,
    },
});


const productFiltersSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      immutable: true,
      default: () => Date.now()
    },
    description: {
      type: String,
    },
    type: {
      type: String,
      default: () => 'multiple'
     },
    question: {
      type: String,
    },
    values: [valuesSchema ]
  },
  { timestamps: true }
);

let Dataset = mongoose.models.ProductFilters || mongoose.model('ProductFilters', productFiltersSchema);
export default Dataset;
