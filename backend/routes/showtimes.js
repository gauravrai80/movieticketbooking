import express from 'express';
import Showtime from '../models/Showtime.js';
import Screen from '../models/Screen.js';
import Movie from '../models/Movie.js';
import Theater from '../models/Theater.js';
import mongoose from 'mongoose';
import axios from 'axios';
import { adminAuth, auth } from '../middleware/auth.js';

const router = express.Router();

// Helper to generate showtimes for a movie
const generateShowtimesForMovie = async (movie, theater) => {
  const showtimes = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find screens
  const screens = await Screen.find({ theater: theater._id });
  if (screens.length === 0) return []; // No screens, can't generate

  // Generate for next 7 days
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() + i);
    const timeSlots = [10, 13, 16, 19, 22]; // Standard slots

    for (const hour of timeSlots) {
      // Pick random screen
      const screen = screens[Math.floor(Math.random() * screens.length)];

      const startTime = new Date(currentDate);
      startTime.setHours(hour, 0, 0, 0);

      const endTime = new Date(startTime);
      endTime.setMinutes(startTime.getMinutes() + (movie.duration || 120));

      // Basic seat map (simulated)
      const totalSeats = screen.totalSeats || 100;
      const availableSeats = [];
      const rows = 10;
      const cols = 10;
      for (let r = 0; r < rows; r++) {
        for (let c = 1; c <= cols; c++) {
          availableSeats.push(`${String.fromCharCode(65 + r)}${c}`);
        }
      }

      showtimes.push({
        movie: movie._id,
        theater: theater._id,
        screen: screen._id,
        startTime,
        endTime,
        price: 200 + (Math.random() > 0.5 ? 50 : 0), // Random pricing
        totalSeats: totalSeats,
        availableSeats: availableSeats, // Populate full seats
        bookedSeats: [],
        status: 'available'
      });
    }
  }

  return await Showtime.insertMany(showtimes);
};

// Get all showtimes with filters
router.get('/', async (req, res) => {
  try {
    const { movieId, tmdbId, theaterId, startDate, endDate } = req.query;
    const filter = {};

    if (movieId) filter.movie = movieId;
    if (theaterId) filter.theater = theaterId;

    // Support fetching by TMDB ID
    if (tmdbId) {
      // Find the local movie document first
      let movies = await Movie.find({ tmdbId: tmdbId });

      if (movies.length === 0) {
        // AUTO-GENERATION LOGIC
        try {
          console.log(`Movie with TMDB ID ${tmdbId} not found locally. Auto-generating...`);

          // 1. Fetch from TMDB
          const tmdbRes = await axios.get(`https://api.themoviedb.org/3/movie/${tmdbId}`, {
            params: { api_key: process.env.TMDB_API_KEY }
          });
          const tmdbData = tmdbRes.data;

          // 2. Create Local Movie
          const newMovie = await Movie.create({
            title: tmdbData.title,
            description: tmdbData.overview || 'No description available.',
            genre: tmdbData.genres?.map(g => g.name) || ['Unknown'],
            duration: tmdbData.runtime || 120,
            releaseDate: tmdbData.release_date || new Date(),
            posterUrl: tmdbData.poster_path,
            backdropUrl: tmdbData.backdrop_path,
            tmdbId: tmdbData.id,
            rating: tmdbData.vote_average || 0,
            language: tmdbData.spoken_languages?.map(l => l.name) || ['English'],
            format: ['2D'], // Default
            releaseStatus: 'now-showing'
          });

          movies = [newMovie]; // Use this for filter

          // 3. Find Default Theater
          const theater = await Theater.findOne({});
          if (theater) {
            // 4. Generate Showtimes
            console.log(`Generating showtimes for ${newMovie.title} at ${theater.name}`);
            await generateShowtimesForMovie(newMovie, theater);
          } else {
            console.warn("No theaters found! Cannot generate showtimes.");
          }

        } catch (tmdbErr) {
          console.error("Failed to auto-generate movie:", tmdbErr.message);
          // Fallback: return empty list, handled by frontend
          return res.json([]);
        }
      }

      if (movies.length > 0) {
        filter.movie = { $in: movies.map(m => m._id) };
      }
    }

    if (startDate || endDate) {
      filter.startTime = {};
      if (startDate) filter.startTime.$gte = new Date(startDate);
      if (endDate) filter.startTime.$lte = new Date(endDate);
    }

    const showtimes = await Showtime.find(filter)
      .populate('movie')
      .populate('theater')
      .populate('screen')
      .sort({ startTime: 1 });

    res.json(showtimes);
  } catch (error) {
    console.error("Showtime Fetch Error:", error);
    res.status(500).json({ message: 'Failed to fetch showtimes', error: error.message });
  }
});

// Get single showtime
router.get('/:id', async (req, res) => {
  try {
    const showtime = await Showtime.findById(req.params.id)
      .populate('movie')
      .populate('theater')
      .populate('screen');

    if (!showtime) {
      return res.status(404).json({ message: 'Showtime not found' });
    }

    res.json(showtime);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch showtime', error: error.message });
  }
});

// Create showtime (admin only)
router.post('/', adminAuth, async (req, res) => {
  try {
    const { movie, screen, theater, startTime, endTime, price } = req.body;

    if (!movie || !screen || !theater || !startTime || !endTime || !price) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const screenData = await Screen.findById(screen);
    if (!screenData) {
      return res.status(404).json({ message: 'Screen not found' });
    }

    const totalSeats = screenData.totalSeats;
    const availableSeats = Array.from({ length: totalSeats }, (_, i) => `seat_${i + 1}`);

    const showtime = new Showtime({
      movie,
      screen,
      theater,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      price,
      availableSeats,
      totalSeats
    });

    await showtime.save();
    await showtime.populate(['movie', 'theater', 'screen']);

    res.status(201).json(showtime);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create showtime', error: error.message });
  }
});

// Get available seats for a showtime
router.get('/:id/seats', async (req, res) => {
  try {
    const showtime = await Showtime.findById(req.params.id);
    if (!showtime) {
      return res.status(404).json({ message: 'Showtime not found' });
    }

    res.json({
      availableSeats: showtime.availableSeats,
      bookedSeats: showtime.bookedSeats,
      totalSeats: showtime.totalSeats
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch seats', error: error.message });
  }
});

// Update showtime (admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const showtime = await Showtime.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate(['movie', 'theater', 'screen']);

    if (!showtime) {
      return res.status(404).json({ message: 'Showtime not found' });
    }

    res.json(showtime);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update showtime', error: error.message });
  }
});

// Delete showtime (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const showtime = await Showtime.findByIdAndDelete(req.params.id);
    if (!showtime) {
      return res.status(404).json({ message: 'Showtime not found' });
    }

    res.json({ message: 'Showtime deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete showtime', error: error.message });
  }
});

export default router;
