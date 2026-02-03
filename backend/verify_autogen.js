import axios from 'axios';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Movie from './models/Movie.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const TEST_TMDB_ID = 550; // Fight Club

const verify = async () => {
    try {
        // 1. Clean up first
        await mongoose.connect(process.env.MONGODB_URI);
        await Movie.deleteOne({ tmdbId: TEST_TMDB_ID });
        console.log('Cleaned up existing movie (if any).');
        await mongoose.disconnect();

        // 2. Call API
        console.log('Requesting showtimes for new movie...');
        const res = await axios.get(`http://localhost:5000/api/showtimes?tmdbId=${TEST_TMDB_ID}`);

        console.log(`Response Status: ${res.status}`);
        console.log(`Showtimes Found: ${res.data.length}`);

        if (res.data.length > 0) {
            console.log('SUCCESS: Showtimes generated!');
            console.log('Sample:', res.data[0]);
        } else {
            console.error('FAILURE: No showtimes returned.');
        }

    } catch (err) {
        console.error('Verification Failed:', err.message);
        if (err.response) {
            console.error('API Error Data:', err.response.data);
        }
    }
};

verify();
