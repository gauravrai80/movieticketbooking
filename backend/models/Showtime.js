import mongoose from 'mongoose';

const showtimeSchema = new mongoose.Schema({
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true
  },
  screen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Screen',
    required: true
  },
  theater: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Theater',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  price: {
    type: Number,
    required: [true, 'Please provide ticket price']
  },
  availableSeats: {
    type: [String],
    default: []
  },
  bookedSeats: {
    type: [String],
    default: []
  },
  totalSeats: {
    type: Number,
    required: true
  },
  seatsPerRow: {
    type: Number,
    default: 10
  },
  premiumSeats: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    enum: ['available', 'full', 'archived'],
    default: 'available'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Showtime', showtimeSchema);
