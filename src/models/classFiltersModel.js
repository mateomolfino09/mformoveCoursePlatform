import mongoose from 'mongoose';
import validator from 'validator';


const valuesSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true
  },
  value: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
    description: {
      type: String,
    },
});


const classFiltersSchema = new mongoose.Schema(
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
    values: [valuesSchema ]
  },
  { timestamps: true }
);

let Dataset = mongoose.models.ClassFilters || mongoose.model('ClassFilters', classFiltersSchema);
export default Dataset;
