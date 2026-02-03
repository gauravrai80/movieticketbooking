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

const runTargetedCleanup = async () => {
    await connectDB();

    const tmdbId = 840464;
    console.log(`--- Targeted Cleanup for Movie TMDB ID: ${tmdbId} ---`);

    const movie = await Movie.findOne({ tmdbId: tmdbId });
    if (!movie) {
        console.log('Movie not found.');
        process.exit(0);
    }

    const showtimes = await Showtime.find({ movie: movie._id }).populate('theater');
    console.log(`Found ${showtimes.length} showtimes for this movie.`);

    let deleted = 0;
    for (const st of showtimes) {
        if (!st.theater) {
            console.log(`Deleting invalid showtime ${st._id} (Missing Theater)`);
            await Showtime.findByIdAndDelete(st._id);
            deleted++;
        }
    }

    console.log(`Deleted ${deleted} invalid showtimes.`);
    mongoose.connection.close();
};

runTargetedCleanup();
