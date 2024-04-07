import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true
  },
  document_url: {
    type: String,
    required: true
  },
  public_id: {
    type: String,
    required: true
  },
  name: {
    type: String
  },
  format: {
    type: String
  }
});

const classSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    class_code: {
      type: String,
      required: true
    },
    image_url: {
      type: String,
      required: true
    },
    totalTime: {
      type: Number,
      default: () => 0
    },
    module: {
      type: Number,
      required: true
    },
    atachedFiles: [fileSchema],
    link: { type: String, default: () => null }
  },
  { timestamps: true }
);

const workShopSchema = new mongoose.Schema(
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
    paymentLink: {
      type: String,
      default: () => "",
     // required: true
    },
    createdAt: {
      type: Date,
      immutable: true,
      default: () => Date.now()
    },
    classesQuantity: {
      type: Number,
      default: () => "",
      required: true
    },
    image_url: {
      type: String,
      default: () => "",
     // required: true
    },
    diploma_url: {
      type: String,
      default: () => ""
    },
    likes: {
      type: Number,
      default: () => 12
    },
    price: {
      type: Number,
      default: () => 10
    },

    vimeoShowCaseId: {
      type: Number,
      default: () => 10
    },

    currency: {
      type: String,
      default: () => '$'
    },
    classes:[classSchema],
    users: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'User'
      }
    ],
    created_by: {
      type: mongoose.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

let Dataset = mongoose.models.WorkShop || mongoose.model('WorkShop', workShopSchema);
export default Dataset;