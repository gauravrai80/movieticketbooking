import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a movie title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a description']
  },
  genre: {
    type: [String],
    required: true
  },
  duration: {
    type: Number,
    required: [true, 'Please provide duration in minutes']
  },
  releaseDate: {
    type: Date,
    required: [true, 'Please provide a release date']
  },
  posterUrl: {
    type: String
  },
  backdropUrl: {
    type: String
  },
  tmdbId: {
    type: Number
  },
  rating: {
    type: Number,
    min: 0,
    max: 10
  },
  language: {
    type: [String],
    required: true
  },
  format: {
    type: [String],
    enum: ['2D', '3D', 'IMAX'],
    required: true
  },
  releaseStatus: {
    type: String,
    enum: ['upcoming', 'now-showing', 'archived'],
    default: 'upcoming'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Movie', movieSchema);
