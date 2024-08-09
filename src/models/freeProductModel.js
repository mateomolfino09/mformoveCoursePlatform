import mongoose from 'mongoose';

const freeProductSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true,
      minLength: 20
    },
    createdAt: {
      type: Date,
      immutable: true,
      default: () => Date.now()
    },
    image_url: {
      type: String,
      default: () => ""
    },
    vimeoId: {
      type: Number,
      default: () => 10
    },
  },
  { timestamps: true }
);

let Dataset = mongoose.models.FreeProduct || mongoose.model('FreeProduct', freeProductSchema);
export default Dataset;