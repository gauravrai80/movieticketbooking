import express from 'express';
import axios from 'axios';
import https from 'https';

const router = express.Router();

// Create a robust axios instance
const tmdbClient = axios.create({
  baseURL: process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3',
  timeout: 30000,
  params: {
    api_key: process.env.TMDB_API_KEY,
    language: 'en-US'
  }
});

// Debug log for API Key (masked)
console.log('TMDB Client Initialized. Key:', process.env.TMDB_API_KEY ? 'Present' : 'Missing');

router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ message: 'query is required' });

    const { data } = await tmdbClient.get('/search/movie', {
      params: { query, include_adult: false }
    });
    res.json(data);
  } catch (error) {
    console.error('TMDB Search Error:', error.message);
    res.status(502).json({ message: 'TMDB search failed', error: error.message });
  }
});

router.get('/movie/:id', async (req, res) => {
  try {
    const { data } = await tmdbClient.get(`/movie/${req.params.id}`, {
      params: { append_to_response: 'credits,videos,recommendations,similar' }
    });
    res.json(data);
  } catch (error) {
    console.error(`TMDB Movie Error (${req.params.id}):`, error.message);
    res.status(502).json({ message: 'TMDB movie fetch failed', error: error.message });
  }
});

router.get('/trending', async (req, res) => {
  try {
    const { data } = await tmdbClient.get('/trending/movie/day');
    res.json(data);
  } catch (error) {
    console.error('TMDB Trending Error:', error.message);
    res.status(502).json({ message: 'TMDB trending fetch failed', error: error.message });
  }
});

router.get('/now_playing', async (req, res) => {
  try {
    const { data } = await tmdbClient.get('/movie/now_playing', {
      params: { page: 1 }
    });
    res.json(data);
  } catch (error) {
    console.error('TMDB Now Playing Error:', error.message);
    res.status(502).json({ message: 'TMDB now_playing fetch failed', error: error.message });
  }
});

router.get('/upcoming', async (req, res) => {
  try {
    const { data } = await tmdbClient.get('/movie/upcoming', {
      params: { page: 1 }
    });
    res.json(data);
  } catch (error) {
    console.error('TMDB Upcoming Error:', error.message);
    res.status(502).json({ message: 'TMDB upcoming fetch failed', error: error.message });
  }
});

export default router;
