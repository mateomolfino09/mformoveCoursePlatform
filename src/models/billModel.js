import mongoose from 'mongoose';
import validator from 'validator';

const billSchema = new mongoose.Schema(
  {
    payment_id: {
      type: Number,
      required: true
    },
    merchant_order_id: {
      type: String,
      required: true
    },
    preference_id: {
      type: String,
      required: true
    },
    collection_id: {
      type: String,
      required: true
    },
    payment_type: {
      type: String,
      required: true
    },
    processing_mode: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      immutable: true,
      default: () => Date.now()
    },
    status: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      default: () => 10
    },
    currency: {
      type: String,
      default: () => '$'
    },
    course: {
      type: mongoose.Types.ObjectId,
      ref: 'Course'
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

let Dataset = mongoose.models.Bill || mongoose.model('Bill', billSchema);
export default Dataset;
