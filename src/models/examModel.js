import mongoose from 'mongoose';
import validator from 'validator';

const amswerSchema = mongoose.Schema({
    id: {
        type: Number,
        required: true
    },
    answer: {
        type: String,
        required: true
    },
})

const questionSchema = mongoose.Schema({
    id: {
        type: Number,
        required: true
    },
    question: {
        type: String,
        required: true
    },
    answers: [amswerSchema],
    correctAnswerIndex: {
        type: Number,
        required: true
    }
})

const examSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true
    },
    quantityOfQuestions: {
      type: Number,
      required: true
    },
    approvalMin: {
        type: Number,
        required: true
    },
    courseId: {
      type: mongoose.Types.ObjectId,
      ref: 'Course'
    },
    questions: [questionSchema],
  },
  { timestamps: true }
);

let Dataset =
  mongoose.models.Exam || mongoose.model('Exam', examSchema);
export default Dataset;
