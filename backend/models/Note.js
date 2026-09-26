import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },
    journeyId: {
      type: String,
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Please provide a note title'],
      trim: true
    },
    content: {
      type: String,
      default: ''
    },
    date: {
      type: String,
      default: () => new Date().toISOString().split('T')[0]
    },
    category: {
      type: String,
      default: 'General'
    }
  },
  {
    timestamps: true
  }
);

noteSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    return ret;
  }
});

export const Note = mongoose.model('Note', noteSchema);
