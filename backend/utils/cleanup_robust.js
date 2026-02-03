import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Showtime from '../models/Showtime.js';
import Movie from '../models/Movie.js';
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

const runRobustCleanup = async () => {
    await connectDB();
    console.log('--- Starting Robust Data Cleanup ---');

    try {
        // Fetch all showtimes first
        const count = await Showtime.countDocuments({});
        console.log(`Total Showtimes in DB: ${count}`);

        // Process in chunks to avoid memory issues or timeouts
        const pageSize = 100;
        let processed = 0;
        let deleted = 0;

        // We can't use cursor with delete easily if we modify the collection while iterating in some drivers,
        // but finding ID list first is safer.
        const allShowtimes = await Showtime.find({}, '_id movie theater').lean();

        console.log(`Loaded ${allShowtimes.length} showtime IDs for analysis.`);

        // Cache existing Movie and Theater IDs to avoid N+1 queries
        // Use Sets for O(1) lookup
        const theaterIds = new Set((await Theater.find({}, '_id').lean()).map(t => t._id.toString()));
        const movieIds = new Set((await Movie.find({}, '_id').lean()).map(m => m._id.toString()));

        console.log(`Reference Check: Active Theaters: ${theaterIds.size}, Active Movies: ${movieIds.size}`);

        const idsToDelete = [];

        for (const st of allShowtimes) {
            const tId = st.theater ? st.theater.toString() : null;
            const mId = st.movie ? st.movie.toString() : null;

            if (!tId || !theaterIds.has(tId)) {
                // Invalid Theater
                idsToDelete.push(st._id);
                continue;
            }

            if (!mId || !movieIds.has(mId)) {
                // Invalid Movie
                idsToDelete.push(st._id);
                continue;
            }
        }

        console.log(`Identified ${idsToDelete.length} invalid showtimes to delete.`);

        if (idsToDelete.length > 0) {
            const result = await Showtime.deleteMany({ _id: { $in: idsToDelete } });
            console.log(`Delete Result: Deleted ${result.deletedCount} documents.`);
            deleted = result.deletedCount;
        }

    } catch (err) {
        console.error('Cleanup failed with error:', err);
    } finally {
        console.log('Cleanup finished.');
        mongoose.connection.close();
    }
};

runRobustCleanup();
