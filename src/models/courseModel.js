import mongoose from 'mongoose';
import validator from 'validator';

const modulesSchema = new mongoose.Schema({
  quantity: {
    type: Number,
    required: true
  },
  breakPoints: [
    {
      type: Number
    }
  ],
  titles: [
    {
      type: String
    }
  ]
});

const courseSchema = new mongoose.Schema(
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
    playlist_code: {
      type: String,
      required: true
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
    course_type: {
      type: String,
      required: true
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
    course_type: {
      type: String,
    },
    users: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'User'
      }
    ],
    classes: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'Class'
      }
    ],
    modules: modulesSchema,
    created_by: {
      type: mongoose.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// courseSchema.pre('validate', function(next) {
//   this
// })

let Dataset = mongoose.models.Course || mongoose.model('Course', courseSchema);
export default Dataset;
