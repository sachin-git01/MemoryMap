import mongoose from 'mongoose';

const checkpointSchema = new mongoose.Schema(
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
      required: [true, 'Please provide a checkpoint title'],
      trim: true
    },
    date: {
      type: String,
      default: () => new Date().toISOString().split('T')[0]
    },
    description: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: 'heart'
    },
    location: {
      type: String,
      default: ''
    },
    photos: {
      type: [String],
      default: []
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

checkpointSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    return ret;
  }
});

export const Checkpoint = mongoose.model('Checkpoint', checkpointSchema);
