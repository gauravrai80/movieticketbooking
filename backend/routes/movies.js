import express from 'express';
import Movie from '../models/Movie.js';
import { adminAuth } from '../middleware/auth.js';

const router = express.Router();

import axios from 'axios';

// Get all movies with filters
router.get('/', async (req, res) => {
  try {
    const { status, genre, language } = req.query;
    const filter = {};

    if (status) filter.releaseStatus = status;
    if (genre) filter.genre = { $in: [genre] };
    if (language) filter.language = { $in: [language] };

    let movies = await Movie.find(filter).sort({ releaseDate: -1 });

    // Auto-seed from TMDB if no movies found and we are looking for 'now-showing' or just general list
    if (movies.length === 0 && (!status || status === 'now-showing')) {
      console.log('No movies found in DB. Fetching from TMDB...');
      const tmdbUrl = `${process.env.TMDB_BASE_URL}/movie/now_playing`;
      const tmdbResponse = await axios.get(tmdbUrl, {
        params: {
          api_key: process.env.TMDB_API_KEY,
          language: 'en-US',
          page: 1
        }
      });

      const tmdbMovies = tmdbResponse.data.results;

      // Map TMDB movies to our schema
      const newMovies = tmdbMovies.map(tmdbMovie => ({
        title: tmdbMovie.title,
        description: tmdbMovie.overview || 'No description available',
        genre: ['Action'], // TMDB returns genre_ids, defaulting to Action for now
        duration: 120, // Default duration
        releaseDate: new Date(tmdbMovie.release_date),
        posterUrl: `https://image.tmdb.org/t/p/w500${tmdbMovie.poster_path}`,
        backdropUrl: `https://image.tmdb.org/t/p/original${tmdbMovie.backdrop_path}`,
        rating: tmdbMovie.vote_average,
        language: [tmdbMovie.original_language || 'en'], // Wrap in array
        format: ['2D'], // Wrap in array
        releaseStatus: 'now-showing',
        tmdbId: tmdbMovie.id
      }));

      // Insert valid movies
      if (newMovies.length > 0) {
        await Movie.insertMany(newMovies);
        movies = await Movie.find(filter).sort({ releaseDate: -1 });
        console.log(`Seeded ${movies.length} movies from TMDB`);
      }
    }

    res.json(movies);
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({ message: 'Failed to fetch movies', error: error.message });
  }
});

// Get single movie
router.get('/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    res.json(movie);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch movie', error: error.message });
  }
});

// Create movie (admin only)
router.post('/', adminAuth, async (req, res) => {
  try {
    const { title, description, genre, duration, releaseDate, posterUrl, rating, language, format } = req.body;

    if (!title || !description || !genre || !duration || !releaseDate || !language || !format) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    const movie = new Movie({
      title,
      description,
      genre,
      duration,
      releaseDate,
      posterUrl,
      rating,
      language,
      format
    });

    await movie.save();
    res.status(201).json(movie);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create movie', error: error.message });
  }
});

// Update movie (admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    res.json(movie);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update movie', error: error.message });
  }
});

// Delete movie (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    res.json({ message: 'Movie deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete movie', error: error.message });
  }
});

export default router;
