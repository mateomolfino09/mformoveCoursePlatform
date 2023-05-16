import mongoose from 'mongoose';
import validator from 'validator';

const answerSchema = new mongoose.Schema({
  answerAdmin: {
    type: mongoose.Types.ObjectId,
    ref: 'User'
  },
  answeredAt: {
    type: Date,
    immutable: true
  },
  answer: {
    type: String
  }
});

const questionSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true
    },
    question: {
      type: String
    },
    answers: [answerSchema],
    hasAnswer: {
      type: Boolean,
      default: () => false
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User'
    },
    class: {
      type: mongoose.Types.ObjectId,
      ref: 'Class'
    }
  },
  { timestamps: true }
);

let Dataset =
  mongoose.models.Question || mongoose.model('Question', questionSchema);
export default Dataset;
