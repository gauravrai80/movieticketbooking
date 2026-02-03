import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Showtime from '../models/Showtime.js';
import Movie from '../models/Movie.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('MongoDB Connection Error:', err);
        process.exit(1);
    }
};

const checkRemainingShowtimes = async () => {
    try {
        await connectDB();

        const tmdbId = 840464;
        console.log(`Checking remaining showtimes for TMDB ID: ${tmdbId}`);

        const movie = await Movie.findOne({ tmdbId: tmdbId });
        if (!movie) {
            console.log('Movie not found in DB.');
            process.exit(0);
        }

        console.log(`Movie found: ${movie.title} (${movie._id})`);

        // Check count first
        const count = await Showtime.countDocuments({ movie: movie._id });
        console.log(`Raw count of showtimes: ${count}`);

        if (count === 0) {
            console.log('No showtimes found.');
            process.exit(0);
        }

        // Try find with populate
        const showtimes = await Showtime.find({ movie: movie._id })
            .populate('theater')
            .populate('movie');

        console.log(`Successfully populated ${showtimes.length} showtimes.`);

        if (showtimes.length > 0) {
            console.log('Sample valid showtime:', showtimes[0]._id);
            console.log('Theater:', showtimes[0].theater?.name);
            console.log('Start Time:', showtimes[0].startTime);
        }

    } catch (err) {
        console.error('Check Failed:', err);
    } finally {
        mongoose.connection.close();
    }
};

checkRemainingShowtimes();
