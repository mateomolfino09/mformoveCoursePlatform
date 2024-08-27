import mongoose from 'mongoose';
import validator from 'validator';


const newsletterUserSchema = new mongoose.Schema(
  {
    name: {
      type: String
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      minLength: 10
    },
  },
  { timestamps: true }
);

let Dataset = mongoose.models.NewsletterUser || mongoose.model('NewsletterUser', newsletterUserSchema);
export default Dataset;
