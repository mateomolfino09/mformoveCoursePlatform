import mongoose from 'mongoose';
import validator from 'validator';

const fileSchema = new mongoose.Schema(
  {
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
  }
)

const linkSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true    
    },
    link_url: {
      type: String,
      required: true
    },
  }
)

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
    createdAt: {
      type: Date,
      immutable: true,
      default: () => Date.now()
    },
    class_code: {
      type: String,
      required: true
    },
    image_url: {
      type: String,
      required: true
    },
    likes: {
      type: Number,
      default: () => 12
    },
    totalTime: {
      type: Number,
      default: () => 0
    },
    course: {
      type: mongoose.Types.ObjectId,
      ref: 'Course'
    },
    atachedFiles: [
      fileSchema
    ],
    links: [
      linkSchema
    ]
  },
  { timestamps: true }
);

let Dataset = mongoose.models.Class || mongoose.model('Class', classSchema);
export default Dataset;
