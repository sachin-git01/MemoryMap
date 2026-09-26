import mongoose from 'mongoose';

const journeySchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },
    journeyName: {
      type: String,
      required: [true, 'Please add a journey name'],
      trim: true
    },
    mapName: {
      type: String,
      default: 'MyMap'
    },
    journeyType: {
      type: String,
      enum: ['love', 'friendship', 'family', 'personal', 'custom'],
      default: 'custom'
    },
    theme: {
      type: String,
      default: 'custom'
    },
    startDate: {
      type: String,
      default: () => new Date().toISOString().split('T')[0]
    },
    privacy: {
      type: String,
      enum: ['private', 'public', 'unlisted'],
      default: 'private'
    },
    customPreset: {
      type: String
    },
    customFont: {
      type: String
    },
    customFontFamily: {
      type: String
    },
    customColors: {
      type: Map,
      of: String
    }
  },
  {
    timestamps: true
  }
);

// Format output id to string
journeySchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    return ret;
  }
});

export const Journey = mongoose.model('Journey', journeySchema);
