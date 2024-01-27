import mongoose from 'mongoose';
import validator from 'validator';

const planSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true
    },
    merchant_id: {
      type: Number,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    country: {
      type: String,
    },
    currency: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    frequency_type: {
      type: String,
      required: true
    },
    frequency_label: {
      type: String,
      required: true
    },
    frequency_value: {
      type: Number,
      required: true
    },
    active: {
      type: Boolean,
      required: true
    },
    free_trial_days: {
      type: Number,
      required: true
    },
    plan_token: {
      type: String,
      required: true
    },
    back_url: {
      type: String,
      required: true
    },
    success_url: {
      type: String,
      required: true
    },
    error_url: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      immutable: true,
      default: () => Date.now()
    }
  },
  { timestamps: true }
);

let Dataset = mongoose.models.Plan || mongoose.model('Plan', planSchema);
export default Dataset;
