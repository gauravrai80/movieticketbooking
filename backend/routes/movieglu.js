import express from 'express';
import axios from 'axios';

const router = express.Router();

function mgHeaders() {
  return {
    client: process.env.MOVIEGLU_CLIENT || process.env.MOVIEGLU_SANDBOX_CLIENT,
    'x-api-key': process.env.MOVIEGLU_API_KEY || process.env.MOVIEGLU_SANDBOX_API_KEY,
    authorization: process.env.MOVIEGLU_AUTHORIZATION || process.env.MOVIEGLU_AUTH || process.env.MOVIEGLU_SANDBOX_AUTH,
    territory: process.env.MOVIEGLU_TERRITORY || process.env.MOVIEGLU_SANDBOX_TERRITORY,
    'api-version': 'v200',
    geolocation: process.env.MOVIEGLU_GEOLOCATION || process.env.MOVIEGLU_SANDBOX_GEOLOCATION || '-22.0;14.0',
    'device-datetime': new Date().toISOString()
  };
}

router.get('/cinemas-nearby', async (req, res) => {
  try {
    const { n } = req.query;
    const base = process.env.MOVIEGLU_ENDPOINT || 'https://api-gate2.movieglu.com';
    const url = `${base}/cinemasNearby/`;
    const { data } = await axios.get(url, { headers: mgHeaders(), params: { n: n || 10 } });
    res.json(data);
  } catch (error) {
    res.status(502).json({ message: 'MovieGlu cinemasNearby failed', error: error.message });
  }
});

router.get('/cinema-showtimes', async (req, res) => {
  try {
    const { cinema_id, date, film_id, sort } = req.query;
    if (!cinema_id || !date) {
      return res.status(400).json({ message: 'cinema_id and date are required' });
    }
    const base = process.env.MOVIEGLU_ENDPOINT || 'https://api-gate2.movieglu.com';
    const url = `${base}/cinemaShowTimes/`;
    const params = { cinema_id, date };
    if (film_id) params.film_id = film_id;
    if (sort) params.sort = sort;
    const { data } = await axios.get(url, { headers: mgHeaders(), params });
    res.json(data);
  } catch (error) {
    res.status(502).json({ message: 'MovieGlu cinemaShowTimes failed', error: error.message });
  }
});

router.get('/film-showtimes', async (req, res) => {
  try {
    const { film_id, date } = req.query;
    if (!film_id || !date) {
      return res.status(400).json({ message: 'film_id and date are required' });
    }
    const base = process.env.MOVIEGLU_ENDPOINT || 'https://api-gate2.movieglu.com';
    const url = `${base}/filmShowTimes/`;
    const params = { film_id, date };
    const { data } = await axios.get(url, { headers: mgHeaders(), params });
    res.json(data);
  } catch (error) {
    res.status(502).json({ message: 'MovieGlu filmShowTimes failed', error: error.message });
  }
});

export default router;
