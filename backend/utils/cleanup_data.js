import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Showtime from '../models/Showtime.js';
import Movie from '../models/Movie.js'; // Ensure models are registered
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

const runCleanup = async () => {
    await connectDB();

    console.log('--- Starting Data Cleanup ---');

    const showtimes = await Showtime.find({});
    console.log(`Scanning ${showtimes.length} showtimes...`);

    let deletedCount = 0;

    for (const st of showtimes) {
        // Manually check existence to avoid populate overhead if not needed, 
        // but populate is safer to know for sure if the reference is valid in mongoose terms.
        // Actually, let's use populate to be 100% sure as per debug script.

        const populatedST = await Showtime.findById(st._id)
            .populate('theater')
            .populate('movie');

        let shouldDelete = false;
        let reason = '';

        if (!populatedST.movie) {
            shouldDelete = true;
            reason = 'Missing Movie';
        } else if (!populatedST.theater) {
            shouldDelete = true;
            reason = 'Missing Theater';
        }

        if (shouldDelete) {
            console.log(`Deleting Showtime ${st._id} - Reason: ${reason}`);
            await Showtime.findByIdAndDelete(st._id);
            deletedCount++;
        }
    }

    console.log(`\nCleanup Complete. Deleted ${deletedCount} invalid showtimes.`);
    mongoose.connection.close();
};

runCleanup();
