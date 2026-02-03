import mongoose from 'mongoose';

const theaterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide theater name']
  },
  city: {
    type: String,
    required: [true, 'Please provide city']
  },
  address: {
    type: String,
    required: [true, 'Please provide address']
  },
  screens: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Screen'
  },
  phoneNumber: {
    type: String
  },
  facilities: {
    type: [String],
    enum: ['parking', 'food-court', 'wheelchair-accessible', 'premium-seats']
  },
  movieGluCinemaId: {
    type: String,
    index: true
  },
  syncEnabled: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Theater', theaterSchema);
