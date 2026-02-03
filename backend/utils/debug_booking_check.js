import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Movie from '../models/Movie.js';
import Showtime from '../models/Showtime.js';
import Theater from '../models/Theater.js';

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

const runDebug = async () => {
    await connectDB();

    const tmdbId = 840464; // From screenshot

    console.log(`\n--- Debugging Movie with TMDB ID: ${tmdbId} ---`);

    const movie = await Movie.findOne({ tmdbId: tmdbId });
    if (!movie) {
        console.log('Movie not found in database!');
        process.exit(0);
    }
    console.log(`Found Movie: ${movie.title} (ID: ${movie._id})`);

    const showtimes = await Showtime.find({ movie: movie._id });
    console.log(`Found ${showtimes.length} showtimes for this movie.`);

    for (const st of showtimes) {
        console.log(`\nChecking Showtime ID: ${st._id}`);
        console.log(`  Target Theater ID: ${st.theater}`);

        // Populate fields manually to check
        const populatedST = await Showtime.findById(st._id).populate('theater').populate('movie');

        if (!populatedST.movie) {
            console.error(`  ERROR: Movie reference failed validation (populatedST.movie is null).`);
        } else {
            console.log(`  Movie populated OK: ${populatedST.movie.title}`);
        }

        if (!populatedST.theater) {
            console.error(`  ERROR: Theater reference failed validation (populatedST.theater is null).`);
            // Check if theater exists separately
            const theaterExists = await Theater.findById(st.theater);
            console.log(`  Does Theater ${st.theater} exist in DB? ${!!theaterExists}`);
        } else {
            console.log(`  Theater populated OK: ${populatedST.theater.name}`);
        }
    }

    mongoose.connection.close();
};

runDebug();
