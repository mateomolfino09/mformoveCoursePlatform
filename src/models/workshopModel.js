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
      required: true
    },
    createdAt: {
      type: Date,
      immutable: true,
      default: () => Date.now()
    },
    classesQuantity: {
      type: Number,
      required: true
    },
    image_url: {
      type: String,
      required: true
    },
    diploma_url: {
      type: String
    },
    likes: {
      type: Number,
      default: () => 12
    },
    price: {
      type: Number,
      default: () => 10
    },
    currency: {
      type: String,
      default: () => '$'
    },
    users: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'User'
      }
    ],
    classes: [classesSchema],
    created_by: {
      type: mongoose.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);
