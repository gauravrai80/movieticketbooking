import mongoose from 'mongoose';

const screenSchema = new mongoose.Schema({
  theater: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Theater',
    required: true
  },
  screenNumber: {
    type: Number,
    required: true
  },
  format: {
    type: String,
    enum: ['2D', '3D', 'IMAX'],
    required: true
  },
  seating: {
    rows: {
      type: Number,
      required: true
    },
    columns: {
      type: Number,
      required: true
    },
    layout: {
      type: [[String]],
      default: []
    }
  },
  premiumSeats: {
    type: [String],
    default: []
  },
  totalSeats: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Screen', screenSchema);
