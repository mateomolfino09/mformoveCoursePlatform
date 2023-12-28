import mongoose from 'mongoose';
import validator from 'validator';

const individualClassUserSawClass = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    individualClasses: {
        type: mongoose.Types.ObjectId,
        ref: 'IndividualClass'
    },
    time: {
        type: Number,       
    },
    finished: {
        type: Boolean,
        default: () => false
    }
  },
  { timestamps: true }
);

let Dataset = mongoose.models.ClassFilters || mongoose.model('ClassFilters', individualClassUserSawClass);
export default Dataset;
